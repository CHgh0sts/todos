'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'

/**
 * HOC simplifié pour vérifier le mode maintenance côté client
 * La redirection est gérée par le middleware Next.js
 */
export function withMaintenanceCheck(WrappedComponent) {
  return function MaintenanceWrapper(props) {
    const { user, loading: authLoading } = useAuth()
    const [maintenanceChecked, setMaintenanceChecked] = useState(false)

    useEffect(() => {
      if (!authLoading && user) {
        // Vérification simple côté client
        const checkMaintenance = async () => {
          try {
            const response = await fetch('/api/maintenance-status', {
              cache: 'no-cache'
            })
            
            if (response.ok) {
              const data = await response.json()
              
              // Si maintenance activée et utilisateur non-admin, forcer redirection
              if (data.isEnabled && user.role !== 'ADMIN') {
                console.log('🔧 [HOC] Mode maintenance détecté, redirection...')
                window.location.href = '/maintenance'
                return
              }
            }
          } catch (error) {
            console.error('Erreur vérification maintenance HOC:', error)
          } finally {
            setMaintenanceChecked(true)
          }
        }

        checkMaintenance()
      } else {
        setMaintenanceChecked(true)
      }
    }, [user, authLoading])

    // Affichage de chargement pendant l'authentification
    if (authLoading) {
      return (
        <div className="fixed inset-0 top-16 overflow-y-auto">
          <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      )
    }

    // Afficher le composant normalement
    return <WrappedComponent {...props} />
  }
}

export default withMaintenanceCheck 