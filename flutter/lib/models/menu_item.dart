class MenuItem {
  final String id;
  final String category;
  final String name;
  final String description;
  final double price;
  final String? imageDriveId;
  final bool available;
  final int sortOrder;
  final String? imageUrl;

  const MenuItem({
    required this.id,
    required this.category,
    required this.name,
    required this.description,
    required this.price,
    this.imageDriveId,
    required this.available,
    required this.sortOrder,
    this.imageUrl,
  });

  factory MenuItem.fromJson(Map<String, dynamic> json) {
    return MenuItem(
      id: json['id'] as String,
      category: json['category'] as String,
      name: json['name'] as String,
      description: json['description'] as String? ?? '',
      price: (json['price'] as num).toDouble(),
      imageDriveId: json['image_drive_id'] as String?,
      available: json['available'] as bool? ?? true,
      sortOrder: (json['sort_order'] as num?)?.toInt() ?? 0,
      imageUrl: json['image_url'] as String?,
    );
  }
}
