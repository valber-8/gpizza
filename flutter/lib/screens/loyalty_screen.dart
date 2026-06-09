import 'package:flutter/material.dart';
import '../l10n/app_localizations.dart';
import '../models/loyalty.dart';
import '../services/api_service.dart';

class LoyaltyScreen extends StatefulWidget {
  const LoyaltyScreen({super.key});

  @override
  State<LoyaltyScreen> createState() => _LoyaltyScreenState();
}

class _LoyaltyScreenState extends State<LoyaltyScreen> {
  final ApiService _api = ApiService();
  final _phoneController = TextEditingController();
  LoyaltyInfo? _loyalty;
  bool _loading = false;
  String? _error;

  @override
  void dispose() {
    _phoneController.dispose();
    super.dispose();
  }

  Future<void> _consult() async {
    final l = AppLocalizations.of(context);
    final phone = _phoneController.text.trim();
    if (phone.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Text(l.enterPhone),
        behavior: SnackBarBehavior.floating,
      ));
      return;
    }

    setState(() { _loading = true; _error = null; _loyalty = null; });

    try {
      final info = await _api.getLoyalty(phone);
      if (!mounted) return;
      setState(() { _loyalty = info; _loading = false; });
    } on ApiException catch (e) {
      if (!mounted) return;
      setState(() { _error = e.message; _loading = false; });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _error = AppLocalizations.of(context).checkPointsError;
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final l = AppLocalizations.of(context);

    return Scaffold(
      appBar: AppBar(title: Text(l.loyaltyTitle)),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(l.checkPoints,
                style: Theme.of(context)
                    .textTheme
                    .titleMedium
                    ?.copyWith(fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _phoneController,
                    decoration: InputDecoration(
                      labelText: l.phone,
                      hintText: l.phonePlaceholder,
                      prefixIcon: const Icon(Icons.phone_outlined),
                    ),
                    keyboardType: TextInputType.phone,
                    textInputAction: TextInputAction.search,
                    onSubmitted: (_) => _consult(),
                  ),
                ),
                const SizedBox(width: 12),
                FilledButton(
                  onPressed: _loading ? null : _consult,
                  child: _loading
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(
                              strokeWidth: 2, color: Colors.white),
                        )
                      : Text(l.check),
                ),
              ],
            ),
            const SizedBox(height: 24),
            if (_error != null)
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.red[50],
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: Colors.red[200]!),
                ),
                child: Text(_error!, style: const TextStyle(color: Colors.red)),
              ),
            if (_loyalty != null) ...[
              _LoyaltyCard(loyalty: _loyalty!),
              const SizedBox(height: 20),
            ],
            _HowItWorksCard(),
          ],
        ),
      ),
    );
  }
}

class _LoyaltyCard extends StatelessWidget {
  final LoyaltyInfo loyalty;
  const _LoyaltyCard({required this.loyalty});

  @override
  Widget build(BuildContext context) {
    final l = AppLocalizations.of(context);
    final colorScheme = Theme.of(context).colorScheme;
    final pointsUntilNext = loyalty.nextThreshold - loyalty.points;
    final progress = loyalty.nextThreshold > 0
        ? (loyalty.points % loyalty.nextThreshold) /
            loyalty.nextThreshold.toDouble()
        : 1.0;

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [colorScheme.primary, colorScheme.secondary],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.stars, color: Colors.amber, size: 28),
              const SizedBox(width: 8),
              Text(loyalty.customerName,
                  style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                      fontSize: 16)),
            ],
          ),
          const SizedBox(height: 16),
          Text('${loyalty.points}',
              style: const TextStyle(
                  color: Colors.white, fontSize: 52, fontWeight: FontWeight.bold)),
          Text(l.pointsLabel,
              style: const TextStyle(color: Colors.white70, fontSize: 16)),
          const SizedBox(height: 16),
          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: LinearProgressIndicator(
              value: progress.clamp(0.0, 1.0),
              backgroundColor: Colors.white30,
              valueColor: const AlwaysStoppedAnimation<Color>(Colors.amber),
              minHeight: 8,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            pointsUntilNext > 0 ? l.pointsUntilNext(pointsUntilNext) : l.rewardLimit,
            style: const TextStyle(color: Colors.white70, fontSize: 12),
          ),
        ],
      ),
    );
  }
}

class _HowItWorksCard extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final l = AppLocalizations.of(context);
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(Icons.info_outline,
                    color: Theme.of(context).colorScheme.primary),
                const SizedBox(width: 8),
                Text(l.howItWorks,
                    style: const TextStyle(
                        fontWeight: FontWeight.bold, fontSize: 16)),
              ],
            ),
            const SizedBox(height: 12),
            _RuleRow(icon: Icons.add_circle_outline, color: Colors.green,  text: l.loyaltyRule1),
            const SizedBox(height: 8),
            _RuleRow(icon: Icons.redeem,             color: Colors.amber,  text: l.loyaltyRule2),
            const SizedBox(height: 8),
            _RuleRow(icon: Icons.phone_outlined,     color: Colors.blue,   text: l.loyaltyRule3),
          ],
        ),
      ),
    );
  }
}

class _RuleRow extends StatelessWidget {
  final IconData icon;
  final Color color;
  final String text;

  const _RuleRow({required this.icon, required this.color, required this.text});

  @override
  Widget build(BuildContext context) => Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: color, size: 20),
          const SizedBox(width: 10),
          Expanded(child: Text(text, style: const TextStyle(fontSize: 14))),
        ],
      );
}
