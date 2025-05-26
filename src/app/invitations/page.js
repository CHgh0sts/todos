'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useNotificationBadges } from '@/lib/hooks/useNotificationBadges'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
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
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <Link 
          href="/projects" 
          className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mb-4"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Retour aux projets
        </Link>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">📨 Mes Invitations</h1>
            <p className="text-gray-600 dark:text-gray-300">Gérez vos invitations de collaboration aux projets</p>
          </div>
        </div>
      </div>

      {/* Liste des invitations */}
      <div className="space-y-4">
        {invitations.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg">
            <svg className="w-20 h-20 text-gray-400 dark:text-gray-500 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 1.05a2 2 0 001.67-1.93V4a2 2 0 00-2-2H8a2 2 0 00-2 2v3.05L3 8zm0 0v8a2 2 0 002 2h8a2 2 0 002-2V8m-13 0L21 8m0 0v8a2 2 0 01-2 2H11" />
            </svg>
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">Aucune invitation</h3>
            <p className="text-gray-500 dark:text-gray-400">Vous n'avez pas d'invitations en attente</p>
          </div>
        ) : (
          invitations.map((invitation) => (
            <div
              key={invitation.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div 
                      className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                      style={{ backgroundColor: invitation.project?.color || '#3B82F6' }}
                    >
                      {invitation.project?.emoji || '📁'}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {invitation.project?.name || 'Projet supprimé'}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        Invitation de <span className="font-medium">{invitation.sender.name}</span>
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(invitation.createdAt)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPermissionColor(invitation.permission)}`}>
                      {getPermissionLabel(invitation.permission)}
                    </span>
                  </div>
                </div>

                {invitation.project?.description && (
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {invitation.project.description}
                  </p>
                )}

                {invitation.message && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 mb-4">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <span className="font-medium">Message :</span> {invitation.message}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Créé par {invitation.project?.user?.name || 'Utilisateur inconnu'}
                  </div>
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={() => respondToInvitation(invitation.id, 'reject')}
                      className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
                    >
                      Refuser
                    </button>
                    <button
                      onClick={() => respondToInvitation(invitation.id, 'accept')}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                    >
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