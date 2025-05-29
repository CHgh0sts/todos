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
    const userId = url.searchParams.get('userId') || ''
    const sortBy = url.searchParams.get('sortBy') || 'createdAt'
    const sortOrder = url.searchParams.get('sortOrder') || 'desc'

    const skip = (page - 1) * limit

    // Construire les conditions de recherche
    let whereClause = {}

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (userId) {
      whereClause.userId = parseInt(userId)
    }

    // Récupérer les projets avec pagination
    const [projects, totalCount] = await Promise.all([
      prisma.project.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              profileImage: true
            }
          },
          todos: {
            select: {
              id: true,
              completed: true
            }
          },
          _count: {
            select: {
              todos: true,
              shares: true,
              invitations: true,
              shareLinks: true
            }
          }
        },
        orderBy: {
          [sortBy]: sortOrder
        },
        skip,
        take: limit
      }),
      prisma.project.count({ where: whereClause })
    ])

    // Transformer les données pour correspondre au frontend
    const transformedProjects = projects.map(project => ({
      ...project,
      owner: project.user, // Renommer user en owner
      _count: {
        ...project._count,
        collaborators: project._count.shares // Ajouter le count des collaborateurs
      }
    }))

    // Statistiques globales
    const [projectStats, todoStats, collaboratorStats] = await Promise.all([
      prisma.project.aggregate({
        _count: { id: true }
      }),
      prisma.todo.aggregate({
        _count: { id: true },
        where: { completed: true }
      }),
      prisma.projectShare.aggregate({
        _count: { id: true }
      })
    ])

    const totalTodos = await prisma.todo.count()

    // Logger l'activité
    const { ipAddress, userAgent } = extractRequestInfo(request)
    await logActivity({
      userId: request.user.id,
      action: ACTIONS.VIEW,
      entity: ENTITIES.PROJECT,
      details: {
        action: 'admin_projects_list',
        filters: { search, userId, page, limit },
        resultCount: projects.length
      },
      ipAddress,
      userAgent
    })

    return NextResponse.json({
      projects: transformedProjects,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      },
      stats: {
        totalProjects: projectStats._count.id,
        totalTodos: totalTodos,
        completedTodos: todoStats._count.id,
        totalCollaborators: collaboratorStats._count.id
      }
    })

  } catch (error) {
    console.error('Erreur lors de la récupération des projets:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

async function deleteHandler(request) {
  try {
    const url = new URL(request.url)
    const projectId = url.searchParams.get('projectId')

    if (!projectId) {
      return NextResponse.json({ error: 'ID projet requis' }, { status: 400 })
    }

    // Récupérer le projet cible
    const targetProject = await prisma.project.findUnique({
      where: { id: parseInt(projectId) },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            todos: true,
            shares: true
          }
        }
      }
    })

    if (!targetProject) {
      return NextResponse.json({ error: 'Projet non trouvé' }, { status: 404 })
    }

    const currentUser = request.user

    // Seuls les admins peuvent supprimer des projets
    if (currentUser.role !== 'ADMIN') {
      return NextResponse.json({ 
        error: 'Seuls les administrateurs peuvent supprimer des projets' 
      }, { status: 403 })
    }

    // Supprimer le projet (cascade défini dans le schema)
    await prisma.project.delete({
      where: { id: parseInt(projectId) }
    })

    // Logger l'activité
    const { ipAddress, userAgent } = extractRequestInfo(request)
    await logActivity({
      userId: currentUser.id,
      action: ACTIONS.ADMIN_PROJECT_DELETE,
      entity: ENTITIES.PROJECT,
      entityId: targetProject.id,
      targetUserId: targetProject.userId,
      details: {
        action: 'admin_project_delete',
        deletedProject: {
          name: targetProject.name,
          description: targetProject.description,
          owner: targetProject.user.name,
          todosCount: targetProject._count.todos,
          sharesCount: targetProject._count.shares
        }
      },
      ipAddress,
      userAgent
    })

    return NextResponse.json({ message: 'Projet supprimé avec succès' })

  } catch (error) {
    console.error('Erreur lors de la suppression du projet:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

export const GET = withAdminAuth(getHandler, ['ADMIN', 'MODERATOR'])
export const DELETE = withAdminAuth(deleteHandler, ['ADMIN']) 