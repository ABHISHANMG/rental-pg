/**
 * Seller service (mock, in-memory). Mirrors the future REST contract for the owner
 * side: GET /pgs?owner, POST /pgs, PATCH /pgs/:id, PATCH /rooms/:id, GET /leads,
 * GET /bookings?owner, PATCH /bookings/:id/status.
 *
 * The demo seller "owns" a curated subset of the catalog so dashboards have real
 * numbers. All mutations happen on module-level copies, exactly like a cache that a
 * real API would later back.
 */

import { MOCK_PGS } from './mock/pgs';
import { request } from './api';
import { peekBookings, peekEnquiries, updateBookingStatus } from './booking.service';
import { makeId, getTotalBeds, getAvailableBeds } from '@/utils';

const OWNED_IDS = ['pg_001', 'pg_002', 'pg_003', 'pg_004', 'pg_010'];

function daysFromNow(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}
function daysAgo(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

// Deep-copy owned catalog entries and attach a seller-facing status.
let _properties = MOCK_PGS.filter((p) => OWNED_IDS.includes(p.id)).map((p) => {
  const copy = JSON.parse(JSON.stringify(p));
  copy.status = copy.isActive ? (copy.isVerified ? 'ACTIVE' : 'PENDING_VERIFICATION') : 'INACTIVE';
  return copy;
});

let _leads = [
  { id: 'lead_1', name: 'Aarav Sharma', phone: '+91 98765 43210', pgId: 'pg_001', pgName: 'Urban Nest PG', roomType: 'DOUBLE', budget: 9000, moveInDate: daysFromNow(10), status: 'NEW', lastContacted: null, message: 'Is food included?' },
  { id: 'lead_2', name: 'Sneha Gupta', phone: '+91 99001 23456', pgId: 'pg_001', pgName: 'Urban Nest PG', roomType: 'SINGLE', budget: 14000, moveInDate: daysFromNow(30), status: 'NEW', lastContacted: null, message: '' },
  { id: 'lead_3', name: 'Rohit Verma', phone: '+91 98111 22233', pgId: 'pg_002', pgName: 'The Hive Co-living', roomType: 'SINGLE', budget: 16000, moveInDate: daysFromNow(5), status: 'INTERESTED', lastContacted: daysAgo(1), message: 'Can I visit this weekend?' },
  { id: 'lead_4', name: 'Priya Nair', phone: '+91 90000 55555', pgId: 'pg_003', pgName: 'Lotus Ladies PG', roomType: 'TRIPLE', budget: 7500, moveInDate: daysFromNow(20), status: 'CONTACTED', lastContacted: daysAgo(2), message: '' },
  { id: 'lead_5', name: 'Karan Mehta', phone: '+91 98222 44455', pgId: 'pg_004', pgName: 'Skyline Boys Hostel', roomType: 'FOUR_SHARING', budget: 5500, moveInDate: daysFromNow(15), status: 'CONVERTED', lastContacted: daysAgo(4), message: '' },
  { id: 'lead_6', name: 'Ananya Rao', phone: '+91 97777 88899', pgId: 'pg_010', pgName: 'Powai Lakeview PG', roomType: 'DOUBLE', budget: 15000, moveInDate: daysFromNow(7), status: 'CLOSED', lastContacted: daysAgo(6), message: 'Found another place.' },
];

let _bookings = [
  { id: 'sbk_1', name: 'Rohit Verma', phone: '+91 98111 22233', pgId: 'pg_002', pgName: 'The Hive Co-living', roomType: 'SINGLE', moveInDate: daysFromNow(5), amount: 16500 + 33000, status: 'PENDING', paymentStatus: 'UNPAID', createdAt: daysAgo(0) },
  { id: 'sbk_2', name: 'Sneha Gupta', phone: '+91 99001 23456', pgId: 'pg_001', pgName: 'Urban Nest PG', roomType: 'DOUBLE', moveInDate: daysFromNow(30), amount: 8500 + 17000, status: 'APPROVED', paymentStatus: 'UNPAID', createdAt: daysAgo(1) },
  { id: 'sbk_3', name: 'Meera Iyer', phone: '+91 96543 21098', pgId: 'pg_003', pgName: 'Lotus Ladies PG', roomType: 'TRIPLE', moveInDate: daysFromNow(12), amount: 7500 + 15000, status: 'PAYMENT_PENDING', paymentStatus: 'UNPAID', createdAt: daysAgo(2) },
  { id: 'sbk_4', name: 'Karan Mehta', phone: '+91 98222 44455', pgId: 'pg_004', pgName: 'Skyline Boys Hostel', roomType: 'FOUR_SHARING', moveInDate: daysFromNow(15), amount: 5500 + 11000, status: 'CONFIRMED', paymentStatus: 'PAID', createdAt: daysAgo(5) },
];

// Status overrides for leads derived from consumer enquiries (which live in the
// booking service). Keyed by enquiry id.
const _leadOverrides = {};

// Consumer enquiries → lead shape, merged newest-first ahead of the seeded leads.
function buildLeads() {
  const fromEnquiries = peekEnquiries().map((e) => ({
    id: e.id,
    name: e.name || 'Prospect',
    phone: e.phone || '',
    pgId: e.pgId,
    pgName: e.pgName,
    roomType: e.roomType,
    budget: e.budget,
    moveInDate: e.moveInDate,
    message: e.message || '',
    status: _leadOverrides[e.id]?.status || 'NEW',
    lastContacted: _leadOverrides[e.id]?.lastContacted || null,
  }));
  return [...fromEnquiries, ..._leads];
}

// Consumer bookings + seeded seller bookings, newest-first.
function buildBookings() {
  const fromConsumer = peekBookings().map((b) => ({ ...b, name: b.name || 'Tenant', phone: b.phone || '' }));
  return [...fromConsumer, ..._bookings];
}

// --- Properties ------------------------------------------------------------
// Non-delayed accessor so the consumer catalog (pg.service) can resolve owner-created
// listings for preview without another round-trip.
export function peekSellerProperties() {
  return _properties;
}

export async function getSellerProperties() {
  return request(_properties);
}

export async function getSellerPropertyById(id) {
  const p = _properties.find((x) => x.id === id);
  if (!p) {
    const err = new Error('Property not found');
    err.code = 'NOT_FOUND';
    throw err;
  }
  return request(p);
}

export async function addProperty(data) {
  const property = {
    id: makeId('pg'),
    sellerId: 'me',
    rating: 0,
    reviewCount: 0,
    isVerified: false,
    isActive: false,
    status: 'PENDING_VERIFICATION',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...data,
  };
  _properties = [property, ..._properties];
  return request(property, { latency: 700 });
}

export async function setPropertyActive(id, active) {
  const p = _properties.find((x) => x.id === id);
  if (p) {
    p.isActive = active;
    p.status = active ? 'ACTIVE' : 'INACTIVE';
  }
  return request(p);
}

export async function updateRoomAvailability(propId, roomId, availableBeds) {
  const p = _properties.find((x) => x.id === propId);
  const room = p?.rooms.find((r) => r.id === roomId);
  if (room) room.availableBeds = Math.max(0, Math.min(room.totalBeds, availableBeds));
  return request(p);
}

// --- Leads -----------------------------------------------------------------
export async function getLeads() {
  return request(buildLeads());
}

export async function updateLeadStatus(id, status) {
  const now = new Date().toISOString();
  const seeded = _leads.find((l) => l.id === id);
  if (seeded) {
    seeded.status = status;
    seeded.lastContacted = now;
  } else {
    // lead came from a consumer enquiry — keep the override so it survives refetch
    _leadOverrides[id] = { status, lastContacted: now };
  }
  return request({ id, status, lastContacted: now });
}

// --- Bookings --------------------------------------------------------------
export async function getSellerBookings() {
  return request(buildBookings());
}

export async function updateSellerBookingStatus(id, status) {
  const seeded = _bookings.find((x) => x.id === id);
  if (seeded) {
    seeded.status = status;
    return request(seeded);
  }
  // consumer-created booking — update it in the booking service so the tenant sees it
  return updateBookingStatus(id, status);
}

// --- Dashboard stats -------------------------------------------------------
export async function getSellerStats() {
  const active = _properties.filter((p) => p.status === 'ACTIVE');
  const totalBeds = _properties.reduce((s, p) => s + getTotalBeds(p), 0);
  const availableBeds = _properties.reduce((s, p) => s + getAvailableBeds(p), 0);
  const occupiedBeds = totalBeds - availableBeds;
  // Revenue = occupied beds × their room rent, summed across properties.
  const monthlyRevenue = _properties.reduce(
    (sum, p) => sum + p.rooms.reduce((rs, r) => rs + (r.totalBeds - r.availableBeds) * r.monthlyRent, 0),
    0
  );
  return request({
    totalProperties: _properties.length,
    activeProperties: active.length,
    totalBeds,
    occupiedBeds,
    availableBeds,
    pendingEnquiries: buildLeads().filter((l) => l.status === 'NEW').length,
    pendingBookings: buildBookings().filter((b) => b.status === 'PENDING').length,
    monthlyRevenue,
  });
}
