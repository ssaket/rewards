/**
 * Service Worker for FlowState Task Management App
 * Handles background notifications, push messages, and offline functionality
 */

const CACHE_NAME = 'flowstate-v1';
const NOTIFICATION_CACHE_NAME = 'flowstate-notifications-v1';

// Cache essential app resources
const CACHE_URLS = [
  '/rewards/',
  '/rewards/index.html',
  '/rewards/icons/notification-icon.svg',
  '/rewards/icons/notification-badge.svg',
  '/rewards/icons/celebration-icon.svg',
  '/rewards/icons/achievement-icon.svg',
  '/rewards/icons/check-icon.svg',
  '/rewards/icons/snooze-icon.svg'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  console.log('Service Worker: Install event');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching files');
        return cache.addAll(CACHE_URLS);
      })
      .catch((error) => {
        console.error('Service Worker: Cache error during install', error);
      })
  );
  
  // Activate immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activate event');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== NOTIFICATION_CACHE_NAME) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // Claim all clients immediately
  return self.clients.claim();
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  // Only handle same-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
      .catch((error) => {
        console.error('Service Worker: Fetch error', error);
        // For navigation requests, return a fallback page
        if (event.request.destination === 'document') {
          return caches.match('/rewards/index.html');
        }
      })
  );
});

// Push event - handle push notifications
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push event received');
  
  let notificationData = {
    title: 'FlowState',
    body: 'You have a new notification',
    icon: '/rewards/icons/notification-icon.svg',
    badge: '/rewards/icons/notification-badge.svg',
    tag: 'default',
    data: {}
  };
  
  if (event.data) {
    try {
      notificationData = { ...notificationData, ...event.data.json() };
    } catch (error) {
      console.error('Service Worker: Error parsing push data', error);
    }
  }
  
  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      renotify: true,
      requireInteraction: notificationData.requireInteraction || false,
      actions: notificationData.actions || [],
      data: notificationData.data,
      vibrate: [200, 100, 200], // Vibration pattern for mobile
      timestamp: Date.now()
    })
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification click event');
  
  const notification = event.notification;
  const action = event.action;
  const data = notification.data || {};
  
  // Close the notification
  notification.close();
  
  event.waitUntil(
    (async () => {
      // Get all windows/tabs
      const clients = await self.clients.matchAll({
        type: 'window',
        includeUncontrolled: true
      });
      
      // Check if app is already open
      let appClient = null;
      for (const client of clients) {
        if (client.url.includes('/rewards/') && 'focus' in client) {
          appClient = client;
          break;
        }
      }
      
      // Handle notification actions
      if (action) {
        await handleNotificationAction(action, data, appClient);
      } else {
        // Default click - focus or open app
        if (appClient) {
          await appClient.focus();
        } else {
          await self.clients.openWindow('/rewards/');
        }
      }
      
      // Send message to client about the notification click
      if (appClient) {
        appClient.postMessage({
          type: 'NOTIFICATION_CLICK',
          action: action,
          data: data
        });
      }
    })()
  );
});

// Handle different notification actions
async function handleNotificationAction(action, data, client) {
  switch (action) {
    case 'complete_task':
      if (client) {
        client.postMessage({
          type: 'COMPLETE_TASK',
          taskId: data.taskId,
          taskName: data.taskName
        });
        await client.focus();
      } else {
        await self.clients.openWindow('/rewards/?action=complete_task&taskId=' + data.taskId);
      }
      break;
      
    case 'snooze_reminder':
      if (client) {
        client.postMessage({
          type: 'SNOOZE_REMINDER',
          taskId: data.taskId,
          snoozeMinutes: 15
        });
      }
      // Schedule a new notification for 15 minutes later
      await scheduleSnoozeNotification(data, 15);
      break;
      
    case 'stop_timer':
      if (client) {
        client.postMessage({
          type: 'STOP_TIMER',
          taskId: data.taskId
        });
        await client.focus();
      } else {
        await self.clients.openWindow('/rewards/?action=stop_timer&taskId=' + data.taskId);
      }
      break;
      
    case 'continue_timer':
      if (client) {
        client.postMessage({
          type: 'CONTINUE_TIMER',
          taskId: data.taskId
        });
        await client.focus();
      } else {
        await self.clients.openWindow('/rewards/');
      }
      break;
      
    case 'view_tasks':
    default:
      if (client) {
        await client.focus();
      } else {
        await self.clients.openWindow('/rewards/');
      }
      break;
  }
}

// Schedule a snoozed notification
async function scheduleSnoozeNotification(originalData, snoozeMinutes) {
  // Store the snooze data
  const snoozeData = {
    ...originalData,
    snoozeTime: Date.now() + (snoozeMinutes * 60 * 1000),
    isSnooze: true
  };
  
  // Use the Cache API to store the snooze data
  const cache = await caches.open(NOTIFICATION_CACHE_NAME);
  const snoozeKey = `snooze-${originalData.taskId}-${Date.now()}`;
  const response = new Response(JSON.stringify(snoozeData));
  await cache.put(snoozeKey, response);
  
  console.log(`Service Worker: Scheduled snooze notification for ${snoozeMinutes} minutes`);
}

// Background sync for offline notifications
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-notification') {
    event.waitUntil(processBackgroundNotifications());
  }
});

// Process any queued background notifications
async function processBackgroundNotifications() {
  console.log('Service Worker: Processing background notifications');
  
  try {
    const cache = await caches.open(NOTIFICATION_CACHE_NAME);
    const requests = await cache.keys();
    
    for (const request of requests) {
      if (request.url.includes('snooze-')) {
        const response = await cache.match(request);
        const data = await response.json();
        
        // Check if it's time to show the snoozed notification
        if (Date.now() >= data.snoozeTime) {
          await self.registration.showNotification('📋 Task Reminder (Snoozed)', {
            body: `Time to work on: ${data.taskName}`,
            icon: '/rewards/icons/notification-icon-256.png',
            badge: '/rewards/icons/notification-badge-72.png',
            tag: `task-reminder-${data.taskId}`,
            renotify: true,
            actions: [
              {
                action: 'complete_task',
                title: '✅ Mark Complete'
              },
              {
                action: 'snooze_reminder',
                title: '⏰ Snooze 15min'
              }
            ],
            data: data
          });
          
          // Remove the processed snooze notification
          await cache.delete(request);
        }
      }
    }
  } catch (error) {
    console.error('Service Worker: Error processing background notifications', error);
  }
}

// Message handler for communication with main app
self.addEventListener('message', (event) => {
  const { type, data } = event.data || {};
  
  switch (type) {
    case 'SHOW_NOTIFICATION':
      event.waitUntil(
        self.registration.showNotification(data.title, {
          body: data.body,
          icon: data.icon || '/rewards/icons/notification-icon-256.png',
          badge: data.badge || '/rewards/icons/notification-badge-72.png',
          tag: data.tag || 'app-notification',
          renotify: data.renotify || false,
          requireInteraction: data.requireInteraction || false,
          actions: data.actions || [],
          data: data.data || {},
          vibrate: data.vibrate || [200, 100, 200],
          timestamp: Date.now()
        })
      );
      break;
      
    case 'CLEAR_NOTIFICATIONS':
      event.waitUntil(clearNotificationsWithTag(data.tag));
      break;
      
    case 'GET_CLIENTS':
      event.waitUntil(
        self.clients.matchAll({ type: 'window' }).then((clients) => {
          event.ports[0].postMessage({
            type: 'CLIENTS_RESPONSE',
            clients: clients.map(c => ({ id: c.id, url: c.url, focused: c.focused }))
          });
        })
      );
      break;
      
    default:
      console.log('Service Worker: Unknown message type:', type);
  }
});

// Clear notifications with specific tag
async function clearNotificationsWithTag(tag) {
  if (!tag) return;
  
  const notifications = await self.registration.getNotifications({ tag });
  notifications.forEach(notification => notification.close());
  
  console.log(`Service Worker: Cleared ${notifications.length} notifications with tag: ${tag}`);
}

// Periodic check for snoozed notifications (fallback)
setInterval(processBackgroundNotifications, 60000); // Check every minute

console.log('Service Worker: Loaded and ready');