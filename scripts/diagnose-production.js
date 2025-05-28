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
console.log('- DATABASE_URL:', process.env.DATABASE_URL ? '✅ défini' : '❌ manquant')
console.log('- JWT_SECRET:', process.env.JWT_SECRET ? '✅ défini' : '❌ manquant')
console.log('- NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET ? '✅ défini' : '❌ manquant')
console.log('- NEXTAUTH_URL:', process.env.NEXTAUTH_URL || 'non défini')
console.log('')

// Tester la connexion à la base de données
async function testDatabase() {
  console.log('🔍 Test de connexion à la base de données...')
  
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

// Vérifier les permissions de fichiers
function checkFilePermissions() {
  console.log('\n🔍 Vérification des permissions...')
  
  const fs = require('fs')
  const path = require('path')
  
  try {
    // Vérifier le répertoire .next
    const nextDir = path.join(process.cwd(), '.next')
    if (fs.existsSync(nextDir)) {
      console.log('✅ Répertoire .next existe')
      const stats = fs.statSync(nextDir)
      console.log('✅ Permissions .next:', stats.mode.toString(8))
    } else {
      console.log('⚠️  Répertoire .next n\'existe pas (normal en développement)')
    }
    
    // Vérifier le répertoire prisma
    const prismaDir = path.join(process.cwd(), 'prisma')
    if (fs.existsSync(prismaDir)) {
      console.log('✅ Répertoire prisma existe')
    } else {
      console.log('❌ Répertoire prisma manquant')
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification des permissions:', error.message)
  }
}

// Tester les en-têtes HTTP
function testHeaders() {
  console.log('\n🔍 Configuration des en-têtes...')
  
  // Simuler une requête avec token
  const testToken = 'Bearer test-token-123'
  console.log('✅ Format d\'en-tête Authorization testé:', testToken.startsWith('Bearer '))
}

// Exécuter tous les tests
async function runDiagnostics() {
  try {
    await testDatabase()
    testJWT()
    checkFilePermissions()
    testHeaders()
    
    console.log('\n🎉 Diagnostic terminé!')
    console.log('\n💡 Si vous voyez des erreurs:')
    console.log('   1. Vérifiez que toutes les variables d\'environnement sont définies')
    console.log('   2. Vérifiez la connexion à la base de données')
    console.log('   3. Vérifiez que Prisma est correctement configuré')
    console.log('   4. Redémarrez l\'application après les corrections')
    
  } catch (error) {
    console.error('❌ Erreur lors du diagnostic:', error)
    process.exit(1)
  }
}

runDiagnostics() 