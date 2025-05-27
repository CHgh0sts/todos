const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function setUserToPro() {
  try {
    console.log('🔄 Mise à jour du plan utilisateur...')

    // Récupérer le premier utilisateur (ou vous pouvez spécifier un ID ou email)
    const user = await prisma.user.findFirst()
    
    if (!user) {
      console.log('❌ Aucun utilisateur trouvé')
      return
    }

    console.log(`👤 Utilisateur trouvé: ${user.name} (${user.email})`)
    console.log(`📋 Plan actuel: ${user.plan}`)

    // Mettre à jour le plan vers "pro"
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { plan: 'pro' }
    })

    console.log(`✅ Plan mis à jour vers: ${updatedUser.plan}`)
    console.log('🎉 L\'utilisateur a maintenant accès au plan Pro!')
    console.log('📊 Nouvelles limites:')
    console.log('   • 100 000 requêtes API par mois')
    console.log('   • 100 requêtes par minute')
    console.log('   • Accès complet à l\'API')
    console.log('   • Webhooks')
    console.log('   • Support prioritaire')

  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour:', error)
  } finally {
    await prisma.$disconnect()
  }
}

setUserToPro() 