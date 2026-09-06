/**
 * Seller Properties (Requirement §20). All owned properties with status + occupancy;
 * tap to manage, or add a new one.
 */

import React, { useCallback } from 'react';
import { FlatList, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Screen, IconButton, Button, SellerPropertyCard, PGCardSkeletonList, EmptyState } from '@/components';
import { useAsync } from '@/hooks/useAsync';
import { getSellerProperties } from '@/services/seller.service';
import { colors, spacing, typography } from '@/theme';

export default function Listings() {
  const router = useRouter();
  const { data, isLoading, refetch } = useAsync(() => getSellerProperties(), []);

  useFocusEffect(
    useCallback(() => {
      refetch();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  const properties = data || [];

  return (
    <Screen>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.xl, paddingBottom: spacing.md }}>
        <View>
          <Text style={{ fontSize: typography.h1, fontWeight: typography.heavy, color: colors.ink, letterSpacing: -0.4 }}>Properties</Text>
          <Text style={{ fontSize: typography.body, fontWeight: typography.medium, color: colors.inkSoft, marginTop: 2 }}>
            {properties.length} {properties.length === 1 ? 'listing' : 'listings'}
          </Text>
        </View>
        <IconButton icon="plus" onPress={() => router.push('/(seller)/add-pg')} tone="lemon" accessibilityLabel="Add property" />
      </View>

      <FlatList
        data={isLoading ? [] : properties}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <SellerPropertyCard property={item} />}
        contentContainerStyle={{ paddingHorizontal: spacing.xl, paddingBottom: 130 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          isLoading ? (
            <PGCardSkeletonList count={2} />
          ) : (
            <EmptyState icon="home-plus" tone="lemon" title="No properties yet" message="List your first PG to start receiving enquiries and bookings." actionLabel="Add a PG" onAction={() => router.push('/(seller)/add-pg')} />
          )
        }
        ListFooterComponent={
          properties.length ? <Button title="Add another property" variant="surface" icon="plus" onPress={() => router.push('/(seller)/add-pg')} fullWidth style={{ marginTop: spacing.sm }} /> : null
        }
      />
    </Screen>
  );
}
