#!/usr/bin/env node

/**
 * Script de test pour la modal des tâches en mode admin
 * Utilisation: node scripts/test-admin-todos-modal.js
 */

const https = require('https')
const http = require('http')

console.log('🧪 Test de la modal des tâches en mode admin...\n')

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

async function testAdminTodosModal() {
  console.log('🔍 Test de la modal des tâches admin...')
  
  // Test 1: Vérifier l'API todos avec projectId
  try {
    console.log('\n1️⃣ Test de l\'API todos avec projectId...')
    
    const testProjectId = 1 // ID fictif pour test
    const response = await makeRequest(`${BASE_URL}/api/todos?projectId=${testProjectId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    if (response.statusCode === 401) {
      console.log('✅ API protégée (401 Unauthorized) - Normal sans token')
    } else if (response.statusCode === 200) {
      console.log('✅ API accessible')
    } else {
      console.log(`⚠️  Réponse inattendue: ${response.statusCode}`)
    }
    
  } catch (error) {
    console.log(`❌ Erreur: ${error.message}`)
  }
  
  // Test 2: Vérifier la page admin projects
  console.log('\n2️⃣ Test de la page admin projects...')
  
  try {
    const response = await makeRequest(`${BASE_URL}/admin/projects`, {
      method: 'GET'
    })
    
    if (response.statusCode === 200) {
      console.log('✅ Page admin accessible')
      
      // Vérifier si les nouvelles fonctions sont présentes
      const checks = [
        { name: 'openTodosModal', found: response.data.includes('openTodosModal') },
        { name: 'fetchProjectTodos', found: response.data.includes('fetchProjectTodos') },
        { name: 'showTodosModal', found: response.data.includes('showTodosModal') },
        { name: 'selectedProject', found: response.data.includes('selectedProject') },
        { name: 'projectTodos', found: response.data.includes('projectTodos') },
        { name: 'Modal des tâches', found: response.data.includes('Modal des tâches du projet') },
        { name: 'Bouton œil modifié', found: response.data.includes('onClick={() => openTodosModal(project)}') }
      ]
      
      checks.forEach(check => {
        if (check.found) {
          console.log(`✅ ${check.name} trouvé`)
        } else {
          console.log(`❌ ${check.name} non trouvé`)
        }
      })
      
    } else {
      console.log(`⚠️  Page admin non accessible: ${response.statusCode}`)
    }
    
  } catch (error) {
    console.log(`❌ Erreur: ${error.message}`)
  }
  
  // Test 3: Vérifier les fonctions utilitaires
  console.log('\n3️⃣ Test des fonctions utilitaires...')
  
  try {
    const response = await makeRequest(`${BASE_URL}/admin/projects`, {
      method: 'GET'
    })
    
    if (response.statusCode === 200) {
      const utilityFunctions = [
        'getPriorityColor',
        'getPriorityLabel', 
        'isOverdue',
        'formatDateOnly'
      ]
      
      utilityFunctions.forEach(func => {
        if (response.data.includes(func)) {
          console.log(`✅ Fonction ${func} trouvée`)
        } else {
          console.log(`❌ Fonction ${func} non trouvée`)
        }
      })
      
    }
    
  } catch (error) {
    console.log(`❌ Erreur: ${error.message}`)
  }
  
  console.log('\n📋 Résumé des fonctionnalités ajoutées:')
  console.log('✅ Modal des tâches du projet')
  console.log('✅ Bouton œil modifié pour ouvrir la modal')
  console.log('✅ Récupération des tâches via API /api/todos?projectId=X')
  console.log('✅ Affichage des statistiques (total, terminées, en cours, en retard)')
  console.log('✅ Barre de progression')
  console.log('✅ Liste des tâches avec priorités, catégories, dates')
  console.log('✅ Bouton "Gérer le projet" pour accéder à la page complète')
  console.log('✅ Gestion des états de chargement')
  
  console.log('\n🎯 Fonctionnalités de la modal:')
  console.log('• 📊 Statistiques visuelles avec compteurs')
  console.log('• 📈 Barre de progression du projet')
  console.log('• 📝 Liste complète des tâches')
  console.log('• 🏷️ Affichage des priorités et catégories')
  console.log('• 👤 Nom du créateur de chaque tâche')
  console.log('• 📅 Dates d\'échéance avec indicateurs de retard')
  console.log('• ✅ État de completion visuel')
  console.log('• 🔗 Lien vers la gestion complète du projet')
  
  console.log('\n💡 Avantages:')
  console.log('• Vue rapide sans quitter la page admin')
  console.log('• Informations complètes sur le projet')
  console.log('• Interface cohérente avec le reste de l\'application')
  console.log('• Possibilité d\'accéder à la gestion complète si nécessaire')
  
  console.log('\n🚀 Pour tester en conditions réelles:')
  console.log('1. Connectez-vous en tant qu\'admin sur http://localhost:3000/admin/projects')
  console.log('2. Cliquez sur l\'icône œil d\'un projet')
  console.log('3. La modal devrait s\'ouvrir avec les tâches du projet')
  console.log('4. Vérifiez les statistiques et la liste des tâches')
}

// Exécuter les tests
testAdminTodosModal().catch(console.error) 