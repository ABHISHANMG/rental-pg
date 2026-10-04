/**
 * Favourites service (API_CONTRACT.md §PUBLIC & USER FLOWS).
 *   POST   /favourites/{pgId}  -> { favourited: true }
 *   DELETE /favourites/{pgId}  -> { favourited: false }
 *   GET    /favourites         -> array of PG objects
 * All require auth. The consumer app allows anonymous browsing, so callers should treat
 * these as best-effort when there is no token (local favourites state stays authoritative).
 */

import { http, endpoints } from './api';
import { mapPgCard } from './mappers';

export async function addFavourite(pgId) {
  return http.post(endpoints.favourite(pgId), null); // { favourited, pg_id }
}

export async function removeFavourite(pgId) {
  return http.del(endpoints.favourite(pgId)); // { favourited, pg_id }
}

export async function getFavourites() {
  const list = await http.get(endpoints.favourites);
  return (list || []).map(mapPgCard);
}
