/**
 * Segmented — pill-group tab switcher (e.g. Upcoming / Past). Selected fills ink.
 */

import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { colors, radius as R, typography } from '@/theme';

export default function Segmented({ options, value, onChange, style }) {
  return (
    <View
      style={[
        {
          flexDirection: 'row',
          backgroundColor: colors.surfaceAlt,
          borderColor: colors.border,
          borderWidth: 1,
          borderRadius: R.pill,
          padding: 4,
          gap: 4,
        },
        style,
      ]}
    >
      {options.map((opt) => {
        const key = typeof opt === 'string' ? opt : opt.value;
        const label = typeof opt === 'string' ? opt : opt.label;
        const active = key === value;
        return (
          <Pressable
            key={key}
            onPress={() => onChange(key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            style={{
              flex: 1,
              paddingVertical: 9,
              borderRadius: R.pill,
              backgroundColor: active ? colors.ink : 'transparent',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text
              numberOfLines={1}
              style={{ fontSize: typography.caption, fontWeight: typography.bold, color: active ? colors.white : colors.inkSoft }}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
