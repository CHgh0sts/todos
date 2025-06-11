#!/usr/bin/env node

/**
 * Script de diagnostic pour vérifier la configuration en production
 * Utilisation: node scripts/diagnose-production.js
 */

const { PrismaClient } = require('@prisma/client')
const jwt = require('jsonwebtoken')

console.log('🔍 Diagnostic de la configuration de production...\n')

// Vérifier les variables d'environnement
console.log('📋 Variables d\'environnement:')
console.log('- NODE_ENV:', process.env.NODE_ENV || 'non défini')
console.log('- JWT_SECRET:', process.env.JWT_SECRET ? '✅ défini' : '❌ manquant')
console.log('- NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET ? '✅ défini' : '❌ manquant')
console.log('- NEXTAUTH_URL:', process.env.NEXTAUTH_URL || 'non défini')
console.log('- DATABASE_URL:', process.env.DATABASE_URL ? '✅ défini' : '❌ manquant')
console.log('- NEXT_PUBLIC_APP_URL:', process.env.NEXT_PUBLIC_APP_URL || 'non défini')

// Tester la connexion à la base de données
async function testDatabase() {
  console.log('\n🔍 Test de connexion à la base de données...')
  
  const prisma = new PrismaClient()
  
  try {
    await prisma.$connect()
    console.log('✅ Connexion à la base de données réussie')
    
    // Tester une requête simple
    const userCount = await prisma.user.count()
    console.log(`✅ Nombre d'utilisateurs dans la base: ${userCount}`)
    
    // Tester la table des projets
    const projectCount = await prisma.project.count()
    console.log(`✅ Nombre de projets dans la base: ${projectCount}`)
    
    // Tester un utilisateur spécifique pour l'authentification
    if (userCount > 0) {
      const testUser = await prisma.user.findFirst({
        select: { id: true, email: true, name: true, isVerified: true }
      })
      console.log(`✅ Utilisateur de test trouvé: ${testUser.email} (vérifié: ${testUser.isVerified})`)
    }
    
  } catch (error) {
    console.error('❌ Erreur de connexion à la base de données:', error.message)
    console.error('   Code d\'erreur:', error.code)
    console.error('   Détails:', error.meta)
  } finally {
    await prisma.$disconnect()
  }
}

// Tester la génération de JWT
function testJWT() {
  console.log('\n🔍 Test de génération JWT...')
  
  if (!process.env.JWT_SECRET) {
    console.error('❌ JWT_SECRET manquant')
    return
  }
  
  try {
    const testPayload = { userId: 'test-user-id', exp: Math.floor(Date.now() / 1000) + 3600 }
    const token = jwt.sign(testPayload, process.env.JWT_SECRET)
    console.log('✅ Génération JWT réussie, longueur du token:', token.length)
    
    // Tester la vérification
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    console.log('✅ Vérification JWT réussie, userId:', decoded.userId)
    
  } catch (error) {
    console.error('❌ Erreur JWT:', error.message)
  }
}

// Vérifier les permissions des fichiers
function checkFilePermissions() {
  console.log('\n🔍 Vérification des permissions de fichiers...')
  
  const fs = require('fs')
  const path = require('path')
  
  const filesToCheck = [
    '.next',
    'prisma',
    'package.json',
    'next.config.js'
  ]
  
  filesToCheck.forEach(file => {
    try {
      const stats = fs.statSync(file)
      console.log(`✅ ${file}: accessible (${stats.isDirectory() ? 'dossier' : 'fichier'})`)
    } catch (error) {
      console.error(`❌ ${file}: ${error.message}`)
    }
  })
}

// Tester les en-têtes HTTP
function testHeaders() {
  console.log('\n🔍 Configuration des en-têtes...')
  
  // Simuler une requête avec token
  const testToken = 'Bearer test-token-123'
  console.log('✅ Format d\'en-tête Authorization testé:', testToken.startsWith('Bearer '))
}

// Tester la configuration des cookies
function testCookieConfiguration() {
  console.log('\n🔍 Test de configuration des cookies...')
  
  // Simuler différents environnements
  const environments = [
    { hostname: 'localhost', protocol: 'http:', env: 'development' },
    { hostname: 'todo.chghosts.fr', protocol: 'https:', env: 'production' },
    { hostname: 'www.todo.chghosts.fr', protocol: 'https:', env: 'production' }
  ]
  
  environments.forEach(env => {
    console.log(`\n📍 Test pour ${env.hostname} (${env.protocol})`)
    
    const isProduction = env.env === 'production'
    const isHttps = env.protocol === 'https:'
    
    const cookieOptions = {
      expires: 7,
      secure: isHttps,
      sameSite: 'lax',
      path: '/',
    }
    
    if (isProduction && env.hostname !== 'localhost') {
      if (env.hostname.includes('.')) {
        const parts = env.hostname.split('.')
        if (parts.length >= 2) {
          cookieOptions.domain = `.${parts.slice(-2).join('.')}`
        }
      }
    }
    
    console.log('   Options de cookie calculées:', JSON.stringify(cookieOptions, null, 2))
  })
}

// Tester la configuration réseau
function testNetworkConfiguration() {
  console.log('\n🔍 Test de configuration réseau...')
  
  const allowedOrigins = [
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
    'https://todo.chghosts.fr',
    'https://www.todo.chghosts.fr'
  ].filter(Boolean)
  
  console.log('✅ Origines CORS autorisées:')
  allowedOrigins.forEach(origin => {
    console.log(`   - ${origin}`)
  })
  
  if (allowedOrigins.length === 0) {
    console.error('❌ Aucune origine CORS configurée!')
  }
}

// Exécuter tous les tests
async function runDiagnostics() {
  try {
    await testDatabase()
    testJWT()
    checkFilePermissions()
    testHeaders()
    testCookieConfiguration()
    testNetworkConfiguration()
    
    console.log('\n🎉 Diagnostic terminé!')
    console.log('\n💡 Si vous voyez des erreurs:')
    console.log('   1. Vérifiez que toutes les variables d\'environnement sont définies')
    console.log('   2. Vérifiez la connexion à la base de données')
    console.log('   3. Vérifiez que Prisma est correctement configuré')
    console.log('   4. Vérifiez la configuration des cookies en production')
    console.log('   5. Redémarrez l\'application après les corrections')
    
    console.log('\n🔧 Commandes utiles:')
    console.log('   - Régénérer Prisma: npx prisma generate')
    console.log('   - Appliquer migrations: npx prisma migrate deploy')
    console.log('   - Nettoyer le cache: rm -rf .next && npm run build')
    
  } catch (error) {
    console.error('❌ Erreur lors du diagnostic:', error)
    process.exit(1)
  }
}

runDiagnostics() 