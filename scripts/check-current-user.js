const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkCurrentUser() {
  try {
    console.log('🔍 Vérification des utilisateurs et intégrations...\n')

    // Lister tous les utilisateurs
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        isVerified: true,
        role: true
      },
      orderBy: { id: 'asc' }
    })

    console.log('👥 Utilisateurs dans la base de données:')
    users.forEach(user => {
      console.log(`   ${user.id}. ${user.name} (${user.email}) - ${user.role}${user.isVerified ? ' ✅' : ' ❌'}`)
    })
    console.log('')

    // Lister toutes les intégrations Discord
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

    console.log('🎮 Intégrations Discord configurées:')
    if (discordIntegrations.length === 0) {
      console.log('   ❌ Aucune intégration Discord trouvée')
    } else {
      discordIntegrations.forEach((integration, index) => {
        console.log(`   ${index + 1}. Utilisateur: ${integration.user.name} (ID: ${integration.userId})`)
        console.log(`      Email: ${integration.user.email}`)
        console.log(`      Serveur: ${integration.settings.serverName || 'Non spécifié'}`)
        console.log(`      Événements configurés: ${integration.settings.events?.join(', ') || 'Aucun'}`)
        console.log('')
      })
    }

    // Vérifier les projets récents
    const recentProjects = await prisma.project.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
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

    console.log('📁 Projets récents (derniers 5):')
    if (recentProjects.length === 0) {
      console.log('   ❌ Aucun projet trouvé')
    } else {
      recentProjects.forEach((project, index) => {
        console.log(`   ${index + 1}. "${project.name}" créé par ${project.user.name} (ID: ${project.userId})`)
        console.log(`      Date: ${project.createdAt.toLocaleString()}`)
        console.log('')
      })
    }

    // Diagnostic
    console.log('🔍 Diagnostic:')
    
    const discordUserIds = discordIntegrations.map(i => i.userId)
    const projectCreatorIds = [...new Set(recentProjects.map(p => p.userId))]
    
    console.log(`   - Utilisateurs avec Discord configuré: [${discordUserIds.join(', ')}]`)
    console.log(`   - Utilisateurs ayant créé des projets récents: [${projectCreatorIds.join(', ')}]`)
    
    const hasMatchingUser = discordUserIds.some(id => projectCreatorIds.includes(id))
    
    if (hasMatchingUser) {
      console.log('   ✅ Il y a une correspondance ! Les notifications devraient fonctionner.')
    } else {
      console.log('   ❌ PROBLÈME: Aucun utilisateur avec Discord configuré n\'a créé de projet récent.')
      console.log('   💡 SOLUTION: Connectez-vous avec le même compte qui a configuré Discord.')
    }

    // Instructions
    console.log('\n📋 Instructions:')
    console.log('1. Identifiez votre ID utilisateur actuel en regardant la liste ci-dessus')
    console.log('2. Vérifiez si cet utilisateur a Discord configuré')
    console.log('3. Si non, reconfigurez Discord avec votre compte actuel')
    console.log('4. Si oui, créez un nouveau projet pour tester')
    console.log('5. Vérifiez les logs du serveur pour d\'éventuelles erreurs')

  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  checkCurrentUser()
}

module.exports = { checkCurrentUser } 