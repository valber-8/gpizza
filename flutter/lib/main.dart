import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/material.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'app.dart';
import 'firebase_options.dart';
import 'services/notification_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await initializeDateFormatting('sv', null);

  try {
    await Firebase.initializeApp(
      options: DefaultFirebaseOptions.currentPlatform,
    );
    await NotificationService.initialize(
      onTap: (orderId) => appRouter.push('/tracking/$orderId'),
    );
    // On web, pass your VAPID key here (Firebase Console → Project Settings →
    // Cloud Messaging → Web Push certificates → Key pair value).
    const vapidKey = String.fromEnvironment('VAPID_KEY');
    final token = await NotificationService.getToken(
      vapidKey: vapidKey.isNotEmpty ? vapidKey : null,
    );
    debugPrint('══════════════════════════════════════');
    debugPrint('FCM TOKEN: $token');
    debugPrint('══════════════════════════════════════');
  } catch (e) {
    debugPrint('Firebase not configured — notifications disabled. $e');
  }

  runApp(const GPizzaApp());
}
