'use client'

import { useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import Cookies from 'js-cookie'

export default function SessionManager() {
  const { user, checkAuth } = useAuth()

  useEffect(() => {
    // Vérifier la session périodiquement (toutes les 5 minutes)
    const interval = setInterval(() => {
      const token = Cookies.get('token')
      if (token && user) {
        console.log('🔄 [SessionManager] Vérification périodique de la session')
        checkAuth()
      }
    }, 5 * 60 * 1000) // 5 minutes

    return () => clearInterval(interval)
  }, [user, checkAuth])

  useEffect(() => {
    // Gérer la visibilité de la page pour rafraîchir la session
    const handleVisibilityChange = () => {
      if (!document.hidden && user) {
        console.log('👁️ [SessionManager] Page redevenue visible, vérification de la session')
        checkAuth()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [user, checkAuth])

  useEffect(() => {
    // Gérer le focus de la fenêtre
    const handleFocus = () => {
      if (user) {
        console.log('🎯 [SessionManager] Fenêtre refocalisée, vérification de la session')
        checkAuth()
      }
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [user, checkAuth])

  return null // Ce composant ne rend rien
} 