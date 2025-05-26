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

export async function GET(request) {
  try {
    const userId = await getUserFromRequest(request)
    if (!userId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Récupérer les projets propres à l'utilisateur
    const ownProjects = await prisma.project.findMany({
      where: {
        userId: userId
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
        _count: {
          select: {
            todos: true
          }
        }
      }
    })

    // Récupérer les projets partagés avec l'utilisateur
    const sharedProjects = await prisma.project.findMany({
      where: {
        shares: {
          some: {
            userId: userId
          }
        }
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
        _count: {
          select: {
            todos: true
          }
        }
      }
    })

    // Combiner et enrichir les projets avec les informations de partage
    const allProjects = [
      ...ownProjects.map(project => ({
        ...project,
        isOwner: true,
        permission: 'admin',
        sharedWith: project.shares
      })),
      ...sharedProjects.map(project => {
        const userShare = project.shares.find(share => share.userId === userId)
        return {
          ...project,
          isOwner: false,
          permission: userShare?.permission || 'view',
          sharedWith: project.shares
        }
      })
    ]

    // Trier les projets par date de création (plus récents en premier)
    const sortedProjects = allProjects.sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    )
    
    return NextResponse.json(sortedProjects)
  } catch (error) {
    console.error('Erreur lors de la récupération des projets:', error)
    return NextResponse.json({ error: 'Erreur lors de la récupération des projets' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const userId = await getUserFromRequest(request)
    if (!userId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { name, description, color, emoji } = await request.json()
    
    if (!name) {
      return NextResponse.json({ error: 'Le nom est requis' }, { status: 400 })
    }

    const project = await prisma.project.create({
      data: {
        name,
        description,
        color: color || '#3B82F6',
        emoji: emoji || '📁',
        userId
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        _count: {
          select: {
            todos: true
          }
        }
      }
    })
    
    return NextResponse.json({
      ...project,
      isOwner: true,
      permission: 'admin',
      sharedWith: []
    }, { status: 201 })
  } catch (error) {
    console.error('Erreur lors de la création du projet:', error)
    return NextResponse.json({ error: 'Erreur lors de la création du projet' }, { status: 500 })
  }
} 