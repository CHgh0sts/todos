#!/usr/bin/env node

/**
 * Script de test de la production
 * Utilisation: node scripts/test-production.js
 */

const https = require('https')
const http = require('http')

console.log('🧪 Test de la production CollabWave...\n')

const PRODUCTION_URL = 'https://todo.chghosts.fr'

async function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http
    const startTime = Date.now()
    
    const req = protocol.get(url, options, (res) => {
      const endTime = Date.now()
      const responseTime = endTime - startTime
      
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data,
          responseTime: responseTime
        })
      })
    })
    
    req.on('error', (err) => {
      reject(err)
    })
    
    req.setTimeout(10000, () => {
      req.destroy()
      reject(new Error('Timeout'))
    })
  })
}

async function testEndpoint(name, url, expectedStatus = 200) {
  try {
    console.log(`🔍 Test ${name}...`)
    const response = await makeRequest(url)
    
    if (response.statusCode === expectedStatus) {
      console.log(`✅ ${name}: OK (${response.statusCode}) - ${response.responseTime}ms`)
      return true
    } else {
      console.log(`❌ ${name}: ERREUR (${response.statusCode}) - ${response.responseTime}ms`)
      if (response.data.length < 500) {
        console.log(`   Réponse: ${response.data.substring(0, 200)}...`)
      }
      return false
    }
  } catch (error) {
    console.log(`❌ ${name}: ERREUR - ${error.message}`)
    return false
  }
}

async function testProduction() {
  console.log(`🌐 URL de production: ${PRODUCTION_URL}`)
  console.log('=' .repeat(50))
  
  const tests = [
    ['Page d\'accueil', `${PRODUCTION_URL}`],
    ['API Health Check', `${PRODUCTION_URL}/api/health`],
    ['Page de connexion', `${PRODUCTION_URL}/auth/login`],
    ['API Maintenance Status', `${PRODUCTION_URL}/api/maintenance-status`],
    ['Page des projets (sans auth)', `${PRODUCTION_URL}/projects`, 302] // Redirection attendue
  ]
  
  let passed = 0
  let total = tests.length
  
  for (const [name, url, expectedStatus] of tests) {
    const success = await testEndpoint(name, url, expectedStatus)
    if (success) passed++
    console.log('') // Ligne vide
  }
  
  console.log('=' .repeat(50))
  console.log(`📊 Résultats: ${passed}/${total} tests réussis`)
  
  if (passed === total) {
    console.log('🎉 Tous les tests sont passés ! La production semble fonctionner.')
  } else {
    console.log('⚠️  Certains tests ont échoué. Vérifiez la configuration.')
  }
  
  // Test spécifique de l'API de santé
  if (passed > 0) {
    console.log('\n🔍 Détails de l\'API de santé:')
    try {
      const healthResponse = await makeRequest(`${PRODUCTION_URL}/api/health`)
      if (healthResponse.statusCode === 200) {
        const healthData = JSON.parse(healthResponse.data)
        console.log('✅ Base de données:', healthData.database ? 'Connectée' : 'Déconnectée')
        console.log('✅ Uptime:', healthData.uptime || 'N/A')
        console.log('✅ Mémoire:', healthData.memory ? `${Math.round(healthData.memory.used / 1024 / 1024)}MB utilisés` : 'N/A')
      }
    } catch (error) {
      console.log('❌ Impossible de parser les détails de santé')
    }
  }
}

// Exécuter les tests
testProduction().catch(console.error) 