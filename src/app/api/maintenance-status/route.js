import { NextResponse } from 'next/server'
import { checkMaintenanceMode, invalidateMaintenanceCache } from '@/lib/maintenanceMiddleware'

export async function GET(request) {
  try {
    // Vérifier si on doit forcer l'actualisation du cache
    const { searchParams } = new URL(request.url)
    const forceRefresh = searchParams.has('refresh')
    
    if (forceRefresh) {
      invalidateMaintenanceCache()
      console.log('🔧 [Maintenance API] Cache invalidé par requête')
    }
    
    const { isEnabled, message } = await checkMaintenanceMode()
    
    const responseData = {
      isEnabled,
      message,
      timestamp: Date.now(),
      cached: !forceRefresh
    }

    const response = NextResponse.json(responseData)

    // Headers pour contrôler le cache
    if (forceRefresh) {
      response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
      response.headers.set('Pragma', 'no-cache')
      response.headers.set('Expires', '0')
    } else {
      // Cache court pour les requêtes normales (10 secondes)
      response.headers.set('Cache-Control', 'public, max-age=10, s-maxage=10')
    }
    
    // Headers CORS si nécessaire
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET')
    
    console.log('🔧 [Maintenance API] Réponse:', {
      isEnabled,
      forceRefresh,
      timestamp: new Date(responseData.timestamp).toISOString()
    })
    
    return response
  } catch (error) {
    console.error('❌ [Maintenance API] Erreur vérification maintenance:', error)
    
    const errorResponse = NextResponse.json({
      isEnabled: false,
      message: 'Le site est temporairement en maintenance. Veuillez réessayer plus tard.',
      timestamp: Date.now(),
      error: true,
      errorMessage: error.message
    }, { status: 500 })
    
    // Pas de cache en cas d'erreur
    errorResponse.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    errorResponse.headers.set('Access-Control-Allow-Origin', '*')
    
    return errorResponse
  }
} 