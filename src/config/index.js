

import Constants from 'expo-constants';
import { Platform } from 'react-native';

const API_PORT = process.env.EXPO_PUBLIC_API_PORT || '8000';

// The host:port the app used to load the JS bundle from Metro — e.g. "192.168.0.104:8081".
function metroHost() {
  const candidates = [
    Constants?.expoConfig?.hostUri,
    Constants?.expoGoConfig?.debuggerHost,
    Constants?.manifest?.debuggerHost,
    Constants?.manifest2?.extra?.expoGo?.debuggerHost,
  ];
  for (const c of candidates) {
    if (c && typeof c === 'string') {
      const host = c.split('://').pop().split(':')[0];
      if (host) return host;
    }
  }
  return null;
}

function resolveApiUrl() {
  if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL;
  if (Constants?.expoConfig?.extra?.apiUrl) return Constants.expoConfig.extra.apiUrl;

  const host = metroHost();
  // On the Android emulator, Metro is often reached via localhost/adb-reverse, which the
  // emulator can't use for an arbitrary port — map it to the host-loopback alias instead.
  if (host && host !== 'localhost' && host !== '127.0.0.1') {
    return `http://${host}:${API_PORT}`;
  }
  const fallbackHost = Platform.OS === 'android' ? '10.0.2.2' : '127.0.0.1';
  return `http://${fallbackHost}:${API_PORT}`;
}

export const config = {
  apiUrl: resolveApiUrl(),
  timeout: Number(process.env.EXPO_PUBLIC_API_TIMEOUT) || 20000,
};

/**
 * Endpoint paths from API_CONTRACT.md, centralised so a path change is a one-line edit.
 * Functions take ids and return the interpolated path.
 */
export const endpoints = {
  // Auth
  sendOtp: '/auth/send-otp',
  verifyOtp: '/auth/verify-otp',
  me: '/auth/me',
  logout: '/auth/logout',

  // Constants
  constants: '/constants',

  // PG management (owner)
  pgs: '/pgs',
  pg: (id) => `/pgs/${id}`,
  pgStructure: (id) => `/pgs/${id}/structure`,
  floors: (pgId) => `/pgs/${pgId}/floors`,
  rooms: (pgId) => `/pgs/${pgId}/rooms`,
  beds: (pgId) => `/pgs/${pgId}/beds`,

  // Tenants (owner)
  tenants: (pgId) => `/pgs/${pgId}/tenants`,
  tenant: (pgId, tenantId) => `/pgs/${pgId}/tenants/${tenantId}`,
  tenantMove: (pgId, tenantId) => `/pgs/${pgId}/tenants/${tenantId}/move`,
  tenantLeave: (pgId, tenantId) => `/pgs/${pgId}/tenants/${tenantId}/leave`,

  // Payments (owner)
  payments: '/payments',
  paymentComplete: (pgId, paymentId) => `/payments/${pgId}/${paymentId}/complete`,

  // Media (owner)
  mediaPresign: '/media/presign',
  mediaConfirm: '/media/confirm',
  media: (pgId) => `/media/${pgId}`,

  // Dashboard & reports (owner)
  dashboard: '/dashboard',
  dashboardReport: '/dashboard/report',

  // Public & user flows
  search: '/search',
  publicPg: (id) => `/pg/${id}`,
  pgReviews: (pgId) => `/pg/${pgId}/reviews`,
  favourites: '/favourites',
  favourite: (pgId) => `/favourites/${pgId}`,
  reviews: '/reviews',

  // Enquiries / leads funnel (v1.1)
  enquiries: '/enquiries',
  leads: '/leads',
  lead: (id) => `/leads/${id}`,

  // Bookings funnel (v1.1)
  bookings: '/bookings',
  booking: (id) => `/bookings/${id}`,
  bookingStatus: (id) => `/bookings/${id}/status`,
};

export default config;
