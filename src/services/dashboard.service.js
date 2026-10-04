/**
 * Dashboard & reports (role: PG_OWNER) — API_CONTRACT.md §DASHBOARD & REPORTS.
 *   GET /dashboard?pg_id=&year=&month=      occupancy + revenue snapshot
 *   GET /dashboard/report?pg_id=&start=&end=  range report (start/end required, end exclusive)
 *
 * `getSellerStats` in seller.service also calls /dashboard (mapped to the legacy stats
 * shape); these return the raw contract objects for richer, report-style screens.
 */

import { http, endpoints } from './api';

export async function getDashboard({ pgId, year, month } = {}) {
  return http.get(endpoints.dashboard, { query: { pg_id: pgId, year, month } });
}

export async function getDashboardReport({ pgId, start, end }) {
  // start/end are required ISO dates; end is exclusive.
  return http.get(endpoints.dashboardReport, { query: { pg_id: pgId, start, end } });
}
