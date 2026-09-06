/**
 * SellerPropertyCard — a property row on the owner side: thumbnail, status, occupancy
 * and monthly revenue, with a Manage affordance. Taps through to bed management.
 */

import React, { memo } from 'react';
import { Image, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import Surface from '@/components/common/Surface';
import Badge from '@/components/common/Badge';
import Icon from '@/components/common/Icon';
import { PROPERTY_STATUS } from '@/constants';
import { formatCompactMoney, getTotalBeds, getAvailableBeds } from '@/utils';
import { colors, radius as R, spacing, typography } from '@/theme';

function MiniStat({ value, label, color = colors.ink }) {
  return (
    <View style={{ alignItems: 'center', flex: 1 }}>
      <Text style={{ fontSize: typography.h3, fontWeight: typography.heavy, color }}>{value}</Text>
      <Text style={{ fontSize: 10, fontWeight: typography.bold, color: colors.inkSoft }}>{label.toUpperCase()}</Text>
    </View>
  );
}

function SellerPropertyCardBase({ property, revenue }) {
  const router = useRouter();
  const total = getTotalBeds(property);
  const available = getAvailableBeds(property);
  const occupied = total - available;
  const status = PROPERTY_STATUS[property.status] || PROPERTY_STATUS.ACTIVE;
  const monthly =
    revenue ??
    property.rooms.reduce((s, r) => s + (r.totalBeds - r.availableBeds) * r.monthlyRent, 0);

  return (
    <Surface onPress={() => router.push(`/(seller)/property/${property.id}`)} offset={4} radius={R.xl} style={{ marginBottom: spacing.lg }} accessibilityLabel={`Manage ${property.name}`}>
      <View style={{ padding: spacing.lg, gap: spacing.md }}>
        <View style={{ flexDirection: 'row', gap: spacing.md }}>
          <Image source={{ uri: property.images[0] }} style={{ width: 64, height: 64, borderRadius: R.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceSunken }} />
          <View style={{ flex: 1, justifyContent: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm }}>
              <Text numberOfLines={1} style={{ flex: 1, fontSize: typography.h3, fontWeight: typography.heavy, color: colors.ink }}>{property.name}</Text>
              <Badge label={status.label} tone={status.tone} small />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 3 }}>
              <Icon name="map-marker" size={13} color={colors.inkSoft} />
              <Text numberOfLines={1} style={{ fontSize: typography.caption, fontWeight: typography.medium, color: colors.inkSoft }}>
                {property.address.locality}, {property.address.city}
              </Text>
            </View>
          </View>
        </View>

        <View style={{ flexDirection: 'row', backgroundColor: colors.surfaceAlt, borderRadius: R.md, borderWidth: 1, borderColor: colors.border, paddingVertical: spacing.md }}>
          <MiniStat value={total} label="Beds" />
          <View style={{ width: 1, backgroundColor: colors.ink, opacity: 0.15 }} />
          <MiniStat value={occupied} label="Occupied" />
          <View style={{ width: 1, backgroundColor: colors.ink, opacity: 0.15 }} />
          <MiniStat value={available} label="Free" color={available ? colors.mint : colors.inkFaint} />
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
            <Text style={{ fontSize: typography.h3, fontWeight: typography.heavy, color: colors.ink }}>{formatCompactMoney(monthly)}</Text>
            <Text style={{ fontSize: typography.caption, fontWeight: typography.semibold, color: colors.inkSoft }}>/mo revenue</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Text style={{ fontSize: typography.caption, fontWeight: typography.bold, color: colors.primary }}>Manage</Text>
            <Icon name="chevron-right" size={18} color={colors.primary} />
          </View>
        </View>
      </View>
    </Surface>
  );
}

export default memo(SellerPropertyCardBase);
