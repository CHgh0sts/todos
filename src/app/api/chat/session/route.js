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

    // Vérifier si l'utilisateur a déjà une session active
    let existingSession = await prisma.chatSession.findFirst({
      where: {
        userId: userId,
        status: 'ACTIVE'
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

    if (existingSession) {
      return NextResponse.json(existingSession)
    }

    // Créer une nouvelle session
    const session = await prisma.chatSession.create({
      data: {
        userId: userId,
        status: 'ACTIVE',
        startedAt: new Date()
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

    // Émettre l'événement Socket.IO pour notifier les admins
    if (global.io) {
      global.io.emit('new_chat_session', session)
    }

    return NextResponse.json(session)
  } catch (error) {
    console.error('Erreur lors de la création de session:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
} 