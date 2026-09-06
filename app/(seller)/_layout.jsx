/**
 * Seller tab navigator. Same Soft Neo-Brutalist floating bar as the consumer side,
 * with owner tabs. Full-screen routes (add-pg wizard, property management) live in the
 * same group but hide the tab bar so they read as pushed screens.
 */

import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '@/components/common/Icon';
import { colors, radius as R, spacing, typography } from '@/theme';

const TAB_META = {
  dashboard: { label: 'Home', icon: 'view-dashboard', iconOutline: 'view-dashboard-outline' },
  listings: { label: 'Properties', icon: 'home-city', iconOutline: 'home-city-outline' },
  leads: { label: 'Leads', icon: 'account-multiple', iconOutline: 'account-multiple-outline' },
  bookings: { label: 'Bookings', icon: 'calendar-check', iconOutline: 'calendar-blank-outline' },
  profile: { label: 'Profile', icon: 'account', iconOutline: 'account-outline' },
};

function TabBar({ state, navigation }) {
  const insets = useSafeAreaInsets();
  const focusedName = state.routes[state.index]?.name;

  // Hide the bar on full-screen routes (wizard / property management).
  if (!TAB_META[focusedName]) return null;

  return (
    <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, paddingBottom: Math.max(insets.bottom, 10), paddingHorizontal: spacing.lg, paddingTop: spacing.sm }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: R.pill,
          paddingHorizontal: 8,
          paddingVertical: 8,
          shadowColor: colors.ink,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.12,
          shadowRadius: 16,
          elevation: 6,
        }}
      >
        {state.routes.map((route, index) => {
          const meta = TAB_META[route.name];
          if (!meta) return null;
          const focused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
          };

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={meta.label}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                paddingHorizontal: focused ? 13 : 9,
                paddingVertical: 9,
                borderRadius: R.pill,
                backgroundColor: focused ? colors.ink : 'transparent',
              }}
            >
              <Icon name={focused ? meta.icon : meta.iconOutline} size={22} color={focused ? colors.white : colors.inkSoft} />
              {focused ? <Text style={{ fontSize: typography.caption, fontWeight: typography.bold, color: colors.white }}>{meta.label}</Text> : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function SellerLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <TabBar {...props} />}>
      <Tabs.Screen name="dashboard" />
      <Tabs.Screen name="listings" />
      <Tabs.Screen name="leads" />
      <Tabs.Screen name="bookings" />
      <Tabs.Screen name="profile" />
      <Tabs.Screen name="add-pg" options={{ href: null }} />
      <Tabs.Screen name="property/[id]" options={{ href: null }} />
    </Tabs>
  );
}
