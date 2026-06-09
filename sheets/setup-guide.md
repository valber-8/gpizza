# Google Sheets Setup

## 1. Create the spreadsheet

Create a new Google Spreadsheet named **GPizza** and add six tabs with these exact names (case-sensitive):

`Menu` · `Offers` · `Orders` · `Customers` · `Reviews` · `Settings`

## 2. Add headers (row 1 of each tab)

### `Menu`
```
id | category | name | description | price | image_drive_id | available | sort_order
```

### `Offers`
```
id | title | description | type | value | min_order | valid_from | valid_to | active | code
```
- `type`: `percent` / `fixed` / `free_item`
- `valid_from` / `valid_to`: ISO date (`2026-12-31`) or blank for no limit

### `Orders`
```
order_id | customer_id | customer_name | phone | items_json | subtotal | discount | offer_code | total | status | notes | delivery_address | order_type | created_at | updated_at | points_used | points_earned | task_id
```
Starts empty — written by the API on each order. 18 columns total.

### `Customers`
```
customer_id | name | phone | email | address | total_orders | total_spent | first_order_at | last_order_at | notes | loyalty_points
```
Auto-populated when orders are placed. `loyalty_points` starts at 0 and is updated by `LoyaltyService` after every order.

### `Reviews`
```
review_id | customer_id | customer_name | order_id | rating | comment | created_at | status
```
- `status`: `pending` (default) / `approved` / `rejected` — moderate via staff `updateReview` call.

### `Settings`
```
key | value | description
```
See `seed-data.json` for all default keys. The `is_open` key is the live on/off switch for the restaurant.

## 3. Populate with seed data

Copy the rows from `seed-data.json` into each tab. `Orders`, `Customers`, and `Reviews` start with headers only.

## 4. Item images

1. Upload photos to **Google Drive** → `/gpizza/menu-images/`
2. For each file: right-click → Share → **Anyone with the link can view**
3. Copy the file ID from the URL: `drive.google.com/file/d/FILE_ID/view`
4. Paste `FILE_ID` into the `image_drive_id` column for that menu row

## 5. Connect Apps Script

See `apps-script/` directory and follow the deployment instructions in `CLAUDE.md`.

## 6. Weekly backup (optional)

Add to Apps Script and set a time-based weekly trigger:

```javascript
function backupOrdersToDrive() {
  const sheet = Utils.getSheet('Orders');
  const csv = sheet.getDataRange().getValues()
    .map(row => row.join(',')).join('\n');
  const filename = `orders-backup-${Utils.getTodayLabel()}.csv`;
  DriveApp.getFolderById('YOUR_BACKUP_FOLDER_ID')
    .createFile(filename, csv, MimeType.CSV);
}
```
