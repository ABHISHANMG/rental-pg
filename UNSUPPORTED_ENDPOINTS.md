# Endpoints NOT in the API (remaining gaps)

After the **v1.1 addendum** (`API_CONTRACT_V1.1.md`) the backend now covers almost
everything the app needs. This file tracks only what's *still* unsupported, and how the
app handles it.

Legend: **MOCK** (in-memory) · **NO-OP** (resolves without a call) · **CLIENT-ONLY**
(app/store state) · **DEGRADED** (mapped onto an existing endpoint, losing fidelity).

---

## Still unsupported

### 1. Notifications feed — **MOCK** (intentional)
The addendum declares the notifications feed out of scope.

| App need | Expected endpoint | Used by | Status |
|---|---|---|---|
| Notifications feed | `GET /notifications` | `app/notifications.jsx` | MOCK (hardcoded array) |

### 2. Direct bed-availability edit — **NO-OP**
Bed availability is driven by tenant add/leave/move, not a "set available beds" call, so
there's no endpoint for the seller's manual availability stepper.

| App need | Expected support | Used by | Status |
|---|---|---|---|
| Set a room's available-bed count directly | — (use tenants) | `property/[id].jsx` → `updateRoomAvailability` | NO-OP |

### 3. Payment-gateway settlement — intentional
`booking.payment_status` is a **manual flag** the owner toggles via
`PATCH /bookings/{id}/status` (fully integrated). There is no real payment gateway /
settlement flow, by design.

### 4. Minor field gaps — **CLIENT-ONLY / DEGRADED**
| App need | Note | Status |
|---|---|---|
| Edit mobile number in profile | Backend keys identity off the OTP phone; no change-phone endpoint. `name`/`email`/`profile` persist via `PATCH /auth/me`. | CLIENT-ONLY (phone only) |
| PG geo lat/lng | No dedicated fields; derived from `google_maps_link` when it contains coords, else the map card shows "locality, city". | DEGRADED |
| Listing partially-occupied rooms on create | New beds are created `AVAILABLE`; `availableBeds < totalBeds` needs tenants. Occupancy becomes real as tenants are added. | DEGRADED |
| Listing photos from the add-PG wizard | Wizard photos are local device URIs; uploading them needs the media presign→R2→confirm flow (`media.service`), not yet wired into the wizard. New listings show "No photos yet". | not wired |

---

## Now integrated (was unsupported in the base contract)

Everything below is wired to the real API and verified end-to-end:

- **Auth:** `PATCH /auth/me` (name/email + role `profile`), `POST /auth/logout`; user object carries `email`, `profile`, `created_at`.
- **PGs:** `state`, `pincode`, `property_type`, `house_rules`, `contact.since`, `is_active` (activate/deactivate), `verification_status`/`is_verified`, `updated_at`.
- **Search:** free-text `q`, repeatable `room_type`, repeatable `property_type`; inactive/rejected listings excluded server-side.
- **Reviews:** `GET /pg/{id}/reviews` with reviewer `name`.
- **Enquiries/Leads:** `POST`/`GET /enquiries`, `GET /leads`, `PATCH /leads/{id}` — replaces the old mock lead funnel.
- **Bookings:** `POST`/`GET /bookings`, `GET /bookings/{id}`, `PATCH /bookings/{id}/status` (incl. `payment_status`) — replaces the old mock booking funnel.
- **Constants:** new enum lists (`property_types`, `verification_statuses`, `lead_statuses`, `booking_statuses`, `booking_payment_statuses`).

### Owner tools integrated but not yet surfaced in a screen
Available in the service layer, ready to consume: **tenants** (`tenant.service`),
**payments** (`payment.service`), **media** upload (`media.service`), **dashboard report**
(`dashboard.service`), and PG `DELETE`/`PATCH`.
