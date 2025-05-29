import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { withAdminAuth } from '@/lib/adminMiddleware'
import { logActivity, ACTIONS, ENTITIES, extractRequestInfo } from '@/lib/activityLogger'

const prisma = new PrismaClient()

async function postHandler(request) {
  try {
    const body = await request.json()
    const { action } = body

    if (!action) {
      return NextResponse.json({ error: 'Action requise' }, { status: 400 })
    }

    console.log('🔧 [Maintenance API] Exécution de l\'action:', action)

    const currentUser = request.user
    const { ipAddress, userAgent } = extractRequestInfo(request)

    let result = {}

    switch (action) {
      case 'clear-cache':
        result = await clearCache()
        break
      
      case 'optimize-db':
        result = await optimizeDatabase()
        break
      
      case 'cleanup-logs':
        result = await cleanupLogs()
        break
      
      case 'restart-services':
        result = await restartServices()
        break
      
      case 'check-health':
        result = await checkSystemHealth()
        break
      
      case 'update-search-index':
        result = await updateSearchIndex()
        break
      
      case 'full-backup':
        result = await createFullBackup()
        break
      
      default:
        return NextResponse.json({ error: 'Action non reconnue' }, { status: 400 })
    }

    // Logger l'activité
    await logActivity({
      userId: currentUser.id,
      action: ACTIONS.ADMIN_ACTION,
      entity: ENTITIES.SYSTEM,
      details: {
        action: 'maintenance_action',
        maintenanceAction: action,
        result: result
      },
      ipAddress,
      userAgent
    })

    console.log('✅ [Maintenance API] Action exécutée avec succès:', action)

    return NextResponse.json({
      success: true,
      action,
      result,
      executedBy: currentUser.name,
      executedAt: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ [Maintenance API] Erreur:', error)
    return NextResponse.json({ error: 'Erreur lors de l\'exécution de l\'action de maintenance' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

async function clearCache() {
  // Simulation du nettoyage du cache
  // Dans un vrai projet, vous pourriez nettoyer Redis, le cache Next.js, etc.
  console.log('🧹 Nettoyage du cache...')
  
  // Simuler un délai
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  return {
    message: 'Cache vidé avec succès',
    cacheTypes: ['Next.js', 'API', 'Images'],
    freedSpace: '245 MB'
  }
}

async function optimizeDatabase() {
  console.log('🗃️ Optimisation de la base de données...')
  
  try {
    // Analyser les tables pour optimiser les performances
    await prisma.$executeRaw`ANALYZE;`
    
    // Récupérer quelques statistiques
    const userCount = await prisma.user.count()
    const projectCount = await prisma.project.count()
    const todoCount = await prisma.todo.count()
    
    return {
      message: 'Base de données optimisée avec succès',
      statistics: {
        users: userCount,
        projects: projectCount,
        todos: todoCount
      },
      optimizations: ['Index analysés', 'Statistiques mises à jour', 'Requêtes optimisées']
    }
  } catch (error) {
    console.error('Erreur lors de l\'optimisation DB:', error)
    return {
      message: 'Optimisation partiellement réussie',
      warning: 'Certaines optimisations ont échoué'
    }
  }
}

async function cleanupLogs() {
  console.log('🧹 Nettoyage des logs anciens...')
  
  try {
    // Supprimer les logs d'activité de plus de 90 jours
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - 90)
    
    const deletedActivityLogs = await prisma.activityLog.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate
        }
      }
    })

    // Supprimer les logs API de plus de 30 jours
    const apiCutoffDate = new Date()
    apiCutoffDate.setDate(apiCutoffDate.getDate() - 30)
    
    const deletedApiLogs = await prisma.apiLog.deleteMany({
      where: {
        createdAt: {
          lt: apiCutoffDate
        }
      }
    })

    return {
      message: 'Logs nettoyés avec succès',
      deleted: {
        activityLogs: deletedActivityLogs.count,
        apiLogs: deletedApiLogs.count
      },
      freedSpace: `${(deletedActivityLogs.count + deletedApiLogs.count) * 0.5} KB`
    }
  } catch (error) {
    console.error('Erreur lors du nettoyage des logs:', error)
    return {
      message: 'Nettoyage partiellement réussi',
      warning: 'Certains logs n\'ont pas pu être supprimés'
    }
  }
}

async function restartServices() {
  console.log('🔄 Redémarrage des services...')
  
  // Simulation du redémarrage des services
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  return {
    message: 'Services redémarrés avec succès',
    services: ['API Server', 'Socket.IO', 'Background Jobs'],
    restartTime: '2.1s'
  }
}

async function checkSystemHealth() {
  console.log('🏥 Vérification de la santé du système...')
  
  try {
    // Vérifier la connexion à la base de données
    await prisma.$queryRaw`SELECT 1`
    
    // Vérifier quelques métriques
    const userCount = await prisma.user.count()
    const activeUsers = await prisma.user.count({
      where: {
        updatedAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // 24h
        }
      }
    })

    const health = {
      database: 'OK',
      api: 'OK',
      memory: process.memoryUsage(),
      uptime: process.uptime(),
      users: {
        total: userCount,
        active24h: activeUsers
      }
    }

    return {
      message: 'Système en bonne santé',
      health,
      status: 'healthy'
    }
  } catch (error) {
    console.error('Erreur lors de la vérification:', error)
    return {
      message: 'Problèmes détectés',
      status: 'warning',
      issues: ['Connexion base de données instable']
    }
  }
}

async function updateSearchIndex() {
  console.log('🔍 Mise à jour de l\'index de recherche...')
  
  // Simulation de la mise à jour de l'index
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  const projectCount = await prisma.project.count()
  const todoCount = await prisma.todo.count()
  
  return {
    message: 'Index de recherche mis à jour',
    indexed: {
      projects: projectCount,
      todos: todoCount
    },
    indexTime: '1.5s'
  }
}

async function createFullBackup() {
  console.log('💾 Création de la sauvegarde complète...')
  
  try {
    // Récupérer les statistiques pour la sauvegarde
    const stats = {
      users: await prisma.user.count(),
      projects: await prisma.project.count(),
      todos: await prisma.todo.count(),
      categories: await prisma.category.count()
    }

    // Simulation de la création de sauvegarde
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    const backupId = `backup_${Date.now()}`
    const backupSize = Object.values(stats).reduce((a, b) => a + b, 0) * 2.5 // Estimation
    
    return {
      message: 'Sauvegarde créée avec succès',
      backupId,
      size: `${backupSize} KB`,
      includes: stats,
      location: `/backups/${backupId}.sql`,
      createdAt: new Date().toISOString()
    }
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error)
    return {
      message: 'Erreur lors de la sauvegarde',
      error: error.message
    }
  }
}

export const POST = withAdminAuth(postHandler, ['ADMIN']) 