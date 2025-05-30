'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useSocket } from '@/contexts/SocketContext'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Cookies from 'js-cookie'
import toast from 'react-hot-toast'
import Modal from '@/components/Modal'
import ProjectCollaborationModal from '@/components/ProjectCollaborationModal'

export default function ProjectTodosPage() {
  const { user, loading: authLoading } = useAuth()
  const { joinProject, leaveProject } = useSocket()
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const projectId = params.projectId

  // Récupérer les paramètres URL pour le mode admin directement
  const isAdminMode = searchParams.get('admin') === 'true'
  const canEdit = searchParams.get('edit') === 'true'

  const [project, setProject] = useState(null)
  const [todos, setTodos] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showCollabModal, setShowCollabModal] = useState(false)
  const [showEditProjectModal, setShowEditProjectModal] = useState(false)
  
  // États pour les filtres
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterPriority, setFilterPriority] = useState('')
  const [filterCompleted, setFilterCompleted] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  
  // États pour le formulaire d'ajout
  const [newTodo, setNewTodo] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [newPriority, setNewPriority] = useState('medium')
  const [newDueDate, setNewDueDate] = useState('')
  const [newCategoryId, setNewCategoryId] = useState('')

  // États pour la modification du projet
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editColor, setEditColor] = useState('#3B82F6')
  const [editEmoji, setEditEmoji] = useState('📁')

  // États pour l'édition de todos
  const [showEditTodoModal, setShowEditTodoModal] = useState(false)
  const [editingTodo, setEditingTodo] = useState(null)
  const [editTodoTitle, setEditTodoTitle] = useState('')
  const [editTodoDescription, setEditTodoDescription] = useState('')
  const [editTodoPriority, setEditTodoPriority] = useState('medium')
  const [editTodoDueDate, setEditTodoDueDate] = useState('')
  const [editTodoCategoryId, setEditTodoCategoryId] = useState('')

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
    'Éducation & Recherche': ['📚', '🎓', '🔬', '📝', '📖', '🧪', '��', '📑'],
    'Santé & Sport': ['🏋️', '🏃', '⚽', '🏀', '🎾', '🏊', '🧘', '💊'],
    'Maison & Vie': ['🏠', '🛒', '🍔', '🌱', '🧹', '🔑', '🛏️', '🚗'],
    'Voyage & Loisirs': ['✈️', '🏖️', '🎪', '🎵', '🎮', '📷', '🎬', '🎉']
  }

  // Ref pour éviter les logs multiples de navigation
  const navigationLoggedRef = useRef(false)
  const lastLoggedRef = useRef(null)
  const timeoutRef = useRef(null)

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/auth/login')
        return
      }
      
      // Vérifier les permissions pour le mode admin
      if (isAdminMode && !['ADMIN', 'MODERATOR'].includes(user.role)) {
        toast.error('Accès refusé. Permissions insuffisantes pour le mode administrateur.')
        router.push('/projects')
        return
      }
      
      if (projectId) {
        fetchProject()
        fetchTodos()
        fetchCategories()
        
        // Rejoindre la salle du projet via Socket.IO
        joinProject(projectId)
      }
    }
  }, [user, authLoading, router, projectId, joinProject, isAdminMode])

  useEffect(() => {
    if (user && projectId) {
      const timeoutId = setTimeout(() => {
        fetchTodos()
      }, 300)
      return () => clearTimeout(timeoutId)
    }
  }, [searchTerm, filterCategory, filterPriority, filterCompleted, projectId])

  // Écouter les événements Socket.IO pour les mises à jour en temps réel
  useEffect(() => {
    const handleTodoCreated = (event) => {
      const { detail } = event
      if (detail.projectId == projectId) {
        setTodos(prevTodos => [detail.todo, ...prevTodos])
        if (detail.userId !== user?.id) {
          toast.success(`📝 ${detail.userName} a créé une nouvelle tâche: "${detail.todo.title}"`)
        }
      }
    }

    const handleTodoUpdated = (event) => {
      const { detail } = event
      if (detail.projectId == projectId) {
        setTodos(prevTodos => 
          prevTodos.map(todo => 
            todo.id === detail.todo.id ? detail.todo : todo
          )
        )
        if (detail.userId !== user?.id) {
          const action = detail.todo.completed ? 'terminé' : 'mis à jour'
          toast.success(`✅ ${detail.userName} a ${action} la tâche: "${detail.todo.title}"`)
        }
      }
    }

    const handleTodoDeleted = (event) => {
      const { detail } = event
      if (detail.projectId == projectId) {
        setTodos(prevTodos => 
          prevTodos.filter(todo => todo.id !== detail.todoId)
        )
        if (detail.userId !== user?.id) {
          toast.success(`🗑️ ${detail.userName} a supprimé une tâche`)
        }
      }
    }

    const handleCollaboratorAdded = (event) => {
      const { detail } = event
      if (detail.projectId == projectId && detail.userId !== user?.id) {
        // Actualiser les données du projet pour inclure le nouveau collaborateur
        fetchProject()
      }
    }

    // Ajouter les listeners d'événements
    window.addEventListener('todo_created', handleTodoCreated)
    window.addEventListener('todo_updated', handleTodoUpdated)
    window.addEventListener('todo_deleted', handleTodoDeleted)
    window.addEventListener('collaborator_added', handleCollaboratorAdded)

    return () => {
      // Nettoyer les listeners
      window.removeEventListener('todo_created', handleTodoCreated)
      window.removeEventListener('todo_updated', handleTodoUpdated)
      window.removeEventListener('todo_deleted', handleTodoDeleted)
      window.removeEventListener('collaborator_added', handleCollaboratorAdded)
      
      // Quitter la salle du projet
      if (projectId) {
        leaveProject(projectId)
      }
    }
  }, [projectId, user, leaveProject])

  const getAuthHeaders = () => {
    const token = Cookies.get('token')
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }

  const fetchProject = async () => {
    try {
      const url = `/api/projects/${projectId}${isAdminMode ? '?admin=true' : ''}`
      
      const response = await fetch(url, {
        headers: getAuthHeaders()
      })
      
      if (response.ok) {
        const data = await response.json()
        setProject(data)
      } else {
        toast.error('Erreur lors du chargement du projet')
        router.push('/projects')
      }
    } catch (error) {
      console.error('Erreur lors du chargement du projet:', error)
      toast.error('Erreur lors du chargement du projet')
      router.push('/projects')
    }
  }

  const fetchTodos = async () => {
    try {
      const params = new URLSearchParams()
      params.append('projectId', projectId)
      if (searchTerm) params.append('search', searchTerm)
      if (filterCategory) params.append('category', filterCategory)
      if (filterPriority) params.append('priority', filterPriority)
      if (filterCompleted) params.append('completed', filterCompleted)

      const response = await fetch(`/api/todos?${params}`, {
        headers: getAuthHeaders()
      })
      
      if (response.ok) {
        const data = await response.json()
        setTodos(data)
      } else {
        toast.error('Erreur lors du chargement des todos')
      }
    } catch (error) {
      console.error('Erreur lors du chargement des todos:', error)
      toast.error('Erreur lors du chargement des todos')
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories', {
        headers: getAuthHeaders()
      })
      
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error)
    }
  }

  const addTodo = async (e) => {
    e.preventDefault()
    if (!newTodo.trim()) return

    try {
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ 
          title: newTodo,
          description: newDescription,
          priority: newPriority,
          dueDate: newDueDate || null,
          categoryId: newCategoryId ? parseInt(newCategoryId) : null,
          projectId: parseInt(projectId)
        }),
      })
      
      if (response.ok) {
        const todo = await response.json()
        setTodos([todo, ...todos])
        setNewTodo('')
        setNewDescription('')
        setNewPriority('medium')
        setNewDueDate('')
        setNewCategoryId('')
        setShowAddForm(false)
        toast.success('Tâche créée avec succès !')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erreur lors de l\'ajout de la tâche')
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout du todo:', error)
      toast.error('Erreur lors de l\'ajout de la tâche')
    }
  }

  const toggleTodo = async (id, completed) => {
    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ completed: !completed }),
      })
      
      if (response.ok) {
        const updatedTodo = await response.json()
        setTodos(todos.map(todo => 
          todo.id === id ? updatedTodo : todo
        ))
        toast.success('Todo mis à jour !')
      } else {
        toast.error('Erreur lors de la mise à jour')
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du todo:', error)
      toast.error('Erreur lors de la mise à jour')
    }
  }

  const deleteTodo = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce todo ?')) return

    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })
      
      if (response.ok) {
        setTodos(todos.filter(todo => todo.id !== id))
        toast.success('Todo supprimé !')
      } else {
        // Essayer de récupérer le message d'erreur du serveur
        try {
          const errorData = await response.json()
          console.error('Erreur serveur lors de la suppression:', errorData)
          toast.error(errorData.error || `Erreur lors de la suppression (${response.status})`)
        } catch (parseError) {
          console.error('Erreur lors du parsing de la réponse d\'erreur:', parseError)
          toast.error(`Erreur lors de la suppression (${response.status})`)
        }
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du todo:', error)
      toast.error('Erreur de connexion lors de la suppression')
    }
  }

  const openEditTodoModal = (todo) => {
    setEditingTodo(todo)
    setEditTodoTitle(todo.title)
    setEditTodoDescription(todo.description || '')
    setEditTodoPriority(todo.priority)
    setEditTodoDueDate(todo.dueDate ? todo.dueDate.split('T')[0] : '')
    setEditTodoCategoryId(todo.categoryId || '')
    setShowEditTodoModal(true)
  }

  const updateTodo = async (e) => {
    e.preventDefault()
    if (!editTodoTitle.trim() || !editingTodo) return

    try {
      const response = await fetch(`/api/todos/${editingTodo.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          title: editTodoTitle.trim(),
          description: editTodoDescription.trim() || null,
          priority: editTodoPriority,
          dueDate: editTodoDueDate || null,
          categoryId: editTodoCategoryId || null
        })
      })
      
      if (response.ok) {
        const updatedTodo = await response.json()
        setTodos(todos.map(todo => todo.id === updatedTodo.id ? updatedTodo : todo))
        setShowEditTodoModal(false)
        setEditingTodo(null)
        toast.success('Tâche mise à jour avec succès !')
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Erreur lors de la mise à jour')
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du todo:', error)
      toast.error('Erreur lors de la mise à jour')
    }
  }

  const handleLeaveProject = async () => {
    if (!confirm('Êtes-vous sûr de vouloir quitter ce projet ? Vous perdrez l\'accès à toutes les tâches et données associées.')) return

    try {
      const response = await fetch(`/api/projects/${projectId}/leave`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })
      
      if (response.ok) {
        toast.success('Vous avez quitté le projet avec succès')
        router.push('/projects')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erreur lors de la sortie du projet')
      }
    } catch (error) {
      console.error('Erreur lors de la sortie du projet:', error)
      toast.error('Erreur lors de la sortie du projet')
    }
  }

  const openEditProjectModal = () => {
    setEditName(project.name)
    setEditDescription(project.description || '')
    setEditColor(project.color)
    setEditEmoji(project.emoji)
    setShowEditProjectModal(true)
  }

  const updateProject = async (e) => {
    e.preventDefault()
    if (!editName.trim()) return

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: editName,
          description: editDescription,
          color: editColor,
          emoji: editEmoji
        })
      })
      
      if (response.ok) {
        const updatedProject = await response.json()
        setProject(updatedProject)
        setShowEditProjectModal(false)
        toast.success('Projet mis à jour avec succès !')
      } else {
        toast.error('Erreur lors de la mise à jour du projet')
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du projet:', error)
      toast.error('Erreur lors de la mise à jour du projet')
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 'high': return 'Haute'
      case 'medium': return 'Moyenne'
      case 'low': return 'Basse'
      default: return 'Moyenne'
    }
  }

  const isOverdue = (dueDate) => {
    if (!dueDate) return false
    return new Date(dueDate) < new Date() && new Date(dueDate).toDateString() !== new Date().toDateString()
  }

  const formatDate = (dateString) => {
    if (!dateString) return null
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    })
  }

  const getPermissionLabel = (permission) => {
    switch (permission) {
      case 'view': return 'Lecture seule'
      case 'edit': return 'Modification'
      case 'admin': return 'Administration'
      case 'super_admin': return 'Super Admin'
      case 'moderator': return 'Modérateur'
      default: return permission
    }
  }

  const canAddTodos = project && (
    project.permission === 'edit' || 
    project.permission === 'admin' || 
    project.permission === 'super_admin' || 
    project.permission === 'moderator'
  )

  if (authLoading || loading || !project) {
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
          href={project?.isAdminMode ? "/admin/projects" : "/projects"}
          className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mb-4"
        >
          <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {project?.isAdminMode ? "Retour au dashboard admin" : "Retour aux projets"}
        </Link>

        {/* Bannière mode administration */}
        {project?.isAdminMode && (
          <div className={`mb-4 p-4 rounded-lg border-l-4 ${
            project.currentUserRole === 'ADMIN' 
              ? 'bg-red-50 dark:bg-red-900/20 border-red-400 dark:border-red-500' 
              : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-400 dark:border-yellow-500'
          }`}>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {project.currentUserRole === 'ADMIN' ? (
                  <svg className="w-5 h-5 text-red-400 dark:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-yellow-400 dark:text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                )}
              </div>
              <div className="ml-3">
                <p className={`text-sm font-medium ${
                  project.currentUserRole === 'ADMIN' 
                    ? 'text-red-800 dark:text-red-200' 
                    : 'text-yellow-800 dark:text-yellow-200'
                }`}>
                  Mode {project.currentUserRole === 'ADMIN' ? 'Administrateur' : 'Modérateur'} Actif
                </p>
                <p className={`text-xs ${
                  project.currentUserRole === 'ADMIN' 
                    ? 'text-red-600 dark:text-red-300' 
                    : 'text-yellow-600 dark:text-yellow-300'
                }`}>
                  Vous accédez à ce projet avec des privilèges {project.currentUserRole === 'ADMIN' ? 'd\'administration' : 'de modération'}.
                  {!project.isOwner && !project.sharedWith?.some(share => share.userId === user?.id) && 
                    ' Vous n\'êtes pas un collaborateur normal de ce projet.'
                  }
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Header du projet */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden mb-6">
        <div 
          className="h-3"
          style={{ backgroundColor: project.color }}
        ></div>
        
        <div className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex items-start space-x-3 sm:space-x-4 flex-1 min-w-0">
              <span className="text-2xl sm:text-3xl flex-shrink-0">{project.emoji}</span>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white break-words">{project.name}</h1>
                {project.description && (
                  <p className="text-gray-600 dark:text-gray-300 mt-1 text-sm sm:text-base break-words">{project.description}</p>
                )}
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    project.permission === 'admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300' :
                    project.permission === 'super_admin' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
                    project.permission === 'moderator' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                    project.permission === 'edit' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                    'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {getPermissionLabel(project.permission)}
                  </span>
                  
                  {project.sharedWith && project.sharedWith.length > 0 && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                      <svg className="w-3 h-3 mr-1 flex-shrink-0 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span className="hidden sm:inline">{project.sharedWith.length} collaborateur{project.sharedWith.length > 1 ? 's' : ''}</span>
                      <span className="sm:hidden">{project.sharedWith.length}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-1 sm:space-x-2 flex-shrink-0">
              {(project.isOwner || 
                project.permission === 'admin' || 
                project.permission === 'super_admin' || 
                project.permission === 'moderator') && (
                <>
                  <button
                    onClick={openEditProjectModal}
                    className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                    title="Modifier le projet"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  
                  <button
                    onClick={() => setShowCollabModal(true)}
                    className="text-purple-500 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 p-2 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                    title="Gérer la collaboration"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </button>
                </>
              )}
              
              {!project.isOwner && !project.isAdminMode && (
                <button
                  onClick={handleLeaveProject}
                  className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  title="Quitter le projet"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      {todos.length > 0 && (
        <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">📊 Aperçu</h3>
          </div>
          
          <div className="grid grid-cols-4 gap-3 mb-3">
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{todos.length}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Total</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-600 dark:text-green-400">
                {todos.filter(todo => todo.completed).length}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Terminées</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
                {todos.filter(todo => !todo.completed).length}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">En cours</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-red-600 dark:text-red-400">
                {todos.filter(todo => !todo.completed && isOverdue(todo.dueDate)).length}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">En retard</div>
            </div>
          </div>
          
          {/* Barre de progression avec pourcentage intégré */}
          <div className="relative w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
            <div 
              className="bg-green-500 h-4 rounded-full transition-all duration-300" 
              style={{ width: `${todos.length > 0 ? (todos.filter(todo => todo.completed).length / todos.length) * 100 : 0}%` }}
            ></div>
            {/* Pourcentage centré sur toute la barre */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-semibold text-white mix-blend-difference">
                {todos.length > 0 ? Math.round((todos.filter(todo => todo.completed).length / todos.length) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Bouton d'ajout de tâche - séparé des filtres */}
      {canAddTodos && (
        <div className="mb-6 flex items-center justify-end">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className={`w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg ${
              showAddForm 
                ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600' 
                : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800'
            }`}
          >
            {showAddForm ? (
              <>
                <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>Annuler</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="text-white">Nouvelle tâche</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Barre de recherche et filtres */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
        {/* Header avec titre et bouton mobile pour les filtres */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Recherche & Filtres
          </h2>
          
          {/* Bouton mobile pour afficher/masquer les filtres */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden inline-flex items-center justify-center px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200"
          >
            <svg className={`w-4 h-4 mr-1 transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            <span className="text-sm">Filtres</span>
          </button>
        </div>
        
        {/* Filtres - toujours visibles sur desktop, conditionnels sur mobile */}
        <div className={`p-4 ${showFilters ? 'block' : 'hidden md:block'}`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher..."
                className="w-full pl-10 pr-3 py-2.5 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700"
            >
              <option value="">🏷️ Toutes les catégories</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.emoji || '📁'} {category.name}
                </option>
              ))}
            </select>
            
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700"
            >
              <option value="">⚡ Toutes les priorités</option>
              <option value="high">🔴 Haute</option>
              <option value="medium">🟡 Moyenne</option>
              <option value="low">🟢 Basse</option>
            </select>
            
            <select
              value={filterCompleted}
              onChange={(e) => setFilterCompleted(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700"
            >
              <option value="">📋 Tous les statuts</option>
              <option value="false">⏳ À faire</option>
              <option value="true">✅ Terminé</option>
            </select>
          </div>
          
          {/* Reset filters button */}
          {(searchTerm || filterCategory || filterPriority || filterCompleted) && (
            <div className="mt-3 flex justify-end">
              <button
                onClick={() => {
                  setSearchTerm('')
                  setFilterCategory('')
                  setFilterPriority('')
                  setFilterCompleted('')
                }}
                className="inline-flex items-center justify-center px-3 py-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-all duration-200"
              >
                <svg className="w-3 h-3 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Effacer tous les filtres
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Formulaire d'ajout en modal */}
      <Modal
        isOpen={showAddForm}
        onClose={() => setShowAddForm(false)}
        title="✨ Nouvelle tâche"
        description={`Créez une nouvelle tâche dans le projet "${project.name}"`}
        size="large"
      >
        <form onSubmit={addTodo} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">📝 Titre *</label>
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              placeholder="Titre de la tâche..."
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">📄 Description</label>
            <textarea
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Description optionnelle..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">⚡ Priorité</label>
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="low">🟢 Basse</option>
                <option value="medium">🟡 Moyenne</option>
                <option value="high">🔴 Haute</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">📅 Date d'échéance</label>
              <input
                type="date"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">🏷️ Catégorie</label>
              <select
                value={newCategoryId}
                onChange={(e) => setNewCategoryId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Aucune catégorie</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.emoji || '📁'} {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex gap-2 pt-4 border-t border-gray-100 dark:border-gray-700">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
            >
              <svg className="w-4 h-4 inline mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Créer la tâche
            </button>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
            >
              <svg className="w-4 h-4 inline mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Annuler
            </button>
          </div>
        </form>
      </Modal>

      {/* Liste des todos */}
      <div className="space-y-3">
        {todos.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
            <svg className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-gray-500 dark:text-gray-400 text-lg">Aucune tâche trouvée</p>
            <p className="text-gray-400 dark:text-gray-500">
              {searchTerm || filterCategory || filterPriority || filterCompleted 
                ? 'Essayez de modifier vos filtres' 
                : canAddTodos ? 'Ajoutez votre première tâche' : 'Ce projet ne contient pas encore de tâches'}
            </p>
            {canAddTodos && !searchTerm && !filterCategory && !filterPriority && !filterCompleted && (
              <button
                onClick={() => setShowAddForm(true)}
                className="mt-4 inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
              >
                <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="hidden md:inline">Créer une tâche</span>
                <span className="md:hidden">Créer</span>
              </button>
            )}
          </div>
        ) : (
          todos.map((todo) => (
            <div
              key={todo.id}
              className={`p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border-l-4 hover:shadow-md transition-shadow ${
                todo.completed ? 'border-l-green-500' : 
                isOverdue(todo.dueDate) ? 'border-l-red-500' :
                todo.priority === 'high' ? 'border-l-red-400' :
                todo.priority === 'medium' ? 'border-l-yellow-400' :
                'border-l-blue-400'
              }`}
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => toggleTodo(todo.id, todo.completed)}
                  className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                    todo.completed
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'border-gray-300 dark:border-gray-600 hover:border-green-500'
                  }`}
                >
                  {todo.completed && (
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className={`font-medium ${
                        todo.completed ? 'text-gray-500 dark:text-gray-400 line-through' : 'text-gray-900 dark:text-white'
                      }`}>
                        {todo.title}
                      </h3>
                      
                      {todo.description && (
                        <p className={`mt-1 text-sm ${
                          todo.completed ? 'text-gray-400 dark:text-gray-500' : 'text-gray-600 dark:text-gray-300'
                        }`}>
                          {todo.description}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-3 mt-2">
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

                        {/* Créateur si différent */}
                        {todo.user.id !== user.id && (
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
                             `📅 ${formatDate(todo.dueDate)}`}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-2 flex-shrink-0">
                      {/* Bouton d'édition selon les permissions */}
                      {todo.canEdit && (
                        <button
                          onClick={() => openEditTodoModal(todo)}
                          className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 p-1"
                          title="Modifier cette tâche"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      )}
                      
                      {/* Bouton de suppression selon les permissions */}
                      {todo.canDelete && (
                        <button
                          onClick={() => deleteTodo(todo.id)}
                          className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1"
                          title="Supprimer cette tâche"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de collaboration */}
      <ProjectCollaborationModal
        isOpen={showCollabModal}
        onClose={() => setShowCollabModal(false)}
        project={project}
      />

      {/* Modal de modification du projet */}
      <Modal
        isOpen={showEditProjectModal}
        onClose={() => setShowEditProjectModal(false)}
        title="✏️ Modifier le projet"
        description="Modifiez les informations de votre projet"
        size="large"
      >
        <form onSubmit={updateProject} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">📝 Nom du projet *</label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Ex: Site web e-commerce"
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">📄 Description</label>
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
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
                      onClick={() => setEditColor(color)}
                      className={`w-8 h-8 rounded-full border-2 transition-all duration-200 hover:scale-110 ${
                        editColor === color ? 'border-gray-800 dark:border-gray-200 shadow-lg' : 'border-gray-300 dark:border-gray-600 hover:border-gray-500 dark:hover:border-gray-400'
                      }`}
                      style={{ backgroundColor: color }}
                      title={`Couleur ${color}`}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={editColor}
                    onChange={(e) => setEditColor(e.target.value)}
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
                            onClick={() => setEditEmoji(emoji)}
                            className={`w-8 h-8 rounded border transition-all duration-200 hover:scale-110 ${
                              editEmoji === emoji 
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
                  <span className="text-2xl">{editEmoji}</span>
                  <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">({editName || 'Projet'})</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2 pt-4 border-t border-gray-100 dark:border-gray-700">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
            >
              <svg className="w-4 h-4 inline mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Mettre à jour le projet
            </button>
            <button
              type="button"
              onClick={() => setShowEditProjectModal(false)}
              className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
            >
              <svg className="w-4 h-4 inline mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Annuler
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal d'édition de todo */}
      <Modal
        isOpen={showEditTodoModal}
        onClose={() => setShowEditTodoModal(false)}
        title="✏️ Modifier la tâche"
        description="Modifiez les informations de votre tâche"
        size="large"
      >
        <form onSubmit={updateTodo} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">📝 Titre *</label>
            <input
              type="text"
              value={editTodoTitle}
              onChange={(e) => setEditTodoTitle(e.target.value)}
              placeholder="Titre de la tâche..."
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">📄 Description</label>
            <textarea
              value={editTodoDescription}
              onChange={(e) => setEditTodoDescription(e.target.value)}
              placeholder="Description optionnelle..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">⚡ Priorité</label>
              <select
                value={editTodoPriority}
                onChange={(e) => setEditTodoPriority(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="low">🟢 Basse</option>
                <option value="medium">🟡 Moyenne</option>
                <option value="high">🔴 Haute</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">📅 Date d'échéance</label>
              <input
                type="date"
                value={editTodoDueDate}
                onChange={(e) => setEditTodoDueDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">🏷️ Catégorie</label>
              <select
                value={editTodoCategoryId}
                onChange={(e) => setEditTodoCategoryId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Aucune catégorie</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.emoji || '📁'} {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex gap-2 pt-4 border-t border-gray-100 dark:border-gray-700">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
            >
              <svg className="w-4 h-4 inline mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Mettre à jour la tâche
            </button>
            <button
              type="button"
              onClick={() => setShowEditTodoModal(false)}
              className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
            >
              <svg className="w-4 h-4 inline mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Annuler
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
} 