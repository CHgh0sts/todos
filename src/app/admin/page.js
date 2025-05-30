'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Cookies from 'js-cookie'
import toast from 'react-hot-toast'

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    users: { total: 0, byRole: {} },
    projects: { total: 0, totalTodos: 0 },
    recentActivity: []
  })

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/auth/login')
        return
      }
      
      // Vérifier les permissions d'administration
      if (!['ADMIN', 'MODERATOR'].includes(user.role)) {
        toast.error('Accès refusé. Permissions insuffisantes.')
        router.push('/')
        return
      }
      
      fetchDashboardData()
    }
  }, [user, authLoading, router])

  const getAuthHeaders = () => {
    const token = Cookies.get('token')
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Récupérer les statistiques des utilisateurs
      const usersResponse = await fetch('/api/admin/users?limit=1', {
        headers: getAuthHeaders()
      })
      
      if (usersResponse.ok) {
        const usersData = await usersResponse.json()
        setStats(prev => ({
          ...prev,
          users: {
            total: usersData.pagination.total,
            byRole: usersData.stats
          }
        }))
      }

      // Récupérer les statistiques des projets
      const projectsResponse = await fetch('/api/admin/projects?limit=1', {
        headers: getAuthHeaders()
      })
      
      if (projectsResponse.ok) {
        const projectsData = await projectsResponse.json()
        setStats(prev => ({
          ...prev,
          projects: {
            total: projectsData.pagination.total,
            totalTodos: projectsData.stats.totalTodos
          }
        }))
      }

      // Récupérer l'activité récente
      const activityResponse = await fetch('/api/admin/activity-logs?limit=10', {
        headers: getAuthHeaders()
      })
      
      if (activityResponse.ok) {
        const activityData = await activityResponse.json()
        setStats(prev => ({
          ...prev,
          recentActivity: activityData.logs
        }))
      }

    } catch (error) {
      console.error('Erreur lors du chargement des données:', error)
      toast.error('Erreur lors du chargement des données')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getActionIcon = (action) => {
    switch (action) {
      case 'LOGIN': return '🔐'
      case 'CREATE': return '➕'
      case 'UPDATE': return '✏️'
      case 'DELETE': return '🗑️'
      case 'ADMIN_USER_UPDATE': return '👤'
      case 'ADMIN_ROLE_CHANGE': return '👑'
      default: return '📝'
    }
  }

  const getRoleBadge = (role) => {
    const styles = {
      USER: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      MODERATOR: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      ADMIN: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    }
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[role] || styles.USER}`}>
        {role}
      </span>
    )
  }

  if (authLoading || loading) {
    return (
      <div className="fixed inset-0 top-16 overflow-y-auto">
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 top-16 overflow-y-auto">
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Dashboard Administration
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mt-2">
                  Gestion et supervision de la plateforme CollabWave
                </p>
              </div>
              <div className="flex items-center space-x-2">
                {getRoleBadge(user.role)}
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {user.name}
                </span>
              </div>
            </div>
          </div>

          {/* Statistiques principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Utilisateurs</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.users.total}</p>
                </div>
              </div>
              <div className="mt-4 flex space-x-2 text-xs">
                <span className="text-blue-600 dark:text-blue-400">👤 {stats.users.byRole.USER || 0}</span>
                <span className="text-yellow-600 dark:text-yellow-400">🛡️ {stats.users.byRole.MODERATOR || 0}</span>
                <span className="text-red-600 dark:text-red-400">👑 {stats.users.byRole.ADMIN || 0}</span>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 dark:bg-green-900">
                  <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Projets</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.projects.total}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900">
                  <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h2m0 0h2m-2 0v4l3-3m-3 3l-3-3m8-5a2 2 0 012 2v6a2 2 0 01-2 2h-2m0 0h-2m2 0v4l3-3m-3 3l-3-3" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tâches</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.projects.totalTodos}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-orange-100 dark:bg-orange-900">
                  <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Activité récente</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.recentActivity.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation rapide */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <Link href="/admin/users" className="group">
              <div className="relative bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl shadow-lg p-6 border border-blue-200 dark:border-blue-700/50 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 group-hover:scale-105 group-hover:-translate-y-1 cursor-pointer overflow-hidden h-32">
                {/* Effet de brillance au survol */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                
                <div className="relative flex items-center justify-between h-full">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100 group-hover:text-blue-700 dark:group-hover:text-blue-200 transition-colors">Gestion Utilisateurs</h3>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1 group-hover:text-blue-600 dark:group-hover:text-blue-200 transition-colors">Gérer les comptes et rôles</p>
                  </div>
                  <div className="p-3 bg-blue-500 dark:bg-blue-600 rounded-full group-hover:bg-blue-600 dark:group-hover:bg-blue-500 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12 ml-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/admin/projects" className="group">
              <div className="relative bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl shadow-lg p-6 border border-green-200 dark:border-green-700/50 hover:shadow-2xl hover:shadow-green-500/20 transition-all duration-300 group-hover:scale-105 group-hover:-translate-y-1 cursor-pointer overflow-hidden h-32">
                {/* Effet de brillance au survol */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                
                <div className="relative flex items-center justify-between h-full">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-green-900 dark:text-green-100 group-hover:text-green-700 dark:group-hover:text-green-200 transition-colors">Gestion Projets</h3>
                    <p className="text-sm text-green-700 dark:text-green-300 mt-1 group-hover:text-green-600 dark:group-hover:text-green-200 transition-colors">Superviser tous les projets</p>
                  </div>
                  <div className="p-3 bg-green-500 dark:bg-green-600 rounded-full group-hover:bg-green-600 dark:group-hover:bg-green-500 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12 ml-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/admin/chat" className="group">
              <div className="relative bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-900/20 dark:to-cyan-800/20 rounded-xl shadow-lg p-6 border border-cyan-200 dark:border-cyan-700/50 hover:shadow-2xl hover:shadow-cyan-500/20 transition-all duration-300 group-hover:scale-105 group-hover:-translate-y-1 cursor-pointer overflow-hidden h-32">
                {/* Effet de brillance au survol */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                
                <div className="relative flex items-center justify-between h-full">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-cyan-900 dark:text-cyan-100 group-hover:text-cyan-700 dark:group-hover:text-cyan-200 transition-colors">Chat Support</h3>
                    <p className="text-sm text-cyan-700 dark:text-cyan-300 mt-1 group-hover:text-cyan-600 dark:group-hover:text-cyan-200 transition-colors">Gérer les conversations</p>
                  </div>
                  <div className="p-3 bg-cyan-500 dark:bg-cyan-600 rounded-full group-hover:bg-cyan-600 dark:group-hover:bg-cyan-500 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12 ml-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/admin/activity" className="group">
              <div className="relative bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl shadow-lg p-6 border border-purple-200 dark:border-purple-700/50 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 group-hover:scale-105 group-hover:-translate-y-1 cursor-pointer overflow-hidden h-32">
                {/* Effet de brillance au survol */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                
                <div className="relative flex items-center justify-between h-full">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-purple-900 dark:text-purple-100 group-hover:text-purple-700 dark:group-hover:text-purple-200 transition-colors">Historique</h3>
                    <p className="text-sm text-purple-700 dark:text-purple-300 mt-1 group-hover:text-purple-600 dark:group-hover:text-purple-200 transition-colors">Logs d'activité complets</p>
                  </div>
                  <div className="p-3 bg-purple-500 dark:bg-purple-600 rounded-full group-hover:bg-purple-600 dark:group-hover:bg-purple-500 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12 ml-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/admin/settings" className="group">
              <div className="relative bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl shadow-lg p-6 border border-orange-200 dark:border-orange-700/50 hover:shadow-2xl hover:shadow-orange-500/20 transition-all duration-300 group-hover:scale-105 group-hover:-translate-y-1 cursor-pointer overflow-hidden h-32">
                {/* Effet de brillance au survol */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                
                <div className="relative flex items-center justify-between h-full">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-orange-900 dark:text-orange-100 group-hover:text-orange-700 dark:group-hover:text-orange-200 transition-colors">Paramètres</h3>
                    <p className="text-sm text-orange-700 dark:text-orange-300 mt-1 group-hover:text-orange-600 dark:group-hover:text-orange-200 transition-colors">Configuration système</p>
                  </div>
                  <div className="p-3 bg-orange-500 dark:bg-orange-600 rounded-full group-hover:bg-orange-600 dark:group-hover:bg-orange-500 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12 ml-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* Activité récente */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Activité Récente</h2>
                <Link href="/admin/activity" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium">
                  Voir tout →
                </Link>
              </div>
            </div>
            <div className="p-6">
              {stats.recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {stats.recentActivity.slice(0, 5).map((log) => (
                    <div key={log.id} className="flex items-center space-x-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="text-2xl">{getActionIcon(log.action)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900 dark:text-white">{log.user.name}</span>
                          {getRoleBadge(log.user.role)}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {log.action} sur {log.entity}
                          {log.targetUser && ` → ${log.targetUser.name}`}
                        </p>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(log.createdAt)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  Aucune activité récente
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 