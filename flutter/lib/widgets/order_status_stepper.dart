import 'package:flutter/material.dart';
import '../l10n/app_localizations.dart';

const _pipeline = [
  'received',
  'preparing',
  'baking',
  'ready',
  'out_for_delivery',
  'completed',
];

const _icons = {
  'received':         Icons.inbox,
  'preparing':        Icons.soup_kitchen,
  'baking':           Icons.local_fire_department,
  'ready':            Icons.storefront,
  'out_for_delivery': Icons.delivery_dining,
  'completed':        Icons.check_circle,
};

class OrderStatusStepper extends StatefulWidget {
  final String status;
  const OrderStatusStepper({super.key, required this.status});

  @override
  State<OrderStatusStepper> createState() => _OrderStatusStepperState();
}

class _OrderStatusStepperState extends State<OrderStatusStepper>
    with SingleTickerProviderStateMixin {
  late final AnimationController _pulse;
  late final Animation<double> _fade;

  @override
  void initState() {
    super.initState();
    _pulse = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 900),
    )..repeat(reverse: true);
    _fade = Tween<double>(begin: 0.55, end: 1.0).animate(_pulse);
  }

  @override
  void dispose() {
    _pulse.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final labels = AppLocalizations.of(context).statusLabels;
    final currentIndex = _pipeline.indexOf(widget.status);

    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: List.generate(_pipeline.length * 2 - 1, (i) {
          if (i.isOdd) {
            final isDone = i ~/ 2 < currentIndex;
            return SizedBox(
              width: 28,
              child: Divider(
                thickness: 2,
                color: isDone ? cs.primary : Colors.grey[300],
                height: 36,
              ),
            );
          }

          final idx = i ~/ 2;
          final isDone = idx < currentIndex;
          final isCurrent = idx == currentIndex;
          final key = _pipeline[idx];

          final bgColor = (isDone || isCurrent) ? cs.primary : Colors.grey[200]!;
          final fgColor = (isDone || isCurrent) ? cs.onPrimary : Colors.grey[400]!;

          Widget circle = Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(color: bgColor, shape: BoxShape.circle),
            child: Icon(_icons[key], color: fgColor, size: 18),
          );

          if (isCurrent) {
            circle = FadeTransition(opacity: _fade, child: circle);
          }

          return SizedBox(
            width: 60,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                circle,
                const SizedBox(height: 4),
                Text(
                  labels[key] ?? key,
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 9,
                    fontWeight:
                        isCurrent ? FontWeight.bold : FontWeight.normal,
                    color: isCurrent ? cs.primary : Colors.grey[600],
                    height: 1.2,
                  ),
                ),
              ],
            ),
          );
        }),
      ),
    );
  }
}
