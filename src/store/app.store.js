/**
 * App-level preferences: selected location, active filters, recent searches,
 * recently-viewed PGs. This is client/UI state only — server data (the PG list
 * itself) is fetched via the service layer, not duplicated here.
 */

import { create } from 'zustand';

const MAX_RECENT = 6;

export const useAppStore = create((set, get) => ({
  location: 'Hyderabad',
  filters: {}, // PGFilters-shaped
  recentSearches: [],
  recentlyViewed: [], // array of PG ids, most-recent first

  setLocation: (location) => set({ location }),

  setFilters: (filters) => set({ filters }),
  clearFilters: () => set({ filters: {} }),
  patchFilters: (patch) => set((s) => ({ filters: { ...s.filters, ...patch } })),

  addRecentSearch: (term) => {
    const t = (term || '').trim();
    if (!t) return;
    set((s) => ({
      recentSearches: [t, ...s.recentSearches.filter((x) => x.toLowerCase() !== t.toLowerCase())].slice(
        0,
        MAX_RECENT
      ),
    }));
  },
  clearRecentSearches: () => set({ recentSearches: [] }),

  addRecentlyViewed: (id) =>
    set((s) => ({
      recentlyViewed: [id, ...s.recentlyViewed.filter((x) => x !== id)].slice(0, MAX_RECENT),
    })),
}));
