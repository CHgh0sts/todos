import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyToken, getTokenFromRequest } from '@/lib/auth'

export async function PUT(request, { params }) {
  try {
    const { id } = params
    const token = getTokenFromRequest(request)
    
    if (!token) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 })
    }
    
    const userId = decoded.userId

    // Vérifier que la notification appartient à l'utilisateur
    const notification = await prisma.notification.findFirst({
      where: {
        id: parseInt(id),
        userId: userId
      }
    })

    if (!notification) {
      return NextResponse.json({ error: 'Notification non trouvée' }, { status: 404 })
    }

    // Mettre à jour la notification
    const updatedNotification = await prisma.notification.update({
      where: {
        id: parseInt(id)
      },
      data: {
        read: true,
        updatedAt: new Date()
      }
    })

    return NextResponse.json(updatedNotification)
    
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la notification:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de la notification' },
      { status: 500 }
    )
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params
    const token = getTokenFromRequest(request)
    
    if (!token) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 })
    }
    
    const userId = decoded.userId

    // Vérifier que la notification appartient à l'utilisateur
    const notification = await prisma.notification.findFirst({
      where: {
        id: parseInt(id),
        userId: userId
      }
    })

    if (!notification) {
      return NextResponse.json({ error: 'Notification non trouvée' }, { status: 404 })
    }

    // Supprimer la notification
    await prisma.notification.delete({
      where: {
        id: parseInt(id)
      }
    })

    return NextResponse.json({ 
      success: true,
      message: 'Notification supprimée'
    })
    
  } catch (error) {
    console.error('Erreur lors de la suppression de la notification:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de la notification' },
      { status: 500 }
    )
  }
} 