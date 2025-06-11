/**
 * Module d'optimisation de la base de données
 * Gère les connexions, le cache et les requêtes pour éviter les erreurs 503
 */

import { PrismaClient } from '@prisma/client'

// Instance Prisma globale avec configuration optimisée
let globalPrisma = null

// Cache en mémoire simple pour les données fréquemment accédées
const memoryCache = new Map()
const CACHE_TTL = 30000 // 30 secondes

/**
 * Obtient une instance Prisma optimisée
 */
export function getOptimizedPrisma() {
  if (!globalPrisma) {
    globalPrisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
      datasources: {
        db: {
          url: process.env.DATABASE_URL
        }
      }
    })

    // Gérer la fermeture propre
    process.on('beforeExit', async () => {
      await globalPrisma?.$disconnect()
    })
  }

  return globalPrisma
}

/**
 * Cache simple en mémoire avec TTL
 */
export class SimpleCache {
  static set(key, value, ttl = CACHE_TTL) {
    const expiry = Date.now() + ttl
    memoryCache.set(key, { value, expiry })
  }

  static get(key) {
    const cached = memoryCache.get(key)
    if (!cached) return null

    if (Date.now() > cached.expiry) {
      memoryCache.delete(key)
      return null
    }

    return cached.value
  }

  static delete(key) {
    memoryCache.delete(key)
  }

  static clear() {
    memoryCache.clear()
  }

  static size() {
    return memoryCache.size
  }
}

/**
 * Wrapper pour les requêtes avec cache automatique
 */
export async function cachedQuery(cacheKey, queryFn, ttl = CACHE_TTL) {
  // Vérifier le cache d'abord
  const cached = SimpleCache.get(cacheKey)
  if (cached) {
    console.log(`🎯 [Cache] Hit pour ${cacheKey}`)
    return cached
  }

  console.log(`🔍 [Cache] Miss pour ${cacheKey}, exécution de la requête`)
  
  try {
    const result = await queryFn()
    SimpleCache.set(cacheKey, result, ttl)
    return result
  } catch (error) {
    console.error(`❌ [Cache] Erreur pour ${cacheKey}:`, error.message)
    throw error
  }
}

/**
 * Requête optimisée pour récupérer les projets d'un utilisateur
 */
export async function getOptimizedUserProjects(userId) {
  const cacheKey = `user_projects_${userId}`
  
  return cachedQuery(cacheKey, async () => {
    const prisma = getOptimizedPrisma()
    
    console.log(`🔍 [DB] Récupération des projets pour l'utilisateur ${userId}`)
    
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

    console.log(`✅ [DB] ${projects.length} projets récupérés pour l'utilisateur ${userId}`)
    return projects
  }, 15000) // Cache plus court pour les projets (15s)
}

/**
 * Requête optimisée pour récupérer un projet spécifique
 */
export async function getOptimizedProject(projectId, userId) {
  const cacheKey = `project_${projectId}_${userId}`
  
  return cachedQuery(cacheKey, async () => {
    const prisma = getOptimizedPrisma()
    
    console.log(`🔍 [DB] Récupération du projet ${projectId} pour l'utilisateur ${userId}`)
    
    const project = await prisma.project.findFirst({
      where: {
        id: parseInt(projectId),
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
          select: { id: true, name: true, email: true, role: true }
        },
        shares: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        },
        todos: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            },
            category: true
          },
          orderBy: [
            { completed: 'asc' },
            { createdAt: 'desc' }
          ]
        },
        categories: true
      }
    })

    if (project) {
      console.log(`✅ [DB] Projet ${project.name} récupéré`)
    } else {
      console.log(`❌ [DB] Projet ${projectId} non trouvé ou accès refusé`)
    }
    
    return project
  }, 10000) // Cache encore plus court pour les détails de projet (10s)
}

/**
 * Requête optimisée pour récupérer les paramètres système
 */
export async function getOptimizedSystemSettings() {
  const cacheKey = 'system_settings'
  
  return cachedQuery(cacheKey, async () => {
    const prisma = getOptimizedPrisma()
    
    console.log('🔍 [DB] Récupération des paramètres système')
    
    const settings = await prisma.systemSettings.findMany()
    
    const settingsObject = settings.reduce((acc, setting) => {
      // Convertir les valeurs en types appropriés
      if (setting.key === 'maintenanceMode' || setting.key === 'registrationEnabled' || setting.key === 'emailVerificationRequired') {
        acc[setting.key] = setting.value === 'true'
      } else if (setting.key === 'maxProjectsPerUser' || setting.key === 'maxTodosPerProject' || setting.key === 'sessionTimeout') {
        acc[setting.key] = parseInt(setting.value) || 0
      } else {
        acc[setting.key] = setting.value || ''
      }
      return acc
    }, {})

    // Valeurs par défaut
    const defaultSettings = {
      maintenanceMode: false,
      registrationEnabled: true,
      emailVerificationRequired: true,
      maxProjectsPerUser: 10,
      maxTodosPerProject: 100,
      sessionTimeout: 7,
      maintenanceMessage: 'Le site est temporairement en maintenance. Veuillez réessayer plus tard.'
    }

    const finalSettings = { ...defaultSettings, ...settingsObject }
    
    console.log('✅ [DB] Paramètres système récupérés')
    return finalSettings
  }, 60000) // Cache plus long pour les paramètres système (1 minute)
}

/**
 * Invalide le cache pour un utilisateur spécifique
 */
export function invalidateUserCache(userId) {
  const keysToDelete = []
  
  for (const key of memoryCache.keys()) {
    if (key.includes(`user_${userId}`) || key.includes(`_${userId}`)) {
      keysToDelete.push(key)
    }
  }
  
  keysToDelete.forEach(key => {
    SimpleCache.delete(key)
    console.log(`🗑️ [Cache] Invalidé: ${key}`)
  })
  
  return keysToDelete.length
}

/**
 * Invalide le cache pour un projet spécifique
 */
export function invalidateProjectCache(projectId) {
  const keysToDelete = []
  
  for (const key of memoryCache.keys()) {
    if (key.includes(`project_${projectId}`)) {
      keysToDelete.push(key)
    }
  }
  
  keysToDelete.forEach(key => {
    SimpleCache.delete(key)
    console.log(`🗑️ [Cache] Invalidé: ${key}`)
  })
  
  return keysToDelete.length
}

/**
 * Statistiques du cache
 */
export function getCacheStats() {
  const stats = {
    size: SimpleCache.size(),
    keys: Array.from(memoryCache.keys()),
    memory: process.memoryUsage()
  }
  
  console.log('📊 [Cache] Statistiques:', {
    entries: stats.size,
    memoryMB: Math.round(stats.memory.heapUsed / 1024 / 1024)
  })
  
  return stats
}

/**
 * Nettoyage automatique du cache expiré
 */
export function cleanupExpiredCache() {
  const now = Date.now()
  let cleaned = 0
  
  for (const [key, value] of memoryCache.entries()) {
    if (now > value.expiry) {
      memoryCache.delete(key)
      cleaned++
    }
  }
  
  if (cleaned > 0) {
    console.log(`🧹 [Cache] Nettoyé ${cleaned} entrées expirées`)
  }
  
  return cleaned
}

// Nettoyage automatique toutes les 5 minutes
if (typeof window === 'undefined') { // Seulement côté serveur
  setInterval(cleanupExpiredCache, 5 * 60 * 1000)
} 