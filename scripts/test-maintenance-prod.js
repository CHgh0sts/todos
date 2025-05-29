#!/usr/bin/env node

/**
 * Script de test du mode maintenance en production
 * Usage: node scripts/test-maintenance-prod.js [URL]
 */

const https = require('https')
const http = require('http')

const BASE_URL = process.argv[2] || 'https://todo.chghosts.fr'

console.log(`🧪 Test du mode maintenance sur: ${BASE_URL}`)

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url)
    const client = urlObj.protocol === 'https:' ? https : http
    
    const req = client.request(url, {
      method: options.method || 'GET',
      headers: options.headers || {},
      ...options
    }, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: data
        })
      })
    })
    
    req.on('error', reject)
    
    if (options.body) {
      req.write(options.body)
    }
    
    req.end()
  })
}

async function testMaintenanceAPI() {
  console.log('\n📡 Test de l\'API maintenance-status...')
  
  try {
    // Test normal
    const response1 = await makeRequest(`${BASE_URL}/api/maintenance-status`)
    console.log(`✅ Statut: ${response1.status}`)
    console.log(`📄 Données brutes: ${response1.data.substring(0, 200)}...`)
    
    if (response1.status === 200) {
      try {
        const data = JSON.parse(response1.data)
        console.log(`📊 Mode maintenance: ${data.isEnabled ? 'ACTIVÉ' : 'DÉSACTIVÉ'}`)
        console.log(`💬 Message: ${data.message}`)
        
        if (data.timestamp) {
          const timestamp = typeof data.timestamp === 'number' ? data.timestamp : parseInt(data.timestamp)
          if (!isNaN(timestamp)) {
            console.log(`⏰ Timestamp: ${new Date(timestamp).toLocaleString()}`)
          } else {
            console.log(`⚠️ Timestamp invalide: ${data.timestamp}`)
          }
        } else {
          console.log(`⚠️ Pas de timestamp dans la réponse`)
        }
        
        console.log(`🔄 Cached: ${data.cached !== undefined ? data.cached : 'Non défini'}`)
        
        // Test avec refresh
        console.log('\n🔄 Test avec refresh forcé...')
        const response2 = await makeRequest(`${BASE_URL}/api/maintenance-status?refresh=${Date.now()}`)
        
        if (response2.status === 200) {
          const data2 = JSON.parse(response2.data)
          console.log(`📊 Mode maintenance (refresh): ${data2.isEnabled ? 'ACTIVÉ' : 'DÉSACTIVÉ'}`)
          
          if (data2.timestamp) {
            const timestamp2 = typeof data2.timestamp === 'number' ? data2.timestamp : parseInt(data2.timestamp)
            if (!isNaN(timestamp2)) {
              console.log(`⏰ Timestamp (refresh): ${new Date(timestamp2).toLocaleString()}`)
            }
          }
          
          console.log(`🔄 Cached (refresh): ${data2.cached !== undefined ? data2.cached : 'Non défini'}`)
          
          // Vérifier les headers de cache
          console.log('\n📋 Headers de cache:')
          console.log(`Cache-Control: ${response2.headers['cache-control'] || 'Non défini'}`)
          console.log(`Pragma: ${response2.headers['pragma'] || 'Non défini'}`)
          console.log(`Expires: ${response2.headers['expires'] || 'Non défini'}`)
          console.log(`Access-Control-Allow-Origin: ${response2.headers['access-control-allow-origin'] || 'Non défini'}`)
        }
      } catch (parseError) {
        console.log(`❌ Erreur parsing JSON: ${parseError.message}`)
        console.log(`📄 Données reçues: ${response1.data}`)
        return false
      }
    }
    
    return true
  } catch (error) {
    console.log(`❌ Erreur: ${error.message}`)
    return false
  }
}

async function testMaintenancePage() {
  console.log('\n🏠 Test de la page de maintenance...')
  
  try {
    const response = await makeRequest(`${BASE_URL}/maintenance`)
    console.log(`✅ Statut page maintenance: ${response.status}`)
    
    if (response.status === 200) {
      const hasMaintenanceContent = response.data.includes('Maintenance en cours')
      console.log(`📄 Contenu maintenance détecté: ${hasMaintenanceContent ? 'OUI' : 'NON'}`)
      
      if (!hasMaintenanceContent) {
        // Chercher d'autres indicateurs
        const has404 = response.data.includes('404') || response.data.includes('Page introuvable')
        const hasError = response.data.includes('error') || response.data.includes('erreur')
        console.log(`📄 Contenu 404 détecté: ${has404 ? 'OUI' : 'NON'}`)
        console.log(`📄 Contenu erreur détecté: ${hasError ? 'OUI' : 'NON'}`)
      }
    }
    
    return true
  } catch (error) {
    console.log(`❌ Erreur page maintenance: ${error.message}`)
    return false
  }
}

async function testCacheInvalidation() {
  console.log('\n🔄 Test d\'invalidation du cache...')
  
  try {
    // Première requête
    const response1 = await makeRequest(`${BASE_URL}/api/maintenance-status`)
    
    if (response1.status !== 200) {
      console.log(`❌ Première requête échouée: ${response1.status}`)
      return false
    }
    
    const data1 = JSON.parse(response1.data)
    const timestamp1 = typeof data1.timestamp === 'number' ? data1.timestamp : parseInt(data1.timestamp)
    
    // Attendre un peu
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Requête avec refresh
    const response2 = await makeRequest(`${BASE_URL}/api/maintenance-status?refresh=${Date.now()}`)
    
    if (response2.status !== 200) {
      console.log(`❌ Deuxième requête échouée: ${response2.status}`)
      return false
    }
    
    const data2 = JSON.parse(response2.data)
    const timestamp2 = typeof data2.timestamp === 'number' ? data2.timestamp : parseInt(data2.timestamp)
    
    if (!isNaN(timestamp1) && !isNaN(timestamp2)) {
      console.log(`⏰ Différence timestamp: ${timestamp2 - timestamp1}ms`)
      console.log(`🔄 Cache invalidé: ${timestamp2 > timestamp1 ? 'OUI' : 'NON'}`)
    } else {
      console.log(`⚠️ Timestamps invalides: ${timestamp1}, ${timestamp2}`)
    }
    
    return true
  } catch (error) {
    console.log(`❌ Erreur test cache: ${error.message}`)
    return false
  }
}

async function runTests() {
  console.log('🚀 Début des tests de maintenance en production\n')
  
  const results = []
  
  results.push(await testMaintenanceAPI())
  results.push(await testMaintenancePage())
  results.push(await testCacheInvalidation())
  
  const passed = results.filter(r => r).length
  const total = results.length
  
  console.log(`\n📊 Résultats: ${passed}/${total} tests réussis`)
  
  if (passed === total) {
    console.log('✅ Tous les tests sont passés!')
    process.exit(0)
  } else {
    console.log('❌ Certains tests ont échoué')
    process.exit(1)
  }
}

runTests().catch(error => {
  console.error('💥 Erreur fatale:', error)
  process.exit(1)
}) 