# PG Management API — Frontend Integration Contract

Base URL (local): `http://127.0.0.1:8000`
Interactive docs: `GET /docs` (Swagger) · `GET /openapi.json`

## Conventions

**Headers**
| Header | When | Value |
|---|---|---|
| `Content-Type` | every request with a JSON body | `application/json` |
| `Authorization` | every protected endpoint | `Bearer <access_token>` |

**IDs** — all resource ids are 24-char Mongo ObjectId strings, returned as `id` (never `_id`).

**Auth model** — one OTP login for both roles. A phone number's `role` is fixed at **first** signup (sending a role on later logins for an existing phone is ignored). Tokens are JWTs; default lifetime 30 days.

**Roles**
- `USER` — PG hunter: search, favourites, reviews.
- `PG_OWNER` — manages PGs, structure, tenants, payments, media, dashboard.

**Error shape** (all 4xx/5xx from business logic):
```json
{ "detail": "Human readable message" }
```
Request-validation errors (bad/missing fields) return **422**:
```json
{ "detail": [ { "loc": ["body","name"], "msg": "...", "type": "..." } ] }
```

**Common status codes**: `200` ok · `401` missing/invalid token · `403` wrong role / not your PG · `404` not found · `409` conflict (e.g. bed occupied) · `422` validation · `502` OTP send failed · `503` R2 not configured.

**Enums**
| Enum | Values |
|---|---|
| role | `USER`, `PG_OWNER` |
| pg_type | `MALE`, `FEMALE`, `CO_LIVING` |
| room_type | `SINGLE`, `DOUBLE`, `TRIPLE`, `DORMITORY` |
| bed status | `AVAILABLE`, `OCCUPIED` |
| payment category | `RENT`, `MAINTENANCE`, `ADVANCE`, `ADVANCE_REFUND`, `AC`, `ELECTRICITY` |
| payment status | `PENDING`, `COMPLETED` |
| payment method | `CASH`, `UPI`, `BANK_TRANSFER` |

---

## Integration flows (sequence)

**1. Login (both roles)**
```
POST /auth/send-otp   { phone, role }      → OTP sent (dev mode returns dev_otp)
POST /auth/verify-otp { phone, otp }       → { access_token, user }
→ store access_token; send as Authorization: Bearer on every protected call
GET  /auth/me                              → current user (validate token on app start)
```

**2. Owner onboarding**
```
POST /pgs                         → pg.id
POST /pgs/{pgId}/floors           → floor.id
POST /pgs/{pgId}/rooms            → room.id   (needs floor_id)
POST /pgs/{pgId}/beds             → bed.id    (needs room_id)   ... repeat per bed
POST /pgs/{pgId}/tenants          → occupies a bed, auto-logs ADVANCE payment
GET  /pgs/{pgId}/structure        → render floors→rooms→beds tree
```

**3. Rent cycle**
```
POST /payments                              → create PENDING rent for the month
POST /payments/{pgId}/{paymentId}/complete  → mark COMPLETED with method + txn id
GET  /payments?pg_id={pgId}&status=PENDING  → dues list
```

**4. Tenant movement / exit**
```
POST /pgs/{pgId}/tenants/{tenantId}/move   → frees old bed, occupies new, appends shift_history
POST /pgs/{pgId}/tenants/{tenantId}/leave  → frees bed, status=VACATED, optional refund payment
```

**5. Media upload (bytes never touch the API server)**
```
POST /media/presign   → { upload_url, key, public_url }
PUT  <upload_url>      (client → R2 directly, body = raw file, header Content-Type matches)
POST /media/confirm   { pg_id, key, public_url, kind }  → saves metadata, appends to pg.images/videos
```

**6. Hunter**
```
GET  /constants                    → populate City→Area + amenities + enum dropdowns
GET  /search?city=...&area=...     → list cards (available_beds, avg_rating)
GET  /pg/{pgId}                    → details page (floors/rooms/beds, reviews — tenant identity hidden)
POST /favourites/{pgId}            → save  (auth)
POST /reviews { pg_id, rating }    → rate  (auth)
```

---

## AUTH

### POST /auth/send-otp
Public.
```json
{ "phone": "9876543210", "role": "PG_OWNER" }
```
`role` optional (default `USER`), used only on first signup.
**200**
```json
{ "message": "OTP sent successfully", "dev_otp": "665042" }
```
> `dev_otp` is present only when `OTP_DEV_MODE=true` (testing). In production it is `null` and the OTP arrives via SMS. **502** if SMS send fails in production mode.

### POST /auth/verify-otp
Public.
```json
{ "phone": "9876543210", "otp": "665042" }
```
**200**
```json
{
  "access_token": "eyJhbGciOi...",
  "token_type": "bearer",
  "user": { "id": "6ac1...", "phone": "9876543210", "role": "PG_OWNER", "name": null }
}
```
**400** `{ "detail": "Invalid OTP" }` or `{ "detail": "OTP expired" }`.

### GET /auth/me
Auth (any role). Header: `Authorization: Bearer <token>`.
**200**
```json
{ "id": "6ac1...", "phone": "9876543210", "role": "PG_OWNER", "name": null }
```
**401** if token missing/invalid.

---

## CONSTANTS

### GET /constants
Public. Use to drive all dropdowns.
**200**
```json
{
  "cities": ["Bengaluru", "Hyderabad", "Pune", "Mumbai", "Chennai", "Delhi NCR"],
  "city_areas": { "Bengaluru": ["Koramangala", "HSR Layout", "..."], "Pune": ["Baner","..."] },
  "amenities": ["WiFi", "AC", "Hot Water", "..."],
  "pg_types": ["MALE", "FEMALE", "CO_LIVING"],
  "room_types": ["SINGLE", "DOUBLE", "TRIPLE", "DORMITORY"],
  "bed_statuses": ["AVAILABLE", "OCCUPIED"],
  "payment_categories": ["RENT","MAINTENANCE","ADVANCE","ADVANCE_REFUND","AC","ELECTRICITY"],
  "payment_statuses": ["PENDING","COMPLETED"],
  "payment_methods": ["CASH","UPI","BANK_TRANSFER"]
}
```

---

## PG MANAGEMENT (role: PG_OWNER)

All endpoints below require `Authorization: Bearer <owner token>`. Operating on a PG you don't own → **403** `{ "detail": "Not your PG" }`.

### POST /pgs — create PG
```json
{
  "name": "Sunrise PG",
  "description": "Spacious co-living",
  "city": "Bengaluru",
  "area": "HSR Layout",
  "address": "12 Main Rd",
  "pg_type": "CO_LIVING",
  "room_types": ["DOUBLE", "SINGLE"],
  "rent": { "min_rent": 7000, "max_rent": 13000, "deposit": 20000, "maintenance": 500 },
  "amenities": ["WiFi", "AC", "Meals"],
  "rules": ["No smoking"],
  "contact": { "name": "Owner", "phone": "9900000001", "email": null },
  "google_maps_link": "https://maps.google.com/..."
}
```
Required: `name`, `city`, `area`, `address`, `pg_type`. Everything else optional with sensible defaults.
**200** — full PG object:
```json
{
  "id": "6ac1...", "name": "Sunrise PG", "description": "Spacious co-living",
  "city": "Bengaluru", "area": "HSR Layout", "address": "12 Main Rd",
  "pg_type": "CO_LIVING", "room_types": ["DOUBLE","SINGLE"],
  "rent": { "min_rent": 7000, "max_rent": 13000, "deposit": 20000, "maintenance": 500 },
  "amenities": ["WiFi","AC","Meals"], "rules": ["No smoking"],
  "contact": { "name": "Owner", "phone": "9900000001", "email": null },
  "google_maps_link": "https://maps.google.com/...",
  "owner_id": "6ac1...", "created_at": "2026-10-03T14:00:00.000000"
}
```
`images` / `videos` string arrays appear once media is confirmed.

### GET /pgs — list my PGs
**200** → array of PG objects (newest first).

### GET /pgs/{pg_id} — get one PG
**200** → PG object. **404** if not found.

### PATCH /pgs/{pg_id} — update PG
Body = any subset of the create fields. Omitted fields are untouched.
```json
{ "description": "Updated", "amenities": ["WiFi","AC","Gym"] }
```
**200** → updated PG object.

### DELETE /pgs/{pg_id}
Cascades delete of floors/rooms/beds. **Tenants, payments, media are retained** for history.
**200** `{ "deleted": true }`

### GET /pgs/{pg_id}/structure — full tree
**200**
```json
{
  "pg": { "...PG object..." },
  "floors": [
    {
      "id": "6ac1...floor", "pg_id": "6ac1...", "name": "Floor 1", "created_at": "...",
      "rooms": [
        {
          "id": "6ac1...room", "pg_id": "6ac1...", "floor_id": "6ac1...floor",
          "room_number": "101", "room_type": "DOUBLE", "is_ac": true, "rent": 11000,
          "created_at": "...",
          "beds": [
            { "id": "6ac1...bed", "pg_id": "6ac1...", "floor_id": "6ac1...floor",
              "room_id": "6ac1...room", "bed_number": "A", "rent": 11000,
              "status": "OCCUPIED", "tenant_id": "6ac1...", "created_at": "..." }
          ]
        }
      ]
    }
  ]
}
```

### POST /pgs/{pg_id}/floors
```json
{ "name": "Floor 1" }
```
**200** `{ "id": "...", "pg_id": "...", "name": "Floor 1", "created_at": "..." }`

### POST /pgs/{pg_id}/rooms
```json
{ "floor_id": "6ac1...floor", "room_number": "101", "room_type": "DOUBLE", "is_ac": true, "rent": 11000 }
```
**200** → room object. **404** if `floor_id` not in this PG.

### POST /pgs/{pg_id}/beds
```json
{ "room_id": "6ac1...room", "bed_number": "A", "rent": 11000 }
```
`rent` defaults to the room's rent if omitted. New beds start `AVAILABLE`.
**200** → bed object. **404** if `room_id` not in this PG.

---

## TENANTS (role: PG_OWNER)

### POST /pgs/{pg_id}/tenants — add tenant to an available bed
```json
{
  "bed_id": "6ac1...bed",
  "name": "Rahul Kumar",
  "phone": "9111111111",
  "email": null,
  "joining_date": "2026-10-01",
  "advance_amount": 22000,
  "monthly_rent": 11000,
  "id_proof": null,
  "notes": null
}
```
Side effects: bed → `OCCUPIED`; if `advance_amount > 0`, a `COMPLETED` `ADVANCE` payment is auto-created.
**200**
```json
{
  "id": "6ac1...", "pg_id": "6ac1...", "bed_id": "6ac1...bed",
  "name": "Rahul Kumar", "phone": "9111111111", "email": null,
  "joining_date": "2026-10-01", "monthly_rent": 11000, "advance_amount": 22000,
  "id_proof": null, "notes": null, "status": "ACTIVE",
  "shift_history": [ { "bed_id": "6ac1...bed", "from": null, "moved_at": "...", "reason": "Joined" } ],
  "created_at": "..."
}
```
**409** `{ "detail": "Bed is already occupied" }`.

### GET /pgs/{pg_id}/tenants?active_only=false
**200** → array of tenant objects (newest first). `active_only=true` → only `ACTIVE`.

### GET /pgs/{pg_id}/tenants/{tenant_id}
**200** → tenant object (includes full `shift_history`).

### POST /pgs/{pg_id}/tenants/{tenant_id}/move
```json
{ "to_bed_id": "6ac1...bedB", "reason": "Prefers window" }
```
Frees old bed, occupies new bed, appends to `shift_history`.
**200** → updated tenant. **409** if target bed occupied. **400** if tenant not active / same bed.

### POST /pgs/{pg_id}/tenants/{tenant_id}/leave
```json
{
  "leaving_date": "2026-10-25",
  "refund_advance": true,
  "refund_amount": 22000,
  "refund_method": "UPI",
  "refund_transaction_id": "TXN-REF-1"
}
```
Frees the bed; tenant `status` → `VACATED` (record kept). If `refund_advance`, logs a `COMPLETED` `ADVANCE_REFUND` payment.
**200** → updated tenant (`status: "VACATED"`, `leaving_date` set).

---

## PAYMENTS (role: PG_OWNER)

### POST /payments — create a payment (pending or completed)
```json
{
  "pg_id": "6ac1...",
  "tenant_id": "6ac1...",
  "category": "RENT",
  "amount": 11000,
  "period": "2026-10",
  "status": "PENDING",
  "method": null,
  "transaction_id": null,
  "note": null
}
```
`tenant_id`, `period`, `method`, `transaction_id`, `note` optional. `period` is the billing month `"YYYY-MM"` for RENT/MAINTENANCE.
**200**
```json
{
  "id": "6ac1...", "pg_id": "6ac1...", "tenant_id": "6ac1...",
  "category": "RENT", "amount": 11000, "period": "2026-10",
  "status": "PENDING", "method": null, "transaction_id": null, "note": null,
  "created_at": "..."
}
```

### POST /payments/{pg_id}/{payment_id}/complete — mark completed
```json
{ "method": "UPI", "transaction_id": "TXN-9988", "note": null }
```
**200** → payment with `status: "COMPLETED"`, `method`, `transaction_id`, `completed_at`.

### GET /payments?pg_id={pg_id}&tenant_id=&category=&status=
`pg_id` required; `tenant_id`, `category`, `status` optional filters.
**200** → array of payment objects (newest first).

---

## MEDIA (role: PG_OWNER)

### POST /media/presign — get a direct-upload URL
```json
{ "pg_id": "6ac1...", "filename": "room.jpg", "content_type": "image/jpeg", "kind": "image" }
```
`kind` = `"image"` | `"video"`.
**200**
```json
{
  "upload_url": "https://<account>.r2.cloudflarestorage.com/...<signed>",
  "key": "pg/6ac1.../image/uuid-room.jpg",
  "public_url": "https://cdn.yourdomain.com/pg/6ac1.../image/uuid-room.jpg",
  "expires_in": 3600
}
```
**503** `{ "detail": "R2 storage is not configured (set R2_* env vars)" }` if R2 env vars are unset.

**Client then uploads directly to R2:**
```
PUT <upload_url>
Content-Type: image/jpeg        # must match what you sent to presign
Body: <raw file bytes>
```
(No Authorization header on the PUT — the signature is in the URL.)

### POST /media/confirm — save metadata after upload
```json
{ "pg_id": "6ac1...", "key": "pg/6ac1.../image/uuid-room.jpg", "public_url": "https://cdn.../room.jpg", "kind": "image" }
```
Stores the record and appends `public_url` to the PG's `images` (or `videos`) array.
**200** → `{ "id": "...", "pg_id": "...", "key": "...", "url": "...", "kind": "image", "created_at": "..." }`

### GET /media/{pg_id}
**200** → array of media objects for the PG.

---

## DASHBOARD & REPORTS (role: PG_OWNER)

### GET /dashboard?pg_id=&year=&month=
`pg_id` optional (omit = all your PGs combined). `year`/`month` default to the current month.
**200**
```json
{
  "month": "2026-10",
  "total_pgs": 1, "total_floors": 1, "total_rooms": 1,
  "total_beds": 2, "occupied_beds": 1, "available_beds": 1, "occupancy_rate": 50.0,
  "active_tenants": 1, "new_tenants": 1, "vacated_tenants": 0,
  "expected_revenue": 11000.0,
  "collected_revenue": 33000.0,
  "advance_refunds": 0,
  "pending_payments": 0.0
}
```
`collected_revenue` excludes advance refunds (reported separately). `expected_revenue` = sum of active tenants' `monthly_rent`.

### GET /dashboard/report?pg_id=&start=&end=
`start`/`end` **required**, ISO dates; `end` is exclusive. `pg_id` optional.
Example: `/dashboard/report?pg_id=6ac1...&start=2026-10-01&end=2026-11-01`
**200**
```json
{
  "range": ["2026-10-01T00:00:00+00:00", "2026-11-01T00:00:00+00:00"],
  "completed_total": 33000.0,
  "pending_total": 0.0,
  "rent_collection": 11000.0,
  "maintenance_collection": 0,
  "ac_collection": 0,
  "electricity_collection": 0,
  "advance_collected": 22000.0,
  "advance_refunds": 0,
  "completed_by_category": { "RENT": { "total": 11000, "count": 1 }, "ADVANCE": { "total": 22000, "count": 1 } },
  "pending_by_category": {},
  "occupancy": { "total_beds": 2, "occupied_beds": 1, "available_beds": 1, "occupancy_rate": 50.0 },
  "tenant_stats": { "active_tenants": 1, "new_tenants": 1 }
}
```
**400** `{ "detail": "Invalid start/end date" }`.

---

## PUBLIC & USER FLOWS

### GET /search — public PG search
No auth. All query params optional:
`city`, `area`, `pg_type`, `room_type`, `min_rent`, `max_rent`, `is_ac` (bool), `available_only` (bool), and repeatable `amenities` (e.g. `?amenities=WiFi&amenities=AC` → PG must have **all** listed).
Example: `/search?city=Bengaluru&area=HSR Layout&is_ac=true&available_only=true&min_rent=5000&max_rent=15000`
**200** → array of PG cards, each augmented with:
```json
{
  "id": "6ac1...", "name": "Sunrise PG", "city": "Bengaluru", "area": "HSR Layout",
  "pg_type": "CO_LIVING", "rent": { "min_rent": 7000, "max_rent": 13000, "...": "..." },
  "amenities": ["WiFi","AC"], "google_maps_link": "...",
  "available_beds": 1,
  "avg_rating": 4.5,
  "review_count": 2
}
```
`room_type`/`is_ac` restrict which beds count toward `available_beds`. `available_only=true` drops PGs with 0 available beds.

### GET /pg/{pg_id} — public PG details
No auth. **Tenant identity is hidden** on beds (only `id`, `bed_number`, `rent`, `status`).
**200**
```json
{
  "id": "6ac1...", "name": "Sunrise PG", "description": "...", "city": "Bengaluru",
  "area": "HSR Layout", "address": "12 Main Rd", "pg_type": "CO_LIVING",
  "rent": { "...": "..." }, "amenities": ["WiFi","AC"], "rules": ["No smoking"],
  "contact": { "name": "Owner", "phone": "9900000001", "email": null },
  "google_maps_link": "...", "images": ["https://..."], "videos": [],
  "avg_rating": 4.5, "review_count": 2,
  "total_beds": 2, "available_beds": 1,
  "floors": [ { "id": "...", "name": "Floor 1", "rooms": [ { "id":"...", "room_number":"101",
    "room_type":"DOUBLE", "is_ac":true, "rent":11000,
    "beds": [ { "id":"...", "bed_number":"A", "rent":11000, "status":"AVAILABLE" } ] } ] } ],
  "reviews": [ { "id":"...", "pg_id":"...", "user_id":"...", "rating":5, "comment":"Great", "created_at":"..." } ]
}
```
**404** if not found.

### POST /favourites/{pg_id} — add favourite
Auth (any role). No body. Idempotent.
**200** `{ "favourited": true, "pg_id": "6ac1..." }`

### DELETE /favourites/{pg_id} — remove favourite
Auth. **200** `{ "favourited": false, "pg_id": "6ac1..." }`

### GET /favourites — my favourites
Auth. **200** → array of PG objects the user favourited.

### POST /reviews — add/update a review
Auth. One review per user per PG (re-posting updates it).
```json
{ "pg_id": "6ac1...", "rating": 5, "comment": "Excellent" }
```
`rating` 1–5 (required), `comment` optional.
**200** → `{ "id":"...", "user_id":"...", "pg_id":"...", "rating":5, "comment":"Excellent", "created_at":"..." }`

---

## Quick auth helper (frontend)

```js
const API = "http://127.0.0.1:8000";

async function sendOtp(phone, role = "USER") {
  const r = await fetch(`${API}/auth/send-otp`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, role }),
  });
  return r.json(); // { message, dev_otp }
}

async function verifyOtp(phone, otp) {
  const r = await fetch(`${API}/auth/verify-otp`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, otp }),
  });
  const data = await r.json();        // { access_token, user }
  localStorage.setItem("token", data.access_token);
  return data;
}

function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  };
}

// example protected call
const myPgs = await fetch(`${API}/pgs`, { headers: authHeaders() }).then(r => r.json());
```
