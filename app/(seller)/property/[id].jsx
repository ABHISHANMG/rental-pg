/**
 * Seller property management (Requirement §22). Bed availability per room with quick
 * steppers, plus activate/deactivate and a preview link.
 */

import React, { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Screen, Header, Surface, Badge, Button, Icon, LoadingState, ErrorState } from '@/components';
import { useAsync } from '@/hooks/useAsync';
import { getSellerPropertyById, setPropertyActive, updateRoomAvailability } from '@/services/seller.service';
import { PROPERTY_STATUS, ROOM_TYPE_MAP } from '@/constants';
import { formatMoney, getTotalBeds, getAvailableBeds } from '@/utils';
import { colors, radius as R, spacing, typography } from '@/theme';

function Stepper({ icon, onPress, disabled }) {
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      style={{ width: 38, height: 38, borderRadius: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: disabled ? colors.surfaceAlt : colors.surface, alignItems: 'center', justifyContent: 'center', opacity: disabled ? 0.5 : 1 }}
    >
      <Icon name={icon} size={20} color={colors.ink} />
    </Pressable>
  );
}

function BedStat({ value, label, color = colors.ink }) {
  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <Text style={{ fontSize: typography.h1, fontWeight: typography.heavy, color }}>{value}</Text>
      <Text style={{ fontSize: typography.micro, fontWeight: typography.bold, color: colors.inkSoft }}>{label}</Text>
    </View>
  );
}

export default function PropertyManage() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useAsync(() => getSellerPropertyById(id), [id], { enabled: !!id });
  const [property, setProperty] = useState(null);

  useEffect(() => {
    if (data) setProperty(data);
  }, [data]);

  if (isLoading || (!property && !isError)) {
    return (
      <Screen>
        <Header showBack title="Manage" />
        <LoadingState message="Loading property…" />
      </Screen>
    );
  }
  if (isError || !property) {
    return (
      <Screen>
        <Header showBack title="Manage" />
        <ErrorState onRetry={refetch} />
      </Screen>
    );
  }

  const total = getTotalBeds(property);
  const available = getAvailableBeds(property);
  const occupied = total - available;
  const status = PROPERTY_STATUS[property.status] || PROPERTY_STATUS.ACTIVE;

  const adjust = (roomId, delta) => {
    setProperty((prev) => ({
      ...prev,
      rooms: prev.rooms.map((r) => {
        if (r.id !== roomId) return r;
        const next = Math.max(0, Math.min(r.totalBeds, r.availableBeds + delta));
        updateRoomAvailability(property.id, roomId, next); // fire-and-forget mock persist
        return { ...r, availableBeds: next };
      }),
    }));
  };

  const toggleActive = async () => {
    const next = !property.isActive;
    setProperty((prev) => ({ ...prev, isActive: next, status: next ? 'ACTIVE' : 'INACTIVE' }));
    await setPropertyActive(property.id, next);
  };

  return (
    <Screen>
      <Header showBack title="Manage property" right={<Badge label={status.label} tone={status.tone} />} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: spacing.xl, paddingBottom: spacing.huge, gap: spacing.xl }}>
        {/* Property head */}
        <View style={{ flexDirection: 'row', gap: spacing.md, alignItems: 'center' }}>
          <Image source={{ uri: property.images[0] }} style={{ width: 60, height: 60, borderRadius: R.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceSunken }} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: typography.h3, fontWeight: typography.heavy, color: colors.ink }} numberOfLines={1}>{property.name}</Text>
            <Text style={{ fontSize: typography.caption, fontWeight: typography.medium, color: colors.inkSoft }}>{property.address.locality}, {property.address.city}</Text>
          </View>
        </View>

        {/* Bed summary */}
        <Surface offset={4} radius={R.xl}>
          <View style={{ flexDirection: 'row', padding: spacing.lg }}>
            <BedStat value={total} label="TOTAL BEDS" />
            <View style={{ width: 1, backgroundColor: colors.surfaceSunken }} />
            <BedStat value={occupied} label="OCCUPIED" />
            <View style={{ width: 1, backgroundColor: colors.surfaceSunken }} />
            <BedStat value={available} label="AVAILABLE" color={available ? colors.mint : colors.inkFaint} />
          </View>
        </Surface>

        {/* Active toggle */}
        <Surface offset={4} radius={R.lg} background={property.isActive ? colors.mintBg : colors.surfaceAlt}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg }}>
            <Icon name={property.isActive ? 'eye-check' : 'eye-off'} size={24} color={colors.ink} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: typography.bodyLg, fontWeight: typography.heavy, color: colors.ink }}>{property.isActive ? 'Listing is live' : 'Listing is hidden'}</Text>
              <Text style={{ fontSize: typography.caption, fontWeight: typography.medium, color: colors.inkSoft }}>{property.isActive ? 'Visible to tenants in search' : 'Not shown to tenants'}</Text>
            </View>
            <Button title={property.isActive ? 'Deactivate' : 'Activate'} size="sm" variant={property.isActive ? 'surface' : 'primary'} onPress={toggleActive} />
          </View>
        </Surface>

        {/* Rooms & beds */}
        <View>
          <Text style={{ fontSize: typography.h3, fontWeight: typography.heavy, color: colors.ink, marginBottom: spacing.md }}>Rooms & beds</Text>
          {property.rooms.map((room) => {
            const meta = ROOM_TYPE_MAP[room.roomType];
            const occ = room.totalBeds - room.availableBeds;
            return (
              <Surface key={room.id} offset={3} radius={R.lg} style={{ marginBottom: spacing.md }}>
                <View style={{ padding: spacing.lg, gap: spacing.md }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View>
                      <Text style={{ fontSize: typography.bodyLg, fontWeight: typography.heavy, color: colors.ink }}>{meta?.label || room.roomType}</Text>
                      <Text style={{ fontSize: typography.caption, fontWeight: typography.bold, color: colors.inkSoft }}>{room.floor ? `Floor ${room.floor} · ` : ''}{occ}/{room.totalBeds} occupied · {formatMoney(room.monthlyRent)}/mo</Text>
                    </View>
                    <Badge label={`${room.availableBeds} free`} tone={room.availableBeds ? 'mintBg' : 'surfaceAlt'} small />
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                    <Text style={{ flex: 1, fontSize: typography.caption, fontWeight: typography.bold, color: colors.inkSoft }}>AVAILABLE BEDS</Text>
                    <Stepper icon="minus" onPress={() => adjust(room.id, -1)} disabled={room.availableBeds <= 0} />
                    <Text style={{ minWidth: 28, textAlign: 'center', fontSize: typography.h3, fontWeight: typography.heavy, color: colors.ink }}>{room.availableBeds}</Text>
                    <Stepper icon="plus" onPress={() => adjust(room.id, 1)} disabled={room.availableBeds >= room.totalBeds} />
                  </View>
                </View>
              </Surface>
            );
          })}
        </View>

        <Button title="Preview listing" variant="surface" icon="eye" onPress={() => router.push(`/pg/${property.id}`)} fullWidth />
      </ScrollView>
    </Screen>
  );
}
