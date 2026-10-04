/**
 * Translation layer between the backend contract (API_CONTRACT.md) and the shapes the
 * UI already consumes. Screens/components were written against a mock model; rather than
 * rewrite every screen, we map backend <-> frontend here so the service signatures and
 * returned field names stay identical.
 *
 * Where the backend has no equivalent for a field the UI reads, we fill a sensible
 * default and record the gap in UNSUPPORTED_ENDPOINTS.md.
 */

// --- Role ------------------------------------------------------------------
// Frontend role ('consumer'|'seller') <-> backend role ('USER'|'PG_OWNER').
export function toApiRole(role) {
  return role === 'seller' ? 'PG_OWNER' : 'USER';
}
export function fromApiRole(role) {
  return role === 'PG_OWNER' ? 'seller' : 'consumer';
}

// --- PG type <-> gender ----------------------------------------------------
// Backend pg_type (MALE|FEMALE|CO_LIVING) carries the same meaning as the UI's gender.
export function genderToPgType(gender) {
  if (gender === 'MALE') return 'MALE';
  if (gender === 'FEMALE') return 'FEMALE';
  return 'CO_LIVING'; // UNISEX / anything else
}
export function pgTypeToGender(pgType) {
  if (pgType === 'MALE') return 'MALE';
  if (pgType === 'FEMALE') return 'FEMALE';
  return 'UNISEX'; // CO_LIVING
}
// The UI also has a propertyType (PG|HOSTEL|COLIVING) with no backend field.
export function pgTypeToPropertyType(pgType) {
  return pgType === 'CO_LIVING' ? 'COLIVING' : 'PG';
}

// --- Room type -------------------------------------------------------------
// Backend enum: SINGLE|DOUBLE|TRIPLE|DORMITORY. UI: SINGLE|DOUBLE|TRIPLE|FOUR_SHARING.
export function roomTypeToApi(rt) {
  return rt === 'FOUR_SHARING' ? 'DORMITORY' : rt;
}
export function roomTypeFromApi(rt) {
  return rt === 'DORMITORY' ? 'FOUR_SHARING' : rt;
}

// --- Amenities -------------------------------------------------------------
// UI uses lowercase keys with icons; backend uses human labels. Map the known set and
// slug/humanise anything unrecognised so no data is dropped.
const AMENITY_KEY_TO_LABEL = {
  wifi: 'WiFi',
  ac: 'AC',
  food: 'Meals',
  washing_machine: 'Washing Machine',
  parking: 'Parking',
  power_backup: 'Power Backup',
  housekeeping: 'Housekeeping',
  cctv: 'CCTV',
  security: 'Security',
  attached_bathroom: 'Attached Bathroom',
  laundry: 'Laundry',
  common_area: 'Common Area',
};
const AMENITY_LABEL_TO_KEY = Object.entries(AMENITY_KEY_TO_LABEL).reduce((acc, [k, v]) => {
  acc[v.toLowerCase()] = k;
  return acc;
}, {});

export function amenityKeyToLabel(key) {
  return AMENITY_KEY_TO_LABEL[key] || humanise(key);
}
export function amenityLabelToKey(label) {
  if (!label) return label;
  return AMENITY_LABEL_TO_KEY[label.toLowerCase()] || slug(label);
}
export function amenitiesToApi(keys = []) {
  return keys.map(amenityKeyToLabel);
}
export function amenitiesFromApi(labels = []) {
  return labels.map(amenityLabelToKey);
}

function slug(s) {
  return String(s).trim().toLowerCase().replace(/\s+/g, '_');
}
function humanise(key) {
  return String(key)
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

// --- Rules -----------------------------------------------------------------
// UI rules is an object with fixed keys; backend rules is a free string array.
const RULE_KEYS = ['checkIn', 'checkOut', 'visitors', 'smoking', 'noticePeriod'];
const RULE_LABELS = {
  checkIn: 'Check-in',
  checkOut: 'Check-out',
  visitors: 'Visitors',
  smoking: 'Smoking',
  noticePeriod: 'Notice period',
};

export function rulesObjToArray(rules = {}) {
  return RULE_KEYS.filter((k) => rules[k]).map((k) => `${RULE_LABELS[k]}: ${rules[k]}`);
}
// We can't reliably parse free text back into fixed keys, so expose the raw list under
// `.list` and leave the known keys blank (the detail screen renders whatever is present).
export function rulesArrayToObj(rules = []) {
  return { checkIn: '', checkOut: '', visitors: '', smoking: '', noticePeriod: '', list: rules || [] };
}

// Structured house rules: UI camelCase object <-> backend snake_case `house_rules` (v1.1).
export function houseRulesToApi(rules = {}) {
  const out = {};
  if (rules.checkIn) out.check_in = rules.checkIn;
  if (rules.checkOut) out.check_out = rules.checkOut;
  if (rules.visitors) out.visitors = rules.visitors;
  if (rules.smoking) out.smoking = rules.smoking;
  if (rules.noticePeriod) out.notice_period = rules.noticePeriod;
  return out;
}
function houseRulesFromApi(hr = {}, freeText = []) {
  return {
    checkIn: hr.check_in || '',
    checkOut: hr.check_out || '',
    visitors: hr.visitors || '',
    smoking: hr.smoking || '',
    noticePeriod: hr.notice_period || '',
    list: freeText || [],
  };
}

// --- Google maps link <-> lat/lng ------------------------------------------
function latLngFromMapsLink(link) {
  if (!link) return {};
  const m = String(link).match(/@?(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (!m) return {};
  return { latitude: Number(m[1]), longitude: Number(m[2]) };
}
function mapsLinkFromLatLng(lat, lng) {
  if (lat == null || lng == null) return null;
  return `https://maps.google.com/?q=${lat},${lng}`;
}

// --- User ------------------------------------------------------------------
export function mapUser(apiUser) {
  if (!apiUser) return null;
  const profile = apiUser.profile || {};
  return {
    id: apiUser.id,
    name: apiUser.name || '',
    phone: apiUser.phone || '',
    email: apiUser.email || '',
    role: fromApiRole(apiUser.role),
    avatar: null,
    createdAt: apiUser.created_at || null,
    // Role-specific extras live in a free-form `profile` object on the backend; flatten
    // them onto the user so screens (personal-info) can read user.gender, user.gst, etc.
    ...profile,
    profile,
  };
}

// UI user fields -> PATCH /auth/me body. name/email are top-level; everything else is
// role-specific and goes into the free-form `profile` object.
const PROFILE_KEYS = ['gender', 'occupation', 'city', 'emergencyContact', 'businessName', 'gst', 'pan', 'businessAddress', 'since'];
export function buildUpdateMeBody(patch = {}) {
  const body = {};
  if (patch.name != null) body.name = patch.name;
  if (patch.email != null) body.email = patch.email;
  const profile = {};
  for (const k of PROFILE_KEYS) if (patch[k] != null) profile[k] = patch[k];
  if (patch.profile) Object.assign(profile, patch.profile);
  if (Object.keys(profile).length) body.profile = profile;
  return body;
}

// --- PG: address ----------------------------------------------------------
function mapAddress(apiPg) {
  return {
    addressLine: apiPg.address || '',
    locality: apiPg.area || '',
    city: apiPg.city || '',
    state: apiPg.state || '',
    pincode: apiPg.pincode || '',
    ...latLngFromMapsLink(apiPg.google_maps_link),
  };
}

// --- PG: rooms from a floors->rooms->beds structure ------------------------
// Produces the flat `rooms[]` the UI expects, deriving bed counts from the beds array.
function roomsFromStructure(floors = [], pgDeposit = 0) {
  const rooms = [];
  for (const floor of floors) {
    for (const room of floor.rooms || []) {
      const beds = room.beds || [];
      rooms.push({
        id: room.id,
        floorId: room.floor_id || floor.id,
        floor: floor.name,
        roomType: roomTypeFromApi(room.room_type),
        isAc: !!room.is_ac,
        totalBeds: beds.length,
        availableBeds: beds.filter((b) => b.status === 'AVAILABLE').length,
        monthlyRent: room.rent ?? 0,
        securityDeposit: pgDeposit || 0,
        amenities: room.is_ac ? ['ac'] : [],
        beds: beds.map((b) => ({
          id: b.id,
          bedNumber: b.bed_number,
          rent: b.rent,
          status: b.status,
          tenantId: b.tenant_id ?? null,
        })),
      });
    }
  }
  return rooms;
}

// Derive the UI property status chip from the backend verification/active flags.
function pgStatus(apiPg) {
  if (apiPg.is_active === false) return 'INACTIVE';
  const vs = apiPg.verification_status;
  if (vs === 'REJECTED') return 'REJECTED';
  if (vs === 'PENDING_VERIFICATION') return 'PENDING_VERIFICATION';
  return 'ACTIVE'; // VERIFIED or unset (legacy records)
}

// Common PG fields shared by card and detail mappings.
function mapPgCommon(apiPg) {
  const rent = apiPg.rent || {};
  return {
    id: apiPg.id,
    sellerId: apiPg.owner_id || null,
    name: apiPg.name,
    description: apiPg.description || '',
    // property_type is a real field in v1.1; fall back to deriving it for legacy records.
    propertyType: apiPg.property_type || pgTypeToPropertyType(apiPg.pg_type),
    gender: pgTypeToGender(apiPg.pg_type),
    address: mapAddress(apiPg),
    images: apiPg.images || [],
    videos: apiPg.videos || [],
    amenities: amenitiesFromApi(apiPg.amenities || []),
    charges: { maintenance: rent.maintenance || 0, food: 0, other: 0 },
    // Prefer structured house_rules; keep the free-text rules[] as the `.list` fallback.
    rules: apiPg.house_rules
      ? houseRulesFromApi(apiPg.house_rules, apiPg.rules)
      : rulesArrayToObj(apiPg.rules),
    seller: {
      name: apiPg.contact?.name || '',
      phone: apiPg.contact?.phone || '',
      email: apiPg.contact?.email || '',
      since: apiPg.contact?.since || '',
    },
    googleMapsLink: apiPg.google_maps_link || null,
    isVerified: apiPg.is_verified !== false, // default verified (legacy + v1.1 create default)
    isActive: apiPg.is_active !== false,
    verificationStatus: apiPg.verification_status || 'VERIFIED',
    status: pgStatus(apiPg),
    createdAt: apiPg.created_at || null,
    updatedAt: apiPg.updated_at || apiPg.created_at || null,
    _rent: rent,
  };
}

/**
 * Map a search/list card (GET /search, GET /pgs). These have no room/bed tree, so we
 * synthesise a single representative room from the card aggregates (min_rent,
 * available_beds) to keep getMinRent/getAvailableBeds/getHeadlineRoom working.
 */
export function mapPgCard(apiPg) {
  const base = mapPgCommon(apiPg);
  const rent = apiPg.rent || {};
  const availableBeds = apiPg.available_beds ?? 0;
  const firstRoomType = roomTypeFromApi((apiPg.room_types && apiPg.room_types[0]) || 'SINGLE');
  base.rooms = [
    {
      id: `${apiPg.id}_summary`,
      roomType: firstRoomType,
      totalBeds: apiPg.total_beds ?? availableBeds,
      availableBeds,
      monthlyRent: rent.min_rent ?? 0,
      securityDeposit: rent.deposit ?? 0,
      amenities: [],
    },
  ];
  base.rating = apiPg.avg_rating ?? 0;
  base.reviewCount = apiPg.review_count ?? 0;
  delete base._rent;
  return base;
}

/**
 * Map the full public detail (GET /pg/{id}) or owner structure (GET /pgs/{id}/structure).
 * `floors` is the floors->rooms->beds tree; `reviews` the embedded review array.
 */
export function mapPgDetail(apiPg, { floors, reviews } = {}) {
  const base = mapPgCommon(apiPg);
  const deposit = (apiPg.rent || {}).deposit || 0;
  const tree = floors || apiPg.floors || [];
  base.rooms = roomsFromStructure(tree, deposit);
  base.rating = apiPg.avg_rating ?? 0;
  base.reviewCount = apiPg.review_count ?? 0;
  base.reviews = (reviews || apiPg.reviews || []).map(mapReview);
  delete base._rent;
  return base;
}

// --- Review ----------------------------------------------------------------
// Backend reviews carry no reviewer name (only user_id); the UI shows a name.
export function mapReview(apiReview) {
  return {
    id: apiReview.id,
    name: apiReview.name || 'Resident',
    rating: apiReview.rating,
    comment: apiReview.comment || '',
    createdAt: apiReview.created_at || apiReview.createdAt || null,
  };
}

// --- Create PG: UI wizard payload -> POST /pgs body ------------------------
export function buildCreatePgBody(payload = {}) {
  const addr = payload.address || {};
  const rooms = payload.rooms || [];
  const rents = rooms.map((r) => Number(r.monthlyRent) || 0).filter((n) => n > 0);
  const deposits = rooms.map((r) => Number(r.securityDeposit) || 0).filter((n) => n > 0);
  const roomTypes = [...new Set(rooms.map((r) => roomTypeToApi(r.roomType)))];

  const contact = { name: '', phone: '', email: null, ...(payload.contact || {}) };
  if (payload.seller?.since && !contact.since) contact.since = payload.seller.since;

  return {
    name: payload.name,
    description: payload.description || '',
    city: addr.city,
    area: addr.locality,
    address: addr.addressLine,
    state: addr.state || null,
    pincode: addr.pincode || null,
    pg_type: genderToPgType(payload.gender),
    property_type: payload.propertyType || pgTypeToPropertyType(genderToPgType(payload.gender)),
    room_types: roomTypes,
    rent: {
      min_rent: rents.length ? Math.min(...rents) : 0,
      max_rent: rents.length ? Math.max(...rents) : 0,
      deposit: deposits.length ? Math.max(...deposits) : 0,
      maintenance: payload.charges?.maintenance || 0,
    },
    amenities: amenitiesToApi(payload.amenities || []),
    rules: rulesObjToArray(payload.rules || {}),
    house_rules: houseRulesToApi(payload.rules || {}),
    contact,
    google_maps_link: mapsLinkFromLatLng(addr.latitude, addr.longitude),
    is_active: payload.isActive !== false,
  };
}

// --- Update PG: partial UI patch -> PATCH /pgs/{id} body --------------------
// Only maps the keys present in `patch`; omitted keys are left untouched server-side.
export function buildUpdatePgBody(patch = {}) {
  const body = {};
  if (patch.name != null) body.name = patch.name;
  if (patch.description != null) body.description = patch.description;
  if (patch.gender != null) {
    body.pg_type = genderToPgType(patch.gender);
  }
  if (patch.propertyType != null) body.property_type = patch.propertyType;
  if (patch.isActive != null) body.is_active = patch.isActive;
  if (patch.verificationStatus != null) body.verification_status = patch.verificationStatus;
  if (patch.amenities != null) body.amenities = amenitiesToApi(patch.amenities);
  if (patch.rules != null) {
    body.rules = rulesObjToArray(patch.rules);
    body.house_rules = houseRulesToApi(patch.rules);
  }
  if (patch.address) {
    const a = patch.address;
    if (a.city != null) body.city = a.city;
    if (a.locality != null) body.area = a.locality;
    if (a.addressLine != null) body.address = a.addressLine;
    if (a.state != null) body.state = a.state;
    if (a.pincode != null) body.pincode = a.pincode;
  }
  return body;
}

// Coerce a UI date/ISO-datetime to the backend's `YYYY-MM-DD` date form.
function toApiDate(v) {
  if (!v) return v;
  const s = String(v);
  const m = s.match(/^\d{4}-\d{2}-\d{2}/);
  return m ? m[0] : s;
}

// --- Enquiry / Lead --------------------------------------------------------
export function mapEnquiry(e) {
  if (!e) return null;
  return {
    id: e.id,
    name: e.name || 'Prospect',
    phone: e.phone || '',
    pgId: e.pg_id,
    pgName: e.pg_name,
    ownerId: e.owner_id,
    roomType: e.room_type ? roomTypeFromApi(e.room_type) : null,
    budget: e.budget ?? null,
    moveInDate: e.move_in_date || null,
    message: e.message || '',
    status: e.status || 'NEW',
    lastContacted: e.last_contacted || null,
    createdAt: e.created_at || null,
  };
}
export function buildEnquiryBody(data = {}) {
  const body = { pg_id: data.pgId };
  if (data.roomType != null) body.room_type = roomTypeToApi(data.roomType);
  if (data.budget != null) body.budget = data.budget;
  if (data.moveInDate != null) body.move_in_date = toApiDate(data.moveInDate);
  if (data.message != null) body.message = data.message;
  if (data.name) body.name = data.name;
  if (data.phone) body.phone = data.phone;
  return body;
}

// --- Booking ---------------------------------------------------------------
export function mapBooking(b) {
  if (!b) return null;
  return {
    id: b.id,
    name: b.name || 'Tenant',
    phone: b.phone || '',
    pgId: b.pg_id,
    pgName: b.pg_name,
    ownerId: b.owner_id,
    roomId: b.room_id || null,
    roomType: b.room_type ? roomTypeFromApi(b.room_type) : null,
    moveInDate: b.move_in_date || null,
    durationMonths: b.duration_months ?? null,
    amount: b.amount ?? 0,
    status: b.status || 'PENDING',
    paymentStatus: b.payment_status || 'UNPAID',
    createdAt: b.created_at || null,
  };
}
export function buildBookingBody(data = {}) {
  const body = { pg_id: data.pgId };
  if (data.roomId != null) body.room_id = data.roomId;
  if (data.roomType != null) body.room_type = roomTypeToApi(data.roomType);
  if (data.moveInDate != null) body.move_in_date = toApiDate(data.moveInDate);
  if (data.durationMonths != null) body.duration_months = data.durationMonths;
  if (data.amount != null) body.amount = data.amount;
  if (data.name) body.name = data.name;
  if (data.phone) body.phone = data.phone;
  return body;
}
