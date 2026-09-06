/**
 * Favorites (Requirement §14). Saved PGs fetched by id via the service layer so the
 * store only holds ids — ready to sync with a backend later.
 */

import React from 'react';
import { FlatList, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, PGCard, PGCardSkeletonList, EmptyState } from '@/components';
import { useFavoritesStore } from '@/store/favorites.store';
import { usePGsByIds } from '@/hooks/usePGs';
import { colors, spacing, typography } from '@/theme';

export default function Favorites() {
  const router = useRouter();
  const ids = useFavoritesStore((s) => s.ids);
  const { data, isLoading } = usePGsByIds(ids);
  // Preserve the order favorites were added in (store order), not fetch order.
  const ordered = ids.map((id) => (data || []).find((p) => p.id === id)).filter(Boolean);

  return (
    <Screen>
      <View style={{ paddingHorizontal: spacing.xl, paddingBottom: spacing.md }}>
        <Text style={{ fontSize: typography.h1, fontWeight: typography.heavy, color: colors.ink, letterSpacing: -0.4 }}>Saved PGs</Text>
        <Text style={{ fontSize: typography.body, fontWeight: typography.medium, color: colors.inkSoft, marginTop: 2 }}>
          {ids.length ? `${ids.length} ${ids.length === 1 ? 'property' : 'properties'} shortlisted` : 'Your shortlist lives here'}
        </Text>
      </View>

      <FlatList
        data={isLoading && ids.length ? [] : ordered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PGCard pg={item} />}
        contentContainerStyle={{ paddingHorizontal: spacing.xl, paddingBottom: 130 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          isLoading && ids.length ? (
            <PGCardSkeletonList count={2} />
          ) : (
            <EmptyState
              icon="heart-outline"
              tone="peach"
              title="No saved PGs yet"
              message="Tap the heart on any property to save it here for quick access."
              actionLabel="Explore PGs"
              onAction={() => router.push('/(consumer)/home')}
            />
          )
        }
      />
    </Screen>
  );
}
