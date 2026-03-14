self.addEventListener('push', function(event) {
    const data = event.data.json();
    
    const options = {
      body: data.body,
      icon: '/logo192.png',
      badge: '/favicon.ico',
      vibrate: [200, 100, 200],
      data: {
        url: data.url || '/admin',
        postId: data.postId
      },
      actions: [
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
      ]
    };
  
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  });
  
  self.addEventListener('notificationclick', function(event) {
    event.notification.close();
  
    if (event.action === 'close') return;
  
    if (event.action === 'approve') {
      // Ouvrir la page d'admin avec le post à approuver
      event.waitUntil(
        clients.openWindow('/admin?tab=posts&approve=' + event.notification.data.postId)
      );
    } else {
      event.waitUntil(
        clients.openWindow(event.notification.data.url)
      );
    }
  });