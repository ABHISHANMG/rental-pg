/**
 * LeadCard — a prospective tenant on the seller Leads screen. Shows contact + intent
 * and the current lead status; tapping opens the status updater in the parent screen.
 */

import React, { memo } from 'react';
import { Text, View } from 'react-native';
import Surface from '@/components/common/Surface';
import Badge from '@/components/common/Badge';
import Avatar from '@/components/common/Avatar';
import Icon from '@/components/common/Icon';
import { LEAD_STATUS_MAP, ROOM_TYPE_MAP } from '@/constants';
import { formatMoney, formatDate } from '@/utils';
import { colors, radius as R, spacing, typography } from '@/theme';

function InfoBit({ icon, text }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      <Icon name={icon} size={13} color={colors.inkSoft} />
      <Text style={{ fontSize: typography.caption, fontWeight: typography.medium, color: colors.inkSoft }}>{text}</Text>
    </View>
  );
}

function LeadCardBase({ lead, onPress }) {
  const status = LEAD_STATUS_MAP[lead.status] || LEAD_STATUS_MAP.NEW;
  return (
    <Surface onPress={onPress} offset={4} radius={R.lg} style={{ marginBottom: spacing.lg }} accessibilityLabel={`Lead ${lead.name}`}>
      <View style={{ padding: spacing.lg, gap: spacing.sm }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          <Avatar name={lead.name} size={44} tone="lilac" />
          <View style={{ flex: 1 }}>
            <Text numberOfLines={1} style={{ fontSize: typography.bodyLg, fontWeight: typography.heavy, color: colors.ink }}>{lead.name}</Text>
            <Text style={{ fontSize: typography.caption, fontWeight: typography.medium, color: colors.inkSoft }}>{lead.phone}</Text>
          </View>
          <Badge label={status.label} tone={status.tone} small />
        </View>

        <View style={{ backgroundColor: colors.surfaceAlt, borderRadius: R.md, padding: spacing.md, gap: 6 }}>
          <InfoBit icon="home-city" text={lead.pgName} />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.lg }}>
            <InfoBit icon="bed" text={ROOM_TYPE_MAP[lead.roomType]?.label || lead.roomType} />
            <InfoBit icon="wallet" text={`${formatMoney(lead.budget)}/mo`} />
            <InfoBit icon="calendar" text={formatDate(lead.moveInDate)} />
          </View>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: typography.micro, fontWeight: typography.semibold, color: colors.inkFaint }}>
            {lead.lastContacted ? `Last contacted ${formatDate(lead.lastContacted)}` : 'Not contacted yet'}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Text style={{ fontSize: typography.caption, fontWeight: typography.bold, color: colors.primary }}>Update</Text>
            <Icon name="chevron-right" size={16} color={colors.primary} />
          </View>
        </View>
      </View>
    </Surface>
  );
}

export default memo(LeadCardBase);
