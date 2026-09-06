/**
 * SearchBar — either a live input (onChangeText) or a tappable "fake" bar that
 * navigates to the search screen (onPress + readOnly). Built on <Surface /> so it
 * carries the same hard shadow as cards.
 */

import React from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import Surface from './Surface';
import Icon from './Icon';
import { colors, radius as R, spacing, typography } from '@/theme';

export default function SearchBar({
  value,
  onChangeText,
  placeholder = 'Search locality or PG name',
  onPress,
  readOnly = false,
  autoFocus = false,
  onClear,
  onSubmitEditing,
  trailing,
  style,
}) {
  const body = (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        paddingHorizontal: 16,
        height: 54,
        backgroundColor: colors.surface,
      }}
    >
      <Icon name="magnify" size={22} color={colors.ink} />
      {readOnly ? (
        <Text style={{ flex: 1, fontSize: typography.bodyLg, fontWeight: typography.medium, color: colors.inkFaint }}>
          {placeholder}
        </Text>
      ) : (
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.inkFaint}
          autoFocus={autoFocus}
          returnKeyType="search"
          onSubmitEditing={onSubmitEditing}
          style={{ flex: 1, fontSize: typography.bodyLg, fontWeight: typography.medium, color: colors.ink }}
        />
      )}
      {value ? (
        <Pressable onPress={onClear} hitSlop={10} accessibilityLabel="Clear search">
          <Icon name="close-circle" size={20} color={colors.inkFaint} />
        </Pressable>
      ) : null}
      {trailing}
    </View>
  );

  return (
    <Surface
      onPress={readOnly ? onPress : undefined}
      offset={4}
      radius={R.pill}
      style={style}
      accessibilityLabel="Search"
      accessibilityRole={readOnly ? 'button' : 'search'}
    >
      {body}
    </Surface>
  );
}
