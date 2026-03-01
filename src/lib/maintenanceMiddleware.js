import prisma from '@/lib/prisma'
import jwt from 'jsonwebtoken'

// Cache pour éviter de requêter la DB à chaque requête
let maintenanceCache = {
  isEnabled: false,
  message: 'Le site est temporairement en maintenance. Veuillez réessayer plus tard.',
  lastChecked: 0,
  cacheDuration: 15000 // 15 secondes au lieu de 30
}

/**
 * Vérifie si le mode maintenance est activé
 * @returns {Promise<{isEnabled: boolean, message: string}>}
 */
export async function checkMaintenanceMode() {
  const now = Date.now()
  
  // Utiliser le cache si il est encore valide
  if (now - maintenanceCache.lastChecked < maintenanceCache.cacheDuration) {
    console.log('🔧 [Maintenance] Utilisation du cache:', maintenanceCache.isEnabled ? 'ACTIVÉ' : 'DÉSACTIVÉ')
    return {
      isEnabled: maintenanceCache.isEnabled,
      message: maintenanceCache.message
    }
  }

  try {
    console.log('🔧 [Maintenance] Vérification en base de données...')
    
    // Récupérer le paramètre de maintenance depuis la DB
    const maintenanceSetting = await prisma.systemSettings.findUnique({
      where: { key: 'maintenanceMode' }
    })

    const messageSetting = await prisma.systemSettings.findUnique({
      where: { key: 'maintenanceMessage' }
    })

    // Mettre à jour le cache
    const wasEnabled = maintenanceCache.isEnabled
    maintenanceCache.isEnabled = maintenanceSetting?.value === 'true'
    maintenanceCache.message = messageSetting?.value || maintenanceCache.message
    maintenanceCache.lastChecked = now

    // Log seulement si l'état a changé
    if (wasEnabled !== maintenanceCache.isEnabled) {
      console.log('🔧 [Maintenance] État changé:', maintenanceCache.isEnabled ? 'ACTIVÉ' : 'DÉSACTIVÉ')
    } else {
      console.log('🔧 [Maintenance] État confirmé:', maintenanceCache.isEnabled ? 'ACTIVÉ' : 'DÉSACTIVÉ')
    }

    return {
      isEnabled: maintenanceCache.isEnabled,
      message: maintenanceCache.message
    }
  } catch (error) {
    console.error('❌ [Maintenance] Erreur lors de la vérification:', error)
    // En cas d'erreur, retourner l'état du cache
    return {
      isEnabled: maintenanceCache.isEnabled,
      message: maintenanceCache.message
    }
  }
}

/**
 * Invalide le cache du mode maintenance
 * À appeler quand les paramètres sont modifiés
 */
export function invalidateMaintenanceCache() {
  const wasValid = (Date.now() - maintenanceCache.lastChecked) < maintenanceCache.cacheDuration
  maintenanceCache.lastChecked = 0
  console.log('🔧 [Maintenance] Cache invalidé', wasValid ? '(était valide)' : '(était expiré)')
}

/**
 * Force la mise à jour du cache
 */
export async function refreshMaintenanceCache() {
  console.log('🔧 [Maintenance] Actualisation forcée du cache')
  invalidateMaintenanceCache()
  return await checkMaintenanceMode()
}

/**
 * Vérifie si une route est exemptée du mode maintenance
 * @param {string} pathname - Chemin de la route
 * @returns {boolean}
 */
export function isExemptFromMaintenance(pathname) {
  const exemptRoutes = [
    // Routes d'administration
    '/api/admin/settings',
    '/api/admin/maintenance', 
    '/api/admin/system-stats',
    '/admin',
    '/admin/settings',
    '/admin/users',
    '/admin/projects',
    '/admin/activity',
    
    // Routes d'authentification
    '/api/auth/me',
    '/api/auth/login',
    '/auth/login',
    
    // Page de maintenance
    '/maintenance'
  ]

  return exemptRoutes.some(route => pathname.startsWith(route))
}

/**
 * Extrait et vérifie le token depuis les cookies
 * @param {Request} request
 * @returns {Promise<{isAdmin: boolean, userId: number|null}>}
 */
async function checkUserRole(request) {
  try {
    // Récupérer le token depuis les cookies
    const cookieHeader = request.headers.get('cookie')
    if (!cookieHeader) {
      return { isAdmin: false, userId: null }
    }

    // Parser les cookies pour trouver le token
    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=')
      acc[key] = value
      return acc
    }, {})

    const token = cookies.token
    if (!token) {
      return { isAdmin: false, userId: null }
    }

    // Vérifier le JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    
    // Récupérer l'utilisateur et son rôle
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, role: true, name: true }
    })

    if (!user) {
      return { isAdmin: false, userId: null }
    }

    const isAdmin = user.role === 'ADMIN'
    console.log(`🔧 [Maintenance] Utilisateur ${user.name} (${user.role}) - Admin: ${isAdmin}`)

    return { 
      isAdmin, 
      userId: user.id 
    }
  } catch (error) {
    console.log('🔧 [Maintenance] Erreur vérification utilisateur:', error.message)
    return { isAdmin: false, userId: null }
  }
}

/**
 * Middleware Next.js pour vérifier le mode maintenance
 * @param {Request} request
 * @returns {Response|null} - Response de maintenance ou null pour continuer
 */
export async function maintenanceMiddleware(request) {
  const url = new URL(request.url)
  const pathname = url.pathname

  console.log(`🔧 [Maintenance] Vérification pour: ${pathname}`)

  // Ignorer les assets statiques
  if (pathname.startsWith('/_next/') || 
      pathname.startsWith('/favicon') || 
      pathname.startsWith('/icons/') ||
      pathname.includes('.')) {
    return null
  }

  // Vérifier si la route est exemptée
  if (isExemptFromMaintenance(pathname)) {
    console.log(`🔧 [Maintenance] Route exemptée: ${pathname}`)
    return null
  }

  // Vérifier le mode maintenance
  const { isEnabled, message } = await checkMaintenanceMode()

  if (isEnabled) {
    console.log('🔧 [Maintenance] Mode maintenance ACTIVÉ - Vérification des permissions')
    
    // Vérifier si l'utilisateur est admin
    const { isAdmin } = await checkUserRole(request)

    // Si c'est un admin, laisser passer
    if (isAdmin) {
      console.log('🔧 [Maintenance] Admin détecté - Accès autorisé')
      return null
    }

    console.log('🔧 [Maintenance] Utilisateur non-admin - Redirection vers maintenance')

    // Rediriger vers la page de maintenance
    if (pathname !== '/maintenance') {
      return Response.redirect(new URL('/maintenance', request.url))
    }
  }

  return null
}

export default { 
  checkMaintenanceMode, 
  invalidateMaintenanceCache, 
  isExemptFromMaintenance, 
  maintenanceMiddleware 
} 