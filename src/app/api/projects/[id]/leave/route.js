import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyToken, getTokenFromRequest } from '@/lib/auth'
import jwt from 'jsonwebtoken'

// Quitter un projet (supprimer le partage)
export async function DELETE(request, { params }) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const userId = decoded.userId
    const projectId = parseInt(params.id)

    // Vérifier que le projet existe
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { 
        id: true, 
        name: true, 
        userId: true 
      }
    })

    if (!project) {
      return NextResponse.json({ error: 'Projet non trouvé' }, { status: 404 })
    }

    // Vérifier que l'utilisateur n'est pas le propriétaire du projet
    if (project.userId === userId) {
      return NextResponse.json({ error: 'Le propriétaire ne peut pas quitter son propre projet' }, { status: 400 })
    }

    // Vérifier que l'utilisateur a accès au projet
    const projectShare = await prisma.projectShare.findUnique({
      where: {
        projectId_userId: {
          projectId: projectId,
          userId: userId
        }
      }
    })

    if (!projectShare) {
      return NextResponse.json({ error: 'Vous n\'avez pas accès à ce projet' }, { status: 403 })
    }

    // Supprimer le partage du projet
    await prisma.projectShare.delete({
      where: {
        projectId_userId: {
          projectId: projectId,
          userId: userId
        }
      }
    })

    // Supprimer toutes les invitations en attente pour cet utilisateur sur ce projet
    await prisma.invitation.deleteMany({
      where: {
        projectId: projectId,
        receiverId: userId,
        status: 'pending'
      }
    })

    return NextResponse.json({
      message: 'Vous avez quitté le projet avec succès'
    })

  } catch (error) {
    console.error('Erreur lors de la sortie du projet:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
} 