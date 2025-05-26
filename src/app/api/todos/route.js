import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyToken, getTokenFromRequest } from '@/lib/auth'

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

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category')
    const priority = searchParams.get('priority')
    const completed = searchParams.get('completed')

    if (!projectId) {
      return NextResponse.json({ error: 'ID du projet requis' }, { status: 400 })
    }

    // Vérifier que l'utilisateur a accès au projet
    const projectAccess = await prisma.project.findFirst({
      where: {
        id: parseInt(projectId),
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
    })

    if (!projectAccess) {
      return NextResponse.json({ error: 'Accès au projet refusé' }, { status: 403 })
    }

    // Recherche de base pour les filtres
    const searchFilter = search ? {
      OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    } : {}

    const priorityFilter = priority ? { priority } : {}
    const completedFilter = completed !== null ? { completed: completed === 'true' } : {}
    const categoryFilter = category ? { categoryId: parseInt(category) } : {}

    // Récupérer les todos du projet
    const todos = await prisma.todo.findMany({
      where: {
        projectId: parseInt(projectId),
        ...searchFilter,
        ...categoryFilter,
        ...priorityFilter,
        ...completedFilter
      },
      include: {
        category: true,
        user: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: [
        { completed: 'asc' },
        { createdAt: 'desc' }
      ]
    })

    // Déterminer les permissions de l'utilisateur sur le projet
    const isOwner = projectAccess.userId === userId
    let userPermission = 'view'
    
    if (isOwner) {
      userPermission = 'admin'
    } else {
      const userShare = await prisma.projectShare.findFirst({
        where: {
          projectId: parseInt(projectId),
          userId: userId
        }
      })
      userPermission = userShare?.permission || 'view'
    }

    // Enrichir chaque todo avec les permissions
    const enrichedTodos = todos.map(todo => ({
      ...todo,
      canEdit: userPermission === 'edit' || userPermission === 'admin' || todo.userId === userId,
      canDelete: userPermission === 'admin' || (userPermission === 'edit' && todo.userId === userId),
      projectPermission: userPermission
    }))
    
    return NextResponse.json(enrichedTodos)
  } catch (error) {
    console.error('Erreur lors de la récupération des todos:', error)
    return NextResponse.json({ error: 'Erreur lors de la récupération des todos' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const userId = await getUserFromRequest(request)
    if (!userId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { title, description, priority, dueDate, categoryId, projectId } = await request.json()
    
    if (!title) {
      return NextResponse.json({ error: 'Le titre est requis' }, { status: 400 })
    }

    if (!projectId) {
      return NextResponse.json({ error: 'L\'ID du projet est requis' }, { status: 400 })
    }

    // Vérifier que l'utilisateur peut créer des todos dans ce projet
    const projectAccess = await prisma.project.findFirst({
      where: {
        id: parseInt(projectId),
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
      return NextResponse.json({ error: 'Permissions insuffisantes pour créer des todos dans ce projet' }, { status: 403 })
    }

    const todo = await prisma.todo.create({
      data: {
        title,
        description,
        priority: priority || 'medium',
        dueDate: dueDate ? new Date(dueDate) : null,
        categoryId: categoryId || null,
        projectId: parseInt(projectId),
        userId
      },
      include: {
        category: true,
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    // Déterminer les permissions pour le retour
    const isOwner = projectAccess.userId === userId
    let userPermission = 'view'
    
    if (isOwner) {
      userPermission = 'admin'
    } else {
      const userShare = await prisma.projectShare.findFirst({
        where: {
          projectId: parseInt(projectId),
          userId: userId
        }
      })
      userPermission = userShare?.permission || 'view'
    }

    const enrichedTodo = {
      ...todo,
      canEdit: userPermission === 'edit' || userPermission === 'admin' || todo.userId === userId,
      canDelete: userPermission === 'admin' || (userPermission === 'edit' && todo.userId === userId),
      projectPermission: userPermission
    }

    // Émettre un événement Socket.IO pour la création en temps réel
    if (global.io) {
      global.io.to(`project_${projectId}`).emit('todo_created', {
        todo: enrichedTodo,
        projectId: parseInt(projectId),
        userId: userId,
        userName: todo.user.name
      })
    }
    
    return NextResponse.json(enrichedTodo, { status: 201 })
  } catch (error) {
    console.error('Erreur lors de la création du todo:', error)
    return NextResponse.json({ error: 'Erreur lors de la création du todo' }, { status: 500 })
  }
} 