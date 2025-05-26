import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyToken, getTokenFromRequest } from '@/lib/auth'

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
    
    const userId = decoded.userId

    // Marquer toutes les notifications non lues comme lues
    const result = await prisma.notification.updateMany({
      where: {
        userId: userId,
        read: false
      },
      data: {
        read: true,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({ 
      message: 'Toutes les notifications ont été marquées comme lues',
      count: result.count
    })

  } catch (error) {
    console.error('Erreur lors de la mise à jour des notifications:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
} 