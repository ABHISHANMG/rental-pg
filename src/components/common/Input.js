/**
 * Input — labeled text field with neo-brutalist border, focus + error states,
 * optional leading icon and helper/error text. Uses forwardRef so forms can focus it.
 */

import React, { forwardRef, useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import Icon from './Icon';
import { colors, inputVariants, radius as R, spacing, typography } from '@/theme';

const Input = forwardRef(function Input(
  {
    label,
    value,
    onChangeText,
    placeholder,
    error,
    helper,
    icon,
    keyboardType,
    autoCapitalize = 'none',
    secureTextEntry = false,
    multiline = false,
    maxLength,
    rightSlot,
    editable = true,
    style,
    onSubmitEditing,
    returnKeyType,
  },
  ref
) {
  const [focused, setFocused] = useState(false);
  const state = error ? 'error' : focused ? 'focused' : 'default';
  const v = inputVariants[state];

  return (
    <View style={[{ gap: 6 }, style]}>
      {label ? (
        <Text style={{ fontSize: typography.caption, fontWeight: typography.bold, color: colors.ink }}>
          {label}
        </Text>
      ) : null}
      <View
        style={{
          flexDirection: 'row',
          alignItems: multiline ? 'flex-start' : 'center',
          gap: spacing.sm,
          backgroundColor: v.bg,
          borderColor: v.border,
          borderWidth: 1,
          borderRadius: R.md,
          paddingHorizontal: 14,
          paddingVertical: multiline ? 12 : 0,
          minHeight: multiline ? 96 : 52,
          opacity: editable ? 1 : 0.6,
        }}
      >
        {icon ? <Icon name={icon} size={18} color={focused ? colors.primary : colors.inkSoft} style={{ marginTop: multiline ? 2 : 0 }} /> : null}
        <TextInput
          ref={ref}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={v.placeholder}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          secureTextEntry={secureTextEntry}
          multiline={multiline}
          maxLength={maxLength}
          editable={editable}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onSubmitEditing={onSubmitEditing}
          returnKeyType={returnKeyType}
          style={{
            flex: 1,
            fontSize: typography.bodyLg,
            fontWeight: typography.medium,
            color: colors.ink,
            paddingVertical: multiline ? 0 : 14,
            textAlignVertical: multiline ? 'top' : 'center',
          }}
        />
        {rightSlot}
      </View>
      {error ? (
        <Text style={{ fontSize: typography.caption, fontWeight: typography.semibold, color: colors.danger }}>
          {error}
        </Text>
      ) : helper ? (
        <Text style={{ fontSize: typography.caption, color: colors.inkSoft }}>{helper}</Text>
      ) : null}
    </View>
  );
});

export default Input;
