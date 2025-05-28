'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useNotificationBadges } from '@/lib/hooks/useNotificationBadges'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Cookies from 'js-cookie'
import toast from 'react-hot-toast'

export default function NotificationsPage() {
  const { user, loading: authLoading } = useAuth()
  const { decrementNotifications, resetNotifications } = useNotificationBadges()
  const router = useRouter()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/auth/login')
        return
      }
      fetchNotifications()
    }
  }, [user, authLoading, router])

  const getAuthHeaders = () => {
    const token = Cookies.get('token')
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`/api/notifications`, {
        headers: getAuthHeaders()
      })
      
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications || [])
      } else {
        toast.error('Erreur lors du chargement des notifications')
      }
    } catch (error) {
      console.error('Erreur lors du chargement des notifications:', error)
      toast.error('Erreur lors du chargement des notifications')
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ read: true })
      })
      
      if (response.ok) {
        const notification = notifications.find(n => n.id === notificationId)
        if (notification && !notification.read) {
          decrementNotifications(1)
        }
        setNotifications(notifications.map(notif => 
          notif.id === notificationId ? { ...notif, read: true } : notif
        ))
      }
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const response = await fetch(`/api/notifications/mark-all-read`, {
        method: 'PUT',
        headers: getAuthHeaders()
      })
      
      if (response.ok) {
        resetNotifications()
        setNotifications(notifications.map(notif => ({ ...notif, read: true })))
        toast.success('Toutes les notifications ont été marquées comme lues')
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors de la mise à jour')
    }
  }

  const handleInvitationResponse = async (notificationId, invitationId, action, type) => {
    try {
      let endpoint = ''
      let method = 'PUT'
      let body = {}
      
      if (type === 'friend_request') {
        endpoint = `/api/friends/${invitationId}`
        body = { action: action === 'accepted' ? 'accept' : 'decline' }
      } else if (type === 'project_invitation') {
        endpoint = `/api/invitations/${invitationId}`
        body = { action: action === 'accepted' ? 'accept' : 'reject' }
      }
      
      const response = await fetch(endpoint, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(body)
      })
      
      if (response.ok) {
        // Marquer la notification comme lue et la mettre à jour
        setNotifications(notifications.map(notif => 
          notif.id === notificationId 
            ? { ...notif, read: true, actionTaken: action }
            : notif
        ))
        
        // Décrémenter le badge si la notification n'était pas lue
        const notification = notifications.find(n => n.id === notificationId)
        if (notification && !notification.read) {
          decrementNotifications(1)
        }
        
        if (action === 'accepted') {
          toast.success(type === 'friend_request' ? 'Demande d\'ami acceptée' : 'Invitation au projet acceptée')
        } else {
          toast.success(type === 'friend_request' ? 'Demande d\'ami refusée' : 'Invitation au projet refusée')
        }
        
        // Recharger les notifications pour avoir les données à jour
        fetchNotifications()
      } else {
        toast.error('Erreur lors du traitement de l\'invitation')
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors du traitement de l\'invitation')
    }
  }

  const isInvitationNotification = (notification) => {
    return notification.type === 'invitation_received' && 
           !notification.read && 
           !notification.actionTaken &&
           notification.data?.invitationId
  }

  const getInvitationType = (notification) => {
    if (notification.data?.type === 'friend_request') {
      return 'friend_request'
    } else if (notification.data?.type === 'project_invitation') {
      return 'project_invitation'
    }
    return null
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'project_shared':
        return '🤝'
      case 'invitation_received':
        return '📨'
      case 'invitation_accepted':
        return '✅'
      case 'invitation_rejected':
        return '❌'
      case 'todo_updated':
        return '📝'
      case 'todo_deleted':
        return '🗑️'
      case 'project_deleted':
        return '💥'
      case 'access_removed':
        return '🚪'
      default:
        return '🔔'
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))
    
    if (diffInHours < 1) {
      return 'À l\'instant'
    } else if (diffInHours < 24) {
      return `Il y a ${diffInHours}h`
    } else {
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length

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
          <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Retour aux projets
        </Link>
        
        {/* Header responsive */}
        <div className="space-y-4 sm:space-y-0">
          {/* Titre et badge sur mobile */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                  <span className="text-2xl sm:text-3xl mr-2">🔔</span>
                  Notifications
                </h1>
                {unreadCount > 0 && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 self-start">
                    {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                Restez informé des activités de vos projets
              </p>
            </div>
            
            {/* Bouton "Tout marquer comme lu" */}
            {unreadCount > 0 && (
              <div className="flex-shrink-0">
                <button
                  onClick={markAllAsRead}
                  className="w-full sm:w-auto px-3 sm:px-4 py-2 sm:py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center"
                >
                  <svg className="w-4 h-4 mr-2 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="sm:hidden">Marquer tout</span>
                  <span className="hidden sm:inline">Tout marquer comme lu</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Liste des notifications */}
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="text-center py-12 sm:py-16 bg-white dark:bg-gray-800 rounded-lg">
            <svg className="w-16 h-16 sm:w-20 sm:h-20 text-gray-400 dark:text-gray-500 mx-auto mb-4 sm:mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM15 17V7a2 2 0 00-2-2H5a2 2 0 00-2 2v13l3-3h6a2 2 0 002-2z" />
            </svg>
            <h3 className="text-lg sm:text-xl font-medium text-gray-900 dark:text-white mb-2">Aucune notification</h3>
            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 px-4">Vous êtes à jour ! Aucune nouvelle notification.</p>
          </div>
        ) : (
          notifications.map((notification) => {
            const isInvitation = isInvitationNotification(notification)
            const invitationType = getInvitationType(notification)
            
            return (
              <div
                key={notification.id}
                className={`bg-white dark:bg-gray-800 rounded-lg border transition-all duration-200 hover:shadow-md ${
                  notification.read 
                    ? 'border-gray-200 dark:border-gray-700 opacity-75' 
                    : 'border-blue-200 dark:border-blue-700 shadow-sm'
                } ${!isInvitation ? 'cursor-pointer' : ''}`}
                onClick={() => !notification.read && !isInvitation && markAsRead(notification.id)}
              >
                <div className="p-3 sm:p-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <span className="text-xl sm:text-2xl">{getNotificationIcon(notification.type)}</span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className={`text-sm font-medium leading-tight ${
                            notification.read 
                              ? 'text-gray-700 dark:text-gray-300' 
                              : 'text-gray-900 dark:text-white'
                          }`}>
                            {notification.title}
                          </h4>
                          <p className={`mt-1 text-sm leading-relaxed ${
                            notification.read 
                              ? 'text-gray-500 dark:text-gray-400' 
                              : 'text-gray-600 dark:text-gray-300'
                          }`}>
                            {notification.message}
                          </p>
                          
                          {/* Boutons d'action pour les invitations */}
                          {isInvitation && invitationType && (
                            <div className="mt-3 flex flex-col sm:flex-row gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleInvitationResponse(
                                    notification.id, 
                                    notification.data.invitationId, 
                                    'accepted', 
                                    invitationType
                                  )
                                }}
                                className="flex-1 sm:flex-none px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                              >
                                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Accepter
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleInvitationResponse(
                                    notification.id, 
                                    notification.data.invitationId, 
                                    'rejected', 
                                    invitationType
                                  )
                                }}
                                className="flex-1 sm:flex-none px-3 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
                              >
                                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Refuser
                              </button>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex flex-col items-end space-y-1 flex-shrink-0">
                          <span className={`text-xs whitespace-nowrap ${
                            notification.read 
                              ? 'text-gray-400 dark:text-gray-500' 
                              : 'text-gray-500 dark:text-gray-400'
                          }`}>
                            {formatDate(notification.createdAt)}
                          </span>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
} 