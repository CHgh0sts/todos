import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import prisma from '@/lib/prisma'
import { verifyToken, getTokenFromRequest } from '@/lib/auth'

// Supprimer un collaborateur d'un projet
export async function DELETE(request, { params }) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const userId = decoded.userId
    const shareId = parseInt(params.id)

    // Récupérer le partage avec les informations du projet
    const share = await prisma.projectShare.findUnique({
      where: { id: shareId },
      include: {
        project: {
          include: {
            user: true
          }
        },
        user: true
      }
    })

    if (!share) {
      return NextResponse.json({ error: 'Partage non trouvé' }, { status: 404 })
    }

    // Vérifier que l'utilisateur est le propriétaire du projet ou un admin
    const isOwner = share.project.userId === userId
    const isAdmin = await prisma.projectShare.findFirst({
      where: {
        projectId: share.projectId,
        userId: userId,
        permission: 'admin'
      }
    })

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Permissions insuffisantes' }, { status: 403 })
    }

    // Supprimer le partage
    await prisma.projectShare.delete({
      where: { id: shareId }
    })

    // Créer une notification pour l'utilisateur retiré
    await prisma.notification.create({
      data: {
        userId: share.userId,
        type: 'access_removed',
        title: 'Accès retiré',
        message: `Votre accès au projet "${share.project.name}" a été retiré`,
        data: JSON.stringify({
          projectId: share.projectId,
          removedBy: userId
        })
      }
    })

    return NextResponse.json({ message: 'Collaborateur retiré avec succès' })

  } catch (error) {
    console.error('Erreur lors de la suppression du collaborateur:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
} 