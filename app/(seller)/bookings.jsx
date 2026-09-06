/**
 * Seller Bookings (Requirement §24). Booking requests grouped by status with
 * Approve / Reject actions on pending requests.
 */

import React, { useCallback, useState } from 'react';
import { FlatList, ScrollView, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Screen, Chip, SellerBookingCard, PGCardSkeletonList, EmptyState } from '@/components';
import { useDialog } from '@/hooks/useDialog';
import { useAsync } from '@/hooks/useAsync';
import { getSellerBookings, updateSellerBookingStatus } from '@/services/seller.service';
import { colors, spacing, typography } from '@/theme';

const FILTERS = [
  { key: 'ALL', label: 'All' },
  { key: 'PENDING', label: 'New requests' },
  { key: 'APPROVED', label: 'Approved' },
  { key: 'PAYMENT_PENDING', label: 'Payment pending' },
  { key: 'CONFIRMED', label: 'Confirmed' },
  { key: 'REJECTED', label: 'Rejected' },
];

export default function SellerBookings() {
  const { data, isLoading, refetch } = useAsync(() => getSellerBookings(), []);
  const [filter, setFilter] = useState('ALL');
  const dialog = useDialog();

  useFocusEffect(
    useCallback(() => {
      refetch();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  const bookings = data || [];
  const filtered = filter === 'ALL' ? bookings : bookings.filter((b) => b.status === filter);

  const approve = async (b) => {
    await updateSellerBookingStatus(b.id, 'APPROVED');
    refetch();
  };
  const reject = (b) => {
    dialog.confirm({
      title: 'Reject booking?',
      message: `Reject ${b.name}'s request for ${b.pgName}?`,
      icon: 'close-circle',
      tone: 'danger',
      confirmLabel: 'Reject',
      onConfirm: async () => {
        await updateSellerBookingStatus(b.id, 'REJECTED');
        refetch();
      },
    });
  };

  return (
    <Screen>
      <View style={{ paddingHorizontal: spacing.xl, paddingBottom: spacing.md }}>
        <Text style={{ fontSize: typography.h1, fontWeight: typography.heavy, color: colors.ink, letterSpacing: -0.4 }}>Bookings</Text>
      </View>

      <View style={{ marginBottom: spacing.sm }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: spacing.xl, gap: spacing.sm }}>
          {FILTERS.map((f) => (
            <Chip key={f.key} label={f.label} selected={filter === f.key} onPress={() => setFilter(f.key)} />
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={isLoading ? [] : filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <SellerBookingCard booking={item} onApprove={() => approve(item)} onReject={() => reject(item)} />}
        contentContainerStyle={{ paddingHorizontal: spacing.xl, paddingTop: spacing.sm, paddingBottom: 130 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          isLoading ? <PGCardSkeletonList count={2} /> : <EmptyState icon="calendar-blank-outline" tone="peach" title="No booking requests" message="Requests from tenants will show up here for you to approve." />
        }
      />
      {dialog.node}
    </Screen>
  );
}
