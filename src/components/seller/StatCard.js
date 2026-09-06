/**
 * StatCard — compact metric tile for the seller dashboard (icon + value + label).
 * Flat bordered box (no shadow) so a grid of them stays calm.
 */

import React from 'react';
import { Text, View } from 'react-native';
import Icon from '@/components/common/Icon';
import { colors, radius as R, spacing, typography } from '@/theme';

export default function StatCard({ icon, value, label, tone = 'surface', style }) {
  return (
    <View
      style={[
        {
          flex: 1,
          backgroundColor: colors[tone] || colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: R.lg,
          padding: spacing.md,
          gap: 6,
          minWidth: 0,
        },
        style,
      ]}
    >
      <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size={18} color={colors.ink} />
      </View>
      <Text numberOfLines={1} style={{ fontSize: typography.h2, fontWeight: typography.heavy, color: colors.ink, letterSpacing: -0.5 }}>
        {value}
      </Text>
      <Text style={{ fontSize: typography.micro, fontWeight: typography.bold, color: colors.inkSoft }}>{label.toUpperCase()}</Text>
    </View>
  );
}
