'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Cookies from 'js-cookie'
import toast from 'react-hot-toast'
import Modal from '@/components/Modal'
import ProjectCollaborationModal from '@/components/ProjectCollaborationModal'
import UserAvatar from '@/components/UserAvatar'
import { withMaintenanceCheck } from '@/lib/withMaintenanceCheck'

function ProjectsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [maxProjectsPerUser, setMaxProjectsPerUser] = useState(10) // Valeur par défaut
  
  // États pour la collaboration
  const [showCollaborationModal, setShowCollaborationModal] = useState(false)
  const [selectedProject, setSelectedProject] = useState(null)
  
  // États pour le formulaire de création
  const [newName, setNewName] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [newColor, setNewColor] = useState('#3B82F6')
  const [newEmoji, setNewEmoji] = useState('📁')

  // Couleurs prédéfinies
  const colors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
  ]

  // Groupes d'emojis organisés
  const emojiGroups = {
    'Projets & Organisation': ['📁', '💼', '📂', '🗂️', '📋', '📊', '🎯', '🚀'],
    'Développement & Tech': ['💻', '📱', '⚙️', '🔧', '🖥️', '📡', '🔌', '💾'],
    'Design & Créatif': ['🎨', '🖌️', '✏️', '📐', '🎭', '🌈', '💡', '✨'],
    'Business & Finance': ['💰', '📈', '💳', '🏦', '📊', '💼', '🤝', '📞'],
    'Éducation & Recherche': ['📚', '🎓', '🔬', '📝', '📖', '🧪', '🔍', '📑'],
    'Santé & Sport': ['🏋️', '🏃', '⚽', '🏀', '🎾', '🏊', '🧘', '💊'],
    'Maison & Vie': ['🏠', '🛒', '🍔', '🌱', '🧹', '🔑', '🛏️', '🚗'],
    'Voyage & Loisirs': ['✈️', '🏖️', '🎪', '🎵', '🎮', '📷', '🎬', '🎉']
  }

  useEffect(() => {
    console.log('🔍 [Projects Page] useEffect déclenché:', { 
      authLoading, 
      user: user ? `${user.name} (${user.id})` : 'null',
      pathname: window.location.pathname
    })
    
    if (authLoading) {
      console.log('⏳ [Projects Page] Authentification en cours...')
      return
    }
    
    if (!user) {
      console.log('❌ [Projects Page] Utilisateur non connecté, redirection vers login')
      router.push('/auth/login')
      return
    }
    
    console.log('✅ [Projects Page] Utilisateur connecté, récupération des projets')
    fetchProjects()
    fetchSystemSettings()
  }, [user, authLoading, router])

  const getAuthHeaders = () => {
    const token = Cookies.get('token')
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }

  const fetchSystemSettings = async () => {
    try {
      console.log('🔍 [Projects Page] Récupération des paramètres système')
      
      const token = Cookies.get('token')
      if (!token) return
      
      const response = await fetch('/api/admin/settings', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.settings) {
          setMaxProjectsPerUser(data.settings.maxProjectsPerUser || 10)
          console.log('✅ [Projects Page] Limite de projets récupérée:', data.settings.maxProjectsPerUser)
        }
      } else {
        console.log('⚠️ [Projects Page] Impossible de récupérer les paramètres système')
      }
    } catch (error) {
      console.error('❌ [Projects Page] Erreur lors de la récupération des paramètres:', error)
    }
  }

  const fetchProjects = async () => {
    try {
      console.log('🔍 [Projects Page] Début de la récupération des projets')
      
      const token = Cookies.get('token')
      if (!token) {
        console.error('❌ [Projects Page] Token manquant dans les cookies')
        toast.error('Session expirée, veuillez vous reconnecter')
        router.push('/auth/login')
        return
      }
      
      console.log('✅ [Projects Page] Token trouvé, longueur:', token.length)
      
      const response = await fetch(`/api/projects`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      })
      
      console.log('✅ [Projects Page] Réponse reçue:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('✅ [Projects Page] Projets récupérés avec succès:', { count: data.length })
        setProjects(data)
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Erreur inconnue' }))
        console.error('❌ [Projects Page] Erreur de l\'API:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        })
        
        if (response.status === 401) {
          console.log('🔄 [Projects Page] Token expiré, tentative de rafraîchissement')
          // Attendre un peu avant de rediriger pour éviter les redirections en boucle
          setTimeout(() => {
            toast.error('Session expirée, veuillez vous reconnecter')
            router.push('/auth/login')
          }, 1000)
        } else if (response.status === 500) {
          toast.error(`Erreur serveur: ${errorData.error || 'Erreur interne'}`)
        } else if (response.status === 503) {
          toast.error('Service temporairement indisponible, veuillez réessayer')
        } else {
          toast.error(`Erreur lors du chargement des projets: ${errorData.error || 'Erreur inconnue'}`)
        }
      }
    } catch (error) {
      console.error('❌ [Projects Page] Erreur lors du chargement des projets:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      })
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        toast.error('Erreur de connexion au serveur, vérifiez votre connexion')
      } else {
        toast.error('Erreur lors du chargement des projets')
      }
    } finally {
      setLoading(false)
    }
  }

  const createProject = async (e) => {
    e.preventDefault()
    if (!newName.trim()) return

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ 
          name: newName,
          description: newDescription,
          color: newColor,
          emoji: newEmoji
        }),
      })
      
      if (response.ok) {
        const project = await response.json()
        setProjects([project, ...projects])
        setNewName('')
        setNewDescription('')
        setNewColor('#3B82F6')
        setNewEmoji('📁')
        setShowCreateForm(false)
        toast.success('Projet créé avec succès !')
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Erreur inconnue' }))
        
        if (response.status === 403 && errorData.error?.includes('Limite atteinte')) {
          toast.error(errorData.error)
        } else {
          toast.error('Erreur lors de la création du projet')
        }
      }
    } catch (error) {
      console.error('Erreur lors de la création du projet:', error)
      toast.error('Erreur lors de la création du projet')
    }
  }

  const deleteProject = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce projet ? Tous les todos seront supprimés.')) return

    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })
      
      if (response.ok) {
        setProjects(projects.filter(project => project.id !== id))
        toast.success('Projet supprimé !')
      } else {
        toast.error('Erreur lors de la suppression')
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du projet:', error)
      toast.error('Erreur lors de la suppression')
    }
  }

  const getPermissionLabel = (permission) => {
    switch (permission) {
      case 'view': return 'Lecture'
      case 'edit': return 'Modification'
      case 'admin': return 'Admin'
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

  const openCollaborationModal = (project) => {
    setSelectedProject(project)
    setShowCollaborationModal(true)
  }

  const closeCollaborationModal = () => {
    setShowCollaborationModal(false)
    setSelectedProject(null)
    // Recharger les projets pour mettre à jour les informations de partage
    fetchProjects()
  }

  if (authLoading || loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-300 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <Link 
          href="/" 
          className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mb-4"
        >
          <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Retour à l'accueil
        </Link>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Mes Projets</h1>
            <p className="text-gray-600 dark:text-gray-300">Organisez vos tâches par projets et collaborez avec votre équipe</p>
          </div>
          
          <button
            onClick={() => setShowCreateForm(true)}
            disabled={projects.filter(project => project.isOwner).length >= maxProjectsPerUser}
            className={`inline-flex items-center px-6 py-3 rounded-lg transition-all duration-200 font-medium shadow-md hover:shadow-lg ${
              projects.filter(project => project.isOwner).length >= maxProjectsPerUser
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800'
            }`}
            title={
              projects.filter(project => project.isOwner).length >= maxProjectsPerUser
                ? `Limite atteinte (${maxProjectsPerUser} projets maximum)`
                : 'Créer un nouveau projet'
            }
          >
            <svg className="w-5 h-5 md:mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="hidden md:inline">
              {projects.filter(project => project.isOwner).length >= maxProjectsPerUser
                ? 'Limite atteinte'
                : 'Nouveau projet'
              }
            </span>
          </button>
        </div>
      </div>

      {/* Statistiques */}
      {projects.length > 0 && (
        <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">📊 Aperçu</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{projects.length}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Projets totaux</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {projects.filter(project => project.isOwner).length}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Mes projets</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {projects.filter(project => !project.isOwner).length}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Partagés</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {projects.reduce((total, project) => total + (project._count?.todos || 0), 0)}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Todos totaux</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${
                (maxProjectsPerUser - projects.filter(project => project.isOwner).length) > 0 
                  ? 'text-emerald-600 dark:text-emerald-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {maxProjectsPerUser - projects.filter(project => project.isOwner).length}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Restants ({maxProjectsPerUser} max)
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Liste des projets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.length === 0 ? (
          <div className="col-span-full">
            <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg">
              <svg className="w-20 h-20 text-gray-400 dark:text-gray-500 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">Aucun projet</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">Créez votre premier projet pour commencer à organiser vos tâches</p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <svg className="w-5 h-5 md:mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="hidden md:inline">Créer un projet</span>
              </button>
            </div>
          </div>
        ) : (
          projects.map((project) => (
            <div
              key={project.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col"
            >
              {/* Header avec couleur */}
              <div 
                className="h-3"
                style={{ backgroundColor: project.color }}
              ></div>
              
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{project.emoji}</span>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{project.name}</h3>
                      {project.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{project.description}</p>
                      )}
                    </div>
                  </div>
                  
                  {project.isOwner && (
                    <button
                      onClick={() => deleteProject(project.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors p-1"
                      title="Supprimer le projet"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Indicateurs */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {!project.isOwner && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPermissionColor(project.permission)}`}>
                        {getPermissionLabel(project.permission)}
                      </span>
                    )}
                    
                    {project.sharedWith && project.sharedWith.length > 0 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                        <svg className="w-3 h-3 mr-1 flex-shrink-0 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {project.sharedWith.length}
                      </span>
                    )}
                  </div>
                  
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {project._count?.todos || 0} todos
                  </div>
                </div>

                {/* Info propriétaire si pas le sien */}
                {!project.isOwner && (
                  <div className="mb-4 pb-4 border-b border-gray-100 dark:border-gray-700">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">Créé par</span>
                      <UserAvatar user={project.user} size="sm" />
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{project.user.name}</span>
                    </div>
                  </div>
                )}

                {/* Spacer pour pousser les actions vers le bas */}
                <div className="flex-1"></div>

                {/* Actions - toujours en bas */}
                <div className="flex space-x-3 mt-auto">
                  <Link
                    href={`/todos/${project.id}`}
                    className="flex-1 inline-flex items-center justify-center bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <span className="ml-2">Voir les todos</span>
                  </Link>
                  
                  {(project.isOwner || project.permission === 'admin') && (
                    <button
                      onClick={() => openCollaborationModal(project)}
                      className="inline-flex items-center justify-center bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                      title="Gérer les collaborateurs"
                    >
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className="ml-2">Collaborer</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de création */}
      <Modal
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        title="🚀 Nouveau projet"
        description="Créez un nouveau projet pour organiser vos tâches"
        size="large"
      >
        <form onSubmit={createProject} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">📝 Nom du projet *</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Ex: Site web e-commerce"
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">📄 Description</label>
            <textarea
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Description optionnelle du projet..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Colonne gauche - Couleur */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                🎨 Couleur
              </label>
              <div className="space-y-3">
                <div className="flex gap-2 flex-wrap">
                  {colors.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewColor(color)}
                      className={`w-8 h-8 rounded-full border-2 transition-all duration-200 hover:scale-110 ${
                        newColor === color ? 'border-gray-800 dark:border-gray-200 shadow-lg' : 'border-gray-300 dark:border-gray-600 hover:border-gray-500 dark:hover:border-gray-400'
                      }`}
                      style={{ backgroundColor: color }}
                      title={`Couleur ${color}`}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={newColor}
                    onChange={(e) => setNewColor(e.target.value)}
                    className="w-12 h-8 border border-gray-200 dark:border-gray-600 rounded cursor-pointer"
                  />
                  <span className="text-xs text-gray-500 dark:text-gray-400">Ou choisissez une couleur personnalisée</span>
                </div>
              </div>
            </div>

            {/* Colonne droite - Emoji */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                😊 Emoji
              </label>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-800">
                  {Object.entries(emojiGroups).map(([groupName, emojis]) => (
                    <div key={groupName} className="mb-3 last:mb-0">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium uppercase tracking-wide">{groupName}</p>
                      <div className="flex gap-1 flex-wrap">
                        {emojis.map(emoji => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => setNewEmoji(emoji)}
                            className={`w-8 h-8 rounded border transition-all duration-200 hover:scale-110 ${
                              newEmoji === emoji 
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md' 
                                : 'border-gray-200 dark:border-gray-600 hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                            }`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-3 flex items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-300 mr-2">Emoji sélectionné :</span>
                  <span className="text-2xl">{newEmoji}</span>
                  <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">({newName || 'Projet'})</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2 pt-4 border-t border-gray-100 dark:border-gray-700">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
            >
              Créer le projet
            </button>
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
            >
              Annuler
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal de collaboration */}
      <ProjectCollaborationModal
        isOpen={showCollaborationModal}
        onClose={closeCollaborationModal}
        project={selectedProject}
      />
    </div>
  )
}

export default withMaintenanceCheck(ProjectsPage) 