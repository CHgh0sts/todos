import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { withAdminAuth } from '@/lib/adminMiddleware'
import { logActivity, ACTIONS, ENTITIES, extractRequestInfo } from '@/lib/activityLogger'

const prisma = new PrismaClient()

async function putHandler(request, context) {
  try {
    const userId = context.params.id
    const body = await request.json()

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
    if (body.role && currentUser.id === targetUser.id) {
      return NextResponse.json({ 
        error: 'Vous ne pouvez pas modifier votre propre rôle' 
      }, { status: 403 })
    }

    // Filtrer les champs autorisés selon le rôle
    const allowedUpdates = {}
    
    if (currentUser.role === 'ADMIN') {
      // Les admins peuvent tout modifier
      if (body.name) allowedUpdates.name = body.name
      if (body.email) allowedUpdates.email = body.email
      if (body.role) allowedUpdates.role = body.role
      if (body.isVerified !== undefined) allowedUpdates.isVerified = body.isVerified
      if (body.plan) allowedUpdates.plan = body.plan
    } else if (currentUser.role === 'MODERATOR') {
      // Les modérateurs peuvent modifier les infos de base
      if (body.name) allowedUpdates.name = body.name
      if (body.isVerified !== undefined) allowedUpdates.isVerified = body.isVerified
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
      action: body.role ? ACTIONS.ADMIN_ROLE_CHANGE : ACTIONS.ADMIN_USER_UPDATE,
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

async function deleteHandler(request, context) {
  try {
    const userId = context.params.id

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

    // Vérifier les permissions
    if (currentUser.role === 'MODERATOR' && targetUser.role !== 'USER') {
      return NextResponse.json({ 
        error: 'Les modérateurs ne peuvent supprimer que les utilisateurs normaux' 
      }, { status: 403 })
    }

    // Seuls les admins peuvent supprimer des admins/modérateurs
    if (currentUser.role !== 'ADMIN' && ['ADMIN', 'MODERATOR'].includes(targetUser.role)) {
      return NextResponse.json({ 
        error: 'Permissions insuffisantes pour supprimer cet utilisateur' 
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

export const PUT = withAdminAuth(putHandler, ['ADMIN', 'MODERATOR'])
export const DELETE = withAdminAuth(deleteHandler, ['ADMIN', 'MODERATOR']) 