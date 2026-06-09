const Utils = {
  generateOrderId() {
    return `ORD-${Date.now()}`;
  },

  formatCurrency(amount) {
    return `R$ ${amount.toFixed(2)}`;
  },

  toISOString(date) {
    return Utilities.formatDate(date, Config.timezone, "yyyy-MM-dd'T'HH:mm:ss'Z'");
  },

  getTodayLabel() {
    return Utilities.formatDate(new Date(), Config.timezone, 'yyyy-MM-dd');
  },

  getSheet(name) {
    const ss = SpreadsheetApp.openById(Config.spreadsheetId);
    const sheet = ss.getSheetByName(name);
    if (!sheet) throw new Error(`Sheet "${name}" not found`);
    return sheet;
  },

  sheetToObjects(sheet) {
    const data = sheet.getDataRange().getValues();
    if (data.length < 2) return [];
    const headers = data[0];
    // Sheets date epoch — used to reverse-convert Date objects back to numeric
    // serial numbers. Apps Script's getValues() returns Date objects for cells
    // whose format is Date/Time even when the stored value is a plain number
    // (e.g. price columns auto-detected as dates).
    const EPOCH = new Date(1899, 11, 30); // Dec 30 1899 in script's local timezone
    return data.slice(1).map(row =>
      headers.reduce((obj, h, i) => {
        const v = row[i];
        obj[h] = v instanceof Date ? (v - EPOCH) / 86400000 : v;
        return obj;
      }, {})
    );
  }
};
