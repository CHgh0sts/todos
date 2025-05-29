import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Types d'actions disponibles
 */
export const ACTIVITY_TYPES = {
  NAVIGATION: 'Navigation',
  CREATE: 'Create',
  EDIT: 'Edit',
  DELETE: 'Delete'
}

/**
 * Enregistre une activité utilisateur
 * @param {Object} params - Paramètres de l'activité
 * @param {number} params.userId - ID de l'utilisateur
 * @param {string} params.element - Type d'élément (tâche, catégorie, navigation)
 * @param {string} params.typeLog - Type d'action (create, edit, delete, Navigation)
 * @param {string} params.textLog - Description textuelle de l'action
 * @param {Object} params.from - État avant l'action (pour Edit/Delete)
 * @param {Object} params.to - État après l'action (pour Create/Edit)
 * @param {string} params.ipAddress - Adresse IP
 * @param {string} params.userAgent - User Agent
 */
export async function logUserActivity({
  userId,
  element,
  typeLog,
  textLog = null,
  from = null,
  to = null,
  ipAddress = null,
  userAgent = null
}) {
  try {
    if (!userId || !typeLog) {
      console.warn('⚠️ [User Activity] Paramètres manquants:', { userId, typeLog })
      return
    }

    await prisma.userActivity.create({
      data: {
        userId,
        element,
        typeLog,
        textLog,
        from,
        to,
        ipAddress,
        userAgent
      }
    })

    console.log(`📊 [User Activity] ${typeLog} enregistré pour l'utilisateur ${userId}`)
  } catch (error) {
    console.error('❌ [User Activity] Erreur lors de l\'enregistrement:', error)
  }
}

/**
 * Enregistre une navigation de page
 * @param {number} userId - ID de l'utilisateur
 * @param {string} page - Page visitée
 * @param {string} ipAddress - Adresse IP
 * @param {string} userAgent - User Agent
 */
export async function logNavigation(userId, page, ipAddress = null, userAgent = null) {
  await logUserActivity({
    userId,
    element: 'navigation',
    typeLog: 'Navigation',
    ipAddress,
    userAgent
  })
}

/**
 * Enregistre une création d'élément
 * @param {number} userId - ID de l'utilisateur
 * @param {string} entityType - Type d'élément (projet, tâche, catégorie)
 * @param {string} name - Nom de l'élément créé
 * @param {number} entityId - ID de l'élément créé
 * @param {string} ipAddress - Adresse IP
 * @param {string} userAgent - User Agent
 * @param {Object} extraDetails - Détails supplémentaires (projectName, etc.)
 * @param {Object} createdData - Données de l'élément créé
 */
export async function logCreate(userId, entityType, name, entityId = null, ipAddress = null, userAgent = null, extraDetails = {}, createdData = null) {
  await logUserActivity({
    userId,
    element: entityType,
    typeLog: 'create',
    to: createdData,
    ipAddress,
    userAgent
  })
}

/**
 * Enregistre une modification d'élément
 * @param {number} userId - ID de l'utilisateur
 * @param {string} entityType - Type d'élément (projet, tâche, catégorie)
 * @param {string} name - Nom de l'élément modifié
 * @param {number} entityId - ID de l'élément modifié
 * @param {Object} changes - Changements effectués
 * @param {string} ipAddress - Adresse IP
 * @param {string} userAgent - User Agent
 * @param {Object} extraDetails - Détails supplémentaires (projectName, etc.)
 * @param {Object} originalData - Données avant modification
 * @param {Object} updatedData - Données après modification
 */
export async function logEdit(userId, entityType, name, entityId = null, changes = {}, ipAddress = null, userAgent = null, extraDetails = {}, originalData = null, updatedData = null) {
  await logUserActivity({
    userId,
    element: entityType,
    typeLog: 'edit',
    from: originalData,
    to: updatedData,
    ipAddress,
    userAgent
  })
}

export async function logAdd(userId, element, type, from = null, to = null, ipAddress = null, userAgent = null, textLog = null) {
  await logUserActivity({
    userId,
    element,
    typeLog: type,
    textLog,
    from,
    to,
    ipAddress,
    userAgent
  })
}

/**
 * Enregistre une suppression d'élément
 * @param {number} userId - ID de l'utilisateur
 * @param {string} entityType - Type d'élément (projet, tâche, catégorie)
 * @param {string} name - Nom de l'élément supprimé
 * @param {number} entityId - ID de l'élément supprimé
 * @param {string} ipAddress - Adresse IP
 * @param {string} userAgent - User Agent
 * @param {Object} extraDetails - Détails supplémentaires (projectName, etc.)
 * @param {Object} deletedData - Données de l'élément supprimé
 */
export async function logDelete(userId, entityType, name, entityId = null, ipAddress = null, userAgent = null, extraDetails = {}, deletedData = null) {
  await logUserActivity({
    userId,
    element: entityType,
    typeLog: 'delete',
    from: deletedData,
    ipAddress,
    userAgent
  })
}

/**
 * Extrait les informations de la requête HTTP
 * @param {Request} request - Objet Request
 * @returns {Object} Informations extraites
 */
export function extractRequestInfo(request) {
  const ipAddress = request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   request.headers.get('cf-connecting-ip') || 
                   'unknown'
  
  const userAgent = request.headers.get('user-agent') || 'unknown'
  
  return { ipAddress, userAgent }
}

/**
 * Middleware pour logger automatiquement les navigations
 * @param {Function} handler - Handler de la page
 * @param {string} pageName - Nom de la page
 */
export function withNavigationLogging(handler, pageName) {
  return async (request) => {
    try {
      // Exécuter le handler original
      const response = await handler(request)
      
      // Logger la navigation si l'utilisateur est authentifié
      const authHeader = request.headers.get('authorization')
      if (authHeader) {
        // Extraire l'ID utilisateur du token JWT si possible
        // (Cette partie sera implémentée selon votre système d'auth)
        const { ipAddress, userAgent } = extractRequestInfo(request)
        // logNavigation(userId, pageName, ipAddress, userAgent)
      }
      
      return response
    } catch (error) {
      throw error
    }
  }
}

/**
 * Génère un message textuel selon l'action réalisée
 * @param {string} element - Type d'élément (tâche, catégorie, navigation)
 * @param {string} type - Type d'action (create, edit, delete, Navigation)
 * @param {string} userName - Nom de l'utilisateur
 * @param {Object} from - État avant l'action
 * @param {Object} to - État après l'action
 * @returns {string} Message textuel
 */
export function generateTextLog(element, type, userName, from = null, to = null) {
  const elementName = to?.name || to?.title || from?.name || from?.title || 'élément'
  const userNameFormatted = `[${userName}]`
  const elementNameFormatted = `[${elementName}]`
  
  switch (type) {
    case 'create':
      switch (element) {
        case 'tâche':
          return `La tâche ${elementNameFormatted} a été créée par ${userNameFormatted}`
        case 'catégorie':
          return `La catégorie ${elementNameFormatted} a été créée par ${userNameFormatted}`
        case 'projet':
          return `Le projet ${elementNameFormatted} a été créé par ${userNameFormatted}`
        default:
          return `L'élément ${elementNameFormatted} a été créé par ${userNameFormatted}`
      }
    
    case 'edit':
      switch (element) {
        case 'tâche':
          return `La tâche ${elementNameFormatted} a été modifiée par ${userNameFormatted}`
        case 'catégorie':
          return `La catégorie ${elementNameFormatted} a été modifiée par ${userNameFormatted}`
        case 'projet':
          return `Le projet ${elementNameFormatted} a été modifié par ${userNameFormatted}`
        default:
          return `L'élément ${elementNameFormatted} a été modifié par ${userNameFormatted}`
      }
    
    case 'delete':
      switch (element) {
        case 'tâche':
          return `La tâche ${elementNameFormatted} a été supprimée par ${userNameFormatted}`
        case 'catégorie':
          return `La catégorie ${elementNameFormatted} a été supprimée par ${userNameFormatted}`
        case 'projet':
          return `Le projet ${elementNameFormatted} a été supprimé par ${userNameFormatted}`
        default:
          return `L'élément ${elementNameFormatted} a été supprimé par ${userNameFormatted}`
      }
    
    case 'Navigation':
      const pageName = mapUrlToPageName(element)
      return `${userNameFormatted} a navigué vers [${pageName}]`
    
    default:
      return `Action ${type} effectuée par ${userNameFormatted} sur ${element}`
  }
}

/**
 * Mappe les URLs vers des noms de pages lisibles en français
 * @param {string} url - L'URL ou le nom de la page
 * @returns {string} - Le nom de la page en français
 */
export function mapUrlToPageName(url) {
  const urlMappings = {
    // Pages principales
    '/': 'Accueil',
    '/dashboard': 'Tableau de bord',
    '/projects': 'Projets',
    '/todos': 'Tâches',
    '/categories': 'Catégories',
    '/profile': 'Profil',
    '/notifications': 'Notifications',
    '/friends': 'Amis',
    '/invitations': 'Invitations',
    
    // Administration
    '/admin': 'Administration',
    '/admin/activity': 'Activités',
    '/admin/users': 'Utilisateurs',
    '/admin/projects': 'Projets Admin',
    '/admin/settings': 'Paramètres Admin',
    
    // Authentification
    '/auth/login': 'Connexion',
    '/auth/register': 'Inscription',
    '/auth/logout': 'Déconnexion',
    '/auth/forgot-password': 'Mot de passe oublié',
    '/auth/reset-password': 'Réinitialisation',
    '/auth/verify': 'Vérification',
    
    // Autres pages
    '/help': 'Aide',
    '/about': 'À propos',
    '/contact': 'Contact',
    '/settings': 'Paramètres',
    '/privacy': 'Confidentialité',
    '/terms': 'Conditions',
    '/features': 'Fonctionnalités',
    '/pricing': 'Tarifs',
    '/documentation': 'Documentation',
    '/tutorials': 'Tutoriels',
    '/blog': 'Blog',
    '/careers': 'Carrières',
    '/partners': 'Partenaires',
    '/press': 'Presse',
    '/status': 'Statut',
    '/maintenance': 'Maintenance',
    '/security': 'Sécurité',
    '/legal': 'Mentions légales',
    '/cookies': 'Cookies',
    '/gdpr': 'RGPD'
  }
  
  // Si c'est une URL exacte, la mapper
  if (urlMappings[url]) {
    return urlMappings[url]
  }
  
  // Si c'est une URL avec paramètres, essayer de trouver la base
  const baseUrl = url.split('?')[0].split('#')[0]
  if (urlMappings[baseUrl]) {
    return urlMappings[baseUrl]
  }
  
  // Gérer les URLs de projets avec nom de projet
  if (url.includes(' (') && url.includes(')')) {
    const match = url.match(/^(.+) \((.+)\)$/)
    if (match) {
      const [, urlPart, projectName] = match
      if (urlPart.startsWith('/todos/')) {
        return `Projet ${projectName}`
      }
    }
  }
  
  // Essayer de mapper les patterns dynamiques
  if (url.startsWith('/todos/')) {
    return 'Projet'
  }
  if (url.startsWith('/projects/')) {
    return 'Détails du projet'
  }
  if (url.startsWith('/share/')) {
    return 'Partage'
  }
  if (url.startsWith('/admin/')) {
    return 'Administration'
  }
  
  // Si aucun mapping trouvé, retourner le nom tel quel (pour les cas comme "Dashboard", "navigation", etc.)
  return url.charAt(0).toUpperCase() + url.slice(1)
}

export default {
  logUserActivity,
  logNavigation,
  logCreate,
  logEdit,
  logDelete,
  extractRequestInfo,
  withNavigationLogging,
  mapUrlToPageName,
  ACTIVITY_TYPES
} 