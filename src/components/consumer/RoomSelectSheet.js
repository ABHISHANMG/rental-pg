/**
 * RoomSelectSheet (Requirements §13, §16). Two steps: pick an available room, then set
 * move-in timing + duration and confirm. Creates a PENDING booking request via the
 * service and shows an inline confirmation. No payment in this milestone.
 */

import React, { useState } from 'react';
import { Text, View } from 'react-native';
import BottomSheet from '@/components/common/BottomSheet';
import Chip from '@/components/common/Chip';
import Button from '@/components/common/Button';
import Icon from '@/components/common/Icon';
import Surface from '@/components/common/Surface';
import { ROOM_TYPE_MAP } from '@/constants';
import { createBooking } from '@/services/booking.service';
import { useAuthStore } from '@/store/auth.store';
import { formatMoney } from '@/utils';
import { colors, radius as R, spacing, typography } from '@/theme';

const MOVE_IN = [
  { key: 'now', label: 'Immediately', days: 0 },
  { key: '15d', label: 'In 15 days', days: 15 },
  { key: '1m', label: 'Next month', days: 30 },
];
const DURATIONS = [
  { key: 3, label: '3 months' },
  { key: 6, label: '6 months' },
  { key: 11, label: '11 months' },
];

function isoAfterDays(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

function RoomOption({ room, onSelect }) {
  const meta = ROOM_TYPE_MAP[room.roomType];
  const soldOut = room.availableBeds <= 0;
  return (
    <Surface offset={3} radius={R.lg} style={{ marginBottom: spacing.md }}>
      <View style={{ padding: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: typography.h3, fontWeight: typography.heavy, color: colors.ink }}>{meta?.label || room.roomType}{room.floor ? ` · Floor ${room.floor}` : ''}</Text>
          <Text style={{ fontSize: typography.body, fontWeight: typography.bold, color: colors.ink, marginTop: 2 }}>
            {formatMoney(room.monthlyRent)}<Text style={{ fontSize: typography.caption, color: colors.inkSoft, fontWeight: typography.semibold }}> /month</Text>
          </Text>
          <Text style={{ fontSize: typography.caption, fontWeight: typography.bold, color: soldOut ? colors.inkFaint : colors.mint, marginTop: 3 }}>
            {soldOut ? 'Fully occupied' : `${room.availableBeds} beds available`}
          </Text>
        </View>
        <Button title={soldOut ? 'Full' : 'Select'} size="sm" variant={soldOut ? 'surface' : 'ink'} disabled={soldOut} onPress={() => onSelect(room)} />
      </View>
    </Surface>
  );
}

export default function RoomSelectSheet({ visible, onClose, pg }) {
  const user = useAuthStore((s) => s.user);
  const [step, setStep] = useState('rooms'); // 'rooms' | 'details' | 'done'
  const [room, setRoom] = useState(null);
  const [moveIn, setMoveIn] = useState('now');
  const [duration, setDuration] = useState(6);
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setStep('rooms');
    setRoom(null);
    setMoveIn('now');
    setDuration(6);
  };
  const close = () => {
    onClose();
    setTimeout(reset, 250);
  };

  const confirm = async () => {
    setLoading(true);
    try {
      const opt = MOVE_IN.find((o) => o.key === moveIn);
      await createBooking({
        pgId: pg.id,
        pgName: pg.name,
        name: user?.name,
        phone: user?.phone,
        roomId: room.id,
        roomType: room.roomType,
        moveInDate: isoAfterDays(opt?.days ?? 0),
        durationMonths: duration,
        amount: room.monthlyRent + room.securityDeposit,
      });
      setStep('done');
    } finally {
      setLoading(false);
    }
  };

  // --- DONE ---------------------------------------------------------------
  if (step === 'done') {
    return (
      <BottomSheet visible={visible} onClose={close}>
        <View style={{ alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xl }}>
          <View style={{ width: 76, height: 76, borderRadius: R.xl, backgroundColor: colors.mintBg, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="calendar-check" size={38} color={colors.ink} />
          </View>
          <Text style={{ fontSize: typography.h2, fontWeight: typography.heavy, color: colors.ink, textAlign: 'center' }}>Booking requested!</Text>
          <Text style={{ fontSize: typography.body, color: colors.inkSoft, textAlign: 'center', lineHeight: 21, maxWidth: 300 }}>
            Your request for {ROOM_TYPE_MAP[room?.roomType]?.label || room?.roomType} at {pg.name} is pending owner approval. Track it under Bookings.
          </Text>
          <Button title="Done" variant="ink" onPress={close} fullWidth style={{ marginTop: spacing.md }} />
        </View>
      </BottomSheet>
    );
  }

  // --- DETAILS ------------------------------------------------------------
  if (step === 'details' && room) {
    const amount = room.monthlyRent + room.securityDeposit;
    return (
      <BottomSheet
        visible={visible}
        onClose={close}
        title="Booking details"
        footer={<Button title="Request booking" icon="arrow-right" iconRight loading={loading} onPress={confirm} fullWidth />}
      >
        <Chip label="← Change room" onPress={() => setStep('rooms')} style={{ alignSelf: 'flex-start', marginBottom: spacing.lg }} />

        <Surface offset={3} radius={R.lg} style={{ marginBottom: spacing.lg }} background={colors.lilac}>
          <View style={{ padding: spacing.lg, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={{ fontSize: typography.h3, fontWeight: typography.heavy, color: colors.ink }}>{ROOM_TYPE_MAP[room.roomType]?.label || room.roomType}</Text>
              <Text style={{ fontSize: typography.caption, fontWeight: typography.semibold, color: colors.inkSoft }}>{pg.name}</Text>
            </View>
            <Text style={{ fontSize: typography.h3, fontWeight: typography.heavy, color: colors.ink }}>{formatMoney(room.monthlyRent)}</Text>
          </View>
        </Surface>

        <Text style={{ fontSize: typography.caption, fontWeight: typography.bold, color: colors.ink, marginBottom: spacing.sm }}>Move-in</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg }}>
          {MOVE_IN.map((o) => (
            <Chip key={o.key} label={o.label} selected={moveIn === o.key} onPress={() => setMoveIn(o.key)} />
          ))}
        </View>

        <Text style={{ fontSize: typography.caption, fontWeight: typography.bold, color: colors.ink, marginBottom: spacing.sm }}>Duration</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.xl }}>
          {DURATIONS.map((o) => (
            <Chip key={o.key} label={o.label} selected={duration === o.key} onPress={() => setDuration(o.key)} />
          ))}
        </View>

        {/* Payable summary */}
        <View style={{ backgroundColor: colors.surfaceAlt, borderRadius: R.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, gap: spacing.sm }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: typography.body, color: colors.inkSoft }}>First month rent</Text>
            <Text style={{ fontSize: typography.body, fontWeight: typography.bold, color: colors.ink }}>{formatMoney(room.monthlyRent)}</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: typography.body, color: colors.inkSoft }}>Security deposit</Text>
            <Text style={{ fontSize: typography.body, fontWeight: typography.bold, color: colors.ink }}>{formatMoney(room.securityDeposit)}</Text>
          </View>
          <View style={{ height: 1, backgroundColor: colors.inkFaint, marginVertical: 2 }} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: typography.bodyLg, fontWeight: typography.heavy, color: colors.ink }}>Payable on move-in</Text>
            <Text style={{ fontSize: typography.bodyLg, fontWeight: typography.heavy, color: colors.ink }}>{formatMoney(amount)}</Text>
          </View>
        </View>
      </BottomSheet>
    );
  }

  // --- ROOMS --------------------------------------------------------------
  return (
    <BottomSheet visible={visible} onClose={close} title="Select your room">
      {(pg?.rooms || []).map((r) => (
        <RoomOption key={r.id} room={r} onSelect={(room) => { setRoom(room); setStep('details'); }} />
      ))}
    </BottomSheet>
  );
}
