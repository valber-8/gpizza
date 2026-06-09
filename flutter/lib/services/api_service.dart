import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/api_config.dart';
import '../models/menu_item.dart';
import '../models/order.dart';
import '../models/review.dart';
import '../models/loyalty.dart';
import '../models/offer.dart';

class ApiException implements Exception {
  final String message;
  const ApiException(this.message);

  @override
  String toString() => message;
}

class MenuData {
  final List<String> categories;
  final List<MenuItem> items;

  const MenuData({required this.categories, required this.items});
}

class ApplyOfferResult {
  final double discount;
  final double finalTotal;

  const ApplyOfferResult({required this.discount, required this.finalTotal});
}

class ApiService {
  final http.Client _client;

  ApiService({http.Client? client}) : _client = client ?? http.Client();

  Future<Map<String, dynamic>> _get(String action,
      [Map<String, String>? params]) async {
    final queryParams = {'action': action, ...?params};
    final uri = Uri.parse(ApiConfig.baseUrl).replace(queryParameters: queryParams);

    final response = await _client.get(uri);

    if (response.statusCode != 200) {
      throw ApiException('Network error: ${response.statusCode}');
    }

    final body = jsonDecode(response.body) as Map<String, dynamic>;
    if (body['ok'] != true) {
      throw ApiException(body['error'] as String? ?? 'Unknown error');
    }
    return body['data'] as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> _getList(String action,
      [Map<String, String>? params]) async {
    final queryParams = {'action': action, ...?params};
    final uri = Uri.parse(ApiConfig.baseUrl).replace(queryParameters: queryParams);

    final response = await _client.get(uri);

    if (response.statusCode != 200) {
      throw ApiException('Network error: ${response.statusCode}');
    }

    final body = jsonDecode(response.body) as Map<String, dynamic>;
    if (body['ok'] != true) {
      throw ApiException(body['error'] as String? ?? 'Unknown error');
    }
    return body;
  }

  Future<Map<String, dynamic>> _post(Map<String, dynamic> payload) async {
    final uri = Uri.parse(ApiConfig.baseUrl);

    final response = await _client.post(
      uri,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(payload),
    );

    if (response.statusCode != 200) {
      throw ApiException('Network error: ${response.statusCode}');
    }

    final body = jsonDecode(response.body) as Map<String, dynamic>;
    if (body['ok'] != true) {
      throw ApiException(body['error'] as String? ?? 'Unknown error');
    }
    return body['data'] as Map<String, dynamic>;
  }

  Future<MenuData> getMenu() async {
    final data = await _get('menu');
    final categoriesRaw = data['categories'] as List<dynamic>? ?? [];
    final itemsRaw = data['items'] as List<dynamic>? ?? [];

    return MenuData(
      categories: categoriesRaw.cast<String>(),
      items: itemsRaw
          .map((e) => MenuItem.fromJson(e as Map<String, dynamic>))
          .where((item) => item.available)
          .toList(),
    );
  }

  Future<List<Offer>> getOffers() async {
    final result = await _getList('offers');
    final data = result['data'];
    if (data is List) {
      return data
          .map((e) => Offer.fromJson(e as Map<String, dynamic>))
          .toList();
    }
    return [];
  }

  Future<OrderDetail> getOrder(String id) async {
    final data = await _get('order', {'id': id});
    return OrderDetail.fromJson(data);
  }

  Future<LoyaltyInfo> getLoyalty(String phone) async {
    final data = await _get('loyalty', {'phone': phone});
    return LoyaltyInfo.fromJson(data);
  }

  Future<List<Review>> getReviews() async {
    final result = await _getList('reviews');
    final data = result['data'];
    if (data is List) {
      return data
          .map((e) => Review.fromJson(e as Map<String, dynamic>))
          .toList();
    }
    return [];
  }

  Future<Map<String, String>> getSettings() async {
    final data = await _get('settings');
    return data.map((k, v) => MapEntry(k, v.toString()));
  }

  Future<OrderResult> placeOrder({
    required String customerName,
    required String phone,
    required List<Map<String, dynamic>> items,
    required double subtotal,
    required double discount,
    required String offerCode,
    required double total,
    required String orderType,
    required String deliveryAddress,
    required String notes,
    required int redeemPoints,
    String? fcmToken,
  }) async {
    final data = await _post({
      'action': 'order',
      'customer_name': customerName,
      'phone': phone,
      'items': items,
      'subtotal': subtotal,
      'discount': discount,
      'offer_code': offerCode,
      'total': total,
      'order_type': orderType,
      'delivery_address': deliveryAddress,
      'notes': notes,
      'redeem_points': redeemPoints,
      if (fcmToken != null && fcmToken.isNotEmpty) 'fcm_token': fcmToken,
    });
    return OrderResult.fromJson(data);
  }

  Future<void> submitReview({
    required String customerName,
    required int rating,
    required String comment,
  }) async {
    await _post({
      'action': 'review',
      'customer_name': customerName,
      'rating': rating,
      'comment': comment,
    });
  }

  Future<ApplyOfferResult> applyOffer({
    required String code,
    required double subtotal,
  }) async {
    final data = await _post({
      'action': 'applyOffer',
      'code': code,
      'subtotal': subtotal,
    });
    return ApplyOfferResult(
      discount: (data['discount'] as num).toDouble(),
      finalTotal: (data['final_total'] as num).toDouble(),
    );
  }
}
