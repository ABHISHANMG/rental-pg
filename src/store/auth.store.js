/**
 * Auth + role state (Zustand).
 * Holds the selected role, current user and session token. The session (token + user +
 * role) is persisted to secure storage so a returning user skips login:
 *   - setSession / updateUser  -> write-through to storage
 *   - logout / reset           -> clear storage
 *   - hydrate()                -> restore on app start (called from the splash screen)
 */

import { create } from 'zustand';
import { setAuthTokenProvider } from '@/services/api';
import { getMe } from '@/services/auth.service';
import { saveSession, loadSession, clearSession } from '@/store/sessionStorage';

export const useAuthStore = create((set, get) => ({
  status: 'unauthenticated', // 'unauthenticated' | 'authenticating' | 'authenticated'
  hydrated: false, // becomes true once storage has been read on app start
  role: null, // 'consumer' | 'seller' — chosen on the role-selection screen
  user: null,
  token: null,
  refreshToken: null,

  // Picked before login so signup/login know which experience to route into.
  setRole: (role) => set({ role }),

  setAuthenticating: () => set({ status: 'authenticating' }),

  setSession: ({ token, refreshToken, user }) => {
    const next = {
      status: 'authenticated',
      token,
      refreshToken: refreshToken ?? null,
      user,
      role: user?.role ?? get().role,
    };
    set(next);
    // Persist so the next launch restores this session without logging in again.
    saveSession({ token: next.token, refreshToken: next.refreshToken, user: next.user, role: next.role });
  },

  updateUser: (patch) =>
    set((s) => {
      const user = { ...s.user, ...patch };
      // Keep storage in sync so profile edits survive a restart.
      if (s.token) saveSession({ token: s.token, refreshToken: s.refreshToken, user, role: s.role });
      return { user };
    }),

  // Restore a persisted session on app start. Optimistic: we trust the stored token
  // (JWTs last 30 days per the contract) and show the app immediately, then validate it
  // against /auth/me in the background — refreshing the user, or logging out only if the
  // token was explicitly rejected (401). Network errors keep the session (offline-safe).
  hydrate: async () => {
    const s = await loadSession();
    if (!s?.token) {
      set({ hydrated: true });
      return;
    }
    set({
      status: 'authenticated',
      token: s.token,
      refreshToken: s.refreshToken ?? null,
      user: s.user ?? null,
      role: s.user?.role ?? s.role ?? null,
      hydrated: true,
    });
    try {
      const me = await getMe();
      if (me) get().updateUser(me); // refresh cached user (and re-persist)
    } catch (e) {
      if (e?.status === 401) get().logout(); // token revoked/expired → force re-login
    }
  },

  logout: () => {
    clearSession();
    set({
      status: 'unauthenticated',
      user: null,
      token: null,
      refreshToken: null,
      // role is preserved so logging out returns to the same role's login, not role picker.
    });
  },

  reset: () => {
    clearSession();
    set({ status: 'unauthenticated', role: null, user: null, token: null, refreshToken: null });
  },
}));

// Let the HTTP client read the current token for `Authorization: Bearer <token>` on every
// protected call, without the services needing to import this store.
setAuthTokenProvider(() => useAuthStore.getState().token);
