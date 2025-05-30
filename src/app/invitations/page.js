'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useNotificationBadges } from '@/lib/hooks/useNotificationBadges'
import UserAvatar from '@/components/UserAvatar'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import toast from 'react-hot-toast'

export default function InvitationsPage() {
  const { user, loading: authLoading } = useAuth()
  const { decrementInvitations } = useNotificationBadges()
  const router = useRouter()
  const [invitations, setInvitations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/auth/login')
        return
      }
      fetchInvitations()
    }
  }, [user, authLoading, router])

  const getAuthHeaders = () => {
    const token = Cookies.get('token')
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }

  const fetchInvitations = async () => {
    try {
      const response = await fetch(`/api/invitations`, {
        headers: getAuthHeaders()
      })
      
      if (response.ok) {
        const data = await response.json()
        setInvitations(data)
      } else {
        toast.error('Erreur lors du chargement des invitations')
      }
    } catch (error) {
      console.error('Erreur lors du chargement des invitations:', error)
      toast.error('Erreur lors du chargement des invitations')
    } finally {
      setLoading(false)
    }
  }

  const respondToInvitation = async (invitationId, action) => {
    try {
      const response = await fetch(`/api/invitations/${invitationId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ action })
      })
      
      if (response.ok) {
        decrementInvitations(1)
        const message = action === 'accept' ? 'Invitation acceptée !' : 'Invitation refusée'
        toast.success(message)
        fetchInvitations()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erreur lors du traitement')
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors du traitement de l\'invitation')
    }
  }

  const getPermissionLabel = (permission) => {
    switch (permission) {
      case 'view': return 'Lecture seule'
      case 'edit': return 'Modification'
      case 'admin': return 'Administration'
      default: return permission
    }
  }

  const getPermissionColor = (permission) => {
    switch (permission) {
      case 'view': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
      case 'edit': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'admin': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (authLoading || loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-300 rounded"></div>
            <div className="h-4 bg-gray-300 rounded"></div>
            <div className="h-4 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-6 sm:mb-8">
        <Link 
          href="/projects" 
          className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mb-4 sm:mb-6 text-sm sm:text-base"
        >
          <svg className="w-4 h-4 mr-2 flex-shrink-0 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Retour aux projets
        </Link>
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center">
              <span className="text-2xl sm:text-3xl mr-2">📨</span>
              Mes Invitations
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">Gérez vos invitations de collaboration aux projets</p>
          </div>
        </div>
      </div>

      {/* Liste des invitations */}
      <div className="space-y-3 sm:space-y-4">
        {invitations.length === 0 ? (
          <div className="text-center py-12 sm:py-16 bg-white dark:bg-gray-800 rounded-lg">
            <svg className="w-16 h-16 sm:w-20 sm:h-20 text-gray-400 dark:text-gray-500 mx-auto mb-4 sm:mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 1.05a2 2 0 001.67-1.93V4a2 2 0 00-2-2H8a2 2 0 00-2 2v3.05L3 8zm0 0v8a2 2 0 002 2h8a2 2 0 002-2V8m-13 0L21 8m0 0v8a2 2 0 01-2 2H11" />
            </svg>
            <h3 className="text-lg sm:text-xl font-medium text-gray-900 dark:text-white mb-2">Aucune invitation</h3>
            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 px-4">Vous n'avez pas d'invitations en attente</p>
          </div>
        ) : (
          invitations.map((invitation) => (
            <div
              key={invitation.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden"
            >
              <div className="p-4 sm:p-6">
                {/* Header de l'invitation - responsive */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                  <div className="flex items-start space-x-3 sm:space-x-4 flex-1 min-w-0">
                    <div 
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center text-xl sm:text-2xl flex-shrink-0"
                      style={{ backgroundColor: invitation.project?.color || '#3B82F6' }}
                    >
                      {invitation.project?.emoji || '📁'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white break-words">
                        {invitation.project?.name || 'Projet supprimé'}
                      </h3>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm sm:text-base text-gray-600 dark:text-gray-300">Invitation de</span>
                        <UserAvatar user={invitation.sender} size="sm" />
                        <span className="font-medium text-sm sm:text-base text-gray-900 dark:text-white">{invitation.sender.name}</span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(invitation.createdAt)}
                      </p>
                    </div>
                  </div>
                  
                  {/* Badge de permission */}
                  <div className="flex items-center justify-start sm:justify-end">
                    <span className={`px-2.5 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-medium ${getPermissionColor(invitation.permission)}`}>
                      {getPermissionLabel(invitation.permission)}
                    </span>
                  </div>
                </div>

                {/* Description du projet */}
                {invitation.project?.description && (
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-4 break-words">
                    {invitation.project.description}
                  </p>
                )}

                {/* Message de l'invitation */}
                {invitation.message && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 mb-4">
                    <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 break-words">
                      <span className="font-medium">Message :</span> {invitation.message}
                    </p>
                  </div>
                )}

                {/* Footer avec créateur et boutons d'action */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                  <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 order-2 sm:order-1">
                    Créé par {invitation.project?.user?.name || 'Utilisateur inconnu'}
                  </div>
                  
                  {/* Boutons d'action */}
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 order-1 sm:order-2">
                    <button
                      onClick={() => respondToInvitation(invitation.id, 'reject')}
                      className="flex-1 sm:flex-none px-4 py-2.5 sm:py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium text-sm sm:text-base flex items-center justify-center"
                    >
                      <svg className="w-4 h-4 mr-2 flex-shrink-0 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Refuser
                    </button>
                    <button
                      onClick={() => respondToInvitation(invitation.id, 'accept')}
                      className="flex-1 sm:flex-none px-4 py-2.5 sm:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm sm:text-base flex items-center justify-center"
                    >
                      <svg className="w-4 h-4 mr-2 flex-shrink-0 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Accepter
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
} 