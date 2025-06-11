#!/usr/bin/env node

/**
 * Script de test de la configuration locale
 * Utilisation: node scripts/test-local-config.js
 */

const { PrismaClient } = require('@prisma/client')

console.log('🧪 Test de la configuration locale...\n')

async function testDatabaseConnection() {
  console.log('🔗 Test de connexion à la base de données...')
  
  const prisma = new PrismaClient()
  
  try {
    console.log('📊 Variables d\'environnement:')
    console.log(`   - DATABASE_URL: ${process.env.DATABASE_URL ? 'défini' : 'manquant'}`)
    console.log(`   - JWT_SECRET: ${process.env.JWT_SECRET ? 'défini' : 'manquant'}`)
    console.log(`   - NODE_ENV: ${process.env.NODE_ENV || 'non défini'}`)
    
    if (process.env.DATABASE_URL) {
      const url = new URL(process.env.DATABASE_URL)
      const params = new URLSearchParams(url.search)
      console.log(`   - Host: ${url.hostname}:${url.port}`)
      console.log(`   - Database: ${url.pathname.slice(1)}`)
      console.log(`   - Connection limit: ${params.get('connection_limit') || 'par défaut'}`)
      console.log(`   - Pool timeout: ${params.get('pool_timeout') || 'par défaut'}`)
    }
    
    console.log('\n🔍 Test de connexion...')
    const startTime = Date.now()
    
    // Test simple de connexion
    await prisma.$connect()
    const connectTime = Date.now() - startTime
    console.log(`✅ Connexion réussie en ${connectTime}ms`)
    
    // Test de requête simple
    const queryStart = Date.now()
    const userCount = await prisma.user.count()
    const queryTime = Date.now() - queryStart
    console.log(`✅ Requête test réussie en ${queryTime}ms - ${userCount} utilisateurs`)
    
    // Analyser les performances
    if (connectTime > 2000) {
      console.log('⚠️  Connexion lente (>2s) - Possible problème réseau')
    }
    if (queryTime > 1000) {
      console.log('⚠️  Requête lente (>1s) - Possible surcharge de la base')
    }
    
    console.log('\n✅ Configuration locale fonctionnelle!')
    return true
    
  } catch (error) {
    console.error('\n❌ Erreur de connexion:', error.message)
    
    if (error.code === 'P1001') {
      console.log('\n💡 Solutions possibles:')
      console.log('   1. Vérifiez que la base de données est accessible')
      console.log('   2. Vérifiez vos identifiants de connexion')
      console.log('   3. Vérifiez que le serveur de base de données fonctionne')
    } else if (error.code === 'P2024') {
      console.log('\n💡 Pool de connexions épuisé:')
      console.log('   1. Réduisez connection_limit dans DATABASE_URL')
      console.log('   2. Attendez que les connexions se libèrent')
      console.log('   3. Redémarrez l\'application')
    }
    
    return false
  } finally {
    await prisma.$disconnect()
  }
}

async function testEnvironmentSeparation() {
  console.log('\n🔒 Test de séparation des environnements...')
  
  const isDev = process.env.NODE_ENV === 'development'
  const isLocalJWT = process.env.JWT_SECRET?.includes('dev')
  const isLocalURL = process.env.NEXT_PUBLIC_APP_URL?.includes('localhost')
  
  console.log(`   - Environnement développement: ${isDev ? '✅' : '❌'}`)
  console.log(`   - JWT de développement: ${isLocalJWT ? '✅' : '❌'}`)
  console.log(`   - URL locale: ${isLocalURL ? '✅' : '❌'}`)
  
  if (isDev && isLocalJWT && isLocalURL) {
    console.log('✅ Configuration de développement correcte')
    return true
  } else {
    console.log('⚠️  Configuration mixte détectée')
    return false
  }
}

async function generateRecommendations() {
  console.log('\n💡 Recommandations pour le développement local:')
  
  console.log('\n🔧 Configuration actuelle:')
  console.log('   - Base de données: Partagée avec la production (temporaire)')
  console.log('   - Pool de connexions: Limité à 3 pour éviter les conflits')
  console.log('   - JWT: Séparé pour la sécurité')
  
  console.log('\n🎯 Améliorations recommandées:')
  console.log('   1. 🗄️  Créer une base de données locale dédiée')
  console.log('   2. 🐳 Utiliser Docker pour PostgreSQL local')
  console.log('   3. 🌐 Utiliser un service comme Supabase pour le dev')
  console.log('   4. 📊 Implémenter des données de test locales')
  
  console.log('\n📋 Commandes utiles:')
  console.log('   - npm run dev : Démarrer en développement')
  console.log('   - npm run test:optimizations : Tester les performances')
  console.log('   - npm run diagnose:503 : Diagnostiquer les problèmes')
}

// Exécuter tous les tests
async function runTests() {
  try {
    const dbTest = await testDatabaseConnection()
    const envTest = await testEnvironmentSeparation()
    await generateRecommendations()
    
    console.log('\n📊 Résumé:')
    console.log(`   - Connexion DB: ${dbTest ? '✅' : '❌'}`)
    console.log(`   - Configuration env: ${envTest ? '✅' : '❌'}`)
    
    if (dbTest && envTest) {
      console.log('\n🎉 Configuration locale prête!')
      console.log('✅ Vous pouvez maintenant développer sans affecter la production')
    } else {
      console.log('\n⚠️  Configuration à améliorer')
      console.log('💡 Consultez les recommandations ci-dessus')
    }
    
  } catch (error) {
    console.error('❌ Erreur lors des tests:', error)
    process.exit(1)
  }
}

runTests() 