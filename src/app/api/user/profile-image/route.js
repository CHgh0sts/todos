import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyToken, getTokenFromRequest } from '@/lib/auth'
import cloudinary from '@/lib/cloudinary'

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

    // Validation du type de fichier
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Type de fichier non supporté. Utilisez JPG, PNG ou WebP.' 
      }, { status: 400 })
    }

    // Validation de la taille (5MB max)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: 'Le fichier est trop volumineux. Taille maximum : 5MB.' 
      }, { status: 400 })
    }

    // Supprimer l'ancienne image si elle existe
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { profileImage: true }
    })

    if (currentUser?.profileImage) {
      try {
        // Extraire le public_id de l'URL Cloudinary
        const urlParts = currentUser.profileImage.split('/')
        const publicIdWithExtension = urlParts[urlParts.length - 1]
        const publicId = `profile-images/${publicIdWithExtension.split('.')[0]}`
        
        await cloudinary.uploader.destroy(publicId)
      } catch (error) {
        console.error('Erreur lors de la suppression de l\'ancienne image:', error)
        // On continue même si la suppression échoue
      }
    }

    // Convertir le fichier en buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload vers Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'profile-images',
          public_id: `user_${userId}_${Date.now()}`,
          transformation: [
            { width: 400, height: 400, crop: 'fill', gravity: 'face' },
            { quality: 'auto', fetch_format: 'auto' }
          ]
        },
        (error, result) => {
          if (error) reject(error)
          else resolve(result)
        }
      ).end(buffer)
    })

    // Mettre à jour l'utilisateur avec la nouvelle URL
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { profileImage: uploadResult.secure_url },
      select: {
        id: true,
        name: true,
        email: true,
        profileImage: true,
        plan: true,
        createdAt: true
      }
    })

    return NextResponse.json({
      message: 'Image de profil mise à jour avec succès',
      user: updatedUser,
      imageUrl: uploadResult.secure_url
    })

  } catch (error) {
    console.error('Erreur lors de l\'upload de l\'image:', error)
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

    // Récupérer l'utilisateur actuel
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { profileImage: true }
    })

    if (!currentUser?.profileImage) {
      return NextResponse.json({ 
        error: 'Aucune image de profil à supprimer' 
      }, { status: 400 })
    }

    // Supprimer l'image de Cloudinary
    try {
      const urlParts = currentUser.profileImage.split('/')
      const publicIdWithExtension = urlParts[urlParts.length - 1]
      const publicId = `profile-images/${publicIdWithExtension.split('.')[0]}`
      
      await cloudinary.uploader.destroy(publicId)
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'image Cloudinary:', error)
      // On continue même si la suppression échoue
    }

    // Mettre à jour l'utilisateur
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { profileImage: null },
      select: {
        id: true,
        name: true,
        email: true,
        profileImage: true,
        plan: true,
        createdAt: true
      }
    })

    return NextResponse.json({
      message: 'Image de profil supprimée avec succès',
      user: updatedUser
    })

  } catch (error) {
    console.error('Erreur lors de la suppression de l\'image:', error)
    return NextResponse.json({ 
      error: 'Erreur lors de la suppression de l\'image' 
    }, { status: 500 })
  }
} 