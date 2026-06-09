const CustomerService = {
  // Returns customer_id. Creates a new row if phone is not found.
  upsertCustomer(phone, name) {
    const sheet = Utils.getSheet('Customers');
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const phoneCol = headers.indexOf('phone');
    const nameCol  = headers.indexOf('name');
    const idCol    = headers.indexOf('customer_id');

    for (let i = 1; i < data.length; i++) {
      if (String(data[i][phoneCol]) === String(phone)) {
        if (name && data[i][nameCol] !== name) {
          sheet.getRange(i + 1, nameCol + 1).setValue(name);
        }
        return data[i][idCol];
      }
    }

    const customer_id = `CUST-${Date.now()}`;
    const now = Utils.toISOString(new Date());
    // Columns: customer_id | name | phone | email | address |
    //          total_orders | total_spent | first_order_at | last_order_at | notes | loyalty_points
    sheet.appendRow([customer_id, name, phone, '', '', 0, 0, now, now, '', 0]);
    return customer_id;
  },

  updateOrderStats(customer_id, total) {
    const sheet = Utils.getSheet('Customers');
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const idCol       = headers.indexOf('customer_id');
    const ordersCol   = headers.indexOf('total_orders');
    const spentCol    = headers.indexOf('total_spent');
    const lastOrdCol  = headers.indexOf('last_order_at');

    for (let i = 1; i < data.length; i++) {
      if (data[i][idCol] === customer_id) {
        sheet.getRange(i + 1, ordersCol  + 1).setValue(Number(data[i][ordersCol]) + 1);
        sheet.getRange(i + 1, spentCol   + 1).setValue(Number(data[i][spentCol])  + total);
        sheet.getRange(i + 1, lastOrdCol + 1).setValue(Utils.toISOString(new Date()));
        return;
      }
    }
  },

  getByPhone(phone) {
    return Utils.sheetToObjects(Utils.getSheet('Customers'))
      .find(c => String(c.phone) === String(phone)) || null;
  }
};
