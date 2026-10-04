/**
 * Enquiry + booking funnel (v1.1 addendum).
 *   POST /enquiries            raise an enquiry (consumer)        -> enquiry
 *   GET  /enquiries            my enquiries (consumer)            -> [enquiry]
 *   POST /bookings             request a booking (consumer)       -> booking
 *   GET  /bookings             my bookings (consumer)             -> [booking]
 *   GET  /bookings/{id}        one booking (consumer or owner)    -> booking
 *   PATCH /bookings/{id}/status approve/reject/advance (owner)    -> booking
 *
 * Owner-side lead/booking listing lives in seller.service.
 */

import { http, endpoints } from './api';
import { mapEnquiry, buildEnquiryBody, mapBooking, buildBookingBody } from './mappers';

// --- Enquiries -------------------------------------------------------------
export async function createEnquiry(data) {
  const e = await http.post(endpoints.enquiries, buildEnquiryBody(data));
  return mapEnquiry(e);
}

export async function getEnquiries() {
  const list = await http.get(endpoints.enquiries);
  return (list || []).map(mapEnquiry);
}

// --- Bookings --------------------------------------------------------------
export async function createBooking(data) {
  const b = await http.post(endpoints.bookings, buildBookingBody(data));
  return mapBooking(b);
}

/** Consumer's own bookings (owner=false). */
export async function getBookings() {
  const list = await http.get(endpoints.bookings, { query: { owner: false } });
  return (list || []).map(mapBooking);
}

export async function getBookingById(id) {
  try {
    return mapBooking(await http.get(endpoints.booking(id)));
  } catch (e) {
    if (e?.status === 404) {
      const err = new Error('Booking not found');
      err.code = 'NOT_FOUND';
      throw err;
    }
    throw e;
  }
}

/** Advance a booking's status (owner only). `payment_status` optional. */
export async function updateBookingStatus(id, status, paymentStatus) {
  const body = { status };
  if (paymentStatus != null) body.payment_status = paymentStatus;
  return mapBooking(await http.patch(endpoints.bookingStatus(id), body));
}
