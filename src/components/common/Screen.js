/**
 * Screen — consistent page shell: safe-area top padding + cream background.
 * `edges` lets a screen opt out of top padding (e.g. when it renders a full-bleed
 * image gallery at the very top).
 */

import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing } from '@/theme';

export default function Screen({ children, style, topPadding = true, edges = ['top'] }) {
  const insets = useSafeAreaInsets();
  const paddingTop = topPadding && edges.includes('top') ? insets.top + spacing.xs : 0;
  return <View style={[{ flex: 1, backgroundColor: colors.bg, paddingTop }, style]}>{children}</View>;
}
