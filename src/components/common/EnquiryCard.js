/**
 * EnquiryCard — one enquiry, rendered from either side.
 *  - mode="consumer": "you enquired about {pg}", status = your request state.
 *  - mode="seller":   "{person} enquired about your {pg}", with their contact.
 */

import React, { memo } from 'react';
import { Text, View } from 'react-native';
import Surface from './Surface';
import Badge from './Badge';
import Avatar from './Avatar';
import Icon from './Icon';
import { LEAD_STATUS_MAP, ROOM_TYPE_MAP } from '@/constants';
import { formatMoney, formatDate } from '@/utils';
import { colors, radius as R, spacing, typography } from '@/theme';

// How the tenant sees the state of their own enquiry.
const CONSUMER_STATUS = {
  NEW: { label: 'Awaiting response', tone: 'lemon' },
  CONTACTED: { label: 'Owner responded', tone: 'skyBg' },
  INTERESTED: { label: 'In discussion', tone: 'lilac' },
  CONVERTED: { label: 'Converted', tone: 'mintBg' },
  CLOSED: { label: 'Closed', tone: 'surfaceAlt' },
};

function InfoBit({ icon, text }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      <Icon name={icon} size={13} color={colors.inkSoft} />
      <Text style={{ fontSize: typography.caption, fontWeight: typography.medium, color: colors.inkSoft }}>{text}</Text>
    </View>
  );
}

function EnquiryCardBase({ enquiry, mode = 'consumer', onPress }) {
  const seller = mode === 'seller';
  const status = seller
    ? LEAD_STATUS_MAP[enquiry.status] || LEAD_STATUS_MAP.NEW
    : CONSUMER_STATUS[enquiry.status] || CONSUMER_STATUS.NEW;
  const roomLabel = ROOM_TYPE_MAP[enquiry.roomType]?.label || enquiry.roomType;

  return (
    <Surface offset={4} radius={R.lg} style={{ marginBottom: spacing.lg }} onPress={onPress} accessibilityLabel={`Enquiry for ${enquiry.pgName}`}>
      <View style={{ padding: spacing.lg, gap: spacing.sm }}>
        {/* Header */}
        {seller ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
            <Avatar name={enquiry.name} size={44} tone="lilac" />
            <View style={{ flex: 1 }}>
              <Text numberOfLines={1} style={{ fontSize: typography.bodyLg, fontWeight: typography.heavy, color: colors.ink }}>{enquiry.name || 'Prospect'}</Text>
              <Text style={{ fontSize: typography.caption, fontWeight: typography.medium, color: colors.inkSoft }}>{enquiry.phone || 'No phone'}</Text>
            </View>
            <Badge label={status.label} tone={status.tone} small />
          </View>
        ) : (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
            <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: colors.lilac, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="home-city" size={22} color={colors.ink} />
            </View>
            <View style={{ flex: 1 }}>
              <Text numberOfLines={1} style={{ fontSize: typography.bodyLg, fontWeight: typography.heavy, color: colors.ink }}>{enquiry.pgName}</Text>
              <Text style={{ fontSize: typography.caption, fontWeight: typography.medium, color: colors.inkSoft }}>Enquiry sent</Text>
            </View>
            <Badge label={status.label} tone={status.tone} small />
          </View>
        )}

        {seller ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Icon name="home-city" size={13} color={colors.inkSoft} />
            <Text numberOfLines={1} style={{ fontSize: typography.caption, fontWeight: typography.semibold, color: colors.inkSoft }}>{enquiry.pgName}</Text>
          </View>
        ) : null}

        {/* Intent */}
        <View style={{ backgroundColor: colors.surfaceAlt, borderRadius: R.md, padding: spacing.md, gap: 6 }}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.lg }}>
            {enquiry.roomType ? <InfoBit icon="bed" text={roomLabel} /> : null}
            {enquiry.budget ? <InfoBit icon="wallet" text={`${formatMoney(enquiry.budget)}/mo`} /> : null}
            {enquiry.moveInDate ? <InfoBit icon="calendar" text={formatDate(enquiry.moveInDate)} /> : null}
          </View>
          {enquiry.message ? (
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 6 }}>
              <Icon name="message-text" size={14} color={colors.inkSoft} />
              <Text style={{ flex: 1, fontSize: typography.caption, fontStyle: 'italic', color: colors.inkSoft }}>“{enquiry.message}”</Text>
            </View>
          ) : null}
        </View>

        {enquiry.createdAt ? (
          <Text style={{ fontSize: typography.micro, fontWeight: typography.semibold, color: colors.inkFaint }}>Sent {formatDate(enquiry.createdAt)}</Text>
        ) : null}
      </View>
    </Surface>
  );
}

export default memo(EnquiryCardBase);
