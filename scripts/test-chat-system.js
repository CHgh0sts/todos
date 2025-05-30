const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testChatSystem() {
  try {
    console.log('🧪 Test du système de chat...')

    // Vérifier les tables de chat
    const sessionCount = await prisma.chatSession.count()
    const messageCount = await prisma.chatMessage.count()

    console.log(`📊 Sessions de chat: ${sessionCount}`)
    console.log(`💬 Messages: ${messageCount}`)

    // Vérifier les sessions actives
    const activeSessions = await prisma.chatSession.findMany({
      where: { status: 'ACTIVE' },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            messages: true
          }
        }
      }
    })

    console.log(`\n🟢 Sessions actives: ${activeSessions.length}`)
    activeSessions.forEach(session => {
      console.log(`  - ${session.user.name} (${session._count.messages} messages)`)
    })

    // Vérifier les sessions en attente
    const waitingSessions = await prisma.chatSession.findMany({
      where: { status: 'WAITING' },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    console.log(`\n🟡 Sessions en attente: ${waitingSessions.length}`)
    waitingSessions.forEach(session => {
      console.log(`  - ${session.user.name}`)
    })

    // Vérifier les modérateurs/admins
    const moderators = await prisma.user.findMany({
      where: {
        role: {
          in: ['ADMIN', 'MODERATOR']
        }
      },
      select: {
        name: true,
        role: true
      }
    })

    console.log(`\n👥 Modérateurs/Admins: ${moderators.length}`)
    moderators.forEach(mod => {
      console.log(`  - ${mod.name} (${mod.role})`)
    })

    console.log('\n✅ Test du système de chat terminé')

  } catch (error) {
    console.error('❌ Erreur lors du test:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testChatSystem() 