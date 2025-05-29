import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { withAdminAuth } from '@/lib/adminMiddleware'
import { logActivity, ACTIONS, ENTITIES, extractRequestInfo } from '@/lib/activityLogger'

const prisma = new PrismaClient()

async function getHandler(request) {
  try {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page')) || 1
    const limit = parseInt(url.searchParams.get('limit')) || 20
    const search = url.searchParams.get('search') || ''
    const role = url.searchParams.get('role') || ''
    const sortBy = url.searchParams.get('sortBy') || 'createdAt'
    const sortOrder = url.searchParams.get('sortOrder') || 'desc'

    const skip = (page - 1) * limit

    // Construire les conditions de recherche
    let whereClause = {}

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (role) {
      whereClause.role = role
    }

    // Récupérer les utilisateurs avec pagination
    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isVerified: true,
          profileImage: true,
          plan: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              projects: true,
              todos: true,
              categories: true,
              sentInvitations: true,
              receivedInvitations: true
            }
          }
        },
        orderBy: {
          [sortBy]: sortOrder
        },
        skip,
        take: limit
      }),
      prisma.user.count({ where: whereClause })
    ])

    // Statistiques globales
    const stats = await prisma.user.groupBy({
      by: ['role'],
      _count: {
        role: true
      }
    })

    const roleStats = stats.reduce((acc, stat) => {
      acc[stat.role] = stat._count.role
      return acc
    }, {})

    // Logger l'activité
    const { ipAddress, userAgent } = extractRequestInfo(request)
    await logActivity({
      userId: request.user.id,
      action: ACTIONS.VIEW,
      entity: ENTITIES.USER,
      details: {
        action: 'admin_users_list',
        filters: { search, role, page, limit },
        resultCount: users.length
      },
      ipAddress,
      userAgent
    })

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      },
      stats: roleStats
    })

  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

async function putHandler(request) {
  try {
    const body = await request.json()
    const { userId, updates } = body

    if (!userId) {
      return NextResponse.json({ error: 'ID utilisateur requis' }, { status: 400 })
    }

    // Récupérer l'utilisateur cible
    const targetUser = await prisma.user.findUnique({
      where: { id: parseInt(userId) }
    })

    if (!targetUser) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    }

    // Vérifier les permissions pour cette action
    const currentUser = request.user
    if (currentUser.role === 'MODERATOR' && targetUser.role !== 'USER') {
      return NextResponse.json({ 
        error: 'Les modérateurs ne peuvent modifier que les utilisateurs normaux' 
      }, { status: 403 })
    }

    // Empêcher la modification de son propre rôle
    if (updates.role && currentUser.id === targetUser.id) {
      return NextResponse.json({ 
        error: 'Vous ne pouvez pas modifier votre propre rôle' 
      }, { status: 403 })
    }

    // Filtrer les champs autorisés selon le rôle
    const allowedUpdates = {}
    
    if (currentUser.role === 'ADMIN') {
      // Les admins peuvent tout modifier
      if (updates.name) allowedUpdates.name = updates.name
      if (updates.email) allowedUpdates.email = updates.email
      if (updates.role) allowedUpdates.role = updates.role
      if (updates.isVerified !== undefined) allowedUpdates.isVerified = updates.isVerified
      if (updates.plan) allowedUpdates.plan = updates.plan
    } else if (currentUser.role === 'MODERATOR') {
      // Les modérateurs peuvent modifier les infos de base
      if (updates.name) allowedUpdates.name = updates.name
      if (updates.isVerified !== undefined) allowedUpdates.isVerified = updates.isVerified
    }

    if (Object.keys(allowedUpdates).length === 0) {
      return NextResponse.json({ error: 'Aucune modification autorisée' }, { status: 400 })
    }

    // Mettre à jour l'utilisateur
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: allowedUpdates,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isVerified: true,
        profileImage: true,
        plan: true,
        createdAt: true,
        updatedAt: true
      }
    })

    // Logger l'activité
    const { ipAddress, userAgent } = extractRequestInfo(request)
    await logActivity({
      userId: currentUser.id,
      action: updates.role ? ACTIONS.ADMIN_ROLE_CHANGE : ACTIONS.ADMIN_USER_UPDATE,
      entity: ENTITIES.USER,
      entityId: targetUser.id,
      targetUserId: targetUser.id,
      details: {
        action: 'admin_user_update',
        changes: allowedUpdates,
        oldValues: {
          name: targetUser.name,
          email: targetUser.email,
          role: targetUser.role,
          isVerified: targetUser.isVerified,
          plan: targetUser.plan
        }
      },
      ipAddress,
      userAgent
    })

    return NextResponse.json(updatedUser)

  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'utilisateur:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

async function deleteHandler(request) {
  try {
    const url = new URL(request.url)
    const userId = url.searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'ID utilisateur requis' }, { status: 400 })
    }

    // Récupérer l'utilisateur cible
    const targetUser = await prisma.user.findUnique({
      where: { id: parseInt(userId) }
    })

    if (!targetUser) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    }

    const currentUser = request.user

    // Empêcher la suppression de son propre compte
    if (currentUser.id === targetUser.id) {
      return NextResponse.json({ 
        error: 'Vous ne pouvez pas supprimer votre propre compte' 
      }, { status: 403 })
    }

    // Seuls les admins peuvent supprimer
    if (currentUser.role !== 'ADMIN') {
      return NextResponse.json({ 
        error: 'Seuls les administrateurs peuvent supprimer des utilisateurs' 
      }, { status: 403 })
    }

    // Supprimer l'utilisateur (cascade défini dans le schema)
    await prisma.user.delete({
      where: { id: parseInt(userId) }
    })

    // Logger l'activité
    const { ipAddress, userAgent } = extractRequestInfo(request)
    await logActivity({
      userId: currentUser.id,
      action: ACTIONS.ADMIN_USER_DELETE,
      entity: ENTITIES.USER,
      entityId: targetUser.id,
      targetUserId: targetUser.id,
      details: {
        action: 'admin_user_delete',
        deletedUser: {
          name: targetUser.name,
          email: targetUser.email,
          role: targetUser.role
        }
      },
      ipAddress,
      userAgent
    })

    return NextResponse.json({ message: 'Utilisateur supprimé avec succès' })

  } catch (error) {
    console.error('Erreur lors de la suppression de l\'utilisateur:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

export const GET = withAdminAuth(getHandler, ['ADMIN', 'MODERATOR'])
export const PUT = withAdminAuth(putHandler, ['ADMIN', 'MODERATOR'])
export const DELETE = withAdminAuth(deleteHandler, ['ADMIN']) 