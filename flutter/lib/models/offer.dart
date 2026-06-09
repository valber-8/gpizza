class Offer {
  final String code;
  final String description;
  final String discountType;
  final double discountValue;
  final double? minOrder;

  const Offer({
    required this.code,
    required this.description,
    required this.discountType,
    required this.discountValue,
    this.minOrder,
  });

  factory Offer.fromJson(Map<String, dynamic> json) {
    return Offer(
      code: json['code'] as String,
      description: json['description'] as String? ?? '',
      discountType: json['discount_type'] as String? ?? 'fixed',
      discountValue: (json['discount_value'] as num).toDouble(),
      minOrder: json['min_order'] != null
          ? (json['min_order'] as num).toDouble()
          : null,
    );
  }
}
