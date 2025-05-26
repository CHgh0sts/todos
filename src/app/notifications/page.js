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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              🔔 Notifications
              {unreadCount > 0 && (
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                  {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
                </span>
              )}
            </h1>
            <p className="text-gray-600 dark:text-gray-300">Restez informé des activités de vos projets</p>
          </div>
          
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Tout marquer comme lu
            </button>
          )}
        </div>
      </div>

      {/* Liste des notifications */}
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg">
            <svg className="w-20 h-20 text-gray-400 dark:text-gray-500 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM15 17V7a2 2 0 00-2-2H5a2 2 0 00-2 2v13l3-3h6a2 2 0 002-2z" />
            </svg>
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">Aucune notification</h3>
            <p className="text-gray-500 dark:text-gray-400">Vous êtes à jour ! Aucune nouvelle notification.</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-white dark:bg-gray-800 rounded-lg border transition-all duration-200 hover:shadow-md cursor-pointer ${
                notification.read 
                  ? 'border-gray-200 dark:border-gray-700 opacity-75' 
                  : 'border-blue-200 dark:border-blue-700 shadow-sm'
              }`}
              onClick={() => !notification.read && markAsRead(notification.id)}
            >
              <div className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <span className="text-2xl">{getNotificationIcon(notification.type)}</span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className={`text-sm font-medium ${
                          notification.read 
                            ? 'text-gray-700 dark:text-gray-300' 
                            : 'text-gray-900 dark:text-white'
                        }`}>
                          {notification.title}
                        </h4>
                        <p className={`mt-1 text-sm ${
                          notification.read 
                            ? 'text-gray-500 dark:text-gray-400' 
                            : 'text-gray-600 dark:text-gray-300'
                        }`}>
                          {notification.message}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-2">
                        <span className={`text-xs ${
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
          ))
        )}
      </div>
    </div>
  )
} 