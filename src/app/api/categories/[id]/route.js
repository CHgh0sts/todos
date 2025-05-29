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
    const { name, color, emoji } = await request.json()
    
    // Récupérer les valeurs originales AVANT modification pour le tracking
    const originalCategory = await prisma.category.findFirst({
      where: {
        id: parseInt(id),
        userId
      },
      select: {
        name: true,
        color: true,
        emoji: true
      }
    })

    if (!originalCategory) {
      return NextResponse.json({ error: 'Catégorie non trouvée' }, { status: 404 })
    }
    
    const category = await prisma.category.update({
      where: {
        id: parseInt(id)
      },
      data: {
        ...(name !== undefined && { name }),
        ...(color !== undefined && { color }),
        ...(emoji !== undefined && { emoji })
      }
    })

    // Tracker la modification de la catégorie
    const { ipAddress, userAgent } = extractRequestInfo(request)
    
    // Récupérer le nom de l'utilisateur pour le textLog
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true }
    })
    
    const textLog = generateTextLog('catégorie', 'edit', currentUser?.name || 'Utilisateur', originalCategory, category)

    await logAdd(
      userId,
      'catégorie',
      'edit',
      originalCategory,
      category,
      ipAddress,
      userAgent,
      textLog
    ).catch(error => {
      console.error('Erreur lors de l\'enregistrement de l\'activité de modification de catégorie:', error)
    })
    
    return NextResponse.json(category)
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la catégorie:', error)
    return NextResponse.json({ error: 'Erreur lors de la mise à jour de la catégorie' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const userId = await getUserFromRequest(request)
    if (!userId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { id } = params
    
    // Vérifier que la catégorie appartient à l'utilisateur
    const existingCategory = await prisma.category.findFirst({
      where: {
        id: parseInt(id),
        userId
      }
    })

    if (!existingCategory) {
      return NextResponse.json({ error: 'Catégorie non trouvée' }, { status: 404 })
    }

    // Tracker la suppression de la catégorie avant de la supprimer
    const { ipAddress, userAgent } = extractRequestInfo(request)
    
    // Récupérer le nom de l'utilisateur pour le textLog
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true }
    })
    
    // Préparer les données de l'élément supprimé
    const deletedData = {
      id: existingCategory.id,
      name: existingCategory.name,
      color: existingCategory.color,
      emoji: existingCategory.emoji,
      userId: existingCategory.userId,
      projectId: existingCategory.projectId,
      createdAt: existingCategory.createdAt,
      updatedAt: existingCategory.updatedAt
    }
    
    const textLog = generateTextLog('catégorie', 'delete', currentUser?.name || 'Utilisateur', deletedData, null)
    
    await logAdd(
      userId,
      'catégorie',
      'delete',
      deletedData,
      null,
      ipAddress,
      userAgent,
      textLog
    ).catch(error => {
      console.error('Erreur lors du tracking de suppression de catégorie:', error)
    })
    
    await prisma.category.delete({
      where: {
        id: parseInt(id)
      }
    })
    
    return NextResponse.json({ message: 'Catégorie supprimée avec succès' })
  } catch (error) {
    console.error('Erreur lors de la suppression de la catégorie:', error)
    return NextResponse.json({ error: 'Erreur lors de la suppression de la catégorie' }, { status: 500 })
  }
} 