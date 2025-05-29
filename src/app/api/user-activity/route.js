import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getAuthenticatedUser } from '@/lib/apiMiddleware'
import { logAdd, generateTextLog, extractRequestInfo } from '@/lib/userActivityLogger'

const prisma = new PrismaClient()

export async function POST(request) {
  try {
    // Vérifier l'authentification
    const authResult = await getAuthenticatedUser(request)
    if (authResult.error) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const user = authResult.user
    const body = await request.json()
    const { action, element, typeLog, details } = body

    // Support des deux formats : ancien (action) et nouveau (typeLog)
    const finalTypeLog = typeLog || action
    const finalElement = element || 'navigation'

    if (!finalTypeLog) {
      return NextResponse.json({ error: 'Action ou typeLog requis' }, { status: 400 })
    }

    // Valider le type d'action
    const validActions = ['Navigation', 'Create', 'Edit', 'Delete', 'create', 'edit', 'delete']
    if (!validActions.includes(finalTypeLog)) {
      return NextResponse.json({ error: 'Type d\'action invalide' }, { status: 400 })
    }

    // Extraire les informations de la requête
    const { ipAddress, userAgent } = extractRequestInfo(request)

    // Générer le textLog automatiquement
    const textLog = generateTextLog(finalElement, finalTypeLog, user.name, null, null)

    // Enregistrer l'activité avec le nouveau système
    await logAdd(
      user.id,
      finalElement,
      finalTypeLog,
      null, // from
      null, // to
      ipAddress,
      userAgent,
      textLog
    )

    return NextResponse.json({ 
      success: true,
      message: 'Activité enregistrée',
      textLog
    })

  } catch (error) {
    console.error('Erreur lors de l\'enregistrement de l\'activité:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
} 