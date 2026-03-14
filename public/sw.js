// public/sw.js
self.addEventListener('push', function(event) {
    const data = event.data.json();
    
    const options = {
      body: data.body,
      icon: '/logo192.png',
      badge: '/favicon.ico',
      vibrate: [200, 100, 200],
      data: {
        url: data.url || '/admin'
      },
      actions: [
        {
          action: 'open',
          title: 'Voir la publication'
        },
        {
          action: 'close',
          title: 'Fermer'
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
  
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
  });