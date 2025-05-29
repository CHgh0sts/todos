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

export async function PUT(request, { params }) {
  try {
    const userId = await getUserFromRequest(request)
    if (!userId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { id } = params
    const { title, description, completed, priority, dueDate, categoryId } = await request.json()
    
    // Récupérer le todo avec le projet
    const todo = await prisma.todo.findUnique({
      where: { id: parseInt(id) },
      include: {
        project: {
          include: {
            shares: {
              where: { userId: userId }
            }
          }
        }
      }
    })

    if (!todo) {
      return NextResponse.json({ error: 'Todo non trouvé' }, { status: 404 })
    }

    // Vérifier les permissions sur le projet
    const isProjectOwner = todo.project.userId === userId
    const userProjectShare = todo.project.shares[0]
    const projectPermission = isProjectOwner ? 'admin' : userProjectShare?.permission

    // Vérifier que l'utilisateur peut modifier ce todo
    const canEdit = projectPermission === 'edit' || projectPermission === 'admin' || todo.userId === userId

    if (!canEdit) {
      return NextResponse.json({ error: 'Permissions insuffisantes pour modifier ce todo' }, { status: 403 })
    }
    
    // Récupérer les valeurs originales AVANT modification pour le tracking
    const originalTodo = await prisma.todo.findUnique({
      where: { id: parseInt(id) },
      select: {
        title: true,
        description: true,
        completed: true,
        priority: true,
        dueDate: true,
        categoryId: true
      }
    })

    const updatedTodo = await prisma.todo.update({
      where: {
        id: parseInt(id)
      },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(completed !== undefined && { completed }),
        ...(priority !== undefined && { priority }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        ...(categoryId !== undefined && { categoryId })
      },
      include: {
        category: true,
        user: {
          select: { id: true, name: true, email: true }
        },
        project: {
          include: {
            shares: {
              include: {
                user: {
                  select: { id: true, name: true, email: true }
                }
              }
            }
          }
        }
      }
    })

    // Créer des notifications pour les autres collaborateurs du projet
    if (updatedTodo.project.shares.length > 0) {
      const notifications = updatedTodo.project.shares
        .filter(share => share.userId !== userId)
        .map(share => ({
          userId: share.userId,
          type: 'todo_updated',
          title: 'Todo mis à jour',
          message: `${updatedTodo.user.name} a mis à jour "${updatedTodo.title}" dans le projet "${updatedTodo.project.name}"`,
          data: JSON.stringify({
            todoId: updatedTodo.id,
            projectId: updatedTodo.projectId,
            updatedBy: userId,
            changes: { title, description, completed, priority, dueDate, categoryId }
          })
        }))

      if (notifications.length > 0) {
        await prisma.notification.createMany({
          data: notifications
        })
      }
    }

    const enrichedTodo = {
      ...updatedTodo,
      canEdit: projectPermission === 'edit' || projectPermission === 'admin' || updatedTodo.userId === userId,
      canDelete: projectPermission === 'admin' || (projectPermission === 'edit' && updatedTodo.userId === userId),
      projectPermission: projectPermission
    }

    // Émettre un événement Socket.IO pour la mise à jour en temps réel
    if (global.io) {
      global.io.to(`project_${updatedTodo.projectId}`).emit('todo_updated', {
        todo: enrichedTodo,
        projectId: updatedTodo.projectId,
        userId: userId,
        userName: updatedTodo.user.name
      })
    }

    // Tracker la modification de la todo
    const { ipAddress, userAgent } = extractRequestInfo(request)
    
    // Récupérer le nom de l'utilisateur pour le textLog
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true }
    })
    
    const textLog = generateTextLog('tâche', 'edit', currentUser?.name || 'Utilisateur', originalTodo, updatedTodo)
    
    await logAdd(
      userId,
      'tâche',
      'edit',
      originalTodo,
      updatedTodo,
      ipAddress,
      userAgent,
      textLog
    ).catch(error => {
      console.error('Erreur lors du tracking de modification de todo:', error)
    })
    
    return NextResponse.json(enrichedTodo)
  } catch (error) {
    console.error('Erreur lors de la mise à jour du todo:', error)
    return NextResponse.json({ error: 'Erreur lors de la mise à jour du todo' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const userId = await getUserFromRequest(request)
    if (!userId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { id } = params
    
    // Récupérer le todo avec le projet et l'utilisateur
    const todo = await prisma.todo.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        project: {
          include: {
            shares: {
              include: {
                user: {
                  select: { id: true, name: true, email: true }
                }
              }
            }
          }
        }
      }
    })

    if (!todo) {
      return NextResponse.json({ error: 'Todo non trouvé' }, { status: 404 })
    }

    // Vérifier les permissions sur le projet
    const isProjectOwner = todo.project.userId === userId
    const userProjectShare = todo.project.shares.find(share => share.userId === userId)
    const projectPermission = isProjectOwner ? 'admin' : userProjectShare?.permission

    // Logs de débogage
    console.log('Suppression todo - Debug permissions:', {
      todoId: parseInt(id),
      userId,
      todoUserId: todo.userId,
      projectUserId: todo.project.userId,
      isProjectOwner,
      userProjectShare: userProjectShare ? { userId: userProjectShare.userId, permission: userProjectShare.permission } : null,
      projectPermission
    })

    // Vérifier que l'utilisateur peut supprimer ce todo
    const canDelete = projectPermission === 'admin' || (projectPermission === 'edit' && todo.userId === userId)

    console.log('Suppression todo - Peut supprimer:', canDelete)

    if (!canDelete) {
      return NextResponse.json({ error: 'Permissions insuffisantes pour supprimer ce todo' }, { status: 403 })
    }

    // Récupérer l'utilisateur qui supprime pour les notifications
    const deletingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true }
    })

    // Créer des notifications pour les collaborateurs avant suppression
    if (todo.project.shares.length > 0) {
      const notifications = todo.project.shares
        .filter(share => share.userId !== userId)
        .map(share => ({
          userId: share.userId,
          type: 'todo_deleted',
          title: 'Todo supprimé',
          message: `${deletingUser.name} a supprimé "${todo.title}" du projet "${todo.project.name}"`,
          data: JSON.stringify({
            todoId: parseInt(id),
            projectId: todo.projectId,
            deletedBy: userId
          })
        }))

      if (notifications.length > 0) {
        await prisma.notification.createMany({
          data: notifications
        })
      }
    }

    // Émettre un événement Socket.IO avant suppression pour la mise à jour temps réel
    if (global.io) {
      global.io.to(`project_${todo.projectId}`).emit('todo_deleted', {
        todoId: parseInt(id),
        projectId: todo.projectId,
        userId: userId,
        userName: deletingUser.name,
        todoTitle: todo.title
      })
    }

    // Tracker la suppression de la todo avant de la supprimer
    const { ipAddress, userAgent } = extractRequestInfo(request)
    
    // Préparer les données de l'élément supprimé
    const deletedData = {
      id: todo.id,
      title: todo.title,
      description: todo.description,
      completed: todo.completed,
      priority: todo.priority,
      dueDate: todo.dueDate,
      categoryId: todo.categoryId,
      userId: todo.userId,
      projectId: todo.projectId,
      createdAt: todo.createdAt,
      updatedAt: todo.updatedAt
    }
    
    const textLog = generateTextLog('tâche', 'delete', deletingUser?.name || 'Utilisateur', deletedData, null)
    
    await logAdd(
      userId,
      'tâche',
      'delete',
      deletedData,
      null,
      ipAddress,
      userAgent,
      textLog
    ).catch(error => {
      console.error('Erreur lors du tracking de suppression de todo:', error)
    })
    
    await prisma.todo.delete({
      where: {
        id: parseInt(id)
      }
    })
    
    return NextResponse.json({ message: 'Todo supprimé avec succès' })
  } catch (error) {
    console.error('Erreur lors de la suppression du todo:', error)
    return NextResponse.json({ error: 'Erreur lors de la suppression du todo' }, { status: 500 })
  }
} 