/**
 * Splash / entry gate. Shows the brand mark briefly, then routes based on auth state:
 *   authenticated consumer → consumer home
 *   otherwise              → role selection
 */

import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import Icon from '@/components/common/Icon';
import { useAuthStore } from '@/store/auth.store';
import { colors, radius as R, typography } from '@/theme';

export default function Splash() {
  const router = useRouter();
  const status = useAuthStore((s) => s.status);
  const role = useAuthStore((s) => s.role);

  useEffect(() => {
    const t = setTimeout(() => {
      if (status === 'authenticated' && role === 'seller') router.replace('/(seller)/dashboard');
      else if (status === 'authenticated') router.replace('/(consumer)/home');
      else router.replace('/(auth)/role-selection');
    }, 1100);
    return () => clearTimeout(t);
  }, [status, role, router]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', gap: 20 }}>
      <View
        style={{
          width: 96,
          height: 96,
          borderRadius: R.xl,
          backgroundColor: colors.primary,
          borderWidth: 1,
          borderColor: colors.border,
          alignItems: 'center',
          justifyContent: 'center',
          transform: [{ rotate: '-4deg' }],
        }}
      >
        <Icon name="home-city" size={52} color={colors.white} />
      </View>
      <View style={{ alignItems: 'center' }}>
        <Text style={{ fontSize: 34, fontWeight: typography.heavy, color: colors.ink, letterSpacing: -0.5 }}>zaptel</Text>
        <Text style={{ fontSize: typography.body, fontWeight: typography.semibold, color: colors.inkSoft, marginTop: 2 }}>
          Find your perfect PG
        </Text>
      </View>
    </View>
  );
}
