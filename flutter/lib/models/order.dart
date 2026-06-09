import 'dart:convert';

class OrderDetail {
  final String orderId;
  final String customerId;
  final String status;
  final double total;
  final double subtotal;
  final double discount;
  final List<dynamic> items;
  final String createdAt;
  final String updatedAt;
  final String orderType;
  final String? deliveryAddress;
  final String? notes;

  const OrderDetail({
    required this.orderId,
    required this.customerId,
    required this.status,
    required this.total,
    required this.subtotal,
    required this.discount,
    required this.items,
    required this.createdAt,
    required this.updatedAt,
    required this.orderType,
    this.deliveryAddress,
    this.notes,
  });

  factory OrderDetail.fromJson(Map<String, dynamic> json) {
    List<dynamic> parsedItems = [];
    final rawItems = json['items'];
    if (rawItems is List) {
      parsedItems = rawItems;
    } else if (rawItems is String && rawItems.isNotEmpty) {
      try {
        parsedItems = jsonDecode(rawItems) as List<dynamic>;
      } catch (_) {
        parsedItems = [];
      }
    }

    return OrderDetail(
      orderId: json['order_id'] as String,
      customerId: json['customer_id'] as String? ?? '',
      status: json['status'] as String,
      total: (json['total'] as num).toDouble(),
      subtotal: ((json['subtotal'] ?? json['total']) as num).toDouble(),
      discount: (json['discount'] as num? ?? 0).toDouble(),
      items: parsedItems,
      createdAt: json['created_at'] as String? ?? '',
      updatedAt: json['updated_at'] as String? ?? '',
      orderType: json['order_type'] as String? ?? 'delivery',
      deliveryAddress: json['delivery_address'] as String?,
      notes: json['notes'] as String?,
    );
  }
}

class OrderResult {
  final String orderId;
  final double total;
  final double subtotal;
  final double discount;
  final int pointsUsed;
  final int pointsEarned;
  final String customerId;
  final int estimatedMinutes;

  const OrderResult({
    required this.orderId,
    required this.total,
    required this.subtotal,
    required this.discount,
    required this.pointsUsed,
    required this.pointsEarned,
    required this.customerId,
    required this.estimatedMinutes,
  });

  factory OrderResult.fromJson(Map<String, dynamic> json) {
    return OrderResult(
      orderId: json['order_id'] as String,
      total: (json['total'] as num).toDouble(),
      subtotal: (json['subtotal'] as num).toDouble(),
      discount: (json['discount'] as num? ?? 0).toDouble(),
      pointsUsed: (json['points_used'] as num? ?? 0).toInt(),
      pointsEarned: (json['points_earned'] as num? ?? 0).toInt(),
      customerId: json['customer_id'] as String? ?? '',
      estimatedMinutes: (json['estimated_minutes'] as num? ?? 30).toInt(),
    );
  }
}
