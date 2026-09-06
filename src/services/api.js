/**
 * Central API client stub.
 *
 * Today every call resolves against in-memory mock data. The shape mirrors a real
 * REST client so the migration path is: replace `request()` internals with fetch/axios,
 * keep every service method signature identical, and screens/hooks don't change.
 */

import Constants from 'expo-constants';

// Config is environment-driven — never hard-code secrets or hosts inline.
export const API_CONFIG = {
  baseUrl:
    process.env.EXPO_PUBLIC_API_URL ||
    Constants?.expoConfig?.extra?.apiUrl ||
    'https://api.zaptel.local/v1',
  wsUrl: process.env.EXPO_PUBLIC_WS_URL || 'wss://api.zaptel.local/ws',
  timeout: 15000,
};

// Simulated network latency so loading/skeleton states are exercised realistically.
const LATENCY_MS = 450;

export function delay(ms = LATENCY_MS) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Resolve `data` after a simulated round-trip. `options.failRate` (0..1) can be used
 * by callers to exercise error states. Kept generic so it maps cleanly onto a fetch
 * wrapper later.
 */
export async function request(data, options = {}) {
  const { latency = LATENCY_MS, failRate = 0, errorMessage = 'Something went wrong' } = options;
  await delay(latency);
  if (failRate > 0 && Math.random() < failRate) {
    const err = new Error(errorMessage);
    err.isNetworkError = true;
    throw err;
  }
  // Return a structural clone so callers can't mutate the mock store by reference.
  return typeof data === 'function' ? data() : deepClone(data);
}

function deepClone(value) {
  if (value == null || typeof value !== 'object') return value;
  return JSON.parse(JSON.stringify(value));
}
