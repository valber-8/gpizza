class LoyaltyInfo {
  final String customerId;
  final String customerName;
  final int points;
  final int nextThreshold;

  const LoyaltyInfo({
    required this.customerId,
    required this.customerName,
    required this.points,
    required this.nextThreshold,
  });

  factory LoyaltyInfo.fromJson(Map<String, dynamic> json) {
    return LoyaltyInfo(
      customerId: json['customer_id'] as String? ?? '',
      customerName: json['customer_name'] as String? ?? '',
      points: (json['points'] as num? ?? 0).toInt(),
      nextThreshold: (json['next_threshold'] as num? ?? 100).toInt(),
    );
  }
}
