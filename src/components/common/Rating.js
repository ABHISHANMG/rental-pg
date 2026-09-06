import React from 'react';
import { Text, View } from 'react-native';
import Icon from './Icon';
import { colors, typography } from '@/theme';

/** Compact star rating with optional review count. */
export default function Rating({ value, count, size = 13, showCount = true, style }) {
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center', gap: 3 }, style]}>
      <Icon name="star" size={size + 1} color={colors.accent} />
      <Text style={{ fontSize: size, fontWeight: typography.bold, color: colors.ink }}>
        {Number(value).toFixed(1)}
      </Text>
      {showCount && count != null && (
        <Text style={{ fontSize: size, fontWeight: typography.regular, color: colors.inkSoft }}>
          ({count})
        </Text>
      )}
    </View>
  );
}
