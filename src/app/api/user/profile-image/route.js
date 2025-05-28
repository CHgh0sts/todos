import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyToken, getTokenFromRequest } from '@/lib/auth'

export async function POST(request) {
  try {
    const token = getTokenFromRequest(request)
    
    if (!token) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 })
    }
    
    const userId = decoded.userId

    const formData = await request.formData()
    const file = formData.get('profileImage')

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 })
    }

    // Vérifier le type de fichier
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Type de fichier non supporté. Utilisez JPG, PNG ou WebP.' 
      }, { status: 400 })
    }

    // Vérifier la taille (5MB max)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: 'Fichier trop volumineux. Taille maximum : 5MB.' 
      }, { status: 400 })
    }

    // Convertir le fichier en base64
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString('base64')
    const dataUrl = `data:${file.type};base64,${base64}`

    // Mettre à jour l'utilisateur avec l'image en base64
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { profileImage: dataUrl },
      select: {
        id: true,
        name: true,
        email: true,
        profileImage: true
      }
    })

    return NextResponse.json({
      message: 'Image de profil mise à jour avec succès',
      user: updatedUser
    })

  } catch (error) {
    console.error('Erreur upload image:', error)
    return NextResponse.json({ 
      error: 'Erreur lors de l\'upload de l\'image' 
    }, { status: 500 })
  }
}

export async function DELETE(request) {
  try {
    const token = getTokenFromRequest(request)
    
    if (!token) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 })
    }
    
    const userId = decoded.userId

    // Supprimer l'image de profil (mettre à null)
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { profileImage: null },
      select: {
        id: true,
        name: true,
        email: true,
        profileImage: true
      }
    })

    return NextResponse.json({
      message: 'Image de profil supprimée avec succès',
      user: updatedUser
    })

  } catch (error) {
    console.error('Erreur suppression image:', error)
    return NextResponse.json({ 
      error: 'Erreur lors de la suppression de l\'image' 
    }, { status: 500 })
  }
} 