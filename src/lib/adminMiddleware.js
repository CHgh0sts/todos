import { NextResponse } from 'next/server'
import { getAuthenticatedUser } from './apiMiddleware'

/**
 * Vérifie si l'utilisateur a les permissions d'administration
 * @param {Request} request - Requête HTTP
 * @param {Array} allowedRoles - Rôles autorisés ['ADMIN', 'MODERATOR']
 * @returns {Object} - { user, error, status }
 */
export async function checkAdminPermissions(request, allowedRoles = ['ADMIN']) {
  try {
    // Vérifier l'authentification
    const authResult = await getAuthenticatedUser(request)
    if (authResult.error) {
      return authResult
    }

    const { user } = authResult

    // Vérifier le rôle
    if (!allowedRoles.includes(user.role)) {
      return {
        error: 'Accès refusé. Permissions insuffisantes.',
        status: 403
      }
    }

    return { user }
  } catch (error) {
    console.error('Erreur lors de la vérification des permissions admin:', error)
    return {
      error: 'Erreur serveur lors de la vérification des permissions',
      status: 500
    }
  }
}

/**
 * Middleware pour protéger les routes d'administration
 * @param {Function} handler - Handler de la route
 * @param {Array} allowedRoles - Rôles autorisés
 * @returns {Function} - Handler protégé
 */
export function withAdminAuth(handler, allowedRoles = ['ADMIN']) {
  return async (request, context) => {
    const permissionCheck = await checkAdminPermissions(request, allowedRoles)
    
    if (permissionCheck.error) {
      return NextResponse.json(
        { error: permissionCheck.error },
        { status: permissionCheck.status }
      )
    }

    // Ajouter l'utilisateur à la requête pour le handler
    request.user = permissionCheck.user
    
    return handler(request, context)
  }
}

/**
 * Vérifie si l'utilisateur peut effectuer une action sur un autre utilisateur
 * @param {Object} currentUser - Utilisateur actuel
 * @param {Object} targetUser - Utilisateur cible
 * @param {string} action - Action à effectuer
 * @returns {boolean} - Autorisation
 */
export function canPerformUserAction(currentUser, targetUser, action) {
  // Les admins peuvent tout faire
  if (currentUser.role === 'ADMIN') {
    return true
  }

  // Les modérateurs peuvent effectuer certaines actions
  if (currentUser.role === 'MODERATOR') {
    switch (action) {
      case 'VIEW':
      case 'UPDATE_BASIC': // Mise à jour basique (pas de changement de rôle)
        return targetUser.role === 'USER' // Seulement sur les utilisateurs normaux
      case 'DELETE':
        return false // Les modérateurs ne peuvent pas supprimer
      case 'CHANGE_ROLE':
        return false // Les modérateurs ne peuvent pas changer les rôles
      default:
        return false
    }
  }

  // Les utilisateurs normaux ne peuvent rien faire sur les autres
  return false
}

/**
 * Rôles et leurs permissions
 */
export const ROLES = {
  USER: {
    level: 1,
    permissions: ['VIEW_OWN_DATA', 'EDIT_OWN_DATA']
  },
  MODERATOR: {
    level: 2,
    permissions: [
      'VIEW_OWN_DATA', 'EDIT_OWN_DATA',
      'VIEW_ALL_USERS', 'VIEW_ALL_PROJECTS', 'VIEW_ALL_TODOS',
      'EDIT_USER_BASIC', 'DELETE_INAPPROPRIATE_CONTENT',
      'VIEW_ACTIVITY_LOGS'
    ]
  },
  ADMIN: {
    level: 3,
    permissions: [
      'VIEW_OWN_DATA', 'EDIT_OWN_DATA',
      'VIEW_ALL_USERS', 'VIEW_ALL_PROJECTS', 'VIEW_ALL_TODOS',
      'EDIT_USER_BASIC', 'DELETE_INAPPROPRIATE_CONTENT',
      'VIEW_ACTIVITY_LOGS', 'EDIT_ANY_USER', 'DELETE_ANY_USER',
      'CHANGE_USER_ROLES', 'DELETE_ANY_PROJECT', 'DELETE_ANY_TODO',
      'MANAGE_SYSTEM'
    ]
  }
}

/**
 * Vérifie si un rôle a une permission spécifique
 * @param {string} role - Rôle à vérifier
 * @param {string} permission - Permission à vérifier
 * @returns {boolean} - Autorisation
 */
export function hasPermission(role, permission) {
  return ROLES[role]?.permissions.includes(permission) || false
}

export default {
  checkAdminPermissions,
  withAdminAuth,
  canPerformUserAction,
  ROLES,
  hasPermission
} 