/**
 * AmenityRow — compact inline list of amenity chips (icon + label), with a "+N" overflow.
 */

import React from 'react';
import { Text, View } from 'react-native';
import Icon from '@/components/common/Icon';
import { AMENITY_MAP } from '@/constants';
import { colors, typography } from '@/theme';

export default function AmenityRow({ amenities = [], max = 3, style }) {
  const shown = amenities.slice(0, max);
  const extra = amenities.length - shown.length;

  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 }, style]}>
      {shown.map((key) => {
        const a = AMENITY_MAP[key];
        return (
          <View
            key={key}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
              backgroundColor: colors.surfaceAlt,
              borderRadius: 8,
              paddingHorizontal: 8,
              paddingVertical: 4,
            }}
          >
            <Icon name={a?.icon || 'check-circle-outline'} size={13} color={colors.inkSoft} />
            <Text style={{ fontSize: typography.micro, fontWeight: typography.bold, color: colors.inkSoft }}>{a?.label || key}</Text>
          </View>
        );
      })}
      {extra > 0 ? (
        <Text style={{ fontSize: typography.micro, fontWeight: typography.bold, color: colors.inkFaint }}>+{extra} more</Text>
      ) : null}
    </View>
  );
}
