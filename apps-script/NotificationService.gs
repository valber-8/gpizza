// Sends FCM push notifications via HTTP v1 API using a service-account JWT.
// Requires three Script Properties: FCM_PROJECT_ID, FCM_CLIENT_EMAIL, FCM_PRIVATE_KEY.
// If any property is missing the call is silently skipped.
const NotificationService = {

  MESSAGES: {
    received:         { title: '🎉 Pedido recebido!',        body: 'Recebemos seu pedido e já estamos de olho.' },
    preparing:        { title: '👨‍🍳 Preparando...',           body: 'Nossa equipe está preparando seu pedido.' },
    baking:           { title: '🔥 No forno!',               body: 'Sua pizza está no forno!' },
    ready:            { title: '🍕 Pronto para retirada!',   body: 'Seu pedido está pronto. Pode vir buscar!' },
    out_for_delivery: { title: '🛵 Saiu para entrega!',      body: 'Seu pedido está a caminho!' },
    completed:        { title: '✅ Entregue!',                body: 'Obrigado pela preferência! Bom apetite! 😋' },
    cancelled:        { title: '❌ Pedido cancelado',         body: 'Seu pedido foi cancelado. Entre em contato conosco.' },
  },

  send(fcmToken, status, orderId) {
    if (!fcmToken || !Config.fcmProjectId || !Config.fcmClientEmail || !Config.fcmPrivateKey) return;
    const msg = this.MESSAGES[status];
    if (!msg) return;

    try {
      const token = this._getAccessToken();
      const url = `https://fcm.googleapis.com/v1/projects/${Config.fcmProjectId}/messages:send`;
      UrlFetchApp.fetch(url, {
        method: 'post',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        payload: JSON.stringify({
          message: {
            token: fcmToken,
            notification: { title: msg.title, body: msg.body },
            data: { order_id: String(orderId), status: String(status) },
            android: { notification: { channel_id: 'order_updates', priority: 'HIGH' } },
            apns: { payload: { aps: { sound: 'default' } } },
          },
        }),
        muteHttpExceptions: true,
      });
    } catch (ex) {
      Logger.log('FCM send error: ' + ex.message);
    }
  },

  _getAccessToken() {
    const email  = Config.fcmClientEmail;
    const rawKey = Config.fcmPrivateKey.replace(/\\n/g, '\n');
    const now    = Math.floor(Date.now() / 1000);

    const hdr = Utilities.base64EncodeWebSafe(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).replace(/=+$/, '');
    const pld = Utilities.base64EncodeWebSafe(JSON.stringify({
      iss: email,
      scope: 'https://www.googleapis.com/auth/firebase.messaging',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600,
      iat: now,
    })).replace(/=+$/, '');

    const sig = Utilities.base64EncodeWebSafe(
      Utilities.computeRsaSha256Signature(`${hdr}.${pld}`, rawKey)
    ).replace(/=+$/, '');

    const res = UrlFetchApp.fetch('https://oauth2.googleapis.com/token', {
      method: 'post',
      payload: {
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: `${hdr}.${pld}.${sig}`,
      },
      muteHttpExceptions: true,
    });
    return JSON.parse(res.getContentText()).access_token;
  },
};
