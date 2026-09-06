/**
 * Seller Leads (Requirement §23). Filter by status; tap a lead to update its status
 * or call the prospect.
 */

import React, { useCallback, useState } from 'react';
import { FlatList, ScrollView, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Screen, Chip, LeadCard, Button, BottomSheet, Avatar, Icon, PGCardSkeletonList, EmptyState } from '@/components';
import { useDialog } from '@/hooks/useDialog';
import { useAsync } from '@/hooks/useAsync';
import { getLeads, updateLeadStatus } from '@/services/seller.service';
import { LEAD_STATUSES, ROOM_TYPE_MAP } from '@/constants';
import { formatMoney, formatDate } from '@/utils';
import { colors, radius as R, spacing, typography } from '@/theme';

const FILTERS = [{ key: 'ALL', label: 'All' }, ...LEAD_STATUSES];

export default function Leads() {
  const { data, isLoading, refetch } = useAsync(() => getLeads(), []);
  const [filter, setFilter] = useState('ALL');
  const [active, setActive] = useState(null); // lead open in the sheet
  const dialog = useDialog();

  useFocusEffect(
    useCallback(() => {
      refetch();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  const leads = data || [];
  const filtered = filter === 'ALL' ? leads : leads.filter((l) => l.status === filter);

  const setStatus = async (status) => {
    await updateLeadStatus(active.id, status);
    setActive(null);
    refetch();
  };

  return (
    <Screen>
      <View style={{ paddingHorizontal: spacing.xl, paddingBottom: spacing.md }}>
        <Text style={{ fontSize: typography.h1, fontWeight: typography.heavy, color: colors.ink, letterSpacing: -0.4 }}>Leads</Text>
      </View>

      {/* Status filter */}
      <View style={{ marginBottom: spacing.sm }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: spacing.xl, gap: spacing.sm }}>
          {FILTERS.map((f) => (
            <Chip key={f.key} label={f.label} selected={filter === f.key} onPress={() => setFilter(f.key)} />
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={isLoading ? [] : filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <LeadCard lead={item} onPress={() => setActive(item)} />}
        contentContainerStyle={{ paddingHorizontal: spacing.xl, paddingTop: spacing.sm, paddingBottom: 130 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          isLoading ? <PGCardSkeletonList count={2} /> : <EmptyState icon="account-search" tone="lilac" title="No leads here" message="Leads matching this status will appear here." />
        }
      />

      {/* Lead detail / status updater */}
      <BottomSheet
        visible={!!active}
        onClose={() => setActive(null)}
        title="Update lead"
        footer={
          <Button
            title="Call prospect"
            icon="phone"
            variant="ink"
            onPress={() => {
              const l = active;
              setActive(null);
              // let the sheet close before the dialog opens (avoid stacked modals)
              setTimeout(() => dialog.alert({ title: 'Call prospect', message: `Dialing ${l?.name} — ${l?.phone}`, icon: 'phone', tone: 'primary' }), 250);
            }}
            fullWidth
          />
        }
      >
        {active ? (
          <View style={{ gap: spacing.lg }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
              <Avatar name={active.name} size={52} tone="lilac" />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: typography.h3, fontWeight: typography.heavy, color: colors.ink }}>{active.name}</Text>
                <Text style={{ fontSize: typography.caption, fontWeight: typography.medium, color: colors.inkSoft }}>{active.phone}</Text>
              </View>
            </View>

            <View style={{ backgroundColor: colors.surfaceAlt, borderRadius: R.lg, padding: spacing.lg, gap: spacing.sm }}>
              {[
                { icon: 'home-city', label: active.pgName },
                { icon: 'bed', label: ROOM_TYPE_MAP[active.roomType]?.label || active.roomType },
                { icon: 'wallet', label: `Budget ${formatMoney(active.budget)}/mo` },
                { icon: 'calendar', label: `Move-in ${formatDate(active.moveInDate)}` },
              ].map((row) => (
                <View key={row.label} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                  <Icon name={row.icon} size={16} color={colors.inkSoft} />
                  <Text style={{ fontSize: typography.body, fontWeight: typography.medium, color: colors.ink }}>{row.label}</Text>
                </View>
              ))}
              {active.message ? (
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, marginTop: 2 }}>
                  <Icon name="message-text" size={16} color={colors.inkSoft} />
                  <Text style={{ flex: 1, fontSize: typography.body, fontStyle: 'italic', color: colors.inkSoft }}>“{active.message}”</Text>
                </View>
              ) : null}
            </View>

            <View>
              <Text style={{ fontSize: typography.caption, fontWeight: typography.bold, color: colors.ink, marginBottom: spacing.sm }}>Set status</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
                {LEAD_STATUSES.map((s) => (
                  <Chip key={s.key} label={s.label} selected={active.status === s.key} onPress={() => setStatus(s.key)} />
                ))}
              </View>
            </View>
          </View>
        ) : null}
      </BottomSheet>
      {dialog.node}
    </Screen>
  );
}
