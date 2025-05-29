import { NextResponse } from 'next/server'
import { checkMaintenanceMode, invalidateMaintenanceCache } from '@/lib/maintenanceMiddleware'

export async function GET(request) {
  try {
    // Vérifier si on doit forcer l'actualisation du cache
    const { searchParams } = new URL(request.url)
    const forceRefresh = searchParams.has('refresh')
    
    if (forceRefresh) {
      invalidateMaintenanceCache()
    }
    
    const { isEnabled, message } = await checkMaintenanceMode()
    
    return NextResponse.json({
      isEnabled,
      message
    })
  } catch (error) {
    console.error('Erreur vérification maintenance:', error)
    return NextResponse.json({
      isEnabled: false,
      message: 'Le site est temporairement en maintenance. Veuillez réessayer plus tard.'
    })
  }
} 