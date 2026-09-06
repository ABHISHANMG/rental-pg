# Zaptel — Backend API Contract (v1)

This document is the source of truth for building the Zaptel backend. It is derived
from the shipped React Native app and its mock service layer
(`src/services/*.service.js`), so every endpoint here maps 1:1 to a call the app
already makes. Implementing these lets the app swap its mock layer for real HTTP with
**no UI changes**.

---

## 1. Conventions

| Aspect | Rule |
|---|---|
| Base URL | `https://api.zaptel.app/v1` (configurable via `EXPO_PUBLIC_API_URL`) |
| Format | JSON request + response, `Content-Type: application/json` |
| Auth | `Authorization: Bearer <accessToken>` — **sellers only**. Consumer browse/enquire/review endpoints are **public** (no auth). |
| Timestamps | ISO 8601 UTC strings (e.g. `2026-09-06T18:30:00.000Z`) |
| IDs | Opaque strings (e.g. `pg_7f3a`, `bkg_91c2`) |
| Money | Integer rupees (₹), no decimals |
| Pagination | `?page=1&limit=20` → response wraps list in `{ data, page, limit, total, hasMore }` |
| Empty results | `200` with `data: []` (never `404` for "no matches") |

### Two audiences

- **Consumer (public, anonymous):** browses PGs, sends enquiries (leaves name + phone),
  writes reviews, calls owners directly. **No account, no login.**
- **Seller (authenticated):** signs in, manages properties/rooms/beds, works leads,
  approves/rejects bookings, reads enquiries + dashboard stats.

### Error envelope

All non-2xx responses use:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable summary",
    "fields": { "phone": "Enter a valid 10-digit number" }
  }
}
```

Common `code` values: `VALIDATION_ERROR` (400), `UNAUTHENTICATED` (401),
`FORBIDDEN` (403), `NOT_FOUND` (404), `CONFLICT` (409), `RATE_LIMITED` (429),
`INTERNAL` (500).

---

## 2. Auth — sellers only

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/auth/register` | – | Create a seller account (owner details) |
| POST | `/auth/login` | – | Request an OTP for a phone number |
| POST | `/auth/verify-otp` | – | Verify OTP → issue tokens |
| POST | `/auth/refresh` | – | Exchange refresh token for a new access token |
| POST | `/auth/logout` | Bearer | Invalidate the refresh token |
| GET | `/auth/me` | Bearer | Current seller profile |
| PATCH | `/auth/me` | Bearer | Update profile + business info |

**POST `/auth/login`**
```json
// req
{ "phone": "+91 98765 43210" }
// res 200
{ "otpSent": true, "expiresInSec": 120 }
```

**POST `/auth/verify-otp`**
```json
// req
{ "phone": "+91 98765 43210", "otp": "1234" }
// res 200
{
  "accessToken": "jwt...",
  "refreshToken": "jwt...",
  "user": { "id": "usr_1", "role": "seller", "name": "Ravi Teja", "phone": "+91 98490 11111", "email": "" }
}
```

**PATCH `/auth/me`** (business / KYC fields the Personal-information screen edits)
```json
{
  "name": "Ravi Teja",
  "phone": "+91 98490 11111",
  "email": "ravi@urbannest.in",
  "businessName": "Urban Nest Living",
  "gst": "36AAAAA0000A1Z5",
  "pan": "ABCDE1234F",
  "businessAddress": "Plot 42, Madhapur, Hyderabad",
  "since": "2019"
}
```

---

## 3. Public — PG discovery

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/pgs` | – | List / search / filter PGs (paginated) |
| GET | `/pgs/:id` | – | Full PG detail |
| GET | `/pgs/:id/rooms` | – | Room + bed availability for a PG |
| GET | `/pgs/batch?ids=a,b,c` | – | Resolve many PGs by id (powers Saved / favorites) |
| GET | `/cities` | – | Cities list (location picker) |
| GET | `/localities?city=Hyderabad` | – | Popular localities for a city |

**GET `/pgs`** — query params (all optional; combine freely):

| Param | Type | Notes |
|---|---|---|
| `q` | string | Free-text over name / locality / city (debounced client-side) |
| `city` | string | e.g. `Hyderabad` |
| `locality` | string | e.g. `Madhapur` |
| `gender` | enum | `MALE` \| `FEMALE` \| `UNISEX` |
| `propertyTypes` | csv enum | `PG,HOSTEL,COLIVING` |
| `roomTypes` | csv enum | `SINGLE,DOUBLE,TRIPLE,FOUR_SHARING` (matches on any) |
| `amenities` | csv string | must have **all** listed amenity keys |
| `foodIncluded` | boolean | shortcut for amenity `food` |
| `minRent` / `maxRent` | int | on the PG's cheapest room |
| `availableOnly` | boolean | only PGs with ≥1 free bed |
| `sort` | enum | `recommended` (default: available first, then rating desc) \| `price_asc` \| `price_desc` \| `rating` |
| `page` / `limit` | int | pagination |

```json
// res 200
{
  "data": [ { /* PG summary — see model §11 */ } ],
  "page": 1, "limit": 20, "total": 42, "hasMore": true
}
```

> The app also renders "Recommended" and "Nearby" rails on Home. These are just
> `/pgs?sort=rating` and `/pgs?city=<selected>` — no dedicated endpoints required, but
> `GET /pgs/recommended` and `GET /pgs/nearby?lat=&lng=` MAY be added for server-side
> curation later.

---

## 4. Public — Enquiries (consumer → owner)

The consumer is anonymous, so the enquiry body carries their contact details.

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/pgs/:id/enquiries` | – | Send an enquiry to a property owner |

```json
// req
{
  "name": "Aarav Sharma",
  "phone": "+91 98765 43210",
  "moveInDate": "2026-09-21T00:00:00.000Z",
  "budget": 10000,
  "roomType": "DOUBLE",
  "message": "Is food included?"
}
// res 201
{ "id": "enq_1", "status": "NEW", "createdAt": "2026-09-06T18:30:00.000Z" }
```

Rules: `name` (≥2 chars) and `phone` (valid) are **required**; everything else optional.
Server records `pgId`, `pgName`, `sellerId` and emits `enquiry.created` (see §10).

---

## 5. Public — Reviews & ratings

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/pgs/:id/reviews` | – | List reviews (paginated), newest first |
| POST | `/pgs/:id/reviews` | – | Submit a rating + written feedback |

```json
// GET res 200
{
  "data": [
    { "id": "rev_1", "name": "Sneha R.", "rating": 5, "comment": "Clean rooms…", "createdAt": "2026-08-31T…" }
  ],
  "summary": { "average": 4.4, "count": 133 },
  "page": 1, "limit": 20, "total": 133, "hasMore": true
}
```

```json
// POST req  (name optional → stored as "Anonymous")
{ "rating": 4, "comment": "Safe and well maintained.", "name": "Priya M." }
// res 201
{ "id": "rev_9", "rating": 4, "comment": "…", "name": "Priya M.", "createdAt": "…" }
```

Rules: `rating` 1–5 required; `comment` ≥3 chars required. Posting a review should
recompute and return the PG's `rating` + `reviewCount` (or update them async).

---

## 6. Favorites (optional — client-local today)

The app currently keeps the shortlist in device state. These endpoints let it sync to
an account later (would require a lightweight consumer identity / device token).

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/favorites` | Device/Bearer | List saved PG ids |
| POST | `/favorites` | Device/Bearer | Add `{ pgId }` |
| DELETE | `/favorites/:pgId` | Device/Bearer | Remove |

---

## 7. Seller — properties

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/seller/properties` | Bearer | Owner's listings (with status + occupancy) |
| POST | `/seller/properties` | Bearer | Create a listing (Add-PG wizard) → `PENDING_VERIFICATION` |
| GET | `/seller/properties/:id` | Bearer | One listing (management screen) |
| PATCH | `/seller/properties/:id` | Bearer | Edit any field |
| DELETE | `/seller/properties/:id` | Bearer | Remove a listing |
| PATCH | `/seller/properties/:id/status` | Bearer | `{ "isActive": true }` → ACTIVE / INACTIVE |

**POST `/seller/properties`** — mirrors the wizard output (note `floor`, custom room
types, and free-text custom amenities):

```json
{
  "name": "Urban Nest PG",
  "description": "A modern co-living space…",
  "propertyType": "PG",
  "gender": "UNISEX",
  "address": {
    "addressLine": "Plot 42, Silicon Valley Rd",
    "locality": "Madhapur", "city": "Hyderabad", "state": "Telangana",
    "pincode": "500081", "latitude": 17.4483, "longitude": 78.3915
  },
  "images": ["https://cdn.zaptel.app/uploads/abc.jpg"],
  "amenities": ["wifi", "ac", "food", "Gym"],
  "rooms": [
    { "roomType": "DOUBLE", "floor": "1", "totalBeds": 10, "availableBeds": 4, "monthlyRent": 8500, "securityDeposit": 17000 },
    { "roomType": "Deluxe Suite", "floor": "2", "totalBeds": 2, "availableBeds": 2, "monthlyRent": 20000, "securityDeposit": 40000 }
  ],
  "charges": { "maintenance": 500, "food": 0, "other": 0 },
  "rules": { "checkIn": "12:00 PM", "checkOut": "11:00 AM", "visitors": "Allowed till 9 PM", "smoking": "Not allowed", "noticePeriod": "30 days" }
}
```

- `amenities[]` mixes catalog keys (`wifi`, `ac`, …) and free-text custom labels
  (`"Gym"`). Server should store both; unknown = custom.
- `roomType` is a catalog enum **or** a free-text custom name.

---

## 8. Seller — rooms & beds

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/seller/properties/:id/rooms` | Bearer | Add a room type |
| PATCH | `/rooms/:roomId` | Bearer | Edit room (rent/deposit/floor/type) |
| DELETE | `/rooms/:roomId` | Bearer | Remove a room |
| PATCH | `/rooms/:roomId/availability` | Bearer | Set free-bed count |

**PATCH `/rooms/:roomId/availability`** (the ± stepper on the management screen):
```json
// req
{ "availableBeds": 3 }
// res 200 → updated room; emits bed.availability.updated
```

---

## 9. Seller — leads, enquiries, bookings, dashboard

### Leads
| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/seller/leads?status=NEW` | Bearer | Leads across the owner's PGs |
| GET | `/seller/leads/:id` | Bearer | One lead |
| PATCH | `/seller/leads/:id` | Bearer | `{ "status": "CONTACTED" }` (+ sets `lastContacted`) |

A **lead** is an enquiry from the owner's side — same underlying record, enriched with
the prospect's name/phone and a pipeline `status`.

### Enquiries (read)
| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/seller/enquiries` | Bearer | Chronological "who reached out" feed |

### Bookings
| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/seller/bookings?status=PENDING` | Bearer | Booking requests for the owner |
| PATCH | `/seller/bookings/:id/status` | Bearer | `{ "status": "APPROVED" }` — approve / reject |

> **Consumer booking is not part of the current app** (consumers call or enquire
> instead). The booking objects the seller sees come from a future consumer booking
> flow. If/when that returns, add: `POST /bookings`, `GET /bookings`,
> `GET /bookings/:id`, and the payment endpoints in §12. The status lifecycle below is
> already reserved for it.

### Dashboard
| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/seller/dashboard/stats` | Bearer | Aggregates for the dashboard |

```json
// res 200
{
  "totalProperties": 5, "activeProperties": 4,
  "totalBeds": 118, "occupiedBeds": 79, "availableBeds": 39,
  "pendingEnquiries": 2, "pendingBookings": 1,
  "monthlyRevenue": 612000
}
```

---

## 10. Realtime — WebSocket

Single multiplexed connection: `wss://api.zaptel.app/v1/ws?token=<accessToken>`
(token required for seller channels; public read channels may be added for live
availability). Client joins rooms and receives events; server never expects the client
to mutate via WS (all writes go through REST).

**Client → server**
```json
{ "type": "room.join", "room": "seller:usr_1" }
{ "type": "room.join", "room": "pg:pg_001" }
```

**Server → client events**
| Event | Payload | Fired to |
|---|---|---|
| `enquiry.created` | `{ enquiry }` | `seller:<id>` |
| `booking.created` | `{ booking }` | `seller:<id>` |
| `booking.status_changed` | `{ id, status }` | `seller:<id>`, booking owner |
| `bed.availability.updated` | `{ pgId, roomId, availableBeds }` | `pg:<pgId>`, `seller:<id>` |
| `property.updated` | `{ pgId }` | `pg:<pgId>` |
| `review.created` | `{ pgId, review, summary }` | `pg:<pgId>` |

Clients should patch cached data from these events rather than refetching whole screens.

---

## 11. Data models

```ts
type Role = 'consumer' | 'seller';

type PropertyType = 'PG' | 'HOSTEL' | 'COLIVING';
type Gender = 'MALE' | 'FEMALE' | 'UNISEX';
type RoomType = 'SINGLE' | 'DOUBLE' | 'TRIPLE' | 'FOUR_SHARING' | string; // string = custom

interface PG {
  id: string;
  sellerId: string;
  name: string;
  description: string;
  propertyType: PropertyType;
  gender: Gender;
  address: {
    addressLine: string; locality: string; city: string; state: string;
    pincode: string; latitude: number; longitude: number;
  };
  images: string[];               // ordered; [0] = cover
  amenities: string[];            // catalog keys + custom labels
  rooms: Room[];
  charges: { maintenance: number; food: number; other: number };
  rules: {
    checkIn: string; checkOut: string; visitors: string;
    smoking: string; alcohol?: string; noticePeriod: string;
  };
  rating: number;                 // 0–5, derived from reviews
  reviewCount: number;
  isVerified: boolean;
  isActive: boolean;
  status: PropertyStatus;         // seller-facing
  seller: { name: string; phone: string; since: string };  // public contact for "Call"
  createdAt: string; updatedAt: string;
}

interface Room {
  id: string;
  roomType: RoomType;
  floor?: string;                 // "Ground" | "1" | "2" | …
  totalBeds: number;
  availableBeds: number;
  monthlyRent: number;
  securityDeposit: number;
  amenities: string[];
}

interface Enquiry {
  id: string; pgId: string; pgName: string; sellerId: string;
  name: string; phone: string;
  moveInDate?: string; budget?: number; roomType?: RoomType; message?: string;
  status: LeadStatus;             // pipeline state (owner side)
  lastContacted?: string | null;
  createdAt: string;
}

interface Review {
  id: string; pgId: string;
  name: string;                   // "Anonymous" if omitted
  rating: number;                 // 1–5
  comment: string;
  createdAt: string;
}

interface Booking {              // future consumer flow
  id: string; pgId: string; pgName: string; roomId: string; roomType: RoomType;
  name: string; phone: string;
  moveInDate: string; durationMonths: number;
  amount: number;                 // first month rent + deposit
  status: BookingStatus; paymentStatus: 'UNPAID' | 'PAID';
  createdAt: string;
}
```

### Enums

```ts
type PropertyStatus = 'DRAFT' | 'PENDING_VERIFICATION' | 'ACTIVE' | 'INACTIVE' | 'REJECTED';
type LeadStatus     = 'NEW' | 'CONTACTED' | 'INTERESTED' | 'CONVERTED' | 'CLOSED';
type BookingStatus  = 'PENDING' | 'APPROVED' | 'PAYMENT_PENDING' | 'CONFIRMED'
                    | 'CANCELLED' | 'REJECTED' | 'COMPLETED';
```

### Amenity catalog keys
`wifi, ac, food, washing_machine, parking, power_backup, housekeeping, cctv, security,
attached_bathroom, laundry, common_area` — plus arbitrary custom labels.

---

## 12. Media upload

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/uploads` | Bearer | `multipart/form-data` image(s) → hosted URLs |

```json
// res 201
{ "urls": ["https://cdn.zaptel.app/uploads/abc.jpg"] }
```

Backed by Cloudinary or S3. The app's Add-PG "Camera / Upload" step first uploads local
files here, then submits the returned URLs inside `POST /seller/properties`.

---

## 13. Notifications (mock in app today)

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/notifications` | Bearer/Device | Feed for the current user |
| PATCH | `/notifications/:id/read` | Bearer/Device | Mark read |
| POST | `/notifications/register-device` | Bearer/Device | Register Expo/FCM push token |

Triggers: enquiry received, booking request, booking status change, availability change,
review posted, price drop.

---

## 14. Payments (future)

Reserved for when consumer bookings return. Do **not** trust client-supplied pricing —
always recompute server-side from the room + property.

| Method | Path | Purpose |
|---|---|---|
| POST | `/payments/create` | Create a Razorpay order for a booking |
| POST | `/payments/verify` | Verify signature → mark booking `CONFIRMED` |

---

## 15. Build order (suggested)

1. **Auth** (seller) + `GET /auth/me` / `PATCH /auth/me`.
2. **Public PGs** (`GET /pgs`, `/pgs/:id`, `/pgs/:id/rooms`) — unblocks the whole
   consumer browse experience.
3. **Enquiries** + **Reviews** (public POST/GET) — completes consumer flow.
4. **Seller properties + rooms/beds** (CRUD, availability) + **uploads**.
5. **Leads, seller bookings, dashboard stats**.
6. **WebSocket** events + **notifications** + push.
7. **Payments** (only if consumer booking is reintroduced).

Every endpoint above already has a matching function in the app's service layer, so the
frontend integration is: point `API_CONFIG.baseUrl` at the server and replace the mock
bodies in `src/services/*.service.js` with `fetch` calls — screens, hooks and stores
stay untouched.
