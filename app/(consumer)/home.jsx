/**
 * Consumer Home (Requirement §7). Location + notifications header, search entry,
 * popular locations, recommended (horizontal), nearby (vertical) and recently viewed.
 */

import React, { useMemo, useState } from 'react';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, IconButton, SearchBar, Chip, PGCard, PGCardCompact, PGCardSkeletonList, ErrorState, BottomSheet, Icon } from '@/components';
import { usePGs } from '@/hooks/usePGs';
import { useAppStore } from '@/store/app.store';
import { CITIES, GENDERS, POPULAR_LOCATIONS } from '@/constants';
import { greeting } from '@/utils';
import { colors, radius as R, spacing, typography } from '@/theme';

function SectionHeader({ title, actionLabel, onAction }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md, paddingHorizontal: spacing.xl }}>
      <Text style={{ fontSize: typography.h3, fontWeight: typography.heavy, color: colors.ink }}>{title}</Text>
      {actionLabel ? (
        <Text onPress={onAction} style={{ fontSize: typography.caption, fontWeight: typography.bold, color: colors.primary }}>
          {actionLabel}
        </Text>
      ) : null}
    </View>
  );
}

export default function Home() {
  const router = useRouter();
  const { data: pgs, isLoading, isError, refetch } = usePGs();
  const location = useAppStore((s) => s.location);
  const setLocation = useAppStore((s) => s.setLocation);
  const patchFilters = useAppStore((s) => s.patchFilters);
  const recentlyViewed = useAppStore((s) => s.recentlyViewed);
  const [locSheet, setLocSheet] = useState(false);

  const list = pgs || [];

  const recommended = useMemo(
    () => [...list].sort((a, b) => b.rating - a.rating).slice(0, 6),
    [list]
  );
  const nearby = useMemo(() => {
    const inCity = list.filter((p) => p.address.city === location);
    return (inCity.length ? inCity : list).slice(0, 5);
  }, [list, location]);
  const recentPGs = useMemo(
    () => recentlyViewed.map((id) => list.find((p) => p.id === id)).filter(Boolean),
    [recentlyViewed, list]
  );


  return (
    <Screen>
      {/* Location + notifications */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.xl, paddingBottom: spacing.md }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: typography.caption, fontWeight: typography.semibold, color: colors.inkSoft }}>{greeting()} 👋</Text>
          <Chip label={location} icon="map-marker" onPress={() => setLocSheet(true)} tone="lemon" style={{ alignSelf: 'flex-start', marginTop: 6 }} />
        </View>
        <IconButton icon="bell" onPress={() => router.push('/notifications')} badge={2} accessibilityLabel="Notifications" />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 130 }}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={colors.primary} />}
      >
        {/* Hero title + search */}
        <View style={{ paddingHorizontal: spacing.xl, paddingBottom: spacing.lg }}>
          <Text style={{ fontSize: typography.h1, fontWeight: typography.heavy, color: colors.ink, letterSpacing: -0.4, marginBottom: spacing.md }}>
            Find your{'\n'}perfect PG 🏠
          </Text>
          <SearchBar readOnly onPress={() => router.push('/(consumer)/search')} />
        </View>

        {/* Preference — quick gender filter */}
        <View style={{ marginBottom: spacing.xxl }}>
          <SectionHeader title="I'm looking for" />
          <View style={{ flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.xl }}>
            {GENDERS.map((g) => (
              <Chip
                key={g.key}
                label={g.label}
                icon={g.icon}
                style={{ flex: 1, justifyContent: 'center' }}
                onPress={() => {
                  patchFilters({ gender: g.key });
                  router.push('/(consumer)/search');
                }}
              />
            ))}
          </View>
        </View>

        {/* Popular locations */}
        <View style={{ marginBottom: spacing.xxl }}>
          <SectionHeader title="Popular locations" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: spacing.xl, gap: spacing.sm }}>
            {POPULAR_LOCATIONS.map((loc) => (
              <Chip
                key={loc.label}
                label={loc.label}
                icon="map-marker-outline"
                onPress={() => {
                  setLocation(loc.city);
                  router.push({ pathname: '/(consumer)/search', params: { q: loc.label } });
                }}
              />
            ))}
          </ScrollView>
        </View>

        {/* Recommended */}
        <View style={{ marginBottom: spacing.xxl }}>
          <SectionHeader title="Recommended for you" actionLabel="See all" onAction={() => router.push('/(consumer)/search')} />
          {isLoading ? (
            <View style={{ paddingHorizontal: spacing.xl }}>
              <PGCardSkeletonList count={1} />
            </View>
          ) : isError ? (
            <ErrorState onRetry={refetch} />
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: spacing.xl, gap: spacing.lg }}>
              {recommended.map((pg) => (
                <PGCardCompact key={pg.id} pg={pg} />
              ))}
            </ScrollView>
          )}
        </View>

        {/* Recently viewed */}
        {recentPGs.length > 0 ? (
          <View style={{ marginBottom: spacing.xxl }}>
            <SectionHeader title="Recently viewed" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: spacing.xl, gap: spacing.lg }}>
              {recentPGs.map((pg) => (
                <PGCardCompact key={pg.id} pg={pg} />
              ))}
            </ScrollView>
          </View>
        ) : null}

        {/* Nearby */}
        <View>
          <SectionHeader title={`PGs in ${location}`} actionLabel="See all" onAction={() => router.push('/(consumer)/search')} />
          <View style={{ paddingHorizontal: spacing.xl }}>
            {isLoading ? (
              <PGCardSkeletonList count={2} />
            ) : (
              nearby.map((pg) => <PGCard key={pg.id} pg={pg} />)
            )}
          </View>
        </View>
      </ScrollView>

      {/* Location picker */}
      <BottomSheet visible={locSheet} onClose={() => setLocSheet(false)} title="Choose your city">
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg }}>
          {CITIES.map((c) => (
            <Chip key={c} label={c} icon="city-variant-outline" selected={c === location} onPress={() => { setLocation(c); setLocSheet(false); }} />
          ))}
        </View>
        <Text style={{ fontSize: typography.caption, fontWeight: typography.bold, color: colors.inkSoft, marginBottom: spacing.sm }}>POPULAR LOCALITIES</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          {POPULAR_LOCATIONS.map((loc) => (
            <Chip
              key={loc.label}
              label={loc.label}
              onPress={() => {
                setLocation(loc.city);
                setLocSheet(false);
                router.push({ pathname: '/(consumer)/search', params: { q: loc.label } });
              }}
            />
          ))}
        </View>
      </BottomSheet>
    </Screen>
  );
}
