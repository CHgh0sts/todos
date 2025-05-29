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

    // Vérifier si les inscriptions sont activées
    const registrationSetting = await prisma.systemSettings.findUnique({
      where: { key: 'registrationEnabled' }
    })

    const registrationEnabled = registrationSetting?.value === 'true'
    if (!registrationEnabled) {
      return NextResponse.json(
        { error: 'Les inscriptions sont actuellement désactivées. Veuillez réessayer plus tard.' },
        { status: 403 }
      )
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

    // Vérifier si la vérification email est requise
    const emailVerificationSetting = await prisma.systemSettings.findUnique({
      where: { key: 'emailVerificationRequired' }
    })

    // La vérification est requise si le paramètre est explicitement défini à 'true' (valeur par défaut)
    const emailVerificationRequired = emailVerificationSetting?.value === 'true'

    console.log('🔍 [Register API] Vérification email requise:', emailVerificationRequired, 'Valeur en base:', emailVerificationSetting?.value)

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10)

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        isVerified: !emailVerificationRequired, // Si la vérification n'est pas requise, marquer comme vérifié
        verificationToken: emailVerificationRequired ? crypto.randomBytes(32).toString('hex') : null,
        verificationExpires: emailVerificationRequired ? new Date(Date.now() + 24 * 60 * 60 * 1000) : null // 24 heures
      }
    })

    // Tentative d'envoi de l'email de vérification (seulement si requis)
    let emailSent = false
    let emailError = null
    
    if (emailVerificationRequired) {
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
    }

    // Retourner une réponse de succès
    let message
    if (!emailVerificationRequired) {
      message = 'Compte créé avec succès. Vous pouvez maintenant vous connecter.'
    } else if (emailSent) {
      message = 'Compte créé avec succès. Veuillez vérifier votre email pour activer votre compte.'
    } else {
      message = 'Compte créé avec succès. Cependant, l\'email de vérification n\'a pas pu être envoyé. Veuillez contacter le support.'
    }

    const response = {
      message,
      emailSent: emailVerificationRequired ? emailSent : null,
      emailVerificationRequired,
      userId: user.id
    }

    // Si l'email n'a pas pu être envoyé et qu'il est requis, inclure des informations supplémentaires
    if (emailVerificationRequired && !emailSent) {
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