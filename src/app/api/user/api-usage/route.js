import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'
import { getApiStats } from '@/lib/apiLogger'
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

    // Récupérer l'utilisateur avec sa clé API
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        apiKeys: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    }

    // Plan de l'utilisateur (par défaut gratuit)
    const userPlan = user.plan || 'free'
    
    // Limites selon le plan
    const planLimits = {
      free: {
        name: 'Gratuit',
        monthlyRequests: 1000,
        requestsPerMinute: 10,
        features: ['Endpoints de base', 'Support communautaire']
      },
      pro: {
        name: 'Pro',
        monthlyRequests: 100000,
        requestsPerMinute: 100,
        features: ['Accès complet à l\'API', 'Webhooks', 'Support prioritaire']
      }
    }

    const currentPlan = planLimits[userPlan]

    // Récupérer les statistiques réelles depuis les logs
    const currentDate = new Date()
    
    // Utiliser UTC pour les calculs de dates pour éviter les problèmes de fuseau horaire
    const startOfMonth = new Date(Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth(), 1))
    const endOfMonth = new Date(Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth() + 1, 0, 23, 59, 59, 999))

    // Statistiques du mois en cours
    const monthlyStats = await getApiStats(userId, startOfMonth, endOfMonth)
    
    // Statistiques globales (tous les temps) - UNIQUEMENT EXTERNES
    const allTimeStats = await getApiStats(userId)

    // Calculer l'utilisation externe UNIQUEMENT (API avec clé)
    const externalUsedRequests = monthlyStats.external
    const externalRemainingRequests = currentPlan.monthlyRequests - externalUsedRequests
    const externalUsagePercentage = (externalUsedRequests / currentPlan.monthlyRequests) * 100

    // Endpoints externes uniquement
    const externalEndpoints = allTimeStats.topEndpoints
      .filter(ep => !ep.isInternal)
      .slice(0, 5)
      .map(ep => ({
        endpoint: ep.endpoint,
        method: ep.method,
        requests: ep.requests
      }))

    // Prendre la première clé API (ou null si aucune)
    const apiKey = user.apiKeys && user.apiKeys.length > 0 ? user.apiKeys[0] : null

    const apiUsage = {
      plan: {
        name: currentPlan.name,
        type: userPlan,
        features: currentPlan.features
      },
      usage: {
        // UNIQUEMENT les statistiques externes visibles
        current: externalUsedRequests,
        limit: currentPlan.monthlyRequests,
        remaining: Math.max(0, externalRemainingRequests),
        percentage: Math.round(externalUsagePercentage * 100) / 100,
        resetDate: new Date(Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth() + 1, 1)).toISOString()
      },
      rateLimit: {
        requestsPerMinute: currentPlan.requestsPerMinute,
        currentUsage: 0, // TODO: Calculer l'utilisation actuelle par minute
        appliesTo: "API externe uniquement"
      },
      statistics: {
        // Statistiques des 7 derniers jours - EXTERNES UNIQUEMENT
        last7Days: allTimeStats.last7Days.map(day => ({
          date: day.date,
          requests: day.external // Uniquement les requêtes externes
        })),
        // Top endpoints - EXTERNES UNIQUEMENT
        topEndpoints: externalEndpoints,
        // Codes de réponse - EXTERNES UNIQUEMENT
        responseCodes: allTimeStats.responseCodes.external || {},
        // Total des requêtes - EXTERNES UNIQUEMENT
        totalRequests: allTimeStats.external,
        // Temps de réponse moyen - EXTERNES UNIQUEMENT
        averageResponseTime: allTimeStats.averageResponseTime
      },
      apiKey: {
        exists: !!apiKey,
        createdAt: apiKey?.createdAt,
        lastUsed: apiKey?.lastUsed
      }
    }

    return NextResponse.json(apiUsage)

  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques API:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export const GET = withApiLogging(handler, { isInternal: true }) 