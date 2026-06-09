// ─────────────────────────────────────────────────────────────────────────────
// GET  ?action=menu|offers|order|loyalty|reviews|settings
// POST body: { action, ...payload }
// All responses: { ok: true, data } | { ok: false, error, code }
// ─────────────────────────────────────────────────────────────────────────────

function doGet(e) {
  try {
    const p = e.parameter;

    // Serve admin panel when no action is provided
    if (!p.action) {
      return HtmlService.createHtmlOutputFromFile('admin')
        .setTitle('GPizza Admin')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    }

    switch (p.action) {
      case 'menu':
        return ok(MenuService.getMenu());

      case 'offers':
        return ok(OffersService.getActiveOffers());

      case 'order':
        requireParam(p.id, 'id');
        return ok(OrderService.get(p.id));

      case 'loyalty':
        requireParam(p.phone, 'phone');
        return ok(LoyaltyService.getByPhone(p.phone));

      case 'reviews':
        return ok(ReviewService.getApproved());

      case 'settings':
        return ok(SettingsService.getAll());

      // ── Admin endpoints ────────────────────────────────────────────────────
      case 'menu-admin':
        return ok(MenuService.getAllItems());

      case 'orders-active':
        return ok(OrderService.getActive());

      case 'orders-history':
        return ok(OrderService.getAll());

      case 'offers-admin':
        return ok(OffersService.getAllOffers());

      case 'reviews-admin':
        return ok(ReviewService.getAll());

      default:
        return err('Unknown action', 400);
    }
  } catch (ex) {
    return err(ex.message || 'Internal error', ex.statusCode || 500);
  }
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    switch (body.action) {

      // ── Customer-facing ────────────────────────────────────────────────────
      case 'order':
        return ok(OrderService.place(body));

      case 'review':
        return ok(ReviewService.submit(body));

      case 'applyOffer':
        return ok(OffersService.validateOffer(body.code, body.subtotal));

      case 'redeemPoints':
        requireParam(body.customer_id, 'customer_id');
        requireParam(body.points, 'points');
        return ok(LoyaltyService.redeem(body.customer_id, body.points));

      // ── Staff-only (require api_key) ───────────────────────────────────────
      case 'order-status-update':
        Auth.requireStaffKey(body.api_key);
        return ok(OrderService.updateStatus(body.order_id, body.status));

      case 'updateReview':
        Auth.requireStaffKey(body.api_key);
        return ok(ReviewService.updateStatus(body.review_id, body.status));

      case 'updateSetting':
        Auth.requireStaffKey(body.api_key);
        return ok(SettingsService.update(body.key, body.value));

      // ── Menu CRUD ──────────────────────────────────────────────────────────
      case 'addMenuItem':
        Auth.requireStaffKey(body.api_key);
        return ok(MenuService.addItem(body));

      case 'updateMenuItem':
        Auth.requireStaffKey(body.api_key);
        return ok(MenuService.updateItem(body._row, body));

      case 'deleteMenuItem':
        Auth.requireStaffKey(body.api_key);
        return ok(MenuService.deleteItem(body._row));

      // ── Offer CRUD ─────────────────────────────────────────────────────────
      case 'addOffer':
        Auth.requireStaffKey(body.api_key);
        return ok(OffersService.addOffer(body));

      case 'updateOffer':
        Auth.requireStaffKey(body.api_key);
        return ok(OffersService.updateOffer(body._row, body));

      case 'deleteOffer':
        Auth.requireStaffKey(body.api_key);
        return ok(OffersService.deleteOffer(body._row));

      default:
        return err('Unknown action', 400);
    }
  } catch (ex) {
    return err(ex.message || 'Internal error', ex.statusCode || 500);
  }
}

// ─── google.script.run admin functions ───────────────────────────────────────
// Called from admin.html via google.script.run (no api_key param needed —
// key is verified server-side by adminCheck).

function adminCheck(key) {
  try { Auth.requireStaffKey(key); return true; } catch(_) { return false; }
}

function adminGetActiveOrders(key) {
  Auth.requireStaffKey(key);
  return JSON.stringify(OrderService.getActive());
}

function adminGetAllOrders(key) {
  Auth.requireStaffKey(key);
  return JSON.stringify(OrderService.getAll());
}

function adminGetMenu(key) {
  Auth.requireStaffKey(key);
  return JSON.stringify(MenuService.getAllItems());
}

function adminGetOffers(key) {
  Auth.requireStaffKey(key);
  return JSON.stringify(OffersService.getAllOffers());
}

function adminGetReviews(key) {
  Auth.requireStaffKey(key);
  return JSON.stringify(ReviewService.getAll());
}

function adminGetSettings(key) {
  Auth.requireStaffKey(key);
  return JSON.stringify(SettingsService.getAll());
}

function adminUpdateStatus(key, order_id, status) {
  Auth.requireStaffKey(key);
  return JSON.stringify(OrderService.updateStatus(order_id, status));
}

function adminSaveMenuItem(key, data) {
  Auth.requireStaffKey(key);
  const d = JSON.parse(data);
  if (d._row) return JSON.stringify(MenuService.updateItem(d._row, d));
  return JSON.stringify(MenuService.addItem(d));
}

function adminDeleteMenuItem(key, row) {
  Auth.requireStaffKey(key);
  return JSON.stringify(MenuService.deleteItem(row));
}

function adminSaveOffer(key, data) {
  Auth.requireStaffKey(key);
  const d = JSON.parse(data);
  if (d._row) return JSON.stringify(OffersService.updateOffer(d._row, d));
  return JSON.stringify(OffersService.addOffer(d));
}

function adminDeleteOffer(key, row) {
  Auth.requireStaffKey(key);
  return JSON.stringify(OffersService.deleteOffer(row));
}

function adminUpdateReview(key, review_id, status) {
  Auth.requireStaffKey(key);
  return JSON.stringify(ReviewService.updateStatus(review_id, status));
}

function adminUpdateSetting(key, k, v) {
  Auth.requireStaffKey(key);
  return JSON.stringify(SettingsService.update(k, v));
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function ok(data) {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, data }))
    .setMimeType(ContentService.MimeType.JSON);
}

function err(message, code) {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: false, error: message, code }))
    .setMimeType(ContentService.MimeType.JSON);
}

function requireParam(value, name) {
  if (value === undefined || value === null || value === '') {
    const e = new Error(`Missing required parameter: ${name}`);
    e.statusCode = 400;
    throw e;
  }
}
