'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Cookies from 'js-cookie'
import toast from 'react-hot-toast'

export default function ShareLinkPage({ params }) {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [shareData, setShareData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchShareData()
  }, [params.id])

  const getAuthHeaders = () => {
    const token = Cookies.get('token')
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }

  const fetchShareData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/share-links/${params.id}`)
      
      if (response.ok) {
        const data = await response.json()
        setShareData(data)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Lien de partage non valide')
      }
    } catch (error) {
      console.error('Erreur:', error)
      setError('Erreur lors du chargement du lien de partage')
    } finally {
      setLoading(false)
    }
  }

  const joinProject = async () => {
    if (!user) {
      // Rediriger vers la connexion avec retour sur cette page
      router.push(`/auth/login?redirect=/share/${params.id}`)
      return
    }

    try {
      setJoining(true)
      const response = await fetch(`/api/share-links/${params.id}`, {
        method: 'POST',
        headers: getAuthHeaders()
      })
      
      if (response.ok) {
        const data = await response.json()
        toast.success(data.message)
        router.push(`/todos/${data.project.id}`)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Erreur lors de l\'ajout au projet')
      }
    } catch (error) {
      console.error('Erreur:', error)
      setError('Erreur lors de l\'ajout au projet')
    } finally {
      setJoining(false)
    }
  }

  const getPermissionDescription = (permission) => {
    switch (permission) {
      case 'view':
        return {
          label: 'Lecture seule',
          description: 'Vous pourrez voir les todos mais pas les modifier',
          icon: '👁️',
          color: 'text-gray-600 dark:text-gray-400'
        }
      case 'edit':
        return {
          label: 'Modification',
          description: 'Vous pourrez créer, modifier et supprimer des todos',
          icon: '✏️',
          color: 'text-blue-600 dark:text-blue-400'
        }
      case 'admin':
        return {
          label: 'Administration',
          description: 'Vous aurez tous les droits sur ce projet',
          icon: '👑',
          color: 'text-purple-600 dark:text-purple-400'
        }
      default:
        return {
          label: permission,
          description: '',
          icon: '🔑',
          color: 'text-gray-600 dark:text-gray-400'
        }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">Vérification du lien de partage...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Lien non valide</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <Link
            href="/projects"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Retour aux projets
          </Link>
        </div>
      </div>
    )
  }

  if (!shareData) {
    return null
  }

  const permissionInfo = getPermissionDescription(shareData.permission)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Header avec couleur du projet */}
          <div 
            className="h-3"
            style={{ backgroundColor: shareData.project.color }}
          ></div>
          
          <div className="p-8">
            {/* Icône et titre du projet */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">{shareData.project.emoji}</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {shareData.project.name}
              </h1>
              {shareData.project.description && (
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {shareData.project.description}
                </p>
              )}
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Partagé par <span className="font-medium">{shareData.createdBy}</span>
              </p>
            </div>

            {/* Informations sur les permissions */}
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-6 mb-8">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <span className="text-xl mr-2">{permissionInfo.icon}</span>
                Permission accordée : {permissionInfo.label}
              </h3>
              <p className={`text-sm ${permissionInfo.color}`}>
                {permissionInfo.description}
              </p>
            </div>

            {/* Informations sur les limites */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {shareData.maxUses && (
                <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
                  <div className="flex items-center">
                    <span className="text-orange-600 dark:text-orange-400 text-xl mr-3">📊</span>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">Utilisations</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {shareData.usedCount} / {shareData.maxUses}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {shareData.expiresAt && (
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                  <div className="flex items-center">
                    <span className="text-purple-600 dark:text-purple-400 text-xl mr-3">⏰</span>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">Expire le</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(shareData.expiresAt).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="text-center space-y-4">
              {!user ? (
                <div>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Vous devez être connecté pour rejoindre ce projet
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                      onClick={joinProject}
                      className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                      Se connecter et rejoindre
                    </button>
                    <Link 
                      href="/auth/register"
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                    >
                      <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                      Découvrir WorkWave
                    </Link>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Connecté en tant que <span className="font-medium">{user.name}</span>
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                      onClick={joinProject}
                      disabled={joining}
                      className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {joining ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Ajout en cours...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          Rejoindre le projet
                        </>
                      )}
                    </button>
                    <Link
                      href="/projects"
                      className="inline-flex items-center px-6 py-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
                    >
                      <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Mes projets
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Informations supplémentaires */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            En rejoignant ce projet, vous acceptez de collaborer de manière respectueuse
          </p>
          <Link
            href="/"
            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mt-4 text-sm"
          >
            <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Découvrir WorkWave
          </Link>
        </div>
      </div>
    </div>
  )
} 