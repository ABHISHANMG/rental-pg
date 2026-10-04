/**
 * Signup — the contract has a single OTP login for both roles (no password signup, and
 * no endpoint to persist name/email). We collect name/email for a friendlier local
 * profile, then run the same OTP flow as login; name/email are stored client-side via
 * updateUser after the session is created. See UNSUPPORTED_ENDPOINTS.md.
 */

import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Header, Input, Button } from '@/components';
import { useAuthStore } from '@/store/auth.store';
import { sendOtp as sendOtpService, verifyOtp, updateMe } from '@/services/auth.service';
import { colors, spacing, typography } from '@/theme';

export default function Signup() {
  const router = useRouter();
  const role = useAuthStore((s) => s.role) || 'consumer';
  const setSession = useAuthStore((s) => s.setSession);
  const updateUser = useAuthStore((s) => s.updateUser);

  const [form, setForm] = useState({ name: '', phone: '', email: '' });
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [devOtp, setDevOtp] = useState(null);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
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

  const sendOtp = async () => {
    if (!validate()) return;
    setError('');
    setSending(true);
    try {
      const res = await sendOtpService({ phone: form.phone, role });
      setDevOtp(res?.dev_otp || null);
      setOtpSent(true);
    } catch (e) {
      setError(e.detail || e.message || 'Could not send OTP. Try again.');
    } finally {
      setSending(false);
    }
  };

  const verifyAndContinue = async () => {
    if (otp.replace(/\D/g, '').length < 4) {
      setError('Enter the code sent to your phone');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const session = await verifyOtp({ phone: form.phone, otp });
      const granted = session.user?.role;
      // A phone's role is fixed at first signup — block if it's already the other role.
      if (granted && granted !== role) {
        setError(
          granted === 'consumer'
            ? 'This number is already registered as a PG hunter. Use a different number to list a PG.'
            : 'This number is already registered as a PG owner. Go back and choose “List my PG”.'
        );
        return;
      }
      setSession(session);
      const name = form.name.trim();
      const email = form.email.trim();
      updateUser({ name, email }); // instant local update
      // Persist to the backend (v1.1 PATCH /auth/me); best-effort, don't block routing.
      updateMe({ name, email }).then((u) => u && updateUser(u)).catch(() => {});
      router.replace(granted === 'seller' ? '/(seller)/dashboard' : '/(consumer)/home');
    } catch (e) {
      setError(e.detail || e.message || 'Could not create your account. Try again.');
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
            <Input label="Full name" icon="account" autoCapitalize="words" placeholder="Aarav Sharma" value={form.name} editable={!otpSent} onChangeText={(t) => patch('name', t)} error={errors.name} />
            <Input label="Mobile number" icon="phone" keyboardType="number-pad" placeholder="98765 43210" maxLength={10} value={form.phone} editable={!otpSent} onChangeText={(t) => patch('phone', t.replace(/\D/g, ''))} error={errors.phone} helper="+91 · India" />
            <Input label="Email (optional)" icon="email" keyboardType="email-address" placeholder="you@example.com" value={form.email} editable={!otpSent} onChangeText={(t) => patch('email', t)} error={errors.email} />

            {otpSent && (
              <Input
                label="Enter OTP"
                icon="shield-key"
                keyboardType="number-pad"
                placeholder="1234"
                maxLength={6}
                value={otp}
                onChangeText={(t) => setOtp(t.replace(/\D/g, ''))}
                error={error}
                helper={devOtp ? `Dev OTP: ${devOtp}` : 'Enter the code sent to your number.'}
              />
            )}
          </View>

          {otpSent ? (
            <View style={{ gap: spacing.md }}>
              <Button title="Verify & continue" icon="check" iconRight loading={loading} onPress={verifyAndContinue} fullWidth />
              <Button title="Edit details" variant="ghost" size="sm" onPress={() => { setOtpSent(false); setOtp(''); setError(''); setDevOtp(null); }} />
            </View>
          ) : (
            <Button title="Send OTP" icon="arrow-right" iconRight loading={sending} onPress={sendOtp} fullWidth />
          )}

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
