import { PrismaClient } from '@prisma/client'
import { getAuthenticatedUser } from './apiMiddleware'

const prisma = new PrismaClient()

/**
 * Enregistre une activité dans l'historique
 * @param {Object} params - Paramètres de l'activité
 * @param {number} params.userId - ID de l'utilisateur qui effectue l'action
 * @param {string} params.action - Type d'action (CREATE, UPDATE, DELETE, LOGIN, etc.)
 * @param {string} params.entity - Type d'entité (USER, PROJECT, TODO, etc.)
 * @param {number} params.entityId - ID de l'entité concernée
 * @param {number} params.targetUserId - ID de l'utilisateur cible (pour les actions admin)
 * @param {Object} params.details - Détails de l'action
 * @param {string} params.ipAddress - Adresse IP
 * @param {string} params.userAgent - User Agent
 */
export async function logActivity({
  userId,
  action,
  entity,
  entityId = null,
  targetUserId = null,
  details = null,
  ipAddress = null,
  userAgent = null
}) {
  try {
    await prisma.activityLog.create({
      data: {
        userId,
        action,
        entity,
        entityId,
        targetUserId,
        details,
        ipAddress,
        userAgent
      }
    })
  } catch (error) {
    console.error('❌ Erreur lors de l\'enregistrement de l\'activité :', error)
  }
}

/**
 * Extrait l'IP et le User Agent d'une requête
 * @param {Request} request - Objet Request de Next.js
 * @returns {Object} - { ipAddress, userAgent }
 */
export function extractRequestInfo(request) {
  const ipAddress = request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown'
  
  const userAgent = request.headers.get('user-agent') || 'unknown'
  
  return { ipAddress, userAgent }
}

/**
 * Actions disponibles pour le logging
 */
export const ACTIONS = {
  // Authentification
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  REGISTER: 'REGISTER',
  PASSWORD_RESET: 'PASSWORD_RESET',
  EMAIL_VERIFY: 'EMAIL_VERIFY',
  
  // CRUD général
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  VIEW: 'VIEW',
  
  // Actions spécifiques
  SHARE: 'SHARE',
  INVITE: 'INVITE',
  JOIN: 'JOIN',
  LEAVE: 'LEAVE',
  ACCEPT: 'ACCEPT',
  REJECT: 'REJECT',
  
  // Actions admin
  ADMIN_USER_UPDATE: 'ADMIN_USER_UPDATE',
  ADMIN_USER_DELETE: 'ADMIN_USER_DELETE',
  ADMIN_PROJECT_DELETE: 'ADMIN_PROJECT_DELETE',
  ADMIN_ROLE_CHANGE: 'ADMIN_ROLE_CHANGE',
  ADMIN_ACTION: 'ADMIN_ACTION'
}

/**
 * Entités disponibles pour le logging
 */
export const ENTITIES = {
  USER: 'USER',
  PROJECT: 'PROJECT',
  TODO: 'TODO',
  CATEGORY: 'CATEGORY',
  INVITATION: 'INVITATION',
  NOTIFICATION: 'NOTIFICATION',
  FRIEND_REQUEST: 'FRIEND_REQUEST',
  FRIENDSHIP: 'FRIENDSHIP',
  SHARE_LINK: 'SHARE_LINK',
  API_KEY: 'API_KEY',
  SYSTEM: 'SYSTEM'
}

/**
 * Middleware pour logger automatiquement les actions API
 */
export function withActivityLogging(handler, action, entity) {
  return async (request) => {
    const startTime = Date.now()
    const { ipAddress, userAgent } = extractRequestInfo(request)
    
    try {
      // Exécuter le handler original
      const response = await handler(request)
      
      // Si la réponse est OK, logger l'activité
      if (response.ok) {
        const authResult = await getAuthenticatedUser(request)
        if (!authResult.error) {
          const responseData = await response.clone().json()
          
          await logActivity({
            userId: authResult.user.id,
            action,
            entity,
            entityId: responseData.id || null,
            details: {
              method: request.method,
              url: request.url,
              responseTime: Date.now() - startTime,
              success: true
            },
            ipAddress,
            userAgent
          })
        }
      }
      
      return response
    } catch (error) {
      // Logger les erreurs aussi
      const authResult = await getAuthenticatedUser(request)
      if (!authResult.error) {
        await logActivity({
          userId: authResult.user.id,
          action,
          entity,
          details: {
            method: request.method,
            url: request.url,
            responseTime: Date.now() - startTime,
            success: false,
            error: error.message
          },
          ipAddress,
          userAgent
        })
      }
      
      throw error
    }
  }
}

export default { logActivity, extractRequestInfo, ACTIONS, ENTITIES, withActivityLogging } 