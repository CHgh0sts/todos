import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'
import { withApiLogging } from '@/lib/apiMiddleware'

const prisma = new PrismaClient()

async function getHandler(request) {
  try {
    console.log('🔍 [Auth Me API] Vérification de l\'authentification utilisateur')
    
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ [Auth Me API] Token manquant dans l\'en-tête')
      return NextResponse.json({ error: 'Token manquant' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    console.log('🔍 [Auth Me API] Token reçu, vérification JWT...')
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    console.log('✅ [Auth Me API] Token JWT valide pour userId:', decoded.userId)
    
    // Tentative de connexion à la base de données avec retry
    let user = null
    let dbError = null
    
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        console.log(`🔍 [Auth Me API] Tentative ${attempt}/2 de connexion à la base de données`)
        
        await prisma.$connect()
        console.log('✅ [Auth Me API] Connexion à la base de données établie')
        
        user = await prisma.user.findUnique({
          where: { id: decoded.userId },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            profileImage: true,
            isVerified: true,
            theme: true,
            plan: true,
            createdAt: true,
            updatedAt: true
          }
        })
        
        console.log('✅ [Auth Me API] Utilisateur récupéré avec succès')
        break // Succès, sortir de la boucle
        
      } catch (dbErr) {
        console.error(`❌ [Auth Me API] Erreur DB tentative ${attempt}:`, dbErr.message)
        dbError = dbErr
        
        if (attempt < 2) {
          console.log('⏳ [Auth Me API] Attente avant retry...')
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      } finally {
        try {
          await prisma.$disconnect()
        } catch (disconnectError) {
          console.error('⚠️ [Auth Me API] Erreur de déconnexion:', disconnectError.message)
        }
      }
    }
    
    if (!user && dbError) {
      console.error('❌ [Auth Me API] Échec de toutes les tentatives de connexion DB')
      return NextResponse.json({ 
        error: 'Erreur de connexion à la base de données',
        details: 'Service temporairement indisponible, veuillez réessayer'
      }, { status: 500 })
    }

    if (!user) {
      console.log('❌ [Auth Me API] Utilisateur non trouvé pour ID:', decoded.userId)
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    }

    console.log('✅ [Auth Me API] Réponse utilisateur envoyée avec succès')
    return NextResponse.json(user)
    
  } catch (error) {
    console.error('❌ [Auth Me API] Erreur lors de la récupération de l\'utilisateur:', error)
    
    // Distinguer les erreurs de JWT des erreurs serveur
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      console.error('❌ [Auth Me API] Token JWT invalide ou expiré:', error.message)
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 })
    }
    
    // Pour toutes les autres erreurs (réseau, serveur, etc.)
    console.error('❌ [Auth Me API] Erreur serveur non-JWT:', error.message, error.name)
    return NextResponse.json({ 
      error: 'Erreur serveur temporaire',
      details: 'Problème technique temporaire, veuillez réessayer'
    }, { status: 500 })
  }
}

async function putHandler(request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    
    const { name, email, theme } = await request.json()

    if (!name || !email) {
      return NextResponse.json({ error: 'Nom et email requis' }, { status: 400 })
    }

    // Vérifier si l'email est déjà utilisé par un autre utilisateur
    const existingUser = await prisma.user.findFirst({
      where: {
        email: email,
        NOT: {
          id: decoded.userId
        }
      }
    })

    if (existingUser) {
      return NextResponse.json({ error: 'Cet email est déjà utilisé' }, { status: 400 })
    }

    const updatedUser = await prisma.user.update({
      where: { id: decoded.userId },
      data: {
        name: name.trim(),
        email: email.trim(),
        theme: theme || 'system'
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        profileImage: true,
        isVerified: true,
        theme: true,
        plan: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'utilisateur:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export const GET = withApiLogging(getHandler, { isInternal: true })
export const PUT = withApiLogging(putHandler, { isInternal: true }) 