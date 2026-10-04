/**
 * Personal information — shared, role-aware editable profile (Requirement §18).
 *  - Consumer: identity + personal details (gender, occupation, city, emergency contact).
 *  - Provider: identity + business details (business name, GST, PAN, address, since).
 *
 * Edits are saved into the auth store (updateUser) so they persist for the session and
 * are ready to POST to a real /users/me endpoint later.
 */

import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Header, Input, Button, Chip, Surface, Avatar } from '@/components';
import { useDialog } from '@/hooks/useDialog';
import { useAuthStore } from '@/store/auth.store';
import { updateMe, logout as logoutService } from '@/services/auth.service';
import { CITIES } from '@/constants';
import { colors, spacing, typography } from '@/theme';

const PERSON_GENDERS = [
  { key: 'MALE', label: 'Male' },
  { key: 'FEMALE', label: 'Female' },
  { key: 'OTHER', label: 'Other' },
];

function Group({ title, children }) {
  return (
    <View style={{ gap: spacing.md }}>
      <Text style={{ fontSize: typography.caption, fontWeight: typography.bold, color: colors.inkSoft, letterSpacing: 0.5 }}>{title.toUpperCase()}</Text>
      <Surface offset={4} radius={16}>
        <View style={{ padding: spacing.lg, gap: spacing.lg }}>{children}</View>
      </Surface>
    </View>
  );
}

export default function PersonalInfo() {
  const router = useRouter();
  const dialog = useDialog();
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const logoutStore = useAuthStore((s) => s.logout);
  const isSeller = useAuthStore((s) => s.role) === 'seller';

  const confirmLogout = () =>
    dialog.confirm({
      title: 'Log out?',
      message: 'You will need to sign in again with your mobile number.',
      icon: 'logout',
      tone: 'danger',
      confirmLabel: 'Log out',
      onConfirm: async () => {
        await logoutService();
        logoutStore();
        router.replace('/(auth)/role-selection');
      },
    });

  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    // consumer extras
    gender: user?.gender || null,
    occupation: user?.occupation || '',
    city: user?.city || '',
    emergencyContact: user?.emergencyContact || '',
    // provider extras
    businessName: user?.businessName || '',
    gst: user?.gst || '',
    pan: user?.pan || '',
    businessAddress: user?.businessAddress || '',
    since: user?.since || '',
  });

  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    if (form.name.trim().length < 2) return dialog.alert({ title: 'Name required', message: 'Please enter your name.', icon: 'account-alert' });
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return dialog.alert({ title: 'Invalid email', message: 'Please enter a valid email address.', icon: 'email-alert' });

    const patch = {
      name: form.name.trim(),
      phone: form.phone.trim(), // local only — the backend keys identity off the OTP phone
      email: form.email.trim(),
      ...(isSeller
        ? { businessName: form.businessName.trim(), gst: form.gst.trim(), pan: form.pan.trim(), businessAddress: form.businessAddress.trim(), since: form.since.trim() }
        : { gender: form.gender, occupation: form.occupation.trim(), city: form.city, emergencyContact: form.emergencyContact.trim() }),
    };

    updateUser(patch); // instant local update
    setSaving(true);
    try {
      // Persist name/email + role-specific profile via PATCH /auth/me (v1.1).
      const saved = await updateMe(patch);
      if (saved) updateUser(saved);
      dialog.alert({ title: 'Saved', message: 'Your details have been updated.', icon: 'check-bold', tone: 'success', onConfirm: () => router.back() });
    } catch (e) {
      dialog.alert({ title: 'Saved locally', message: e?.detail || 'Could not sync to the server, but your changes are saved on this device.', icon: 'cloud-off-outline' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen>
      <Header showBack title="Personal information" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: spacing.xl, paddingBottom: spacing.huge, gap: spacing.xl }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {/* Avatar */}
          <View style={{ alignItems: 'center', gap: spacing.sm }}>
            <Avatar name={form.name} size={84} tone={isSeller ? 'lemon' : 'lilac'} />
            <Text style={{ fontSize: typography.caption, fontWeight: typography.bold, color: colors.inkSoft }}>{isSeller ? 'PROPERTY OWNER' : 'TENANT'}</Text>
          </View>

          <Group title="Identity">
            <Input label={isSeller ? 'Owner name' : 'Full name'} icon="account" autoCapitalize="words" placeholder="Your name" value={form.name} onChangeText={(t) => set('name', t)} />
            <Input label="Mobile number" icon="phone" keyboardType="phone-pad" placeholder="+91 98765 43210" value={form.phone} onChangeText={(t) => set('phone', t)} />
            <Input label="Email" icon="email" keyboardType="email-address" placeholder="you@example.com" value={form.email} onChangeText={(t) => set('email', t)} />
          </Group>

          {isSeller ? (
            <Group title="Business details">
              <Input label="Business / PG brand name" icon="office-building" autoCapitalize="words" placeholder="e.g. Urban Nest Living" value={form.businessName} onChangeText={(t) => set('businessName', t)} />
              <Input label="GST number (optional)" icon="file-percent" autoCapitalize="characters" placeholder="22AAAAA0000A1Z5" value={form.gst} onChangeText={(t) => set('gst', t)} />
              <Input label="PAN (optional)" icon="card-account-details" autoCapitalize="characters" placeholder="ABCDE1234F" value={form.pan} onChangeText={(t) => set('pan', t)} />
              <Input label="Business address (optional)" icon="map-marker" autoCapitalize="words" multiline placeholder="Registered address" value={form.businessAddress} onChangeText={(t) => set('businessAddress', t)} />
              <Input label="In business since (optional)" icon="calendar" keyboardType="number-pad" maxLength={4} placeholder="2019" value={form.since} onChangeText={(t) => set('since', t.replace(/\D/g, ''))} />
            </Group>
          ) : (
            <Group title="About you">
              <View>
                <Text style={{ fontSize: typography.caption, fontWeight: typography.bold, color: colors.ink, marginBottom: spacing.sm }}>Gender</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
                  {PERSON_GENDERS.map((g) => (
                    <Chip key={g.key} label={g.label} selected={form.gender === g.key} onPress={() => set('gender', form.gender === g.key ? null : g.key)} />
                  ))}
                </View>
              </View>
              <Input label="Occupation (optional)" icon="briefcase" autoCapitalize="words" placeholder="e.g. Software Engineer, Student" value={form.occupation} onChangeText={(t) => set('occupation', t)} />
              <View>
                <Text style={{ fontSize: typography.caption, fontWeight: typography.bold, color: colors.ink, marginBottom: spacing.sm }}>Preferred city</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
                  {CITIES.map((c) => (
                    <Chip key={c} label={c} selected={form.city === c} onPress={() => set('city', form.city === c ? '' : c)} />
                  ))}
                </View>
              </View>
              <Input label="Emergency contact (optional)" icon="phone-alert" keyboardType="phone-pad" placeholder="+91 90000 00000" value={form.emergencyContact} onChangeText={(t) => set('emergencyContact', t)} />
            </Group>
          )}

          <Button title="Save changes" icon="check" iconRight variant="primary" loading={saving} onPress={save} fullWidth />
          <Button title="Log out" icon="logout" variant="surface" onPress={confirmLogout} fullWidth />
        </ScrollView>
      </KeyboardAvoidingView>
      {dialog.node}
    </Screen>
  );
}
