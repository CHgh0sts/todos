#!/usr/bin/env node

/**
 * Script de test pour vérifier toutes les actions de maintenance
 */

const https = require('https')
const http = require('http')

const BASE_URL = 'http://localhost:3000'

// Actions de maintenance à tester
const MAINTENANCE_ACTIONS = [
  'clear-cache',
  'optimize-db', 
  'cleanup-logs',
  'restart-services',
  'check-health',
  'update-search-index',
  'full-backup'
]

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

// Test d'une action de maintenance
async function testMaintenanceAction(action) {
  console.log(`\n🔧 Test de l'action: ${action}`)
  
  try {
    const startTime = Date.now()
    
    const response = await makeRequest(`${BASE_URL}/api/admin/maintenance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ action })
    })
    
    const duration = Date.now() - startTime
    
    if (response.status === 200) {
      console.log(`✅ ${action} - Succès (${duration}ms)`)
      console.log(`   Message: ${response.data.result?.message || 'N/A'}`)
      
      // Afficher des détails spécifiques selon l'action
      if (action === 'clear-cache' && response.data.result?.freedSpace) {
        console.log(`   Espace libéré: ${response.data.result.freedSpace}`)
      }
      
      if (action === 'optimize-db' && response.data.result?.statistics) {
        const stats = response.data.result.statistics
        console.log(`   Statistiques: ${stats.users} utilisateurs, ${stats.projects} projets, ${stats.todos} tâches`)
      }
      
      if (action === 'cleanup-logs' && response.data.result?.deleted) {
        const deleted = response.data.result.deleted
        console.log(`   Logs supprimés: ${deleted.activityLogs} activité, ${deleted.apiLogs} API`)
      }
      
      if (action === 'restart-services' && response.data.result?.services) {
        console.log(`   Services redémarrés: ${response.data.result.services.join(', ')}`)
      }
      
      if (action === 'check-health' && response.data.result?.health) {
        const health = response.data.result.health
        console.log(`   État DB: ${health.database}, Utilisateurs actifs: ${health.users?.active24h || 0}`)
      }
      
      if (action === 'update-search-index' && response.data.result?.indexed) {
        const indexed = response.data.result.indexed
        console.log(`   Indexé: ${indexed.projects} projets, ${indexed.todos} tâches`)
      }
      
      if (action === 'full-backup' && response.data.result?.backupId) {
        console.log(`   Sauvegarde: ${response.data.result.backupId} (${response.data.result.size})`)
      }
      
      return true
    } else if (response.status === 401) {
      console.log(`⚠️  ${action} - Non autorisé (authentification requise)`)
      return false
    } else {
      console.log(`❌ ${action} - Erreur ${response.status}`)
      console.log(`   Réponse: ${JSON.stringify(response.data, null, 2)}`)
      return false
    }
    
  } catch (error) {
    console.log(`❌ ${action} - Erreur: ${error.message}`)
    return false
  }
}

// Test de toutes les actions
async function testAllMaintenanceActions() {
  console.log('🧪 Test de toutes les actions de maintenance\n')
  
  let successCount = 0
  let totalCount = MAINTENANCE_ACTIONS.length
  
  for (const action of MAINTENANCE_ACTIONS) {
    const success = await testMaintenanceAction(action)
    if (success) successCount++
    
    // Attendre un peu entre les tests
    await new Promise(resolve => setTimeout(resolve, 500))
  }
  
  console.log(`\n📊 Résultats: ${successCount}/${totalCount} actions réussies`)
  
  if (successCount === 0) {
    console.log('\n⚠️  Aucune action n\'a réussi. Vérifiez:')
    console.log('   - Le serveur est démarré (npm run dev)')
    console.log('   - Vous êtes connecté en tant qu\'administrateur')
    console.log('   - L\'API de maintenance est accessible')
  } else if (successCount < totalCount) {
    console.log('\n⚠️  Certaines actions ont échoué. Vérifiez les logs ci-dessus.')
  } else {
    console.log('\n🎉 Toutes les actions de maintenance fonctionnent parfaitement!')
  }
}

// Test de l'API de maintenance (sans authentification)
async function testMaintenanceAPI() {
  console.log('🌐 Test de l\'accessibilité de l\'API de maintenance...')
  
  try {
    const response = await makeRequest(`${BASE_URL}/api/admin/maintenance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ action: 'test' })
    })
    
    if (response.status === 401) {
      console.log('✅ API accessible (authentification requise comme attendu)')
      return true
    } else if (response.status === 400) {
      console.log('✅ API accessible (action invalide détectée)')
      return true
    } else {
      console.log(`⚠️  Réponse inattendue: ${response.status}`)
      return false
    }
    
  } catch (error) {
    console.log(`❌ API inaccessible: ${error.message}`)
    return false
  }
}

// Fonction principale
async function main() {
  console.log('🚀 Test complet du système de maintenance\n')
  console.log('📝 Ce script teste:')
  console.log('   - L\'accessibilité de l\'API de maintenance')
  console.log('   - Toutes les 7 actions de maintenance disponibles')
  console.log('   - La gestion des erreurs et de l\'authentification\n')
  
  // Test de l'API
  const apiAccessible = await testMaintenanceAPI()
  
  if (!apiAccessible) {
    console.log('\n❌ L\'API de maintenance n\'est pas accessible. Arrêt des tests.')
    return
  }
  
  // Test de toutes les actions
  await testAllMaintenanceActions()
  
  console.log('\n💡 Pour tester avec authentification:')
  console.log('   1. Connectez-vous en tant qu\'administrateur sur http://localhost:3000')
  console.log('   2. Allez sur /admin/settings')
  console.log('   3. Cliquez sur l\'onglet "Maintenance"')
  console.log('   4. Testez chaque bouton individuellement')
  
  console.log('\n📚 Actions disponibles:')
  MAINTENANCE_ACTIONS.forEach((action, index) => {
    const descriptions = {
      'clear-cache': 'Vide le cache système',
      'optimize-db': 'Optimise la base de données',
      'cleanup-logs': 'Supprime les anciens logs',
      'restart-services': 'Redémarre les services',
      'check-health': 'Vérifie la santé du système',
      'update-search-index': 'Met à jour l\'index de recherche',
      'full-backup': 'Crée une sauvegarde complète'
    }
    console.log(`   ${index + 1}. ${action}: ${descriptions[action]}`)
  })
}

// Exécution
main().catch(console.error) 