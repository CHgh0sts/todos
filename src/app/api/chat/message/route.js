import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

export async function POST(request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const userId = decoded.userId

    const { sessionId, content } = await request.json()

    if (!sessionId || !content) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
    }

    // Vérifier que la session appartient à l'utilisateur
    const session = await prisma.chatSession.findFirst({
      where: {
        id: sessionId,
        userId: userId
      }
    })

    if (!session) {
      return NextResponse.json({ error: 'Session non trouvée' }, { status: 404 })
    }

    // Créer le message
    const message = await prisma.chatMessage.create({
      data: {
        sessionId: sessionId,
        content: content,
        sender: 'USER',
        sentAt: new Date()
      }
    })

    // Mettre à jour la session
    const updatedSession = await prisma.chatSession.update({
      where: { id: sessionId },
      data: { lastActivity: new Date() },
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

    // Émettre les événements Socket.IO
    if (global.io) {
      // Notifier tous les admins/modérateurs du nouveau message
      global.io.emit('new_chat_message', message)
      
      // Mettre à jour la session pour les admins
      global.io.emit('chat_session_updated', updatedSession)
    }

    return NextResponse.json(message)
  } catch (error) {
    console.error('Erreur lors de l\'envoi du message:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
} 