import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

// Fonction pour invalider le cache du middleware
function invalidateMiddlewareCache() {
  // Accéder au cache du middleware (variable globale)
  if (global.maintenanceCache) {
    global.maintenanceCache.lastCheck = 0
    console.log('🔧 [Settings API] Cache middleware invalidé')
  }
}

// Fonction pour vérifier l'authentification
async function verifyAuth(request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { error: 'Token manquant', status: 401 }
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, name: true, email: true, role: true }
    })

    if (!user) {
      return { error: 'Utilisateur non trouvé', status: 401 }
    }

    if (user.role !== 'ADMIN') {
      return { error: 'Accès refusé. Seuls les administrateurs peuvent modifier les paramètres.', status: 403 }
    }

    console.log(`✅ [Auth Middleware] Utilisateur trouvé: { userId: ${user.id}, userName: '${user.name}' }`)
    return { user }
  } catch (error) {
    console.error('❌ [Auth Middleware] Erreur:', error)
    return { error: 'Token invalide', status: 401 }
  }
}

export async function GET(request) {
  try {
    console.log('🔍 [Settings API] Récupération des paramètres système')
    
    const authResult = await verifyAuth(request)
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const settings = await prisma.systemSettings.findMany()
    
    const settingsObject = settings.reduce((acc, setting) => {
      // Convertir les valeurs en types appropriés
      if (setting.key === 'maintenanceMode' || setting.key === 'registrationEnabled' || setting.key === 'emailVerificationRequired') {
        acc[setting.key] = setting.value === 'true'
      } else if (setting.key === 'maxProjectsPerUser' || setting.key === 'maxTodosPerProject' || setting.key === 'sessionTimeout') {
        acc[setting.key] = parseInt(setting.value) || 0
      } else {
        acc[setting.key] = setting.value || ''
      }
      return acc
    }, {})

    // Valeurs par défaut si les paramètres n'existent pas
    const defaultSettings = {
      maintenanceMode: false,
      registrationEnabled: true,
      emailVerificationRequired: true,
      maxProjectsPerUser: 10,
      maxTodosPerProject: 100,
      sessionTimeout: 7,
      maintenanceMessage: 'Le site est temporairement en maintenance. Veuillez réessayer plus tard.'
    }

    const finalSettings = { ...defaultSettings, ...settingsObject }
    
    console.log('✅ [Settings API] Paramètres récupérés:', Object.keys(finalSettings))
    
    return NextResponse.json({ 
      success: true, 
      settings: finalSettings 
    })
  } catch (error) {
    console.error('❌ [Settings API] Erreur:', error)
    return NextResponse.json({ 
      error: 'Erreur lors de la récupération des paramètres' 
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

export async function PUT(request) {
  try {
    const authResult = await verifyAuth(request)
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const { settings } = await request.json()
    
    if (!settings || typeof settings !== 'object') {
      return NextResponse.json({ 
        error: 'Paramètres invalides' 
      }, { status: 400 })
    }

    console.log('🔍 [Settings API] Mise à jour des paramètres:', Object.keys(settings))

    // Mettre à jour chaque paramètre
    for (const [key, value] of Object.entries(settings)) {
      await prisma.systemSettings.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) }
      })
    }

    // Si le mode maintenance a été modifié, invalider le cache
    if ('maintenanceMode' in settings) {
      invalidateMiddlewareCache()
      console.log('🔧 [Settings API] Mode maintenance modifié, cache invalidé')
    }

    console.log('✅ [Settings API] Paramètres mis à jour avec succès')
    
    return NextResponse.json({ 
      success: true, 
      message: 'Paramètres mis à jour avec succès' 
    })
  } catch (error) {
    console.error('❌ [Settings API] Erreur:', error)
    return NextResponse.json({ 
      error: 'Erreur lors de la mise à jour des paramètres' 
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
} 