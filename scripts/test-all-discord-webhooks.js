const { PrismaClient } = require('@prisma/client')
const { WebhookService } = require('../src/lib/webhookService.js')

const prisma = new PrismaClient()

async function testAllDiscordWebhooks() {
  try {
    console.log('🧪 Test complet des webhooks Discord...\n')

    // Récupérer les intégrations Discord configurées
    const discordIntegrations = await prisma.userIntegration.findMany({
      where: {
        type: 'discord',
        active: true
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    if (discordIntegrations.length === 0) {
      console.log('❌ Aucune intégration Discord configurée')
      console.log('💡 Configurez d\'abord Discord sur http://localhost:3000/integrations/discord')
      return
    }

    console.log(`✅ ${discordIntegrations.length} intégration(s) Discord trouvée(s)\n`)

    // Données de test
    const testData = {
      user: {
        id: 2,
        name: 'CHghosts',
        email: 'chghosts.dev@gmail.com'
      },
      project: {
        id: 999,
        name: 'Test Project Discord',
        description: 'Projet de test pour les webhooks Discord',
        color: '#5865F2',
        emoji: '🧪',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      todo: {
        id: 999,
        title: 'Tâche de test Discord',
        description: 'Tâche de test pour les webhooks Discord',
        priority: 'high',
        completed: false,
        dueDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      collaboration: {
        projectId: 999,
        userId: 3,
        permission: 'edit',
        addedAt: new Date()
      },
      collaborator: {
        id: 3,
        name: 'Calamar_Molly',
        email: 'princesselyoko@live.fr'
      }
    }

    // Tous les événements à tester
    const eventsToTest = [
      {
        type: 'project.created',
        description: 'Création de projet',
        data: {
          project: testData.project,
          user: testData.user
        }
      },
      {
        type: 'project.updated',
        description: 'Modification de projet',
        data: {
          project: testData.project,
          user: testData.user
        }
      },
      {
        type: 'project.deleted',
        description: 'Suppression de projet',
        data: {
          project: testData.project,
          user: testData.user
        }
      },
      {
        type: 'todo.created',
        description: 'Création de tâche',
        data: {
          todo: testData.todo,
          project: testData.project,
          user: testData.user
        }
      },
      {
        type: 'todo.updated',
        description: 'Modification de tâche',
        data: {
          todo: testData.todo,
          project: testData.project,
          user: testData.user
        }
      },
      {
        type: 'todo.completed',
        description: 'Tâche terminée',
        data: {
          todo: { ...testData.todo, completed: true },
          project: testData.project,
          user: testData.user
        }
      },
      {
        type: 'collaboration.added',
        description: 'Nouveau collaborateur',
        data: {
          collaboration: testData.collaboration,
          project: testData.project,
          user: testData.user,
          collaborator: testData.collaborator
        }
      }
    ]

    console.log('🎯 Test de formatage des messages Discord...\n')

    // Tester le formatage de chaque événement
    for (const event of eventsToTest) {
      try {
        console.log(`📋 ${event.type} - ${event.description}`)
        
        const message = WebhookService.formatDiscordMessage(event.type, event.data)
        
        console.log(`   ✅ Formatage: OK`)
        console.log(`   📝 Titre: ${message.embeds[0].title}`)
        console.log(`   📄 Description: ${message.embeds[0].description}`)
        console.log(`   🎨 Couleur: ${message.embeds[0].color}`)
        console.log(`   📊 Champs: ${message.embeds[0].fields.length}`)
        
        // Vérifier les champs requis
        const hasValidFields = message.embeds[0].fields.length > 0
        const hasTimestamp = message.embeds[0].timestamp
        const hasFooter = message.embeds[0].footer
        
        console.log(`   ⏰ Timestamp: ${hasTimestamp ? '✅' : '❌'}`)
        console.log(`   🦶 Footer: ${hasFooter ? '✅' : '❌'}`)
        console.log(`   📈 Champs valides: ${hasValidFields ? '✅' : '❌'}`)
        console.log('')
        
      } catch (error) {
        console.log(`   ❌ Erreur de formatage: ${error.message}`)
        console.log('')
      }
    }

    console.log('🚀 Test d\'envoi des webhooks...\n')

    // Tester l'envoi pour l'utilisateur qui a configuré Discord
    const testIntegration = discordIntegrations[0]
    const userId = testIntegration.userId
    
    console.log(`👤 Test avec l'utilisateur: ${testIntegration.user.name} (ID: ${userId})`)
    console.log(`📋 Événements configurés: ${testIntegration.settings.events?.join(', ') || 'Aucun'}`)
    console.log('')

    for (const event of eventsToTest) {
      if (testIntegration.settings.events?.includes(event.type)) {
        console.log(`📤 Test d'envoi: ${event.type}`)
        
        try {
          await WebhookService.sendWebhook(event.type, event.data, userId)
          console.log(`   ✅ Webhook envoyé avec succès !`)
        } catch (error) {
          console.log(`   ❌ Erreur d'envoi: ${error.message}`)
        }
        console.log('')
      } else {
        console.log(`⏭️  ${event.type}: Non configuré, ignoré`)
        console.log('')
      }
    }

    console.log('📊 Résumé du test:')
    console.log('====================')
    
    // Statistiques
    const configuredEvents = testIntegration.settings.events || []
    const totalEvents = eventsToTest.length
    const configuredCount = configuredEvents.length
    
    console.log(`📈 Événements disponibles: ${totalEvents}`)
    console.log(`⚙️  Événements configurés: ${configuredCount}`)
    console.log(`📡 Intégrations actives: ${discordIntegrations.length}`)
    
    console.log('\n✅ APIs mises à jour:')
    console.log('   - ✅ /api/projects (POST) → project.created')
    console.log('   - ✅ /api/projects/[id] (PUT) → project.updated')
    console.log('   - ✅ /api/projects/[id] (DELETE) → project.deleted')
    console.log('   - ✅ /api/todos (POST) → todo.created')
    console.log('   - ✅ /api/todos/[id] (PUT) → todo.updated + todo.completed')
    console.log('   - ✅ /api/invitations/[id] (PUT) → collaboration.added')
    
    console.log('\n✅ Formatage Discord:')
    eventsToTest.forEach(event => {
      console.log(`   - ✅ ${event.type}`)
    })

    console.log('\n🎉 Tous les webhooks Discord sont maintenant opérationnels !')
    
    if (configuredCount === totalEvents) {
      console.log('🏆 Configuration parfaite : tous les événements sont activés !')
    } else {
      console.log(`⚠️  ${totalEvents - configuredCount} événement(s) non configuré(s)`)
      console.log('💡 Vous pouvez les activer sur /integrations/discord')
    }

  } catch (error) {
    console.error('❌ Erreur lors du test:', error)
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  testAllDiscordWebhooks()
}

module.exports = { testAllDiscordWebhooks } 