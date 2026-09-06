/**
 * Reviews service (mock, in-memory). Mirrors GET /pgs/:id/reviews, POST /pgs/:id/reviews.
 * Each PG is lazily seeded with a few reviews on first access; new reviews are prepended.
 */

import { request } from './api';
import { makeId } from '@/utils';

const SEED = [
  { name: 'Sneha R.', rating: 5, comment: 'Clean rooms and the food is genuinely good. Warden is helpful and responsive.', daysAgo: 6 },
  { name: 'Aditya K.', rating: 4, comment: 'Great location and value for money. WiFi could be a bit faster during peak hours.', daysAgo: 21 },
  { name: 'Priya M.', rating: 4, comment: 'Safe and well maintained. Housekeeping comes regularly and staff are polite.', daysAgo: 44 },
];

const _reviews = {}; // pgId -> [review]

function daysAgo(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

function buildSeed() {
  return SEED.map((s, i) => ({
    id: `seed_${i}`,
    name: s.name,
    rating: s.rating,
    comment: s.comment,
    createdAt: daysAgo(s.daysAgo),
    seeded: true,
  }));
}

export async function getReviews(pgId) {
  if (!_reviews[pgId]) _reviews[pgId] = buildSeed();
  return request(_reviews[pgId]);
}

export async function addReview(pgId, { name, rating, comment }) {
  const review = {
    id: makeId('rev'),
    name: (name || '').trim() || 'Anonymous',
    rating,
    comment: (comment || '').trim(),
    createdAt: new Date().toISOString(),
  };
  if (!_reviews[pgId]) _reviews[pgId] = buildSeed();
  _reviews[pgId] = [review, ..._reviews[pgId]];
  return request(review, { latency: 500 });
}

/** Average + count over the current (seed + user) reviews. */
export function summarize(reviews = []) {
  if (!reviews.length) return { average: 0, count: 0 };
  const sum = reviews.reduce((s, r) => s + r.rating, 0);
  return { average: sum / reviews.length, count: reviews.length };
}
