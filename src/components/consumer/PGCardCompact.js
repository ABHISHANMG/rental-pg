/**
 * PGCardCompact — fixed-width card for horizontal carousels (Recommended, Nearby).
 */

import React, { memo } from 'react';
import { Image, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import Surface from '@/components/common/Surface';
import Badge from '@/components/common/Badge';
import Rating from '@/components/common/Rating';
import Icon from '@/components/common/Icon';
import FavoriteButton from './FavoriteButton';
import { formatMoney, getAvailableBeds, getHeadlineRoom } from '@/utils';
import { colors, radius as R, spacing, typography } from '@/theme';

const WIDTH = 250;

function PGCardCompactBase({ pg }) {
  const router = useRouter();
  const room = getHeadlineRoom(pg);
  const available = getAvailableBeds(pg);

  return (
    <Surface onPress={() => router.push(`/pg/${pg.id}`)} offset={4} radius={R.lg} style={{ width: WIDTH }} accessibilityLabel={pg.name}>
      <View>
        <Image source={{ uri: pg.images[0] }} style={{ width: '100%', height: 130, backgroundColor: colors.surfaceSunken }} resizeMode="cover" />
        <View style={{ position: 'absolute', top: spacing.sm, left: spacing.sm }}>
          {pg.isVerified ? <Badge label="Verified" tone="mintBg" icon="check-decagram" small /> : null}
        </View>
        <View style={{ position: 'absolute', top: spacing.sm, right: spacing.sm }}>
          <FavoriteButton pgId={pg.id} size={16} />
        </View>
      </View>
      <View style={{ padding: spacing.md, gap: 4 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text numberOfLines={1} style={{ flex: 1, fontSize: typography.body, fontWeight: typography.heavy, color: colors.ink }}>
            {pg.name}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
          <Icon name="map-marker" size={12} color={colors.inkSoft} />
          <Text numberOfLines={1} style={{ flex: 1, fontSize: typography.micro, fontWeight: typography.medium, color: colors.inkSoft }}>
            {pg.address.locality}, {pg.address.city}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 }}>
          <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
            <Text style={{ fontSize: typography.h3, fontWeight: typography.heavy, color: colors.ink }}>{formatMoney(room?.monthlyRent)}</Text>
            <Text style={{ fontSize: typography.micro, fontWeight: typography.semibold, color: colors.inkSoft }}> /mo</Text>
          </View>
          <Rating value={pg.rating} showCount={false} size={12} />
        </View>
        {available > 0 ? (
          <Text style={{ fontSize: typography.micro, fontWeight: typography.bold, color: colors.mint }}>{available} beds available</Text>
        ) : (
          <Text style={{ fontSize: typography.micro, fontWeight: typography.bold, color: colors.inkFaint }}>Fully occupied</Text>
        )}
      </View>
    </Surface>
  );
}

export default memo(PGCardCompactBase);
