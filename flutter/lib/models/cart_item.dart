import 'menu_item.dart';

class CartItem {
  final MenuItem menuItem;
  int quantity;

  CartItem({required this.menuItem, this.quantity = 1});

  double get subtotal => menuItem.price * quantity;

  Map<String, dynamic> toOrderItem() => {
        'id': menuItem.id,
        'name': menuItem.name,
        'qty': quantity,
        'unit_price': menuItem.price,
      };
}
