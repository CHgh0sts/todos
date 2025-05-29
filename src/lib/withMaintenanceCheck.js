'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

/**
 * HOC pour vérifier le mode maintenance
 * @param {React.Component} WrappedComponent - Composant à protéger
 * @returns {React.Component} - Composant avec vérification maintenance
 */
export function withMaintenanceCheck(WrappedComponent) {
  return function MaintenanceWrapper(props) {
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()
    const [maintenanceCheck, setMaintenanceCheck] = useState({
      loading: true,
      isEnabled: false,
      message: ''
    })

    const checkMaintenance = async (forceRefresh = false) => {
      try {
        // Ajouter un paramètre pour forcer l'actualisation du cache
        const url = forceRefresh 
          ? `/api/maintenance-status?refresh=${Date.now()}` 
          : '/api/maintenance-status'
          
        const response = await fetch(url, {
          cache: forceRefresh ? 'no-cache' : 'default'
        })
        
        if (response.ok) {
          const data = await response.json()
          setMaintenanceCheck({
            loading: false,
            isEnabled: data.isEnabled,
            message: data.message
          })

          // Si maintenance activée et utilisateur non-admin, rediriger
          if (data.isEnabled && (!user || user.role !== 'ADMIN')) {
            router.push('/maintenance')
            return
          }
        } else {
          setMaintenanceCheck({
            loading: false,
            isEnabled: false,
            message: ''
          })
        }
      } catch (error) {
        console.error('Erreur vérification maintenance:', error)
        setMaintenanceCheck({
          loading: false,
          isEnabled: false,
          message: ''
        })
      }
    }

    useEffect(() => {
      if (!authLoading) {
        checkMaintenance()
        
        // Vérifier périodiquement le statut (toutes les 30 secondes)
        const interval = setInterval(() => {
          checkMaintenance(true) // Forcer l'actualisation
        }, 30000)
        
        return () => clearInterval(interval)
      }
    }, [user, authLoading, router])

    // Écouter les événements de changement de maintenance
    useEffect(() => {
      const handleMaintenanceChange = () => {
        checkMaintenance(true)
      }

      // Écouter les événements personnalisés
      window.addEventListener('maintenanceChanged', handleMaintenanceChange)
      
      return () => {
        window.removeEventListener('maintenanceChanged', handleMaintenanceChange)
      }
    }, [])

    // Affichage de chargement
    if (authLoading || maintenanceCheck.loading) {
      return (
        <div className="fixed inset-0 top-16 overflow-y-auto">
          <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      )
    }

    // Si maintenance activée et utilisateur non-admin, ne pas afficher le composant
    if (maintenanceCheck.isEnabled && (!user || user.role !== 'ADMIN')) {
      return null
    }

    // Afficher le composant normalement
    return <WrappedComponent {...props} />
  }
}

export default withMaintenanceCheck 