// 1 point per R$1 spent (floor). 100 points = R$5 discount.
const LoyaltyService = {
  POINTS_PER_REAL: 1,
  DISCOUNT_PER_100_POINTS: 5,
  MIN_REDEEM: 100,

  // Called after a successful order — awards points based on amount paid.
  earn(customer_id, total) {
    const points = Math.floor(total * this.POINTS_PER_REAL);
    if (points > 0) this._delta(customer_id, points);
    return points;
  },

  // Deducts points and returns the R$ discount. Rounds down to nearest 100.
  redeem(customer_id, points_requested) {
    const points = Math.floor(points_requested / 100) * 100;
    if (points < this.MIN_REDEEM) {
      throw new Error(`Minimum ${this.MIN_REDEEM} points required to redeem`);
    }
    const balance = this.getBalance(customer_id);
    if (points > balance) {
      throw new Error(`Insufficient points. Balance: ${balance}`);
    }
    const discount = (points / 100) * this.DISCOUNT_PER_100_POINTS;
    this._delta(customer_id, -points);
    return { discount, points_used: points, remaining: balance - points };
  },

  getBalance(customer_id) {
    const { row, pointsCol, data } = this._find(customer_id);
    if (row === -1) throw new Error('Customer not found');
    return Number(data[row][pointsCol]) || 0;
  },

  // Look up by phone number — used by the public GET loyalty endpoint.
  getByPhone(phone) {
    const customer = CustomerService.getByPhone(phone);
    if (!customer) throw new Error('Customer not found');
    return {
      customer_id: customer.customer_id,
      name: customer.name,
      loyalty_points: Number(customer.loyalty_points) || 0,
      next_reward_at: this._nextRewardThreshold(Number(customer.loyalty_points) || 0)
    };
  },

  // ─── Private ───────────────────────────────────────────────────────────────

  _delta(customer_id, delta) {
    const { sheet, row, pointsCol, data } = this._find(customer_id);
    if (row === -1) throw new Error('Customer not found');
    const updated = Math.max(0, (Number(data[row][pointsCol]) || 0) + delta);
    sheet.getRange(row + 1, pointsCol + 1).setValue(updated);
  },

  _find(customer_id) {
    const sheet = Utils.getSheet('Customers');
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const idCol = headers.indexOf('customer_id');
    const pointsCol = headers.indexOf('loyalty_points');
    for (let i = 1; i < data.length; i++) {
      if (data[i][idCol] === customer_id) return { sheet, row: i, pointsCol, data };
    }
    return { sheet, row: -1, pointsCol, data };
  },

  _nextRewardThreshold(current) {
    return Math.ceil((current + 1) / 100) * 100;
  }
};
