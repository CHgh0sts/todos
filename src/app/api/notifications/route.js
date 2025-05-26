import { NextResponse } from 'next/server'
import { verifyToken, getTokenFromRequest } from '@/lib/auth'
import prisma from '@/lib/prisma'

// Récupérer les notifications de l'utilisateur
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
    
    const userId = decoded.userId

    const { searchParams } = new URL(request.url)
    const unreadOnly = searchParams.get('unread') === 'true'
    const limit = parseInt(searchParams.get('limit')) || 50

    const whereClause = {
      userId: userId
    }

    if (unreadOnly) {
      whereClause.read = false
    }

    const notifications = await prisma.notification.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: limit
    })

    // Compter les notifications non lues
    const unreadCount = await prisma.notification.count({
      where: {
        userId: userId,
        read: false
      }
    })

    return NextResponse.json({
      notifications: notifications,
      unreadCount: unreadCount
    })

  } catch (error) {
    console.error('Erreur lors de la récupération des notifications:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// Marquer toutes les notifications comme lues
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
    
    const userId = decoded.userId

    const { notificationIds } = await request.json()

    if (notificationIds && notificationIds.length > 0) {
      // Marquer des notifications spécifiques comme lues
      await prisma.notification.updateMany({
        where: {
          id: { in: notificationIds },
          userId: userId
        },
        data: {
          read: true
        }
      })
    } else {
      // Marquer toutes les notifications comme lues
      await prisma.notification.updateMany({
        where: {
          userId: userId,
          read: false
        },
        data: {
          read: true
        }
      })
    }

    return NextResponse.json({ message: 'Notifications marquées comme lues' })

  } catch (error) {
    console.error('Erreur lors de la mise à jour des notifications:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
} 