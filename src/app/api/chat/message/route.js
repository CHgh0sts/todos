import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

export async function POST(request) {
  try {
    const authHeader = request.headers.get('authorization')
    let userId = null
    let isGuest = false

    // Vérifier si l'utilisateur est connecté
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7)
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        userId = decoded.userId
      } catch (error) {
        console.log('Token invalide, traitement en tant qu\'invité')
        isGuest = true
      }
    } else {
      isGuest = true
    }

    const { sessionId, content } = await request.json()

    if (!sessionId || !content) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
    }

    // Vérifier que la session existe et appartient à l'utilisateur (ou est une session invité)
    const sessionWhere = isGuest 
      ? { id: sessionId, isGuest: true }
      : { id: sessionId, userId: userId }

    const session = await prisma.chatSession.findFirst({
      where: sessionWhere
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
        user: session.userId ? {
          select: {
            id: true,
            name: true,
            email: true
          }
        } : undefined
      }
    })

    // Enrichir la session avec les informations d'invité pour l'affichage
    if (session.isGuest) {
      updatedSession.user = {
        id: null,
        name: `${session.guestFirstName} ${session.guestLastName}`,
        email: session.userEmail
      }
    }

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