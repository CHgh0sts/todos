#!/usr/bin/env node

/**
 * Script pour nettoyer complètement les service workers et le cache
 * Utilisation: node scripts/clear-sw.js
 */

const fs = require('fs')
const path = require('path')

console.log('🧹 Nettoyage des service workers et cache...')

// Créer un service worker temporaire qui se désactive
const tempSwContent = `
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
`

// Écrire le service worker temporaire
const swPath = path.join(__dirname, '../public/sw.js')
const originalSwPath = path.join(__dirname, '../public/sw.original.js')

try {
  // Sauvegarder l'original s'il existe
  if (fs.existsSync(swPath)) {
    fs.copyFileSync(swPath, originalSwPath)
    console.log('💾 Service Worker original sauvegardé')
  }
  
  // Écrire le SW de nettoyage
  fs.writeFileSync(swPath, tempSwContent)
  console.log('🔧 Service Worker de nettoyage créé')
  
  console.log(`
📋 Instructions:
1. Ouvrez votre navigateur sur http://localhost:3000
2. Ouvrez les DevTools (F12)
3. Allez dans Application > Service Workers
4. Cliquez sur "Update" pour forcer la mise à jour
5. Attendez que le nettoyage soit terminé
6. Exécutez: node scripts/restore-sw.js pour restaurer l'original

⚠️  Ou utilisez directement: npm run clear-sw
`)

} catch (error) {
  console.error('❌ Erreur:', error.message)
  process.exit(1)
} 