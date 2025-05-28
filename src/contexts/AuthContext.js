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
    
    // Vérifier l'authentification avec un timeout
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.warn('Timeout de vérification d\'authentification')
        setLoading(false)
      }
    }, 5000) // Timeout de 5 secondes

    checkAuth().finally(() => {
      clearTimeout(timeoutId)
    })

    return () => {
      clearTimeout(timeoutId)
    }
  }, [])

  const checkAuth = async () => {
    try {
      // Ne pas vérifier l'auth si nous ne sommes pas côté client
      if (!isClient && typeof window === 'undefined') {
        setLoading(false)
        return
      }

      const token = Cookies.get('token')
      if (!token) {
        setLoading(false)
        return
      }

      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
        
        // Synchroniser le thème utilisateur avec le contexte
        if (userData.theme && userData.theme !== 'system') {
          localStorage.setItem('theme', userData.theme)
        }
      } else {
        Cookies.remove('token')
      }
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'authentification:', error)
      Cookies.remove('token')
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        Cookies.set('token', data.token, { expires: 7 })
        setUser(data.user)
        toast.success('Connexion réussie !')
        return { success: true }
      } else {
        toast.error(data.error || 'Erreur de connexion')
        return { success: false, error: data.error }
      }
    } catch (error) {
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
    Cookies.remove('token')
    setUser(null)
    toast.success('Déconnexion réussie')
  }

  const refreshUser = async () => {
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