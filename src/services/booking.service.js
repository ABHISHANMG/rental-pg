/**
 * Enquiry + booking service (mock, in-memory).
 * Mirrors: POST /enquiries, GET /enquiries, POST /bookings, GET /bookings, GET /bookings/:id
 *
 * State lives in module-level arrays for the mock milestone. A real implementation
 * swaps these for network calls while keeping identical signatures.
 */

import { request } from './api';
import { makeId } from '@/utils';

const _enquiries = [];
const _bookings = [];

// Non-delayed accessors so the seller service can merge consumer-created records into
// its leads/bookings without triggering another simulated round-trip.
export function peekEnquiries() {
  return _enquiries;
}
export function peekBookings() {
  return _bookings;
}

export async function createEnquiry(data) {
  const enquiry = {
    id: makeId('enq'),
    status: 'NEW',
    createdAt: new Date().toISOString(),
    ...data,
  };
  _enquiries.unshift(enquiry);
  return request(enquiry, { latency: 500 });
}

export async function getEnquiries() {
  return request(_enquiries);
}

export async function createBooking(data) {
  const booking = {
    id: makeId('bkg'),
    status: 'PENDING',
    paymentStatus: 'UNPAID',
    createdAt: new Date().toISOString(),
    ...data,
  };
  _bookings.unshift(booking);
  return request(booking, { latency: 600 });
}

export async function getBookings() {
  return request(_bookings);
}

export async function getBookingById(id) {
  const booking = _bookings.find((b) => b.id === id);
  if (!booking) {
    const err = new Error('Booking not found');
    err.code = 'NOT_FOUND';
    throw err;
  }
  return request(booking);
}

export async function updateBookingStatus(id, status) {
  const booking = _bookings.find((b) => b.id === id);
  if (booking) booking.status = status;
  return request(booking);
}
