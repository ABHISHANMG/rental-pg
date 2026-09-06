/**
 * Auth + role state (Zustand).
 * Holds the selected role, current user and session token. Designed so a real
 * JWT/refresh flow drops in later: `setSession` already accepts token + refreshToken.
 *
 * (Persistence to secure storage is intentionally left as a seam — see the
 * `// TODO(persist)` note — so the mock milestone stays dependency-light.)
 */

import { create } from 'zustand';

export const useAuthStore = create((set, get) => ({
  status: 'unauthenticated', // 'unauthenticated' | 'authenticating' | 'authenticated'
  role: null, // 'consumer' | 'seller' — chosen on the role-selection screen
  user: null,
  token: null,
  refreshToken: null,

  // Picked before login so signup/login know which experience to route into.
  setRole: (role) => set({ role }),

  setAuthenticating: () => set({ status: 'authenticating' }),

  setSession: ({ token, refreshToken, user }) =>
    set({
      status: 'authenticated',
      token,
      refreshToken: refreshToken ?? null,
      user,
      role: user?.role ?? get().role,
    }),
  // TODO(persist): mirror token/refreshToken into expo-secure-store here.

  updateUser: (patch) => set((s) => ({ user: { ...s.user, ...patch } })),

  logout: () =>
    set({
      status: 'unauthenticated',
      user: null,
      token: null,
      refreshToken: null,
      // role is preserved so logging out returns to the same role's login, not role picker.
    }),

  reset: () => set({ status: 'unauthenticated', role: null, user: null, token: null, refreshToken: null }),
}));
