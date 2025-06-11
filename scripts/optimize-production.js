#!/usr/bin/env node

/**
 * Script d'optimisation pour la production
 * Utilisation: node scripts/optimize-production.js
 */

const fs = require('fs')
const path = require('path')

console.log('🚀 Optimisation de la configuration pour la production...\n')

function updateDatabaseUrl() {
  console.log('🔗 Optimisation de la configuration Prisma...')
  
  const currentUrl = process.env.DATABASE_URL
  if (!currentUrl) {
    console.log('❌ DATABASE_URL non défini')
    return
  }
  
  try {
    const url = new URL(currentUrl)
    const params = new URLSearchParams(url.search)
    
    // Paramètres optimisés pour la production
    const optimizedParams = {
      'connection_limit': '20',        // Augmenter le pool de connexions
      'pool_timeout': '20',            // Augmenter le timeout
      'connect_timeout': '60',         // Timeout de connexion plus long
      'socket_timeout': '60',          // Timeout de socket plus long
      'sslmode': 'require'             // SSL requis en production
    }
    
    console.log('📊 Configuration actuelle:')
    for (const [key, value] of params.entries()) {
      console.log(`   - ${key}: ${value}`)
    }
    
    console.log('\n📊 Configuration optimisée recommandée:')
    for (const [key, value] of Object.entries(optimizedParams)) {
      console.log(`   - ${key}: ${value}`)
    }
    
    // Construire la nouvelle URL
    for (const [key, value] of Object.entries(optimizedParams)) {
      params.set(key, value)
    }
    
    url.search = params.toString()
    const optimizedUrl = url.toString()
    
    console.log('\n🔧 URL optimisée:')
    console.log(`DATABASE_URL="${optimizedUrl}"`)
    
    console.log('\n💡 Pour appliquer cette configuration:')
    console.log('1. Copiez l\'URL ci-dessus')
    console.log('2. Mettez à jour votre fichier .env ou variables d\'environnement')
    console.log('3. Redémarrez votre application')
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'analyse de DATABASE_URL:', error.message)
  }
}

function generateProductionEnv() {
  console.log('\n🔧 Génération du fichier .env.production...')
  
  const productionEnv = `# Configuration optimisée pour la production
# Généré automatiquement par scripts/optimize-production.js

# Base de données avec pool de connexions optimisé
# DATABASE_URL="postgresql://user:password@host:port/database?connection_limit=20&pool_timeout=20&connect_timeout=60&socket_timeout=60&sslmode=require"

# Sécurité
NODE_ENV=production
JWT_SECRET=your-super-secure-jwt-secret-here
NEXTAUTH_SECRET=your-super-secure-nextauth-secret-here
NEXTAUTH_URL=https://your-domain.com

# Optimisations
NEXT_TELEMETRY_DISABLED=1

# Monitoring et logs
LOG_LEVEL=error
ENABLE_QUERY_LOGGING=false

# Limites de performance
MAX_REQUEST_SIZE=10mb
REQUEST_TIMEOUT=30000

# Cache
CACHE_TTL=30000
ENABLE_MEMORY_CACHE=true

# Socket.IO optimisé
SOCKET_TIMEOUT=60000
SOCKET_PING_TIMEOUT=30000
SOCKET_PING_INTERVAL=25000
`

  const envPath = path.join(process.cwd(), '.env.production.example')
  
  try {
    fs.writeFileSync(envPath, productionEnv)
    console.log(`✅ Fichier créé: ${envPath}`)
    console.log('💡 Copiez ce fichier vers .env.production et adaptez les valeurs')
  } catch (error) {
    console.error('❌ Erreur lors de la création du fichier:', error.message)
  }
}

function generateHealthCheck() {
  console.log('\n🏥 Génération de l\'endpoint de health check...')
  
  const healthCheckCode = `import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    // Vérifier la connexion à la base de données
    await prisma.$queryRaw\`SELECT 1\`
    
    // Vérifier la mémoire
    const memUsage = process.memoryUsage()
    const memUsageMB = Math.round(memUsage.heapUsed / 1024 / 1024)
    
    // Vérifier l'uptime
    const uptime = process.uptime()
    
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: Math.round(uptime),
      memory: {
        used: memUsageMB,
        total: Math.round(memUsage.heapTotal / 1024 / 1024)
      },
      database: 'connected'
    }
    
    return NextResponse.json(health)
  } catch (error) {
    console.error('Health check failed:', error)
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    }, { status: 503 })
  } finally {
    await prisma.$disconnect()
  }
}
`

  const healthDir = path.join(process.cwd(), 'src', 'app', 'api', 'health')
  const healthPath = path.join(healthDir, 'route.js')
  
  try {
    if (!fs.existsSync(healthDir)) {
      fs.mkdirSync(healthDir, { recursive: true })
    }
    fs.writeFileSync(healthPath, healthCheckCode)
    console.log(`✅ Fichier créé: ${healthPath}`)
  } catch (error) {
    console.error('❌ Erreur lors de la création du fichier:', error.message)
  }
}

// Exécuter toutes les optimisations
async function runOptimizations() {
  try {
    updateDatabaseUrl()
    generateProductionEnv()
    generateHealthCheck()
    
    console.log('\n🎉 Optimisation terminée!')
    console.log('\n📋 Fichiers générés:')
    console.log('   - .env.production.example')
    console.log('   - src/app/api/health/route.js')
    
    console.log('\n🚀 Actions recommandées pour résoudre les erreurs 503:')
    console.log('   1. 🔗 Mettez à jour DATABASE_URL avec connection_limit=20')
    console.log('   2. 🔄 Redémarrez votre application en production')
    console.log('   3. 📊 Surveillez /api/health pour vérifier le statut')
    console.log('   4. 🎯 Le cache optimisé réduira la charge sur la DB')
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'optimisation:', error)
    process.exit(1)
  }
}

runOptimizations() 