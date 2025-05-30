import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import adminMiddleware from '@/lib/adminMiddleware'

const prisma = new PrismaClient()

export async function POST(request) {
  try {
    // Vérifier les permissions admin
    const authResult = await adminMiddleware(request)
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const { sessionId, targetUserId } = await request.json()

    if (!sessionId || !targetUserId) {
      return NextResponse.json(
        { error: 'Session ID et utilisateur cible requis' },
        { status: 400 }
      )
    }

    // Vérifier que la session existe
    const session = await prisma.chatSession.findUnique({
      where: { id: sessionId },
      include: {
        user: true,
        assignedToUser: true
      }
    })

    if (!session) {
      return NextResponse.json(
        { error: 'Session non trouvée' },
        { status: 404 }
      )
    }

    // Vérifier que l'utilisateur cible est un admin/modérateur
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId }
    })

    if (!targetUser || (targetUser.role !== 'ADMIN' && targetUser.role !== 'MODERATOR')) {
      return NextResponse.json(
        { error: 'Utilisateur cible invalide' },
        { status: 400 }
      )
    }

    // Transférer la session
    const updatedSession = await prisma.chatSession.update({
      where: { id: sessionId },
      data: {
        assignedTo: targetUserId,
        updatedAt: new Date()
      },
      include: {
        user: true,
        assignedToUser: true
      }
    })

    // Créer un message système pour notifier le transfert
    await prisma.chatMessage.create({
      data: {
        sessionId: sessionId,
        content: `Conversation transférée vers ${targetUser.name} par ${authResult.user.name}`,
        sender: 'SYSTEM',
        sentAt: new Date()
      }
    })

    // Émettre l'événement Socket.IO pour notifier tous les admins
    if (global.io) {
      global.io.to('admin_chat').emit('chat_session_updated', updatedSession)
      global.io.to('admin_chat').emit('new_chat_message', {
        sessionId: sessionId,
        content: `Conversation transférée vers ${targetUser.name} par ${authResult.user.name}`,
        sender: 'SYSTEM',
        sentAt: new Date()
      })
    }

    return NextResponse.json({
      success: true,
      session: updatedSession,
      message: `Conversation transférée vers ${targetUser.name}`
    })

  } catch (error) {
    console.error('Erreur lors du transfert de session:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
} 