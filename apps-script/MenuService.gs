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
  }
};
