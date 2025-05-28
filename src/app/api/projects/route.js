import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'
import { withApiLogging, getAuthenticatedUser } from '@/lib/apiMiddleware'

const prisma = new PrismaClient()

async function getHandler(request) {
  try {
    console.log('🔍 [Projects API] Début de la récupération des projets')
    
    const authResult = await getAuthenticatedUser(request)
    if (authResult.error) {
      console.error('❌ [Projects API] Erreur d\'authentification:', authResult.error)
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const { user } = authResult
    const userId = user.id
    console.log('✅ [Projects API] Utilisateur authentifié:', { userId, userName: user.name })

    // Vérifier la connexion à la base de données
    try {
      await prisma.$connect()
      console.log('✅ [Projects API] Connexion à la base de données établie')
    } catch (dbError) {
      console.error('❌ [Projects API] Erreur de connexion à la base de données:', dbError)
      return NextResponse.json({ error: 'Erreur de connexion à la base de données' }, { status: 500 })
    }

    // Récupérer les projets de l'utilisateur
    console.log('🔍 [Projects API] Récupération des projets pour l\'utilisateur:', userId)
    
    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { userId: userId },
          {
            shares: {
              some: {
                userId: userId
              }
            }
          }
        ]
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true
          }
        },
        shares: {
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
        },
        _count: {
          select: {
            todos: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    console.log('✅ [Projects API] Projets récupérés:', { count: projects.length })

    // Ajouter les propriétés isOwner et permission pour chaque projet
    const projectsWithPermissions = projects.map(project => {
      const isOwner = project.userId === userId
      let permission = null
      let sharedWith = []

      if (!isOwner) {
        // Trouver la permission de l'utilisateur actuel
        const userShare = project.shares.find(share => share.userId === userId)
        permission = userShare ? userShare.permission : null
      }

      // Filtrer les partages pour ne pas inclure l'utilisateur actuel
      sharedWith = project.shares.filter(share => share.userId !== userId)

      return {
        ...project,
        isOwner,
        permission,
        sharedWith
      }
    })

    console.log('✅ [Projects API] Projets avec permissions calculées:', { count: projectsWithPermissions.length })
    return NextResponse.json(projectsWithPermissions)
    
  } catch (error) {
    console.error('❌ [Projects API] Erreur lors de la récupération des projets:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    })
    
    // Gestion spécifique des erreurs Prisma
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Conflit de données' }, { status: 409 })
    }
    
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Données non trouvées' }, { status: 404 })
    }
    
    if (error.code?.startsWith('P')) {
      return NextResponse.json({ error: 'Erreur de base de données', details: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ 
      error: 'Erreur serveur', 
      details: process.env.NODE_ENV === 'development' ? error.message : undefined 
    }, { status: 500 })
  } finally {
    try {
      await prisma.$disconnect()
      console.log('✅ [Projects API] Déconnexion de la base de données')
    } catch (disconnectError) {
      console.error('⚠️ [Projects API] Erreur lors de la déconnexion:', disconnectError)
    }
  }
}

async function postHandler(request) {
  try {
    console.log('🔍 [Projects API] Début de la création d\'un projet')
    
    const authResult = await getAuthenticatedUser(request)
    if (authResult.error) {
      console.error('❌ [Projects API] Erreur d\'authentification:', authResult.error)
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const { user } = authResult
    const userId = user.id
    console.log('✅ [Projects API] Utilisateur authentifié pour création:', { userId, userName: user.name })

    const body = await request.json()
    const { name, description, color, emoji } = body
    console.log('📝 [Projects API] Données du projet à créer:', { name, description, color, emoji })

    if (!name || !name.trim()) {
      console.error('❌ [Projects API] Nom du projet manquant')
      return NextResponse.json({ error: 'Le nom du projet est requis' }, { status: 400 })
    }

    // Vérifier la connexion à la base de données
    try {
      await prisma.$connect()
      console.log('✅ [Projects API] Connexion à la base de données établie pour création')
    } catch (dbError) {
      console.error('❌ [Projects API] Erreur de connexion à la base de données:', dbError)
      return NextResponse.json({ error: 'Erreur de connexion à la base de données' }, { status: 500 })
    }

    const project = await prisma.project.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        color: color || '#3B82F6',
        emoji: emoji || '📁',
        userId: userId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true
          }
        },
        _count: {
          select: {
            todos: true
          }
        }
      }
    })

    console.log('✅ [Projects API] Projet créé avec succès:', { projectId: project.id, projectName: project.name })
    return NextResponse.json(project, { status: 201 })
    
  } catch (error) {
    console.error('❌ [Projects API] Erreur lors de la création du projet:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    })
    
    // Gestion spécifique des erreurs Prisma
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Un projet avec ce nom existe déjà' }, { status: 409 })
    }
    
    if (error.code?.startsWith('P')) {
      return NextResponse.json({ error: 'Erreur de base de données', details: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ 
      error: 'Erreur serveur', 
      details: process.env.NODE_ENV === 'development' ? error.message : undefined 
    }, { status: 500 })
  } finally {
    try {
      await prisma.$disconnect()
      console.log('✅ [Projects API] Déconnexion de la base de données après création')
    } catch (disconnectError) {
      console.error('⚠️ [Projects API] Erreur lors de la déconnexion:', disconnectError)
    }
  }
}

export const GET = withApiLogging(getHandler)
export const POST = withApiLogging(postHandler) 