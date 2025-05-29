'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import Cookies from 'js-cookie'
import toast from 'react-hot-toast'
import { useTheme } from './ThemeContext'

const AuthContext = createContext()

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    // Marquer que nous sommes côté client
    setIsClient(true)
  }, [])

  useEffect(() => {
    // Ne vérifier l'auth que quand on est côté client
    if (!isClient) return

    console.log('🔍 [AuthContext] Vérification de l\'authentification côté client')
    
    // Vérifier l'authentification avec un timeout
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.warn('⚠️ [AuthContext] Timeout de vérification d\'authentification')
        setLoading(false)
      }
    }, 10000) // Timeout de 10 secondes (plus long)

    checkAuth().finally(() => {
      clearTimeout(timeoutId)
    })

    return () => {
      clearTimeout(timeoutId)
    }
  }, [isClient]) // Dépendance sur isClient

  const checkAuth = async () => {
    try {
      console.log('🔍 [AuthContext] Début de checkAuth')
      
      // Vérifier que nous sommes côté client
      if (typeof window === 'undefined') {
        console.log('⚠️ [AuthContext] Pas côté client, arrêt de checkAuth')
        setLoading(false)
        return
      }

      const token = Cookies.get('token')
      console.log('🔍 [AuthContext] Token trouvé:', token ? `Oui (${token.length} chars)` : 'Non')
      
      if (!token) {
        console.log('❌ [AuthContext] Pas de token, utilisateur non connecté')
        setLoading(false)
        return
      }

      console.log('📡 [AuthContext] Vérification du token auprès du serveur')
      
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      })

      console.log('📡 [AuthContext] Réponse du serveur:', {
        status: response.status,
        ok: response.ok
      })

      if (response.ok) {
        const userData = await response.json()
        console.log('✅ [AuthContext] Utilisateur authentifié:', {
          id: userData.id,
          name: userData.name,
          email: userData.email,
          role: userData.role
        })
        setUser(userData)
        
        // Synchroniser le thème utilisateur avec le contexte
        if (userData.theme && userData.theme !== 'system') {
          localStorage.setItem('theme', userData.theme)
        }
      } else {
        console.error('❌ [AuthContext] Token invalide, suppression du cookie')
        Cookies.remove('token')
        setUser(null)
      }
    } catch (error) {
      console.error('❌ [AuthContext] Erreur lors de la vérification de l\'authentification:', error)
      // Ne pas supprimer le token en cas d'erreur réseau
      // Cookies.remove('token')
    } finally {
      console.log('✅ [AuthContext] Fin de checkAuth')
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      console.log('🔍 [AuthContext] Tentative de connexion pour:', email)
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        console.log('✅ [AuthContext] Connexion réussie, définition du cookie')
        // Cookie avec options sécurisées
        Cookies.set('token', data.token, { 
          expires: 7,
          secure: window.location.protocol === 'https:',
          sameSite: 'lax'
        })
        setUser(data.user)
        toast.success('Connexion réussie !')
        return { success: true }
      } else {
        console.error('❌ [AuthContext] Erreur de connexion:', data.error)
        toast.error(data.error || 'Erreur de connexion')
        return { success: false, error: data.error }
      }
    } catch (error) {
      console.error('❌ [AuthContext] Erreur réseau lors de la connexion:', error)
      toast.error('Erreur de connexion')
      return { success: false, error: 'Erreur de connexion' }
    }
  }

  const register = async (name, email, password) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        // L'inscription a réussi, mais l'utilisateur doit vérifier son email
        // On ne définit pas de token car le compte n'est pas encore vérifié
        
        if (data.emailSent) {
          toast.success('Inscription réussie ! Vérifiez votre email pour activer votre compte.')
        } else {
          toast.success(data.message, { duration: 6000 })
          if (data.warning) {
            toast.error(data.supportMessage, { duration: 8000 })
          }
        }
        
        return { 
          success: true, 
          emailSent: data.emailSent,
          message: data.message,
          userId: data.userId
        }
      } else {
        toast.error(data.error || 'Erreur d\'inscription')
        return { success: false, error: data.error }
      }
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error)
      toast.error('Erreur d\'inscription')
      return { success: false, error: 'Erreur d\'inscription' }
    }
  }

  const logout = () => {
    console.log('🔍 [AuthContext] Déconnexion de l\'utilisateur')
    Cookies.remove('token')
    setUser(null)
    toast.success('Déconnexion réussie')
  }

  const refreshUser = async () => {
    console.log('🔍 [AuthContext] Rafraîchissement des données utilisateur')
    await checkAuth()
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    checkAuth,
    refreshUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
} 