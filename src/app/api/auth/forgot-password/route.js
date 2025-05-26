import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { sendPasswordResetEmail } from '@/lib/mail'
import crypto from 'crypto'

export async function POST(request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email requis' }, { status: 400 })
    }

    // Vérifier si l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { email }
    })

    // Pour des raisons de sécurité, on renvoie toujours le même message
    // même si l'utilisateur n'existe pas
    if (!user) {
      return NextResponse.json({ 
        message: 'Si cette adresse email existe dans notre système, vous recevrez un lien de réinitialisation.' 
      })
    }

    // Générer un token de réinitialisation
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 heure

    // Sauvegarder le token dans la base de données
    await prisma.passwordReset.create({
      data: {
        email,
        token: resetToken,
        expiresAt: resetTokenExpiry
      }
    })

    // Envoyer l'email de réinitialisation
    await sendPasswordResetEmail(email, user.name, resetToken)

    return NextResponse.json({ 
      message: 'Si cette adresse email existe dans notre système, vous recevrez un lien de réinitialisation.' 
    })

  } catch (error) {
    console.error('Erreur lors de la demande de réinitialisation:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
} 