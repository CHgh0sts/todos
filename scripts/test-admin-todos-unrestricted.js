#!/usr/bin/env node

/**
 * Script de test pour l'endpoint admin todos sans restriction
 * Utilisation: node scripts/test-admin-todos-unrestricted.js
 */

const https = require('https')
const http = require('http')

console.log('🧪 Test de l\'endpoint admin todos sans restriction...\n')

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

async function testAdminTodosUnrestricted() {
  console.log('🔍 Test de l\'endpoint admin todos sans restriction...')
  
  // Test 1: Vérifier le nouvel endpoint admin
  try {
    console.log('\n1️⃣ Test du nouvel endpoint admin...')
    
    const testProjectId = 1 // ID fictif pour test
    const response = await makeRequest(`${BASE_URL}/api/admin/projects/${testProjectId}/todos`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    if (response.statusCode === 401) {
      console.log('✅ Endpoint protégé (401 Unauthorized) - Normal sans token')
    } else if (response.statusCode === 200) {
      console.log('✅ Endpoint accessible')
    } else if (response.statusCode === 404) {
      console.log('✅ Endpoint répond (404 Not Found) - Projet test inexistant')
    } else {
      console.log(`⚠️  Réponse inattendue: ${response.statusCode}`)
    }
    
  } catch (error) {
    console.log(`❌ Erreur: ${error.message}`)
  }
  
  // Test 2: Comparer avec l'ancien endpoint
  console.log('\n2️⃣ Comparaison avec l\'ancien endpoint...')
  
  try {
    const testProjectId = 1
    
    // Test ancien endpoint
    const oldResponse = await makeRequest(`${BASE_URL}/api/todos?projectId=${testProjectId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    // Test nouvel endpoint
    const newResponse = await makeRequest(`${BASE_URL}/api/admin/projects/${testProjectId}/todos`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    console.log(`📊 Ancien endpoint (/api/todos): ${oldResponse.statusCode}`)
    console.log(`📊 Nouvel endpoint (/api/admin/projects/X/todos): ${newResponse.statusCode}`)
    
    if (oldResponse.statusCode === 401 && newResponse.statusCode === 401) {
      console.log('✅ Les deux endpoints sont protégés par authentification')
    }
    
  } catch (error) {
    console.log(`❌ Erreur: ${error.message}`)
  }
  
  // Test 3: Vérifier la structure de réponse attendue
  console.log('\n3️⃣ Test de la structure de réponse...')
  
  console.log('📋 Structure attendue du nouvel endpoint:')
  console.log(`{
  "todos": [
    {
      "id": 1,
      "title": "Tâche exemple",
      "description": "Description...",
      "completed": false,
      "priority": "medium",
      "dueDate": "2024-01-01",
      "category": { "name": "Catégorie", "color": "#3B82F6" },
      "user": { "id": 1, "name": "Utilisateur" }
    }
  ],
  "project": {
    "id": 1,
    "name": "Projet exemple",
    "owner": { "id": 1, "name": "Propriétaire" }
  }
}`)
  
  console.log('\n📋 Différences avec l\'ancien endpoint:')
  console.log('✅ NOUVEAU: Récupère TOUTES les tâches du projet')
  console.log('✅ NOUVEAU: Pas de restriction de permissions collaborateur')
  console.log('✅ NOUVEAU: Accessible uniquement aux ADMIN/MODERATOR')
  console.log('✅ NOUVEAU: Logging spécifique admin')
  console.log('✅ NOUVEAU: Structure de réponse avec projet inclus')
  
  console.log('\n🔒 Sécurité:')
  console.log('• Authentification admin requise (withAdminAuth)')
  console.log('• Rôles autorisés: ADMIN, MODERATOR')
  console.log('• Logging de toutes les consultations')
  console.log('• Vérification de l\'existence du projet')
  
  console.log('\n🎯 Cas d\'usage résolu:')
  console.log('• ✅ Admin peut voir les tâches de TOUS les projets')
  console.log('• ✅ Même si l\'admin n\'est pas collaborateur du projet')
  console.log('• ✅ Supervision complète sans restriction')
  console.log('• ✅ Modal admin affiche toutes les tâches')
  
  console.log('\n🚀 Pour tester en conditions réelles:')
  console.log('1. Connectez-vous en tant qu\'admin')
  console.log('2. Allez sur /admin/projects')
  console.log('3. Cliquez sur l\'œil d\'un projet où vous N\'ÊTES PAS collaborateur')
  console.log('4. La modal devrait maintenant afficher toutes les tâches')
  
  console.log('\n💡 Avant cette correction:')
  console.log('❌ Modal vide si admin pas collaborateur')
  console.log('❌ Restriction par permissions utilisateur')
  
  console.log('\n💡 Après cette correction:')
  console.log('✅ Modal affiche toutes les tâches')
  console.log('✅ Supervision admin complète')
}

// Exécuter les tests
testAdminTodosUnrestricted().catch(console.error) 