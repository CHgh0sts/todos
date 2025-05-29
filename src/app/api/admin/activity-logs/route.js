import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { withAdminAuth } from '@/lib/adminMiddleware'
import { logActivity, ACTIONS, ENTITIES, extractRequestInfo } from '@/lib/activityLogger'

const prisma = new PrismaClient()

async function getHandler(request) {
  try {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page')) || 1
    const limit = parseInt(url.searchParams.get('limit')) || 50
    const userId = url.searchParams.get('userId') || ''
    const action = url.searchParams.get('action') || ''
    const entity = url.searchParams.get('entity') || ''
    const startDate = url.searchParams.get('startDate') || ''
    const endDate = url.searchParams.get('endDate') || ''
    const sortBy = url.searchParams.get('sortBy') || 'createdAt'
    const sortOrder = url.searchParams.get('sortOrder') || 'desc'

    const skip = (page - 1) * limit

    // Construire les conditions de recherche
    let whereClause = {}

    if (userId) {
      whereClause.userId = parseInt(userId)
    }

    if (action) {
      whereClause.action = action
    }

    if (entity) {
      whereClause.entity = entity
    }

    if (startDate || endDate) {
      whereClause.createdAt = {}
      if (startDate) {
        whereClause.createdAt.gte = new Date(startDate)
      }
      if (endDate) {
        whereClause.createdAt.lte = new Date(endDate)
      }
    }

    // Récupérer les logs avec pagination
    const [logs, totalCount] = await Promise.all([
      prisma.activityLog.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          },
          targetUser: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          }
        },
        orderBy: {
          [sortBy]: sortOrder
        },
        skip,
        take: limit
      }),
      prisma.activityLog.count({ where: whereClause })
    ])

    // Statistiques globales
    const actionStats = await prisma.activityLog.groupBy({
      by: ['action'],
      _count: {
        action: true
      },
      orderBy: {
        _count: {
          action: 'desc'
        }
      },
      take: 10
    })

    const entityStats = await prisma.activityLog.groupBy({
      by: ['entity'],
      _count: {
        entity: true
      },
      orderBy: {
        _count: {
          entity: 'desc'
        }
      }
    })

    const dailyStats = await prisma.activityLog.groupBy({
      by: ['createdAt'],
      _count: {
        id: true
      },
      where: {
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 derniers jours
        }
      }
    })

    // Logger l'activité de consultation des logs
    const { ipAddress, userAgent } = extractRequestInfo(request)
    await logActivity({
      userId: request.user.id,
      action: ACTIONS.VIEW,
      entity: 'ACTIVITY_LOG',
      details: {
        action: 'admin_activity_logs_view',
        filters: { userId, action, entity, startDate, endDate, page, limit },
        resultCount: logs.length
      },
      ipAddress,
      userAgent
    })

    return NextResponse.json({
      logs,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      },
      stats: {
        actions: actionStats,
        entities: entityStats,
        dailyActivity: dailyStats
      }
    })

  } catch (error) {
    console.error('Erreur lors de la récupération des logs d\'activité:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

// Endpoint pour obtenir les statistiques détaillées
async function getStatsHandler(request) {
  try {
    const url = new URL(request.url)
    const period = url.searchParams.get('period') || '30' // jours

    const startDate = new Date(Date.now() - parseInt(period) * 24 * 60 * 60 * 1000)

    // Statistiques par utilisateur
    const userStats = await prisma.activityLog.groupBy({
      by: ['userId'],
      _count: {
        id: true
      },
      where: {
        createdAt: {
          gte: startDate
        }
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 10
    })

    // Enrichir avec les infos utilisateur
    const userIds = userStats.map(stat => stat.userId)
    const users = await prisma.user.findMany({
      where: {
        id: {
          in: userIds
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    })

    const enrichedUserStats = userStats.map(stat => ({
      ...stat,
      user: users.find(user => user.id === stat.userId)
    }))

    // Activité par heure
    const hourlyStats = await prisma.$queryRaw`
      SELECT 
        EXTRACT(HOUR FROM "createdAt") as hour,
        COUNT(*) as count
      FROM "activity_logs"
      WHERE "createdAt" >= ${startDate}
      GROUP BY EXTRACT(HOUR FROM "createdAt")
      ORDER BY hour
    `

    // Actions les plus fréquentes
    const topActions = await prisma.activityLog.groupBy({
      by: ['action', 'entity'],
      _count: {
        id: true
      },
      where: {
        createdAt: {
          gte: startDate
        }
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 20
    })

    return NextResponse.json({
      period: parseInt(period),
      userActivity: enrichedUserStats,
      hourlyActivity: hourlyStats,
      topActions
    })

  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

export const GET = withAdminAuth(getHandler, ['ADMIN', 'MODERATOR']) 