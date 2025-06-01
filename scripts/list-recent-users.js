const { PrismaClient } = require('@prisma/client')

async function listRecentUsers() {
  const prisma = new PrismaClient()
  
  try {
    console.log('🔍 Liste des utilisateurs récents...\n')
    
    // Récupérer tous les utilisateurs créés dans les dernières 48h
    const recentUsers = await prisma.user.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 48 * 60 * 60 * 1000) // Dernières 48h
        }
      },
      select: {
        id: true,
        email: true,
        name: true,
        isVerified: true,
        verificationToken: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    if (recentUsers.length === 0) {
      console.log('👥 Aucun utilisateur créé dans les dernières 48h')
      return
    }
    
    console.log(`👥 ${recentUsers.length} utilisateur(s) créé(s) dans les dernières 48h:`)
    console.log('')
    
    recentUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email})`)
      console.log(`   ID: ${user.id}`)
      console.log(`   Créé: ${user.createdAt.toLocaleString('fr-FR')}`)
      console.log(`   Vérifié: ${user.isVerified ? '✅ Oui' : '❌ Non'}`)
      console.log(`   Token: ${user.verificationToken ? '🔑 Présent' : '🚫 Absent'}`)
      console.log('')
    })
    
    // Identifier les comptes problématiques
    const problematicUsers = recentUsers.filter(user => user.isVerified && !user.verificationToken)
    
    if (problematicUsers.length > 0) {
      console.log('⚠️  Comptes problématiques (vérifiés sans token):')
      problematicUsers.forEach(user => {
        console.log(`   - ${user.email} (ID: ${user.id})`)
      })
      console.log('')
      console.log('💡 Ces comptes ont probablement été créés avec le bug de emailVerificationRequired')
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

listRecentUsers() 