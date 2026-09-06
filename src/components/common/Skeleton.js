/**
 * Skeleton — pulsing placeholder block plus a ready-made PGCard skeleton for lists.
 */

import React, { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';
import { colors, radius as R, spacing } from '@/theme';

export function Skeleton({ width = '100%', height = 16, radius = 8, style }) {
  const opacity = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 650, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.5, duration: 650, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[{ width, height, borderRadius: radius, backgroundColor: colors.surfaceSunken, opacity }, style]}
    />
  );
}

export function PGCardSkeleton() {
  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: colors.surfaceSunken,
        borderRadius: R.xl,
        backgroundColor: colors.surface,
        overflow: 'hidden',
        marginBottom: spacing.lg,
      }}
    >
      <Skeleton width="100%" height={180} radius={0} />
      <View style={{ padding: spacing.lg, gap: spacing.sm }}>
        <Skeleton width="65%" height={20} />
        <Skeleton width="45%" height={14} />
        <View style={{ height: spacing.xs }} />
        <Skeleton width="35%" height={22} />
        <Skeleton width="55%" height={14} />
      </View>
    </View>
  );
}

export function PGCardSkeletonList({ count = 3 }) {
  return (
    <View>
      {Array.from({ length: count }).map((_, i) => (
        <PGCardSkeleton key={i} />
      ))}
    </View>
  );
}
