const ReviewService = {
  submit(data) {
    ['customer_name', 'rating'].forEach(f => {
      if (!data[f]) throw new Error(`Missing field: ${f}`);
    });
    if (data.rating < 1 || data.rating > 5) throw new Error('Rating must be 1–5');

    const review_id = `REV-${Date.now()}`;
    Utils.getSheet('Reviews').appendRow([
      review_id,
      data.customer_id || '',
      data.customer_name,
      data.order_id,
      Number(data.rating),
      data.comment || '',
      Utils.toISOString(new Date()),
      'pending'
    ]);
    return { review_id };
  },

  getApproved() {
    return Utils.sheetToObjects(Utils.getSheet('Reviews'))
      .filter(r => r.status === 'approved')
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  updateStatus(review_id, status) {
    const VALID = ['pending', 'approved', 'rejected'];
    if (!VALID.includes(status)) throw new Error('Invalid review status');

    const sheet   = Utils.getSheet('Reviews');
    const data    = sheet.getDataRange().getValues();
    const headers = data[0];
    const idCol     = headers.indexOf('review_id');
    const statusCol = headers.indexOf('status');

    for (let i = 1; i < data.length; i++) {
      if (data[i][idCol] === review_id) {
        sheet.getRange(i + 1, statusCol + 1).setValue(status);
        return { review_id, status };
      }
    }
    throw new Error('Review not found');
  },

  getAll() {
    return Utils.sheetToObjects(Utils.getSheet('Reviews'))
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }
};
