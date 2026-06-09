# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GPizza is a pizza restaurant mobile ordering system. Customers use a React Native app; the backend is entirely Google Workspace (Sheets as database, Tasks for kitchen workflow, Drive for images). A Google Apps Script Web App acts as the API gateway — no separate server.

## Repository Structure

```
apps-script/   ← Google Apps Script backend (deployed as Web App)
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
- `Code.gs` — routes `doGet`/`doPost` by `action` parameter; all responses are `{ ok, data }` or `{ ok, error }`.
- `MenuService.gs` — reads `categories` + `menu` sheets; injects Drive image URLs.
- `OffersService.gs` — filters active offers by date; validates promo codes and calculates discounts.
- `OrderService.gs` — writes new order rows, updates status, delegates Task creation to `TasksService`.
- `TasksService.gs` — one Google Tasks list per day (`Orders — YYYY-MM-DD`), one task per order.
- `Config.gs` — reads Script Properties (never hardcode IDs here).
- `Utils.gs` — shared helpers: `getSheet()`, `sheetToObjects()`, `generateOrderId()`, `toISOString()`.

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
| `review` | none | Submit review (lands as `pending`) |
| `applyOffer` | none | Validate promo code, returns `{ discount, final_total }` |
| `redeemPoints` | none | Deduct points, returns `{ discount, points_used, remaining }` |
| `order-status-update` | `api_key` | Kitchen: advance order through status pipeline |
| `updateReview` | `api_key` | Approve or reject a pending review |
| `updateSetting` | `api_key` | Update a Settings row value (e.g. flip `is_open`) |

### Loyalty Points System

Defined in `LoyaltyService.gs`. Constants (change there to tune):
- **Earn**: 1 point per R$1 spent (floor), awarded automatically after every `order`
- **Redeem**: 100 points = R$5 discount; minimum 100, must be a multiple of 100
- **Column**: `loyalty_points` in the `Customers` tab

To redeem at checkout, include `redeem_points: <number>` in the `order` POST body — the discount is applied before the order total is calculated. The response includes `points_used`, `points_earned`, and `customer_id`.

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

Valid `status` values: `pending → confirmed → preparing → ready → delivered` (or `cancelled`).

**`is_open` setting**: set to `false` in the Settings tab to display a closed banner in the app. Checked via `SettingsService.isOpen()`.

**Category system**: there is no separate categories tab. The `Menu` tab has a `category` text column (e.g. `"Pizzas"`, `"Bebidas"`). `MenuService.getMenu()` derives the ordered category list from unique values in the items. `CategoryTabs.tsx` maps category names to icons via a hardcoded `ICONS` map — add new entries there when adding new categories.
