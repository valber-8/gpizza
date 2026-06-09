import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../l10n/app_localizations.dart';
import '../providers/cart_provider.dart';
import '../providers/order_provider.dart';
import '../services/notification_service.dart';

class CheckoutScreen extends StatefulWidget {
  const CheckoutScreen({super.key});

  @override
  State<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends State<CheckoutScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _addressController = TextEditingController();
  final _notesController = TextEditingController();
  String _orderType = 'delivery';

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    _addressController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final l = AppLocalizations.of(context);
    final cart = context.watch<CartProvider>();
    final orderProvider = context.watch<OrderProvider>();
    final fmt = NumberFormat.currency(locale: 'pt_BR', symbol: 'R\$');

    if (cart.items.isEmpty) {
      return Scaffold(
        appBar: AppBar(title: Text(l.checkoutTitle)),
        body: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(l.cartEmpty),
              const SizedBox(height: 16),
              FilledButton(
                onPressed: () => context.go('/menu'),
                child: Text(l.seeMenu),
              ),
            ],
          ),
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
        title: Text(l.checkoutTitle),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _sectionTitle(context, l.yourDetails),
              const SizedBox(height: 12),
              TextFormField(
                controller: _nameController,
                decoration: InputDecoration(
                  labelText: l.nameRequired,
                  prefixIcon: const Icon(Icons.person_outline),
                ),
                textCapitalization: TextCapitalization.words,
                validator: (v) =>
                    (v == null || v.trim().isEmpty) ? l.enterName : null,
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _phoneController,
                decoration: InputDecoration(
                  labelText: l.phoneRequired,
                  hintText: l.phonePlaceholder,
                  prefixIcon: const Icon(Icons.phone_outlined),
                ),
                keyboardType: TextInputType.phone,
                validator: (v) =>
                    (v == null || v.trim().isEmpty) ? l.enterPhone : null,
              ),
              const SizedBox(height: 20),
              _sectionTitle(context, l.orderTypeLabel),
              const SizedBox(height: 12),
              SegmentedButton<String>(
                segments: [
                  ButtonSegment(
                    value: 'delivery',
                    label: Text(l.delivery),
                    icon: const Icon(Icons.delivery_dining),
                  ),
                  ButtonSegment(
                    value: 'pickup',
                    label: Text(l.pickup),
                    icon: const Icon(Icons.storefront),
                  ),
                ],
                selected: {_orderType},
                onSelectionChanged: (selection) =>
                    setState(() => _orderType = selection.first),
              ),
              if (_orderType == 'delivery') ...[
                const SizedBox(height: 12),
                TextFormField(
                  controller: _addressController,
                  decoration: InputDecoration(
                    labelText: l.deliveryAddress,
                    hintText: l.deliveryAddressHint,
                    prefixIcon: const Icon(Icons.location_on_outlined),
                  ),
                  maxLines: 2,
                  validator: (v) {
                    if (_orderType == 'delivery' &&
                        (v == null || v.trim().isEmpty)) {
                      return l.enterDeliveryAddress;
                    }
                    return null;
                  },
                ),
              ],
              const SizedBox(height: 12),
              TextFormField(
                controller: _notesController,
                decoration: InputDecoration(
                  labelText: l.notes,
                  hintText: l.notesHint,
                  prefixIcon: const Icon(Icons.notes_outlined),
                ),
                maxLines: 2,
              ),
              const SizedBox(height: 20),
              _sectionTitle(context, l.orderSummary),
              const SizedBox(height: 12),
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(12),
                  child: Column(
                    children: [
                      ...cart.items.map(
                        (item) => Padding(
                          padding: const EdgeInsets.symmetric(vertical: 4),
                          child: Row(
                            children: [
                              Text('${item.quantity}x',
                                  style: const TextStyle(
                                      fontWeight: FontWeight.bold)),
                              const SizedBox(width: 8),
                              Expanded(child: Text(item.menuItem.name)),
                              Text(fmt.format(item.subtotal)),
                            ],
                          ),
                        ),
                      ),
                      const Divider(),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(l.subtotal),
                          Text(fmt.format(cart.subtotal)),
                        ],
                      ),
                      if (cart.discount > 0) ...[
                        const SizedBox(height: 4),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(l.discount),
                            Text('- ${fmt.format(cart.discount)}',
                                style: const TextStyle(color: Colors.green)),
                          ],
                        ),
                      ],
                      const Divider(),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(l.total,
                              style: const TextStyle(
                                  fontWeight: FontWeight.bold, fontSize: 16)),
                          Text(fmt.format(cart.total),
                              style: const TextStyle(
                                  fontWeight: FontWeight.bold, fontSize: 16)),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 24),
              if (orderProvider.error != null)
                Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: Text(
                    orderProvider.error!,
                    style: const TextStyle(color: Colors.red),
                    textAlign: TextAlign.center,
                  ),
                ),
              FilledButton(
                onPressed:
                    orderProvider.loading ? null : () => _submit(context),
                child: orderProvider.loading
                    ? const SizedBox(
                        width: 24,
                        height: 24,
                        child: CircularProgressIndicator(
                            strokeWidth: 2, color: Colors.white),
                      )
                    : Text(l.confirmOrder),
              ),
              const SizedBox(height: 16),
            ],
          ),
        ),
      ),
    );
  }

  Widget _sectionTitle(BuildContext context, String title) => Text(
        title,
        style: Theme.of(context)
            .textTheme
            .titleMedium
            ?.copyWith(fontWeight: FontWeight.bold),
      );

  Future<void> _submit(BuildContext context) async {
    if (!_formKey.currentState!.validate()) return;

    final l = AppLocalizations.of(context);
    final cart = context.read<CartProvider>();
    final orderProvider = context.read<OrderProvider>();
    final messenger = ScaffoldMessenger.of(context);
    final router = GoRouter.of(context);

    final fcmToken = await NotificationService.getToken();

    final result = await orderProvider.placeOrder(
      customerName: _nameController.text.trim(),
      phone: _phoneController.text.trim(),
      items: cart.toOrderItems(),
      subtotal: cart.subtotal,
      discount: cart.discount,
      offerCode: cart.appliedOfferCode,
      total: cart.total,
      orderType: _orderType,
      deliveryAddress: _addressController.text.trim(),
      notes: _notesController.text.trim(),
      redeemPoints: 0,
      fcmToken: fcmToken,
    );

    if (!mounted) return;

    if (result != null) {
      cart.clear();
      router.go('/confirmation', extra: result);
    } else {
      messenger.showSnackBar(SnackBar(
        content: Text(orderProvider.error ?? l.orderError),
        behavior: SnackBarBehavior.floating,
      ));
    }
  }
}
