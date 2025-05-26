import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyToken, getTokenFromRequest } from '@/lib/auth'
import jwt from 'jsonwebtoken'

// Récupérer les informations d'un lien de partage
export async function GET(request, { params }) {
  try {
    const shareId = params.id

    const shareLink = await prisma.shareLink.findUnique({
      where: { id: shareId },
      include: {
        project: {
          select: { 
            id: true, 
            name: true, 
            description: true, 
            emoji: true, 
            color: true 
          }
        },
        user: {
          select: { name: true }
        }
      }
    })

    if (!shareLink) {
      return NextResponse.json({ error: 'Lien de partage non trouvé' }, { status: 404 })
    }

    if (!shareLink.active) {
      return NextResponse.json({ error: 'Ce lien de partage n\'est plus actif' }, { status: 410 })
    }

    // Vérifier l'expiration
    if (shareLink.expiresAt && new Date() > shareLink.expiresAt) {
      await prisma.shareLink.update({
        where: { id: shareId },
        data: { active: false }
      })
      return NextResponse.json({ error: 'Ce lien de partage a expiré' }, { status: 410 })
    }

    // Vérifier le nombre d'utilisations
    if (shareLink.maxUses && shareLink.usedCount >= shareLink.maxUses) {
      await prisma.shareLink.update({
        where: { id: shareId },
        data: { active: false }
      })
      return NextResponse.json({ error: 'Ce lien de partage a atteint sa limite d\'utilisation' }, { status: 410 })
    }

    return NextResponse.json({
      project: shareLink.project,
      permission: shareLink.permission,
      createdBy: shareLink.user.name,
      expiresAt: shareLink.expiresAt,
      maxUses: shareLink.maxUses,
      usedCount: shareLink.usedCount
    })

  } catch (error) {
    console.error('Erreur:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// Utiliser un lien de partage pour rejoindre un projet
export async function POST(request, { params }) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token requis' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const userId = decoded.userId
    const shareId = params.id

    const shareLink = await prisma.shareLink.findUnique({
      where: { id: shareId },
      include: {
        project: {
          include: {
            user: {
              select: { name: true }
            }
          }
        }
      }
    })

    if (!shareLink) {
      return NextResponse.json({ error: 'Lien de partage non trouvé' }, { status: 404 })
    }

    if (!shareLink.active) {
      return NextResponse.json({ error: 'Ce lien de partage n\'est plus actif' }, { status: 410 })
    }

    // Vérifier l'expiration
    if (shareLink.expiresAt && new Date() > shareLink.expiresAt) {
      await prisma.shareLink.update({
        where: { id: shareId },
        data: { active: false }
      })
      return NextResponse.json({ error: 'Ce lien de partage a expiré' }, { status: 410 })
    }

    // Vérifier le nombre d'utilisations
    if (shareLink.maxUses && shareLink.usedCount >= shareLink.maxUses) {
      await prisma.shareLink.update({
        where: { id: shareId },
        data: { active: false }
      })
      return NextResponse.json({ error: 'Ce lien de partage a atteint sa limite d\'utilisation' }, { status: 410 })
    }

    // Vérifier que l'utilisateur n'est pas déjà membre du projet
    const existingShare = await prisma.projectShare.findUnique({
      where: {
        projectId_userId: {
          projectId: shareLink.projectId,
          userId
        }
      }
    })

    if (existingShare) {
      return NextResponse.json({ error: 'Vous êtes déjà membre de ce projet' }, { status: 400 })
    }

    // Vérifier que l'utilisateur n'est pas le propriétaire
    if (shareLink.project.userId === userId) {
      return NextResponse.json({ error: 'Vous êtes déjà propriétaire de ce projet' }, { status: 400 })
    }

    // Ajouter l'utilisateur au projet
    const projectShare = await prisma.projectShare.create({
      data: {
        projectId: shareLink.projectId,
        userId,
        ownerId: shareLink.project.userId,
        permission: shareLink.permission
      }
    })

    // Incrémenter le compteur d'utilisation
    await prisma.shareLink.update({
      where: { id: shareId },
      data: { usedCount: { increment: 1 } }
    })

    // Créer une notification pour le propriétaire du projet
    await prisma.notification.create({
      data: {
        userId: shareLink.project.userId,
        type: 'project_joined_via_link',
        title: 'Nouveau membre',
        message: `${decoded.name} a rejoint votre projet "${shareLink.project.name}" via un lien de partage`,
        data: JSON.stringify({ projectId: shareLink.projectId, newUserId: userId })
      }
    })

    return NextResponse.json({ 
      message: 'Vous avez rejoint le projet avec succès !',
      project: shareLink.project,
      permission: shareLink.permission
    }, { status: 201 })

  } catch (error) {
    console.error('Erreur:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// Désactiver un lien de partage
export async function DELETE(request, { params }) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token requis' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const userId = decoded.userId
    const shareId = params.id

    const shareLink = await prisma.shareLink.findUnique({
      where: { id: shareId },
      include: {
        project: true
      }
    })

    if (!shareLink) {
      return NextResponse.json({ error: 'Lien de partage non trouvé' }, { status: 404 })
    }

    // Vérifier les permissions (propriétaire du projet ou créateur du lien)
    if (shareLink.project.userId !== userId && shareLink.userId !== userId) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    await prisma.shareLink.update({
      where: { id: shareId },
      data: { active: false }
    })

    return NextResponse.json({ message: 'Lien de partage désactivé' })

  } catch (error) {
    console.error('Erreur:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
} 