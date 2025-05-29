#!/usr/bin/env node

/**
 * Script de test pour vérifier les mises à jour automatiques
 * des statistiques système
 */

const https = require('https')
const http = require('http')

const BASE_URL = 'http://localhost:3000'

// Fonction pour faire une requête HTTP
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http
    
    const req = protocol.request(url, options, (res) => {
      let data = ''
      
      res.on('data', (chunk) => {
        data += chunk
      })
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data)
          resolve({
            status: res.statusCode,
            data: jsonData
          })
        } catch (error) {
          resolve({
            status: res.statusCode,
            data: data
          })
        }
      })
    })
    
    req.on('error', (error) => {
      reject(error)
    })
    
    if (options.body) {
      req.write(options.body)
    }
    
    req.end()
  })
}

// Test des statistiques système
async function testSystemStats() {
  console.log('🧪 Test des mises à jour automatiques des statistiques système\n')
  
  try {
    console.log('📊 Test 1: Récupération des statistiques système...')
    
    const response = await makeRequest(`${BASE_URL}/api/admin/system-stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    if (response.status === 200) {
      console.log('✅ Statistiques récupérées avec succès')
      console.log(`   - CPU Usage: ${response.data.cpuUsage}%`)
      console.log(`   - Mémoire: ${response.data.memory?.heapUsedMB || 'N/A'} MB`)
      console.log(`   - Points d'historique: ${response.data.history?.length || 0}`)
      console.log(`   - Timestamp: ${response.data.timestamp}`)
      
      // Test de l'historique
      if (response.data.history && response.data.history.length > 0) {
        console.log('✅ Historique des données disponible')
        const lastPoint = response.data.history[response.data.history.length - 1]
        console.log(`   - Dernier point: CPU ${lastPoint.cpuUsage}%, Mémoire ${lastPoint.memoryUsage}MB`)
      } else {
        console.log('⚠️  Aucun historique disponible (normal au premier démarrage)')
      }
      
    } else {
      console.log(`❌ Erreur: Status ${response.status}`)
      console.log(`   Response: ${JSON.stringify(response.data, null, 2)}`)
    }
    
  } catch (error) {
    console.log(`❌ Erreur lors du test: ${error.message}`)
  }
}

// Test de plusieurs appels successifs pour simuler les mises à jour automatiques
async function testAutoUpdates() {
  console.log('\n🔄 Test 2: Simulation des mises à jour automatiques...')
  
  for (let i = 1; i <= 3; i++) {
    console.log(`\n   Appel ${i}/3:`)
    
    try {
      const response = await makeRequest(`${BASE_URL}/api/admin/system-stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      if (response.status === 200) {
        console.log(`   ✅ CPU: ${response.data.cpuUsage}% | Mémoire: ${response.data.memory?.heapUsedMB || 'N/A'}MB | Points: ${response.data.history?.length || 0}`)
      } else {
        console.log(`   ❌ Erreur: Status ${response.status}`)
      }
      
    } catch (error) {
      console.log(`   ❌ Erreur: ${error.message}`)
    }
    
    // Attendre 2 secondes entre les appels
    if (i < 3) {
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
  }
}

// Test de la page d'administration
async function testAdminPage() {
  console.log('\n🌐 Test 3: Vérification de la page d\'administration...')
  
  try {
    const response = await makeRequest(`${BASE_URL}/admin/settings`, {
      method: 'GET'
    })
    
    if (response.status === 200) {
      console.log('✅ Page d\'administration accessible')
    } else {
      console.log(`⚠️  Page d'administration: Status ${response.status} (redirection vers login attendue)`)
    }
    
  } catch (error) {
    console.log(`❌ Erreur lors de l'accès à la page: ${error.message}`)
  }
}

// Fonction principale
async function main() {
  console.log('🚀 Démarrage des tests de mise à jour automatique\n')
  console.log('📝 Ce script teste:')
  console.log('   - La récupération des statistiques système')
  console.log('   - L\'accumulation de l\'historique')
  console.log('   - Les mises à jour successives')
  console.log('   - L\'accessibilité de la page d\'administration\n')
  
  await testSystemStats()
  await testAutoUpdates()
  await testAdminPage()
  
  console.log('\n✨ Tests terminés!')
  console.log('\n💡 Pour tester les mises à jour automatiques en temps réel:')
  console.log('   1. Connectez-vous en tant qu\'administrateur')
  console.log('   2. Allez sur http://localhost:3000/admin/settings')
  console.log('   3. Cliquez sur l\'onglet "Système"')
  console.log('   4. Observez les mises à jour toutes les 5 secondes')
}

// Exécution
main().catch(console.error) 