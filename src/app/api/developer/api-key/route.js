import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyToken, getTokenFromRequest } from '@/lib/auth'
import crypto from 'crypto'

// GET - Récupérer la clé API de l'utilisateur
export async function GET(request) {
  try {
    const token = getTokenFromRequest(request)
    if (!token) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 })
    }

    // Chercher la clé API existante
    const apiKey = await prisma.apiKey.findUnique({
      where: { userId: decoded.userId }
    })

    return NextResponse.json({ 
      apiKey: apiKey?.key || null,
      createdAt: apiKey?.createdAt || null,
      lastUsed: apiKey?.lastUsed || null
    })

  } catch (error) {
    console.error('Erreur lors de la récupération de la clé API:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// POST - Générer une nouvelle clé API
export async function POST(request) {
  try {
    const token = getTokenFromRequest(request)
    if (!token) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 })
    }

    // Vérifier si l'utilisateur a déjà une clé API
    const existingApiKey = await prisma.apiKey.findUnique({
      where: { userId: decoded.userId }
    })

    if (existingApiKey) {
      return NextResponse.json({ error: 'Vous avez déjà une clé API. Utilisez PUT pour la régénérer.' }, { status: 400 })
    }

    // Générer une nouvelle clé API
    const newApiKey = `cw_${crypto.randomBytes(32).toString('hex')}`

    // Sauvegarder en base
    const apiKey = await prisma.apiKey.create({
      data: {
        userId: decoded.userId,
        key: newApiKey,
        name: 'Clé API par défaut'
      }
    })

    return NextResponse.json({ 
      apiKey: apiKey.key,
      createdAt: apiKey.createdAt
    })

  } catch (error) {
    console.error('Erreur lors de la génération de la clé API:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// PUT - Régénérer la clé API existante
export async function PUT(request) {
  try {
    const token = getTokenFromRequest(request)
    if (!token) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 })
    }

    // Générer une nouvelle clé API
    const newApiKey = `cw_${crypto.randomBytes(32).toString('hex')}`

    // Mettre à jour ou créer la clé API
    const apiKey = await prisma.apiKey.upsert({
      where: { userId: decoded.userId },
      update: {
        key: newApiKey,
        createdAt: new Date()
      },
      create: {
        userId: decoded.userId,
        key: newApiKey,
        name: 'Clé API par défaut'
      }
    })

    return NextResponse.json({ 
      apiKey: apiKey.key,
      createdAt: apiKey.createdAt
    })

  } catch (error) {
    console.error('Erreur lors de la régénération de la clé API:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// DELETE - Supprimer la clé API
export async function DELETE(request) {
  try {
    const token = getTokenFromRequest(request)
    if (!token) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 })
    }

    // Supprimer la clé API
    await prisma.apiKey.delete({
      where: { userId: decoded.userId }
    })

    return NextResponse.json({ message: 'Clé API supprimée avec succès' })

  } catch (error) {
    console.error('Erreur lors de la suppression de la clé API:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
} 