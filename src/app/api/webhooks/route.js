import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'

const prisma = new PrismaClient()

// GET - Récupérer les webhooks de l'utilisateur
export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const userId = decoded.userId

    const webhooks = await prisma.webhook.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ webhooks })

  } catch (error) {
    console.error('Erreur lors de la récupération des webhooks:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// POST - Créer un nouveau webhook
export async function POST(request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const userId = decoded.userId

    const { name, url, events, secret } = await request.json()

    // Validation
    if (!name || !url || !events || events.length === 0) {
      return NextResponse.json({ 
        error: 'Nom, URL et événements sont requis' 
      }, { status: 400 })
    }

    // Vérifier que l'URL est valide
    try {
      new URL(url)
    } catch {
      return NextResponse.json({ 
        error: 'URL invalide' 
      }, { status: 400 })
    }

    // Vérifier la limite de webhooks par utilisateur
    const existingWebhooks = await prisma.webhook.count({
      where: { userId }
    })

    if (existingWebhooks >= 10) {
      return NextResponse.json({ 
        error: 'Limite de 10 webhooks par utilisateur atteinte' 
      }, { status: 400 })
    }

    // Créer le webhook
    const webhook = await prisma.webhook.create({
      data: {
        userId,
        name,
        url,
        events,
        secret: secret || null,
        active: true
      }
    })

    return NextResponse.json({ webhook }, { status: 201 })

  } catch (error) {
    console.error('Erreur lors de la création du webhook:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
} 