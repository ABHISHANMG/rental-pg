/**
 * StarInput — tappable 1–5 star selector for leaving a rating.
 */

import React from 'react';
import { Pressable, View } from 'react-native';
import Icon from './Icon';
import { colors } from '@/theme';

export default function StarInput({ value = 0, onChange, size = 36, style }) {
  return (
    <View style={[{ flexDirection: 'row', gap: 8 }, style]}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Pressable key={n} onPress={() => onChange?.(n)} hitSlop={6} accessibilityRole="button" accessibilityLabel={`${n} star${n > 1 ? 's' : ''}`}>
          <Icon name={n <= value ? 'star' : 'star-outline'} size={size} color={n <= value ? colors.accent : colors.inkFaint} />
        </Pressable>
      ))}
    </View>
  );
}
