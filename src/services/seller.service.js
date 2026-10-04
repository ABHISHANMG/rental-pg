/**
 * Seller (PG_OWNER) service — fully backed by the real API (base contract + v1.1).
 *   GET   /pgs                        my PGs
 *   GET   /pgs/{id}/structure         floors/rooms/beds tree (for bed counts)
 *   POST  /pgs (+floors/rooms/beds)   create a PG and its structure
 *   PATCH /pgs/{id}                   update a PG (e.g. activate/deactivate)
 *   GET   /dashboard                  occupancy + revenue stats
 *   GET   /leads                      leads on my PGs                       (v1.1)
 *   PATCH /leads/{id}                 advance a lead                        (v1.1)
 *   GET   /bookings?owner=true        bookings on my PGs                    (v1.1)
 *   PATCH /bookings/{id}/status       approve/reject/advance a booking      (v1.1)
 */

import { http, endpoints, request } from './api';
import { updateBookingStatus } from './booking.service';
import {
  buildCreatePgBody,
  buildUpdatePgBody,
  mapPgDetail,
  mapEnquiry,
  mapBooking,
  roomTypeToApi,
} from './mappers';

// ===========================================================================
// PROPERTIES
// ===========================================================================

/** Fetch a PG's structure and map it to the UI detail shape (with real bed counts). */
async function fetchPropertyDetail(pgId) {
  const data = await http.get(endpoints.pgStructure(pgId));
  return mapPgDetail(data.pg || data, { floors: data.floors });
}

export async function getSellerProperties() {
  const list = await http.get(endpoints.pgs);
  const detailed = await Promise.allSettled((list || []).map((pg) => fetchPropertyDetail(pg.id)));
  return detailed.filter((r) => r.status === 'fulfilled').map((r) => r.value);
}

export async function getSellerPropertyById(id) {
  try {
    return await fetchPropertyDetail(id);
  } catch (e) {
    if (e?.status === 404) {
      const err = new Error('Property not found');
      err.code = 'NOT_FOUND';
      throw err;
    }
    throw e;
  }
}

/**
 * Create a PG and its structure. POST /pgs, then one floor, then a room per wizard room,
 * then `totalBeds` beds per room (new beds start AVAILABLE). A PG is created VERIFIED &
 * active by default in v1.1.
 */
export async function addProperty(data) {
  const created = await http.post(endpoints.pgs, buildCreatePgBody(data));
  const pgId = created.id;

  const rooms = data.rooms || [];
  if (rooms.length) {
    const floor = await http.post(endpoints.floors(pgId), { name: 'Floor 1' });
    for (const room of rooms) {
      const createdRoom = await http.post(endpoints.rooms(pgId), {
        floor_id: floor.id,
        room_number: room.floor ? `${room.floor}` : `${room.roomType}`,
        room_type: roomTypeToApi(room.roomType),
        is_ac: !!(room.amenities || []).includes('ac'),
        rent: Number(room.monthlyRent) || 0,
      });
      const bedCount = Number(room.totalBeds) || 0;
      for (let i = 0; i < bedCount; i += 1) {
        await http.post(endpoints.beds(pgId), {
          room_id: createdRoom.id,
          bed_number: String.fromCharCode(65 + (i % 26)) + (i >= 26 ? Math.floor(i / 26) : ''),
          rent: Number(room.monthlyRent) || 0,
        });
      }
    }
  }
  return fetchPropertyDetail(pgId);
}

/** Show/hide a listing — PATCH /pgs/{id} { is_active } (v1.1). */
export async function setPropertyActive(id, active) {
  const updated = await http.patch(endpoints.pg(id), buildUpdatePgBody({ isActive: active }));
  return mapPgDetail(updated);
}

/**
 * NO BACKEND ENDPOINT. Bed availability is driven by tenant add/leave/move, not a direct
 * "set available beds" call. Kept as a resolved no-op. (UNSUPPORTED_ENDPOINTS.md)
 */
export async function updateRoomAvailability(propId, roomId, availableBeds) {
  return request({ propId, roomId, availableBeds }, { latency: 150 });
}

// ===========================================================================
// DASHBOARD STATS
// ===========================================================================
export async function getSellerStats() {
  const [dash, leads, bookings] = await Promise.allSettled([
    http.get(endpoints.dashboard),
    http.get(endpoints.leads),
    http.get(endpoints.bookings, { query: { owner: true } }),
  ]);
  const d = dash.status === 'fulfilled' ? dash.value || {} : {};
  const leadList = leads.status === 'fulfilled' ? leads.value || [] : [];
  const bookingList = bookings.status === 'fulfilled' ? bookings.value || [] : [];

  return {
    totalProperties: d.total_pgs ?? 0,
    activeProperties: d.total_pgs ?? 0,
    totalBeds: d.total_beds ?? 0,
    occupiedBeds: d.occupied_beds ?? 0,
    availableBeds: d.available_beds ?? 0,
    monthlyRevenue: d.collected_revenue ?? 0,
    pendingEnquiries: leadList.filter((l) => l.status === 'NEW').length,
    pendingBookings: bookingList.filter((b) => b.status === 'PENDING').length,
  };
}

// ===========================================================================
// LEADS (v1.1)
// ===========================================================================
export async function getLeads() {
  const list = await http.get(endpoints.leads);
  return (list || []).map(mapEnquiry);
}

export async function updateLeadStatus(id, status) {
  return mapEnquiry(await http.patch(endpoints.lead(id), { status }));
}

// ===========================================================================
// BOOKINGS (v1.1)
// ===========================================================================
export async function getSellerBookings() {
  const list = await http.get(endpoints.bookings, { query: { owner: true } });
  return (list || []).map(mapBooking);
}

/** Approve/reject/advance a booking; optional payment_status flag. */
export async function updateSellerBookingStatus(id, status, paymentStatus) {
  return updateBookingStatus(id, status, paymentStatus);
}
