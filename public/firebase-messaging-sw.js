/**
 * Firebase Messaging Service Worker
 * Handles background notifications for the chat system
 */

// Import Firebase scripts
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Initialize Firebase app in the service worker
firebase.initializeApp({
  apiKey: "AIzaSyClc_44GqwHT3btV7n6CLVkivvMju4XnUI",
  authDomain: "umrago-af2f8.firebaseapp.com",
  databaseURL: "https://umrahgo-3f7a1-default-rtdb.firebaseio.com",
  projectId: "umrago-af2f8",
  storageBucket: "umrago-af2f8.appspot.com",
  messagingSenderId: "407769262389",
  appId: "1:407769262389:web:8418b303ffc41ca180447c"
});

// Initialize Firebase Messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message:', payload);
  
  // Extract notification data
  const notificationTitle = payload.notification?.title || payload.data?.title || 'رسالة جديدة';
  const notificationOptions = {
    body: payload.notification?.body || payload.data?.body || 'لديك رسالة جديدة',
    icon: payload.notification?.icon || '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: payload.data?.chat_id || 'default',
    data: payload.data || {},
    actions: [
      {
        action: 'view',
        title: 'عرض',
      },
      {
        action: 'close',
        title: 'إغلاق',
      }
    ],
    requireInteraction: true,
    vibrate: [200, 100, 200],
    sound: '/sounds/notification.mp3'
  };

  // Show the notification
  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification click received:', event);
  
  event.notification.close();
  
  if (event.action === 'close') {
    return;
  }
  
  // Open the chat page if chat_id is provided
  const chatId = event.notification.data?.chat_id;
  const userType = event.notification.data?.user_type || 'pilgrim';
  const locale = event.notification.data?.locale || 'ar';
  
  let url = '/';
  if (chatId) {
    url = `/${locale}/${userType}/chat?id=${chatId}`;
  }
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((windowClients) => {
      // Check if there is already a window/tab open with the target URL
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      // If not, then open the target URL in a new window/tab
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

// Cache management for offline support
const CACHE_NAME = 'umrahgo-chat-v1';
const urlsToCache = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/sounds/notification.mp3'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Opened cache');
      return cache.addAll(urlsToCache);
    })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Cache hit - return response
      if (response) {
        return response;
      }
      return fetch(event.request);
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
}); 