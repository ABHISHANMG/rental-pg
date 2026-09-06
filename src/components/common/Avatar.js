import React from 'react';
import { Image, Text, View } from 'react-native';
import { colors, typography } from '@/theme';

function initials(name = '') {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

/** Circular avatar; renders image when provided, otherwise coloured initials. */
export default function Avatar({ name, uri, size = 48, tone = 'lilac', style }) {
  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors[tone] || colors.lilac,
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        },
        style,
      ]}
    >
      {uri ? (
        <Image source={{ uri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
      ) : (
        <Text style={{ fontSize: size * 0.36, fontWeight: typography.heavy, color: colors.ink }}>
          {initials(name) || '?'}
        </Text>
      )}
    </View>
  );
}
