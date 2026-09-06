/**
 * PGCard — the marketplace's core list item. Entire card is tappable → PG details.
 * Shows cover image, verified badge, favorite toggle, name, locality, rating,
 * headline price + room type, an amenity strip and an availability indicator.
 *
 * Memoized + lightweight so it stays smooth inside FlatLists.
 */

import React, { memo } from 'react';
import { Image, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import Surface from '@/components/common/Surface';
import Badge from '@/components/common/Badge';
import Rating from '@/components/common/Rating';
import Icon from '@/components/common/Icon';
import FavoriteButton from './FavoriteButton';
import AmenityRow from './AmenityRow';
import { GENDER_MAP, ROOM_TYPE_MAP } from '@/constants';
import { formatMoney, getAvailableBeds, getHeadlineRoom } from '@/utils';
import { colors, radius as R, spacing, typography } from '@/theme';

function PGCardBase({ pg }) {
  const router = useRouter();
  const room = getHeadlineRoom(pg);
  const available = getAvailableBeds(pg);
  const gender = GENDER_MAP[pg.gender];

  return (
    <Surface
      onPress={() => router.push(`/pg/${pg.id}`)}
      offset={5}
      radius={R.xl}
      style={{ marginBottom: spacing.lg }}
      accessibilityLabel={`${pg.name}, ${pg.address.locality}`}
    >
      {/* Cover image + overlays */}
      <View>
        <Image source={{ uri: pg.images[0] }} style={{ width: '100%', height: 184, backgroundColor: colors.surfaceSunken }} resizeMode="cover" />

        <View style={{ position: 'absolute', top: spacing.md, left: spacing.md, flexDirection: 'row', gap: 6 }}>
          {pg.isVerified ? <Badge label="Verified" tone="mintBg" icon="check-decagram" small /> : null}
          {gender ? <Badge label={gender.label} tone="lilac" icon={gender.icon} small /> : null}
        </View>

        <View style={{ position: 'absolute', top: spacing.md, right: spacing.md }}>
          <FavoriteButton pgId={pg.id} size={20} />
        </View>

        {/* availability indicator */}
        <View style={{ position: 'absolute', bottom: spacing.md, left: spacing.md }}>
          {available > 0 ? (
            <Badge label={`${available} beds available`} tone="accent" icon="bed" small />
          ) : (
            <Badge label="Fully occupied" tone="surfaceAlt" icon="bed-empty" small />
          )}
        </View>
      </View>

      {/* Body */}
      <View style={{ padding: spacing.lg, gap: 6 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm }}>
          <Text numberOfLines={1} style={{ flex: 1, fontSize: typography.h3, fontWeight: typography.heavy, color: colors.ink }}>
            {pg.name}
          </Text>
          <Rating value={pg.rating} count={pg.reviewCount} showCount={false} />
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Icon name="map-marker" size={14} color={colors.inkSoft} />
          <Text numberOfLines={1} style={{ flex: 1, fontSize: typography.caption, fontWeight: typography.medium, color: colors.inkSoft }}>
            {pg.address.locality}, {pg.address.city}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: spacing.xs }}>
          <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
            <Text style={{ fontSize: typography.h2, fontWeight: typography.heavy, color: colors.ink, letterSpacing: -0.4 }}>
              {formatMoney(room?.monthlyRent)}
            </Text>
            <Text style={{ fontSize: typography.caption, fontWeight: typography.semibold, color: colors.inkSoft }}> /mo</Text>
          </View>
          {room ? (
            <View style={{ backgroundColor: colors.lemon, borderWidth: 1, borderColor: colors.border, borderRadius: R.pill, paddingHorizontal: 10, paddingVertical: 3 }}>
              <Text style={{ fontSize: typography.micro, fontWeight: typography.bold, color: colors.ink }}>
                {ROOM_TYPE_MAP[room.roomType]?.label || room.roomType}
              </Text>
            </View>
          ) : null}
        </View>

        <AmenityRow amenities={pg.amenities} max={3} style={{ marginTop: spacing.xs }} />
      </View>
    </Surface>
  );
}

const PGCard = memo(PGCardBase);
export default PGCard;
