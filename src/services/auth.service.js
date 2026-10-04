/**
 * Authentication service — OTP login (API_CONTRACT.md §AUTH).
 *   POST /auth/send-otp   { phone, role }   -> { message, dev_otp }
 *   POST /auth/verify-otp { phone, otp }     -> { access_token, user }
 *   GET  /auth/me                            -> current user
 *
 * The contract has a single OTP login for both roles; there is no password signup and
 * no endpoint to set name/email (see UNSUPPORTED_ENDPOINTS.md). `buildSession()` returns
 * the { token, refreshToken, user } shape the auth store already expects.
 */

import { http, endpoints } from './api';
import { mapUser, toApiRole, buildUpdateMeBody } from './mappers';

/** Step 1 — request an OTP. `role` only matters on a phone's first-ever signup. */
export async function sendOtp({ phone, role }) {
  const digits = normalisePhone(phone);
  return http.post(
    endpoints.sendOtp,
    { phone: digits, role: toApiRole(role) },
    { auth: false }
  ); // { message, dev_otp }
}

/** Step 2 — verify the OTP, returning a ready-to-store session. */
export async function verifyOtp({ phone, otp }) {
  const digits = normalisePhone(phone);
  const data = await http.post(endpoints.verifyOtp, { phone: digits, otp }, { auth: false });
  return buildSession(data);
}

/** Validate/refresh the current token on app start. Returns the mapped user. */
export async function getMe() {
  const data = await http.get(endpoints.me);
  return mapUser(data);
}

/** Update the signed-in user (name/email + role-specific profile). Returns mapped user. */
export async function updateMe(patch) {
  const data = await http.patch(endpoints.me, buildUpdateMeBody(patch));
  return mapUser(data);
}

/** Server ack (JWTs are stateless); the client still drops the token after this. */
export async function logout() {
  try {
    return await http.post(endpoints.logout, null);
  } catch {
    return { success: true }; // best-effort — logout must never block the UI
  }
}

function buildSession(data) {
  return {
    token: data.access_token,
    refreshToken: null, // contract issues a single long-lived JWT, no refresh token
    user: mapUser(data.user),
  };
}

// Backend expects a bare 10-digit number; the UI often carries "+91 " prefixes/spaces.
function normalisePhone(phone) {
  const digits = String(phone || '').replace(/\D/g, '');
  return digits.length > 10 ? digits.slice(-10) : digits;
}
