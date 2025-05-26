import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyToken, getTokenFromRequest } from '@/lib/auth'

async function getUserFromRequest(request) {
  const token = getTokenFromRequest(request)
  if (!token) return null
  
  const decoded = verifyToken(token)
  if (!decoded) return null
  
  return decoded.userId
}

export async function GET(request, { params }) {
  try {
    const userId = await getUserFromRequest(request)
    if (!userId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { id } = params
    
    // Vérifier que l'utilisateur a accès au projet
    const project = await prisma.project.findFirst({
      where: {
        id: parseInt(id),
        OR: [
          { userId: userId }, // Propriétaire
          {
            shares: {
              some: {
                userId: userId
              }
            }
          }
        ]
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        shares: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        },
        todos: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            },
            category: true
          },
          orderBy: [
            { completed: 'asc' },
            { createdAt: 'desc' }
          ]
        },
        categories: true
      }
    })

    if (!project) {
      return NextResponse.json({ error: 'Projet non trouvé ou accès refusé' }, { status: 404 })
    }

    // Déterminer les permissions de l'utilisateur
    const isOwner = project.userId === userId
    const userShare = project.shares.find(share => share.userId === userId)
    const userPermission = isOwner ? 'admin' : userShare?.permission || 'view'
    
    return NextResponse.json({
      ...project,
      isOwner,
      permission: userPermission,
      sharedWith: project.shares
    })
  } catch (error) {
    console.error('Erreur lors de la récupération du projet:', error)
    return NextResponse.json({ error: 'Erreur lors de la récupération du projet' }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    const userId = await getUserFromRequest(request)
    if (!userId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { id } = params
    const { name, description, color, emoji } = await request.json()
    
    // Vérifier que l'utilisateur a les droits de modification
    const projectAccess = await prisma.project.findFirst({
      where: {
        id: parseInt(id),
        OR: [
          { userId: userId }, // Propriétaire
          {
            shares: {
              some: {
                userId: userId,
                permission: { in: ['edit', 'admin'] }
              }
            }
          }
        ]
      }
    })

    if (!projectAccess) {
      return NextResponse.json({ error: 'Projet non trouvé ou permissions insuffisantes' }, { status: 404 })
    }
    
    const project = await prisma.project.update({
      where: {
        id: parseInt(id)
      },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(color !== undefined && { color }),
        ...(emoji !== undefined && { emoji })
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        shares: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        }
      }
    })

    const isOwner = project.userId === userId
    const userShare = project.shares.find(share => share.userId === userId)
    const userPermission = isOwner ? 'admin' : userShare?.permission || 'view'
    
    return NextResponse.json({
      ...project,
      isOwner,
      permission: userPermission,
      sharedWith: project.shares
    })
  } catch (error) {
    console.error('Erreur lors de la mise à jour du projet:', error)
    return NextResponse.json({ error: 'Erreur lors de la mise à jour du projet' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const userId = await getUserFromRequest(request)
    if (!userId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { id } = params
    
    // Vérifier que l'utilisateur est propriétaire ou admin
    const projectAccess = await prisma.project.findFirst({
      where: {
        id: parseInt(id),
        OR: [
          { userId: userId }, // Propriétaire
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
        shares: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        }
      }
    })

    if (!projectAccess) {
      return NextResponse.json({ error: 'Projet non trouvé ou permissions insuffisantes' }, { status: 404 })
    }

    const isOwner = projectAccess.userId === userId

    // Créer des notifications pour les collaborateurs avant suppression
    if (projectAccess.shares.length > 0) {
      const notifications = projectAccess.shares
        .filter(share => share.userId !== userId)
        .map(share => ({
          userId: share.userId,
          type: 'project_deleted',
          title: 'Projet supprimé',
          message: `${isOwner ? 'Le propriétaire' : 'Un administrateur'} a supprimé le projet "${projectAccess.name}"`,
          data: JSON.stringify({
            projectId: parseInt(id),
            deletedBy: userId
          })
        }))

      if (notifications.length > 0) {
        await prisma.notification.createMany({
          data: notifications
        })
      }
    }
    
    await prisma.project.delete({
      where: {
        id: parseInt(id)
      }
    })
    
    return NextResponse.json({ message: 'Projet supprimé avec succès' })
  } catch (error) {
    console.error('Erreur lors de la suppression du projet:', error)
    return NextResponse.json({ error: 'Erreur lors de la suppression du projet' }, { status: 500 })
  }
} 