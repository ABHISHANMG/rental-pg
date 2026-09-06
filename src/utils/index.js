/**
 * Pure helper functions. No side effects, no imports from screens/stores.
 */

// ₹ formatting with Indian digit grouping (e.g. 1,20,000).
export function formatMoney(value) {
  if (value == null || isNaN(value)) return '₹0';
  return '₹' + Number(value).toLocaleString('en-IN');
}

// Compact form: ₹2.1L, ₹85k etc — used for dashboard-style stats.
export function formatCompactMoney(value) {
  if (value == null || isNaN(value)) return '₹0';
  const n = Number(value);
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1).replace(/\.0$/, '')}Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1).replace(/\.0$/, '')}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  return `₹${n}`;
}

export function getMinRent(pg) {
  if (!pg?.rooms?.length) return 0;
  return Math.min(...pg.rooms.map((r) => r.monthlyRent));
}

export function getTotalBeds(pg) {
  return (pg?.rooms || []).reduce((sum, r) => sum + r.totalBeds, 0);
}

export function getAvailableBeds(pg) {
  return (pg?.rooms || []).reduce((sum, r) => sum + r.availableBeds, 0);
}

// The room type shown as the headline on the card = cheapest available room,
// falling back to the cheapest room overall.
export function getHeadlineRoom(pg) {
  const rooms = pg?.rooms || [];
  if (!rooms.length) return null;
  const available = rooms.filter((r) => r.availableBeds > 0);
  const pool = available.length ? available : rooms;
  return pool.reduce((min, r) => (r.monthlyRent < min.monthlyRent ? r : min), pool[0]);
}

export function greeting(date = new Date()) {
  const h = date.getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d)) return '';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

// Lightweight id generator for mock records (no crypto dependency).
let _seq = 0;
export function makeId(prefix = 'id') {
  _seq += 1;
  return `${prefix}_${Date.now().toString(36)}_${_seq}`;
}
