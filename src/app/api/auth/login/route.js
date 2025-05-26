import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'
import jwt from 'jsonwebtoken'
import { generateToken } from '@/lib/auth'

export async function POST(request) {
  try {
    const { email, password } = await request.json()

    // Vérifier si l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 400 }
      )
    }

    // Vérifier si le compte est vérifié
    if (!user.isVerified) {
      return NextResponse.json(
        { error: 'Veuillez vérifier votre compte en cliquant sur le lien envoyé par email' },
        { status: 400 }
      )
    }

    // Vérifier le mot de passe
    const isValidPassword = await bcrypt.compare(password, user.password)

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 400 }
      )
    }

    // Générer le token
    const token = generateToken(user.id)

    // Retourner les informations de l'utilisateur sans le mot de passe
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      user: userWithoutPassword,
      token
    })
  } catch (error) {
    console.error('Erreur lors de la connexion:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la connexion' },
      { status: 500 }
    )
  }
} 