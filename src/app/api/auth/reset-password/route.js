import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json({ error: 'Token et mot de passe requis' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Le mot de passe doit contenir au moins 6 caractères' }, { status: 400 })
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

    // Vérifier que l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { email: resetRequest.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    }

    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(password, 12)

    // Mettre à jour le mot de passe de l'utilisateur
    await prisma.user.update({
      where: { email: resetRequest.email },
      data: { password: hashedPassword }
    })

    // Supprimer le token de réinitialisation utilisé
    await prisma.passwordReset.delete({
      where: { id: resetRequest.id }
    })

    // Supprimer tous les autres tokens de réinitialisation pour cet email
    await prisma.passwordReset.deleteMany({
      where: { email: resetRequest.email }
    })

    return NextResponse.json({ message: 'Mot de passe réinitialisé avec succès' })

  } catch (error) {
    console.error('Erreur lors de la réinitialisation du mot de passe:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
} 