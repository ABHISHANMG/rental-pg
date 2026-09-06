/**
 * Mock authentication service.
 * Mirrors: POST /auth/login, POST /auth/register, POST /auth/logout
 *
 * Returns a token + user so the auth store can be wired exactly as it would be for a
 * real JWT flow. No real credential checks — any input succeeds in the mock milestone.
 */

import { request } from './api';
import { makeId } from '@/utils';

function buildSession({ name, phone, email, role }) {
  return {
    token: `mock.jwt.${makeId('tok')}`,
    refreshToken: `mock.refresh.${makeId('rtok')}`,
    user: {
      id: makeId('usr'),
      name: name || 'Guest User',
      phone: phone || '',
      email: email || '',
      role, // 'consumer' | 'seller'
      avatar: null,
      createdAt: new Date().toISOString(),
    },
  };
}

export async function login({ phone, email, role }) {
  return request(() => buildSession({ phone, email, role, name: deriveName(phone, email) }), {
    latency: 700,
  });
}

export async function signup({ name, phone, email, role }) {
  return request(() => buildSession({ name, phone, email, role }), { latency: 800 });
}

export async function verifyOtp() {
  // Any OTP accepted in the mock milestone.
  return request({ verified: true }, { latency: 400 });
}

export async function logout() {
  return request({ success: true }, { latency: 200 });
}

function deriveName(phone, email) {
  if (email) return email.split('@')[0].replace(/[._]/g, ' ');
  return 'Guest User';
}
