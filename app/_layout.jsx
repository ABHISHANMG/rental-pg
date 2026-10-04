import 'react-native-gesture-handler';
import React from 'react';
import { Platform, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { colors } from '@/theme';

// On web the app is still a phone-first UI, so keep it in a centered mobile-width column
// instead of stretching edge-to-edge like a desktop site.
const MOBILE_FRAME_WIDTH = 440;
const isWeb = Platform.OS === 'web';

/**
 * Root layout. Wraps the whole app in gesture + safe-area providers and defines the
 * top-level stack. Groups: (auth) and (consumer); shared routes: pg/[id].
 */
export default function RootLayout() {
  const stack = (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bg },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(consumer)" />
      <Stack.Screen name="(seller)" />
      <Stack.Screen name="pg/[id]" options={{ animation: 'slide_from_bottom' }} />
    </Stack>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: isWeb ? colors.surfaceSunken : colors.bg }}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        {isWeb ? (
          <View style={{ flex: 1, alignItems: 'center', backgroundColor: colors.surfaceSunken }}>
            <View
              style={{
                flex: 1,
                width: '100%',
                maxWidth: MOBILE_FRAME_WIDTH,
                backgroundColor: colors.bg,
                borderLeftWidth: 1,
                borderRightWidth: 1,
                borderColor: colors.border,
                overflow: 'hidden',
              }}
            >
              {stack}
            </View>
          </View>
        ) : (
          stack
        )}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
