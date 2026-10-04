/**
 * Reviews service.
 *   GET  /pg/{id}/reviews                     list reviews (with reviewer name) — v1.1
 *   POST /reviews { pg_id, rating, comment }  add/update (auth, one per user per PG)
 */

import { http, endpoints } from './api';
import { mapReview } from './mappers';

export async function getReviews(pgId) {
  const data = await http.get(endpoints.pgReviews(pgId), { auth: false });
  return (data || []).map(mapReview);
}

export async function addReview(pgId, { rating, comment } = {}) {
  const data = await http.post(endpoints.reviews, { pg_id: pgId, rating, comment });
  return mapReview(data);
}

/** Average + count over a review list. Pure helper, unchanged. */
export function summarize(reviews = []) {
  if (!reviews.length) return { average: 0, count: 0 };
  const sum = reviews.reduce((s, r) => s + r.rating, 0);
  return { average: sum / reviews.length, count: reviews.length };
}
