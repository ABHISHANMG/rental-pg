# Zaptel — PG Rental Marketplace (React Native)

A PG / co-living rental marketplace built with **Expo + Expo Router** in **JavaScript**.
UI design language: **Soft Neo-Brutalist + Minimal Marketplace** — warm cream canvas,
confident 2px ink borders, hard blur-less offset shadows, chunky-but-soft corners and a
few punchy pastel accents.

This milestone delivers **Milestone 1 + the Consumer MVP** against a **mock data layer**.
No backend, payments or real WebSockets — but the architecture is structured so those
drop in later without rewriting screens.

## Run it

```bash
npm install        # .npmrc pins legacy-peer-deps (React 19 vs some transitive web peers)
npx expo start     # then press i (iOS), a (Android), or w (web)
```

## What's implemented

Splash → Role selection → Login/Signup (mock OTP) → Consumer tabs:

- **Home** — greeting, city picker, search entry, popular locations, recommended
  (horizontal), recently viewed, nearby list.
- **Search** — debounced text search + filter bottom sheet (rent, gender, property/room
  type, amenities, quick filters); recent + popular searches when idle.
- **PG Details** — image gallery, amenities, availability, room options, pricing, rules,
  map placeholder, seller card, sticky Enquire / Book CTA.
- **Enquiry** and **Booking request** flows (bottom sheets → mock service → confirmation).
- **Favorites**, **Bookings** (Upcoming/Past), **Profile**, shared **Notifications**.

Every list handles loading (skeletons), empty, error and success states.

## Architecture

```
app/                         # Expo Router routes (file-based navigation)
  (auth)/                    # role-selection, login, signup
  (consumer)/                # tab group: home, search, favorites, bookings, profile
  pg/[id].jsx                # shared PG details
  notifications.jsx          # shared route
src/
  theme/                     # design tokens (colors, spacing, radius, shadow, typography)
  constants/                 # amenity/room/gender catalogs, cities, statuses
  services/                  # mock API client + pg/booking/auth services (REST-shaped)
    mock/pgs.js              # the only place raw mock records live
  store/                     # Zustand: auth, favorites, app prefs/filters
  hooks/                     # useAsync (TanStack-Query-shaped), usePGs, useDebounce
  components/common/         # Surface, Button, Input, SearchBar, Chip, Badge, BottomSheet…
  components/consumer/       # PGCard, FiltersSheet, EnquirySheet, RoomSelectSheet…
  utils/                     # money formatting, PG derivations, ids
```

### Design decisions

- **`Surface`** is the core primitive: it renders the hard offset shadow + ink border and
  becomes tactile (presses down onto its shadow) when given `onPress`. Every raised
  element is built on it, so the shadow language stays consistent.
- **Screens never touch mock data.** They call hooks (`usePGs`, `useFilteredPGs`) that call
  services that mirror the future REST contract (`GET /pgs`, `POST /bookings`, …). Swapping
  in a real API is a service-body change, not a screen change.
- **`useAsync`** intentionally mirrors TanStack Query's `{ data, isLoading, error, refetch }`
  surface so migrating to it later is a hook swap.
- Server data is fetched, not duplicated in Zustand; Zustand holds only client state
  (auth/role, favorites ids, filters, recents).

## Not in this milestone (by design)

Seller experience, real backend/DB, payments (Razorpay), image upload, live WebSockets and
push notifications — all have seams left in the services/stores (`// TODO(...)` markers).
