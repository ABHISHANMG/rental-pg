# Zaptel Clone — React Native Product Requirements & Build Prompt

## 1. Project Overview

Build a production-quality mobile application inspired by the PG rental marketplace experience of Zaptel.

The application will support two primary user roles:

1. **Consumer / Tenant**
   - Discover PGs and co-living properties
   - Search and filter properties
   - View detailed property information
   - Check room/bed availability
   - Shortlist properties
   - Send enquiries
   - Request bookings
   - Make payments
   - Track bookings

2. **Seller / PG Owner**
   - Create and manage PG listings
   - Upload property images
   - Configure rooms and beds
   - Set rent and security deposit
   - Manage availability
   - Receive and manage enquiries
   - Approve/reject booking requests
   - Track property performance

The goal is to create a clean, scalable React Native application with a professional marketplace UX and an architecture that can later connect to a real backend.

---

# 2. Primary Objective

Create a React Native application that provides a complete PG discovery and rental workflow.

The initial implementation should use **mock/local data**, but all screens, components, types, services, and state management should be structured so that the mock layer can later be replaced with REST APIs, WebSockets, push notifications, payments, and a real database without major UI rewrites.

The application should feel like a real commercial product rather than a demo.

---

# 3. Recommended Technology Stack

## Mobile

- React Native
- Expo
- TypeScript
- Expo Router

## State Management

- Zustand for client/application state
- TanStack Query for server/API state

## Forms & Validation

- React Hook Form
- Zod

## UI

- Custom reusable component system
- Responsive layouts
- Safe area support
- Keyboard-aware forms
- Loading, empty, error, and success states

## Future Backend

- Node.js
- NestJS or Express
- PostgreSQL
- Prisma
- REST API
- WebSocket
- JWT authentication

## Future Integrations

- Google Maps
- Cloudinary or Amazon S3 for images
- Firebase Cloud Messaging / Expo Notifications
- Razorpay for payments

---

# 4. Application Architecture

Use a single React Native codebase supporting both Consumer and Seller experiences.

Suggested structure:

```text
zaptel-clone/
│
├── app/
│   ├── _layout.tsx
│   │
│   ├── (auth)/
│   │   ├── login.tsx
│   │   ├── signup.tsx
│   │   └── role-selection.tsx
│   │
│   ├── (consumer)/
│   │   ├── _layout.tsx
│   │   ├── home.tsx
│   │   ├── search.tsx
│   │   ├── favorites.tsx
│   │   ├── bookings.tsx
│   │   └── profile.tsx
│   │
│   ├── pg/
│   │   └── [id].tsx
│   │
│   └── (seller)/
│       ├── _layout.tsx
│       ├── dashboard.tsx
│       ├── listings.tsx
│       ├── add-pg.tsx
│       ├── leads.tsx
│       ├── bookings.tsx
│       └── profile.tsx
│
├── src/
│   ├── components/
│   │   ├── common/
│   │   ├── consumer/
│   │   └── seller/
│   │
│   ├── features/
│   │   ├── auth/
│   │   ├── pg/
│   │   ├── search/
│   │   ├── booking/
│   │   ├── seller/
│   │   └── profile/
│   │
│   ├── services/
│   │   ├── api.ts
│   │   ├── auth.service.ts
│   │   ├── pg.service.ts
│   │   └── booking.service.ts
│   │
│   ├── store/
│   │   ├── auth.store.ts
│   │   └── app.store.ts
│   │
│   ├── hooks/
│   ├── types/
│   ├── utils/
│   ├── constants/
│   └── theme/
│
├── assets/
└── package.json
```

Follow feature-oriented organization. Avoid putting all business logic into screens.

---

# 5. User Roles

## 5.1 Consumer

Consumer capabilities:

- Register/login
- Select location
- Search PGs
- Browse recommendations
- Apply filters
- View property details
- View images
- View amenities
- View rooms
- View pricing
- View location
- View availability
- Add/remove favorites
- Send enquiry
- Request booking
- Make payment
- View booking history
- Manage profile

## 5.2 Seller

Seller capabilities:

- Register/login
- Create seller profile
- Add PG
- Edit PG
- Upload images
- Add amenities
- Configure room types
- Configure beds
- Set rent
- Set security deposit
- Configure rules
- Manage availability
- View enquiries
- Manage booking requests
- Approve/reject bookings
- View property metrics
- Manage profile

---

# 6. Authentication Flow

Create the following screens:

```text
Splash
  ↓
Role Selection
  ↓
Login / Signup
  ↓
OTP / Authentication
  ↓
Consumer Home OR Seller Dashboard
```

Role selection:

```text
How do you want to use the app?

[ Find a PG ]

I'm looking for a place to stay.

[ List my PG ]

I'm a PG/property owner.
```

Authentication should store the selected role in application state.

Design the authentication layer so JWT/refresh-token authentication can be added later.

---

# 7. Consumer Experience

## 7.1 Consumer Home

The home screen should contain:

- Current location
- Notification button
- Search bar
- Popular locations
- Recommended PGs
- Nearby PGs
- Recently viewed PGs
- Bottom navigation

Example:

```text
Good morning

📍 Hyderabad                         🔔

Find your perfect PG

┌──────────────────────────────────┐
│ 🔍 Search locality or PG name    │
└──────────────────────────────────┘

Popular Locations

[Madhapur] [Hitech City]
[Gachibowli] [Kondapur]

Recommended PGs

[Property Card]
[Property Card]
[Property Card]

Home   Search   Favorites   Bookings   Profile
```

---

# 8. PG Property Model

Create strongly typed models.

```ts
interface PG {
  id: string;
  sellerId: string;

  name: string;
  description: string;

  propertyType: "PG" | "HOSTEL" | "COLIVING";
  gender: "MALE" | "FEMALE" | "UNISEX";

  address: {
    addressLine: string;
    locality: string;
    city: string;
    state: string;
    pincode: string;
    latitude: number;
    longitude: number;
  };

  images: string[];

  amenities: Amenity[];

  rooms: Room[];

  rating: number;
  reviewCount: number;

  isVerified: boolean;
  isActive: boolean;

  createdAt: string;
  updatedAt: string;
}
```

Room:

```ts
interface Room {
  id: string;

  roomType:
    | "SINGLE"
    | "DOUBLE"
    | "TRIPLE"
    | "FOUR_SHARING";

  totalBeds: number;
  availableBeds: number;

  monthlyRent: number;
  securityDeposit: number;

  amenities: string[];
}
```

---

# 9. PG Card

Create a reusable PG card component.

The card should show:

- Main image
- Favorite button
- Verification badge
- PG name
- Locality
- Rating
- Monthly rent
- Room type
- Selected amenities
- Availability indicator

Example:

```text
┌───────────────────────────────┐
│                               │
│          PROPERTY IMAGE       │
│                               │
│  ✓ Verified             ♡     │
├───────────────────────────────┤
│ Urban Nest PG                 │
│ Madhapur, Hyderabad           │
│                               │
│ ⭐ 4.5 (124 reviews)          │
│                               │
│ ₹8,500/month                  │
│ Double sharing                │
│                               │
│ WiFi • Food • AC              │
└───────────────────────────────┘
```

Make the entire card tappable.

---

# 10. Search

Create a dedicated search experience.

Support:

- Location search
- PG name search
- Locality search
- Recent searches
- Popular searches

Search should be debounced.

Prepare the architecture for future server-side search.

---

# 11. Filters

Create a filter screen/bottom sheet.

Filters:

- Minimum rent
- Maximum rent
- Gender
- Room type
- Property type
- Amenities
- Food included
- AC
- WiFi
- Attached bathroom
- Parking
- Distance
- Availability date

Filter model:

```ts
interface PGFilters {
  location?: string;

  minRent?: number;
  maxRent?: number;

  gender?: "MALE" | "FEMALE" | "UNISEX";

  roomTypes?: Room["roomType"][];

  propertyTypes?: PG["propertyType"][];

  amenities?: string[];

  foodIncluded?: boolean;

  availableFrom?: string;
}
```

Include:

- Apply
- Clear all
- Active filter count

---

# 12. PG Details Screen

Create a high-quality property details page.

Sections:

1. Image gallery
2. Property name
3. Verification status
4. Rating/reviews
5. Location
6. Description
7. Amenities
8. Room options
9. Pricing
10. Availability
11. Property rules
12. Map
13. Seller information
14. Enquiry button
15. Booking button

Sticky bottom CTA:

```text
┌─────────────────────────────────┐
│ ₹8,500/mo      [Enquire] [Book] │
└─────────────────────────────────┘
```

---

# 13. Room Selection

When a consumer chooses Book:

```text
Select your room

Single
₹14,000/month
2 beds available

[ Select ]

Double Sharing
₹9,000/month
5 beds available

[ Select ]

Triple Sharing
₹7,500/month
2 beds available

[ Select ]
```

After selecting a room, allow the user to choose:

- Move-in date
- Duration
- Bed if required
- Additional preferences

---

# 14. Favorites

Consumers should be able to:

- Add PG to favorites
- Remove PG
- View saved properties
- Open PG details from favorites

Persist favorites locally initially.

Prepare the store so it can later sync with backend APIs.

---

# 15. Enquiry Flow

Create a simple enquiry flow.

Consumer selects:

```text
I'm interested in this PG.

Preferred move-in date
Budget
Room preference
Message

[ Send Enquiry ]
```

After submission:

```text
Enquiry sent successfully.

The property owner will contact you soon.
```

---

# 16. Booking Flow

Booking lifecycle:

```text
Consumer
   ↓
PG Details
   ↓
Select Room
   ↓
Select Bed
   ↓
Move-in Date
   ↓
Booking Request
   ↓
Seller Approval
   ↓
Payment
   ↓
Booking Confirmed
```

Booking states:

```ts
type BookingStatus =
  | "PENDING"
  | "APPROVED"
  | "PAYMENT_PENDING"
  | "CONFIRMED"
  | "CANCELLED"
  | "REJECTED"
  | "COMPLETED";
```

Create a booking confirmation screen.

---

# 17. Consumer Bookings

Bookings screen should show:

### Upcoming

- PG name
- Room type
- Move-in date
- Amount
- Booking status
- Payment status

### Past

- Completed bookings
- Cancelled bookings

Booking detail screen should contain all booking information.

---

# 18. Consumer Profile

Include:

- Profile photo
- Name
- Phone/email
- Personal information
- Saved PGs
- Bookings
- Enquiries
- Notifications
- Help & support
- Terms
- Logout

---

# 19. Seller Dashboard

Seller dashboard should be optimized for operations.

Display:

- Total properties
- Occupied beds
- Available beds
- Pending enquiries
- Pending bookings
- Monthly revenue
- Recent activity

Example:

```text
Good morning

Your Properties

Urban Nest PG
Madhapur

24 Beds
8 Available

₹2.1L Monthly Revenue

[Manage Property]

Today's Activity

12 New Enquiries
3 Booking Requests
5 Follow-ups

Quick Actions

[+ Add PG]
[Manage Beds]
[Availability]
[View Leads]
```

---

# 20. Seller Property Management

Seller can:

- View properties
- Add property
- Edit property
- Activate/deactivate property
- Preview listing
- Manage rooms
- Manage beds
- Manage pricing
- Manage availability

Property status:

```ts
type PropertyStatus =
  | "DRAFT"
  | "PENDING_VERIFICATION"
  | "ACTIVE"
  | "INACTIVE"
  | "REJECTED";
```

---

# 21. Add PG Wizard

Create a multi-step seller flow.

```text
Basic Information
      ↓
Location
      ↓
Photos
      ↓
Amenities
      ↓
Rooms & Beds
      ↓
Pricing
      ↓
Rules
      ↓
Preview
      ↓
Submit
```

## Step 1 — Basic Information

Fields:

- PG name
- Property type
- Gender
- Description

## Step 2 — Location

Fields:

- Address
- Locality
- City
- State
- Pincode
- Latitude
- Longitude

Prepare for map integration.

## Step 3 — Photos

Allow:

- Camera
- Gallery
- Multiple images
- Reordering
- Delete image
- Cover image

Initially use local/mock image handling.

## Step 4 — Amenities

Allow selecting:

- WiFi
- AC
- Food
- Washing machine
- Parking
- Power backup
- Housekeeping
- CCTV
- Security
- Attached bathroom
- Laundry
- Common area

## Step 5 — Rooms & Beds

Allow sellers to add multiple room types.

Example:

```text
Double Sharing

Total beds: 10
Available beds: 4
Rent: ₹9,000
Security deposit: ₹18,000
```

## Step 6 — Pricing

Support:

- Monthly rent
- Security deposit
- Maintenance
- Food charges
- Other charges

## Step 7 — Rules

Allow:

- Check-in time
- Check-out time
- Visitor policy
- Smoking policy
- Alcohol policy
- Notice period
- Other property rules

## Step 8 — Preview

Show exactly how the listing will appear to consumers.

## Step 9 — Submit

Move property to:

```text
PENDING_VERIFICATION
```

---

# 22. Seller Room & Bed Management

Create a dedicated management screen.

Example:

```text
Urban Nest PG

Total Beds     24
Occupied       16
Available       8

Rooms

A101
Double Sharing
2 / 2 Occupied
₹9,000

A102
Double Sharing
1 / 2 Occupied
₹9,000

A103
Triple Sharing
2 / 3 Occupied
₹7,500
```

Allow seller to update bed availability.

---

# 23. Seller Leads

Leads screen:

```text
All
New
Contacted
Interested
Converted
Closed
```

Each lead should show:

- Consumer name
- Phone
- PG
- Room preference
- Budget
- Move-in date
- Lead status
- Last contacted

Lead status:

```ts
type LeadStatus =
  | "NEW"
  | "CONTACTED"
  | "INTERESTED"
  | "CONVERTED"
  | "CLOSED";
```

---

# 24. Seller Bookings

Seller can see:

- New requests
- Approved bookings
- Payment pending
- Confirmed bookings
- Cancelled bookings

Seller actions:

```text
[Approve]
[Reject]
[View Details]
```

---

# 25. Realtime Architecture

Design the app for realtime updates.

Use REST APIs for standard CRUD operations and WebSockets for live events.

Potential WebSocket events:

```text
booking.created
booking.updated
booking.approved
booking.rejected

bed.availability.updated

listing.updated

enquiry.created

message.created
```

Example:

```text
Seller updates Bed A102
        ↓
Backend
        ↓
WebSocket event
        ↓
Consumer application
        ↓
Availability UI updates
```

Do not build the WebSocket backend in the first UI milestone, but structure services and state management so it can be added cleanly.

---

# 26. Notifications

Prepare notification architecture for:

### Consumer

- Booking approved
- Booking rejected
- Payment reminder
- Booking confirmed
- Enquiry response
- Property availability change

### Seller

- New enquiry
- New booking request
- Payment completed
- Booking cancelled

Initially use mock notifications.

---

# 27. Data Layer

Create mock repositories/services.

Example:

```ts
getPGs()
getPGById(id)
searchPGs(query)
filterPGs(filters)
getFavorites()
addFavorite(id)
removeFavorite(id)

createEnquiry(data)
getEnquiries()

createBooking(data)
getBookings()
getBookingById(id)
```

Keep UI components unaware of whether the data comes from mock data or an API.

---

# 28. State Management

Use Zustand for:

- Auth state
- User role
- Current user
- Favorites
- Selected filters
- App preferences

Use TanStack Query for:

- PG listings
- PG details
- Search
- Enquiries
- Bookings
- Seller properties
- Availability

Do not duplicate server state unnecessarily inside Zustand.

---

# 29. Design System

Create a centralized theme.

Include:

```ts
colors
spacing
typography
borderRadius
shadows
buttonVariants
inputVariants
```

Create reusable components:

```text
Button
Input
SearchBar
Card
PGCard
Badge
Avatar
Header
BottomSheet
Modal
Chip
FilterChip
Rating
Price
EmptyState
ErrorState
LoadingState
Skeleton
Divider
```

Avoid duplicating styles across screens.

---

# 30. UX Requirements

The application should have:

- Smooth navigation
- Proper loading states
- Skeleton loaders
- Empty states
- Error states
- Pull-to-refresh
- Keyboard-safe forms
- Accessible touch targets
- Confirmation dialogs for destructive actions
- Form validation
- Clear success/error feedback
- Responsive layouts
- Safe area handling

Avoid unnecessary animations.

Use animations only when they improve usability.

---

# 31. Navigation

Consumer navigation:

```text
Home
Search
Favorites
Bookings
Profile
```

Seller navigation:

```text
Dashboard
Properties
Leads
Bookings
Profile
```

Shared routes:

```text
PG Details
Notifications
Settings
Help
```

Use Expo Router and nested layouts.

---

# 32. Mock Data

Create realistic mock data.

Include at least:

- 10 PG properties
- Multiple cities/localities
- Multiple room types
- Different price ranges
- Different amenities
- Different availability
- Different ratings
- Verified and unverified properties

Example cities:

```text
Hyderabad
Bangalore
Pune
Chennai
Mumbai
```

Do not use only one hard-coded property.

---

# 33. Error Handling

Implement consistent handling for:

- Network failure
- Empty search results
- Invalid forms
- Missing property
- Booking failure
- Payment failure
- Authentication failure

Example:

```text
No PGs found

Try changing your location or filters.

[Clear Filters]
```

---

# 34. Performance Requirements

Optimize for mobile performance.

Requirements:

- FlatList for long lists
- Avoid unnecessary re-renders
- Memoize expensive components when useful
- Lazy-load screens where appropriate
- Optimize image rendering
- Debounce search
- Avoid deeply nested state
- Keep list item components lightweight

Do not prematurely optimize simple components.

---

# 35. Accessibility

Support:

- Accessible labels
- Sufficient touch target sizes
- Screen reader-friendly controls
- Meaningful button labels
- Proper input labels
- Color-independent status indicators

---

# 36. Security Preparation

Even though the first version uses mock data:

- Never hard-code secrets
- Never store passwords in plain text
- Keep API configuration in environment variables
- Separate development and production configuration
- Prepare secure token storage
- Validate all user input
- Never trust client-side pricing or booking data

---

# 37. Future Backend API Contract

Design APIs approximately like:

```text
POST   /auth/register
POST   /auth/login
POST   /auth/refresh
POST   /auth/logout

GET    /pgs
GET    /pgs/:id
POST   /pgs
PATCH  /pgs/:id
DELETE /pgs/:id

GET    /pgs/:id/rooms
PATCH  /rooms/:id

GET    /pgs/:id/availability
PATCH  /beds/:id/availability

POST   /favorites
DELETE /favorites/:pgId

POST   /enquiries
GET    /enquiries

POST   /bookings
GET    /bookings
GET    /bookings/:id
PATCH  /bookings/:id/status

POST   /payments/create
POST   /payments/verify
```

The frontend service layer should be designed around this future contract.

---

# 38. Realtime API Contract

Future WebSocket events:

```text
room.join

booking.created
booking.status_changed

bed.status_changed

enquiry.created
enquiry.updated

property.updated
```

Use a central WebSocket service rather than opening independent sockets from every screen.

---

# 39. Development Strategy

Build incrementally.

## Milestone 1 — Foundation

Implement:

- Expo project
- TypeScript
- Expo Router
- Theme
- Navigation
- Reusable components
- Mock data
- Basic state management

## Milestone 2 — Authentication

Implement:

- Splash
- Role selection
- Login
- Signup
- Mock authentication
- Role-based routing

## Milestone 3 — Consumer MVP

Implement:

- Home
- Search
- Filters
- PG cards
- PG details
- Favorites
- Profile

## Milestone 4 — Seller MVP

Implement:

- Dashboard
- Property listing
- Add PG
- Edit PG
- Rooms
- Beds
- Availability

## Milestone 5 — Booking

Implement:

- Enquiry
- Booking request
- Seller approval
- Consumer booking history
- Booking details
- Mock payment

## Milestone 6 — Realtime

Implement:

- WebSocket abstraction
- Availability updates
- Booking updates
- Notification events

## Milestone 7 — Production Backend

Replace mock services with:

- REST API
- PostgreSQL
- Authentication
- Image storage
- Payments
- Notifications
- WebSockets

---

# 40. Coding Standards

Use:

- TypeScript strict mode
- Explicit types for domain models
- Reusable components
- Feature-based organization
- Small focused functions
- Meaningful variable names
- No unnecessary `any`
- No duplicated business logic
- No API calls directly inside presentational components
- Environment-based configuration
- Consistent error handling

Prefer:

```ts
const { data, isLoading, error } = usePGs();
```

over putting API logic directly inside a screen.

---

# 41. Important Product Rules

1. Consumer and Seller experiences must feel distinct.
2. Both roles should use the same underlying domain models.
3. Availability must eventually be driven by actual beds, not only property-level status.
4. Booking state must be explicit and strongly typed.
5. UI must not depend directly on mock data structures.
6. API integration should be possible without redesigning screens.
7. Realtime events should update the relevant cached/state data rather than forcing full-screen refreshes.
8. All forms should have validation and clear error messages.
9. All lists must handle loading, empty, error, and success states.
10. The application should be scalable to multiple cities and thousands of properties.

---

# 42. Initial Deliverable

Start by implementing **Milestone 1 + the Consumer MVP foundation**.

The first working version should contain:

```text
Authentication
     ↓
Role Selection
     ↓
Consumer Home
     ↓
Search
     ↓
Filters
     ↓
PG Listing
     ↓
PG Details
     ↓
Favorites
     ↓
Consumer Profile
```

Use realistic mock data.

Do not implement a backend yet.

Do not implement payments yet.

Do not implement actual WebSockets yet.

However, structure the code so these can be introduced later without rewriting the application architecture.

---

# 43. Quality Bar

The final application should:

- Look like a polished commercial mobile product
- Have consistent spacing and typography
- Use reusable components
- Have clean navigation
- Feel responsive
- Have realistic data
- Have proper loading/empty/error states
- Avoid placeholder-looking UI
- Avoid excessive gradients or unnecessary visual effects
- Use clean cards and bottom sheets where appropriate
- Work on both Android and iOS
- Be easy for another engineer to understand and extend

---

# 44. Implementation Instruction

When generating code:

1. First create the project structure.
2. Define domain types.
3. Define theme and design tokens.
4. Create mock repositories/services.
5. Create reusable UI components.
6. Implement navigation.
7. Implement authentication and role selection.
8. Implement Consumer screens.
9. Implement Seller screens.
10. Connect screens to mock services.
11. Add validation and error handling.
12. Test navigation and major user flows.
13. Keep the code ready for future REST/WebSocket integration.

Do not dump the entire application into a single file.

Build the application in logical, maintainable modules.

When modifying existing code, preserve working functionality and make targeted changes instead of unnecessarily rewriting unrelated components.
