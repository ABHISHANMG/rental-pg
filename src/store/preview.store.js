/**
 * Transient store for previewing an unsaved PG draft through the real consumer detail
 * screen. The wizard drops a PG-shaped draft here, then navigates to /pg/__preview__.
 */

import { create } from 'zustand';

export const PREVIEW_ID = '__preview__';

export const usePreviewStore = create((set) => ({
  pg: null,
  setPreview: (pg) => set({ pg }),
  clear: () => set({ pg: null }),
}));
