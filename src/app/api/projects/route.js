import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'
import { withApiLogging, getAuthenticatedUser } from '@/lib/apiMiddleware'

const prisma = new PrismaClient()

async function getHandler(request) {
  try {
    const authResult = await getAuthenticatedUser(request)
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const { user } = authResult
    const userId = user.id

    // Récupérer les projets de l'utilisateur
    const projects = await prisma.project.findMany({
      where: {
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
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        shares: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        _count: {
          select: {
            todos: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    // Ajouter les propriétés isOwner et permission pour chaque projet
    const projectsWithPermissions = projects.map(project => {
      const isOwner = project.userId === userId
      let permission = null
      let sharedWith = []

      if (!isOwner) {
        // Trouver la permission de l'utilisateur actuel
        const userShare = project.shares.find(share => share.userId === userId)
        permission = userShare ? userShare.permission : null
      }

      // Filtrer les partages pour ne pas inclure l'utilisateur actuel
      sharedWith = project.shares.filter(share => share.userId !== userId)

      return {
        ...project,
        isOwner,
        permission,
        sharedWith
      }
    })

    return NextResponse.json(projectsWithPermissions)
  } catch (error) {
    console.error('Erreur lors de la récupération des projets:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

async function postHandler(request) {
  try {
    const authResult = await getAuthenticatedUser(request)
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const { user } = authResult
    const userId = user.id

    const body = await request.json()
    const { name, description, color, emoji } = body

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Le nom du projet est requis' }, { status: 400 })
    }

    const project = await prisma.project.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        color: color || '#3B82F6',
        emoji: emoji || '📁',
        userId: userId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            todos: true
          }
        }
      }
    })

    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    console.error('Erreur lors de la création du projet:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export const GET = withApiLogging(getHandler)
export const POST = withApiLogging(postHandler) 