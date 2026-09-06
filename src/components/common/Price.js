import React from 'react';
import { Text, View } from 'react-native';
import { formatMoney } from '@/utils';
import { colors, typography } from '@/theme';

/** Price with a "/month" (or custom) suffix. `size` = amount font size. */
export default function Price({ amount, period = 'month', size = 20, prefix, color = colors.ink, style }) {
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'baseline' }, style]}>
      {prefix ? (
        <Text style={{ fontSize: size * 0.7, fontWeight: typography.medium, color: colors.inkSoft, marginRight: 4 }}>
          {prefix}
        </Text>
      ) : null}
      <Text style={{ fontSize: size, fontWeight: typography.heavy, color, letterSpacing: -0.4 }}>
        {formatMoney(amount)}
      </Text>
      {period ? (
        <Text style={{ fontSize: size * 0.62, fontWeight: typography.semibold, color: colors.inkSoft }}>
          {' '}
          /{period}
        </Text>
      ) : null}
    </View>
  );
}
