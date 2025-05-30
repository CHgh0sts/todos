import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import adminMiddleware from '@/lib/adminMiddleware'

const prisma = new PrismaClient()

export async function GET(request) {
  try {
    // Vérifier les permissions admin
    const authResult = await adminMiddleware(request)
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    // Récupérer tous les utilisateurs avec le rôle ADMIN ou MODERATOR
    const moderators = await prisma.user.findMany({
      where: {
        OR: [
          { role: 'ADMIN' },
          { role: 'MODERATOR' }
        ]
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        profileImage: true,
        isActive: true,
        lastActivity: true
      },
      orderBy: [
        { role: 'asc' }, // ADMIN en premier
        { name: 'asc' }
      ]
    })

    // Ajouter des informations sur le statut en ligne (basé sur la dernière activité)
    const moderatorsWithStatus = moderators.map(moderator => {
      const lastActivity = moderator.lastActivity ? new Date(moderator.lastActivity) : null
      const now = new Date()
      const isOnline = lastActivity && (now - lastActivity) < 5 * 60 * 1000 // 5 minutes

      return {
        ...moderator,
        isOnline,
        statusText: isOnline ? 'En ligne' : lastActivity ? 'Hors ligne' : 'Jamais connecté'
      }
    })

    return NextResponse.json({
      moderators: moderatorsWithStatus,
      total: moderatorsWithStatus.length
    })

  } catch (error) {
    console.error('Erreur lors de la récupération des modérateurs:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
} 