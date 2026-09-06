/**
 * Surface — the core card/pressable primitive.
 *
 * Soft, minimal style: a subtle hairline border and a gentle blurred shadow (no hard
 * offset block). When `onPress` is supplied it dims slightly on press.
 *
 * The `offset`/`shadowColor` props are kept for API compatibility with existing call
 * sites; `offset === 0` (or a transparent background) renders a flat, shadowless surface.
 */

import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { colors, radius as R } from '@/theme';

export default function Surface({
  children,
  offset = 5,
  radius = R.lg,
  bordered = true,
  borderColor = colors.border,
  borderWidth = 1,
  background = colors.surface,
  shadowColor, // eslint-disable-line no-unused-vars -- kept for API compatibility
  onPress,
  onLongPress,
  disabled = false,
  style,
  contentStyle,
  hitSlop,
  accessibilityLabel,
  accessibilityRole,
  ...rest
}) {
  const [pressed, setPressed] = useState(false);
  const pressable = !!onPress || !!onLongPress;
  const showShadow = offset > 0 && background !== 'transparent';

  const cardStyle = {
    borderRadius: radius,
    borderWidth: bordered ? borderWidth : 0,
    borderColor,
    backgroundColor: background,
  };
  if (showShadow) {
    Object.assign(cardStyle, {
      shadowColor: '#1A1712',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.1,
      shadowRadius: 16,
      elevation: 4,
    });
  }

  const card = (
    <View style={cardStyle}>
      <View style={[{ borderRadius: radius, overflow: 'hidden' }, contentStyle]}>{children}</View>
    </View>
  );

  if (!pressable) return <View style={style}>{card}</View>;

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      disabled={disabled}
      hitSlop={hitSlop}
      accessibilityRole={accessibilityRole || 'button'}
      accessibilityLabel={accessibilityLabel}
      style={[{ opacity: disabled ? 0.5 : pressed ? 0.9 : 1 }, style]}
      {...rest}
    >
      {card}
    </Pressable>
  );
}
