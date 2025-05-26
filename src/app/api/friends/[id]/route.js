import { NextResponse } from 'next/server'
import { verifyToken, getTokenFromRequest } from '@/lib/auth'
import prisma from '@/lib/prisma'

// Répondre à une demande d'ami (accepter/refuser)
export async function PUT(request, { params }) {
  try {
    const { id } = params
    const token = getTokenFromRequest(request)
    
    if (!token) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 })
    }
    
    const userId = decoded.userId
    const { action } = await request.json() // 'accept' ou 'decline'

    if (!['accept', 'decline'].includes(action)) {
      return NextResponse.json({ error: 'Action invalide' }, { status: 400 })
    }

    // Vérifier que la demande d'ami existe et appartient à l'utilisateur
    const friendRequest = await prisma.friendRequest.findFirst({
      where: {
        id: parseInt(id),
        receiverId: userId,
        status: 'pending'
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    if (!friendRequest) {
      return NextResponse.json({ error: 'Demande d\'ami non trouvée ou déjà traitée' }, { status: 404 })
    }

    if (action === 'accept') {
      // Accepter la demande d'ami
      await prisma.$transaction(async (tx) => {
        // Mettre à jour le statut de la demande
        await tx.friendRequest.update({
          where: { id: parseInt(id) },
          data: { status: 'accepted' }
        })

        // Créer la relation d'amitié (toujours user1Id < user2Id pour éviter les doublons)
        const user1Id = Math.min(userId, friendRequest.senderId)
        const user2Id = Math.max(userId, friendRequest.senderId)

        await tx.friendship.create({
          data: {
            user1Id: user1Id,
            user2Id: user2Id
          }
        })

        // Créer une notification pour l'expéditeur
        await tx.notification.create({
          data: {
            userId: friendRequest.senderId,
            type: 'friend_request_accepted',
            title: 'Demande d\'ami acceptée',
            message: `${decoded.name || 'Un utilisateur'} a accepté votre demande d'ami`,
            data: JSON.stringify({
              friendRequestId: friendRequest.id,
              userId: userId
            })
          }
        })
      })

      return NextResponse.json({ 
        message: 'Demande d\'ami acceptée',
        friend: friendRequest.sender
      })
    } else {
      // Refuser la demande d'ami
      await prisma.$transaction(async (tx) => {
        // Mettre à jour le statut de la demande
        await tx.friendRequest.update({
          where: { id: parseInt(id) },
          data: { status: 'rejected' }
        })

        // Créer une notification pour l'expéditeur
        await tx.notification.create({
          data: {
            userId: friendRequest.senderId,
            type: 'friend_request_declined',
            title: 'Demande d\'ami refusée',
            message: `${decoded.name || 'Un utilisateur'} a refusé votre demande d'ami`,
            data: JSON.stringify({
              friendRequestId: friendRequest.id,
              userId: userId
            })
          }
        })
      })

      return NextResponse.json({ message: 'Demande d\'ami refusée' })
    }

  } catch (error) {
    console.error('Erreur lors de la réponse à la demande d\'ami:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// Supprimer une demande d'ami ou une amitié
export async function DELETE(request, { params }) {
  try {
    const { id } = params
    const token = getTokenFromRequest(request)
    
    if (!token) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 })
    }
    
    const userId = decoded.userId

    // Vérifier si c'est une demande d'ami
    const friendRequest = await prisma.friendRequest.findFirst({
      where: {
        id: parseInt(id),
        OR: [
          { senderId: userId }, // L'expéditeur peut supprimer
          { receiverId: userId } // Le destinataire peut supprimer
        ]
      }
    })

    if (friendRequest) {
      // Supprimer la demande d'ami
      await prisma.friendRequest.delete({
        where: { id: parseInt(id) }
      })

      return NextResponse.json({ message: 'Demande d\'ami supprimée' })
    }

    // Sinon, vérifier si c'est une amitié existante
    const friendship = await prisma.friendship.findFirst({
      where: {
        id: parseInt(id),
        OR: [
          { user1Id: userId },
          { user2Id: userId }
        ]
      }
    })

    if (friendship) {
      // Supprimer l'amitié
      await prisma.friendship.delete({
        where: { id: parseInt(id) }
      })

      return NextResponse.json({ message: 'Amitié supprimée' })
    }

    return NextResponse.json({ error: 'Relation non trouvée' }, { status: 404 })

  } catch (error) {
    console.error('Erreur lors de la suppression:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
} 