/**
 * Login — mock phone + OTP flow (Requirement §6). Any phone/OTP is accepted; on
 * success we store a session and route into the role's experience. Designed so a real
 * JWT/OTP backend slots into auth.service without touching this screen.
 */

import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Header, Input, Button, Surface, Icon } from '@/components';
import { useAuthStore } from '@/store/auth.store';
import { sendOtp as sendOtpService, verifyOtp } from '@/services/auth.service';
import { colors, radius as R, spacing, typography } from '@/theme';

export default function Login() {
  const router = useRouter();
  const role = useAuthStore((s) => s.role) || 'consumer';
  const setAuthenticating = useAuthStore((s) => s.setAuthenticating);
  const setSession = useAuthStore((s) => s.setSession);

  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [devOtp, setDevOtp] = useState(null);

  const isConsumer = role === 'consumer';

  const sendOtp = async () => {
    if (phone.replace(/\D/g, '').length !== 10) {
      setError('Enter a valid 10-digit mobile number');
      return;
    }
    setError('');
    setSending(true);
    try {
      const res = await sendOtpService({ phone, role });
      setDevOtp(res?.dev_otp || null); // present only when backend runs in OTP_DEV_MODE
      setOtpSent(true);
    } catch (e) {
      setError(e.detail || e.message || 'Could not send OTP. Try again.');
    } finally {
      setSending(false);
    }
  };

  const finish = (session) => {
    setSession(session);
    // Route by the role the backend actually granted (a phone's role is fixed at first
    // signup), not the one picked on the role screen.
    const granted = session.user?.role || role;
    router.replace(granted === 'seller' ? '/(seller)/dashboard' : '/(consumer)/home');
  };

  const verifyAndContinue = async () => {
    if (otp.replace(/\D/g, '').length < 4) {
      setError('Enter the code sent to your phone');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const session = await verifyOtp({ phone, otp });
      const granted = session.user?.role;
      // This number may already be registered under the other role — role is immutable,
      // so block the mismatch instead of dropping them into an experience their token
      // can't use (owner APIs would 403).
      if (granted && granted !== role) {
        setError(
          granted === 'consumer'
            ? 'This number is registered as a PG hunter. To list a PG, use a different number.'
            : 'This number is registered as a PG owner. Go back and choose “List my PG”.'
        );
        return;
      }
      setAuthenticating();
      finish(session);
    } catch (e) {
      setError(e.detail || e.message || 'Could not sign you in. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <Header showBack title="Log in" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: spacing.xl, gap: spacing.xl, flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <View style={{ gap: spacing.sm }}>
            <View
              style={{
                alignSelf: 'flex-start',
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: R.pill,
                backgroundColor: isConsumer ? colors.lilac : colors.lemon,
                borderWidth: 1,
                borderColor: colors.border,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Icon name={isConsumer ? 'magnify' : 'office-building-marker'} size={15} color={colors.ink} />
              <Text style={{ fontSize: typography.caption, fontWeight: typography.bold, color: colors.ink }}>
                {isConsumer ? 'Finding a PG' : 'Listing a PG'}
              </Text>
            </View>
            <Text style={{ fontSize: typography.display, fontWeight: typography.heavy, color: colors.ink, letterSpacing: -0.5 }}>
              Welcome back
            </Text>
            <Text style={{ fontSize: typography.bodyLg, fontWeight: typography.medium, color: colors.inkSoft }}>
              Log in with your mobile number to continue.
            </Text>
          </View>

          <View style={{ gap: spacing.lg }}>
            <Input
              label="Mobile number"
              icon="phone"
              keyboardType="number-pad"
              placeholder="98765 43210"
              value={phone}
              maxLength={10}
              editable={!otpSent}
              onChangeText={(t) => setPhone(t.replace(/\D/g, ''))}
              error={!otpSent ? error : ''}
              helper={!otpSent ? '+91 · India' : undefined}
            />

            {otpSent ? (
              <View style={{ gap: spacing.md }}>
                <Input
                  label="Enter OTP"
                  icon="shield-key"
                  keyboardType="number-pad"
                  placeholder="1234"
                  value={otp}
                  maxLength={6}
                  onChangeText={(t) => setOtp(t.replace(/\D/g, ''))}
                  error={error}
                  helper={devOtp ? `Dev OTP: ${devOtp}` : 'Enter the code sent to your number.'}
                />
                <Button title="Verify & continue" icon="check" iconRight loading={loading} onPress={verifyAndContinue} fullWidth />
                <Button title="Change number" variant="ghost" size="sm" onPress={() => { setOtpSent(false); setOtp(''); setError(''); setDevOtp(null); }} />
              </View>
            ) : (
              <Button title="Send OTP" icon="arrow-right" iconRight loading={sending} onPress={sendOtp} fullWidth />
            )}
          </View>

          <View style={{ flex: 1 }} />

          <Surface offset={0} bordered={false} background="transparent">
            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 4 }}>
              <Text style={{ fontSize: typography.body, color: colors.inkSoft }}>New here?</Text>
              <Text
                onPress={() => router.push('/(auth)/signup')}
                style={{ fontSize: typography.body, fontWeight: typography.bold, color: colors.primary }}
              >
                Create an account
              </Text>
            </View>
          </Surface>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
