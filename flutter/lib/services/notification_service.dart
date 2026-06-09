import 'dart:io';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';

const _channelId = 'order_updates';
const _channelName = 'Order Updates';
const _channelDesc = 'Notifications about your order status';

final _localNotifications = FlutterLocalNotificationsPlugin();

// Top-level handler — required by firebase_messaging for background messages.
@pragma('vm:entry-point')
Future<void> firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  // System shows the notification automatically; nothing extra needed here.
}

class NotificationService {
  static bool _ready = false;

  // Called once from main() after Firebase.initializeApp().
  static Future<void> initialize({required void Function(String orderId) onTap}) async {
    try {
      // ── Android notification channel ───────────────────────────────────────
      if (!kIsWeb && Platform.isAndroid) {
        await _localNotifications
            .resolvePlatformSpecificImplementation<
                AndroidFlutterLocalNotificationsPlugin>()
            ?.createNotificationChannel(
              const AndroidNotificationChannel(
                _channelId,
                _channelName,
                description: _channelDesc,
                importance: Importance.high,
              ),
            );
      }

      // ── Local-notifications init (foreground display + tap routing) ────────
      await _localNotifications.initialize(
        const InitializationSettings(
          android: AndroidInitializationSettings('@mipmap/ic_launcher'),
          iOS: DarwinInitializationSettings(
            requestAlertPermission: false,
            requestBadgePermission: false,
            requestSoundPermission: false,
          ),
        ),
        onDidReceiveNotificationResponse: (response) {
          final id = response.payload;
          if (id != null && id.isNotEmpty) onTap(id);
        },
      );

      // ── Request permission ─────────────────────────────────────────────────
      await FirebaseMessaging.instance.requestPermission(
        alert: true,
        badge: true,
        sound: true,
      );

      // ── Background handler (must be top-level) ─────────────────────────────
      FirebaseMessaging.onBackgroundMessage(firebaseMessagingBackgroundHandler);

      // ── Foreground: show local notification ────────────────────────────────
      FirebaseMessaging.onMessage.listen((msg) {
        final n = msg.notification;
        if (n == null) return;
        _localNotifications.show(
          n.hashCode,
          n.title,
          n.body,
          const NotificationDetails(
            android: AndroidNotificationDetails(
              _channelId, _channelName,
              channelDescription: _channelDesc,
              importance: Importance.high,
              priority: Priority.high,
            ),
            iOS: DarwinNotificationDetails(
              presentAlert: true,
              presentBadge: true,
              presentSound: true,
            ),
          ),
          payload: msg.data['order_id'],
        );
      });

      // ── Tap while app was backgrounded ─────────────────────────────────────
      FirebaseMessaging.onMessageOpenedApp.listen((msg) {
        final id = msg.data['order_id'] as String?;
        if (id != null && id.isNotEmpty) onTap(id);
      });

      // ── Tap that cold-started the app ──────────────────────────────────────
      final initial = await FirebaseMessaging.instance.getInitialMessage();
      if (initial != null) {
        final id = initial.data['order_id'] as String?;
        if (id != null && id.isNotEmpty) onTap(id);
      }

      _ready = true;
    } catch (e) {
      debugPrint('FCM init skipped: $e');
    }
  }

  // Returns null if Firebase isn't configured or permission was denied.
  // On web, pass your VAPID public key from Firebase Console →
  //   Project Settings → Cloud Messaging → Web Push certificates.
  static Future<String?> getToken({String? vapidKey}) async {
    if (!_ready) return null;
    try {
      return await FirebaseMessaging.instance.getToken(vapidKey: vapidKey);
    } catch (e) {
      debugPrint('FCM getToken error: $e');
      return null;
    }
  }
}
