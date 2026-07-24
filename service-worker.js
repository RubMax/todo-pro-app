// Service Worker pour les notifications en arrière-plan
// Compatible avec Chrome, Firefox, Edge, Safari (sur iOS 16.4+)

self.addEventListener('install', function(e) {
  console.log('[SW] Installation');
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  console.log('[SW] Activation');
  e.waitUntil(clients.claim());
});

// Gestionnaire de notifications
self.addEventListener('notificationclick', function(e) {
  console.log('[SW] Clic sur notification:', e.notification.data);
  
  e.notification.close();
  
  e.waitUntil(
    clients.matchAll({ 
      type: 'window',
      includeUncontrolled: true 
    }).then(function(clientList) {
      // Chercher une fenêtre déjà ouverte
      for (var i = 0; i < clientList.length; i++) {
        var client = clientList[i];
        if (client.url && client.url.includes('github.io') && 'focus' in client) {
          client.focus();
          return;
        }
      }
      // Si aucune fenêtre trouvée, en ouvrir une
      if (clients.openWindow) {
        return clients.openWindow(e.notification.data?.url || '/');
      }
    })
  );
});

// Gestionnaire pour les messages
self.addEventListener('message', function(e) {
  console.log('[SW] Message reçu:', e.data);
  if (e.data && e.data.type === 'SHOW_NOTIFICATION') {
    self.registration.showNotification(e.data.title || '🔔 Rappel', {
      body: e.data.message || 'Tâche en attente',
      icon: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/img/bootstrap-logo.svg',
      badge: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/img/bootstrap-logo.svg',
      vibrate: [200, 100, 200],
      requireInteraction: true,
      tag: 'reminder-' + Date.now(),
      data: {
        url: e.data.url || '/'
      }
    });
  }
});

// Synchronisation en arrière-plan (pour Chrome)
self.addEventListener('sync', function(e) {
  console.log('[SW] Sync:', e.tag);
  if (e.tag === 'task-sync') {
    e.waitUntil(syncTasks());
  }
});

async function syncTasks() {
  console.log('[SW] Synchronisation des tâches');
  // Ici tu peux ajouter une synchronisation avec un serveur si besoin
  return true;
}
