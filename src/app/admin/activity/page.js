'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Cookies from 'js-cookie'
import toast from 'react-hot-toast'

export default function AdminActivity() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [filterLoading, setFilterLoading] = useState(false)
  const [logs, setLogs] = useState([])
  const [users, setUsers] = useState([])
  const [pagination, setPagination] = useState({})
  const [stats, setStats] = useState({})
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [expandedLogs, setExpandedLogs] = useState(new Set())
  const [showStickyFilters, setShowStickyFilters] = useState(false)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [filters, setFilters] = useState({
    userId: '',
    action: '',
    startDate: '',
    endDate: '',
    page: 1,
    limit: 50
  })

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/auth/login')
        return
      }
      
      if (!['ADMIN', 'MODERATOR'].includes(user.role)) {
        toast.error('Accès refusé. Permissions insuffisantes.')
        router.push('/')
        return
      }
      
      fetchUsers()
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user && ['ADMIN', 'MODERATOR'].includes(user.role)) {
      fetchLogs()
    }
  }, [filters])

  // Fermer le dropdown quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserDropdown && !event.target.closest('.user-dropdown')) {
        setShowUserDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showUserDropdown])

  // Gérer la visibilité des filtres sticky basée sur le scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
      // Afficher les filtres sticky si on scroll vers le haut et qu'on a dépassé une certaine position
      if (currentScrollY < lastScrollY && currentScrollY > 200) {
        setShowStickyFilters(true)
      } 
      // Cacher les filtres sticky si on scroll vers le bas ou qu'on est en haut de page
      else if (currentScrollY > lastScrollY || currentScrollY <= 200) {
        setShowStickyFilters(false)
      }
      
      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  const getAuthHeaders = () => {
    const token = Cookies.get('token')
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }

  const fetchLogs = async () => {
    try {
      setFilterLoading(true)
      const params = new URLSearchParams()
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })

      const response = await fetch(`/api/admin/user-activity?${params}`, {
        headers: getAuthHeaders()
      })
      
      if (response.ok) {
        const data = await response.json()
        setLogs(data.logs)
        setPagination(data.pagination)
        setStats(data.stats)
      } else {
        toast.error('Erreur lors du chargement des logs')
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors du chargement des logs')
    } finally {
      setFilterLoading(false)
      setIsInitialLoad(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users', {
        headers: getAuthHeaders()
      })

      if (response.ok) {
        const data = await response.json()
        setUsers(data.users || [])
      }
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error)
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1
    }))
  }

  const handlePageChange = (newPage) => {
    setFilters(prev => ({
      ...prev,
      page: newPage
    }))
  }

  const toggleLogExpansion = (logId) => {
    setExpandedLogs(prev => {
      const newSet = new Set(prev)
      if (newSet.has(logId)) {
        newSet.delete(logId)
      } else {
        newSet.add(logId)
      }
      return newSet
    })
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const getActionIcon = (typeLog) => {
    switch (typeLog) {
      case 'Navigation': return '🧭'
      case 'create': return '➕'
      case 'edit': return '✏️'
      case 'delete': return '🗑️'
      default: return '📝'
    }
  }

  const getActionColor = (typeLog) => {
    switch (typeLog) {
      case 'Navigation': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'create': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'edit': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case 'delete': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  const getActivityDetails = (log) => {
    // Si textLog est disponible, l'utiliser directement
    if (log.textLog) {
      return {
        description: `${log.element || 'élément'}`,
        target: log.textLog,
        extra: ''
      }
    }
    
    // Fallback vers l'ancien système
    switch (log.typeLog) {
      case 'Navigation':
        return {
          description: log.element || 'Page inconnue',
          target: '-',
          extra: ''
        }
      case 'create':
        return {
          description: `${log.element || 'élément'}`,
          target: log.to?.name || log.to?.title || 'Sans nom',
          extra: log.to ? 'Créé' : ''
        }
      case 'edit':
        const formatChanges = () => {
          // Utiliser les nouveaux champs from et to de la base de données
          if (log.from && log.to) {
            const changesList = []
            
            // Comparer les objets from et to pour identifier les changements
            Object.keys(log.to).forEach(field => {
              if (log.from[field] !== log.to[field]) {
                const from = log.from[field] === null ? 'null' : log.from[field]
                const to = log.to[field] === null ? 'null' : log.to[field]
                changesList.push(`${field}: ${from} → ${to}`)
              }
            })
            
            return changesList.join(', ')
          }
          
          return ''
        }
        
        return {
          description: `${log.element || 'élément'}`,
          target: log.to?.name || log.to?.title || log.from?.name || log.from?.title || 'Sans nom',
          extra: formatChanges() || 'Modifications détaillées'
        }
      case 'delete':
        return {
          description: `${log.element || 'élément'}`,
          target: log.from?.name || log.from?.title || 'Élément supprimé',
          extra: 'Supprimé'
        }
      default:
        return {
          description: 'Action inconnue',
          target: '-',
          extra: ''
        }
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

  /**
   * Parse le textLog pour styliser les éléments entre crochets
   * @param {string} textLog - Le message textuel à parser
   * @returns {JSX.Element} - Le message avec les éléments stylisés
   */
  const parseTextLog = (textLog) => {
    if (!textLog) return textLog

    // Regex pour détecter les éléments entre crochets [nom]
    const regex = /\[([^\]]+)\]/g
    const parts = []
    let lastIndex = 0
    let match
    let elementIndex = 0

    while ((match = regex.exec(textLog)) !== null) {
      // Ajouter le texte avant le match
      if (match.index > lastIndex) {
        parts.push(textLog.slice(lastIndex, match.index))
      }
      
      // Déterminer le type d'élément
      const textBefore = textLog.slice(0, match.index).toLowerCase()
      const textAfter = textLog.slice(regex.lastIndex).toLowerCase()
      
      const isUser = textBefore.includes('par ') || textBefore.startsWith('[') || textBefore.includes('navigué')
      const isPage = textBefore.includes('navigué vers') || textAfter.includes('navigué')
      
      // Styles différents pour utilisateurs, pages et éléments
      const userStyle = "px-2 py-1 bg-slate-300 dark:bg-slate-600 text-slate-800 dark:text-slate-100 rounded-md text-sm font-semibold border border-slate-400 dark:border-slate-500"
      const pageStyle = "px-2 py-1 bg-zinc-300 dark:bg-zinc-600 text-zinc-800 dark:text-zinc-100 rounded-md text-sm font-semibold border border-zinc-400 dark:border-zinc-500"
      const elementStyle = "px-2 py-1 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-100 rounded-md text-sm font-semibold border border-gray-400 dark:border-gray-500"
      
      // Déterminer le style à appliquer
      let styleToApply = elementStyle
      let titleText = "Élément"
      
      if (isPage) {
        styleToApply = pageStyle
        titleText = "Page"
      } else if (isUser) {
        styleToApply = userStyle
        titleText = "Utilisateur"
      }
      
      // Ajouter l'élément stylisé
      parts.push(
        <span 
          key={`${match.index}-${elementIndex}`}
          className={styleToApply}
          title={titleText}
        >
          {match[1]}
        </span>
      )
      
      lastIndex = regex.lastIndex
      elementIndex++
    }
    
    // Ajouter le texte restant
    if (lastIndex < textLog.length) {
      parts.push(textLog.slice(lastIndex))
    }
    
    return parts.length > 1 ? <>{parts}</> : textLog
  }

  const hasDetails = (log) => {
    return log.from || log.to || (log.element && log.element !== 'navigation')
  }

  if (authLoading || (loading && isInitialLoad)) {
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
                <Link href="/admin" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium mb-2 inline-block">
                  ← Retour au dashboard
                </Link>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Activité des Utilisateurs
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mt-2">
                  Suivi détaillé de toutes les actions : Navigation, Création, Modification, Suppression
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

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <span className="text-xl">🧭</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Navigation</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.navigation || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <span className="text-xl">➕</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Créations</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.create || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                  <span className="text-xl">✏️</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Modifications</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.edit || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                  <span className="text-xl">🗑️</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Suppressions</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.delete || 0}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filtres */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-100 dark:border-gray-700 mb-6">
            <div className="p-4 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">🔍 Filtres</h3>
            </div>
            <div className="p-4">
              <div className="flex gap-4">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {/* Select custom pour utilisateur */}
                  <div className="user-dropdown relative lg:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Utilisateur
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowUserDropdown(!showUserDropdown)}
                        className="w-full h-10 px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-left flex items-center justify-between"
                      >
                        <div className="flex items-center">
                          {filters.userId ? (
                            <>
                              {(() => {
                                const selectedUser = users.find(u => u.id.toString() === filters.userId || u.name.toLowerCase().includes(filters.userId.toLowerCase()))
                                return selectedUser ? (
                                  <>
                                    <div className="flex-shrink-0 h-6 w-6 mr-2">
                                      {selectedUser.profileImage ? (
                                        <img
                                          className="h-6 w-6 rounded-full object-cover"
                                          src={selectedUser.profileImage}
                                          alt={selectedUser.name}
                                        />
                                      ) : (
                                        <div className="h-6 w-6 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                                          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                            {selectedUser.name.charAt(0).toUpperCase()}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                    <span className="truncate">{selectedUser.name}</span>
                                  </>
                                ) : (
                                  <span className="text-gray-500 dark:text-gray-400">{filters.userId}</span>
                                )
                              })()}
                            </>
                          ) : (
                            <span className="text-gray-500 dark:text-gray-400">Tous les utilisateurs</span>
                          )}
                        </div>
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      
                      {showUserDropdown && (
                        <div className="absolute z-30 mt-1 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                          <div 
                            className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer flex items-center"
                            onClick={() => {
                              handleFilterChange('userId', '')
                              setShowUserDropdown(false)
                            }}
                          >
                            <div className="flex-shrink-0 h-6 w-6 mr-2">
                              <div className="h-6 w-6 rounded-full bg-gray-200 dark:bg-gray-500 flex items-center justify-center">
                                <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                                  ∀
                                </span>
                              </div>
                            </div>
                            <span className="text-sm text-gray-700 dark:text-gray-300">Tous les utilisateurs</span>
                          </div>
                          {users.map((user) => (
                            <div
                              key={user.id}
                              className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer flex items-center"
                              onClick={() => {
                                handleFilterChange('userId', user.id.toString())
                                setShowUserDropdown(false)
                              }}
                            >
                              <div className="flex-shrink-0 h-6 w-6 mr-2">
                                {user.profileImage ? (
                                  <img
                                    className="h-6 w-6 rounded-full object-cover"
                                    src={user.profileImage}
                                    alt={user.name}
                                  />
                                ) : (
                                  <div className="h-6 w-6 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                      {user.name.charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                )}
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {user.name}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {user.role}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Action
                    </label>
                    <select
                      value={filters.action}
                      onChange={(e) => handleFilterChange('action', e.target.value)}
                      className="w-full h-10 px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Toutes les actions</option>
                      <option value="Navigation">🧭 Navigation</option>
                      <option value="create">➕ create</option>
                      <option value="edit">✏️ edit</option>
                      <option value="delete">🗑️ delete</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Date début
                    </label>
                    <input
                      type="date"
                      value={filters.startDate}
                      onChange={(e) => handleFilterChange('startDate', e.target.value)}
                      className="w-full h-10 px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Date fin
                    </label>
                    <input
                      type="date"
                      value={filters.endDate}
                      onChange={(e) => handleFilterChange('endDate', e.target.value)}
                      className="w-full h-10 px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Bouton reset à droite */}
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setFilters({
                        userId: '',
                        action: '',
                        startDate: '',
                        endDate: '',
                        page: 1,
                        limit: 50
                      })
                      setShowUserDropdown(false)
                    }}
                    className="w-12 h-10 px-2 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 flex items-center justify-center group"
                    title="Réinitialiser les filtres"
                  >
                    <svg 
                      className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Filtres sticky conditionnels */}
          {showStickyFilters && (
            <div className="fixed top-4 left-0 right-0 z-30 px-4 sm:px-6 lg:px-8 transition-all duration-300 ease-in-out transform">
              <div className="max-w-7xl mx-auto">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-100 dark:border-gray-700">
                  <div className="p-3 border-b border-gray-100 dark:border-gray-700">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">🔍 Filtres rapides</h3>
                  </div>
                  <div className="p-3">
                    <div className="flex gap-3">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                        {/* Select custom pour utilisateur - version compacte */}
                        <div className="user-dropdown relative lg:col-span-2">
                          <select
                            value={filters.userId}
                            onChange={(e) => handleFilterChange('userId', e.target.value)}
                            className="w-full h-8 px-2 py-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded text-xs focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="">Tous les utilisateurs</option>
                            {users.map((user) => (
                              <option key={user.id} value={user.id.toString()}>
                                {user.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <select
                            value={filters.action}
                            onChange={(e) => handleFilterChange('action', e.target.value)}
                            className="w-full h-8 px-2 py-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded text-xs focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="">Toutes les actions</option>
                            <option value="Navigation">🧭 Navigation</option>
                            <option value="create">➕ create</option>
                            <option value="edit">✏️ edit</option>
                            <option value="delete">🗑️ delete</option>
                          </select>
                        </div>

                        <div>
                          <input
                            type="date"
                            value={filters.startDate}
                            onChange={(e) => handleFilterChange('startDate', e.target.value)}
                            className="w-full h-8 px-2 py-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded text-xs focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <input
                            type="date"
                            value={filters.endDate}
                            onChange={(e) => handleFilterChange('endDate', e.target.value)}
                            className="w-full h-8 px-2 py-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded text-xs focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>

                      {/* Bouton reset compact */}
                      <div className="flex items-center">
                        <button
                          onClick={() => {
                            setFilters({
                              userId: '',
                              action: '',
                              startDate: '',
                              endDate: '',
                              page: 1,
                              limit: 50
                            })
                          }}
                          className="w-8 h-8 px-1 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors duration-200 flex items-center justify-center group"
                          title="Réinitialiser les filtres"
                        >
                          <svg 
                            className="w-3 h-3 group-hover:rotate-180 transition-transform duration-300" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Liste des logs */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="p-4 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  📋 Logs d'activité ({pagination.total || 0})
                </h3>
                {filterLoading && (
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                    Filtrage...
                  </div>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Utilisateur
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Action
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Déplier
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                  {logs.map((log) => (
                    <React.Fragment key={log.id}>
                      <tr 
                        className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                        onClick={() => toggleLogExpansion(log.id)}
                      >
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8">
                              {log.user.profileImage ? (
                                <img
                                  className="h-8 w-8 rounded-full object-cover"
                                  src={log.user.profileImage}
                                  alt={log.user.name}
                                />
                              ) : (
                                <div className="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {log.user.name.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {log.user.name}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {log.user.role}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex justify-center">
                            <span className={`inline-flex items-center justify-center px-3 py-1.5 rounded-full text-xs font-medium w-24 ${getActionColor(log.typeLog)}`}>
                              <span className="mr-1">{getActionIcon(log.typeLog)}</span>
                              {log.typeLog}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {parseTextLog(log.textLog || `${log.element} - ${log.typeLog}`)}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(log.createdAt)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center justify-center">
                            <svg 
                              className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                                expandedLogs.has(log.id) ? 'rotate-180' : ''
                              }`} 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </td>
                      </tr>
                      
                      {/* Menu déroulant avec informations avant/après */}
                      {expandedLogs.has(log.id) && (
                        <tr className="bg-gray-50 dark:bg-gray-700">
                          <td colSpan="5" className="px-4 py-6">
                            <div className="space-y-4">
                              {/* Informations générales */}
                              {log.element && log.element !== 'navigation' && (
                                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">📋 Informations générales</h4>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Élément</span>
                                      <p className="text-sm text-gray-900 dark:text-white mt-1">{log.element}</p>
                                    </div>
                                    {log.ipAddress && (
                                      <div>
                                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Adresse IP</span>
                                        <p className="text-sm text-gray-900 dark:text-white mt-1">{log.ipAddress}</p>
                                      </div>
                                    )}
                                  </div>
                                  {log.userAgent && (
                                    <div className="mt-3">
                                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">User Agent</span>
                                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 break-all">{log.userAgent}</p>
                                    </div>
                                  )}
                                </div>
                              )}
                              
                              {/* Comparaison Avant/Après */}
                              {(log.from || log.to) && (
                                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">🔄 Comparaison Avant/Après</h4>
                                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    {/* État AVANT */}
                                    <div className="space-y-2">
                                      <div className="flex items-center space-x-2">
                                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                                          ⬅️ AVANT
                                        </span>
                                      </div>
                                      {log.from ? (
                                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
                                          <pre className="text-xs text-red-800 dark:text-red-200 overflow-x-auto whitespace-pre-wrap">
                                            {JSON.stringify(log.from, null, 2)}
                                          </pre>
                                        </div>
                                      ) : (
                                        <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md p-3">
                                          <p className="text-xs text-gray-500 dark:text-gray-400 italic">Aucune donnée avant</p>
                                        </div>
                                      )}
                                    </div>
                                    
                                    {/* État APRÈS */}
                                    <div className="space-y-2">
                                      <div className="flex items-center space-x-2">
                                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                                          ➡️ APRÈS
                                        </span>
                                      </div>
                                      {log.to ? (
                                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-3">
                                          <pre className="text-xs text-green-800 dark:text-green-200 overflow-x-auto whitespace-pre-wrap">
                                            {JSON.stringify(log.to, null, 2)}
                                          </pre>
                                        </div>
                                      ) : (
                                        <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md p-3">
                                          <p className="text-xs text-gray-500 dark:text-gray-400 italic">Aucune donnée après</p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  
                                  {/* Résumé des changements */}
                                  {log.from && log.to && (
                                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                                      <h5 className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">📝 Résumé des changements</h5>
                                      <div className="space-y-1">
                                        {Object.keys(log.to).map(field => {
                                          const oldValue = log.from[field]
                                          const newValue = log.to[field]
                                          if (oldValue !== newValue) {
                                            return (
                                              <div key={field} className="text-xs">
                                                <span className="font-medium text-gray-700 dark:text-gray-300">{field}:</span>
                                                <span className="text-red-600 dark:text-red-400 ml-1">
                                                  {oldValue === null ? 'null' : String(oldValue)}
                                                </span>
                                                <span className="text-gray-500 dark:text-gray-400 mx-1">→</span>
                                                <span className="text-green-600 dark:text-green-400">
                                                  {newValue === null ? 'null' : String(newValue)}
                                                </span>
                                              </div>
                                            )
                                          }
                                          return null
                                        })}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                              
                              {/* Message si aucune donnée détaillée */}
                              {!log.from && !log.to && log.element === 'navigation' && (
                                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                                  <div className="flex items-center">
                                    <span className="text-blue-500 text-lg mr-2">ℹ️</span>
                                    <p className="text-sm text-blue-800 dark:text-blue-200">
                                      Cette action de navigation ne contient pas de données détaillées.
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    Page {pagination.page} sur {pagination.totalPages} ({pagination.total} résultats)
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page <= 1}
                      className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Précédent
                    </button>
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page >= pagination.totalPages}
                      className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Suivant
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 