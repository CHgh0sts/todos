const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function promoteToAdmin() {
  try {
    const email = process.argv[2]
    
    if (!email) {
      console.log('❌ Usage: node scripts/promote-admin.js <email>')
      console.log('📧 Exemple: node scripts/promote-admin.js user@example.com')
      return
    }

    console.log(`🔍 Recherche de l'utilisateur avec l'email: ${email}`)
    
    // Trouver l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email }
    })
    
    if (!user) {
      console.log(`❌ Aucun utilisateur trouvé avec l'email: ${email}`)
      return
    }
    
    console.log(`👤 Utilisateur trouvé: ${user.name} (ID: ${user.id})`)
    console.log(`📊 Rôle actuel: ${user.role}`)
    
    if (user.role === 'ADMIN') {
      console.log('✅ Cet utilisateur est déjà administrateur')
      return
    }
    
    // Promouvoir en admin
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { role: 'ADMIN' }
    })
    
    console.log(`🎉 ${updatedUser.name} a été promu administrateur !`)
    console.log(`📊 Nouveau rôle: ${updatedUser.role}`)
    
    // Afficher les statistiques des rôles
    const userCount = await prisma.user.count({ where: { role: 'USER' } })
    const moderatorCount = await prisma.user.count({ where: { role: 'MODERATOR' } })
    const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } })
    
    console.log('\n📊 Répartition des rôles :')
    console.log(`👤 Utilisateurs : ${userCount}`)
    console.log(`🛡️ Modérateurs : ${moderatorCount}`)
    console.log(`👑 Administrateurs : ${adminCount}`)
    
  } catch (error) {
    console.error('❌ Erreur lors de la promotion :', error)
  } finally {
    await prisma.$disconnect()
  }
}

promoteToAdmin() 