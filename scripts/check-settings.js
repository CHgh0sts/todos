const { PrismaClient } = require('@prisma/client')

async function checkSettings() {
  const prisma = new PrismaClient()
  
  try {
    console.log('🔍 Vérification des paramètres système...\n')
    
    // Récupérer tous les paramètres système
    const settings = await prisma.systemSettings.findMany()
    
    if (settings.length === 0) {
      console.log('❌ Aucun paramètre système trouvé dans la base de données')
      console.log('📝 Cela explique pourquoi emailVerificationRequired est undefined')
      console.log('💡 Solution : Initialiser les paramètres par défaut\n')
      
      // Créer les paramètres par défaut
      console.log('🔧 Création des paramètres par défaut...')
      
      const defaultSettings = [
        { key: 'emailVerificationRequired', value: 'true', description: 'Exiger la vérification email pour l\'inscription' },
        { key: 'registrationEnabled', value: 'true', description: 'Permettre aux nouveaux utilisateurs de s\'inscrire' },
        { key: 'maintenanceMode', value: 'false', description: 'Mode maintenance du site' },
        { key: 'maxProjectsPerUser', value: '10', description: 'Nombre maximum de projets par utilisateur' },
        { key: 'maxTodosPerProject', value: '100', description: 'Nombre maximum de todos par projet' },
        { key: 'sessionTimeout', value: '7', description: 'Durée de session en jours' },
        { key: 'maintenanceMessage', value: 'Le site est temporairement en maintenance. Veuillez réessayer plus tard.', description: 'Message affiché en mode maintenance' }
      ]
      
      for (const setting of defaultSettings) {
        await prisma.systemSettings.create({
          data: setting
        })
        console.log(`✅ Créé: ${setting.key} = ${setting.value}`)
      }
      
      console.log('\n🎉 Paramètres par défaut créés avec succès!')
      
    } else {
      console.log('📋 Paramètres système actuels:')
      settings.forEach(setting => {
        console.log(`  ${setting.key}: ${setting.value}`)
      })
      
      // Vérifier spécifiquement emailVerificationRequired
      const emailVerificationSetting = settings.find(s => s.key === 'emailVerificationRequired')
      
      if (!emailVerificationSetting) {
        console.log('\n❌ Le paramètre emailVerificationRequired est manquant')
        console.log('💡 Création du paramètre...')
        
        await prisma.systemSettings.create({
          data: {
            key: 'emailVerificationRequired',
            value: 'true',
            description: 'Exiger la vérification email pour l\'inscription'
          }
        })
        
        console.log('✅ Paramètre emailVerificationRequired créé avec la valeur "true"')
      } else {
        console.log(`\n📧 emailVerificationRequired = "${emailVerificationSetting.value}"`)
        
        if (emailVerificationSetting.value === 'true') {
          console.log('✅ La vérification email est activée')
        } else {
          console.log('⚠️  La vérification email est désactivée')
          console.log('💡 C\'est pourquoi votre compte a été créé avec isVerified = true')
        }
      }
    }
    
    console.log('\n🔍 Vérification des utilisateurs récents...')
    
    // Vérifier les utilisateurs créés récemment
    const recentUsers = await prisma.user.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Dernières 24h
        }
      },
      select: {
        id: true,
        email: true,
        isVerified: true,
        verificationToken: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    if (recentUsers.length > 0) {
      console.log('👥 Utilisateurs créés dans les dernières 24h:')
      recentUsers.forEach(user => {
        console.log(`  ${user.email}: isVerified=${user.isVerified}, token=${user.verificationToken ? 'présent' : 'null'}`)
      })
    } else {
      console.log('👥 Aucun utilisateur créé dans les dernières 24h')
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkSettings() 