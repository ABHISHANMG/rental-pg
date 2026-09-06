/**
 * Search (Requirements §10–11). Debounced text search combined with the filter sheet.
 * Idle state shows recent + popular searches; active state shows a results FlatList.
 */

import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Screen, SearchBar, Surface, Icon, Chip, PGCard, PGCardSkeletonList, EmptyState, ErrorState } from '@/components';
import FiltersSheet from '@/components/consumer/FiltersSheet';
import { useDebounce } from '@/hooks/useDebounce';
import { useFilteredPGs } from '@/hooks/usePGs';
import { useAppStore } from '@/store/app.store';
import { countActiveFilters } from '@/services/pg.service';
import { POPULAR_SEARCHES } from '@/constants';
import { colors, radius as R, spacing, typography } from '@/theme';

function FilterButton({ count, onPress }) {
  return (
    <Surface onPress={onPress} offset={4} radius={R.pill} accessibilityLabel="Filters">
      <View style={{ width: 54, height: 54, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="tune-variant" size={24} color={colors.ink} />
        {count > 0 ? (
          <View style={{ position: 'absolute', top: 6, right: 6, minWidth: 18, height: 18, paddingHorizontal: 4, borderRadius: 9, backgroundColor: colors.primary, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 10, fontWeight: typography.heavy, color: colors.white }}>{count}</Text>
          </View>
        ) : null}
      </View>
    </Surface>
  );
}

export default function Search() {
  const params = useLocalSearchParams();
  const [query, setQuery] = useState(typeof params.q === 'string' ? params.q : '');
  const [sheet, setSheet] = useState(false);

  const filters = useAppStore((s) => s.filters);
  const setFilters = useAppStore((s) => s.setFilters);
  const clearFilters = useAppStore((s) => s.clearFilters);
  const recent = useAppStore((s) => s.recentSearches);
  const addRecent = useAppStore((s) => s.addRecentSearch);
  const clearRecent = useAppStore((s) => s.clearRecentSearches);

  const debounced = useDebounce(query, 350);
  const activeCount = countActiveFilters(filters);
  const idle = !debounced.trim() && activeCount === 0;

  const merged = useMemo(() => ({ ...filters, query: debounced.trim() || undefined }), [filters, debounced]);
  const { data, isLoading, isError, refetch } = useFilteredPGs(idle ? {} : merged);
  const results = data || [];

  const runSearch = (term) => {
    setQuery(term);
    addRecent(term);
  };

  return (
    <Screen>
      {/* Search + filter row */}
      <View style={{ flexDirection: 'row', gap: spacing.md, paddingHorizontal: spacing.xl, paddingBottom: spacing.md, alignItems: 'center' }}>
        <View style={{ flex: 1 }}>
          <SearchBar value={query} onChangeText={setQuery} onClear={() => setQuery('')} onSubmitEditing={() => query.trim() && addRecent(query.trim())} placeholder="Search locality or PG name" />
        </View>
        <FilterButton count={activeCount} onPress={() => setSheet(true)} />
      </View>

      {idle ? (
        <FlatList
          data={[]}
          renderItem={() => null}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingHorizontal: spacing.xl, paddingBottom: 130 }}
          ListHeaderComponent={
            <View style={{ gap: spacing.xxl, paddingTop: spacing.sm }}>
              {recent.length > 0 ? (
                <View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
                    <Text style={{ fontSize: typography.h3, fontWeight: typography.heavy, color: colors.ink }}>Recent searches</Text>
                    <Text onPress={clearRecent} style={{ fontSize: typography.caption, fontWeight: typography.bold, color: colors.primary }}>Clear</Text>
                  </View>
                  {recent.map((term) => (
                    <Pressable key={term} onPress={() => runSearch(term)} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.surfaceSunken }}>
                      <Icon name="history" size={20} color={colors.inkSoft} />
                      <Text style={{ flex: 1, fontSize: typography.bodyLg, fontWeight: typography.medium, color: colors.ink }}>{term}</Text>
                      <Icon name="arrow-top-left" size={18} color={colors.inkFaint} />
                    </Pressable>
                  ))}
                </View>
              ) : null}

              <View>
                <Text style={{ fontSize: typography.h3, fontWeight: typography.heavy, color: colors.ink, marginBottom: spacing.md }}>Popular searches</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
                  {POPULAR_SEARCHES.map((term) => (
                    <Chip key={term} label={term} icon="trending-up" onPress={() => runSearch(term)} />
                  ))}
                </View>
              </View>
            </View>
          }
        />
      ) : (
        <FlatList
          data={isLoading ? [] : results}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <PGCard pg={item} />}
          contentContainerStyle={{ paddingHorizontal: spacing.xl, paddingBottom: 130 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            !isLoading && !isError ? (
              <Text style={{ fontSize: typography.caption, fontWeight: typography.bold, color: colors.inkSoft, marginBottom: spacing.md }}>
                {results.length} {results.length === 1 ? 'property' : 'properties'} found
              </Text>
            ) : null
          }
          ListEmptyComponent={
            isLoading ? (
              <PGCardSkeletonList count={3} />
            ) : isError ? (
              <ErrorState onRetry={refetch} />
            ) : (
              <EmptyState
                icon="magnify-close"
                title="No PGs found"
                message="Try changing your location or filters to see more results."
                actionLabel={activeCount ? 'Clear filters' : undefined}
                onAction={clearFilters}
              />
            )
          }
        />
      )}

      <FiltersSheet visible={sheet} onClose={() => setSheet(false)} filters={filters} onApply={setFilters} />
    </Screen>
  );
}
