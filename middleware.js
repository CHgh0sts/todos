import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

// Cache global pour le mode maintenance
if (!global.maintenanceCache) {
  global.maintenanceCache = {
    isEnabled: false,
    lastCheck: 0,
    cacheDuration: 30000 // 30 secondes
  }
}

async function checkMaintenanceMode() {
  const now = Date.now()
  
  // Utiliser le cache si valide
  if (now - global.maintenanceCache.lastCheck < global.maintenanceCache.cacheDuration) {
    return global.maintenanceCache.isEnabled
  }

  try {
    const setting = await prisma.systemSettings.findUnique({
      where: { key: 'maintenanceMode' }
    })
    
    global.maintenanceCache.isEnabled = setting?.value === 'true'
    global.maintenanceCache.lastCheck = now
    
    console.log(`🔧 [Middleware] Mode maintenance: ${global.maintenanceCache.isEnabled ? 'ACTIVÉ' : 'DÉSACTIVÉ'}`)
    
    return global.maintenanceCache.isEnabled
  } catch (error) {
    console.error('❌ [Middleware] Erreur vérification maintenance:', error)
    return false
  } finally {
    await prisma.$disconnect()
  }
}

async function isUserAdmin(request) {
  try {
    const cookieHeader = request.headers.get('cookie')
    if (!cookieHeader) return false

    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=')
      acc[key] = value
      return acc
    }, {})

    const token = cookies.token
    if (!token) return false

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { role: true, name: true }
    })

    const isAdmin = user?.role === 'ADMIN'
    console.log(`🔧 [Middleware] Utilisateur ${user?.name || 'inconnu'}: ${isAdmin ? 'ADMIN' : 'USER'}`)
    
    return isAdmin
  } catch (error) {
    console.log(`🔧 [Middleware] Erreur vérification utilisateur: ${error.message}`)
    return false
  } finally {
    await prisma.$disconnect()
  }
}

export async function middleware(request) {
  const { pathname } = request.nextUrl
  
  console.log(`🔧 [Middleware] Requête: ${pathname}`)

  // Ignorer les assets statiques
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/_next/') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/icons/') ||
    pathname.includes('.') ||
    pathname === '/manifest.json'
  ) {
    return NextResponse.next()
  }

  // Routes exemptées du mode maintenance
  const exemptRoutes = [
    '/maintenance',
    '/api/maintenance-status',
    '/api/admin/settings',
    '/api/admin/maintenance',
    '/api/auth/me',
    '/api/auth/login',
    '/auth/login'
  ]

  if (exemptRoutes.some(route => pathname.startsWith(route))) {
    console.log(`🔧 [Middleware] Route exemptée: ${pathname}`)
    return NextResponse.next()
  }

  // Vérifier le mode maintenance
  const isMaintenanceEnabled = await checkMaintenanceMode()
  
  if (isMaintenanceEnabled) {
    console.log(`🔧 [Middleware] Mode maintenance activé, vérification utilisateur...`)
    
    const isAdmin = await isUserAdmin(request)
    
    if (!isAdmin) {
      console.log(`🔧 [Middleware] Redirection utilisateur non-admin vers /maintenance`)
      return NextResponse.redirect(new URL('/maintenance', request.url))
    } else {
      console.log(`🔧 [Middleware] Admin autorisé à continuer`)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
} 