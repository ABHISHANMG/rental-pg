/**
 * EnquirySheet (Requirement §15). Since consumers aren't signed in, the form collects
 * their name + phone so the owner can reach back, along with move-in timing, budget,
 * room preference and a message. Submits via the booking service, then shows an inline
 * success state.
 */

import React, { useState } from 'react';
import { Text, View } from 'react-native';
import BottomSheet from '@/components/common/BottomSheet';
import Chip from '@/components/common/Chip';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import Icon from '@/components/common/Icon';
import { ROOM_TYPES } from '@/constants';
import { createEnquiry } from '@/services/booking.service';
import { colors, radius as R, spacing, typography } from '@/theme';

const MOVE_IN_OPTIONS = [
  { key: 'now', label: 'Immediately', days: 0 },
  { key: '15d', label: 'In 15 days', days: 15 },
  { key: '1m', label: 'Next month', days: 30 },
  { key: 'flex', label: 'Flexible', days: 45 },
];

function isoAfterDays(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

export default function EnquirySheet({ visible, onClose, pg }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [moveIn, setMoveIn] = useState('now');
  const [budget, setBudget] = useState('');
  const [roomPref, setRoomPref] = useState(null);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const reset = () => {
    setName('');
    setPhone('');
    setMoveIn('now');
    setBudget('');
    setRoomPref(null);
    setMessage('');
    setErrors({});
    setDone(false);
  };

  const close = () => {
    onClose();
    setTimeout(reset, 250);
  };

  const submit = async () => {
    const e = {};
    if (name.trim().length < 2) e.name = 'Please enter your name';
    if (phone.replace(/\D/g, '').length !== 10) e.phone = 'Enter a valid 10-digit number';
    setErrors(e);
    if (Object.keys(e).length) return;

    setLoading(true);
    try {
      const opt = MOVE_IN_OPTIONS.find((o) => o.key === moveIn);
      await createEnquiry({
        pgId: pg.id,
        pgName: pg.name,
        name: name.trim(),
        phone: `+91 ${phone}`,
        moveInDate: isoAfterDays(opt?.days ?? 0),
        budget: budget ? Number(budget) : undefined,
        roomType: roomPref,
        message: message.trim(),
      });
      setDone(true);
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <BottomSheet visible={visible} onClose={close}>
        <View style={{ alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xl }}>
          <View style={{ width: 76, height: 76, borderRadius: R.xl, backgroundColor: colors.mintBg, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="check-bold" size={38} color={colors.ink} />
          </View>
          <Text style={{ fontSize: typography.h2, fontWeight: typography.heavy, color: colors.ink, textAlign: 'center' }}>Enquiry sent!</Text>
          <Text style={{ fontSize: typography.body, color: colors.inkSoft, textAlign: 'center', lineHeight: 21, maxWidth: 280 }}>
            The owner of {pg.name} will contact you on the number you shared.
          </Text>
          <Button title="Done" variant="ink" onPress={close} fullWidth style={{ marginTop: spacing.md }} />
        </View>
      </BottomSheet>
    );
  }

  return (
    <BottomSheet
      visible={visible}
      onClose={close}
      title="Send enquiry"
      footer={<Button title="Send enquiry" icon="send" iconRight loading={loading} onPress={submit} fullWidth />}
    >
      <Text style={{ fontSize: typography.body, color: colors.inkSoft, marginBottom: spacing.lg }}>
        I'm interested in <Text style={{ fontWeight: typography.bold, color: colors.ink }}>{pg?.name}</Text>. Share your details and the owner will reach out.
      </Text>

      <View style={{ gap: spacing.lg, marginBottom: spacing.lg }}>
        <Input label="Your name" icon="account" autoCapitalize="words" placeholder="Aarav Sharma" value={name} onChangeText={setName} error={errors.name} />
        <Input label="Mobile number" icon="phone" keyboardType="number-pad" placeholder="98765 43210" maxLength={10} value={phone} onChangeText={(t) => setPhone(t.replace(/\D/g, ''))} error={errors.phone} helper="+91 · India" />
      </View>

      <Text style={{ fontSize: typography.caption, fontWeight: typography.bold, color: colors.ink, marginBottom: spacing.sm }}>Preferred move-in</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg }}>
        {MOVE_IN_OPTIONS.map((o) => (
          <Chip key={o.key} label={o.label} selected={moveIn === o.key} onPress={() => setMoveIn(o.key)} />
        ))}
      </View>

      <Input label="Budget (₹ / month)" icon="wallet" keyboardType="number-pad" placeholder="10000" value={budget} onChangeText={(t) => setBudget(t.replace(/\D/g, ''))} style={{ marginBottom: spacing.lg }} />

      <Text style={{ fontSize: typography.caption, fontWeight: typography.bold, color: colors.ink, marginBottom: spacing.sm }}>Room preference</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg }}>
        {ROOM_TYPES.map((r) => (
          <Chip key={r.key} label={r.label} selected={roomPref === r.key} onPress={() => setRoomPref(roomPref === r.key ? null : r.key)} />
        ))}
      </View>

      <Input label="Message (optional)" placeholder="Any specific requirements?" multiline value={message} onChangeText={setMessage} maxLength={300} />
    </BottomSheet>
  );
}
