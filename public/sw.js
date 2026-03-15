// public/sw.js - Service Worker pour notifications push

const CACHE_NAME = 'rencontre-auth-v1';

self.addEventListener('install', (event) => {
  console.log('✅ Service Worker installé');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker activé');
  event.waitUntil(clients.claim());
});

self.addEventListener('push', function(event) {
  console.log('📨 Notification push reçue:', event);
  
  try {
    let data = {};
    
    if (event.data) {
      data = event.data.json();
      console.log('📊 Données de la notification:', data);
    }
    
    const options = {
      body: data.body || 'Nouvelle notification',
      icon: '/logo192.png',
      badge: '/favicon.ico',
      vibrate: [200, 100, 200],
      data: {
        url: data.url || '/',
        postId: data.postId,
        type: data.type || 'info',
        senderId: data.senderId,
        timestamp: Date.now()
      },
      actions: data.actions || [
        {
          action: 'view',
          title: '👁️ Voir'
        },
        {
          action: 'close',
          title: '❌ Fermer'
        }
      ],
      requireInteraction: true,
      silent: false,
      tag: `notification-${Date.now()}`
    };

    // Si c'est une notification d'approbation, ajouter le bouton Approuver
    if (data.type === 'post_approval') {
      options.actions = [
        {
          action: 'approve',
          title: '✅ Approuver'
        },
        {
          action: 'view',
          title: '👁️ Voir'
        },
        {
          action: 'close',
          title: '❌ Fermer'
        }
      ];
    }

    // Si c'est un nouveau message
    if (data.type === 'new_message') {
      options.actions = [
        {
          action: 'reply',
          title: '💬 Répondre'
        },
        {
          action: 'view',
          title: '👁️ Voir'
        },
        {
          action: 'close',
          title: '❌ Fermer'
        }
      ];
    }

    event.waitUntil(
      self.registration.showNotification(data.title || 'Rencontre Authentique', options)
    );
    
  } catch (error) {
    console.error('❌ Erreur traitement notification:', error);
    
    // Notification par défaut en cas d'erreur
    event.waitUntil(
      self.registration.showNotification('Rencontre Authentique', {
        body: 'Nouvelle notification',
        icon: '/logo192.png',
        badge: '/favicon.ico'
      })
    );
  }
});

self.addEventListener('notificationclick', function(event) {
  console.log('🔔 Notification cliquée:', event.action);
  
  event.notification.close();

  if (event.action === 'close') return;

  // Récupérer les données
  const data = event.notification.data || {};
  const url = data.url || '/';

  // Gestion des actions spéciales
  if (event.action === 'approve' && data.postId) {
    // Ouvrir directement la page d'approbation
    event.waitUntil(
      clients.openWindow(`/admin?tab=posts&approve=${data.postId}`)
    );
    return;
  }

  if (event.action === 'reply' && data.url) {
    // Ouvrir la conversation
    event.waitUntil(
      clients.openWindow(data.url)
    );
    return;
  }

  // Action par défaut : ouvrir l'URL
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Si une fenêtre est déjà ouverte, la focaliser
        for (const client of clientList) {
          if (client.url === url && 'focus' in client) {
            return client.focus();
          }
        }
        // Sinon ouvrir une nouvelle fenêtre
        return clients.openWindow(url);
      })
  );
});

self.addEventListener('notificationclose', function(event) {
  console.log('🔕 Notification fermée');
});

// Gestion des messages du client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});