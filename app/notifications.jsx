/**
 * Notifications (shared route, Requirement §26). Mock feed for the demo milestone.
 */

import React from 'react';
import { FlatList, Text, View } from 'react-native';
import { Screen, Header, Surface, Icon, EmptyState } from '@/components';
import { colors, radius as R, spacing, typography } from '@/theme';

const MOCK = [
  { id: 'n1', icon: 'check-decagram', tone: 'mintBg', title: 'Enquiry received', body: 'Urban Nest PG will get back to you soon.', time: '2h ago', unread: true },
  { id: 'n2', icon: 'tag', tone: 'lemon', title: 'Price drop', body: 'Green Leaf Residency reduced rent for double sharing.', time: '1d ago', unread: true },
  { id: 'n3', icon: 'bed', tone: 'lilac', title: 'New beds available', body: 'The Hive Co-living just opened 3 new single rooms.', time: '3d ago', unread: false },
];

function Row({ item }) {
  return (
    <Surface offset={3} radius={R.lg} style={{ marginBottom: spacing.md }} background={item.unread ? colors.surface : colors.surfaceAlt}>
      <View style={{ flexDirection: 'row', gap: spacing.md, padding: spacing.lg, alignItems: 'flex-start' }}>
        <View style={{ width: 42, height: 42, borderRadius: 12, backgroundColor: colors[item.tone], borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name={item.icon} size={20} color={colors.ink} />
        </View>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: typography.bodyLg, fontWeight: typography.bold, color: colors.ink }}>{item.title}</Text>
            {item.unread ? <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: colors.coral, borderWidth: 1, borderColor: colors.border }} /> : null}
          </View>
          <Text style={{ fontSize: typography.caption, color: colors.inkSoft, marginTop: 2, lineHeight: 18 }}>{item.body}</Text>
          <Text style={{ fontSize: typography.micro, fontWeight: typography.bold, color: colors.inkFaint, marginTop: 4 }}>{item.time}</Text>
        </View>
      </View>
    </Surface>
  );
}

export default function Notifications() {
  return (
    <Screen>
      <Header showBack title="Notifications" />
      <FlatList
        data={MOCK}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => <Row item={item} />}
        contentContainerStyle={{ padding: spacing.xl, paddingTop: spacing.sm }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<EmptyState icon="bell-outline" title="No notifications" message="You're all caught up." />}
      />
    </Screen>
  );
}
