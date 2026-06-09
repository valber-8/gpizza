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
  }
};
