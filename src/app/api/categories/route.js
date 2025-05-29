import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyToken, getTokenFromRequest } from '@/lib/auth'
import { logAdd, extractRequestInfo, generateTextLog } from '@/lib/userActivityLogger'

async function getUserFromRequest(request) {
  const token = getTokenFromRequest(request)
  if (!token) return null
  
  const decoded = verifyToken(token)
  if (!decoded) return null
  
  return decoded.userId
}

export async function GET(request) {
  try {
    const userId = await getUserFromRequest(request)
    if (!userId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const categories = await prisma.category.findMany({
      where: { userId },
      include: {
        _count: {
          select: { todos: true }
        }
      },
      orderBy: { createdAt: 'asc' }
    })
    
    return NextResponse.json(categories)
  } catch (error) {
    console.error('Erreur lors de la récupération des catégories:', error)
    return NextResponse.json({ error: 'Erreur lors de la récupération des catégories' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const userId = await getUserFromRequest(request)
    if (!userId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { name, color, emoji } = await request.json()
    
    if (!name) {
      return NextResponse.json({ error: 'Le nom est requis' }, { status: 400 })
    }

    const category = await prisma.category.create({
      data: {
        name,
        color: color || '#3B82F6',
        emoji: emoji || '📁',
        userId
      }
    })
    
    // Tracker la création de la catégorie
    const { ipAddress, userAgent } = extractRequestInfo(request)
    
    // Récupérer le nom de l'utilisateur pour le textLog
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true }
    })
    
    // Préparer les données de l'élément créé
    const createdData = {
      id: category.id,
      name: category.name,
      color: category.color,
      emoji: category.emoji,
      userId: category.userId,
      projectId: category.projectId,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt
    }
    
    const textLog = generateTextLog('catégorie', 'create', currentUser?.name || 'Utilisateur', null, createdData)
    
    await logAdd(
      userId,
      'catégorie',
      'create',
      null,
      createdData,
      ipAddress,
      userAgent,
      textLog
    ).catch(error => {
      console.error('Erreur lors du tracking de création de catégorie:', error)
    })
    
    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error('Erreur lors de la création de la catégorie:', error)
    return NextResponse.json({ error: 'Erreur lors de la création de la catégorie' }, { status: 500 })
  }
} 