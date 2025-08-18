import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { withApiLogging, getAuthenticatedUser } from '@/lib/apiMiddleware'

const prisma = new PrismaClient()

async function getHandler(request) {
  try {
    const authResult = await getAuthenticatedUser(request)
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const { user } = authResult
    const url = new URL(request.url)
    const todoId = url.searchParams.get('todoId')

    if (!todoId) {
      return NextResponse.json({ error: 'todoId requis' }, { status: 400 })
    }

    // Vérifier que l'utilisateur a accès à cette todo
    const todo = await prisma.todo.findFirst({
      where: {
        id: parseInt(todoId),
        project: {
          OR: [
            { userId: user.id }, // Propriétaire du projet
            {
              shares: {
                some: {
                  userId: user.id // Collaborateur du projet
                }
              }
            }
          ]
        }
      }
    })

    if (!todo) {
      return NextResponse.json({ error: 'Todo non trouvée ou accès refusé' }, { status: 404 })
    }

    // Récupérer les commentaires de cette todo
    const comments = await prisma.commentaire.findMany({
      where: {
        todoId: parseInt(todoId)
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    return NextResponse.json(comments)
  } catch (error) {
    console.error('Erreur lors de la récupération des commentaires:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}

async function postHandler(request) {
  try {
    const authResult = await getAuthenticatedUser(request)
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const { user } = authResult
    const { todoId, content } = await request.json()

    if (!todoId || !content || !content.trim()) {
      return NextResponse.json({ error: 'todoId et content sont requis' }, { status: 400 })
    }

    // Vérifier que l'utilisateur a accès à cette todo
    const todo = await prisma.todo.findFirst({
      where: {
        id: parseInt(todoId),
        project: {
          OR: [
            { userId: user.id }, // Propriétaire du projet
            {
              shares: {
                some: {
                  userId: user.id // Collaborateur du projet
                }
              }
            }
          ]
        }
      }
    })

    if (!todo) {
      return NextResponse.json({ error: 'Todo non trouvée ou accès refusé' }, { status: 404 })
    }

    // Créer le commentaire
    const comment = await prisma.commentaire.create({
      data: {
        content: content.trim(),
        todoId: parseInt(todoId),
        userId: user.id
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true
          }
        }
      }
    })

    return NextResponse.json(comment, { status: 201 })
  } catch (error) {
    console.error('Erreur lors de la création du commentaire:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}

export const GET = withApiLogging(getHandler)
export const POST = withApiLogging(postHandler)
