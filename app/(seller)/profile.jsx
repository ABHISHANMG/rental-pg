/**
 * Seller Profile (Requirement §18 for the owner side). Identity, portfolio stats and
 * a settings menu.
 */

import React, { useCallback } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Screen, Surface, Avatar, Icon, Button, Divider } from '@/components';
import { useDialog } from '@/hooks/useDialog';
import { useAsync } from '@/hooks/useAsync';
import { getSellerStats } from '@/services/seller.service';
import { useAuthStore } from '@/store/auth.store';
import { logout as logoutService } from '@/services/auth.service';
import { formatCompactMoney } from '@/utils';
import { colors, radius as R, spacing, typography } from '@/theme';

function MenuRow({ icon, tone, label, sublabel, onPress }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md, opacity: pressed ? 0.6 : 1 }]}>
      <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: colors[tone] || colors.surfaceAlt, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size={20} color={colors.ink} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: typography.bodyLg, fontWeight: typography.bold, color: colors.ink }}>{label}</Text>
        {sublabel ? <Text style={{ fontSize: typography.caption, color: colors.inkSoft }}>{sublabel}</Text> : null}
      </View>
      <Icon name="chevron-right" size={22} color={colors.inkFaint} />
    </Pressable>
  );
}

function Stat({ value, label, tone }) {
  return (
    <View style={{ flex: 1, backgroundColor: colors[tone], borderRadius: R.lg, borderWidth: 1, borderColor: colors.border, paddingVertical: spacing.md, alignItems: 'center' }}>
      <Text style={{ fontSize: typography.h2, fontWeight: typography.heavy, color: colors.ink }}>{value}</Text>
      <Text style={{ fontSize: typography.micro, fontWeight: typography.bold, color: colors.inkSoft }}>{label}</Text>
    </View>
  );
}

export default function SellerProfile() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { data: s, refetch } = useAsync(() => getSellerStats(), []);

  useFocusEffect(
    useCallback(() => {
      refetch();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  const dialog = useDialog();

  const soon = (title) =>
    dialog.alert({ title, message: 'This section is coming in a future update.', icon: 'clock-outline', tone: 'primary' });

  const confirmLogout = () =>
    dialog.confirm({
      title: 'Log out?',
      message: 'You can log back in anytime.',
      icon: 'logout',
      tone: 'danger',
      confirmLabel: 'Log out',
      onConfirm: async () => {
        await logoutService();
        logout();
        router.replace('/(auth)/role-selection');
      },
    });

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: spacing.xl, paddingBottom: 130, gap: spacing.xl }}>
        <Text style={{ fontSize: typography.h1, fontWeight: typography.heavy, color: colors.ink, letterSpacing: -0.4 }}>Profile</Text>

        <Surface offset={5} radius={R.xl} background={colors.ink}>
          <View style={{ padding: spacing.xl, flexDirection: 'row', alignItems: 'center', gap: spacing.lg }}>
            <Avatar name={user?.name} size={64} tone="lemon" />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: typography.h3, fontWeight: typography.heavy, color: colors.white }} numberOfLines={1}>{user?.name || 'PG Owner'}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 }}>
                <Icon name="briefcase-check" size={14} color={colors.accent} />
                <Text style={{ fontSize: typography.caption, fontWeight: typography.bold, color: colors.accent }}>Property owner</Text>
              </View>
              <Text style={{ fontSize: typography.caption, fontWeight: typography.medium, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>{user?.phone || ''}</Text>
            </View>
          </View>
        </Surface>

        <View style={{ flexDirection: 'row', gap: spacing.md }}>
          <Stat value={s?.totalProperties ?? 0} label="PROPERTIES" tone="lilac" />
          <Stat value={s?.occupiedBeds ?? 0} label="TENANTS" tone="mintBg" />
          <Stat value={formatCompactMoney(s?.monthlyRevenue || 0)} label="REVENUE" tone="lemon" />
        </View>

        <Surface offset={4} radius={R.xl}>
          <View style={{ paddingHorizontal: spacing.lg, paddingVertical: spacing.xs }}>
            <MenuRow icon="office-building-cog" tone="lilac" label="Business information" sublabel="Owner & KYC details" onPress={() => router.push('/personal-info')} />
            <Divider style={{ marginVertical: 0 }} />
            <MenuRow icon="home-city" tone="peach" label="My properties" sublabel={`${s?.totalProperties ?? 0} listed`} onPress={() => router.push('/(seller)/listings')} />
            <Divider style={{ marginVertical: 0 }} />
            <MenuRow icon="account-multiple" tone="skyBg" label="Leads" onPress={() => router.push('/(seller)/leads')} />
            <Divider style={{ marginVertical: 0 }} />
            <MenuRow icon="message-text" tone="lilac" label="Enquiries received" sublabel={s?.pendingEnquiries ? `${s.pendingEnquiries} new` : undefined} onPress={() => router.push('/enquiries')} />
            <Divider style={{ marginVertical: 0 }} />
            <MenuRow icon="calendar-check" tone="mintBg" label="Bookings" onPress={() => router.push('/(seller)/bookings')} />
            <Divider style={{ marginVertical: 0 }} />
            <MenuRow icon="bell" tone="lemon" label="Notifications" onPress={() => router.push('/notifications')} />
          </View>
        </Surface>

        <Surface offset={4} radius={R.xl}>
          <View style={{ paddingHorizontal: spacing.lg, paddingVertical: spacing.xs }}>
            <MenuRow icon="lifebuoy" tone="sand" label="Help & support" onPress={() => soon('Help & support')} />
            <Divider style={{ marginVertical: 0 }} />
            <MenuRow icon="file-document" tone="sand" label="Terms & privacy" onPress={() => soon('Terms & privacy')} />
          </View>
        </Surface>

        <Button title="Log out" variant="surface" icon="logout" onPress={confirmLogout} fullWidth />
        <Text style={{ textAlign: 'center', fontSize: typography.caption, color: colors.inkFaint }}>Zaptel for Owners · v1.0.0 (demo)</Text>
      </ScrollView>

      {dialog.node}
    </Screen>
  );
}
