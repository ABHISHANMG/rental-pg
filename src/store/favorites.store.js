/**
 * Favorites (shortlist) state.
 * Local Set-of-ids stays authoritative for instant UI, and each change is mirrored to the
 * backend (POST/DELETE /favourites/{pgId}) best-effort. Sync is swallowed on failure
 * because the consumer app allows anonymous browsing — without a token the favourite
 * simply isn't persisted server-side. Hydrate from the server with `hydrate()` post-login.
 */

import { create } from 'zustand';
import { addFavourite, removeFavourite, getFavourites } from '@/services/favourites.service';

function syncAdd(id) {
  addFavourite(id).catch(() => {});
}
function syncRemove(id) {
  removeFavourite(id).catch(() => {});
}

export const useFavoritesStore = create((set, get) => ({
  ids: [], // array (not Set) so it stays serializable for future persistence

  isFavorite: (id) => get().ids.includes(id),

  add: (id) =>
    set((s) => {
      if (s.ids.includes(id)) return s;
      syncAdd(id);
      return { ids: [id, ...s.ids] };
    }),

  remove: (id) =>
    set((s) => {
      syncRemove(id);
      return { ids: s.ids.filter((x) => x !== id) };
    }),

  toggle: (id) =>
    set((s) => {
      if (s.ids.includes(id)) {
        syncRemove(id);
        return { ids: s.ids.filter((x) => x !== id) };
      }
      syncAdd(id);
      return { ids: [id, ...s.ids] };
    }),

  clear: () => set({ ids: [] }),

  // Pull the authoritative favourites list from the server (call after login).
  hydrate: async () => {
    try {
      const pgs = await getFavourites();
      set({ ids: pgs.map((p) => p.id) });
    } catch {
      // ignore — keep local state
    }
  },
}));
