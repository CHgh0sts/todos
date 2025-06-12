import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { withAdminAuth } from '@/lib/adminMiddleware'
import { logActivity, ACTIONS, ENTITIES, extractRequestInfo } from '@/lib/activityLogger'

const prisma = new PrismaClient()

async function getHandler(request, { params }) {
  try {
    const { id: projectId } = params
    
    if (!projectId) {
      return NextResponse.json({ error: 'ID projet requis' }, { status: 400 })
    }

    // Vérifier que le projet existe
    const project = await prisma.project.findUnique({
      where: { id: parseInt(projectId) },
      select: {
        id: true,
        name: true,
        userId: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    if (!project) {
      return NextResponse.json({ error: 'Projet non trouvé' }, { status: 404 })
    }

    // Récupérer TOUTES les tâches du projet (sans restriction de permissions)
    const todos = await prisma.todo.findMany({
      where: {
        projectId: parseInt(projectId)
      },
      include: {
        category: true,
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

    // Logger l'activité admin
    const { ipAddress, userAgent } = extractRequestInfo(request)
    await logActivity({
      userId: request.user.id,
      action: ACTIONS.VIEW,
      entity: ENTITIES.TODO,
      details: {
        action: 'admin_view_project_todos',
        projectId: parseInt(projectId),
        projectName: project.name,
        projectOwner: project.user.name,
        todosCount: todos.length
      },
      ipAddress,
      userAgent
    })

    return NextResponse.json({
      todos,
      project: {
        id: project.id,
        name: project.name,
        owner: project.user
      }
    })

  } catch (error) {
    console.error('Erreur lors de la récupération des todos admin:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

export const GET = withAdminAuth(getHandler, ['ADMIN', 'MODERATOR']) 