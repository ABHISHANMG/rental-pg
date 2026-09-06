/**
 * Consumer tab navigator with a custom Soft Neo-Brutalist tab bar:
 * a floating bordered bar; the active tab expands into an ink pill with its label.
 */

import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '@/components/common/Icon';
import { useFavoritesStore } from '@/store/favorites.store';
import { colors, radius as R, spacing, typography } from '@/theme';

const TAB_META = {
  home: { label: 'Home', icon: 'home-variant', iconOutline: 'home-variant-outline' },
  search: { label: 'Search', icon: 'magnify', iconOutline: 'magnify' },
  favorites: { label: 'Saved', icon: 'heart', iconOutline: 'heart-outline' },
};

function TabBar({ state, navigation }) {
  const insets = useSafeAreaInsets();
  const favCount = useFavoritesStore((s) => s.ids.length);

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
          // hard shadow
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

          const badge = route.name === 'favorites' ? favCount : 0;

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
                paddingHorizontal: focused ? 14 : 10,
                paddingVertical: 9,
                borderRadius: R.pill,
                backgroundColor: focused ? colors.ink : 'transparent',
              }}
            >
              <View>
                <Icon name={focused ? meta.icon : meta.iconOutline} size={22} color={focused ? colors.white : colors.inkSoft} />
                {badge > 0 && !focused ? (
                  <View
                    style={{
                      position: 'absolute',
                      top: -5,
                      right: -7,
                      minWidth: 16,
                      height: 16,
                      paddingHorizontal: 3,
                      borderRadius: 8,
                      backgroundColor: colors.coral,
                      borderWidth: 1,
                      borderColor: colors.border,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text style={{ fontSize: 9, fontWeight: typography.heavy, color: colors.white }}>{badge}</Text>
                  </View>
                ) : null}
              </View>
              {focused ? (
                <Text style={{ fontSize: typography.caption, fontWeight: typography.bold, color: colors.white }}>{meta.label}</Text>
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function ConsumerLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <TabBar {...props} />}>
      <Tabs.Screen name="home" />
      <Tabs.Screen name="search" />
      <Tabs.Screen name="favorites" />
    </Tabs>
  );
}
