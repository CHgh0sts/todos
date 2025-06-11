#!/usr/bin/env node

/**
 * Script pour désactiver complètement le Service Worker
 * Utilisation: node scripts/disable-sw.js
 */

const fs = require('fs')
const path = require('path')

console.log('🚫 Désactivation complète du Service Worker...\n')

// Chemins des fichiers
const swPath = path.join(__dirname, '..', 'public', 'sw.js')
const swOriginalPath = path.join(__dirname, '..', 'public', 'sw.original.js')

// Service Worker vide qui se désinstalle
const emptySW = `
// Service Worker de désactivation
console.log('🚫 Service Worker désactivé - Nettoyage en cours...')

self.addEventListener('install', (event) => {
  console.log('🧹 Désinstallation du Service Worker...')
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  console.log('🗑️ Nettoyage des caches...')
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          console.log('🗑️ Suppression du cache:', cacheName)
          return caches.delete(cacheName)
        })
      )
    }).then(() => {
      console.log('✅ Service Worker désactivé et caches nettoyés')
      // Se désinscrire complètement
      return self.registration.unregister()
    })
  )
})

// Ne pas intercepter les requêtes
self.addEventListener('fetch', (event) => {
  // Laisser passer toutes les requêtes sans interception
  return
})
`

try {
  // Sauvegarder l'original s'il n'existe pas déjà
  if (fs.existsSync(swPath) && !fs.existsSync(swOriginalPath)) {
    fs.copyFileSync(swPath, swOriginalPath)
    console.log('💾 Service Worker original sauvegardé')
  }
  
  // Écrire le SW vide
  fs.writeFileSync(swPath, emptySW)
  console.log('✅ Service Worker désactivé')
  
  console.log('\n📋 Instructions:')
  console.log('1. Redémarrez votre serveur de développement')
  console.log('2. Ouvrez votre navigateur sur http://localhost:3000')
  console.log('3. Ouvrez les DevTools (F12)')
  console.log('4. Allez dans Application > Service Workers')
  console.log('5. Cliquez sur "Update" pour forcer la mise à jour')
  console.log('6. Le Service Worker se désinstallera automatiquement')
  console.log('\n🔄 Pour réactiver: npm run restore-sw')
  
} catch (error) {
  console.error('❌ Erreur lors de la désactivation:', error.message)
  process.exit(1)
} 