/**
 * FiltersSheet — the filter bottom sheet (Requirement §11). Edits a local draft and
 * only commits on Apply, so cancelling leaves the active filters untouched.
 */

import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import BottomSheet from '@/components/common/BottomSheet';
import Chip from '@/components/common/Chip';
import Button from '@/components/common/Button';
import { AMENITIES, GENDERS, PROPERTY_TYPES, ROOM_TYPES } from '@/constants';
import { countActiveFilters } from '@/services/pg.service';
import { colors, spacing, typography } from '@/theme';

const RENT_BRACKETS = [
  { label: 'Under ₹7k', min: undefined, max: 7000 },
  { label: '₹7k–10k', min: 7000, max: 10000 },
  { label: '₹10k–15k', min: 10000, max: 15000 },
  { label: '₹15k+', min: 15000, max: undefined },
];

function Group({ title, children }) {
  return (
    <View style={{ marginBottom: spacing.xl }}>
      <Text style={{ fontSize: typography.bodyStrong?.fontSize || 15, fontWeight: typography.bold, color: colors.ink, marginBottom: spacing.md }}>
        {title}
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>{children}</View>
    </View>
  );
}

export default function FiltersSheet({ visible, onClose, filters, onApply }) {
  const [draft, setDraft] = useState(filters || {});

  useEffect(() => {
    if (visible) setDraft(filters || {});
  }, [visible, filters]);

  const toggleArray = (key, value) =>
    setDraft((d) => {
      const arr = d[key] || [];
      const next = arr.includes(value) ? arr.filter((x) => x !== value) : [...arr, value];
      return { ...d, [key]: next.length ? next : undefined };
    });

  const setBracket = (b) =>
    setDraft((d) => {
      const active = d.minRent === b.min && d.maxRent === b.max;
      return { ...d, minRent: active ? undefined : b.min, maxRent: active ? undefined : b.max };
    });

  const activeCount = countActiveFilters(draft);

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="Filters"
      footer={
        <View style={{ flexDirection: 'row', gap: spacing.md }}>
          <Button title="Clear all" variant="surface" size="md" onPress={() => setDraft({})} style={{ flex: 1 }} />
          <Button
            title={activeCount ? `Apply · ${activeCount}` : 'Apply'}
            variant="primary"
            size="md"
            onPress={() => {
              onApply(draft);
              onClose();
            }}
            style={{ flex: 1.4 }}
          />
        </View>
      }
    >
      <Group title="Monthly rent">
        {RENT_BRACKETS.map((b) => (
          <Chip key={b.label} label={b.label} selected={draft.minRent === b.min && draft.maxRent === b.max} onPress={() => setBracket(b)} />
        ))}
      </Group>

      <Group title="Looking for">
        {GENDERS.map((g) => (
          <Chip key={g.key} label={g.label} icon={g.icon} selected={draft.gender === g.key} onPress={() => setDraft((d) => ({ ...d, gender: d.gender === g.key ? undefined : g.key }))} />
        ))}
      </Group>

      <Group title="Property type">
        {PROPERTY_TYPES.map((p) => (
          <Chip key={p.key} label={p.label} selected={(draft.propertyTypes || []).includes(p.key)} onPress={() => toggleArray('propertyTypes', p.key)} />
        ))}
      </Group>

      <Group title="Room type">
        {ROOM_TYPES.map((r) => (
          <Chip key={r.key} label={r.label} selected={(draft.roomTypes || []).includes(r.key)} onPress={() => toggleArray('roomTypes', r.key)} />
        ))}
      </Group>

      <Group title="Amenities">
        {AMENITIES.map((a) => (
          <Chip key={a.key} label={a.label} icon={a.icon} selected={(draft.amenities || []).includes(a.key)} onPress={() => toggleArray('amenities', a.key)} />
        ))}
      </Group>

      <Group title="Quick filters">
        <Chip label="Food included" icon="silverware-fork-knife" selected={!!draft.foodIncluded} onPress={() => setDraft((d) => ({ ...d, foodIncluded: d.foodIncluded ? undefined : true }))} />
        <Chip label="Available now" icon="bed" selected={!!draft.availableOnly} onPress={() => setDraft((d) => ({ ...d, availableOnly: d.availableOnly ? undefined : true }))} />
      </Group>
    </BottomSheet>
  );
}
