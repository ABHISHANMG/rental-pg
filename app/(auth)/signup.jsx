/**
 * Signup — collects name/phone/email and creates a mock account (Requirement §6).
 */

import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Header, Input, Button } from '@/components';
import { useAuthStore } from '@/store/auth.store';
import { signup as signupService } from '@/services/auth.service';
import { colors, spacing, typography } from '@/theme';

export default function Signup() {
  const router = useRouter();
  const role = useAuthStore((s) => s.role) || 'consumer';
  const setSession = useAuthStore((s) => s.setSession);

  const [form, setForm] = useState({ name: '', phone: '', email: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const patch = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (form.name.trim().length < 2) e.name = 'Please enter your name';
    if (form.phone.replace(/\D/g, '').length !== 10) e.phone = 'Enter a valid 10-digit number';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const session = await signupService({ name: form.name.trim(), phone: `+91 ${form.phone}`, email: form.email.trim(), role });
      setSession(session);
      router.replace(role === 'seller' ? '/(seller)/dashboard' : '/(consumer)/home');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <Header showBack title="Create account" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: spacing.xl, gap: spacing.xl, flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <View style={{ gap: spacing.sm }}>
            <Text style={{ fontSize: typography.display, fontWeight: typography.heavy, color: colors.ink, letterSpacing: -0.5 }}>
              Let's get you set up
            </Text>
            <Text style={{ fontSize: typography.bodyLg, fontWeight: typography.medium, color: colors.inkSoft }}>
              A few details and you're in.
            </Text>
          </View>

          <View style={{ gap: spacing.lg }}>
            <Input label="Full name" icon="account" autoCapitalize="words" placeholder="Aarav Sharma" value={form.name} onChangeText={(t) => patch('name', t)} error={errors.name} />
            <Input label="Mobile number" icon="phone" keyboardType="number-pad" placeholder="98765 43210" maxLength={10} value={form.phone} onChangeText={(t) => patch('phone', t.replace(/\D/g, ''))} error={errors.phone} helper="+91 · India" />
            <Input label="Email (optional)" icon="email" keyboardType="email-address" placeholder="you@example.com" value={form.email} onChangeText={(t) => patch('email', t)} error={errors.email} />
          </View>

          <Button title="Create account" icon="arrow-right" iconRight loading={loading} onPress={submit} fullWidth />

          <View style={{ flex: 1 }} />

          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 4 }}>
            <Text style={{ fontSize: typography.body, color: colors.inkSoft }}>Already have an account?</Text>
            <Text onPress={() => router.replace('/(auth)/login')} style={{ fontSize: typography.body, fontWeight: typography.bold, color: colors.primary }}>
              Log in
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
