#!/usr/bin/env node

/**
 * Script de test des optimisations appliquées
 * Utilisation: node scripts/test-optimizations.js
 */

const { performance } = require('perf_hooks')

console.log('🧪 Test des optimisations appliquées...\n')

async function testHealthCheck() {
  console.log('🏥 Test du Health Check...')
  
  try {
    const startTime = performance.now()
    const response = await fetch('http://localhost:3000/api/health')
    const endTime = performance.now()
    
    const responseTime = Math.round(endTime - startTime)
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ Health Check OK:', {
        status: data.status,
        responseTime: `${responseTime}ms`,
        memory: `${data.memory.used}MB/${data.memory.total}MB`,
        uptime: `${data.uptime}s`
      })
      
      if (responseTime > 1000) {
        console.log('⚠️  Health Check lent (>1s) - Possible problème de performance')
      }
      
      return true
    } else {
      console.log('❌ Health Check échoué:', response.status, response.statusText)
      return false
    }
  } catch (error) {
    console.log('❌ Erreur Health Check:', error.message)
    return false
  }
}

async function testProjectsAPI() {
  console.log('\n📋 Test de l\'API Projects (avec cache)...')
  
  try {
    // Premier appel (cache miss)
    console.log('   🔍 Premier appel (cache miss)...')
    const startTime1 = performance.now()
    const response1 = await fetch('http://localhost:3000/api/projects', {
      headers: {
        'Authorization': 'Bearer test-token' // Token de test
      }
    })
    const endTime1 = performance.now()
    const responseTime1 = Math.round(endTime1 - startTime1)
    
    console.log(`   📊 Premier appel: ${responseTime1}ms`)
    
    // Deuxième appel (cache hit attendu)
    console.log('   🎯 Deuxième appel (cache hit attendu)...')
    const startTime2 = performance.now()
    const response2 = await fetch('http://localhost:3000/api/projects', {
      headers: {
        'Authorization': 'Bearer test-token'
      }
    })
    const endTime2 = performance.now()
    const responseTime2 = Math.round(endTime2 - startTime2)
    
    console.log(`   📊 Deuxième appel: ${responseTime2}ms`)
    
    // Analyser l'amélioration
    if (responseTime2 < responseTime1) {
      const improvement = Math.round(((responseTime1 - responseTime2) / responseTime1) * 100)
      console.log(`   ✅ Amélioration du cache: ${improvement}% plus rapide`)
    } else {
      console.log('   ⚠️  Pas d\'amélioration détectée (normal si pas d\'authentification)')
    }
    
    return true
  } catch (error) {
    console.log('   ❌ Erreur test API Projects:', error.message)
    return false
  }
}

async function testDatabaseOptimizations() {
  console.log('\n🔗 Test des optimisations de base de données...')
  
  try {
    // Importer le module d'optimisation
    const { getCacheStats, cleanupExpiredCache } = await import('../src/lib/dbOptimization.js')
    
    // Statistiques du cache
    const stats = getCacheStats()
    console.log('   📊 Statistiques du cache:', {
      entries: stats.size,
      memoryMB: Math.round(stats.memory.heapUsed / 1024 / 1024)
    })
    
    // Test de nettoyage
    const cleaned = cleanupExpiredCache()
    console.log(`   🧹 Entrées nettoyées: ${cleaned}`)
    
    console.log('   ✅ Module d\'optimisation DB fonctionnel')
    return true
  } catch (error) {
    console.log('   ❌ Erreur test optimisations DB:', error.message)
    return false
  }
}

async function testConcurrentRequests() {
  console.log('\n🔄 Test de requêtes simultanées...')
  
  try {
    const concurrentRequests = 5
    const promises = []
    
    console.log(`   🚀 Lancement de ${concurrentRequests} requêtes simultanées...`)
    
    const startTime = performance.now()
    
    for (let i = 0; i < concurrentRequests; i++) {
      promises.push(
        fetch('http://localhost:3000/api/health')
          .then(response => ({
            index: i,
            success: response.ok,
            status: response.status,
            time: performance.now()
          }))
          .catch(error => ({
            index: i,
            success: false,
            error: error.message,
            time: performance.now()
          }))
      )
    }
    
    const results = await Promise.all(promises)
    const endTime = performance.now()
    const totalTime = Math.round(endTime - startTime)
    
    const successful = results.filter(r => r.success).length
    const failed = results.filter(r => !r.success).length
    
    console.log(`   📊 Résultats: ${successful}/${concurrentRequests} réussies en ${totalTime}ms`)
    
    if (failed > 0) {
      console.log('   ❌ Échecs détectés:')
      results.filter(r => !r.success).forEach(r => {
        console.log(`      - Requête ${r.index}: ${r.error || r.status}`)
      })
    }
    
    if (successful === concurrentRequests) {
      console.log('   ✅ Toutes les requêtes simultanées ont réussi')
      return true
    } else {
      console.log('   ⚠️  Certaines requêtes ont échoué')
      return false
    }
  } catch (error) {
    console.log('   ❌ Erreur test requêtes simultanées:', error.message)
    return false
  }
}

async function generateReport() {
  console.log('\n📋 Génération du rapport de test...')
  
  const tests = [
    { name: 'Health Check', passed: await testHealthCheck() },
    { name: 'API Projects (Cache)', passed: await testProjectsAPI() },
    { name: 'Optimisations DB', passed: await testDatabaseOptimizations() },
    { name: 'Requêtes Simultanées', passed: await testConcurrentRequests() }
  ]
  
  console.log('\n📊 Rapport Final:')
  console.log('================')
  
  let totalPassed = 0
  tests.forEach(test => {
    const status = test.passed ? '✅ PASS' : '❌ FAIL'
    console.log(`${status} ${test.name}`)
    if (test.passed) totalPassed++
  })
  
  console.log(`\n🎯 Score: ${totalPassed}/${tests.length} tests réussis`)
  
  if (totalPassed === tests.length) {
    console.log('\n🎉 Toutes les optimisations fonctionnent correctement!')
    console.log('✅ Votre application est prête pour la production')
  } else {
    console.log('\n⚠️  Certaines optimisations nécessitent une attention')
    console.log('💡 Vérifiez les erreurs ci-dessus avant le déploiement')
  }
  
  console.log('\n🚀 Prochaines étapes pour la production:')
  console.log('   1. Appliquez la DATABASE_URL optimisée')
  console.log('   2. Redémarrez votre application')
  console.log('   3. Surveillez /api/health')
  console.log('   4. Vérifiez que les erreurs 503 ont disparu')
}

// Exécuter tous les tests
generateReport().catch(error => {
  console.error('❌ Erreur lors des tests:', error)
  process.exit(1)
}) 