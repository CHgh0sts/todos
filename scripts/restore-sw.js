#!/usr/bin/env node

/**
 * Script pour restaurer le service worker original
 * Utilisation: node scripts/restore-sw.js
 */

const fs = require('fs')
const path = require('path')

console.log('🔄 Restauration du service worker original...')

const swPath = path.join(__dirname, '../public/sw.js')
const originalSwPath = path.join(__dirname, '../public/sw.original.js')

try {
  if (fs.existsSync(originalSwPath)) {
    // Restaurer l'original
    fs.copyFileSync(originalSwPath, swPath)
    
    // Supprimer la sauvegarde
    fs.unlinkSync(originalSwPath)
    
    console.log('✅ Service Worker original restauré')
    console.log('🔄 Rechargez votre navigateur pour appliquer les changements')
  } else {
    console.log('⚠️  Aucune sauvegarde trouvée')
  }
} catch (error) {
  console.error('❌ Erreur:', error.message)
  process.exit(1)
} 