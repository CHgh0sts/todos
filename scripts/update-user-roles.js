const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function updateUserRoles() {
  try {
    console.log('🔄 Mise à jour des rôles utilisateurs...')
    
    // Mettre à jour tous les utilisateurs existants avec le rôle USER
    const result = await prisma.user.updateMany({
      data: {
        role: 'USER'
      }
    })
    
    console.log(`✅ ${result.count} utilisateurs mis à jour avec le rôle USER`)
    
    // Compter les utilisateurs par rôle
    const userCount = await prisma.user.count({ where: { role: 'USER' } })
    const moderatorCount = await prisma.user.count({ where: { role: 'MODERATOR' } })
    const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } })
    
    console.log('\n📊 Répartition des rôles :')
    console.log(`👤 Utilisateurs : ${userCount}`)
    console.log(`🛡️ Modérateurs : ${moderatorCount}`)
    console.log(`👑 Administrateurs : ${adminCount}`)
    
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour des rôles :', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateUserRoles() 