/**
 * ReviewSheet — leave a star rating + written feedback for a PG. Anonymous-friendly
 * (name optional). Submits via the reviews service and shows an inline thank-you.
 */

import React, { useState } from 'react';
import { Text, View } from 'react-native';
import BottomSheet from '@/components/common/BottomSheet';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import Icon from '@/components/common/Icon';
import StarInput from '@/components/common/StarInput';
import { addReview } from '@/services/reviews.service';
import { colors, radius as R, spacing, typography } from '@/theme';

const RATING_WORDS = ['', 'Poor', 'Fair', 'Good', 'Very good', 'Excellent'];

export default function ReviewSheet({ visible, onClose, pg, onSubmitted }) {
  const [rating, setRating] = useState(0);
  const [name, setName] = useState('');
  const [comment, setComment] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const reset = () => {
    setRating(0);
    setName('');
    setComment('');
    setErrors({});
    setDone(false);
  };
  const close = () => {
    onClose();
    setTimeout(reset, 250);
  };

  const submit = async () => {
    const e = {};
    if (rating < 1) e.rating = 'Please tap to rate';
    if (comment.trim().length < 3) e.comment = 'Add a few words of feedback';
    setErrors(e);
    if (Object.keys(e).length) return;

    setLoading(true);
    try {
      await addReview(pg.id, { name, rating, comment });
      onSubmitted?.();
      setDone(true);
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <BottomSheet visible={visible} onClose={close}>
        <View style={{ alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xl }}>
          <View style={{ width: 76, height: 76, borderRadius: R.xl, backgroundColor: colors.lemon, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="star" size={38} color={colors.accent} />
          </View>
          <Text style={{ fontSize: typography.h2, fontWeight: typography.heavy, color: colors.ink, textAlign: 'center' }}>Thanks for your review!</Text>
          <Text style={{ fontSize: typography.body, color: colors.inkSoft, textAlign: 'center', lineHeight: 21, maxWidth: 280 }}>
            Your feedback helps other tenants find the right PG.
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
      title="Rate this PG"
      footer={<Button title="Submit review" icon="send" iconRight loading={loading} onPress={submit} fullWidth />}
    >
      <Text style={{ fontSize: typography.body, color: colors.inkSoft, marginBottom: spacing.lg }}>
        How was your experience at <Text style={{ fontWeight: typography.bold, color: colors.ink }}>{pg?.name}</Text>?
      </Text>

      <View style={{ alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xl }}>
        <StarInput value={rating} onChange={setRating} size={40} />
        <Text style={{ fontSize: typography.caption, fontWeight: typography.bold, color: rating ? colors.ink : colors.danger }}>
          {rating ? RATING_WORDS[rating] : errors.rating || 'Tap to rate'}
        </Text>
      </View>

      <Input label="Your feedback" placeholder="Share what you liked or what could be better…" multiline value={comment} onChangeText={setComment} maxLength={400} error={errors.comment} style={{ marginBottom: spacing.lg }} />
      <Input label="Your name (optional)" icon="account" autoCapitalize="words" placeholder="Anonymous" value={name} onChangeText={setName} />
    </BottomSheet>
  );
}
