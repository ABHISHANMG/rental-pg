/**
 * SellerBookingCard — a booking request on the owner side. Approve/Reject when the
 * request is still PENDING, otherwise shows the current status.
 */

import React, { memo } from 'react';
import { Text, View } from 'react-native';
import Surface from '@/components/common/Surface';
import Badge from '@/components/common/Badge';
import Avatar from '@/components/common/Avatar';
import Button from '@/components/common/Button';
import Icon from '@/components/common/Icon';
import { BOOKING_STATUS, ROOM_TYPE_MAP } from '@/constants';
import { formatMoney, formatDate } from '@/utils';
import { colors, radius as R, spacing, typography } from '@/theme';

function SellerBookingCardBase({ booking, onApprove, onReject }) {
  const meta = BOOKING_STATUS[booking.status] || BOOKING_STATUS.PENDING;
  const pending = booking.status === 'PENDING';

  return (
    <Surface offset={4} radius={R.lg} style={{ marginBottom: spacing.lg }}>
      <View style={{ padding: spacing.lg, gap: spacing.md }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          <Avatar name={booking.name} size={44} tone="lemon" />
          <View style={{ flex: 1 }}>
            <Text numberOfLines={1} style={{ fontSize: typography.bodyLg, fontWeight: typography.heavy, color: colors.ink }}>{booking.name}</Text>
            <Text numberOfLines={1} style={{ fontSize: typography.caption, fontWeight: typography.medium, color: colors.inkSoft }}>{booking.pgName}</Text>
          </View>
          <Badge label={meta.label} tone={meta.tone} small />
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.lg }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Icon name="bed" size={14} color={colors.inkSoft} />
            <Text style={{ fontSize: typography.caption, fontWeight: typography.medium, color: colors.inkSoft }}>{ROOM_TYPE_MAP[booking.roomType]?.label || booking.roomType}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Icon name="calendar" size={14} color={colors.inkSoft} />
            <Text style={{ fontSize: typography.caption, fontWeight: typography.medium, color: colors.inkSoft }}>{formatDate(booking.moveInDate)}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Icon name="cash" size={14} color={colors.inkSoft} />
            <Text style={{ fontSize: typography.caption, fontWeight: typography.bold, color: colors.ink }}>{formatMoney(booking.amount)}</Text>
          </View>
        </View>

        {pending ? (
          <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: 2 }}>
            <Button title="Reject" variant="surface" size="sm" icon="close" onPress={onReject} style={{ flex: 1 }} />
            <Button title="Approve" variant="primary" size="sm" icon="check" onPress={onApprove} style={{ flex: 1 }} />
          </View>
        ) : null}
      </View>
    </Surface>
  );
}

export default memo(SellerBookingCardBase);
