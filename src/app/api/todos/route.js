import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { withApiLogging, getAuthenticatedUser } from '@/lib/apiMiddleware'
import { logAdd, extractRequestInfo, generateTextLog } from '@/lib/userActivityLogger'

const prisma = new PrismaClient()

async function getHandler(request) {
  try {
    const authResult = await getAuthenticatedUser(request)
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const { user } = authResult
    const userId = user.id

    const url = new URL(request.url)
    const projectId = url.searchParams.get('projectId')
    const completed = url.searchParams.get('completed')
    const search = url.searchParams.get('search')
    const category = url.searchParams.get('category')
    const priority = url.searchParams.get('priority')

    let whereClause = {}

    if (projectId) {
      // Si un projectId est spécifié, récupérer toutes les todos du projet
      // pour lesquelles l'utilisateur a accès (soit propriétaire, soit collaborateur)
      whereClause = {
        projectId: parseInt(projectId),
        project: {
          OR: [
            { userId: userId }, // Propriétaire du projet
            {
              shares: {
                some: {
                  userId: userId // Collaborateur du projet
                }
              }
            }
          ]
        }
      }
    } else {
      // Si aucun projectId n'est spécifié, récupérer toutes les todos de l'utilisateur
      // et celles des projets partagés avec lui
      whereClause = {
        OR: [
          { userId: userId },
          {
            project: {
              shares: {
                some: {
                  userId: userId
                }
              }
            }
          }
        ]
      }
    }

    if (completed !== null && completed !== '') {
      whereClause.completed = completed === 'true'
    }

    if (search) {
      // Ajouter la recherche aux conditions existantes
      whereClause.AND = [
        ...(whereClause.AND || []),
        {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } }
          ]
        }
      ]
    }

    if (category) {
      whereClause.categoryId = parseInt(category)
    }

    if (priority) {
      whereClause.priority = priority
    }

    const todos = await prisma.todo.findMany({
      where: whereClause,
      include: {
        category: true,
        project: {
          include: {
            shares: {
              where: {
                userId: userId
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: [
        { completed: 'asc' },
        { priority: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    // Ajouter les permissions pour chaque todo
    const todosWithPermissions = todos.map(todo => {
      const isOwner = todo.project.userId === userId
      const isCreator = todo.userId === userId
      
      // Trouver les permissions de l'utilisateur sur le projet
      const userShare = todo.project.shares.find(share => share.userId === userId)
      const projectPermission = userShare ? userShare.permission : null
      
      // Permissions d'édition et de suppression
      const canEdit = isCreator || isOwner || projectPermission === 'admin'
      const canDelete = isCreator || isOwner || projectPermission === 'admin'

      // Nettoyer l'objet project pour ne pas exposer les shares
      const cleanProject = {
        id: todo.project.id,
        name: todo.project.name,
        color: todo.project.color,
        emoji: todo.project.emoji
      }

      return {
        ...todo,
        project: cleanProject,
        canEdit,
        canDelete
      }
    })

    return NextResponse.json(todosWithPermissions)
  } catch (error) {
    console.error('Erreur lors de la récupération des todos:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

async function postHandler(request) {
  try {
    const authResult = await getAuthenticatedUser(request)
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const { user } = authResult
    const userId = user.id

    const body = await request.json()
    const { title, description, projectId, categoryId, priority, dueDate } = body

    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'Le titre est requis' }, { status: 400 })
    }

    if (!projectId) {
      return NextResponse.json({ error: 'Le projet est requis' }, { status: 400 })
    }

    // Vérifier que l'utilisateur a accès au projet
    const project = await prisma.project.findFirst({
      where: {
        id: parseInt(projectId),
        OR: [
          { userId: userId },
          {
            shares: {
              some: {
                userId: userId,
                permission: {
                  in: ['edit', 'admin']
                }
              }
            }
          }
        ]
      }
    })

    if (!project) {
      return NextResponse.json({ error: 'Projet non trouvé ou accès refusé' }, { status: 404 })
    }

    const todo = await prisma.todo.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        projectId: parseInt(projectId),
        categoryId: categoryId ? parseInt(categoryId) : null,
        priority: priority || 'medium',
        dueDate: dueDate ? new Date(dueDate) : null,
        userId: userId
      },
      include: {
        category: true,
        project: {
          select: {
            id: true,
            name: true,
            color: true,
            emoji: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    // Tracker la création de la todo
    const { ipAddress, userAgent } = extractRequestInfo(request)
    
    // Préparer les données de l'élément créé
    const createdData = {
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
    
    const textLog = generateTextLog('tâche', 'create', user.name || 'Utilisateur', null, createdData)
    
    await logAdd(
      userId, 
      'tâche', 
      'create',
      null,
      createdData,
      ipAddress, 
      userAgent,
      textLog
    ).catch(error => {
      console.error('Erreur lors du tracking de création de todo:', error)
    })

    return NextResponse.json(todo, { status: 201 })
  } catch (error) {
    console.error('Erreur lors de la création du todo:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export const GET = withApiLogging(getHandler)
export const POST = withApiLogging(postHandler) 