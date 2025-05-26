import { NextResponse } from 'next/server'
import { verifyToken, getTokenFromRequest } from '@/lib/auth'
import prisma from '@/lib/prisma'

// Répondre à une invitation (accepter/refuser)
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

    // Vérifier que l'invitation existe et appartient à l'utilisateur
    const invitation = await prisma.invitation.findFirst({
      where: {
        id: parseInt(id),
        receiverId: userId,
        status: 'pending'
      },
      include: {
        project: true,
        sender: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    if (!invitation) {
      return NextResponse.json({ error: 'Invitation non trouvée ou déjà traitée' }, { status: 404 })
    }

    if (action === 'accept') {
      // Accepter l'invitation
      await prisma.$transaction(async (tx) => {
        // Mettre à jour le statut de l'invitation
        await tx.invitation.update({
          where: { id: parseInt(id) },
          data: { 
            status: 'accepted',
            respondedAt: new Date()
          }
        })

        // Ajouter l'utilisateur au projet
        await tx.projectMember.create({
          data: {
            projectId: invitation.projectId,
            userId: userId,
            role: 'member'
          }
        })

        // Créer une notification pour le propriétaire du projet
        await tx.notification.create({
          data: {
            userId: invitation.senderId,
            type: 'invitation_accepted',
            title: 'Invitation acceptée',
            message: `${invitation.receiver?.name || 'Un utilisateur'} a accepté votre invitation pour le projet "${invitation.project.name}"`,
            data: {
              projectId: invitation.projectId,
              invitationId: invitation.id
            }
          }
        })
      })

      return NextResponse.json({ 
        message: 'Invitation acceptée avec succès',
        project: invitation.project
      })
    } else {
      // Refuser l'invitation
      await prisma.$transaction(async (tx) => {
        // Mettre à jour le statut de l'invitation
        await tx.invitation.update({
          where: { id: parseInt(id) },
          data: { 
            status: 'declined',
            respondedAt: new Date()
          }
        })

        // Créer une notification pour le propriétaire du projet
        await tx.notification.create({
          data: {
            userId: invitation.senderId,
            type: 'invitation_declined',
            title: 'Invitation refusée',
            message: `${invitation.receiver?.name || 'Un utilisateur'} a refusé votre invitation pour le projet "${invitation.project.name}"`,
            data: {
              projectId: invitation.projectId,
              invitationId: invitation.id
            }
          }
        })
      })

      return NextResponse.json({ message: 'Invitation refusée' })
    }

  } catch (error) {
    console.error('Erreur lors de la réponse à l\'invitation:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// Supprimer une invitation
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

    // Vérifier que l'invitation existe et que l'utilisateur peut la supprimer
    const invitation = await prisma.invitation.findFirst({
      where: {
        id: parseInt(id),
        OR: [
          { senderId: userId }, // L'expéditeur peut supprimer
          { receiverId: userId } // Le destinataire peut supprimer
        ]
      }
    })

    if (!invitation) {
      return NextResponse.json({ error: 'Invitation non trouvée' }, { status: 404 })
    }

    // Supprimer l'invitation
    await prisma.invitation.delete({
      where: { id: parseInt(id) }
    })

    return NextResponse.json({ message: 'Invitation supprimée' })

  } catch (error) {
    console.error('Erreur lors de la suppression de l\'invitation:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
} 