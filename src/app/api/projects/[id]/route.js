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

export async function GET(request, { params }) {
  try {
    const userId = await getUserFromRequest(request)
    if (!userId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { id } = params
    const url = new URL(request.url)
    const isAdminMode = url.searchParams.get('admin') === 'true'
    
    console.log(`🔍 [Project API] Récupération projet ${id}, mode admin: ${isAdminMode}, userId: ${userId}`)
    
    // Récupérer l'utilisateur pour vérifier son rôle
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true }
    })

    if (!currentUser) {
      console.log(`❌ [Project API] Utilisateur ${userId} non trouvé`)
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    }

    console.log(`👤 [Project API] Utilisateur trouvé: ${currentUser.name} (${currentUser.role})`)

    // Construire la condition de recherche
    let whereCondition = { id: parseInt(id) }
    
    // Si ce n'est pas un admin/modérateur en mode admin, vérifier les permissions normales
    if (!isAdminMode || !['ADMIN', 'MODERATOR'].includes(currentUser.role)) {
      console.log(`🔒 [Project API] Mode normal - vérification des permissions`)
      whereCondition = {
        id: parseInt(id),
        OR: [
          { userId: userId }, // Propriétaire
          {
            shares: {
              some: {
                userId: userId
              }
            }
          }
        ]
      }
    } else {
      console.log(`🔓 [Project API] Mode admin/modérateur - accès étendu autorisé`)
    }
    
    // Vérifier que l'utilisateur a accès au projet
    const project = await prisma.project.findFirst({
      where: whereCondition,
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true }
        },
        shares: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        },
        todos: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            },
            category: true
          },
          orderBy: [
            { completed: 'asc' },
            { createdAt: 'desc' }
          ]
        },
        categories: true
      }
    })

    if (!project) {
      console.log(`❌ [Project API] Projet ${id} non trouvé ou accès refusé pour l'utilisateur ${userId}`)
      return NextResponse.json({ error: 'Projet non trouvé ou accès refusé' }, { status: 404 })
    }

    console.log(`✅ [Project API] Projet trouvé: ${project.name}`)

    // Déterminer les permissions de l'utilisateur
    const isOwner = project.userId === userId
    const userShare = project.shares.find(share => share.userId === userId)
    let userPermission = isOwner ? 'admin' : userShare?.permission || 'view'
    
    // Si c'est un admin/modérateur en mode admin, donner des permissions spéciales
    if (isAdminMode && ['ADMIN', 'MODERATOR'].includes(currentUser.role)) {
      userPermission = currentUser.role === 'ADMIN' ? 'super_admin' : 'moderator'
      console.log(`🔧 [Project API] Permissions spéciales accordées: ${userPermission}`)
    }
    
    const result = {
      ...project,
      isOwner,
      permission: userPermission,
      sharedWith: project.shares,
      isAdminMode: isAdminMode && ['ADMIN', 'MODERATOR'].includes(currentUser.role),
      currentUserRole: currentUser.role
    }
    
    console.log(`📤 [Project API] Réponse envoyée - isAdminMode: ${result.isAdminMode}, permission: ${result.permission}`)
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('❌ [Project API] Erreur lors de la récupération du projet:', error)
    return NextResponse.json({ error: 'Erreur lors de la récupération du projet' }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    const userId = await getUserFromRequest(request)
    if (!userId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { id } = params
    const { name, description, color, emoji } = await request.json()
    
    // Vérifier que l'utilisateur a les droits de modification
    const projectAccess = await prisma.project.findFirst({
      where: {
        id: parseInt(id),
        OR: [
          { userId: userId }, // Propriétaire
          {
            shares: {
              some: {
                userId: userId,
                permission: { in: ['edit', 'admin'] }
              }
            }
          }
        ]
      }
    })

    if (!projectAccess) {
      return NextResponse.json({ error: 'Projet non trouvé ou permissions insuffisantes' }, { status: 404 })
    }
    
    // Récupérer les données originales pour le tracking
    const originalProject = await prisma.project.findUnique({
      where: { id: parseInt(id) },
      select: {
        name: true,
        description: true,
        color: true,
        emoji: true
      }
    })
    
    const project = await prisma.project.update({
      where: {
        id: parseInt(id)
      },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(color !== undefined && { color }),
        ...(emoji !== undefined && { emoji })
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        shares: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        }
      }
    })

    // Tracker la modification du projet
    const { ipAddress, userAgent } = extractRequestInfo(request)
    
    // Récupérer le nom de l'utilisateur pour le textLog
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true }
    })
    
    const textLog = generateTextLog('projet', 'edit', currentUser?.name || 'Utilisateur', originalProject, project)
    
    await logAdd(
      userId,
      'projet',
      'edit',
      originalProject,
      project,
      ipAddress,
      userAgent,
      textLog
    ).catch(error => {
      console.error('Erreur lors du tracking de modification de projet:', error)
    })

    const isOwner = project.userId === userId
    const userShare = project.shares.find(share => share.userId === userId)
    const userPermission = isOwner ? 'admin' : userShare?.permission || 'view'
    
    return NextResponse.json({
      ...project,
      isOwner,
      permission: userPermission,
      sharedWith: project.shares
    })
  } catch (error) {
    console.error('Erreur lors de la mise à jour du projet:', error)
    return NextResponse.json({ error: 'Erreur lors de la mise à jour du projet' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const userId = await getUserFromRequest(request)
    if (!userId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { id } = params
    
    // Vérifier que l'utilisateur est propriétaire ou admin
    const projectAccess = await prisma.project.findFirst({
      where: {
        id: parseInt(id),
        OR: [
          { userId: userId }, // Propriétaire
          {
            shares: {
              some: {
                userId: userId,
                permission: 'admin'
              }
            }
          }
        ]
      },
      include: {
        shares: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        }
      }
    })

    if (!projectAccess) {
      return NextResponse.json({ error: 'Projet non trouvé ou permissions insuffisantes' }, { status: 404 })
    }

    const isOwner = projectAccess.userId === userId

    // Créer des notifications pour les collaborateurs avant suppression
    if (projectAccess.shares.length > 0) {
      const notifications = projectAccess.shares
        .filter(share => share.userId !== userId)
        .map(share => ({
          userId: share.userId,
          type: 'project_deleted',
          title: 'Projet supprimé',
          message: `${isOwner ? 'Le propriétaire' : 'Un administrateur'} a supprimé le projet "${projectAccess.name}"`,
          data: JSON.stringify({
            projectId: parseInt(id),
            deletedBy: userId
          })
        }))

      if (notifications.length > 0) {
        await prisma.notification.createMany({
          data: notifications
        })
      }
    }

    // Tracker la suppression du projet avant de le supprimer
    const { ipAddress, userAgent } = extractRequestInfo(request)
    
    // Récupérer le nom de l'utilisateur pour le textLog
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true }
    })
    
    // Préparer les données de l'élément supprimé
    const deletedData = {
      id: projectAccess.id,
      name: projectAccess.name,
      description: projectAccess.description,
      color: projectAccess.color,
      emoji: projectAccess.emoji,
      userId: projectAccess.userId,
      createdAt: projectAccess.createdAt,
      updatedAt: projectAccess.updatedAt
    }
    
    const textLog = generateTextLog('projet', 'delete', currentUser?.name || 'Utilisateur', deletedData, null)
    
    await logAdd(
      userId,
      'projet',
      'delete',
      deletedData,
      null,
      ipAddress,
      userAgent,
      textLog
    ).catch(error => {
      console.error('Erreur lors du tracking de suppression de projet:', error)
    })
    
    await prisma.project.delete({
      where: {
        id: parseInt(id)
      }
    })
    
    return NextResponse.json({ message: 'Projet supprimé avec succès' })
  } catch (error) {
    console.error('Erreur lors de la suppression du projet:', error)
    return NextResponse.json({ error: 'Erreur lors de la suppression du projet' }, { status: 500 })
  }
} 