import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { withAdminAuth } from '@/lib/adminMiddleware'
import { logActivity, ACTIONS, ENTITIES, extractRequestInfo } from '@/lib/activityLogger'
import { invalidateMaintenanceCache } from '@/lib/maintenanceMiddleware'

const prisma = new PrismaClient()

// Paramètres par défaut du système
const DEFAULT_SETTINGS = {
  maintenanceMode: 'false',
  registrationEnabled: 'true',
  emailVerificationRequired: 'true',
  maxProjectsPerUser: '10',
  maxTodosPerProject: '100',
  sessionTimeout: '7',
  maintenanceMessage: 'Le site est temporairement en maintenance. Veuillez réessayer plus tard.'
}

async function getHandler(request) {
  try {
    console.log('🔍 [Settings API] Récupération des paramètres système')
    
    // Récupérer tous les paramètres
    const settings = await prisma.systemSettings.findMany({
      select: {
        key: true,
        value: true,
        description: true,
        updatedAt: true
      }
    })

    // Convertir en objet avec les valeurs par défaut
    const settingsObject = { ...DEFAULT_SETTINGS }
    settings.forEach(setting => {
      settingsObject[setting.key] = setting.value
    })

    // Convertir les valeurs booléennes et numériques
    const processedSettings = {
      maintenanceMode: settingsObject.maintenanceMode === 'true',
      registrationEnabled: settingsObject.registrationEnabled === 'true',
      emailVerificationRequired: settingsObject.emailVerificationRequired === 'true',
      maxProjectsPerUser: parseInt(settingsObject.maxProjectsPerUser),
      maxTodosPerProject: parseInt(settingsObject.maxTodosPerProject),
      sessionTimeout: parseInt(settingsObject.sessionTimeout),
      maintenanceMessage: settingsObject.maintenanceMessage
    }

    console.log('✅ [Settings API] Paramètres récupérés:', Object.keys(processedSettings))
    
    return NextResponse.json({
      settings: processedSettings,
      lastUpdated: settings.length > 0 ? Math.max(...settings.map(s => new Date(s.updatedAt).getTime())) : null
    })

  } catch (error) {
    console.error('❌ [Settings API] Erreur:', error)
    return NextResponse.json({ error: 'Erreur lors de la récupération des paramètres' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

async function putHandler(request) {
  try {
    const body = await request.json()
    const { settings } = body

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json({ error: 'Paramètres invalides' }, { status: 400 })
    }

    console.log('🔍 [Settings API] Mise à jour des paramètres:', Object.keys(settings))

    const currentUser = request.user
    const { ipAddress, userAgent } = extractRequestInfo(request)

    // Préparer les mises à jour
    const updates = []
    
    for (const [key, value] of Object.entries(settings)) {
      if (DEFAULT_SETTINGS.hasOwnProperty(key)) {
        // Convertir en string pour le stockage
        let stringValue = value
        if (typeof value === 'boolean') {
          stringValue = value.toString()
        } else if (typeof value === 'number') {
          stringValue = value.toString()
        }

        updates.push({
          key,
          value: stringValue,
          description: getSettingDescription(key),
          updatedBy: currentUser.id
        })
      }
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'Aucun paramètre valide à mettre à jour' }, { status: 400 })
    }

    // Effectuer les mises à jour en transaction
    await prisma.$transaction(async (tx) => {
      for (const update of updates) {
        await tx.systemSettings.upsert({
          where: { key: update.key },
          update: {
            value: update.value,
            description: update.description,
            updatedBy: update.updatedBy,
            updatedAt: new Date()
          },
          create: update
        })
      }
    })

    // Logger l'activité
    await logActivity({
      userId: currentUser.id,
      action: ACTIONS.UPDATE,
      entity: ENTITIES.SYSTEM,
      details: {
        action: 'system_settings_update',
        updatedSettings: Object.keys(settings),
        changes: settings
      },
      ipAddress,
      userAgent
    })

    // Invalider le cache de maintenance si nécessaire
    if (settings.hasOwnProperty('maintenanceMode') || settings.hasOwnProperty('maintenanceMessage')) {
      invalidateMaintenanceCache()
    }

    console.log('✅ [Settings API] Paramètres mis à jour avec succès')

    return NextResponse.json({ 
      success: true, 
      message: 'Paramètres mis à jour avec succès',
      updatedSettings: Object.keys(settings)
    })

  } catch (error) {
    console.error('❌ [Settings API] Erreur lors de la mise à jour:', error)
    return NextResponse.json({ error: 'Erreur lors de la mise à jour des paramètres' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

function getSettingDescription(key) {
  const descriptions = {
    maintenanceMode: 'Active le mode maintenance pour bloquer l\'accès au site',
    registrationEnabled: 'Permet aux nouveaux utilisateurs de s\'inscrire',
    emailVerificationRequired: 'Exige la vérification email lors de l\'inscription',
    maxProjectsPerUser: 'Nombre maximum de projets par utilisateur',
    maxTodosPerProject: 'Nombre maximum de tâches par projet',
    sessionTimeout: 'Durée de validité des sessions en jours',
    maintenanceMessage: 'Message affiché pendant la maintenance'
  }
  return descriptions[key] || null
}

export const GET = withAdminAuth(getHandler, ['ADMIN'])
export const PUT = withAdminAuth(putHandler, ['ADMIN']) 