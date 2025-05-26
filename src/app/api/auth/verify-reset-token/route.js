import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ error: 'Token requis' }, { status: 400 })
    }

    // Vérifier si le token existe et n'est pas expiré
    const resetRequest = await prisma.passwordReset.findFirst({
      where: {
        token,
        expiresAt: {
          gt: new Date()
        }
      }
    })

    if (!resetRequest) {
      return NextResponse.json({ error: 'Token invalide ou expiré' }, { status: 400 })
    }

    return NextResponse.json({ message: 'Token valide' })

  } catch (error) {
    console.error('Erreur lors de la vérification du token:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
} 