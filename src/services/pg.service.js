/**
 * PG catalog service — public search & detail (API_CONTRACT.md §PUBLIC & USER FLOWS).
 *   GET /search      -> list cards
 *   GET /pg/{id}     -> full detail (floors/rooms/beds + reviews)
 *
 * Screens/hooks depend only on these function signatures and the mapped shapes, so the
 * swap from mock to REST is contained here + mappers.js.
 */

import { http, endpoints } from './api';
import { mapPgCard, mapPgDetail, genderToPgType, roomTypeToApi, amenitiesToApi } from './mappers';

/** All PGs (home feed). Backend has no "list all" beyond search with no filters. */
export async function getPGs() {
  const list = await http.get(endpoints.search, { auth: false });
  return (list || []).map(mapPgCard);
}

export async function getPGById(id) {
  const data = await http.get(endpoints.publicPg(id), { auth: false });
  return mapPgDetail(data);
}

/** Favourites screen resolves a set of ids — fetch each public detail in parallel. */
export async function getPGsByIds(ids = []) {
  if (!ids.length) return [];
  const results = await Promise.allSettled(ids.map((id) => getPGById(id)));
  return results.filter((r) => r.status === 'fulfilled').map((r) => r.value);
}

/** Free-text search via the backend `q` param (v1.1): matches name/area/city. */
export async function searchPGs(query = '') {
  const q = query.trim();
  const list = await http.get(endpoints.search, { auth: false, query: q ? { q } : undefined });
  return (list || []).map(mapPgCard);
}

/**
 * Structured filter -> GET /search query params. v1.1 adds free-text `q`, repeatable
 * `room_type`, and repeatable `property_type`, so filtering is fully server-side now.
 */
export async function filterPGs(filters = {}) {
  const query = {};
  if (filters.query) query.q = filters.query;
  if (filters.location) query.city = filters.location;
  if (filters.area) query.area = filters.area;
  if (filters.gender) query.pg_type = genderToPgType(filters.gender);
  if (filters.roomTypes?.length) query.room_type = filters.roomTypes.map(roomTypeToApi);
  if (filters.propertyTypes?.length) query.property_type = filters.propertyTypes;
  if (filters.minRent != null) query.min_rent = filters.minRent;
  if (filters.maxRent != null) query.max_rent = filters.maxRent;
  if (filters.availableOnly) query.available_only = true;
  if (filters.amenities?.length || filters.foodIncluded) {
    const keys = [...(filters.amenities || [])];
    if (filters.foodIncluded && !keys.includes('food')) keys.push('food');
    query.amenities = amenitiesToApi(keys);
    if (keys.includes('ac')) query.is_ac = true;
  }

  const list = (await http.get(endpoints.search, { auth: false, query })).map(mapPgCard);

  list.sort((a, b) => {
    const avail = (p) => (p.rooms.some((r) => r.availableBeds > 0) ? 1 : 0);
    const d = avail(b) - avail(a);
    return d !== 0 ? d : b.rating - a.rating;
  });
  return list;
}

/** Count active filter dimensions — drives the "N" badge. Pure, unchanged. */
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
