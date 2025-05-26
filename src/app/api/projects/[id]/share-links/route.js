import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyToken, getTokenFromRequest } from '@/lib/auth'
import jwt from 'jsonwebtoken'

// Récupérer les liens de partage d'un projet
export async function GET(request, { params }) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token requis' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const userId = decoded.userId
    const projectId = parseInt(params.id)

    // Vérifier les permissions sur le projet
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { userId }, // Propriétaire
          { 
            shares: {
              some: {
                userId,
                permission: { in: ['admin', 'edit'] }
              }
            }
          }
        ]
      }
    })

    if (!project) {
      return NextResponse.json({ error: 'Projet non trouvé ou accès non autorisé' }, { status: 404 })
    }

    // Récupérer les liens de partage actifs
    const shareLinks = await prisma.shareLink.findMany({
      where: {
        projectId,
        active: true
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ shareLinks })

  } catch (error) {
    console.error('Erreur:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// Créer un nouveau lien de partage
export async function POST(request, { params }) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token requis' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const userId = decoded.userId
    const projectId = parseInt(params.id)

    const { permission = 'view', expiresAt, maxUses } = await request.json()

    // Vérifier les permissions sur le projet
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { userId }, // Propriétaire
          { 
            shares: {
              some: {
                userId,
                permission: { in: ['admin', 'edit'] }
              }
            }
          }
        ]
      }
    })

    if (!project) {
      return NextResponse.json({ error: 'Projet non trouvé ou accès non autorisé' }, { status: 404 })
    }

    // Valider la permission
    if (!['view', 'edit', 'admin'].includes(permission)) {
      return NextResponse.json({ error: 'Permission invalide' }, { status: 400 })
    }

    // Créer le lien de partage
    const shareLink = await prisma.shareLink.create({
      data: {
        projectId,
        userId,
        permission,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        maxUses: maxUses ? parseInt(maxUses) : null
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    return NextResponse.json({ shareLink }, { status: 201 })

  } catch (error) {
    console.error('Erreur:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
} 