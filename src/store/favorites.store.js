/**
 * Favorites (shortlist) state.
 * Stored as a Set of PG ids in client state. The store exposes the same surface a
 * backend-synced version would (add/remove/toggle/isFavorite), so wiring
 * POST/DELETE /favorites later means changing the action bodies, not the callers.
 */

import { create } from 'zustand';

export const useFavoritesStore = create((set, get) => ({
  ids: [], // array (not Set) so it stays serializable for future persistence

  isFavorite: (id) => get().ids.includes(id),

  add: (id) => set((s) => (s.ids.includes(id) ? s : { ids: [id, ...s.ids] })),

  remove: (id) => set((s) => ({ ids: s.ids.filter((x) => x !== id) })),

  toggle: (id) =>
    set((s) => (s.ids.includes(id) ? { ids: s.ids.filter((x) => x !== id) } : { ids: [id, ...s.ids] })),

  clear: () => set({ ids: [] }),
  // TODO(sync): on add/remove, enqueue POST/DELETE /favorites and reconcile.
}));
