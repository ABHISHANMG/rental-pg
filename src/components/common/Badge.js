/**
 * Badge — small non-interactive status pill (pastel fill + ink border + ink text).
 * `tone` maps to a theme pastel color key.
 */

import React from 'react';
import { Text, View } from 'react-native';
import Icon from './Icon';
import { colors, radius as R, typography } from '@/theme';

export default function Badge({ label, tone = 'lemon', icon, iconSet = 'mci', color, small = false, style }) {
  const bg = colors[tone] || colors.lemon;
  const fg = color || colors.ink;
  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
          backgroundColor: bg,
          borderColor: colors.border,
          borderWidth: 1,
          borderRadius: R.pill,
          paddingHorizontal: small ? 8 : 10,
          paddingVertical: small ? 3 : 4,
          alignSelf: 'flex-start',
        },
        style,
      ]}
    >
      {icon && <Icon name={icon} set={iconSet} size={small ? 11 : 13} color={fg} />}
      <Text style={{ color: fg, fontSize: small ? typography.micro : typography.caption, fontWeight: typography.bold }}>
        {label}
      </Text>
    </View>
  );
}
