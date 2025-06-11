
// Service Worker de désactivation - Production
console.log('🚫 [PRODUCTION] Service Worker désactivé - Nettoyage automatique')

self.addEventListener('install', (event) => {
  console.log('🧹 [PRODUCTION] Désinstallation du Service Worker...')
  // Forcer l'activation immédiate
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  console.log('🗑️ [PRODUCTION] Nettoyage des caches...')
  event.waitUntil(
    Promise.all([
      // Supprimer tous les caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            console.log('🗑️ [PRODUCTION] Suppression du cache:', cacheName)
            return caches.delete(cacheName)
          })
        )
      }),
      // Prendre le contrôle de tous les clients immédiatement
      self.clients.claim()
    ]).then(() => {
      console.log('✅ [PRODUCTION] Service Worker désactivé et caches nettoyés')
      // Se désinscrire complètement
      return self.registration.unregister().then(() => {
        console.log('✅ [PRODUCTION] Service Worker désenregistré')
        // Notifier tous les clients de recharger
        return self.clients.matchAll().then(clients => {
          clients.forEach(client => {
            client.postMessage({
              type: 'SW_DISABLED',
              message: 'Service Worker désactivé, rechargement automatique'
            })
          })
        })
      })
    })
  )
})

// Ne jamais intercepter les requêtes
self.addEventListener('fetch', (event) => {
  // Laisser passer toutes les requêtes sans interception
  return
})

// Écouter les messages des clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})
