import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyToken, getTokenFromRequest } from '@/lib/auth'
import jwt from 'jsonwebtoken'

// Inviter des collaborateurs pour un projet
export async function POST(request, { params }) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const userId = decoded.userId
    const projectId = parseInt(params.id)

    const { email, permission, message } = await request.json()

    // Vérifier que le projet existe et que l'utilisateur en est le propriétaire ou a les droits admin
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { userId: userId },
          {
            shares: {
              some: {
                userId: userId,
                permission: 'admin'
              }
            }
          }
        ]
      },
      include: {
        user: true,
        shares: {
          include: {
            user: true
          }
        }
      }
    })

    if (!project) {
      return NextResponse.json({ error: 'Projet non trouvé ou accès refusé' }, { status: 404 })
    }

    // Vérifier si l'utilisateur à inviter existe
    const targetUser = await prisma.user.findUnique({
      where: { email }
    })

    // Vérifier si une invitation existe déjà
    const existingInvitation = await prisma.invitation.findUnique({
      where: {
        projectId_email: {
          projectId: projectId,
          email: email
        }
      }
    })

    if (existingInvitation) {
      return NextResponse.json({ error: 'Invitation déjà envoyée à cet utilisateur' }, { status: 400 })
    }

    // Vérifier si l'utilisateur n'a pas déjà accès au projet
    if (targetUser) {
      const existingShare = await prisma.projectShare.findUnique({
        where: {
          projectId_userId: {
            projectId: projectId,
            userId: targetUser.id
          }
        }
      })

      if (existingShare || project.userId === targetUser.id) {
        return NextResponse.json({ error: 'Cet utilisateur a déjà accès à ce projet' }, { status: 400 })
      }
    }

    // Créer l'invitation
    const invitation = await prisma.invitation.create({
      data: {
        projectId: projectId,
        senderId: userId,
        receiverId: targetUser?.id || null,
        email: email,
        permission: permission,
        message: message || null
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        receiver: targetUser ? {
          select: {
            id: true,
            name: true,
            email: true
          }
        } : false
      }
    })

    // Créer une notification pour le destinataire si il existe
    if (targetUser) {
      await prisma.notification.create({
        data: {
          userId: targetUser.id,
          type: 'invitation_received',
          title: 'Nouvelle invitation de collaboration',
          message: `${project.user.name} vous invite à collaborer sur le projet "${project.name}"`,
          data: JSON.stringify({
            projectId: projectId,
            invitationId: invitation.id,
            permission: permission
          })
        }
      })

      // Émettre un événement Socket.IO en temps réel
      if (global.io) {
        global.io.to(`user_${targetUser.id}`).emit('invitation_received', {
          invitationId: invitation.id,
          projectId: projectId,
          projectName: project.name,
          senderName: project.user.name,
          permission: permission,
          message: message
        })
      }
    }

    return NextResponse.json({
      message: 'Invitation envoyée avec succès',
      invitation: invitation
    })

  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'invitation:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// Récupérer les collaborateurs d'un projet
export async function GET(request, { params }) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const userId = decoded.userId
    const projectId = parseInt(params.id)

    // Vérifier que l'utilisateur a accès au projet
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { userId: userId },
          {
            shares: {
              some: {
                userId: userId
              }
            }
          }
        ]
      }
    })

    if (!project) {
      return NextResponse.json({ error: 'Projet non trouvé ou accès refusé' }, { status: 404 })
    }

    // Récupérer tous les collaborateurs
    const shares = await prisma.projectShare.findMany({
      where: { projectId: projectId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        owner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    // Récupérer les invitations en attente
    const invitations = await prisma.invitation.findMany({
      where: { 
        projectId: projectId,
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

    return NextResponse.json({
      shares: shares,
      invitations: invitations
    })

  } catch (error) {
    console.error('Erreur lors de la récupération des collaborateurs:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
} 