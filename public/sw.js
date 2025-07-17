const CACHE_NAME = 'collabwave-dev-v1.0.0'

// Installation - minimal
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker DEV: Installation...')
  self.skipWaiting()
})

// Activation - nettoyage simple
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker DEV: Activation...')
  event.waitUntil(self.clients.claim())
})

// Fetch - passer toutes les requêtes au réseau sans cache
self.addEventListener('fetch', (event) => {
  // En développement, on ne cache rien et on passe tout au réseau
  event.respondWith(fetch(event.request))
})

// Messages
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

console.log('🎯 Service Worker DEV chargé - Mode développement') 