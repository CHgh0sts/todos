#!/usr/bin/env node

/**
 * Script de test pour le tracking des catégories
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testCategoryTracking() {
  console.log('🧪 Test du tracking des catégories\n')

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

    // Test 1: Création d'une catégorie
    console.log('\n📍 Test 1: Création de catégorie')
    
    const categoryData = {
      name: `Catégorie test - ${new Date().toLocaleTimeString()}`,
      color: '#FF6B6B',
      emoji: '🎯'
    }

    const newCategory = await prisma.category.create({
      data: {
        name: categoryData.name,
        color: categoryData.color,
        emoji: categoryData.emoji,
        userId: testUser.id
      }
    })

    console.log(`✅ Catégorie créée: "${newCategory.name}" (ID: ${newCategory.id})`)

    // Simuler le tracking de création
    const { logCreate } = require('../src/lib/userActivityLogger')
    await logCreate(
      testUser.id,
      'catégorie',
      newCategory.name,
      newCategory.id,
      '127.0.0.1',
      'Test Script',
      {
        color: newCategory.color,
        emoji: newCategory.emoji
      }
    )

    console.log('✅ Tracking de création enregistré')

    // Test 2: Modification de la catégorie
    console.log('\n📍 Test 2: Modification de catégorie')
    
    const updatedCategory = await prisma.category.update({
      where: { id: newCategory.id },
      data: {
        name: `${newCategory.name} - Modifiée`,
        color: '#4ECDC4'
      }
    })

    // Simuler le tracking de modification
    const { logEdit } = require('../src/lib/userActivityLogger')
    await logEdit(
      testUser.id,
      'catégorie',
      updatedCategory.name,
      updatedCategory.id,
      {
        name: updatedCategory.name,
        color: updatedCategory.color
      },
      '127.0.0.1',
      'Test Script'
    )

    console.log('✅ Tracking de modification enregistré')

    // Test 3: Suppression de la catégorie
    console.log('\n📍 Test 3: Suppression de catégorie')
    
    // Simuler le tracking de suppression
    const { logDelete } = require('../src/lib/userActivityLogger')
    await logDelete(
      testUser.id,
      'catégorie',
      updatedCategory.name,
      updatedCategory.id,
      '127.0.0.1',
      'Test Script',
      {
        color: updatedCategory.color,
        emoji: updatedCategory.emoji
      }
    )

    await prisma.category.delete({
      where: { id: newCategory.id }
    })

    console.log('✅ Tracking de suppression enregistré')
    console.log('✅ Catégorie supprimée')

    // Vérifier les activités enregistrées
    console.log('\n📊 Vérification des activités enregistrées:')
    
    const recentActivities = await prisma.userActivity.findMany({
      where: {
        userId: testUser.id,
        createdAt: {
          gte: new Date(Date.now() - 60000) // Dernière minute
        },
        details: {
          path: ['entityType'],
          equals: 'catégorie'
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
      }
    })

    console.log(`📈 ${recentActivities.length} activités de catégorie trouvées:`)
    recentActivities.forEach((activity, index) => {
      const details = activity.details
      console.log(`  ${index + 1}. ${activity.action} - ${details.entityType} "${details.name}" (${activity.createdAt.toLocaleString()})`)
    })

    console.log('\n✅ Test terminé avec succès!')

  } catch (error) {
    console.error('❌ Erreur lors du test:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Fonction pour afficher les activités de catégories
async function showCategoryActivities() {
  console.log('\n📊 Activités des catégories:')
  
  try {
    await prisma.$connect()
    
    const activities = await prisma.userActivity.findMany({
      where: {
        details: {
          path: ['entityType'],
          equals: 'catégorie'
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
      take: 10
    })
    
    console.log(`📈 ${activities.length} activités de catégorie trouvées:`)
    activities.forEach((activity, index) => {
      const details = activity.details
      const user = activity.user?.name || 'Utilisateur inconnu'
      
      let description = ''
      switch (activity.action) {
        case 'Create':
          description = `création de catégorie "${details.name}"`
          if (details.emoji) description += ` ${details.emoji}`
          break
        case 'Edit':
          description = `modification de catégorie "${details.name}"`
          if (details.changes) {
            const changes = Object.keys(details.changes).join(', ')
            description += ` (${changes})`
          }
          break
        case 'Delete':
          description = `suppression de catégorie "${details.name}"`
          if (details.emoji) description += ` ${details.emoji}`
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
  
  if (args.includes('--show')) {
    await showCategoryActivities()
  } else {
    await testCategoryTracking()
  }
}

main().catch(console.error) 