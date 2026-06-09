import 'package:flutter/foundation.dart';
import '../models/order.dart';
import '../services/api_service.dart';

class OrderProvider extends ChangeNotifier {
  final ApiService _api;

  OrderProvider(this._api);

  bool _loading = false;
  String? _error;

  bool get loading => _loading;
  String? get error => _error;

  Future<OrderResult?> placeOrder({
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
    _loading = true;
    _error = null;
    notifyListeners();

    try {
      final result = await _api.placeOrder(
        customerName: customerName,
        phone: phone,
        items: items,
        subtotal: subtotal,
        discount: discount,
        offerCode: offerCode,
        total: total,
        orderType: orderType,
        deliveryAddress: deliveryAddress,
        notes: notes,
        redeemPoints: redeemPoints,
        fcmToken: fcmToken,
      );
      return result;
    } on ApiException catch (e) {
      _error = e.message;
      return null;
    } catch (e) {
      _error = 'Failed to place order. Please try again.';
      return null;
    } finally {
      _loading = false;
      notifyListeners();
    }
  }
}
