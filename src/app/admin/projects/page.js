'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Cookies from 'js-cookie'
import toast from 'react-hot-toast'

export default function AdminProjects() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [projects, setProjects] = useState([])
  const [pagination, setPagination] = useState({})
  const [stats, setStats] = useState({})
  const [filters, setFilters] = useState({
    search: '',
    ownerId: '',
    page: 1,
    limit: 20
  })
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState(null)
  const [showTodosModal, setShowTodosModal] = useState(false)
  const [selectedProject, setSelectedProject] = useState(null)
  const [projectTodos, setProjectTodos] = useState([])
  const [loadingTodos, setLoadingTodos] = useState(false)

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
      
      fetchProjects()
    }
  }, [user, authLoading, router, filters])

  const getAuthHeaders = () => {
    const token = Cookies.get('token')
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }

  const fetchProjects = async () => {
    try {
      setLoading(true)
      
      const queryParams = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value)
      })

      const response = await fetch(`/api/admin/projects?${queryParams}`, {
        headers: getAuthHeaders()
      })

      if (response.ok) {
        const data = await response.json()
        setProjects(data.projects)
        setPagination(data.pagination)
        setStats(data.stats)
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Erreur inconnue' }))
        
        if (response.status === 401) {
          toast.error('Session expirée, veuillez vous reconnecter')
          router.push('/auth/login')
        } else if (response.status === 403) {
          toast.error('Accès refusé. Permissions insuffisantes.')
          router.push('/')
        } else if (response.status === 500) {
          toast.error(`Erreur serveur: ${errorData.error || 'Erreur interne du serveur'}`)
        } else if (response.status === 503) {
          toast.error('Service temporairement indisponible, veuillez réessayer dans quelques instants')
        } else {
          toast.error(`Erreur lors du chargement des projets (${response.status}): ${errorData.error || 'Erreur inconnue'}`)
        }
      }
    } catch (error) {
      console.error('Erreur:', error)
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        toast.error('Erreur de connexion au serveur, vérifiez votre connexion internet')
      } else if (error.name === 'AbortError') {
        toast.error('Requête annulée')
      } else {
        toast.error('Erreur lors du chargement des projets')
      }
    } finally {
      setLoading(false)
    }
  }

  const deleteProject = async (projectId) => {
    try {
      const response = await fetch(`/api/admin/projects?projectId=${projectId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })

      if (response.ok) {
        toast.success('Projet supprimé avec succès')
        fetchProjects()
        setShowDeleteModal(false)
        setProjectToDelete(null)
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Erreur inconnue' }))
        
        if (response.status === 401) {
          toast.error('Session expirée, veuillez vous reconnecter')
          router.push('/auth/login')
        } else if (response.status === 403) {
          toast.error(errorData.error || 'Permissions insuffisantes pour supprimer ce projet')
        } else if (response.status === 404) {
          toast.error('Projet non trouvé')
          fetchProjects() // Rafraîchir la liste
          setShowDeleteModal(false)
          setProjectToDelete(null)
        } else if (response.status === 500) {
          toast.error('Erreur serveur lors de la suppression du projet')
        } else {
          toast.error(errorData.error || 'Erreur lors de la suppression du projet')
        }
      }
    } catch (error) {
      console.error('Erreur:', error)
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        toast.error('Erreur de connexion au serveur')
      } else {
        toast.error('Erreur lors de la suppression du projet')
      }
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset page when filtering
    }))
  }

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }))
  }

  const fetchProjectTodos = async (projectId) => {
    try {
      setLoadingTodos(true)
      
      const response = await fetch(`/api/admin/projects/${projectId}/todos`, {
        headers: getAuthHeaders()
      })

      if (response.ok) {
        const data = await response.json()
        setProjectTodos(data.todos || [])
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Erreur inconnue' }))
        
        if (response.status === 401) {
          toast.error('Session expirée, veuillez vous reconnecter')
          router.push('/auth/login')
        } else if (response.status === 403) {
          toast.error('Accès refusé pour voir les tâches de ce projet')
        } else if (response.status === 404) {
          toast.error('Projet non trouvé')
        } else if (response.status === 500) {
          toast.error('Erreur serveur lors du chargement des tâches')
        } else {
          toast.error(`Erreur lors du chargement des tâches: ${errorData.error || 'Erreur inconnue'}`)
        }
        setProjectTodos([])
      }
    } catch (error) {
      console.error('Erreur:', error)
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        toast.error('Erreur de connexion au serveur')
      } else {
        toast.error('Erreur lors du chargement des tâches')
      }
      setProjectTodos([])
    } finally {
      setLoadingTodos(false)
    }
  }

  const openTodosModal = async (project) => {
    setSelectedProject(project)
    setShowTodosModal(true)
    await fetchProjectTodos(project.id)
  }

  const closeTodosModal = () => {
    setShowTodosModal(false)
    setSelectedProject(null)
    setProjectTodos([])
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

  const formatDateOnly = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    }
  }

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 'high': return '🔴 Haute'
      case 'medium': return '🟡 Moyenne'
      case 'low': return '🟢 Basse'
      default: return '⚪ Non définie'
    }
  }

  const isOverdue = (dueDate) => {
    return dueDate && new Date(dueDate) < new Date()
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
                <Link href="/admin" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium mb-2 inline-block">
                  ← Retour au dashboard
                </Link>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Gestion des Projets
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mt-2">
                  Superviser tous les projets de la plateforme
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  user.role === 'ADMIN' 
                    ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                }`}>
                  {user.role}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {user.name}
                </span>
              </div>
            </div>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Projets</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{pagination.total || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 dark:bg-green-900">
                  <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h2m0 0h2m-2 0v4l3-3m-3 3l-3-3m8-5a2 2 0 012 2v6a2 2 0 01-2 2h-2m0 0h-2m2 0v4l3-3m-3 3l-3-3" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Tâches</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalTodos || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900">
                  <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tâches Terminées</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.completedTodos || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-orange-100 dark:bg-orange-900">
                  <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Collaborateurs</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalCollaborators || 0}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filtres */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Rechercher
                </label>
                <input
                  type="text"
                  placeholder="Nom du projet..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Propriétaire
                </label>
                <input
                  type="text"
                  placeholder="ID ou nom du propriétaire..."
                  value={filters.ownerId}
                  onChange={(e) => handleFilterChange('ownerId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Par page
                </label>
                <select
                  value={filters.limit}
                  onChange={(e) => handleFilterChange('limit', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
              </div>
            </div>
          </div>

          {/* Liste des projets */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Projets ({pagination.total || 0})
              </h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Projet
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Propriétaire
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Activité
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Créé le
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {projects.map((project) => (
                    <tr key={project.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <span className="text-2xl mr-3" style={{ color: project.color }}>
                            {project.emoji || '📁'}
                          </span>
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {project.name}
                            </div>
                            {project.description && (
                              <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                                {project.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8">
                            {project.owner?.profileImage ? (
                              <img
                                className="h-8 w-8 rounded-full object-cover"
                                src={project.owner.profileImage}
                                alt={project.owner.name || 'Utilisateur'}
                              />
                            ) : (
                              <div className="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                  {project.owner?.name?.charAt(0)?.toUpperCase() || '?'}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {project.owner?.name || 'Utilisateur supprimé'}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {project.owner?.email || 'Email non disponible'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center text-sm text-gray-900 dark:text-white whitespace-nowrap">
                            <svg className="w-4 h-4 mr-1 flex-shrink-0 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            {project._count?.todos || 0} tâches
                          </div>
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                            <svg className="w-4 h-4 mr-1 flex-shrink-0 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            {(project.todos || []).filter(todo => todo.completed).length} finies
                          </div>
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                            <svg className="w-4 h-4 mr-1 flex-shrink-0 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            {project._count?.collaborators || 0} membres
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        {formatDate(project.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openTodosModal(project)}
                            className="inline-flex items-center justify-center w-8 h-8 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-md transition-colors"
                            title="Voir les tâches du projet"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          
                          <Link
                            href={`/todos/${project.id}?admin=true&edit=true`}
                            className="inline-flex items-center justify-center w-8 h-8 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-md transition-colors"
                            title="Éditer le projet (mode admin)"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </Link>

                          {user.role === 'ADMIN' && (
                            <button
                              onClick={() => {
                                setProjectToDelete(project)
                                setShowDeleteModal(true)
                              }}
                              className="inline-flex items-center justify-center w-8 h-8 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-md transition-colors"
                              title="Supprimer le projet"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    Affichage de {((pagination.page - 1) * pagination.limit) + 1} à {Math.min(pagination.page * pagination.limit, pagination.total)} sur {pagination.total} résultats
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page <= 1}
                      className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      Précédent
                    </button>
                    <span className="px-3 py-1 text-sm text-gray-700 dark:text-gray-300">
                      Page {pagination.page} sur {pagination.totalPages}
                    </span>
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page >= pagination.totalPages}
                      className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
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

      {/* Modal des tâches du projet */}
      {showTodosModal && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{selectedProject.emoji}</span>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Tâches du projet : {selectedProject.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Propriétaire : {selectedProject.owner?.name || 'Utilisateur supprimé'}
                  </p>
                </div>
              </div>
              <button
                onClick={closeTodosModal}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Statistiques */}
            {projectTodos.length > 0 && (
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                <div className="grid grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{projectTodos.length}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Total</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {projectTodos.filter(todo => todo.completed).length}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Terminées</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                      {projectTodos.filter(todo => !todo.completed).length}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">En cours</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {projectTodos.filter(todo => !todo.completed && isOverdue(todo.dueDate)).length}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">En retard</div>
                  </div>
                </div>
                
                {/* Barre de progression */}
                <div className="relative w-full bg-gray-200 dark:bg-gray-600 rounded-full h-4">
                  <div 
                    className="bg-green-500 h-4 rounded-full transition-all duration-300" 
                    style={{ width: `${projectTodos.length > 0 ? (projectTodos.filter(todo => todo.completed).length / projectTodos.length) * 100 : 0}%` }}
                  ></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-semibold text-white mix-blend-difference">
                      {projectTodos.length > 0 ? Math.round((projectTodos.filter(todo => todo.completed).length / projectTodos.length) * 100) : 0}%
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Contenu */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {loadingTodos ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600 dark:text-gray-400">Chargement des tâches...</span>
                </div>
              ) : projectTodos.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p className="text-gray-500 dark:text-gray-400 text-lg">Aucune tâche trouvée</p>
                  <p className="text-gray-400 dark:text-gray-500">Ce projet ne contient pas encore de tâches</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {projectTodos.map((todo) => (
                    <div
                      key={todo.id}
                      className={`p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border-l-4 ${
                        todo.completed ? 'border-l-green-500' : 
                        isOverdue(todo.dueDate) ? 'border-l-red-500' :
                        todo.priority === 'high' ? 'border-l-red-400' :
                        todo.priority === 'medium' ? 'border-l-yellow-400' :
                        'border-l-blue-400'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                          todo.completed
                            ? 'bg-green-500 border-green-500 text-white'
                            : 'border-gray-300 dark:border-gray-600'
                        }`}>
                          {todo.completed && (
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className={`font-medium ${
                                todo.completed ? 'text-gray-500 dark:text-gray-400 line-through' : 'text-gray-900 dark:text-white'
                              }`}>
                                {todo.title}
                              </h4>
                              
                              {todo.description && (
                                <p className={`mt-1 text-sm ${
                                  todo.completed ? 'text-gray-400 dark:text-gray-500' : 'text-gray-600 dark:text-gray-300'
                                }`}>
                                  {todo.description}
                                </p>
                              )}
                              
                              <div className="flex items-center gap-3 mt-2 flex-wrap">
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(todo.priority)}`}>
                                  {getPriorityLabel(todo.priority)}
                                </span>
                                
                                {todo.category && (
                                  <span 
                                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white"
                                    style={{ backgroundColor: todo.category.color }}
                                  >
                                    <span className="mr-1">{todo.category.emoji || '📁'}</span>
                                    {todo.category.name}
                                  </span>
                                )}

                                {todo.user && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                                    <svg className="w-3 h-3 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    {todo.user.name}
                                  </span>
                                )}
                                
                                {todo.dueDate && (
                                  <span className={`text-xs ${
                                    isOverdue(todo.dueDate) ? 'text-red-600 dark:text-red-400 font-medium' :
                                    new Date(todo.dueDate).toDateString() === new Date().toDateString() ? 'text-orange-600 dark:text-orange-400 font-medium' :
                                    'text-gray-500 dark:text-gray-400'
                                  }`}>
                                    {isOverdue(todo.dueDate) && '⚠️ '}
                                    {new Date(todo.dueDate).toDateString() === new Date().toDateString() ? '📅 Aujourd\'hui' : 
                                     `📅 ${formatDateOnly(todo.dueDate)}`}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {projectTodos.length} tâche{projectTodos.length > 1 ? 's' : ''} au total
              </div>
              <div className="flex space-x-3">
                <Link
                  href={`/todos/${selectedProject.id}?admin=true`}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Gérer le projet
                </Link>
                <button
                  onClick={closeTodosModal}
                  className="inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors text-sm font-medium"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmation de suppression */}
      {showDeleteModal && projectToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Confirmer la suppression
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Êtes-vous sûr de vouloir supprimer le projet <strong>{projectToDelete.name}</strong> ? 
              Cette action supprimera également toutes les tâches associées et est irréversible.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setProjectToDelete(null)
                }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Annuler
              </button>
              <button
                onClick={() => deleteProject(projectToDelete.id)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 