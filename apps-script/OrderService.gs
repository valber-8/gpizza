const OrderService = {
  place(data) {
    // ── Validation ────────────────────────────────────────────────────────────
    ['customer_name', 'phone', 'items', 'order_type'].forEach(f => {
      if (!data[f]) throw new Error(`Missing field: ${f}`);
    });
    if (!data.items.length) throw new Error('Order must have at least one item');
    if (data.order_type === 'delivery' && !data.delivery_address) {
      throw new Error('Delivery address required for delivery orders');
    }

    const subtotal = data.items.reduce((sum, i) => sum + i.unit_price * i.qty, 0);

    // ── Offer discount ────────────────────────────────────────────────────────
    let offer_discount = 0;
    if (data.offer_code) {
      try { offer_discount = OffersService.validateOffer(data.offer_code, subtotal).discount; }
      catch (_) {}
    }

    // ── Upsert customer ───────────────────────────────────────────────────────
    let customer_id = '';
    try {
      customer_id = CustomerService.upsertCustomer(data.phone, data.customer_name);
    } catch (ex) {
      Logger.log('Customer upsert: ' + ex.message);
    }

    // ── Loyalty points redemption ─────────────────────────────────────────────
    let loyalty_discount = 0;
    let points_used = 0;
    if (data.redeem_points && customer_id) {
      try {
        const r = LoyaltyService.redeem(customer_id, data.redeem_points);
        loyalty_discount = r.discount;
        points_used = r.points_used;
      } catch (ex) {
        Logger.log('Loyalty redeem: ' + ex.message);
      }
    }

    const discount = offer_discount + loyalty_discount;
    const total    = Math.max(0, subtotal - discount);
    const order_id = Utils.generateOrderId();
    const now      = new Date();

    // ── Write to Orders sheet ─────────────────────────────────────────────────
    // Columns: order_id | customer_id | customer_name | phone | items_json |
    //          subtotal | discount | offer_code | total | status | notes |
    //          delivery_address | order_type | created_at | updated_at |
    //          points_used | points_earned | task_id | fcm_token
    const sheet = Utils.getSheet('Orders');
    const points_earned = Math.floor(total * LoyaltyService.POINTS_PER_REAL);
    sheet.appendRow([
      order_id, customer_id, data.customer_name, data.phone,
      JSON.stringify(data.items),
      subtotal, discount, data.offer_code || '', total,
      'received', data.notes || '', data.delivery_address || '', data.order_type,
      Utils.toISOString(now), Utils.toISOString(now),
      points_used, points_earned, '',
      data.fcm_token || '',
    ]);

    // ── Google Tasks ──────────────────────────────────────────────────────────
    try {
      const task_id = TasksService.createOrderTask(order_id, data, total);
      sheet.getRange(sheet.getLastRow(), 18).setValue(task_id);
    } catch (ex) {
      Logger.log('Tasks: ' + ex.message);
    }

    // ── Notify customer: order received ───────────────────────────────────────
    try { NotificationService.send(data.fcm_token || '', 'received', order_id); } catch (_) {}

    // ── Post-order stats & loyalty earn ──────────────────────────────────────
    if (customer_id) {
      try { CustomerService.updateOrderStats(customer_id, total); } catch (_) {}
      try { LoyaltyService.earn(customer_id, total); }             catch (_) {}
    }

    const estimated_minutes = SettingsService.getAll()[
      data.order_type === 'delivery' ? 'estimated_delivery_min' : 'estimated_pickup_min'
    ] || 35;

    return {
      order_id, total, subtotal, discount,
      points_used, points_earned,
      customer_id,
      estimated_minutes: Number(estimated_minutes)
    };
  },

  get(order_id) {
    const order = Utils.sheetToObjects(Utils.getSheet('Orders'))
      .find(o => o.order_id === order_id);
    if (!order) throw new Error('Order not found');
    return { ...order, items: JSON.parse(order.items_json || '[]') };
  },

  updateStatus(order_id, status) {
    const VALID = ['received', 'preparing', 'baking', 'ready', 'out_for_delivery', 'completed', 'cancelled'];
    if (!VALID.includes(status)) throw new Error(`Invalid status. Must be one of: ${VALID.join(', ')}`);

    const sheet   = Utils.getSheet('Orders');
    const data    = sheet.getDataRange().getValues();
    const headers = data[0];
    const idCol       = headers.indexOf('order_id');
    const statusCol   = headers.indexOf('status');
    const updatedCol  = headers.indexOf('updated_at');
    const taskCol     = headers.indexOf('task_id');
    const fcmTokenCol = headers.indexOf('fcm_token');

    for (let i = 1; i < data.length; i++) {
      if (data[i][idCol] === order_id) {
        sheet.getRange(i + 1, statusCol  + 1).setValue(status);
        sheet.getRange(i + 1, updatedCol + 1).setValue(Utils.toISOString(new Date()));
        if (status === 'completed') {
          try { TasksService.completeOrderTask(data[i][taskCol]); } catch (_) {}
        }
        const fcmToken = fcmTokenCol >= 0 ? data[i][fcmTokenCol] : '';
        try { NotificationService.send(fcmToken, status, order_id); } catch (_) {}
        return { order_id, status };
      }
    }
    throw new Error('Order not found');
  }
};
