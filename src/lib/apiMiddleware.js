import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import prisma from '@/lib/prisma'
import { logApiCall } from './apiLogger'
import { verifyToken } from '@/lib/auth'

export function withApiLogging(handler, options = {}) {
  return async function(request, context) {
    const startTime = Date.now()
    let userId = null
    let apiKeyId = null
    let statusCode = 200
    let isInternal = options.isInternal || false

    try {
      // Extraire l'utilisateur du token JWT ou de la clé API
      const authHeader = request.headers.get('authorization')
      
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.substring(7)
        
        // Essayer d'abord comme JWT (token interne)
        const decoded = verifyToken(token)

        if (decoded?.userId) {
          userId = decoded.userId
          if (!options.isInternal) {
            isInternal = true
          }
        } else {
          // Sinon, essayer comme clé API
          const apiKey = await prisma.apiKey.findUnique({
            where: { key: token, active: true },
            include: { user: true }
          })
          
          if (apiKey) {
            userId = apiKey.userId
            apiKeyId = apiKey.id
            isInternal = false
            
            await prisma.apiKey.update({
              where: { id: apiKey.id },
              data: { lastUsed: new Date() }
            })
          }
        }
      }

      // Appeler le handler original
      const response = await handler(request, context)
      
      // Extraire le status code de la réponse
      if (response instanceof NextResponse) {
        statusCode = response.status
      }

      return response

    } catch (error) {
      // En cas d'erreur, déterminer le code de statut
      statusCode = error.status || 500
      throw error
    } finally {
      // Enregistrer le log seulement si on a un userId
      if (userId) {
        const responseTime = Date.now() - startTime
        const url = new URL(request.url)
        const endpoint = url.pathname
        const method = request.method
        const userAgent = request.headers.get('user-agent')
        const ipAddress = request.headers.get('x-forwarded-for') || 
                         request.headers.get('x-real-ip') || 
                         'unknown'

        // Enregistrer le log de manière asynchrone
        logApiCall({
          userId,
          apiKeyId,
          endpoint,
          method,
          statusCode,
          responseTime,
          userAgent,
          ipAddress,
          isInternal
        }).catch(error => {
          console.error('Erreur lors de l\'enregistrement du log API:', error)
        })
      }
    }
  }
}

// Fonction helper pour vérifier l'authentification
export async function getAuthenticatedUser(request) {
  console.log('🔍 [Auth Middleware] Début de l\'authentification')
  
  const authHeader = request.headers.get('authorization')
  
  if (!authHeader?.startsWith('Bearer ')) {
    console.error('❌ [Auth Middleware] Token manquant ou format incorrect')
    return { error: 'Token manquant', status: 401 }
  }

  const token = authHeader.substring(7)
  console.log('🔍 [Auth Middleware] Token extrait, longueur:', token.length)
  
  try {
    console.log('🔍 [Auth Middleware] Tentative de vérification JWT')
    
    const decoded = verifyToken(token)

    if (decoded?.userId) {
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId }
      })
      
      if (!user) {
        console.error('❌ [Auth Middleware] Utilisateur non trouvé pour l\'ID:', decoded.userId)
        return { error: 'Utilisateur non trouvé', status: 404 }
      }
      
      console.log('✅ [Auth Middleware] Utilisateur trouvé:', { userId: user.id, userName: user.name })
      return { user, isInternal: true }
    }
    
    console.log('⚠️ [Auth Middleware] JWT invalide, tentative avec clé API')
    
    const apiKey = await prisma.apiKey.findUnique({
      where: { key: token, active: true },
      include: { user: true }
    })
    
    if (!apiKey) {
      console.error('❌ [Auth Middleware] Clé API invalide ou inactive')
      return { error: 'Clé API invalide', status: 401 }
    }
    
    console.log('✅ [Auth Middleware] Clé API valide trouvée:', { userId: apiKey.user.id, userName: apiKey.user.name })
    return { user: apiKey.user, apiKey, isInternal: false }
  } catch (apiError) {
    console.error('❌ [Auth Middleware] Erreur lors de la vérification d\'authentification:', apiError)
    return { error: 'Erreur d\'authentification', status: 401 }
  }
} 