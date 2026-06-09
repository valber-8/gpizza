const OffersService = {
  getActiveOffers() {
    const now = new Date();
    return Utils.sheetToObjects(Utils.getSheet('offers'))
      .filter(o => {
        if (!o.active) return false;
        const from = o.valid_from ? new Date(o.valid_from) : null;
        const to = o.valid_to ? new Date(o.valid_to) : null;
        if (from && now < from) return false;
        if (to && now > to) return false;
        return true;
      });
  },

  validateOffer(code, subtotal) {
    const offers = this.getActiveOffers();
    const offer = offers.find(o => o.code && o.code.toUpperCase() === code.toUpperCase());
    if (!offer) throw new Error('Offer code not found or expired');

    if (offer.min_order && subtotal < offer.min_order) {
      throw new Error(`Minimum order of ${Utils.formatCurrency(offer.min_order)} required`);
    }

    let discount = 0;
    if (offer.type === 'percent') discount = subtotal * (offer.value / 100);
    else if (offer.type === 'fixed') discount = Math.min(offer.value, subtotal);

    return { offer, discount, final_total: subtotal - discount };
  },

  getAllOffers() {
    const sheet = Utils.getSheet('offers');
    const data  = sheet.getDataRange().getValues();
    if (data.length < 2) return [];
    const headers = data[0];
    return data.slice(1).map((row, i) => {
      const obj = {};
      headers.forEach((h, j) => { obj[h] = row[j]; });
      obj._row = i + 2;
      return obj;
    });
  },

  addOffer(data) {
    const sheet   = Utils.getSheet('offers');
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const row = headers.map(h => data[h] !== undefined ? data[h] : '');
    sheet.appendRow(row);
    return { ok: true };
  },

  updateOffer(rowNum, data) {
    const sheet   = Utils.getSheet('offers');
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    headers.forEach((h, i) => {
      if (data[h] !== undefined) {
        sheet.getRange(rowNum, i + 1).setValue(data[h]);
      }
    });
    return { ok: true };
  },

  deleteOffer(rowNum) {
    Utils.getSheet('offers').deleteRow(rowNum);
    return { ok: true };
  }
};
