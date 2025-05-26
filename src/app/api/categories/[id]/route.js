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

export async function PUT(request, { params }) {
  try {
    const userId = await getUserFromRequest(request)
    if (!userId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { id } = params
    const { name, color, emoji } = await request.json()
    
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