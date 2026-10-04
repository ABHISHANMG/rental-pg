/**
 * Payments (role: PG_OWNER) — API_CONTRACT.md §PAYMENTS.
 *   POST /payments                                  create pending/completed payment
 *   POST /payments/{pgId}/{paymentId}/complete      mark completed (method + txn id)
 *   GET  /payments?pg_id=&tenant_id=&category=&status=   list (newest first)
 *
 * Contract endpoints integrated for future screens (not yet consumed by the UI).
 */

import { http, endpoints } from './api';

export async function createPayment(payload) {
  // payload: { pg_id, tenant_id?, category, amount, period?, status, method?, transaction_id?, note? }
  return http.post(endpoints.payments, payload);
}

export async function completePayment(pgId, paymentId, { method, transactionId, note } = {}) {
  return http.post(endpoints.paymentComplete(pgId, paymentId), {
    method,
    transaction_id: transactionId,
    note,
  });
}

export async function getPayments({ pgId, tenantId, category, status } = {}) {
  return http.get(endpoints.payments, {
    query: { pg_id: pgId, tenant_id: tenantId, category, status },
  });
}
