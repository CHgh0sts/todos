const CACHE_NAME = 'collabwave-v1.0.1'
const STATIC_CACHE_NAME = 'collabwave-static-v1.0.1'
const DYNAMIC_CACHE_NAME = 'collabwave-dynamic-v1.0.1'

// Fichiers à mettre en cache immédiatement
const STATIC_ASSETS = [
  '/',
  '/projects',
  '/friends',
  '/notifications',
  '/profile',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
]

// URLs des API à mettre en cache
const API_CACHE_PATTERNS = [
  /^https:\/\/todo\.chghosts\.fr\/api\/auth\/me$/,
  /^https:\/\/todo\.chghosts\.fr\/api\/projects$/,
  /^https:\/\/todo\.chghosts\.fr\/api\/friends$/,
  /^https:\/\/todo\.chghosts\.fr\/api\/notifications$/
]

// Installation du service worker
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker: Installation...')
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('📦 Service Worker: Mise en cache des assets statiques')
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => {
        console.log('✅ Service Worker: Installation terminée')
        return self.skipWaiting()
      })
      .catch((error) => {
        console.error('❌ Service Worker: Erreur installation:', error)
      })
  )
})

// Activation du service worker
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker: Activation...')
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Supprimer les anciens caches
            if (cacheName !== STATIC_CACHE_NAME && 
                cacheName !== DYNAMIC_CACHE_NAME &&
                cacheName.startsWith('collabwave-')) {
              console.log('🗑️ Service Worker: Suppression ancien cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => {
        console.log('✅ Service Worker: Activation terminée')
        return self.clients.claim()
      })
  )
})

// Interception des requêtes
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Ignorer les requêtes non-HTTP
  if (!request.url.startsWith('http')) {
    return
  }

  // Ignorer les requêtes vers des domaines externes (sauf APIs)
  if (url.origin !== self.location.origin && 
      !url.hostname.includes('todo.chghosts.fr')) {
    return
  }

  // Stratégie pour les APIs
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request))
    return
  }

  // Stratégie pour les pages HTML
  if (request.destination === 'document') {
    event.respondWith(handlePageRequest(request))
    return
  }

  // Stratégie pour les assets statiques
  if (request.destination === 'image' || 
      request.destination === 'script' || 
      request.destination === 'style' ||
      request.destination === 'font') {
    event.respondWith(handleStaticRequest(request))
    return
  }

  // Stratégie par défaut
  event.respondWith(handleDefaultRequest(request))
})

// Gestion des pages HTML - Network First avec fallback
async function handlePageRequest(request) {
  try {
    // Essayer le réseau en premier
    const networkResponse = await fetch(request)
    
    // Mettre en cache si succès
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.log('📱 Service Worker: Mode offline, utilisation du cache pour:', request.url)
    
    // Fallback sur le cache
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Fallback sur la page d'accueil si disponible
    const homeCache = await caches.match('/')
    if (homeCache) {
      return homeCache
    }
    
    // Page offline de base
    return new Response(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>CollabWave - Hors ligne</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { 
              font-family: system-ui, sans-serif; 
              text-align: center; 
              padding: 2rem;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              min-height: 100vh;
              margin: 0;
              display: flex;
              align-items: center;
              justify-content: center;
              flex-direction: column;
            }
            .offline-icon { font-size: 4rem; margin-bottom: 1rem; }
            h1 { margin-bottom: 0.5rem; }
            p { opacity: 0.8; margin-bottom: 2rem; }
            button {
              background: rgba(255,255,255,0.2);
              border: 2px solid white;
              color: white;
              padding: 0.75rem 1.5rem;
              border-radius: 0.5rem;
              cursor: pointer;
              font-size: 1rem;
            }
            button:hover { background: rgba(255,255,255,0.3); }
          </style>
        </head>
        <body>
          <div class="offline-icon">📱</div>
          <h1>CollabWave</h1>
          <p>Vous êtes actuellement hors ligne</p>
          <button onclick="window.location.reload()">Réessayer</button>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' }
    })
  }
}

// Gestion des APIs - Network First avec cache court
async function handleApiRequest(request) {
  const url = new URL(request.url)
  
  try {
    // Essayer le réseau
    const networkResponse = await fetch(request)
    
    // Mettre en cache seulement les GET réussis pour certaines APIs
    if (request.method === 'GET' && networkResponse.ok) {
      const shouldCache = API_CACHE_PATTERNS.some(pattern => 
        pattern.test(request.url)
      )
      
      if (shouldCache) {
        const cache = await caches.open(DYNAMIC_CACHE_NAME)
        // Cache avec expiration courte (5 minutes)
        const responseToCache = networkResponse.clone()
        responseToCache.headers.set('sw-cached-at', Date.now().toString())
        cache.put(request, responseToCache)
      }
    }
    
    return networkResponse
  } catch (error) {
    // Fallback sur le cache pour les GET
    if (request.method === 'GET') {
      const cachedResponse = await caches.match(request)
      if (cachedResponse) {
        // Vérifier l'âge du cache (5 minutes max)
        const cachedAt = cachedResponse.headers.get('sw-cached-at')
        if (cachedAt && (Date.now() - parseInt(cachedAt)) < 5 * 60 * 1000) {
          console.log('📡 Service Worker: Utilisation cache API pour:', request.url)
          return cachedResponse
        }
      }
    }
    
    // Réponse d'erreur pour les APIs
    return new Response(JSON.stringify({
      error: 'Service indisponible',
      offline: true,
      message: 'Vous êtes actuellement hors ligne'
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

// Gestion des assets statiques - Cache First
async function handleStaticRequest(request) {
  const cachedResponse = await caches.match(request)
  
  if (cachedResponse) {
    return cachedResponse
  }
  
  try {
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE_NAME)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.log('❌ Service Worker: Asset non disponible:', request.url)
    return new Response('Asset non disponible', { status: 404 })
  }
}

// Stratégie par défaut
async function handleDefaultRequest(request) {
  try {
    return await fetch(request)
  } catch (error) {
    const cachedResponse = await caches.match(request)
    return cachedResponse || new Response('Non disponible', { status: 404 })
  }
}

// Gestion des messages du client - IMPORTANT pour les mises à jour
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('🔄 Service Worker: Activation forcée de la nouvelle version')
    self.skipWaiting()
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME })
  }
  
  if (event.data && event.data.type === 'CHECK_UPDATE') {
    // Vérifier s'il y a une nouvelle version
    caches.keys().then((cacheNames) => {
      const hasUpdate = !cacheNames.includes(CACHE_NAME)
      event.ports[0].postMessage({ hasUpdate })
    })
  }
})

console.log('🎯 Service Worker CollabWave chargé - Version:', CACHE_NAME)
