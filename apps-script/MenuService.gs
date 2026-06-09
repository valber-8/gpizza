const MenuService = {
  getMenu() {
    const items = Utils.sheetToObjects(Utils.getSheet('Menu'))
      .filter(i => i.available === true)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map(item => ({
        ...item,
        image_url: item.image_drive_id
          ? `https://drive.google.com/uc?id=${item.image_drive_id}`
          : null
      }));

    // Derive unique ordered categories from the items themselves
    const seen = new Set();
    const categories = [];
    items.forEach(i => {
      if (i.category && !seen.has(i.category)) {
        seen.add(i.category);
        categories.push(i.category);
      }
    });

    return { categories, items };
  },

  getAllItems() {
    const sheet = Utils.getSheet('Menu');
    const data  = sheet.getDataRange().getValues();
    if (data.length < 2) return [];
    const headers = data[0];
    return data.slice(1).map((row, i) => {
      const obj = {};
      headers.forEach((h, j) => { obj[h] = row[j]; });
      obj._row = i + 2; // 1-based row number (row 1 = headers)
      obj.image_url = obj.image_drive_id
        ? `https://drive.google.com/uc?id=${obj.image_drive_id}` : null;
      return obj;
    });
  },

  addItem(data) {
    const sheet = Utils.getSheet('Menu');
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const row = headers.map(h => data[h] !== undefined ? data[h] : '');
    sheet.appendRow(row);
    return { ok: true };
  },

  updateItem(rowNum, data) {
    const sheet   = Utils.getSheet('Menu');
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    headers.forEach((h, i) => {
      if (data[h] !== undefined) {
        sheet.getRange(rowNum, i + 1).setValue(data[h]);
      }
    });
    return { ok: true };
  },

  deleteItem(rowNum) {
    Utils.getSheet('Menu').deleteRow(rowNum);
    return { ok: true };
  }
};
