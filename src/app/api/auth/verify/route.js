import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    console.log('🔍 Token reçu:', token)

    if (!token) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 400 })
    }

    // D'abord, chercher l'utilisateur avec le token
    const userWithToken = await prisma.user.findFirst({
      where: { 
        verificationToken: token
      }
    })

    console.log('👤 Utilisateur avec token trouvé:', userWithToken ? `${userWithToken.email} (ID: ${userWithToken.id})` : 'Aucun')

    if (userWithToken) {
      // L'utilisateur a le token, vérifier s'il est déjà vérifié
      if (userWithToken.isVerified) {
        console.log('✅ Compte déjà vérifié avec ce token')
        return NextResponse.json({ 
          message: 'Votre compte est déjà vérifié !',
          alreadyVerified: true 
        })
      }

      // Vérifier si le token n'a pas expiré
      if (userWithToken.verificationExpires && userWithToken.verificationExpires < new Date()) {
        console.log('⚠️ Token expiré')
        return NextResponse.json({ error: 'Le lien de vérification a expiré' }, { status: 400 })
      }

      // Mettre à jour l'utilisateur
      await prisma.user.update({
        where: { id: userWithToken.id },
        data: {
          isVerified: true,
          verificationToken: null,
          verificationExpires: null
        }
      })

      console.log('✅ Compte vérifié avec succès')
      return NextResponse.json({ 
        message: 'Votre compte a été vérifié avec succès !',
        alreadyVerified: false
      })
    }

    // Si pas de token trouvé, chercher si un utilisateur a déjà été vérifié récemment avec ce token
    // (pour gérer les cas de double requête)
    const recentlyVerifiedUser = await prisma.user.findFirst({
      where: {
        isVerified: true,
        verificationToken: null,
        updatedAt: {
          gte: new Date(Date.now() - 5 * 60 * 1000) // Dans les 5 dernières minutes
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    if (recentlyVerifiedUser) {
      console.log('✅ Compte récemment vérifié trouvé:', recentlyVerifiedUser.email)
      return NextResponse.json({ 
        message: 'Votre compte a été vérifié avec succès !',
        alreadyVerified: true 
      })
    }

    console.log('❌ Token invalide ou expiré')
    return NextResponse.json({ error: 'Token invalide ou expiré' }, { status: 400 })

  } catch (error) {
    console.error('❌ Erreur lors de la vérification du compte:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la vérification du compte' },
      { status: 500 }
    )
  }
} 