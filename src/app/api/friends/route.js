import { NextResponse } from 'next/server'
import { verifyToken, getTokenFromRequest } from '@/lib/auth'
import prisma from '@/lib/prisma'

// Récupérer la liste des amis et demandes d'amis
export async function GET(request) {
  try {
    const token = getTokenFromRequest(request)
    
    if (!token) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 })
    }
    
    const userId = decoded.userId

    // Récupérer les amis (relations acceptées)
    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [
          { user1Id: userId },
          { user2Id: userId }
        ]
      },
      include: {
        user1: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true
          }
        },
        user2: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true
          }
        }
      }
    })

    // Formater la liste des amis
    const friends = friendships.map(friendship => {
      if (friendship.user1Id === userId) {
        return friendship.user2
      } else {
        return friendship.user1
      }
    })

    // Récupérer les demandes d'amis reçues
    const receivedRequests = await prisma.friendRequest.findMany({
      where: {
        receiverId: userId,
        status: 'pending'
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true
          }
        }
      }
    })

    // Récupérer les demandes d'amis envoyées
    const sentRequests = await prisma.friendRequest.findMany({
      where: {
        senderId: userId,
        status: 'pending'
      },
      include: {
        receiver: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true
          }
        }
      }
    })

    return NextResponse.json({
      friends,
      receivedRequests,
      sentRequests
    })

  } catch (error) {
    console.error('Erreur lors de la récupération des amis:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// Envoyer une demande d'ami
export async function POST(request) {
  try {
    const token = getTokenFromRequest(request)
    
    if (!token) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 })
    }
    
    const userId = decoded.userId
    const { email, message } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email requis' }, { status: 400 })
    }

    // Trouver l'utilisateur par email
    const targetUser = await prisma.user.findUnique({
      where: { email: email }
    })

    if (!targetUser) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    }

    if (targetUser.id === userId) {
      return NextResponse.json({ error: 'Vous ne pouvez pas vous ajouter vous-même' }, { status: 400 })
    }

    // Vérifier s'ils sont déjà amis
    const existingFriendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { user1Id: userId, user2Id: targetUser.id },
          { user1Id: targetUser.id, user2Id: userId }
        ]
      }
    })

    if (existingFriendship) {
      return NextResponse.json({ error: 'Vous êtes déjà amis' }, { status: 400 })
    }

    // Vérifier s'il y a déjà une demande en attente
    const existingRequest = await prisma.friendRequest.findFirst({
      where: {
        OR: [
          { senderId: userId, receiverId: targetUser.id, status: 'pending' },
          { senderId: targetUser.id, receiverId: userId, status: 'pending' }
        ]
      }
    })

    if (existingRequest) {
      return NextResponse.json({ error: 'Une demande d\'ami est déjà en attente' }, { status: 400 })
    }

    // Créer la demande d'ami
    const friendRequest = await prisma.friendRequest.create({
      data: {
        senderId: userId,
        receiverId: targetUser.id,
        message: message || null
      },
      include: {
        receiver: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true
          }
        }
      }
    })

    // Créer une notification pour l'utilisateur cible
    await prisma.notification.create({
      data: {
        userId: targetUser.id,
        type: 'friend_request',
        title: 'Nouvelle demande d\'ami',
        message: `${decoded.name || 'Un utilisateur'} vous a envoyé une demande d'ami`,
        data: JSON.stringify({
          friendRequestId: friendRequest.id,
          senderId: userId
        })
      }
    })

    return NextResponse.json({ 
      message: 'Demande d\'ami envoyée',
      friendRequest: friendRequest
    })

  } catch (error) {
    console.error('Erreur lors de l\'envoi de la demande d\'ami:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
} 