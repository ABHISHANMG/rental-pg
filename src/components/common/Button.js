/**
 * Button — neo-brutalist pressable built on <Surface />.
 * Variants come from theme.buttonVariants; sizes control height/typography.
 */

import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import Surface from './Surface';
import Icon from './Icon';
import { buttonVariants, colors, radius as R, spacing, typography } from '@/theme';

const SIZES = {
  sm: { height: 40, padH: 14, font: 14, iconSize: 16, offset: 3, radius: R.md },
  md: { height: 52, padH: 18, font: 16, iconSize: 18, offset: 4, radius: R.md },
  lg: { height: 58, padH: 22, font: 17, iconSize: 20, offset: 5, radius: R.lg },
};

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  icon, // MaterialCommunityIcons name
  iconRight = false,
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
}) {
  const v = buttonVariants[variant] || buttonVariants.primary;
  const s = SIZES[size] || SIZES.md;
  const isGhost = variant === 'ghost';
  const isDisabled = disabled || loading;

  const content = (
    <View
      style={{
        height: s.height,
        paddingHorizontal: s.padH,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        backgroundColor: v.bg,
      }}
    >
      {loading ? (
        <ActivityIndicator color={v.fg} />
      ) : (
        <>
          {icon && !iconRight && <Icon name={icon} size={s.iconSize} color={v.fg} />}
          <Text
            numberOfLines={1}
            style={{ color: v.fg, fontSize: s.font, fontWeight: typography.bold, letterSpacing: 0.2 }}
          >
            {title}
          </Text>
          {icon && iconRight && <Icon name={icon} size={s.iconSize} color={v.fg} />}
        </>
      )}
    </View>
  );

  // Ghost variant is flat (no shadow / border) — used for tertiary actions.
  if (isGhost) {
    return (
      <Surface
        onPress={isDisabled ? undefined : onPress}
        disabled={isDisabled}
        bordered={false}
        offset={0}
        radius={s.radius}
        background="transparent"
        style={[fullWidth && { alignSelf: 'stretch' }, style]}
      >
        {content}
      </Surface>
    );
  }

  return (
    <Surface
      onPress={isDisabled ? undefined : onPress}
      disabled={isDisabled}
      offset={s.offset}
      radius={s.radius}
      borderColor={v.border}
      background={v.bg}
      style={[fullWidth && { alignSelf: 'stretch' }, style]}
      accessibilityLabel={title}
    >
      {content}
    </Surface>
  );
}
