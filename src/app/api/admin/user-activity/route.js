import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { withAdminAuth } from '@/lib/adminMiddleware'

const prisma = new PrismaClient()

async function getHandler(request) {
  try {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page')) || 1
    const limit = parseInt(url.searchParams.get('limit')) || 50
    const userId = url.searchParams.get('userId') || ''
    const action = url.searchParams.get('action') || ''
    const startDate = url.searchParams.get('startDate') || ''
    const endDate = url.searchParams.get('endDate') || ''

    const skip = (page - 1) * limit

    // Construire les conditions de recherche
    let whereClause = {}

    if (userId) {
      // Recherche par nom d'utilisateur ou ID
      if (isNaN(parseInt(userId))) {
        whereClause.user = {
          name: {
            contains: userId,
            mode: 'insensitive'
          }
        }
      } else {
        whereClause.userId = parseInt(userId)
      }
    }

    if (action) {
      whereClause.typeLog = action
    }

    if (startDate || endDate) {
      whereClause.createdAt = {}
      if (startDate) {
        whereClause.createdAt.gte = new Date(startDate)
      }
      if (endDate) {
        whereClause.createdAt.lte = new Date(endDate + 'T23:59:59.999Z')
      }
    }

    // Récupérer les logs avec pagination
    const [logs, totalCount] = await Promise.all([
      prisma.userActivity.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              profileImage: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.userActivity.count({ where: whereClause })
    ])

    // Statistiques par type d'action
    const stats = await prisma.userActivity.groupBy({
      by: ['typeLog'],
      _count: {
        typeLog: true
      },
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Dernières 24h
        }
      }
    })

    // Transformer les stats en objet plus facile à utiliser
    const statsObject = {
      navigation: 0,
      create: 0,
      edit: 0,
      delete: 0
    }

    stats.forEach(stat => {
      switch (stat.typeLog.toLowerCase()) {
        case 'navigation':
          statsObject.navigation = stat._count.typeLog
          break
        case 'create':
          statsObject.create = stat._count.typeLog
          break
        case 'edit':
          statsObject.edit = stat._count.typeLog
          break
        case 'delete':
          statsObject.delete = stat._count.typeLog
          break
      }
    })

    return NextResponse.json({
      logs,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      },
      stats: statsObject
    })

  } catch (error) {
    console.error('Erreur lors de la récupération des activités utilisateur:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

export const GET = withAdminAuth(getHandler, ['ADMIN', 'MODERATOR']) 