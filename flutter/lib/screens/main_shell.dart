import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../l10n/app_localizations.dart';
import '../providers/cart_provider.dart';

class MainShell extends StatelessWidget {
  final Widget child;

  const MainShell({super.key, required this.child});

  int _locationToIndex(String location) {
    if (location.startsWith('/menu')) return 1;
    if (location.startsWith('/cart')) return 2;
    if (location.startsWith('/loyalty')) return 3;
    if (location.startsWith('/reviews')) return 4;
    return 0;
  }

  @override
  Widget build(BuildContext context) {
    final l = AppLocalizations.of(context);
    final location = GoRouterState.of(context).uri.toString();
    final currentIndex = _locationToIndex(location);
    final cartCount = context.watch<CartProvider>().itemCount;

    return Scaffold(
      body: LayoutBuilder(
        builder: (ctx, constraints) => SizedBox(
          width: constraints.hasBoundedWidth
              ? constraints.maxWidth
              : MediaQuery.of(ctx).size.width,
          height: constraints.hasBoundedHeight
              ? constraints.maxHeight
              : MediaQuery.of(ctx).size.height,
          child: child,
        ),
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: currentIndex,
        onDestinationSelected: (index) {
          switch (index) {
            case 0: context.go('/home');
            case 1: context.go('/menu');
            case 2: context.go('/cart');
            case 3: context.go('/loyalty');
            case 4: context.go('/reviews');
          }
        },
        destinations: [
          NavigationDestination(
            icon: const Icon(Icons.home_outlined),
            selectedIcon: const Icon(Icons.home),
            label: l.navHome,
          ),
          NavigationDestination(
            icon: const Icon(Icons.restaurant_menu_outlined),
            selectedIcon: const Icon(Icons.restaurant_menu),
            label: l.navMenu,
          ),
          NavigationDestination(
            icon: Badge(
              isLabelVisible: cartCount > 0,
              label: Text('$cartCount'),
              child: const Icon(Icons.shopping_cart_outlined),
            ),
            selectedIcon: Badge(
              isLabelVisible: cartCount > 0,
              label: Text('$cartCount'),
              child: const Icon(Icons.shopping_cart),
            ),
            label: l.navCart,
          ),
          NavigationDestination(
            icon: const Icon(Icons.stars_outlined),
            selectedIcon: const Icon(Icons.stars),
            label: l.navLoyalty,
          ),
          NavigationDestination(
            icon: const Icon(Icons.rate_review_outlined),
            selectedIcon: const Icon(Icons.rate_review),
            label: l.navReviews,
          ),
        ],
      ),
    );
  }
}
