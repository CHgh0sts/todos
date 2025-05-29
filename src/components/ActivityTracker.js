'use client'

import { useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { usePathname } from 'next/navigation'
import Cookies from 'js-cookie'

/**
 * Composant pour tracker les activités utilisateur
 * Ce composant doit être placé dans le layout principal
 */
export default function ActivityTracker() {
  const { user } = useAuth()
  const pathname = usePathname()

  // Fonction pour envoyer l'activité au serveur
  const sendActivity = async (activityData) => {
    try {
      const token = Cookies.get('token')
      if (!token || !user) return

      await fetch('/api/user-activity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(activityData)
      })
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'activité:', error)
    }
  }

  // Fonction pour récupérer le nom du projet
  const getProjectName = async (projectId) => {
    try {
      const token = Cookies.get('token')
      if (!token) return null

      const response = await fetch(`/api/projects/${projectId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const project = await response.json()
        return project.name
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du nom du projet:', error)
    }
    return null
  }

  // Tracker les navigations de page
  useEffect(() => {
    if (user && pathname) {
      // Ignorer certaines pages système
      const ignoredPaths = ['/api/', '/_next/', '/favicon.ico']
      if (ignoredPaths.some(path => pathname.startsWith(path))) {
        return
      }

      // Mapper les chemins vers des noms de pages lisibles et extraire les détails
      const getPageDetails = async (path) => {
        if (path === '/') {
          return { page: 'Accueil', path }
        }
        if (path === '/projects') {
          return { page: 'Mes Projets', path }
        }
        if (path.startsWith('/todos/')) {
          const projectId = path.split('/')[2]
          const projectName = await getProjectName(parseInt(projectId))
          return { 
            page: 'Projet', 
            path,
            projectId: parseInt(projectId),
            projectName: projectName || 'Projet inconnu'
          }
        }
        if (path === '/profile') {
          return { page: 'Profil', path }
        }
        if (path === '/friends') {
          return { page: 'Amis', path }
        }
        if (path === '/notifications') {
          return { page: 'Notifications', path }
        }
        if (path === '/categories') {
          return { page: 'Catégories', path }
        }
        if (path.startsWith('/admin/activity')) {
          return { page: 'Administration - Activité', path }
        }
        if (path.startsWith('/admin/settings')) {
          return { page: 'Administration - Paramètres', path }
        }
        if (path.startsWith('/admin/users')) {
          return { page: 'Administration - Utilisateurs', path }
        }
        if (path.startsWith('/admin/projects')) {
          return { page: 'Administration - Projets', path }
        }
        if (path.startsWith('/admin')) {
          return { page: 'Administration', path }
        }
        if (path === '/auth/login') {
          return { page: 'Connexion', path }
        }
        if (path === '/auth/register') {
          return { page: 'Inscription', path }
        }
        return { page: path, path }
      }

      const trackNavigation = async () => {
        const pageDetails = await getPageDetails(pathname)

        sendActivity({
          action: 'Navigation',
          details: {
            ...pageDetails,
            timestamp: new Date().toISOString()
          }
        })

        console.log(`🧭 Navigation trackée: ${pageDetails.page} (${pathname})`)
      }

      trackNavigation()
    }
  }, [user, pathname])

  // Tracker les créations d'éléments
  const trackCreate = (entityType, name, entityId = null) => {
    if (!user) return

    sendActivity({
      action: 'Create',
      details: {
        entityType,
        name,
        entityId,
        timestamp: new Date().toISOString()
      }
    })

    console.log(`➕ Création trackée: ${entityType} "${name}"`)
  }

  // Tracker les modifications d'éléments
  const trackEdit = (entityType, name, entityId = null, changes = {}) => {
    if (!user) return

    sendActivity({
      action: 'Edit',
      details: {
        entityType,
        name,
        entityId,
        changes,
        timestamp: new Date().toISOString()
      }
    })

    console.log(`✏️ Modification trackée: ${entityType} "${name}"`)
  }

  // Tracker les suppressions d'éléments
  const trackDelete = (entityType, name, entityId = null) => {
    if (!user) return

    sendActivity({
      action: 'Delete',
      details: {
        entityType,
        name,
        entityId,
        timestamp: new Date().toISOString()
      }
    })

    console.log(`🗑️ Suppression trackée: ${entityType} "${name}"`)
  }

  // Exposer les fonctions de tracking globalement
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.trackCreate = trackCreate
      window.trackEdit = trackEdit
      window.trackDelete = trackDelete
    }
  }, [user])

  // Ce composant ne rend rien visuellement
  return null
}

// Hook personnalisé pour utiliser le tracking dans les composants
export function useActivityTracker() {
  const { user } = useAuth()

  const trackCreate = (entityType, name, entityId = null) => {
    if (typeof window !== 'undefined' && window.trackCreate) {
      window.trackCreate(entityType, name, entityId)
    }
  }

  const trackEdit = (entityType, name, entityId = null, changes = {}) => {
    if (typeof window !== 'undefined' && window.trackEdit) {
      window.trackEdit(entityType, name, entityId, changes)
    }
  }

  const trackDelete = (entityType, name, entityId = null) => {
    if (typeof window !== 'undefined' && window.trackDelete) {
      window.trackDelete(entityType, name, entityId)
    }
  }

  return {
    trackCreate,
    trackEdit,
    trackDelete,
    isTracking: !!user
  }
} 