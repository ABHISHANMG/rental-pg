/**
 * EmptyState / ErrorState / LoadingState — the three non-success list states.
 * Consistent icon-in-a-neo-box + title + message + optional action across the app.
 */

import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import Icon from './Icon';
import Button from './Button';
import { colors, radius as R, spacing, typography } from '@/theme';

function Frame({ children, style }) {
  return (
    <View style={[{ alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.huge, paddingHorizontal: spacing.xl, gap: spacing.md }, style]}>
      {children}
    </View>
  );
}

function IconBadge({ icon, tone = 'lilac', color = colors.ink }) {
  return (
    <View
      style={{
        width: 74,
        height: 74,
        borderRadius: R.xl,
        backgroundColor: colors[tone] || colors.lilac,
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Icon name={icon} size={34} color={color} />
    </View>
  );
}

export function EmptyState({ icon = 'magnify-close', title = 'Nothing here yet', message, actionLabel, onAction, tone = 'lilac', style }) {
  return (
    <Frame style={style}>
      <IconBadge icon={icon} tone={tone} />
      <Text style={{ fontSize: typography.h3, fontWeight: typography.heavy, color: colors.ink, textAlign: 'center' }}>{title}</Text>
      {message ? (
        <Text style={{ fontSize: typography.body, color: colors.inkSoft, textAlign: 'center', lineHeight: 21, maxWidth: 300 }}>
          {message}
        </Text>
      ) : null}
      {actionLabel ? <Button title={actionLabel} onPress={onAction} variant="ink" size="sm" style={{ marginTop: spacing.sm }} /> : null}
    </Frame>
  );
}

export function ErrorState({ title = 'Something went wrong', message = 'Please check your connection and try again.', onRetry, style }) {
  return (
    <Frame style={style}>
      <IconBadge icon="wifi-off" tone="peach" color={colors.danger} />
      <Text style={{ fontSize: typography.h3, fontWeight: typography.heavy, color: colors.ink, textAlign: 'center' }}>{title}</Text>
      <Text style={{ fontSize: typography.body, color: colors.inkSoft, textAlign: 'center', lineHeight: 21, maxWidth: 300 }}>{message}</Text>
      {onRetry ? <Button title="Try again" icon="refresh" onPress={onRetry} variant="ink" size="sm" style={{ marginTop: spacing.sm }} /> : null}
    </Frame>
  );
}

export function LoadingState({ message = 'Loading…', style }) {
  return (
    <Frame style={style}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={{ fontSize: typography.body, color: colors.inkSoft, fontWeight: typography.semibold }}>{message}</Text>
    </Frame>
  );
}
