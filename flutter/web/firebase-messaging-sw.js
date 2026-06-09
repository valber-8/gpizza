importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'FIREBASE_WEB_API_KEY',
  authDomain: 'gpizza-firebase.firebaseapp.com',
  projectId: 'gpizza-firebase',
  storageBucket: 'gpizza-firebase.firebasestorage.app',
  messagingSenderId: '52545957572',
  appId: '1:52545957572:web:a83ddd26627607db20a391',
});

const messaging = firebase.messaging();
messaging.onBackgroundMessage((payload) => {
  const { title, body } = payload.notification ?? {};
  if (title) {
    self.registration.showNotification(title, { body, icon: '/icons/Icon-192.png' });
  }
});
