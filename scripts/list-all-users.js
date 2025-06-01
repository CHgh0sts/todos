const { PrismaClient } = require('@prisma/client')

async function listAllUsers() {
  const prisma = new PrismaClient()
  
  try {
    console.log('🔍 Liste de tous les utilisateurs...\n')
    
    // Récupérer tous les utilisateurs
    const users = await prisma.user.findMany({
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
    
    if (users.length === 0) {
      console.log('👥 Aucun utilisateur trouvé')
      return
    }
    
    console.log(`👥 ${users.length} utilisateur(s) total:`)
    console.log('')
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email})`)
      console.log(`   ID: ${user.id}`)
      console.log(`   Créé: ${user.createdAt.toLocaleString('fr-FR')}`)
      console.log(`   Vérifié: ${user.isVerified ? '✅ Oui' : '❌ Non'}`)
      console.log(`   Token: ${user.verificationToken ? '🔑 Présent' : '🚫 Absent'}`)
      console.log('')
    })
    
    // Identifier les comptes problématiques
    const problematicUsers = users.filter(user => user.isVerified && !user.verificationToken)
    
    if (problematicUsers.length > 0) {
      console.log('⚠️  Comptes problématiques (vérifiés sans token):')
      problematicUsers.forEach(user => {
        console.log(`   - ${user.email} (ID: ${user.id})`)
      })
      console.log('')
      console.log('💡 Ces comptes ont probablement été créés avec le bug de emailVerificationRequired')
      console.log('🔧 Pour corriger un compte spécifique, modifiez le script fix-user-verification.js avec le bon email')
    }
    
    // Statistiques
    const verifiedCount = users.filter(u => u.isVerified).length
    const unverifiedCount = users.filter(u => !u.isVerified).length
    
    console.log('📊 Statistiques:')
    console.log(`   Comptes vérifiés: ${verifiedCount}`)
    console.log(`   Comptes non vérifiés: ${unverifiedCount}`)
    console.log(`   Total: ${users.length}`)
    
  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

listAllUsers() 