/**
 * BottomSheet — modal panel anchored to the bottom with a neo-brutalist top border,
 * drag handle, title row and an optional sticky footer. Backdrop tap closes it.
 *
 * Deliberately built on RN's <Modal> (no gesture dependency) for reliability; the
 * API (visible/onClose/footer) matches what a gesture-based sheet would expose.
 */

import React from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from './Icon';
import { colors, radius as R, spacing, typography } from '@/theme';

export default function BottomSheet({ visible, onClose, title, children, footer, maxHeightRatio = 0.85 }) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View style={{ flex: 1, justifyContent: 'flex-end' }}>
        <Pressable style={{ flex: 1, backgroundColor: colors.overlay }} onPress={onClose} accessibilityLabel="Close sheet" />
        <View
          style={{
            backgroundColor: colors.bg,
            borderTopLeftRadius: R.xxl,
            borderTopRightRadius: R.xxl,
            borderWidth: 1,
            borderColor: colors.border,
            maxHeight: `${maxHeightRatio * 100}%`,
            overflow: 'hidden',
          }}
        >
          {/* handle */}
          <View style={{ alignItems: 'center', paddingTop: spacing.md }}>
            <View style={{ width: 44, height: 5, borderRadius: 3, backgroundColor: colors.inkFaint }} />
          </View>

          {title ? (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: spacing.xl,
                paddingTop: spacing.md,
                paddingBottom: spacing.sm,
              }}
            >
              <Text style={{ fontSize: typography.h2, fontWeight: typography.heavy, color: colors.ink }}>{title}</Text>
              <Pressable onPress={onClose} hitSlop={12} accessibilityLabel="Close">
                <Icon name="close" size={26} color={colors.ink} />
              </Pressable>
            </View>
          ) : null}

          <ScrollView
            contentContainerStyle={{ paddingHorizontal: spacing.xl, paddingBottom: spacing.lg }}
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>

          {footer ? (
            <View
              style={{
                borderTopWidth: 1,
                borderTopColor: colors.border,
                backgroundColor: colors.surface,
                paddingHorizontal: spacing.xl,
                paddingTop: spacing.md,
                paddingBottom: Math.max(insets.bottom, spacing.md) + spacing.xs,
              }}
            >
              {footer}
            </View>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}
