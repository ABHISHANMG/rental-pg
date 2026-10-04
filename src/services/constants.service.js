/**
 * Constants service — GET /constants.
 * Drives dropdowns (cities, areas per city, amenities, enum lists). Cached in-module
 * after first fetch since it rarely changes within a session.
 */

import { http, endpoints } from './api';

let _cache = null;

export async function getConstants({ force = false } = {}) {
  if (_cache && !force) return _cache;
  _cache = await http.get(endpoints.constants, { auth: false });
  return _cache;
}

export function peekConstants() {
  return _cache;
}
