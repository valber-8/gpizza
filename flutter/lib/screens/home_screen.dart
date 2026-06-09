import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../l10n/app_localizations.dart';
import '../providers/locale_provider.dart';
import '../providers/menu_provider.dart';
import '../services/api_service.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final _trackingController = TextEditingController();
  bool _isOpen = true;
  String _estimatedDelivery = '45';
  bool _settingsLoaded = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      context.read<MenuProvider>().load();
      _loadSettings();
    });
  }

  @override
  void dispose() {
    _trackingController.dispose();
    super.dispose();
  }

  Future<void> _loadSettings() async {
    try {
      final api = ApiService();
      final settings = await api.getSettings();
      if (!mounted) return;
      setState(() {
        _isOpen = settings['is_open'] != 'false';
        _estimatedDelivery = settings['estimated_delivery_min'] ?? '45';
        _settingsLoaded = true;
      });
    } catch (_) {
      if (mounted) setState(() => _settingsLoaded = true);
    }
  }

  @override
  Widget build(BuildContext context) {
    final l = AppLocalizations.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('🍕 GPizza'),
        actions: [
          if (_settingsLoaded)
            Padding(
              padding: const EdgeInsets.only(right: 4),
              child: Chip(
                avatar: Icon(
                  _isOpen ? Icons.circle : Icons.circle_outlined,
                  color: _isOpen ? Colors.green : Colors.red,
                  size: 12,
                ),
                label: Text(
                  _isOpen ? l.open : l.closed,
                  style: TextStyle(
                    color: _isOpen ? Colors.green[700] : Colors.red[700],
                    fontWeight: FontWeight.w600,
                  ),
                ),
                backgroundColor: _isOpen ? Colors.green[50] : Colors.red[50],
              ),
            ),
          _LanguageToggle(),
          const SizedBox(width: 8),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _HeroCard(estimatedDelivery: _estimatedDelivery),
            const SizedBox(height: 24),
            Text(
              l.quickAccess,
              style: Theme.of(context)
                  .textTheme
                  .titleMedium
                  ?.copyWith(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            _QuickActionsGrid(),
            const SizedBox(height: 24),
            _TrackingSection(controller: _trackingController),
          ],
        ),
      ),
    );
  }
}

class _LanguageToggle extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final localeProvider = context.watch<LocaleProvider>();
    final isEn = localeProvider.locale.languageCode == 'en';
    return TextButton(
      onPressed: localeProvider.toggle,
      style: TextButton.styleFrom(
        minimumSize: const Size(48, 36),
        padding: const EdgeInsets.symmetric(horizontal: 8),
      ),
      child: Text(
        isEn ? '🇸🇪 SV' : '🇺🇸 EN',
        style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
      ),
    );
  }
}

class _HeroCard extends StatelessWidget {
  final String estimatedDelivery;

  const _HeroCard({required this.estimatedDelivery});

  @override
  Widget build(BuildContext context) {
    final l = AppLocalizations.of(context);
    final colorScheme = Theme.of(context).colorScheme;

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
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
          Text(
            l.heroTitle,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 26,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            l.deliveryTime(estimatedDelivery),
            style: const TextStyle(color: Colors.white70, fontSize: 14),
          ),
          const SizedBox(height: 20),
          FilledButton(
            onPressed: () => context.go('/menu'),
            style: FilledButton.styleFrom(
              backgroundColor: Colors.white,
              foregroundColor: colorScheme.primary,
            ),
            child: Text(l.seeMenu),
          ),
        ],
      ),
    );
  }
}

class _QuickActionsGrid extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final l = AppLocalizations.of(context);
    final actions = [
      _QuickAction(icon: Icons.restaurant_menu, label: l.navMenu,    onTap: () => context.go('/menu')),
      _QuickAction(icon: Icons.shopping_cart,   label: l.navCart,    onTap: () => context.go('/cart')),
      _QuickAction(icon: Icons.stars,           label: l.navLoyalty, onTap: () => context.go('/loyalty')),
      _QuickAction(icon: Icons.rate_review,     label: l.navReviews, onTap: () => context.go('/reviews')),
    ];

    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      mainAxisSpacing: 12,
      crossAxisSpacing: 12,
      childAspectRatio: 1.8,
      children: actions,
    );
  }
}

class _QuickAction extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;

  const _QuickAction({
    required this.icon,
    required this.label,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    return Card(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          child: Row(
            children: [
              Icon(icon, color: colorScheme.primary, size: 28),
              const SizedBox(width: 12),
              Text(label,
                  style: const TextStyle(
                      fontWeight: FontWeight.w600, fontSize: 15)),
            ],
          ),
        ),
      ),
    );
  }
}

class _TrackingSection extends StatelessWidget {
  final TextEditingController controller;

  const _TrackingSection({required this.controller});

  @override
  Widget build(BuildContext context) {
    final l = AppLocalizations.of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          l.trackOrder,
          style: Theme.of(context)
              .textTheme
              .titleMedium
              ?.copyWith(fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: TextField(
                controller: controller,
                decoration: InputDecoration(
                  hintText: l.orderNumberHint,
                  prefixIcon: const Icon(Icons.search),
                  labelText: l.orderNumber,
                ),
                textInputAction: TextInputAction.search,
                onSubmitted: (value) => _navigate(context, value),
              ),
            ),
            const SizedBox(width: 12),
            FilledButton(
              onPressed: () => _navigate(context, controller.text),
              child: Text(l.search),
            ),
          ],
        ),
      ],
    );
  }

  void _navigate(BuildContext context, String value) {
    final orderId = value.trim();
    final l = AppLocalizations.of(context);
    if (orderId.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(l.enterOrderNumber),
          behavior: SnackBarBehavior.floating,
        ),
      );
      return;
    }
    context.go('/tracking/$orderId');
  }
}
