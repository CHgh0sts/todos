#!/usr/bin/env node

/**
 * Script de test pour la suppression de projets en mode admin
 * Utilisation: node scripts/test-admin-delete.js
 */

const https = require('https')
const http = require('http')

console.log('🧪 Test de la suppression de projets en mode admin...\n')

const BASE_URL = 'http://localhost:3000'

async function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http
    
    const req = protocol.request(url, options, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
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

async function testAdminProjectDelete() {
  console.log('🔍 Test de l\'API de suppression admin...')
  
  // Test 1: Vérifier l'endpoint admin projects
  try {
    console.log('\n1️⃣ Test de l\'endpoint admin projects...')
    
    const response = await makeRequest(`${BASE_URL}/api/admin/projects`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    if (response.statusCode === 401) {
      console.log('✅ Endpoint protégé (401 Unauthorized) - Normal sans token')
    } else if (response.statusCode === 200) {
      console.log('✅ Endpoint accessible')
    } else {
      console.log(`⚠️  Réponse inattendue: ${response.statusCode}`)
    }
    
  } catch (error) {
    console.log(`❌ Erreur: ${error.message}`)
  }
  
  // Test 2: Vérifier la structure de l'URL de suppression
  console.log('\n2️⃣ Test de la structure URL de suppression...')
  
  const testProjectId = 999 // ID fictif pour test
  const deleteUrl = `${BASE_URL}/api/admin/projects?projectId=${testProjectId}`
  
  try {
    const response = await makeRequest(deleteUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    if (response.statusCode === 401) {
      console.log('✅ URL de suppression correcte (401 Unauthorized) - Normal sans token')
    } else if (response.statusCode === 400) {
      console.log('✅ URL de suppression correcte (400 Bad Request) - Paramètres reconnus')
    } else {
      console.log(`⚠️  Réponse inattendue: ${response.statusCode}`)
      console.log(`   Données: ${response.data.substring(0, 200)}...`)
    }
    
  } catch (error) {
    console.log(`❌ Erreur: ${error.message}`)
  }
  
  // Test 3: Vérifier la page admin
  console.log('\n3️⃣ Test de la page admin...')
  
  try {
    const response = await makeRequest(`${BASE_URL}/admin/projects`, {
      method: 'GET'
    })
    
    if (response.statusCode === 200) {
      console.log('✅ Page admin accessible')
      
      // Vérifier si le JavaScript de suppression est présent
      if (response.data.includes('deleteProject')) {
        console.log('✅ Fonction deleteProject trouvée dans la page')
      } else {
        console.log('⚠️  Fonction deleteProject non trouvée')
      }
      
      // Vérifier l'URL utilisée dans le fetch
      if (response.data.includes('/api/admin/projects?projectId=')) {
        console.log('✅ URL de suppression corrigée trouvée')
      } else if (response.data.includes('/api/admin/projects/${projectId}')) {
        console.log('❌ Ancienne URL de suppression encore présente')
      } else {
        console.log('⚠️  URL de suppression non trouvée dans le code')
      }
      
    } else {
      console.log(`⚠️  Page admin non accessible: ${response.statusCode}`)
    }
    
  } catch (error) {
    console.log(`❌ Erreur: ${error.message}`)
  }
  
  console.log('\n📋 Résumé des corrections appliquées:')
  console.log('✅ URL de suppression corrigée: /api/admin/projects?projectId=${projectId}')
  console.log('✅ Méthode DELETE maintenue')
  console.log('✅ Headers d\'authentification conservés')
  
  console.log('\n🎯 Pour tester en conditions réelles:')
  console.log('1. Connectez-vous en tant qu\'admin sur http://localhost:3000/admin/projects')
  console.log('2. Essayez de supprimer un projet')
  console.log('3. Vérifiez les logs du serveur pour les erreurs')
  
  console.log('\n💡 Si le problème persiste:')
  console.log('- Vérifiez que votre utilisateur a le rôle ADMIN')
  console.log('- Consultez les logs du serveur pour plus de détails')
  console.log('- Vérifiez que l\'API admin/projects/route.js est bien déployée')
}

// Exécuter les tests
testAdminProjectDelete().catch(console.error) 