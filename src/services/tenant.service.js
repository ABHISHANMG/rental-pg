/**
 * Tenant management (role: PG_OWNER) — API_CONTRACT.md §TENANTS.
 *   POST /pgs/{pgId}/tenants                      add tenant to a bed (auto ADVANCE payment)
 *   GET  /pgs/{pgId}/tenants?active_only=         list tenants
 *   GET  /pgs/{pgId}/tenants/{tenantId}           one tenant (with shift_history)
 *   POST /pgs/{pgId}/tenants/{tenantId}/move      move to another bed
 *   POST /pgs/{pgId}/tenants/{tenantId}/leave     vacate (optional refund)
 *
 * These endpoints exist in the contract but are not yet wired to a screen; the service is
 * provided so the backend capability is integrated and ready to consume.
 */

import { http, endpoints } from './api';

export async function addTenant(pgId, payload) {
  // payload: { bed_id, name, phone, email?, joining_date, advance_amount?, monthly_rent, id_proof?, notes? }
  return http.post(endpoints.tenants(pgId), payload);
}

export async function getTenants(pgId, { activeOnly = false } = {}) {
  return http.get(endpoints.tenants(pgId), { query: { active_only: activeOnly } });
}

export async function getTenant(pgId, tenantId) {
  return http.get(endpoints.tenant(pgId, tenantId));
}

export async function moveTenant(pgId, tenantId, { toBedId, reason } = {}) {
  return http.post(endpoints.tenantMove(pgId, tenantId), { to_bed_id: toBedId, reason });
}

export async function leaveTenant(pgId, tenantId, payload) {
  // payload: { leaving_date, refund_advance?, refund_amount?, refund_method?, refund_transaction_id? }
  return http.post(endpoints.tenantLeave(pgId, tenantId), payload);
}
