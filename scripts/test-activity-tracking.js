#!/usr/bin/env node

/**
 * Script de test pour le système de tracking d'activité utilisateur
 */

const { PrismaClient } = require('@prisma/client')
const { logUserActivity, logNavigation, logCreate, logEdit, logDelete, ACTIVITY_TYPES } = require('../src/lib/userActivityLogger')

const prisma = new PrismaClient()

async function testActivityTracking() {
  console.log('🧪 Test du système de tracking d\'activité utilisateur\n')

  try {
    // Vérifier la connexion à la base de données
    await prisma.$connect()
    console.log('✅ Connexion à la base de données établie')

    // Récupérer un utilisateur de test
    const testUser = await prisma.user.findFirst()

    if (!testUser) {
      console.log('❌ Aucun utilisateur trouvé pour les tests')
      return
    }

    console.log(`👤 Utilisateur de test: ${testUser.name} (ID: ${testUser.id})`)

    // Test 1: Navigation
    console.log('\n📍 Test 1: Tracking de navigation')
    await logNavigation(testUser.id, 'Page de test', '127.0.0.1', 'Test User Agent')
    console.log('✅ Navigation trackée')

    // Test 2: Création
    console.log('\n📍 Test 2: Tracking de création')
    await logCreate(testUser.id, 'projet', 'Projet de test', 999, '127.0.0.1', 'Test User Agent')
    console.log('✅ Création trackée')

    // Test 3: Modification
    console.log('\n📍 Test 3: Tracking de modification')
    await logEdit(testUser.id, 'tâche', 'Tâche de test', 888, { status: 'completed' }, '127.0.0.1', 'Test User Agent')
    console.log('✅ Modification trackée')

    // Test 4: Suppression
    console.log('\n📍 Test 4: Tracking de suppression')
    await logDelete(testUser.id, 'catégorie', 'Catégorie de test', 777, '127.0.0.1', 'Test User Agent')
    console.log('✅ Suppression trackée')

    // Test 5: Activité générique
    console.log('\n📍 Test 5: Tracking d\'activité générique')
    await logUserActivity({
      userId: testUser.id,
      action: ACTIVITY_TYPES.NAVIGATION,
      details: {
        page: 'Test générique',
        custom: 'données personnalisées'
      },
      ipAddress: '127.0.0.1',
      userAgent: 'Test User Agent'
    })
    console.log('✅ Activité générique trackée')

    // Vérifier les données enregistrées
    console.log('\n📊 Vérification des données enregistrées:')
    
    const activities = await prisma.userActivity.findMany({
      where: {
        userId: testUser.id,
        createdAt: {
          gte: new Date(Date.now() - 60000) // Dernière minute
        }
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log(`📈 ${activities.length} activités trouvées:`)
    activities.forEach((activity, index) => {
      console.log(`  ${index + 1}. ${activity.action} - ${JSON.stringify(activity.details)} (${activity.createdAt.toLocaleString()})`)
    })

    // Statistiques par type d'action
    console.log('\n📊 Statistiques par type d\'action:')
    const stats = await prisma.userActivity.groupBy({
      by: ['action'],
      _count: {
        action: true
      },
      where: {
        userId: testUser.id,
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Dernières 24h
        }
      }
    })

    stats.forEach(stat => {
      console.log(`  ${stat.action}: ${stat._count.action} activités`)
    })

    console.log('\n✅ Tests terminés avec succès!')

  } catch (error) {
    console.error('❌ Erreur lors des tests:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Fonction pour nettoyer les données de test
async function cleanupTestData() {
  console.log('\n🧹 Nettoyage des données de test...')
  
  try {
    await prisma.$connect()
    
    const deleted = await prisma.userActivity.deleteMany({
      where: {
        details: {
          path: ['page'],
          equals: 'Page de test'
        }
      }
    })

    console.log(`🗑️ ${deleted.count} activités de test supprimées`)
    
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Fonction pour afficher les statistiques globales
async function showGlobalStats() {
  console.log('\n📊 Statistiques globales du système:')
  
  try {
    await prisma.$connect()
    
    const totalActivities = await prisma.userActivity.count()
    console.log(`📈 Total des activités: ${totalActivities}`)
    
    const last24h = await prisma.userActivity.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      }
    })
    console.log(`🕐 Activités des dernières 24h: ${last24h}`)
    
    const actionStats = await prisma.userActivity.groupBy({
      by: ['action'],
      _count: {
        action: true
      }
    })
    
    console.log('\n📊 Répartition par type d\'action:')
    actionStats.forEach(stat => {
      console.log(`  ${stat.action}: ${stat._count.action}`)
    })
    
    const activeUsers = await prisma.userActivity.groupBy({
      by: ['userId'],
      _count: {
        userId: true
      },
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      }
    })
    
    console.log(`\n👥 Utilisateurs actifs (24h): ${activeUsers.length}`)
    
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des statistiques:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Exécution du script
async function main() {
  const args = process.argv.slice(2)
  
  if (args.includes('--cleanup')) {
    await cleanupTestData()
  } else if (args.includes('--stats')) {
    await showGlobalStats()
  } else {
    await testActivityTracking()
  }
}

main().catch(console.error) 