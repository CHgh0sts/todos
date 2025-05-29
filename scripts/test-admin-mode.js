#!/usr/bin/env node

/**
 * Script de test pour vérifier le mode admin des projets
 */

const http = require('http')

const BASE_URL = 'http://localhost:3000'

// Fonction pour faire une requête HTTP
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(url, options, (res) => {
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

// Test d'accès à un projet en mode normal
async function testNormalMode(projectId) {
  console.log(`\n🔍 Test mode normal pour le projet ${projectId}`)
  
  try {
    const response = await makeRequest(`${BASE_URL}/api/projects/${projectId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    if (response.status === 200) {
      console.log(`✅ Mode normal - Succès`)
      console.log(`   Projet: ${response.data.name}`)
      console.log(`   isAdminMode: ${response.data.isAdminMode}`)
      console.log(`   Permission: ${response.data.permission}`)
      return true
    } else if (response.status === 401) {
      console.log(`⚠️  Mode normal - Non autorisé (authentification requise)`)
      return false
    } else {
      console.log(`❌ Mode normal - Erreur ${response.status}`)
      console.log(`   Réponse: ${JSON.stringify(response.data, null, 2)}`)
      return false
    }
    
  } catch (error) {
    console.log(`❌ Mode normal - Erreur: ${error.message}`)
    return false
  }
}

// Test d'accès à un projet en mode admin
async function testAdminMode(projectId) {
  console.log(`\n🔧 Test mode admin pour le projet ${projectId}`)
  
  try {
    const response = await makeRequest(`${BASE_URL}/api/projects/${projectId}?admin=true`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    if (response.status === 200) {
      console.log(`✅ Mode admin - Succès`)
      console.log(`   Projet: ${response.data.name}`)
      console.log(`   isAdminMode: ${response.data.isAdminMode}`)
      console.log(`   Permission: ${response.data.permission}`)
      console.log(`   Rôle utilisateur: ${response.data.currentUserRole}`)
      return true
    } else if (response.status === 401) {
      console.log(`⚠️  Mode admin - Non autorisé (authentification requise)`)
      return false
    } else if (response.status === 404) {
      console.log(`⚠️  Mode admin - Projet non trouvé ou accès refusé`)
      return false
    } else {
      console.log(`❌ Mode admin - Erreur ${response.status}`)
      console.log(`   Réponse: ${JSON.stringify(response.data, null, 2)}`)
      return false
    }
    
  } catch (error) {
    console.log(`❌ Mode admin - Erreur: ${error.message}`)
    return false
  }
}

// Test de la page frontend
async function testFrontendPage(projectId) {
  console.log(`\n🌐 Test page frontend pour le projet ${projectId}`)
  
  try {
    const response = await makeRequest(`${BASE_URL}/todos/${projectId}?admin=true`, {
      method: 'GET',
      headers: {
        'Accept': 'text/html'
      }
    })
    
    if (response.status === 200) {
      console.log(`✅ Page frontend - Accessible`)
      return true
    } else {
      console.log(`❌ Page frontend - Erreur ${response.status}`)
      return false
    }
    
  } catch (error) {
    console.log(`❌ Page frontend - Erreur: ${error.message}`)
    return false
  }
}

// Fonction principale
async function main() {
  console.log('🚀 Test du mode admin des projets\n')
  console.log('📝 Ce script teste:')
  console.log('   - L\'accès aux projets en mode normal')
  console.log('   - L\'accès aux projets en mode admin')
  console.log('   - L\'accessibilité de la page frontend')
  console.log('   - La gestion des permissions\n')
  
  // ID de projet à tester (vous pouvez le changer)
  const projectId = 1
  
  console.log(`🎯 Test avec le projet ID: ${projectId}`)
  
  // Test mode normal
  const normalSuccess = await testNormalMode(projectId)
  
  // Test mode admin
  const adminSuccess = await testAdminMode(projectId)
  
  // Test page frontend
  const frontendSuccess = await testFrontendPage(projectId)
  
  console.log(`\n📊 Résultats:`)
  console.log(`   Mode normal: ${normalSuccess ? '✅' : '❌'}`)
  console.log(`   Mode admin: ${adminSuccess ? '✅' : '❌'}`)
  console.log(`   Page frontend: ${frontendSuccess ? '✅' : '❌'}`)
  
  if (!normalSuccess && !adminSuccess) {
    console.log('\n⚠️  Aucun test n\'a réussi. Vérifiez:')
    console.log('   - Le serveur est démarré (npm run dev)')
    console.log('   - Vous êtes connecté en tant qu\'administrateur')
    console.log('   - Le projet existe et est accessible')
  } else if (!adminSuccess) {
    console.log('\n⚠️  Le mode admin ne fonctionne pas. Vérifiez:')
    console.log('   - Votre rôle utilisateur (ADMIN ou MODERATOR)')
    console.log('   - L\'authentification')
    console.log('   - Les logs du serveur')
  } else {
    console.log('\n🎉 Le mode admin fonctionne correctement!')
  }
  
  console.log('\n💡 Pour tester avec authentification:')
  console.log('   1. Connectez-vous en tant qu\'administrateur sur http://localhost:3000')
  console.log('   2. Allez sur /admin/projects')
  console.log('   3. Cliquez sur l\'icône "voir" d\'un projet')
  console.log('   4. Vérifiez que la bannière admin s\'affiche')
  
  console.log('\n🔗 URLs de test:')
  console.log(`   Mode normal: ${BASE_URL}/todos/${projectId}`)
  console.log(`   Mode admin: ${BASE_URL}/todos/${projectId}?admin=true`)
  console.log(`   Mode admin + edit: ${BASE_URL}/todos/${projectId}?admin=true&edit=true`)
}

// Exécution
main().catch(console.error) 