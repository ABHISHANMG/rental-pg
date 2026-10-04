/**
 * Persistent session storage for the auth token + user.
 * Native: expo-secure-store (encrypted keystore/keychain). Web: localStorage fallback
 * (SecureStore isn't available on web — fine for the dev/web build).
 *
 * Stores a single JSON blob: { token, refreshToken, user, role }.
 */

import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const KEY = 'zaptel.session.v1';

const webStore = {
  getItem: (k) => {
    try {
      return Promise.resolve(globalThis.localStorage?.getItem(k) ?? null);
    } catch {
      return Promise.resolve(null);
    }
  },
  setItem: (k, v) => {
    try {
      globalThis.localStorage?.setItem(k, v);
    } catch {}
    return Promise.resolve();
  },
  removeItem: (k) => {
    try {
      globalThis.localStorage?.removeItem(k);
    } catch {}
    return Promise.resolve();
  },
};

const store =
  Platform.OS === 'web'
    ? webStore
    : {
        getItem: SecureStore.getItemAsync,
        setItem: SecureStore.setItemAsync,
        removeItem: SecureStore.deleteItemAsync,
      };

export async function saveSession(session) {
  try {
    await store.setItem(KEY, JSON.stringify(session));
  } catch (e) {
    // non-fatal — the in-memory session still works for this run — but surface it in dev
    // so a missing native module (e.g. an un-rebuilt dev client) is visible.
    if (__DEV__) console.warn('[auth] could not persist session:', e?.message || e);
  }
}

export async function loadSession() {
  try {
    const raw = await store.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    if (__DEV__) console.warn('[auth] could not read persisted session:', e?.message || e);
    return null;
  }
}

export async function clearSession() {
  try {
    await store.removeItem(KEY);
  } catch {}
}
