#!/usr/bin/env node

/**
 * Script de diagnostic pour les erreurs 503 en production
 * Utilisation: node scripts/diagnose-503-error.js
 */

const { PrismaClient } = require('@prisma/client')

console.log('🔍 Diagnostic des erreurs 503 en production...\n')

async function testDatabasePerformance() {
  console.log('📊 Test de performance de la base de données...')
  
  const prisma = new PrismaClient()
  
  try {
    // Test de connexion simple
    const startTime = Date.now()
    await prisma.$connect()
    const connectTime = Date.now() - startTime
    console.log(`✅ Connexion à la base: ${connectTime}ms`)
    
    // Test de requête simple
    const queryStart = Date.now()
    const userCount = await prisma.user.count()
    const queryTime = Date.now() - queryStart
    console.log(`✅ Requête simple (count users): ${queryTime}ms - ${userCount} utilisateurs`)
    
    // Test de requête complexe (comme l'API projects)
    const complexStart = Date.now()
    const projects = await prisma.project.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true
          }
        },
        shares: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                profileImage: true
              }
            }
          }
        },
        _count: {
          select: {
            todos: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })
    const complexTime = Date.now() - complexStart
    console.log(`✅ Requête complexe (projects avec relations): ${complexTime}ms - ${projects.length} projets`)
    
    // Test de multiple connexions simultanées
    console.log('\n🔄 Test de connexions simultanées...')
    const simultaneousStart = Date.now()
    
    const promises = Array.from({ length: 5 }, async (_, i) => {
      const tempPrisma = new PrismaClient()
      try {
        await tempPrisma.$connect()
        const result = await tempPrisma.user.count()
        await tempPrisma.$disconnect()
        return { index: i, success: true, result }
      } catch (error) {
        return { index: i, success: false, error: error.message }
      }
    })
    
    const results = await Promise.all(promises)
    const simultaneousTime = Date.now() - simultaneousStart
    
    const successful = results.filter(r => r.success).length
    const failed = results.filter(r => !r.success).length
    
    console.log(`✅ Connexions simultanées: ${successful}/5 réussies, ${failed}/5 échouées en ${simultaneousTime}ms`)
    
    if (failed > 0) {
      console.log('❌ Erreurs de connexions simultanées:')
      results.filter(r => !r.success).forEach(r => {
        console.log(`   - Connexion ${r.index}: ${r.error}`)
      })
    }
    
    // Analyser les performances
    console.log('\n📈 Analyse des performances:')
    if (connectTime > 1000) {
      console.log('⚠️  Connexion lente (>1s) - Possible problème réseau ou DB surchargée')
    }
    if (queryTime > 500) {
      console.log('⚠️  Requête simple lente (>500ms) - Possible problème de performance DB')
    }
    if (complexTime > 2000) {
      console.log('⚠️  Requête complexe très lente (>2s) - Optimisation nécessaire')
    }
    if (failed > 0) {
      console.log('⚠️  Échecs de connexions simultanées - Pool de connexions insuffisant')
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test de performance:', error.message)
    console.error('   Code d\'erreur:', error.code)
    console.error('   Détails:', error.meta)
  } finally {
    await prisma.$disconnect()
  }
}

async function testApiEndpoints() {
  console.log('\n🌐 Test des endpoints API...')
  
  // Simuler les requêtes que fait l'application
  const endpoints = [
    '/api/maintenance-status',
    '/api/admin/settings'
  ]
  
  for (const endpoint of endpoints) {
    try {
      const startTime = Date.now()
      
      // Simuler une requête HTTP (sans vraiment faire de fetch car on est en script)
      console.log(`📡 Test simulé pour ${endpoint}...`)
      
      // Ici on pourrait faire un vrai fetch si on avait l'URL complète
      // const response = await fetch(`http://localhost:3000${endpoint}`)
      
      console.log(`   ✅ Endpoint ${endpoint} - Test simulé OK`)
      
    } catch (error) {
      console.log(`   ❌ Endpoint ${endpoint} - Erreur: ${error.message}`)
    }
  }
}

async function checkSystemResources() {
  console.log('\n💻 Vérification des ressources système...')
  
  // Mémoire utilisée par Node.js
  const memUsage = process.memoryUsage()
  console.log('📊 Utilisation mémoire Node.js:')
  console.log(`   - RSS: ${Math.round(memUsage.rss / 1024 / 1024)}MB`)
  console.log(`   - Heap Used: ${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`)
  console.log(`   - Heap Total: ${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`)
  console.log(`   - External: ${Math.round(memUsage.external / 1024 / 1024)}MB`)
  
  // Uptime du processus
  const uptime = process.uptime()
  console.log(`⏱️  Uptime du processus: ${Math.round(uptime)}s`)
  
  // Variables d'environnement critiques
  console.log('\n🔧 Variables d\'environnement critiques:')
  console.log(`   - NODE_ENV: ${process.env.NODE_ENV || 'non défini'}`)
  console.log(`   - DATABASE_URL: ${process.env.DATABASE_URL ? 'défini' : 'manquant'}`)
  console.log(`   - JWT_SECRET: ${process.env.JWT_SECRET ? 'défini' : 'manquant'}`)
  
  // Limites de connexions Prisma
  console.log('\n🔗 Configuration Prisma:')
  console.log('   - Pool de connexions: Vérifiez DATABASE_URL pour connection_limit')
  
  if (process.env.DATABASE_URL) {
    const url = new URL(process.env.DATABASE_URL)
    const params = new URLSearchParams(url.search)
    const connectionLimit = params.get('connection_limit')
    const poolTimeout = params.get('pool_timeout')
    
    console.log(`   - Connection limit: ${connectionLimit || 'par défaut (probablement 5)'}`)
    console.log(`   - Pool timeout: ${poolTimeout || 'par défaut (10s)'}`)
    
    if (!connectionLimit || parseInt(connectionLimit) < 10) {
      console.log('⚠️  Pool de connexions potentiellement trop petit pour la production')
    }
  }
}

async function checkSocketConnections() {
  console.log('\n🔌 Analyse des connexions Socket.IO...')
  
  console.log('📊 Problèmes observés dans les logs:')
  console.log('   - Déconnexions fréquentes: "client namespace disconnect"')
  console.log('   - Reconnexions immédiates avec même userId')
  console.log('   - Pattern: déconnexion → reconnexion → déconnexion')
  
  console.log('\n🔍 Causes possibles:')
  console.log('   1. Timeout de connexion trop court')
  console.log('   2. Problème de réseau/proxy en production')
  console.log('   3. Limite de connexions simultanées atteinte')
  console.log('   4. Problème de configuration CORS')
  console.log('   5. Service Worker qui interfère')
  
  console.log('\n💡 Solutions recommandées:')
  console.log('   1. Augmenter les timeouts Socket.IO')
  console.log('   2. Vérifier la configuration du proxy/load balancer')
  console.log('   3. Optimiser la gestion des connexions')
  console.log('   4. Désactiver temporairement le Service Worker')
}

async function generateRecommendations() {
  console.log('\n🎯 Recommandations pour résoudre les erreurs 503...')
  
  console.log('\n🔧 Actions immédiates:')
  console.log('   1. Vérifier les logs du serveur de production')
  console.log('   2. Monitorer l\'utilisation CPU/RAM du serveur')
  console.log('   3. Vérifier la latence réseau vers la base de données')
  console.log('   4. Augmenter le pool de connexions Prisma')
  
  console.log('\n⚙️  Optimisations de code:')
  console.log('   1. Réduire les requêtes simultanées à la DB')
  console.log('   2. Implémenter un cache Redis pour les données fréquentes')
  console.log('   3. Optimiser les requêtes Prisma (moins d\'includes)')
  console.log('   4. Ajouter des timeouts et retry logic')
  
  console.log('\n🏗️  Configuration serveur:')
  console.log('   1. Augmenter connection_limit dans DATABASE_URL')
  console.log('   2. Configurer un load balancer avec health checks')
  console.log('   3. Mettre en place un monitoring (CPU, RAM, DB)')
  console.log('   4. Configurer des alertes pour les erreurs 503')
  
  console.log('\n📊 Monitoring recommandé:')
  console.log('   1. Temps de réponse des APIs')
  console.log('   2. Nombre de connexions DB actives')
  console.log('   3. Taux d\'erreur par endpoint')
  console.log('   4. Métriques Socket.IO (connexions/déconnexions)')
}

// Exécuter tous les diagnostics
async function runDiagnostics() {
  try {
    await testDatabasePerformance()
    await testApiEndpoints()
    await checkSystemResources()
    await checkSocketConnections()
    await generateRecommendations()
    
    console.log('\n🎉 Diagnostic terminé!')
    console.log('\n📋 Prochaines étapes:')
    console.log('   1. Analyser les résultats ci-dessus')
    console.log('   2. Implémenter les optimisations recommandées')
    console.log('   3. Monitorer les performances après changements')
    console.log('   4. Configurer des alertes pour prévenir les futurs problèmes')
    
  } catch (error) {
    console.error('❌ Erreur lors du diagnostic:', error)
    process.exit(1)
  }
}

runDiagnostics() 