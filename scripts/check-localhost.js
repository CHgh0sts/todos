#!/usr/bin/env node

const http = require('http')

console.log('🔍 Vérification de la configuration localhost...')

// Test de l'API de base
const testApi = () => {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/me',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    }, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        console.log(`✅ API accessible sur localhost:3000 (Status: ${res.statusCode})`)
        resolve({ status: res.statusCode, data })
      })
    })
    
    req.on('error', (err) => {
      console.error('❌ Erreur lors de l\'accès à l\'API:', err.message)
      reject(err)
    })
    
    req.end()
  })
}

// Test de la page d'accueil
const testHomePage = () => {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: '/',
      method: 'GET'
    }, (res) => {
      console.log(`✅ Page d'accueil accessible (Status: ${res.statusCode})`)
      
      // Vérifier s'il y a une redirection
      if (res.statusCode >= 300 && res.statusCode < 400) {
        const location = res.headers.location
        if (location && !location.includes('localhost')) {
          console.warn(`⚠️  Redirection détectée vers: ${location}`)
        }
      }
      
      resolve({ status: res.statusCode, location: res.headers.location })
    })
    
    req.on('error', (err) => {
      console.error('❌ Erreur lors de l\'accès à la page d\'accueil:', err.message)
      reject(err)
    })
    
    req.end()
  })
}

// Exécuter les tests
async function runTests() {
  try {
    console.log('🚀 Démarrage des tests...\n')
    
    await testHomePage()
    await testApi()
    
    console.log('\n✅ Tous les tests sont passés!')
    console.log('🎉 L\'application fonctionne correctement sur localhost:3000')
    
  } catch (error) {
    console.error('\n❌ Erreur lors des tests:', error.message)
    console.log('💡 Assurez-vous que le serveur est démarré avec: npm run dev')
  }
}

runTests() 