import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function logApiCall({
  userId,
  apiKeyId = null,
  endpoint,
  method,
  statusCode,
  responseTime,
  userAgent = null,
  ipAddress = null,
  isInternal = false
}) {
  try {
    await prisma.apiLog.create({
      data: {
        userId,
        apiKeyId,
        endpoint,
        method,
        statusCode,
        responseTime,
        userAgent,
        ipAddress,
        isInternal
      }
    })
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement du log API:', error)
    // Ne pas faire échouer la requête si le log échoue
  }
}

export async function getApiStats(userId, startDate = null, endDate = null) {
  const whereClause = {
    userId,
    ...(startDate && endDate && {
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    })
  }

  // Statistiques générales
  const totalLogs = await prisma.apiLog.count({ where: whereClause })
  const externalLogs = await prisma.apiLog.count({ 
    where: { ...whereClause, isInternal: false } 
  })
  const internalLogs = await prisma.apiLog.count({ 
    where: { ...whereClause, isInternal: true } 
  })

  // Endpoints les plus utilisés
  const topEndpoints = await prisma.apiLog.groupBy({
    by: ['endpoint', 'method', 'isInternal'],
    where: whereClause,
    _count: {
      id: true
    },
    orderBy: {
      _count: {
        id: 'desc'
      }
    },
    take: 10
  })

  // Codes de réponse
  const responseCodes = await prisma.apiLog.groupBy({
    by: ['statusCode', 'isInternal'],
    where: whereClause,
    _count: {
      id: true
    }
  })

  // Temps de réponse moyen
  const avgResponseTime = await prisma.apiLog.aggregate({
    where: whereClause,
    _avg: {
      responseTime: true
    }
  })

  // Statistiques par jour (7 derniers jours)
  const last7Days = []
  for (let i = 6; i >= 0; i--) {
    // Créer une date UTC pour éviter les problèmes de fuseau horaire
    const date = new Date()
    date.setUTCDate(date.getUTCDate() - i)
    date.setUTCHours(0, 0, 0, 0)
    
    const nextDate = new Date(date)
    nextDate.setUTCDate(nextDate.getUTCDate() + 1)

    const dayStats = await prisma.apiLog.groupBy({
      by: ['isInternal'],
      where: {
        userId,
        createdAt: {
          gte: date,
          lt: nextDate
        }
      },
      _count: {
        id: true
      }
    })

    const external = dayStats.find(s => !s.isInternal)?._count?.id || 0
    const internal = dayStats.find(s => s.isInternal)?._count?.id || 0

    last7Days.push({
      date: date.toISOString().split('T')[0], // Format YYYY-MM-DD en UTC
      external,
      internal,
      total: external + internal
    })
  }

  return {
    total: totalLogs,
    external: externalLogs,
    internal: internalLogs,
    topEndpoints: topEndpoints.map(ep => ({
      endpoint: ep.endpoint,
      method: ep.method,
      requests: ep._count.id,
      isInternal: ep.isInternal
    })),
    responseCodes: responseCodes.reduce((acc, rc) => {
      const type = rc.isInternal ? 'internal' : 'external'
      if (!acc[type]) acc[type] = {}
      acc[type][rc.statusCode.toString()] = rc._count.id
      return acc
    }, {}),
    averageResponseTime: Math.round(avgResponseTime._avg.responseTime || 0),
    last7Days
  }
} 