const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function setSpecificUserToPro(email) {
  try {
    console.log(`🔄 Recherche de l'utilisateur: ${email}`)

    const user = await prisma.user.findUnique({
      where: { email: email }
    })
    
    if (!user) {
      console.log(`❌ Utilisateur avec l'email ${email} non trouvé`)
      return
    }

    console.log(`👤 Utilisateur trouvé: ${user.name}`)
    console.log(`📋 Plan actuel: ${user.plan}`)

    if (user.plan === 'pro') {
      console.log('✅ L\'utilisateur est déjà en plan Pro!')
      return
    }

    // Mettre à jour le plan vers "pro"
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { plan: 'pro' }
    })

    console.log(`✅ Plan mis à jour vers: ${updatedUser.plan}`)
    console.log('🎉 L\'utilisateur a maintenant accès au plan Pro!')

  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Utilisation: node scripts/set-specific-user-pro.js votre@email.com
const email = process.argv[2]
if (!email) {
  console.log('❌ Veuillez spécifier un email')
  console.log('Usage: node scripts/set-specific-user-pro.js votre@email.com')
  process.exit(1)
}

setSpecificUserToPro(email) 