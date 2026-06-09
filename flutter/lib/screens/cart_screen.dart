import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../l10n/app_localizations.dart';
import '../providers/cart_provider.dart';
import '../services/api_service.dart';

class CartScreen extends StatefulWidget {
  const CartScreen({super.key});

  @override
  State<CartScreen> createState() => _CartScreenState();
}

class _CartScreenState extends State<CartScreen> {
  final _promoController = TextEditingController();
  bool _applyingPromo = false;

  @override
  void dispose() {
    _promoController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final l = AppLocalizations.of(context);
    final cart = context.watch<CartProvider>();
    final fmt = NumberFormat.currency(locale: 'pt_BR', symbol: 'R\$');

    if (cart.items.isEmpty) {
      return Scaffold(
        appBar: AppBar(title: Text(l.cartTitle)),
        body: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.shopping_cart_outlined, size: 80, color: Colors.grey[400]),
              const SizedBox(height: 16),
              Text(l.cartEmpty,
                  style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w600)),
              const SizedBox(height: 8),
              Text(l.cartEmptySubtitle, style: TextStyle(color: Colors.grey[600])),
              const SizedBox(height: 24),
              FilledButton.icon(
                onPressed: () => context.go('/menu'),
                icon: const Icon(Icons.restaurant_menu),
                label: Text(l.seeMenu),
              ),
            ],
          ),
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: Text(l.cartTitle),
        actions: [
          TextButton(
            onPressed: () => _confirmClear(context, cart),
            child: Text(l.clear),
          ),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.all(12),
              itemCount: cart.items.length,
              itemBuilder: (context, index) {
                final cartItem = cart.items[index];
                return Card(
                  margin: const EdgeInsets.only(bottom: 8),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    child: Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(cartItem.menuItem.name,
                                  style: const TextStyle(
                                      fontWeight: FontWeight.w600, fontSize: 15)),
                              Text(fmt.format(cartItem.menuItem.price),
                                  style: TextStyle(color: Colors.grey[600])),
                            ],
                          ),
                        ),
                        Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            IconButton(
                              icon: const Icon(Icons.remove_circle_outline),
                              onPressed: () => context
                                  .read<CartProvider>()
                                  .remove(cartItem.menuItem.id),
                              iconSize: 22,
                            ),
                            Text('${cartItem.quantity}',
                                style: const TextStyle(
                                    fontWeight: FontWeight.bold, fontSize: 16)),
                            IconButton(
                              icon: const Icon(Icons.add_circle_outline),
                              onPressed: () =>
                                  context.read<CartProvider>().add(cartItem.menuItem),
                              iconSize: 22,
                            ),
                            IconButton(
                              icon: const Icon(Icons.delete_outline, color: Colors.red),
                              onPressed: () => context
                                  .read<CartProvider>()
                                  .delete(cartItem.menuItem.id),
                              iconSize: 22,
                            ),
                          ],
                        ),
                        SizedBox(
                          width: 72,
                          child: Text(
                            fmt.format(cartItem.subtotal),
                            textAlign: TextAlign.right,
                            style: const TextStyle(fontWeight: FontWeight.bold),
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Theme.of(context).colorScheme.surface,
              boxShadow: const [
                BoxShadow(color: Colors.black12, blurRadius: 8, offset: Offset(0, -2)),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                _PromoRow(
                  controller: _promoController,
                  applying: _applyingPromo,
                  appliedCode: cart.appliedOfferCode,
                  onApply: () => _applyPromo(context, cart),
                  onRemove: () {
                    cart.clearDiscount();
                    _promoController.clear();
                  },
                ),
                const SizedBox(height: 12),
                _OrderSummary(
                  subtotal: cart.subtotal,
                  discount: cart.discount,
                  total: cart.total,
                ),
                const SizedBox(height: 12),
                FilledButton(
                  onPressed: () => context.push('/checkout'),
                  child: Text(l.goToCheckout),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _applyPromo(BuildContext context, CartProvider cart) async {
    final l = AppLocalizations.of(context);
    final code = _promoController.text.trim();
    if (code.isEmpty) return;

    final messenger = ScaffoldMessenger.of(context);
    setState(() => _applyingPromo = true);
    try {
      final result = await ApiService().applyOffer(code: code, subtotal: cart.subtotal);
      if (!mounted) return;
      cart.applyDiscount(result.discount, code);
      messenger.showSnackBar(SnackBar(
        content: Text(l.couponSuccess),
        behavior: SnackBarBehavior.floating,
      ));
    } on ApiException catch (e) {
      if (!mounted) return;
      messenger.showSnackBar(SnackBar(
        content: Text(e.message),
        behavior: SnackBarBehavior.floating,
      ));
    } catch (_) {
      if (!mounted) return;
      messenger.showSnackBar(SnackBar(
        content: Text(l.couponError),
        behavior: SnackBarBehavior.floating,
      ));
    } finally {
      if (mounted) setState(() => _applyingPromo = false);
    }
  }

  void _confirmClear(BuildContext context, CartProvider cart) {
    final l = AppLocalizations.of(context);
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(l.clearCart),
        content: Text(l.clearCartConfirm),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: Text(l.cancel),
          ),
          FilledButton(
            onPressed: () {
              cart.clear();
              Navigator.of(ctx).pop();
            },
            child: Text(l.clear),
          ),
        ],
      ),
    );
  }
}

class _PromoRow extends StatelessWidget {
  final TextEditingController controller;
  final bool applying;
  final String appliedCode;
  final VoidCallback onApply;
  final VoidCallback onRemove;

  const _PromoRow({
    required this.controller,
    required this.applying,
    required this.appliedCode,
    required this.onApply,
    required this.onRemove,
  });

  @override
  Widget build(BuildContext context) {
    final l = AppLocalizations.of(context);

    if (appliedCode.isNotEmpty) {
      return Row(
        children: [
          const Icon(Icons.local_offer, color: Colors.green, size: 20),
          const SizedBox(width: 8),
          Text(l.couponApplied(appliedCode),
              style: const TextStyle(
                  color: Colors.green, fontWeight: FontWeight.w600)),
          const Spacer(),
          TextButton(
            onPressed: onRemove,
            child: Text(l.remove, style: const TextStyle(color: Colors.red)),
          ),
        ],
      );
    }

    return Row(
      children: [
        Expanded(
          child: TextField(
            controller: controller,
            decoration: InputDecoration(
              labelText: l.couponLabel,
              hintText: l.couponHint,
              isDense: true,
              prefixIcon: const Icon(Icons.local_offer_outlined),
            ),
            textCapitalization: TextCapitalization.characters,
          ),
        ),
        const SizedBox(width: 8),
        applying
            ? const SizedBox(
                width: 44,
                height: 44,
                child: Center(child: CircularProgressIndicator(strokeWidth: 2)),
              )
            : FilledButton(
                onPressed: onApply,
                style: FilledButton.styleFrom(minimumSize: const Size(80, 44)),
                child: Text(l.apply),
              ),
      ],
    );
  }
}

class _OrderSummary extends StatelessWidget {
  final double subtotal;
  final double discount;
  final double total;

  const _OrderSummary({
    required this.subtotal,
    required this.discount,
    required this.total,
  });

  @override
  Widget build(BuildContext context) {
    final l = AppLocalizations.of(context);
    final colorScheme = Theme.of(context).colorScheme;
    final fmt = NumberFormat.currency(locale: 'pt_BR', symbol: 'R\$');

    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: colorScheme.surfaceContainerHighest,
        borderRadius: BorderRadius.circular(10),
      ),
      child: Column(
        children: [
          _SummaryRow(label: l.subtotal, value: fmt.format(subtotal)),
          if (discount > 0) ...[
            const SizedBox(height: 4),
            _SummaryRow(
              label: l.discount,
              value: '- ${fmt.format(discount)}',
              valueColor: Colors.green[700],
            ),
          ],
          const Divider(height: 16),
          _SummaryRow(label: l.total, value: fmt.format(total), bold: true),
        ],
      ),
    );
  }
}

class _SummaryRow extends StatelessWidget {
  final String label;
  final String value;
  final bool bold;
  final Color? valueColor;

  const _SummaryRow({
    required this.label,
    required this.value,
    this.bold = false,
    this.valueColor,
  });

  @override
  Widget build(BuildContext context) {
    final style = bold
        ? const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)
        : const TextStyle(fontSize: 14);

    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: style),
        Text(value, style: style.copyWith(color: valueColor)),
      ],
    );
  }
}
