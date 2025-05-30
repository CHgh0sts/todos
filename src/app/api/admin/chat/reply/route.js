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

    const { sessionId, content } = await request.json()

    if (!sessionId || !content) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
    }

    // Vérifier que la session existe et est active
    const session = await prisma.chatSession.findUnique({
      where: { id: sessionId },
      include: { user: true }
    })

    if (!session) {
      return NextResponse.json({ error: 'Session non trouvée' }, { status: 404 })
    }

    if (session.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Session non active' }, { status: 400 })
    }

    // Créer le message de réponse
    const message = await prisma.chatMessage.create({
      data: {
        sessionId: sessionId,
        content: content,
        sender: 'SUPPORT',
        sentAt: new Date()
      }
    })

    // Mettre à jour la session
    const updatedSession = await prisma.chatSession.update({
      where: { id: sessionId },
      data: { 
        lastActivity: new Date(),
        assignedTo: decoded.userId
      },
      include: { user: true }
    })

    // Émettre les événements Socket.IO
    if (global.io) {
      // Notifier l'utilisateur du nouveau message
      global.io.to(`user_${session.userId}`).emit('new_chat_message', message)
      
      // Notifier tous les admins/modérateurs
      global.io.emit('new_chat_message', message)
      
      // Notifier la mise à jour de session
      global.io.emit('chat_session_updated', updatedSession)
    }

    return NextResponse.json(message)
  } catch (error) {
    console.error('Erreur lors de l\'envoi de la réponse:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
} 