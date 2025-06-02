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

    // Récupérer les données de contexte du formulaire
    const body = await request.json()
    const { 
      subject, 
      category, 
      priority, 
      description, 
      userEmail, 
      userPhone,
      firstName,
      lastName,
      isGuest: bodyIsGuest
    } = body

    // Si c'est un invité, vérifier les champs obligatoires
    if (isGuest || bodyIsGuest) {
      if (!firstName || !lastName || !userEmail || !subject || !category || !description) {
        return NextResponse.json({ 
          error: 'Informations manquantes pour les utilisateurs non connectés' 
        }, { status: 400 })
      }
      isGuest = true
      userId = null
    }

    // Vérifier si l'utilisateur connecté a déjà une session active ou en attente
    if (userId) {
      let existingSession = await prisma.chatSession.findFirst({
        where: {
          userId: userId,
          status: {
            in: ['ACTIVE', 'WAITING']
          }
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
    }

    // Créer une nouvelle session avec les données de contexte
    const sessionData = {
      status: 'WAITING', // Commence en attente d'un agent
      startedAt: new Date(),
      subject: subject || null,
      category: category || null,
      priority: priority || 'Normale',
      description: description || null,
      userEmail: userEmail || null,
      userPhone: userPhone || null,
      isGuest: isGuest
    }

    // Ajouter les données spécifiques selon le type d'utilisateur
    if (isGuest) {
      sessionData.guestFirstName = firstName
      sessionData.guestLastName = lastName
    } else {
      sessionData.userId = userId
    }

    const session = await prisma.chatSession.create({
      data: sessionData,
      include: {
        user: userId ? {
          select: {
            id: true,
            name: true,
            email: true
          }
        } : undefined
      }
    })

    // Enrichir la session avec les informations d'invité pour l'affichage
    if (isGuest) {
      session.user = {
        id: null,
        name: `${firstName} ${lastName}`,
        email: userEmail
      }
    }

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