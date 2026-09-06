/**
 * FavoriteButton — heart toggle wired to the favorites store. Self-contained so any
 * screen (card, details, gallery) can drop it in without prop-drilling the store.
 */

import React from 'react';
import { Pressable } from 'react-native';
import Icon from '@/components/common/Icon';
import { useFavoritesStore } from '@/store/favorites.store';
import { colors } from '@/theme';

export default function FavoriteButton({ pgId, size = 22, onToggle }) {
  const isFav = useFavoritesStore((s) => s.ids.includes(pgId));
  const toggle = useFavoritesStore((s) => s.toggle);

  return (
    <Pressable
      onPress={() => {
        toggle(pgId);
        onToggle?.(!isFav);
      }}
      hitSlop={10}
      accessibilityRole="button"
      accessibilityLabel={isFav ? 'Remove from favorites' : 'Add to favorites'}
      accessibilityState={{ selected: isFav }}
      style={{
        width: size + 16,
        height: size + 16,
        borderRadius: (size + 16) / 2,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Icon name={isFav ? 'heart' : 'heart-outline'} size={size} color={isFav ? colors.coral : colors.ink} />
    </Pressable>
  );
}
