import 'dart:async';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../l10n/app_localizations.dart';
import '../models/order.dart';
import '../services/api_service.dart';
import '../widgets/order_status_stepper.dart';

class OrderTrackingScreen extends StatefulWidget {
  final String orderId;

  const OrderTrackingScreen({super.key, required this.orderId});

  @override
  State<OrderTrackingScreen> createState() => _OrderTrackingScreenState();
}

class _OrderTrackingScreenState extends State<OrderTrackingScreen> {
  final ApiService _api = ApiService();
  OrderDetail? _order;
  bool _loading = true;
  String? _error;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _fetch();
    _timer = Timer.periodic(const Duration(seconds: 30), (_) => _fetch());
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  Future<void> _fetch() async {
    if (!_loading) setState(() => _loading = true);
    try {
      final order = await _api.getOrder(widget.orderId);
      if (!mounted) return;
      setState(() {
        _order = order;
        _loading = false;
        _error = null;
      });
      if (order.status == 'delivered' || order.status == 'cancelled') {
        _timer?.cancel();
      }
    } on ApiException catch (e) {
      if (!mounted) return;
      setState(() { _error = e.message; _loading = false; });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _error = AppLocalizations.of(context).loadOrderError;
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final l = AppLocalizations.of(context);
    final fmt = NumberFormat.currency(locale: 'pt_BR', symbol: 'R\$');

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.go('/home'),
        ),
        title: Text(l.trackOrderTitle),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _fetch,
          ),
        ],
      ),
      body: _loading && _order == null
          ? const Center(child: CircularProgressIndicator())
          : _error != null && _order == null
              ? Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.error_outline, size: 48, color: Colors.red),
                      const SizedBox(height: 12),
                      Text(_error!, style: const TextStyle(color: Colors.red)),
                      const SizedBox(height: 12),
                      FilledButton.icon(
                        onPressed: _fetch,
                        icon: const Icon(Icons.refresh),
                        label: Text(l.tryAgain),
                      ),
                    ],
                  ),
                )
              : _order == null
                  ? Center(child: Text(l.loadOrderError))
                  : _buildContent(context, _order!, fmt),
    );
  }

  Widget _buildContent(BuildContext context, OrderDetail order, NumberFormat fmt) {
    final l = AppLocalizations.of(context);
    final isCancelled = order.status == 'cancelled';

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (isCancelled)
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16),
              margin: const EdgeInsets.only(bottom: 16),
              decoration: BoxDecoration(
                color: Colors.red[50],
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.red),
              ),
              child: Row(
                children: [
                  const Icon(Icons.cancel, color: Colors.red, size: 28),
                  const SizedBox(width: 12),
                  Text(l.orderCancelled,
                      style: const TextStyle(
                          color: Colors.red,
                          fontWeight: FontWeight.bold,
                          fontSize: 16)),
                ],
              ),
            ),
          Row(
            children: [
              Text(l.orderLabel,
                  style: const TextStyle(color: Colors.grey, fontSize: 13)),
              const SizedBox(width: 8),
              Text(order.orderId,
                  style: const TextStyle(
                      fontFamily: 'monospace',
                      fontWeight: FontWeight.bold,
                      fontSize: 15,
                      letterSpacing: 0.5)),
            ],
          ),
          const SizedBox(height: 20),
          if (!isCancelled) ...[
            OrderStatusStepper(status: order.status),
            const SizedBox(height: 24),
          ],
          Text(l.orderItemsTitle,
              style: Theme.of(context)
                  .textTheme
                  .titleMedium
                  ?.copyWith(fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                children: [
                  ...order.items.map((item) {
                    final name = item is Map
                        ? (item['name'] as String? ?? '')
                        : item.toString();
                    final qty =
                        item is Map ? (item['qty'] as num? ?? 1).toInt() : 1;
                    final unitPrice = item is Map
                        ? (item['unit_price'] as num? ?? 0).toDouble()
                        : 0.0;
                    return Padding(
                      padding: const EdgeInsets.symmetric(vertical: 4),
                      child: Row(
                        children: [
                          Text('${qty}x',
                              style: const TextStyle(fontWeight: FontWeight.bold)),
                          const SizedBox(width: 8),
                          Expanded(child: Text(name)),
                          Text(fmt.format(unitPrice * qty)),
                        ],
                      ),
                    );
                  }),
                  const Divider(),
                  if (order.discount > 0) ...[
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(l.subtotal),
                        Text(fmt.format(order.subtotal)),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(l.discount),
                        Text('- ${fmt.format(order.discount)}',
                            style: const TextStyle(color: Colors.green)),
                      ],
                    ),
                    const Divider(height: 12),
                  ],
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(l.total,
                          style: const TextStyle(
                              fontWeight: FontWeight.bold, fontSize: 16)),
                      Text(fmt.format(order.total),
                          style: const TextStyle(
                              fontWeight: FontWeight.bold, fontSize: 16)),
                    ],
                  ),
                ],
              ),
            ),
          ),
          if (order.deliveryAddress != null &&
              order.deliveryAddress!.isNotEmpty) ...[
            const SizedBox(height: 16),
            Text(l.deliveryAddressLabel,
                style: Theme.of(context)
                    .textTheme
                    .titleSmall
                    ?.copyWith(fontWeight: FontWeight.bold)),
            const SizedBox(height: 6),
            Text(order.deliveryAddress!,
                style: TextStyle(color: Colors.grey[700])),
          ],
          const SizedBox(height: 24),
          if (!isCancelled && order.status != 'delivered')
            Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.update, size: 16, color: Colors.grey[500]),
                  const SizedBox(width: 4),
                  Text(l.autoUpdate,
                      style: TextStyle(fontSize: 12, color: Colors.grey[500])),
                ],
              ),
            ),
        ],
      ),
    );
  }
}
