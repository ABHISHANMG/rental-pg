/**
 * Domain constants & catalogs.
 * These are UI-facing lookups (labels, icons) kept separate from mock data so the
 * same catalog powers filters, cards, wizard steps and detail screens.
 */

// --- Amenities -------------------------------------------------------------
// icon = MaterialCommunityIcons glyph name.
export const AMENITIES = [
  { key: 'wifi', label: 'WiFi', icon: 'wifi' },
  { key: 'ac', label: 'AC', icon: 'air-conditioner' },
  { key: 'food', label: 'Food', icon: 'silverware-fork-knife' },
  { key: 'washing_machine', label: 'Washing Machine', icon: 'washing-machine' },
  { key: 'parking', label: 'Parking', icon: 'parking' },
  { key: 'power_backup', label: 'Power Backup', icon: 'power-plug' },
  { key: 'housekeeping', label: 'Housekeeping', icon: 'broom' },
  { key: 'cctv', label: 'CCTV', icon: 'cctv' },
  { key: 'security', label: 'Security', icon: 'shield-check' },
  { key: 'attached_bathroom', label: 'Attached Bathroom', icon: 'shower' },
  { key: 'laundry', label: 'Laundry', icon: 'tshirt-crew' },
  { key: 'common_area', label: 'Common Area', icon: 'sofa' },
];

export const AMENITY_MAP = AMENITIES.reduce((acc, a) => {
  acc[a.key] = a;
  return acc;
}, {});

// --- Room types ------------------------------------------------------------
export const ROOM_TYPES = [
  { key: 'SINGLE', label: 'Single', short: 'Single', beds: 1 },
  { key: 'DOUBLE', label: 'Double Sharing', short: 'Double', beds: 2 },
  { key: 'TRIPLE', label: 'Triple Sharing', short: 'Triple', beds: 3 },
  { key: 'FOUR_SHARING', label: 'Four Sharing', short: 'Four', beds: 4 },
];

export const ROOM_TYPE_MAP = ROOM_TYPES.reduce((acc, r) => {
  acc[r.key] = r;
  return acc;
}, {});

// --- Property types --------------------------------------------------------
export const PROPERTY_TYPES = [
  { key: 'PG', label: 'PG' },
  { key: 'HOSTEL', label: 'Hostel' },
  { key: 'COLIVING', label: 'Co-living' },
];

// --- Gender ----------------------------------------------------------------
export const GENDERS = [
  { key: 'MALE', label: 'Boys', icon: 'gender-male' },
  { key: 'FEMALE', label: 'Girls', icon: 'gender-female' },
  { key: 'UNISEX', label: 'Co-ed', icon: 'gender-male-female' },
];

export const GENDER_MAP = GENDERS.reduce((acc, g) => {
  acc[g.key] = g;
  return acc;
}, {});

// --- Locations -------------------------------------------------------------
export const CITIES = ['Hyderabad', 'Bangalore', 'Pune', 'Chennai', 'Mumbai'];

export const POPULAR_LOCATIONS = [
  { label: 'Madhapur', city: 'Hyderabad' },
  { label: 'Hitech City', city: 'Hyderabad' },
  { label: 'Gachibowli', city: 'Hyderabad' },
  { label: 'Kondapur', city: 'Hyderabad' },
  { label: 'Koramangala', city: 'Bangalore' },
  { label: 'HSR Layout', city: 'Bangalore' },
  { label: 'Whitefield', city: 'Bangalore' },
  { label: 'Hinjewadi', city: 'Pune' },
  { label: 'Powai', city: 'Mumbai' },
  { label: 'Velachery', city: 'Chennai' },
];

export const POPULAR_SEARCHES = [
  'PG near me',
  'Girls PG in Madhapur',
  'PG with food',
  'Single room',
  'Co-living Bangalore',
];

// --- Booking / lead status metadata ---------------------------------------
export const BOOKING_STATUS = {
  PENDING: { label: 'Pending', tone: 'lemon' },
  APPROVED: { label: 'Approved', tone: 'skyBg' },
  PAYMENT_PENDING: { label: 'Payment Pending', tone: 'peach' },
  CONFIRMED: { label: 'Confirmed', tone: 'mintBg' },
  CANCELLED: { label: 'Cancelled', tone: 'surfaceAlt' },
  REJECTED: { label: 'Rejected', tone: 'peach' },
  COMPLETED: { label: 'Completed', tone: 'mintBg' },
};

// --- Seller: property status (§20) ----------------------------------------
export const PROPERTY_STATUS = {
  DRAFT: { label: 'Draft', tone: 'surfaceAlt' },
  PENDING_VERIFICATION: { label: 'Pending review', tone: 'lemon' },
  ACTIVE: { label: 'Active', tone: 'mintBg' },
  INACTIVE: { label: 'Inactive', tone: 'surfaceAlt' },
  REJECTED: { label: 'Rejected', tone: 'peach' },
};

// --- Seller: lead status (§23) --------------------------------------------
export const LEAD_STATUSES = [
  { key: 'NEW', label: 'New', tone: 'lemon' },
  { key: 'CONTACTED', label: 'Contacted', tone: 'skyBg' },
  { key: 'INTERESTED', label: 'Interested', tone: 'lilac' },
  { key: 'CONVERTED', label: 'Converted', tone: 'mintBg' },
  { key: 'CLOSED', label: 'Closed', tone: 'surfaceAlt' },
];

export const LEAD_STATUS_MAP = LEAD_STATUSES.reduce((acc, s) => {
  acc[s.key] = s;
  return acc;
}, {});
