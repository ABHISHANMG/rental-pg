import React from 'react';
import { View } from 'react-native';
import { colors, spacing } from '@/theme';

export default function Divider({ vertical = false, thick = false, style }) {
  if (vertical) {
    return <View style={[{ width: thick ? 2 : 1, alignSelf: 'stretch', backgroundColor: colors.surfaceSunken }, style]} />;
  }
  return <View style={[{ height: thick ? 2 : 1, backgroundColor: colors.surfaceSunken, marginVertical: spacing.md }, style]} />;
}
