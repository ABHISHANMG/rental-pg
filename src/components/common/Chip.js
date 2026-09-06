/**
 * Chip — selectable pill used for popular locations, filter options, amenities.
 * Selected state fills with ink for strong neo-brutalist contrast.
 */

import React from 'react';
import { Pressable, Text, View } from 'react-native';
import Icon from './Icon';
import { colors, radius as R, typography } from '@/theme';

export default function Chip({
  label,
  selected = false,
  onPress,
  icon,
  iconSet = 'mci',
  tone = 'surface', // unselected background: 'surface' | pastel color key
  style,
}) {
  const unselectedBg = tone === 'surface' ? colors.surface : colors[tone] || colors.surface;
  const bg = selected ? colors.ink : unselectedBg;
  const fg = selected ? colors.white : colors.ink;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      style={({ pressed }) => [
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          backgroundColor: bg,
          borderColor: colors.border,
          borderWidth: 1,
          borderRadius: R.pill,
          paddingHorizontal: 14,
          paddingVertical: 9,
          opacity: pressed ? 0.85 : 1,
        },
        style,
      ]}
    >
      {icon && <Icon name={icon} set={iconSet} size={15} color={fg} />}
      <Text style={{ color: fg, fontSize: typography.caption, fontWeight: typography.bold }}>{label}</Text>
    </Pressable>
  );
}
