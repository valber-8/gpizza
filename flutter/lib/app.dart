import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'config/theme.dart';
import 'l10n/app_localizations.dart';
import 'models/menu_item.dart';
import 'models/order.dart';
import 'providers/cart_provider.dart';
import 'providers/locale_provider.dart';
import 'providers/menu_provider.dart';
import 'providers/order_provider.dart';
import 'screens/cart_screen.dart';
import 'screens/checkout_screen.dart';
import 'screens/home_screen.dart';
import 'screens/item_detail_screen.dart';
import 'screens/loyalty_screen.dart';
import 'screens/main_shell.dart';
import 'screens/menu_screen.dart';
import 'screens/order_confirmation_screen.dart';
import 'screens/order_tracking_screen.dart';
import 'screens/reviews_screen.dart';
import 'services/api_service.dart';

final appRouter = GoRouter(
  initialLocation: '/home',
  routes: [
    ShellRoute(
      builder: (context, state, child) => MainShell(child: child),
      routes: [
        GoRoute(
          path: '/home',
          builder: (context, state) => const HomeScreen(),
        ),
        GoRoute(
          path: '/menu',
          builder: (context, state) => const MenuScreen(),
        ),
        GoRoute(
          path: '/cart',
          builder: (context, state) => const CartScreen(),
        ),
        GoRoute(
          path: '/loyalty',
          builder: (context, state) => const LoyaltyScreen(),
        ),
        GoRoute(
          path: '/reviews',
          builder: (context, state) => const ReviewsScreen(),
        ),
      ],
    ),
    GoRoute(
      path: '/menu/item/:id',
      builder: (context, state) {
        final item = state.extra as MenuItem;
        return ItemDetailScreen(item: item);
      },
    ),
    GoRoute(
      path: '/checkout',
      builder: (context, state) => const CheckoutScreen(),
    ),
    GoRoute(
      path: '/confirmation',
      builder: (context, state) {
        final result = state.extra as OrderResult;
        return OrderConfirmationScreen(result: result);
      },
    ),
    GoRoute(
      path: '/tracking/:orderId',
      builder: (context, state) {
        final orderId = state.pathParameters['orderId']!;
        return OrderTrackingScreen(orderId: orderId);
      },
    ),
  ],
);

class GPizzaApp extends StatelessWidget {
  const GPizzaApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => LocaleProvider()),
        ChangeNotifierProvider(create: (_) => MenuProvider(ApiService())),
        ChangeNotifierProvider(create: (_) => CartProvider()),
        ChangeNotifierProvider(create: (_) => OrderProvider(ApiService())),
      ],
      child: Consumer<LocaleProvider>(
        builder: (context, localeProvider, _) => MaterialApp.router(
          title: 'GPizza',
          theme: buildAppTheme(),
          routerConfig: appRouter,
          debugShowCheckedModeBanner: false,
          locale: localeProvider.locale,
          supportedLocales: AppLocalizations.supportedLocales,
          localizationsDelegates: const [
            AppLocalizations.delegate,
            GlobalMaterialLocalizations.delegate,
            GlobalWidgetsLocalizations.delegate,
            GlobalCupertinoLocalizations.delegate,
          ],
        ),
      ),
    );
  }
}
