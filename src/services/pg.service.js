/**
 * PG catalog service. Mirrors the future REST contract:
 *   GET /pgs, GET /pgs/:id, GET /pgs (with ?q=), GET /pgs (with filters)
 *
 * Screens/hooks depend ONLY on these functions, never on the mock records.
 */

import { MOCK_PGS } from './mock/pgs';
import { request } from './api';
import { peekSellerProperties } from './seller.service';
import { getMinRent, getAvailableBeds } from '@/utils';

export async function getPGs() {
  return request(MOCK_PGS);
}

export async function getPGById(id) {
  // Catalog first, then fall back to owner-created listings (for seller preview).
  const pg = MOCK_PGS.find((p) => p.id === id) || peekSellerProperties().find((p) => p.id === id);
  if (!pg) {
    const err = new Error('Property not found');
    err.code = 'NOT_FOUND';
    throw err;
  }
  return request(pg);
}

export async function getPGsByIds(ids = []) {
  const set = new Set(ids);
  return request(MOCK_PGS.filter((p) => set.has(p.id)));
}

export async function searchPGs(query = '') {
  const q = query.trim().toLowerCase();
  if (!q) return request(MOCK_PGS);
  const matches = MOCK_PGS.filter((p) => {
    const hay = [
      p.name,
      p.address.locality,
      p.address.city,
      p.address.state,
      p.propertyType,
    ]
      .join(' ')
      .toLowerCase();
    return hay.includes(q);
  });
  return request(matches, { latency: 250 });
}

/**
 * Apply a PGFilters-shaped object client-side. Returns filtered + sorted list.
 * Sorting: available first, then rating desc — a sensible marketplace default.
 */
export async function filterPGs(filters = {}) {
  let list = MOCK_PGS.slice();

  if (filters.location) {
    const loc = filters.location.toLowerCase();
    list = list.filter(
      (p) =>
        p.address.locality.toLowerCase().includes(loc) ||
        p.address.city.toLowerCase().includes(loc)
    );
  }

  if (filters.query) {
    const q = filters.query.toLowerCase();
    list = list.filter((p) =>
      [p.name, p.address.locality, p.address.city].join(' ').toLowerCase().includes(q)
    );
  }

  if (filters.gender) {
    list = list.filter((p) => p.gender === filters.gender);
  }

  if (filters.propertyTypes?.length) {
    list = list.filter((p) => filters.propertyTypes.includes(p.propertyType));
  }

  if (filters.roomTypes?.length) {
    list = list.filter((p) => p.rooms.some((r) => filters.roomTypes.includes(r.roomType)));
  }

  if (filters.amenities?.length) {
    list = list.filter((p) => filters.amenities.every((a) => p.amenities.includes(a)));
  }

  if (filters.foodIncluded) {
    list = list.filter((p) => p.amenities.includes('food'));
  }

  if (filters.minRent != null) {
    list = list.filter((p) => getMinRent(p) >= filters.minRent);
  }

  if (filters.maxRent != null) {
    list = list.filter((p) => getMinRent(p) <= filters.maxRent);
  }

  if (filters.availableOnly) {
    list = list.filter((p) => getAvailableBeds(p) > 0);
  }

  list.sort((a, b) => {
    const aAvail = getAvailableBeds(a) > 0 ? 1 : 0;
    const bAvail = getAvailableBeds(b) > 0 ? 1 : 0;
    if (aAvail !== bAvail) return bAvail - aAvail;
    return b.rating - a.rating;
  });

  return request(list, { latency: 350 });
}

/** Count how many filter dimensions are active — drives the "N" badge in the UI. */
export function countActiveFilters(filters = {}) {
  let n = 0;
  if (filters.gender) n += 1;
  if (filters.propertyTypes?.length) n += 1;
  if (filters.roomTypes?.length) n += 1;
  if (filters.amenities?.length) n += 1;
  if (filters.foodIncluded) n += 1;
  if (filters.availableOnly) n += 1;
  if (filters.minRent != null || filters.maxRent != null) n += 1;
  return n;
}
