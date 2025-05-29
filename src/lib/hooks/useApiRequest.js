import { useState, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import toast from 'react-hot-toast'

export function useApiRequest() {
  const [loading, setLoading] = useState(false)
  const { user, logout } = useAuth()
  const router = useRouter()

  const makeRequest = useCallback(async (url, options = {}) => {
    setLoading(true)
    
    try {
      const token = Cookies.get('token')
      
      if (!token) {
        console.error('❌ [useApiRequest] Token manquant')
        toast.error('Session expirée, veuillez vous reconnecter')
        router.push('/auth/login')
        return null
      }

      const defaultHeaders = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }

      const requestOptions = {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers
        }
      }

      console.log('📡 [useApiRequest] Requête vers:', url)
      
      const response = await fetch(url, requestOptions)
      
      console.log('📡 [useApiRequest] Réponse:', {
        status: response.status,
        ok: response.ok
      })

      if (response.status === 401) {
        console.log('🔄 [useApiRequest] Token expiré, déconnexion')
        logout()
        router.push('/auth/login')
        return null
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Erreur inconnue' }))
        throw new Error(errorData.error || `Erreur ${response.status}`)
      }

      const data = await response.json()
      console.log('✅ [useApiRequest] Succès')
      return data

    } catch (error) {
      console.error('❌ [useApiRequest] Erreur:', error)
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        toast.error('Erreur de connexion au serveur')
      } else {
        toast.error(error.message || 'Erreur lors de la requête')
      }
      
      throw error
    } finally {
      setLoading(false)
    }
  }, [user, logout, router])

  return { makeRequest, loading }
} 