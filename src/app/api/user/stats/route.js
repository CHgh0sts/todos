import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'
import { withApiLogging } from '@/lib/apiMiddleware'

const prisma = new PrismaClient()

async function handler(request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const userId = decoded.userId

    // Récupérer les statistiques de l'utilisateur
    const [
      totalTodos,
      completed,
      pending,
      overdue,
      highPriority,
      totalCategories,
      totalProjects,
      recentTodos
    ] = await Promise.all([
      // Total todos
      prisma.todo.count({
        where: {
          OR: [
            { userId: userId },
            {
              project: {
                shares: {
                  some: { userId: userId }
                }
              }
            }
          ]
        }
      }),
      
      // Todos terminés
      prisma.todo.count({
        where: {
          completed: true,
          OR: [
            { userId: userId },
            {
              project: {
                shares: {
                  some: { userId: userId }
                }
              }
            }
          ]
        }
      }),
      
      // Todos en cours
      prisma.todo.count({
        where: {
          completed: false,
          OR: [
            { userId: userId },
            {
              project: {
                shares: {
                  some: { userId: userId }
                }
              }
            }
          ]
        }
      }),
      
      // Todos en retard
      prisma.todo.count({
        where: {
          completed: false,
          dueDate: {
            lt: new Date()
          },
          OR: [
            { userId: userId },
            {
              project: {
                shares: {
                  some: { userId: userId }
                }
              }
            }
          ]
        }
      }),
      
      // Todos haute priorité
      prisma.todo.count({
        where: {
          priority: 'high',
          completed: false,
          OR: [
            { userId: userId },
            {
              project: {
                shares: {
                  some: { userId: userId }
                }
              }
            }
          ]
        }
      }),
      
      // Total catégories
      prisma.category.count({
        where: { userId: userId }
      }),
      
      // Total projets accessibles
      prisma.project.count({
        where: {
          OR: [
            { userId: userId },
            {
              shares: {
                some: { userId: userId }
              }
            }
          ]
        }
      }),
      
      // Todos récents
      prisma.todo.findMany({
        where: {
          OR: [
            { userId: userId },
            {
              project: {
                shares: {
                  some: { userId: userId }
                }
              }
            }
          ]
        },
        include: {
          category: true,
          project: {
            select: {
              id: true,
              name: true,
              color: true,
              emoji: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 5
      })
    ])

    const stats = {
      totalTodos,
      completed,
      pending,
      overdue,
      highPriority,
      totalCategories,
      totalProjects,
      recentTodos
    }

    return NextResponse.json(stats)

  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export const GET = withApiLogging(handler, { isInternal: true }) 