const SettingsService = {
  getAll() {
    return Utils.sheetToObjects(Utils.getSheet('Settings'))
      .reduce((obj, row) => {
        obj[row.key] = row.value;
        return obj;
      }, {});
  },

  update(key, value) {
    const sheet = Utils.getSheet('Settings');
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const keyCol = headers.indexOf('key');
    const valueCol = headers.indexOf('value');

    for (let i = 1; i < data.length; i++) {
      if (data[i][keyCol] === key) {
        sheet.getRange(i + 1, valueCol + 1).setValue(value);
        return { key, value };
      }
    }
    throw new Error(`Setting "${key}" not found`);
  },

  isOpen() {
    const val = this.getAll().is_open;
    return val === 'true' || val === true;
  }
};
