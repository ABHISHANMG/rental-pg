/**
 * Enquiries — shared route, role-aware.
 *  - Consumer: enquiries you've sent (from the booking service).
 *  - Seller:   enquiries received across your properties (merged leads).
 */

import React, { useCallback } from 'react';
import { FlatList, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Screen, Header, EnquiryCard, PGCardSkeletonList, EmptyState } from '@/components';
import { useAsync } from '@/hooks/useAsync';
import { getEnquiries } from '@/services/booking.service';
import { getLeads } from '@/services/seller.service';
import { useAuthStore } from '@/store/auth.store';
import { spacing } from '@/theme';

export default function Enquiries() {
  const router = useRouter();
  const role = useAuthStore((s) => s.role);
  const isSeller = role === 'seller';

  const { data, isLoading, refetch } = useAsync(() => (isSeller ? getLeads() : getEnquiries()), [isSeller]);

  useFocusEffect(
    useCallback(() => {
      refetch();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isSeller])
  );

  const enquiries = data || [];

  return (
    <Screen>
      <Header showBack title={isSeller ? 'Enquiries received' : 'My enquiries'} subtitle={`${enquiries.length} total`} />
      <FlatList
        data={isLoading ? [] : enquiries}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <EnquiryCard enquiry={item} mode={isSeller ? 'seller' : 'consumer'} />}
        contentContainerStyle={{ paddingHorizontal: spacing.xl, paddingTop: spacing.sm, paddingBottom: spacing.huge }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          isLoading ? (
            <PGCardSkeletonList count={2} />
          ) : isSeller ? (
            <EmptyState icon="message-text-outline" tone="skyBg" title="No enquiries yet" message="When tenants enquire about your PGs, they'll show up here." />
          ) : (
            <EmptyState
              icon="message-text-outline"
              tone="lilac"
              title="No enquiries yet"
              message="Send an enquiry from any PG and track the owner's response here."
              actionLabel="Explore PGs"
              onAction={() => router.push('/(consumer)/home')}
            />
          )
        }
      />
    </Screen>
  );
}
