#!/usr/bin/env node

/**
 * Script de test pour vérifier le comportement des cookies
 * Utilisation: node scripts/test-cookies.js
 */

console.log('🍪 Test de gestion des cookies...\n')

// Simuler js-cookie pour les tests
const mockCookies = {
  storage: new Map(),
  
  set(name, value, options = {}) {
    console.log(`📝 Définition du cookie "${name}":`)
    console.log(`   Valeur: ${value.substring(0, 20)}...`)
    console.log(`   Options:`, JSON.stringify(options, null, 2))
    
    this.storage.set(name, { value, options })
    return true
  },
  
  get(name) {
    const cookie = this.storage.get(name)
    if (cookie) {
      console.log(`📖 Lecture du cookie "${name}": ${cookie.value.substring(0, 20)}...`)
      return cookie.value
    }
    console.log(`❌ Cookie "${name}" non trouvé`)
    return undefined
  },
  
  remove(name, options = {}) {
    console.log(`🗑️ Suppression du cookie "${name}":`)
    console.log(`   Options:`, JSON.stringify(options, null, 2))
    
    const existed = this.storage.has(name)
    this.storage.delete(name)
    
    if (existed) {
      console.log(`   ✅ Cookie supprimé avec succès`)
    } else {
      console.log(`   ⚠️ Cookie n'existait pas`)
    }
    
    return existed
  }
}

// Simuler différents environnements
function testEnvironment(env) {
  console.log(`\n🌍 Test pour l'environnement: ${env.name}`)
  console.log(`   Hostname: ${env.hostname}`)
  console.log(`   Protocol: ${env.protocol}`)
  console.log(`   NODE_ENV: ${env.nodeEnv}`)
  
  // Simuler window.location
  const mockWindow = {
    location: {
      hostname: env.hostname,
      protocol: env.protocol
    }
  }
  
  // Logique de configuration des cookies (copiée du code réel)
  const isProduction = env.nodeEnv === 'production'
  const isHttps = mockWindow.location.protocol === 'https:'
  
  const cookieOptions = {
    expires: 7,
    secure: isHttps,
    sameSite: 'lax',
    path: '/',
  }
  
  if (isProduction && mockWindow.location.hostname !== 'localhost') {
    if (mockWindow.location.hostname.includes('.')) {
      const parts = mockWindow.location.hostname.split('.')
      if (parts.length >= 2) {
        cookieOptions.domain = `.${parts.slice(-2).join('.')}`
      }
    }
  }
  
  // Test de connexion
  console.log('\n   🔐 Simulation de connexion...')
  const fakeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImlhdCI6MTczMzkyNzU1MywiZXhwIjoxNzM0NTMyMzUzfQ.fake'
  mockCookies.set('token', fakeToken, cookieOptions)
  
  // Test de lecture
  console.log('\n   📖 Simulation de vérification...')
  const retrievedToken = mockCookies.get('token')
  
  if (retrievedToken) {
    console.log('   ✅ Token récupéré avec succès')
  } else {
    console.log('   ❌ Échec de récupération du token')
  }
  
  // Test de déconnexion
  console.log('\n   🚪 Simulation de déconnexion...')
  const logoutOptions = { path: '/' }
  
  if (isProduction && mockWindow.location.hostname !== 'localhost') {
    if (mockWindow.location.hostname.includes('.')) {
      const parts = mockWindow.location.hostname.split('.')
      if (parts.length >= 2) {
        logoutOptions.domain = `.${parts.slice(-2).join('.')}`
      }
    }
  }
  
  mockCookies.remove('token', logoutOptions)
  
  // Vérifier que le cookie a été supprimé
  console.log('\n   🔍 Vérification de suppression...')
  const tokenAfterLogout = mockCookies.get('token')
  
  if (!tokenAfterLogout) {
    console.log('   ✅ Cookie correctement supprimé')
  } else {
    console.log('   ❌ Cookie toujours présent après suppression')
  }
}

// Environnements de test
const environments = [
  {
    name: 'Développement Local',
    hostname: 'localhost',
    protocol: 'http:',
    nodeEnv: 'development'
  },
  {
    name: 'Production Principal',
    hostname: 'todo.chghosts.fr',
    protocol: 'https:',
    nodeEnv: 'production'
  },
  {
    name: 'Production avec WWW',
    hostname: 'www.todo.chghosts.fr',
    protocol: 'https:',
    nodeEnv: 'production'
  },
  {
    name: 'Sous-domaine',
    hostname: 'app.todo.chghosts.fr',
    protocol: 'https:',
    nodeEnv: 'production'
  }
]

// Exécuter les tests
environments.forEach(env => {
  testEnvironment(env)
})

console.log('\n🎉 Tests de cookies terminés!')
console.log('\n💡 Points clés à retenir:')
console.log('   - En développement: pas de domaine spécifié, HTTP autorisé')
console.log('   - En production: domaine .chghosts.fr, HTTPS requis')
console.log('   - Suppression: mêmes options que création')
console.log('   - Path: toujours "/" pour disponibilité globale') 