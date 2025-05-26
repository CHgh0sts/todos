import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'
import crypto from 'crypto'
import { sendVerificationEmail } from '@/lib/mail'

export async function POST(request) {
  try {
    const { email, password, name } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Tous les champs sont requis' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Le mot de passe doit contenir au moins 6 caractères' }, { status: 400 })
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Un compte existe déjà avec cet email' },
        { status: 400 }
      )
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10)

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        isVerified: false,
        verificationToken: crypto.randomBytes(32).toString('hex'),
        verificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 heures
      }
    })

    // Tentative d'envoi de l'email de vérification
    let emailSent = false
    let emailError = null
    
    try {
      await sendVerificationEmail(user.email, user.verificationToken)
      emailSent = true
      console.log('✅ Email de vérification envoyé à:', user.email)
    } catch (error) {
      emailError = error.message
      console.error('❌ Erreur lors de l\'envoi de l\'email de vérification:', error)
      
      // En production, on peut vouloir logger cette erreur dans un service de monitoring
      if (process.env.NODE_ENV === 'production') {
        console.error('SMTP Error Details:', {
          host: process.env.SMTP_HOST,
          port: process.env.SMTP_PORT,
          user: process.env.SMTP_USER ? 'configured' : 'missing',
          pass: process.env.SMTP_PASS ? 'configured' : 'missing',
          error: error.message
        })
      }
    }

    // Retourner une réponse de succès même si l'email n'a pas pu être envoyé
    const response = {
      message: emailSent 
        ? 'Compte créé avec succès. Veuillez vérifier votre email pour activer votre compte.'
        : 'Compte créé avec succès. Cependant, l\'email de vérification n\'a pas pu être envoyé. Veuillez contacter le support.',
      emailSent,
      userId: user.id
    }

    // Si l'email n'a pas pu être envoyé, inclure des informations supplémentaires
    if (!emailSent) {
      response.warning = 'Email de vérification non envoyé'
      response.supportMessage = 'Veuillez contacter le support pour activer votre compte manuellement.'
    }

    return NextResponse.json(response, { status: 201 })
    
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création du compte' },
      { status: 500 }
    )
  }
} 