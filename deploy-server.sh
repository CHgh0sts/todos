#!/bin/bash

# Script à exécuter sur le serveur de production
echo "🚀 Application des correctifs CollabWave..."

# Sauvegarder l'ancien SW
if [ -f "public/sw.js" ] && [ ! -f "public/sw.backup.js" ]; then
    cp public/sw.js public/sw.backup.js
    echo "✅ Service Worker sauvegardé"
fi

# Désactiver le Service Worker
cat > public/sw.js << 'SWEOF'
// Service Worker de désactivation - Production
console.log('🚫 [PRODUCTION] Service Worker désactivé - Nettoyage automatique')

self.addEventListener('install', (event) => {
  console.log('🧹 [PRODUCTION] Désinstallation du Service Worker...')
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  console.log('🗑️ [PRODUCTION] Nettoyage des caches...')
  event.waitUntil(
    Promise.all([
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            console.log('🗑️ [PRODUCTION] Suppression du cache:', cacheName)
            return caches.delete(cacheName)
          })
        )
      }),
      self.clients.claim()
    ]).then(() => {
      console.log('✅ [PRODUCTION] Service Worker désactivé et caches nettoyés')
      return self.registration.unregister().then(() => {
        console.log('✅ [PRODUCTION] Service Worker désenregistré')
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

self.addEventListener('fetch', (event) => {
  return
})

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})
SWEOF

echo "✅ Service Worker désactivé"

# Vérifier si PM2 est disponible
if command -v pm2 &> /dev/null; then
    echo "🔄 Redémarrage avec PM2..."
    pm2 restart all
    echo "✅ Application redémarrée avec PM2"
else
    echo "⚠️  PM2 non trouvé. Redémarrez manuellement votre application."
fi

echo ""
echo "🎉 Correctifs appliqués avec succès !"
echo "🔍 Testez votre site: https://todo.chghosts.fr"
echo "📊 Health check: https://todo.chghosts.fr/api/health"
