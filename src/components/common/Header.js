/**
 * Header — screen title row with optional back button and a right-hand action slot.
 * Uses a small square neo-brutalist icon button for back/actions.
 */

import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import Surface from './Surface';
import Icon from './Icon';
import { colors, spacing, typography } from '@/theme';

export function IconButton({ icon, onPress, tone = 'surface', color = colors.ink, badge, accessibilityLabel }) {
  // Badge is a sibling of the Surface (not a child) so it isn't clipped by the
  // Surface's rounded overflow-hidden content wrapper.
  return (
    <View>
      <Surface onPress={onPress} offset={3} radius={12} background={colors[tone] || colors.surface} accessibilityLabel={accessibilityLabel}>
        <View style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name={icon} size={22} color={color} />
        </View>
      </Surface>
      {badge != null && badge > 0 ? (
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: -5,
            right: -5,
            minWidth: 18,
            height: 18,
            paddingHorizontal: 4,
            borderRadius: 9,
            backgroundColor: colors.coral,
            borderWidth: 2,
            borderColor: colors.surface,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: 10, fontWeight: typography.heavy, color: colors.white }}>{badge}</Text>
        </View>
      ) : null}
    </View>
  );
}

export default function Header({ title, subtitle, showBack = false, onBack, right, style }) {
  const router = useRouter();
  const back = onBack || (() => router.back());

  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.md,
          paddingHorizontal: spacing.xl,
          paddingBottom: spacing.md,
          paddingTop: spacing.xs,
        },
        style,
      ]}
    >
      {showBack ? <IconButton icon="arrow-left" onPress={back} accessibilityLabel="Go back" /> : null}
      <View style={{ flex: 1 }}>
        {title ? <Text numberOfLines={1} style={{ fontSize: typography.h2, fontWeight: typography.heavy, color: colors.ink }}>{title}</Text> : null}
        {subtitle ? <Text numberOfLines={1} style={{ fontSize: typography.caption, color: colors.inkSoft, marginTop: 2 }}>{subtitle}</Text> : null}
      </View>
      {right}
    </View>
  );
}
