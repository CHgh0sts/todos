
// Service Worker temporaire pour nettoyage
self.addEventListener('install', () => {
  console.log('🗑️ Service Worker de nettoyage installé')
  self.skipWaiting()
})

self.addEventListener('activate', async (event) => {
  console.log('🧹 Nettoyage des caches...')
  
  event.waitUntil(
    (async () => {
      // Supprimer tous les caches
      const cacheNames = await caches.keys()
      await Promise.all(
        cacheNames.map(cacheName => {
          console.log('🗑️ Suppression cache:', cacheName)
          return caches.delete(cacheName)
        })
      )
      
      // Se désactiver
      const registrations = await self.registration.unregister()
      console.log('✅ Service Worker nettoyé et désactivé')
      
      // Notifier le client
      const clients = await self.clients.matchAll()
      clients.forEach(client => {
        client.postMessage({ type: 'SW_CLEANED' })
      })
    })()
  )
})

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CLEAN_AND_UNREGISTER') {
    self.registration.unregister()
  }
})
