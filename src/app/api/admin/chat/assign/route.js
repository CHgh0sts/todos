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
    
    // Vérifier les permissions admin/modérateur
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    })

    if (!user || (user.role !== 'ADMIN' && user.role !== 'MODERATOR')) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    const { sessionId } = await request.json()

    if (!sessionId) {
      return NextResponse.json({ error: 'ID de session manquant' }, { status: 400 })
    }

    // Vérifier que la session existe
    const session = await prisma.chatSession.findUnique({
      where: { id: sessionId }
    })

    if (!session) {
      return NextResponse.json({ error: 'Session non trouvée' }, { status: 404 })
    }

    if (session.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Session non active' }, { status: 400 })
    }

    // Assigner la session au modérateur
    const updatedSession = await prisma.chatSession.update({
      where: { id: sessionId },
      data: { 
        assignedTo: decoded.userId,
        lastActivity: new Date()
      },
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

    // Envoyer un message système pour informer l'utilisateur
    const systemMessage = await prisma.chatMessage.create({
      data: {
        sessionId: sessionId,
        content: `${user.name} a pris en charge votre demande. Je vais vous aider !`,
        sender: 'SYSTEM',
        sentAt: new Date()
      }
    })

    // Émettre les événements Socket.IO
    if (global.io) {
      // Notifier l'utilisateur du nouveau message système
      global.io.to(`user_${session.userId}`).emit('new_chat_message', systemMessage)
      
      // Notifier tous les admins/modérateurs de la mise à jour de session
      global.io.emit('chat_session_updated', updatedSession)
      
      // Notifier le message système aux admins aussi
      global.io.emit('new_chat_message', systemMessage)
    }

    return NextResponse.json(updatedSession)
  } catch (error) {
    console.error('Erreur lors de l\'assignation:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
} 