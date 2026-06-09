import 'package:flutter/foundation.dart';
import '../models/cart_item.dart';
import '../models/menu_item.dart';

class CartProvider extends ChangeNotifier {
  final List<CartItem> _items = [];
  double _discount = 0;
  String _appliedOfferCode = '';

  List<CartItem> get items => List.unmodifiable(_items);
  int get itemCount => _items.fold(0, (sum, i) => sum + i.quantity);
  double get discount => _discount;
  String get appliedOfferCode => _appliedOfferCode;

  double get subtotal =>
      _items.fold(0.0, (sum, item) => sum + item.subtotal);

  double get total => (subtotal - _discount).clamp(0.0, double.infinity);

  void add(MenuItem menuItem) {
    final index = _items.indexWhere((i) => i.menuItem.id == menuItem.id);
    if (index >= 0) {
      _items[index].quantity++;
    } else {
      _items.add(CartItem(menuItem: menuItem));
    }
    notifyListeners();
  }

  void remove(String menuItemId) {
    final index = _items.indexWhere((i) => i.menuItem.id == menuItemId);
    if (index < 0) return;
    if (_items[index].quantity > 1) {
      _items[index].quantity--;
    } else {
      _items.removeAt(index);
    }
    notifyListeners();
  }

  void delete(String menuItemId) {
    _items.removeWhere((i) => i.menuItem.id == menuItemId);
    notifyListeners();
  }

  void applyDiscount(double discountAmount, String offerCode) {
    _discount = discountAmount;
    _appliedOfferCode = offerCode;
    notifyListeners();
  }

  void clearDiscount() {
    _discount = 0;
    _appliedOfferCode = '';
    notifyListeners();
  }

  void clear() {
    _items.clear();
    _discount = 0;
    _appliedOfferCode = '';
    notifyListeners();
  }

  List<Map<String, dynamic>> toOrderItems() =>
      _items.map((i) => i.toOrderItem()).toList();
}
