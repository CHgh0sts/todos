import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { withApiLogging, getAuthenticatedUser } from '@/lib/apiMiddleware'

const prisma = new PrismaClient()

async function deleteHandler(request, { params }) {
  try {
    const authResult = await getAuthenticatedUser(request)
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const { user } = authResult
    const commentId = parseInt(params.id)

    if (!commentId) {
      return NextResponse.json({ error: 'ID de commentaire invalide' }, { status: 400 })
    }

    // Vérifier que le commentaire existe et que l'utilisateur peut le supprimer
    const comment = await prisma.commentaire.findFirst({
      where: {
        id: commentId
      },
      include: {
        todo: {
          include: {
            project: {
              include: {
                shares: true
              }
            }
          }
        }
      }
    })

    if (!comment) {
      return NextResponse.json({ error: 'Commentaire non trouvé' }, { status: 404 })
    }

    // Vérifier les permissions de suppression
    const canDelete = (
      comment.userId === user.id || // Auteur du commentaire
      comment.todo.project.userId === user.id || // Propriétaire du projet
      ['ADMIN', 'MODERATOR'].includes(user.role) || // Admin/Modérateur
      comment.todo.project.shares.some(share => 
        share.userId === user.id && ['admin', 'super_admin', 'moderator'].includes(share.permission)
      ) // Collaborateur avec permissions admin
    )

    if (!canDelete) {
      return NextResponse.json({ error: 'Vous n\'avez pas l\'autorisation de supprimer ce commentaire' }, { status: 403 })
    }

    // Supprimer le commentaire
    await prisma.commentaire.delete({
      where: {
        id: commentId
      }
    })

    return NextResponse.json({ message: 'Commentaire supprimé avec succès' })
  } catch (error) {
    console.error('Erreur lors de la suppression du commentaire:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}

async function putHandler(request, { params }) {
  try {
    const authResult = await getAuthenticatedUser(request)
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const { user } = authResult
    const commentId = parseInt(params.id)
    const { content } = await request.json()

    if (!commentId) {
      return NextResponse.json({ error: 'ID de commentaire invalide' }, { status: 400 })
    }

    if (!content || !content.trim()) {
      return NextResponse.json({ error: 'Le contenu du commentaire est requis' }, { status: 400 })
    }

    // Vérifier que le commentaire existe et que l'utilisateur peut le modifier
    const comment = await prisma.commentaire.findFirst({
      where: {
        id: commentId,
        userId: user.id // Seul l'auteur peut modifier son commentaire
      }
    })

    if (!comment) {
      return NextResponse.json({ error: 'Commentaire non trouvé ou vous n\'êtes pas autorisé à le modifier' }, { status: 404 })
    }

    // Mettre à jour le commentaire
    const updatedComment = await prisma.commentaire.update({
      where: {
        id: commentId
      },
      data: {
        content: content.trim()
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

    return NextResponse.json(updatedComment)
  } catch (error) {
    console.error('Erreur lors de la modification du commentaire:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}

export const DELETE = withApiLogging(deleteHandler)
export const PUT = withApiLogging(putHandler)
