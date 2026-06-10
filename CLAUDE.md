# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GPizza is a pizza restaurant mobile ordering system. Customers use a React Native app; the backend is entirely Google Workspace (Sheets as database, Tasks for kitchen workflow, Drive for images). A Google Apps Script Web App acts as the API gateway — no separate server.

## Repository Structure

```
apps-script/   ← Google Apps Script backend (deployed as Web App)
apps-script/tests/  ← API integration tests (node --test)
flutter/       ← Flutter web customer app (deployed to Firebase Hosting, embedded in Google Sites)
mobile/        ← Expo React Native customer app
sheets/        ← Spreadsheet setup guide and seed data
sites/         ← Copy/content for the Google Sites public showcase
```

---

## Apps Script

### Deployment Setup
1. Create a Google Spreadsheet with four tabs: `categories`, `menu`, `offers`, `orders` (see `sheets/setup-guide.md` for exact column headers).
2. Open **Extensions → Apps Script** in the spreadsheet and paste all `.gs` files from `apps-script/`.
3. Enable the Tasks advanced service: **Services → Google Tasks API v1** (symbol: `Tasks`).
4. Set **Script Properties** (`Project Settings → Script Properties`):
   - `SPREADSHEET_ID` — the spreadsheet ID from its URL
   - `STAFF_API_KEY` — a secret string used only for `updateStatus` calls
5. Deploy: **Deploy → New Deployment → Web App → Execute as: Me, Access: Anyone**.
6. Paste the deployment URL into `mobile/.env` as `EXPO_PUBLIC_APPS_SCRIPT_URL`.

> Every code change requires a new deployment version. Go to **Deploy → Manage Deployments → Edit → New version** to push updates.

### Architecture
- `Code.gs` — routes `doGet`/`doPost` by `action` parameter; serves `admin.html` when no `action` param; exposes `adminXxx()` functions for `google.script.run`; all responses are `{ ok, data }` or `{ ok, error }`.
- `MenuService.gs` — reads `Menu` sheet; injects Drive image URLs. `getAllItems()` returns rows with `_row` for CRUD.
- `OffersService.gs` — filters active offers by date; validates promo codes and calculates discounts. `getAllOffers()` for admin.
- `OrderService.gs` — writes new order rows (`status: 'received'`), updates status, delegates Task creation to `TasksService`. `getActive()` returns non-terminal orders; `getAll()` returns all orders newest-first.
- `ReviewService.gs` — `order_id` is optional on submit; moderated via `updateStatus`.
- `TasksService.gs` — one Google Tasks list per day (`Orders — YYYY-MM-DD`), one task per order.
- `Config.gs` — reads Script Properties (never hardcode IDs here).
- `Utils.gs` — shared helpers: `getSheet()`, `sheetToObjects()`, `generateOrderId()`, `toISOString()`.
- `admin.html` — single-file admin panel served by HTML Service. Communicates with the server exclusively via `google.script.run` (not `fetch`). All JS is ES5 — no template literals, no optional chaining, no arrow functions in dynamic HTML — due to Apps Script NATIVE sandbox restrictions. Event handlers in dynamic HTML use `data-*` attributes + a single `document.body` event delegation listener (CSP blocks inline `onclick` in `innerHTML`).

### API Reference

**GET endpoints** — `?action=<action>[&param=value]`

| action | params | Description |
|--------|--------|-------------|
| `menu` | — | Items + derived category list |
| `offers` | — | Active offers (filtered by date) |
| `order` | `id` | Single order by ID |
| `loyalty` | `phone` | Customer's points balance + next reward threshold |
| `reviews` | — | Approved reviews only |
| `settings` | — | All Settings key-value pairs |

**POST endpoints** — `body: { action, ...payload }`

| action | Auth | Description |
|--------|------|-------------|
| `order` | none | Place order → upserts Customer → Sheets row → Tasks task |
| `review` | none | Submit review (`order_id` optional); lands as `pending` |
| `applyOffer` | none | Validate promo code, returns `{ discount, final_total }` |
| `redeemPoints` | none | Deduct points, returns `{ discount, points_used, remaining }` |
| `order-status-update` | `api_key` | Kitchen: advance order through status pipeline |
| `updateReview` | `api_key` | Approve or reject a pending review |
| `updateSetting` | `api_key` | Update a Settings row value (e.g. flip `is_open`) |
| `addMenuItem` / `updateMenuItem` / `deleteMenuItem` | `api_key` | Menu CRUD |
| `addOffer` / `updateOffer` / `deleteOffer` | `api_key` | Offer CRUD |

**Admin panel** — `google.script.run` functions (called from `admin.html`, key passed as first arg):
`adminCheck`, `adminGetActiveOrders`, `adminGetAllOrders`, `adminGetMenu`, `adminGetOffers`, `adminGetReviews`, `adminGetSettings`, `adminUpdateStatus`, `adminSaveMenuItem`, `adminDeleteMenuItem`, `adminSaveOffer`, `adminDeleteOffer`, `adminUpdateReview`, `adminUpdateSetting`.

### Loyalty Points System

Defined in `LoyaltyService.gs`. Constants (change there to tune):
- **Earn**: 1 point per R$1 spent (floor), awarded automatically after every `order`
- **Redeem**: 100 points = R$5 discount; minimum 100, must be a multiple of 100
- **Column**: `loyalty_points` in the `Customers` tab

To redeem at checkout, include `redeem_points: <number>` in the `order` POST body — the discount is applied before the order total is calculated. The response includes `points_used`, `points_earned`, and `customer_id`.

---

## Flutter Web App

Customer-facing web app deployed to Firebase Hosting and embedded in Google Sites at `sites.google.com/view/gpizza`.

```bash
cd flutter
flutter build web --release --dart-define=VAPID_KEY=<key>
firebase deploy --only hosting
```

VAPID key: Firebase Console → gpizza-firebase → Project Settings → Cloud Messaging → Web Push certificates → Key pair.

- API URL: `flutter/lib/config/api_config.dart` (`ApiConfig.baseUrl`).
- `flutter/lib/firebase_options.dart` and `flutter/web/firebase-messaging-sw.js` are gitignored — contain real Firebase API keys, never commit.
- Flutter binary: `/home/valber/build/flutter/bin/flutter`

### FCM / Push notifications

- FCM credentials (`FCM_PROJECT_ID`, `FCM_CLIENT_EMAIL`, `FCM_PRIVATE_KEY`) are stored in Apps Script Script Properties — never in code.
- `NotificationService` caches the FCM token after the first `getToken(vapidKey:)` call in `main.dart`; subsequent calls (e.g. from checkout) return the cached value.
- `flutter_local_notifications` is skipped on web (`kIsWeb` guard) — it has no web support and its `initialize()` would throw, silently preventing FCM from loading.
- **Google Sites iframe limitation**: `Notification.requestPermission()` is blocked in iframes without `allow="notifications"` on the `<iframe>` tag. Google Sites does not set this, so push notifications do not work when the app is embedded. The app degrades gracefully — orders and status tracking (polling every 30 s) work normally. Push works when accessing `gpizza-firebase.web.app` directly.

---

## Testing

```bash
node --test apps-script/tests/api.test.js
```

Integration tests in `apps-script/tests/api.test.js` hit the live deployment (no mocks, no dependencies). Requires Node 18+. Covers all GET/POST endpoints: menu, offers, settings, reviews, order (place + retrieve), loyalty, review submit, applyOffer, error paths.

---

## Mobile App

### Setup
```bash
cd mobile
npm install
cp .env.example .env     # fill in EXPO_PUBLIC_APPS_SCRIPT_URL
npm start
```

### Commands
```bash
npm start          # Expo dev server (scan QR with Expo Go)
npm run android    # Android emulator/device
npm run ios        # iOS simulator/device
npm run type-check # TypeScript check without emit
npm run lint       # ESLint
```

> The `mobile/assets/` directory needs `icon.png`, `splash.png`, `adaptive-icon.png`, and `notification-icon.png` before building for production (see `app.json` for dimensions).

### Architecture
- **Routing**: Expo Router (file-based). Tab group at `app/(tabs)/`, stack screens at `app/checkout.tsx`, `app/order-confirmed.tsx`, `app/item/[id].tsx`.
- **Data fetching**: React Query (`@tanstack/react-query`). Menu is cached for 15 min. Order tracking polls every 30 s via `refetchInterval`.
- **Cart state**: Zustand store persisted to AsyncStorage (`src/store/cart.ts`). Survives app restarts.
- **API layer**: `src/api/client.ts` provides `apiGet`/`apiPost` targeting the Apps Script URL from `EXPO_PUBLIC_APPS_SCRIPT_URL`.
- **Types**: All shared interfaces live in `src/types/index.ts`.
- **Theme**: Colors, spacing, font sizes, and border radii are centralized in `src/constants/theme.ts`.

### Adding a new API endpoint
1. Add the handler in the relevant `*Service.gs` file.
2. Register the new `action` in `Code.gs` (`doGet` or `doPost` switch).
3. Add the typed call in `mobile/src/api/`.
4. Wrap it in a React Query hook in `mobile/src/hooks/`.

---

## Data Model (Google Sheets — 6 tabs)

| Tab | Purpose |
|-----|---------|
| `Menu` | Items with `category` string column; categories are derived, not a separate tab |
| `Offers` | Promo codes with date range and discount type |
| `Orders` | One row per order; written by `placeOrder`, updated by `updateStatus` |
| `Customers` | Auto-upserted on each `placeOrder`; tracks `total_orders` and `total_spent` |
| `Reviews` | Customer reviews; moderated via `updateReview` (pending → approved/rejected) |
| `Settings` | Key-value config (delivery fee, open/close toggle, estimated times, etc.) |

**`Orders` column order** (Apps Script appends rows in this exact sequence, 16 columns):
`order_id | customer_id | customer_name | phone | items_json | subtotal | discount | offer_code | total | status | notes | delivery_address | order_type | created_at | updated_at | task_id`

`items_json` is a JSON string `[{ id, name, qty, unit_price }]`.

Valid `status` values (pipeline): `pending → received → preparing → baking → ready → out_for_delivery → completed` (or `cancelled`). New orders are written with `received`; orders arriving via older deployments may have `pending` — the admin kanban handles both.

**`is_open` setting**: set to `false` in the Settings tab to display a closed banner in the app. Checked via `SettingsService.isOpen()`.

**Category system**: there is no separate categories tab. The `Menu` tab has a `category` text column (e.g. `"Pizzas"`, `"Bebidas"`). `MenuService.getMenu()` derives the ordered category list from unique values in the items. `CategoryTabs.tsx` maps category names to icons via a hardcoded `ICONS` map — add new entries there when adding new categories.
