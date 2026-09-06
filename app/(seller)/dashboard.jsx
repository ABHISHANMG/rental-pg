/**
 * Seller Dashboard (Requirement §19). Portfolio stats, revenue highlight, quick actions,
 * today's activity and a peek at the owner's properties.
 */

import React, { useCallback } from 'react';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Screen, IconButton, Surface, StatCard, SellerPropertyCard, Icon, LoadingState } from '@/components';
import { useAsync } from '@/hooks/useAsync';
import { getSellerStats, getSellerProperties } from '@/services/seller.service';
import { useAuthStore } from '@/store/auth.store';
import { greeting, formatCompactMoney } from '@/utils';
import { colors, radius as R, spacing, typography } from '@/theme';

function SectionHeader({ title, actionLabel, onAction }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md }}>
      <Text style={{ fontSize: typography.h3, fontWeight: typography.heavy, color: colors.ink }}>{title}</Text>
      {actionLabel ? <Text onPress={onAction} style={{ fontSize: typography.caption, fontWeight: typography.bold, color: colors.primary }}>{actionLabel}</Text> : null}
    </View>
  );
}

function QuickAction({ icon, label, tone, onPress }) {
  return (
    <Surface onPress={onPress} offset={4} radius={R.lg} background={colors[tone]} style={{ flex: 1 }} accessibilityLabel={label}>
      <View style={{ paddingVertical: spacing.lg, alignItems: 'center', gap: 8 }}>
        <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name={icon} size={22} color={colors.ink} />
        </View>
        <Text style={{ fontSize: typography.micro, fontWeight: typography.bold, color: colors.ink }}>{label}</Text>
      </View>
    </Surface>
  );
}

export default function Dashboard() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const stats = useAsync(() => getSellerStats(), []);
  const props = useAsync(() => getSellerProperties(), []);

  useFocusEffect(
    useCallback(() => {
      stats.refetch();
      props.refetch();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  const s = stats.data;
  const properties = props.data || [];
  const firstName = (user?.name || 'there').split(' ')[0];
  const refreshing = stats.isLoading || props.isLoading;

  if (!s && stats.isLoading) {
    return (
      <Screen>
        <LoadingState message="Loading your dashboard…" />
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.xl, paddingBottom: spacing.md }}>
        <View>
          <Text style={{ fontSize: typography.caption, fontWeight: typography.semibold, color: colors.inkSoft }}>{greeting()}, {firstName} 👋</Text>
          <Text style={{ fontSize: typography.h1, fontWeight: typography.heavy, color: colors.ink, letterSpacing: -0.4 }}>Dashboard</Text>
        </View>
        <IconButton icon="bell" onPress={() => router.push('/notifications')} badge={s?.pendingEnquiries || 0} accessibilityLabel="Notifications" />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: spacing.xl, paddingBottom: 130, gap: spacing.xxl }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { stats.refetch(); props.refetch(); }} tintColor={colors.primary} />}
      >
        {/* Revenue highlight */}
        <Surface offset={5} radius={R.xl} background={colors.primary}>
          <View style={{ padding: spacing.xl }}>
            <Text style={{ fontSize: typography.micro, fontWeight: typography.bold, color: 'rgba(255,255,255,0.8)' }}>ESTIMATED MONTHLY REVENUE</Text>
            <Text style={{ fontSize: 40, fontWeight: typography.heavy, color: colors.white, letterSpacing: -1, marginTop: 4 }}>{formatCompactMoney(s?.monthlyRevenue || 0)}</Text>
            <View style={{ flexDirection: 'row', gap: spacing.xl, marginTop: spacing.md }}>
              <View>
                <Text style={{ fontSize: typography.bodyLg, fontWeight: typography.heavy, color: colors.white }}>{s?.occupiedBeds || 0}/{s?.totalBeds || 0}</Text>
                <Text style={{ fontSize: typography.micro, fontWeight: typography.bold, color: 'rgba(255,255,255,0.8)' }}>BEDS OCCUPIED</Text>
              </View>
              <View>
                <Text style={{ fontSize: typography.bodyLg, fontWeight: typography.heavy, color: colors.white }}>{s?.availableBeds || 0}</Text>
                <Text style={{ fontSize: typography.micro, fontWeight: typography.bold, color: 'rgba(255,255,255,0.8)' }}>AVAILABLE</Text>
              </View>
            </View>
          </View>
        </Surface>

        {/* Stat tiles */}
        <View style={{ gap: spacing.md }}>
          <View style={{ flexDirection: 'row', gap: spacing.md }}>
            <StatCard icon="home-city" value={s?.totalProperties ?? 0} label="Properties" tone="lilac" />
            <StatCard icon="bed" value={s?.occupiedBeds ?? 0} label="Occupied" tone="mintBg" />
            <StatCard icon="bed-outline" value={s?.availableBeds ?? 0} label="Available" tone="lemon" />
          </View>
          <View style={{ flexDirection: 'row', gap: spacing.md }}>
            <StatCard icon="message-text" value={s?.pendingEnquiries ?? 0} label="New leads" tone="skyBg" />
            <StatCard icon="calendar-clock" value={s?.pendingBookings ?? 0} label="Requests" tone="peach" />
            <StatCard icon="star" value={s?.activeProperties ?? 0} label="Active" tone="sand" />
          </View>
        </View>

        {/* Quick actions */}
        <View>
          <SectionHeader title="Quick actions" />
          <View style={{ flexDirection: 'row', gap: spacing.md }}>
            <QuickAction icon="plus-box" label="Add PG" tone="lemon" onPress={() => router.push('/(seller)/add-pg')} />
            <QuickAction icon="account-multiple" label="Leads" tone="lilac" onPress={() => router.push('/(seller)/leads')} />
            <QuickAction icon="calendar-check" label="Bookings" tone="mintBg" onPress={() => router.push('/(seller)/bookings')} />
            <QuickAction icon="home-city" label="Properties" tone="peach" onPress={() => router.push('/(seller)/listings')} />
          </View>
        </View>

        {/* Today's activity */}
        <View>
          <SectionHeader title="Today's activity" />
          <Surface offset={4} radius={R.xl}>
            <View style={{ padding: spacing.lg, gap: spacing.md }}>
              {[
                { icon: 'message-text', tone: 'skyBg', label: 'New enquiries', value: s?.pendingEnquiries || 0, onPress: () => router.push('/(seller)/leads') },
                { icon: 'calendar-clock', tone: 'peach', label: 'Booking requests', value: s?.pendingBookings || 0, onPress: () => router.push('/(seller)/bookings') },
              ].map((row, i) => (
                <View key={row.label} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingTop: i ? spacing.md : 0, borderTopWidth: i ? 1 : 0, borderTopColor: colors.surfaceSunken }}>
                  <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: colors[row.tone], borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name={row.icon} size={20} color={colors.ink} />
                  </View>
                  <Text style={{ flex: 1, fontSize: typography.bodyLg, fontWeight: typography.bold, color: colors.ink }}>{row.value} {row.label}</Text>
                  <Text onPress={row.onPress} style={{ fontSize: typography.caption, fontWeight: typography.bold, color: colors.primary }}>View</Text>
                </View>
              ))}
            </View>
          </Surface>
        </View>

        {/* Your properties */}
        <View>
          <SectionHeader title="Your properties" actionLabel="See all" onAction={() => router.push('/(seller)/listings')} />
          {properties.slice(0, 2).map((p) => (
            <SellerPropertyCard key={p.id} property={p} />
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}
