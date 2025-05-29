import { NextResponse } from 'next/server'
import { checkMaintenanceMode } from '@/lib/maintenanceMiddleware'

export async function GET() {
  try {
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