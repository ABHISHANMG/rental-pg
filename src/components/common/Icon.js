/**
 * Thin icon wrapper. `set` selects the glyph family so callers stay declarative.
 * Defaults to MaterialCommunityIcons (used by the amenity catalog).
 */

import React from 'react';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme';

export default function Icon({ name, size = 20, color = colors.ink, set = 'mci', style }) {
  const Comp = set === 'ion' ? Ionicons : MaterialCommunityIcons;
  return <Comp name={name} size={size} color={color} style={style} />;
}
