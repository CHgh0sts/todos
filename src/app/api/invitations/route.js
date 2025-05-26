import { NextResponse } from 'next/server'
import { verifyToken, getTokenFromRequest } from '@/lib/auth'
import prisma from '@/lib/prisma'

// Récupérer les invitations reçues par l'utilisateur
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
    const status = searchParams.get('status') || 'pending'

    const invitations = await prisma.invitation.findMany({
      where: {
        receiverId: userId,
        status: status
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Pour chaque invitation, récupérer les informations du projet
    const invitationsWithProjects = await Promise.all(
      invitations.map(async (invitation) => {
        const project = await prisma.project.findUnique({
          where: { id: invitation.projectId },
          select: {
            id: true,
            name: true,
            description: true,
            emoji: true,
            color: true,
            createdAt: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        })

        return {
          ...invitation,
          project
        }
      })
    )

    return NextResponse.json(invitationsWithProjects)

  } catch (error) {
    console.error('Erreur lors de la récupération des invitations:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
} 