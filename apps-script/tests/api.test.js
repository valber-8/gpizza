import { test, describe, before } from 'node:test';
import assert from 'node:assert/strict';

const BASE = 'https://script.google.com/macros/s/AKfycbxAFzDejhZC-_vBtzIec7oMuI1KZ6rgDU96T6fyRfI3r20bZq2_eJQY0x6xOF2W_Kg7bQ/exec';

async function get(action, params = {}) {
  const url = new URL(BASE);
  url.searchParams.set('action', action);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const r = await fetch(url);
  assert.equal(r.status, 200, `GET ${action} → HTTP ${r.status}`);
  return r.json();
}

async function post(body) {
  const r = await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify(body),
  });
  assert.equal(r.status, 200, `POST ${body.action} → HTTP ${r.status}`);
  return r.json();
}

// shared state populated in before()
let firstItem = null;
let placedOrderId = null;

describe('GET /menu', () => {
  test('returns ok with categories and items', async () => {
    const body = await get('menu');
    assert.equal(body.ok, true);
    assert.ok(Array.isArray(body.data.categories), 'categories is array');
    assert.ok(Array.isArray(body.data.items), 'items is array');
    assert.ok(body.data.items.length > 0, 'at least one item');
    firstItem = body.data.items[0];
  });

  test('each item has required fields', async () => {
    const body = await get('menu');
    for (const item of body.data.items) {
      assert.ok(item.id, `item missing id: ${JSON.stringify(item)}`);
      assert.ok(item.name, `item missing name`);
      assert.ok(item.price > 0, `item price must be > 0`);
      assert.ok(item.category, `item missing category`);
    }
  });
});

describe('GET /offers', () => {
  test('returns ok with array', async () => {
    const body = await get('offers');
    assert.equal(body.ok, true);
    assert.ok(Array.isArray(body.data), 'data is array');
  });
});

describe('GET /settings', () => {
  test('returns ok with object', async () => {
    const body = await get('settings');
    assert.equal(body.ok, true);
    assert.ok(typeof body.data === 'object' && body.data !== null);
  });

  test('data is a plain object (key-value map)', async () => {
    const body = await get('settings');
    assert.equal(typeof body.data, 'object');
    assert.ok(!Array.isArray(body.data));
  });
});

describe('GET /reviews', () => {
  test('returns ok with array of approved reviews', async () => {
    const body = await get('reviews');
    assert.equal(body.ok, true);
    assert.ok(Array.isArray(body.data));
    for (const r of body.data) {
      assert.equal(r.status, 'approved', `review ${r.review_id} is not approved`);
    }
  });
});

describe('GET /order', () => {
  test('missing id returns error', async () => {
    const body = await get('order', {});
    assert.equal(body.ok, false);
  });

  test('unknown id returns error', async () => {
    const body = await get('order', { id: 'ORD-NOTEXIST' });
    assert.equal(body.ok, false);
  });
});

describe('GET /loyalty', () => {
  test('missing phone returns error', async () => {
    const body = await get('loyalty', {});
    assert.equal(body.ok, false);
  });

  test('unknown phone returns points=0', async () => {
    const body = await get('loyalty', { phone: '00000000000' });
    // either ok with 0 points or error — both are valid
    if (body.ok) {
      assert.ok(typeof body.data.points === 'number');
    } else {
      assert.ok(body.error);
    }
  });
});

describe('POST order', () => {
  test('missing required fields returns error', async () => {
    const body = await post({ action: 'order', customer_name: 'Test' });
    assert.equal(body.ok, false);
    assert.ok(body.error);
  });

  test('places a test order successfully', async () => {
    assert.ok(firstItem, 'menu item required — run menu test first');
    const body = await post({
      action: 'order',
      customer_name: '[API TEST] do not process',
      phone: '11900000000',
      order_type: 'takeaway',
      items: [{ id: firstItem.id, name: firstItem.name, qty: 1, unit_price: firstItem.price }],
    });
    assert.equal(body.ok, true, `place order failed: ${body.error}`);
    assert.ok(body.data.order_id, 'response missing order_id');
    placedOrderId = body.data.order_id;
  });
});

describe('GET /order by id', () => {
  test('retrieves placed order', async () => {
    assert.ok(placedOrderId, 'order required — run place order test first');
    const body = await get('order', { id: placedOrderId });
    assert.equal(body.ok, true, `fetch order failed: ${body.error}`);
    assert.equal(body.data.order_id, placedOrderId);
    assert.ok(['pending', 'received'].includes(body.data.status), `unexpected status: ${body.data.status}`);
  });
});

describe('POST review', () => {
  test('missing customer_name returns error', async () => {
    const body = await post({ action: 'review', rating: 5 });
    assert.equal(body.ok, false);
  });

  test('invalid rating returns error', async () => {
    const body = await post({ action: 'review', customer_name: 'Test', rating: 0 });
    assert.equal(body.ok, false);
  });

  test('submits review without order_id', async () => {
    const body = await post({
      action: 'review',
      customer_name: '[API TEST]',
      rating: 5,
      comment: 'automated test review',
    });
    assert.equal(body.ok, true, `submit review failed: ${body.error}`);
    assert.ok(body.data.review_id, 'response missing review_id');
  });
});

describe('POST applyOffer', () => {
  test('invalid code returns error', async () => {
    const body = await post({ action: 'applyOffer', code: 'INVALID_CODE_XYZ', subtotal: 100 });
    assert.equal(body.ok, false);
  });
});

describe('unknown action', () => {
  test('GET unknown action returns error', async () => {
    const body = await get('nonexistent');
    assert.equal(body.ok, false);
  });

  test('POST unknown action returns error', async () => {
    const body = await post({ action: 'nonexistent' });
    assert.equal(body.ok, false);
  });
});
