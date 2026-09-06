/**
 * ConfirmDialog — centered, Soft Neo-Brutalist modal that replaces the native Alert.
 *
 * Two modes:
 *  - mode="confirm" (default): Cancel + Confirm buttons (destructive when tone="danger").
 *  - mode="alert": a single acknowledge button (for info / success / validation messages).
 *
 * Backdrop tap or Cancel dismisses.
 */

import React from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import Icon from './Icon';
import Button from './Button';
import { colors, radius as R, spacing, typography } from '@/theme';

export default function ConfirmDialog({
  visible,
  onClose,
  onConfirm,
  title,
  message,
  icon,
  tone = 'danger', // 'danger' | 'primary' | 'success'
  mode = 'confirm', // 'confirm' | 'alert'
  confirmLabel,
  cancelLabel = 'Cancel',
  loading = false,
}) {
  const toneMap = {
    danger: { badge: 'peach', color: colors.danger, btn: 'danger', icon: 'alert' },
    primary: { badge: 'lilac', color: colors.primary, btn: 'primary', icon: 'information' },
    success: { badge: 'mintBg', color: colors.mint, btn: 'primary', icon: 'check-bold' },
  };
  const t = toneMap[tone] || toneMap.primary;
  const isAlert = mode === 'alert';
  const cLabel = confirmLabel || (isAlert ? 'Got it' : 'Confirm');

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl }}>
        <Pressable
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: colors.overlay }}
          onPress={onClose}
          accessibilityLabel="Dismiss"
        />

        <View
          style={{
            width: '100%',
            maxWidth: 380,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: R.xxl,
            padding: spacing.xl,
            gap: spacing.md,
            alignItems: 'center',
            shadowColor: colors.ink,
            shadowOffset: { width: 0, height: 7 },
            shadowOpacity: 0.12,
            shadowRadius: 16,
            elevation: 10,
          }}
        >
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: R.xl,
              backgroundColor: colors[t.badge],
              borderWidth: 1,
              borderColor: colors.border,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name={icon || t.icon} size={32} color={t.color} />
          </View>

          <Text style={{ fontSize: typography.h2, fontWeight: typography.heavy, color: colors.ink, textAlign: 'center' }}>{title}</Text>
          {message ? (
            <Text style={{ fontSize: typography.body, color: colors.inkSoft, textAlign: 'center', lineHeight: 21 }}>{message}</Text>
          ) : null}

          <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm, alignSelf: 'stretch' }}>
            {!isAlert ? <Button title={cancelLabel} variant="surface" onPress={onClose} style={{ flex: 1 }} /> : null}
            <Button title={cLabel} variant={t.btn} loading={loading} onPress={onConfirm || onClose} style={{ flex: 1 }} />
          </View>
        </View>
      </View>
    </Modal>
  );
}
