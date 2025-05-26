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

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
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
        Cookies.set('token', data.token, { expires: 7 })
        setUser(data.user)
        toast.success('Inscription réussie !')
        return { success: true, user: data.user, token: data.token }
      } else {
        toast.error(data.error || 'Erreur d\'inscription')
        return { success: false, error: data.error }
      }
    } catch (error) {
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