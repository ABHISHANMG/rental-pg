/**
 * Role selection — the fork between the two experiences. Selecting a role stores it
 * in the auth store, then routes to login. (Requirement §6)
 */

import React from 'react';
import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Surface, Icon } from '@/components';
import { useAuthStore } from '@/store/auth.store';
import { colors, radius as R, spacing, typography } from '@/theme';

function RoleCard({ icon, title, subtitle, tone, onPress }) {
  return (
    <Surface onPress={onPress} offset={6} radius={R.xl} background={colors[tone]} accessibilityLabel={title}>
      <View style={{ padding: spacing.xl, flexDirection: 'row', alignItems: 'center', gap: spacing.lg }}>
        <View
          style={{
            width: 64,
            height: 64,
            borderRadius: R.lg,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name={icon} size={34} color={colors.ink} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: typography.h3, fontWeight: typography.heavy, color: colors.ink }}>{title}</Text>
          <Text style={{ fontSize: typography.caption, fontWeight: typography.medium, color: colors.inkSoft, marginTop: 3, lineHeight: 18 }}>
            {subtitle}
          </Text>
        </View>
        <Icon name="arrow-right-circle" size={30} color={colors.ink} />
      </View>
    </Surface>
  );
}

export default function RoleSelection() {
  const router = useRouter();
  const setRole = useAuthStore((s) => s.setRole);

  const choose = (role) => {
    setRole(role);
    // Consumers browse freely — no login. Sellers sign in to manage listings.
    if (role === 'consumer') router.replace('/(consumer)/home');
    else router.push('/(auth)/login');
  };

  return (
    <Screen>
      <View style={{ flex: 1, paddingHorizontal: spacing.xl, justifyContent: 'center', gap: spacing.xxxl }}>
        <View style={{ gap: spacing.sm }}>
          <View
            style={{
              width: 60,
              height: 60,
              borderRadius: R.lg,
              backgroundColor: colors.primary,
              borderWidth: 1,
              borderColor: colors.border,
              alignItems: 'center',
              justifyContent: 'center',
              transform: [{ rotate: '-4deg' }],
              marginBottom: spacing.sm,
            }}
          >
            <Icon name="home-city" size={32} color={colors.white} />
          </View>
          <Text style={{ fontSize: typography.display, fontWeight: typography.heavy, color: colors.ink, letterSpacing: -0.5 }}>
            How do you want{'\n'}to use the app?
          </Text>
          <Text style={{ fontSize: typography.bodyLg, fontWeight: typography.medium, color: colors.inkSoft }}>
            Pick a role to get started. You can switch later.
          </Text>
        </View>

        <View style={{ gap: spacing.lg }}>
          <RoleCard
            icon="magnify"
            title="Find a PG"
            subtitle="Browse PGs freely — no sign-up needed."
            tone="lilac"
            onPress={() => choose('consumer')}
          />
          <RoleCard
            icon="office-building-marker"
            title="List my PG"
            subtitle="I'm a PG / property owner."
            tone="lemon"
            onPress={() => choose('seller')}
          />
        </View>
      </View>
    </Screen>
  );
}
