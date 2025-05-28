import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'
import { logApiCall } from './apiLogger'

const prisma = new PrismaClient()

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
        
        // Vérifier si c'est un JWT (token interne) ou une clé API
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET)
          userId = decoded.userId
          // Si la route est explicitement marquée comme interne, garder isInternal = true
          // Sinon, c'est une route API publique utilisée avec un JWT (donc interne)
          if (!options.isInternal) {
            isInternal = true
          }
        } catch (jwtError) {
          // Si ce n'est pas un JWT valide, vérifier si c'est une clé API
          const apiKey = await prisma.apiKey.findUnique({
            where: { key: token, active: true },
            include: { user: true }
          })
          
          if (apiKey) {
            userId = apiKey.userId
            apiKeyId = apiKey.id
            isInternal = false // Les clés API sont toujours externes
            
            // Mettre à jour la dernière utilisation de la clé API
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
    // Vérifier les variables d'environnement
    if (!process.env.JWT_SECRET) {
      console.error('❌ [Auth Middleware] JWT_SECRET manquant dans les variables d\'environnement')
      return { error: 'Configuration serveur incorrecte', status: 500 }
    }
    
    console.log('🔍 [Auth Middleware] Tentative de vérification JWT')
    
    // Essayer d'abord comme JWT (token interne)
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    console.log('✅ [Auth Middleware] JWT décodé avec succès:', { userId: decoded.userId })
    
    // Vérifier la connexion à la base de données
    try {
      await prisma.$connect()
      console.log('✅ [Auth Middleware] Connexion à la base de données établie')
    } catch (dbError) {
      console.error('❌ [Auth Middleware] Erreur de connexion à la base de données:', dbError)
      return { error: 'Erreur de connexion à la base de données', status: 500 }
    }
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    })
    
    if (!user) {
      console.error('❌ [Auth Middleware] Utilisateur non trouvé pour l\'ID:', decoded.userId)
      return { error: 'Utilisateur non trouvé', status: 404 }
    }
    
    console.log('✅ [Auth Middleware] Utilisateur trouvé:', { userId: user.id, userName: user.name })
    return { user, isInternal: true }
    
  } catch (jwtError) {
    console.log('⚠️ [Auth Middleware] Échec de la vérification JWT, tentative avec clé API:', jwtError.message)
    
    // Si ce n'est pas un JWT, essayer comme clé API
    try {
      // Vérifier la connexion à la base de données si pas déjà fait
      try {
        await prisma.$connect()
        console.log('✅ [Auth Middleware] Connexion à la base de données établie pour clé API')
      } catch (dbError) {
        console.error('❌ [Auth Middleware] Erreur de connexion à la base de données:', dbError)
        return { error: 'Erreur de connexion à la base de données', status: 500 }
      }
      
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
      console.error('❌ [Auth Middleware] Erreur lors de la vérification de la clé API:', apiError)
      return { error: 'Erreur d\'authentification', status: 401 }
    }
  } finally {
    try {
      await prisma.$disconnect()
      console.log('✅ [Auth Middleware] Déconnexion de la base de données')
    } catch (disconnectError) {
      console.error('⚠️ [Auth Middleware] Erreur lors de la déconnexion:', disconnectError)
    }
  }
} 