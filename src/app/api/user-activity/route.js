import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getAuthenticatedUser } from '@/lib/apiMiddleware'
import { logAdd, generateTextLog, extractRequestInfo } from '@/lib/userActivityLogger'

const prisma = new PrismaClient()

// Fonction pour construire l'URL complète
const getFullUrl = (request, path) => {
  // 1. Variable d'environnement explicite (priorité)
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return `${process.env.NEXT_PUBLIC_APP_URL}${path}`
  }
  
  // 2. Variables Vercel automatiques
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}${path}`
  }
  
  // 3. Détection basée sur l'environnement
  if (process.env.NODE_ENV === 'production') {
    // En production, utiliser le domaine par défaut
    return `https://todo.chghosts.fr${path}`
  }
  
  // 4. Fallback développement
  return `http://localhost:3000${path}`
}

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
    
    // Pour les navigations, utiliser l'URL complète dans element
    let finalElement = element
    if (finalTypeLog === 'Navigation' && details?.path) {
      finalElement = getFullUrl(request, details.path)
    } else if (!finalElement) {
      finalElement = 'navigation'
    }

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
      textLog,
      element: finalElement
    })

  } catch (error) {
    console.error('Erreur lors de l\'enregistrement de l\'activité:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
} 