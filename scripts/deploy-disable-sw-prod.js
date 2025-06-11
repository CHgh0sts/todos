#!/usr/bin/env node

/**
 * Script pour désactiver les Service Workers en production
 * Utilisation: node scripts/deploy-disable-sw-prod.js
 */

const fs = require('fs')
const path = require('path')

console.log('🚫 Désactivation des Service Workers pour la production...\n')

// Service Worker de désactivation pour la production
const productionDisableSW = `
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
`

// Chemins des fichiers
const publicDir = path.join(__dirname, '..', 'public')
const swPath = path.join(publicDir, 'sw.js')
const swOriginalPath = path.join(publicDir, 'sw.original.js')
const swProdDisabledPath = path.join(publicDir, 'sw.prod-disabled.js')

try {
  // Sauvegarder l'original s'il n'existe pas déjà
  if (fs.existsSync(swPath) && !fs.existsSync(swOriginalPath)) {
    fs.copyFileSync(swPath, swOriginalPath)
    console.log('💾 Service Worker original sauvegardé dans sw.original.js')
  }
  
  // Créer le fichier de désactivation pour la production
  fs.writeFileSync(swProdDisabledPath, productionDisableSW)
  console.log('✅ Service Worker de désactivation créé: sw.prod-disabled.js')
  
  // Remplacer le SW actuel par la version désactivée
  fs.writeFileSync(swPath, productionDisableSW)
  console.log('✅ Service Worker principal remplacé par la version désactivée')
  
  console.log('\n📋 Instructions pour la production:')
  console.log('1. Copiez le fichier public/sw.js sur votre serveur de production')
  console.log('2. Ou utilisez cette commande sur le serveur:')
  console.log('   cp public/sw.prod-disabled.js public/sw.js')
  console.log('3. Redémarrez votre application')
  console.log('4. Les utilisateurs verront le SW se désactiver automatiquement')
  
  console.log('\n🔄 Commandes utiles:')
  console.log('   npm run restore-sw    # Réactiver le SW plus tard')
  console.log('   npm run clear-sw      # Nettoyer les caches')
  
  console.log('\n✅ Le Service Worker sera maintenant désactivé en production !')
  console.log('   Plus besoin d\'annuler l\'enregistrement manuellement.')
  
} catch (error) {
  console.error('❌ Erreur lors de la désactivation:', error.message)
  process.exit(1)
} 