#!/usr/bin/env node

/**
 * Script de test pour créer une todo et vérifier le tracking
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testTodoCreation() {
  console.log('🧪 Test de création de todo avec tracking\n')

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

    // Récupérer un projet de test
    const testProject = await prisma.project.findFirst({
      where: {
        userId: testUser.id
      }
    })

    if (!testProject) {
      console.log('❌ Aucun projet trouvé pour les tests')
      return
    }

    console.log(`👤 Utilisateur de test: ${testUser.name} (ID: ${testUser.id})`)
    console.log(`📁 Projet de test: ${testProject.name} (ID: ${testProject.id})`)

    // Simuler la création d'une todo via l'API
    const todoData = {
      title: `Todo de test - ${new Date().toLocaleTimeString()}`,
      description: 'Description de test pour vérifier le tracking',
      projectId: testProject.id,
      priority: 'high'
    }

    console.log('\n📝 Création de la todo...')
    
    // Créer la todo directement en base pour simuler l'API
    const newTodo = await prisma.todo.create({
      data: {
        title: todoData.title,
        description: todoData.description,
        projectId: todoData.projectId,
        priority: todoData.priority,
        userId: testUser.id
      },
      include: {
        project: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    console.log(`✅ Todo créée: "${newTodo.title}" (ID: ${newTodo.id})`)

    // Simuler le tracking (comme le ferait l'API)
    const { logCreate } = require('../src/lib/userActivityLogger')
    await logCreate(
      testUser.id,
      'tâche',
      newTodo.title,
      newTodo.id,
      '127.0.0.1',
      'Test Script',
      {
        projectName: newTodo.project.name,
        projectId: newTodo.project.id,
        priority: newTodo.priority
      }
    )

    console.log('✅ Tracking enregistré')

    // Vérifier que l'activité a été enregistrée
    console.log('\n📊 Vérification du tracking...')
    
    const recentActivities = await prisma.userActivity.findMany({
      where: {
        userId: testUser.id,
        action: 'Create',
        createdAt: {
          gte: new Date(Date.now() - 60000) // Dernière minute
        }
      },
      include: {
        user: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    })

    console.log(`📈 ${recentActivities.length} activités de création trouvées:`)
    recentActivities.forEach((activity, index) => {
      const details = activity.details
      console.log(`  ${index + 1}. ${details.entityType} "${details.name}" dans ${details.projectName || 'projet inconnu'} (${activity.createdAt.toLocaleString()})`)
    })

    // Nettoyer la todo de test
    console.log('\n🧹 Nettoyage...')
    await prisma.todo.delete({
      where: { id: newTodo.id }
    })
    console.log('✅ Todo de test supprimée')

    console.log('\n✅ Test terminé avec succès!')

  } catch (error) {
    console.error('❌ Erreur lors du test:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Fonction pour afficher les dernières activités
async function showRecentActivities() {
  console.log('\n📊 Dernières activités enregistrées:')
  
  try {
    await prisma.$connect()
    
    const activities = await prisma.userActivity.findMany({
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
      },
      take: 10
    })
    
    console.log(`📈 ${activities.length} activités trouvées:`)
    activities.forEach((activity, index) => {
      const details = activity.details
      const user = activity.user?.name || 'Utilisateur inconnu'
      
      let description = ''
      switch (activity.action) {
        case 'Navigation':
          description = `navigation vers ${details.page || 'page inconnue'}`
          break
        case 'Create':
          description = `création de ${details.entityType} "${details.name}"`
          if (details.projectName) description += ` dans ${details.projectName}`
          break
        case 'Edit':
          description = `modification de ${details.entityType} "${details.name}"`
          if (details.projectName) description += ` dans ${details.projectName}`
          break
        case 'Delete':
          description = `suppression de ${details.entityType} "${details.name}"`
          if (details.projectName) description += ` de ${details.projectName}`
          break
        default:
          description = `${activity.action} - ${JSON.stringify(details)}`
      }
      
      console.log(`  ${index + 1}. ${user} | ${description} | ${activity.createdAt.toLocaleString()}`)
    })
    
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des activités:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Exécution du script
async function main() {
  const args = process.argv.slice(2)
  
  if (args.includes('--recent')) {
    await showRecentActivities()
  } else {
    await testTodoCreation()
  }
}

main().catch(console.error) 