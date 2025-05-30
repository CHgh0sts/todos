'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Cookies from 'js-cookie'
import toast from 'react-hot-toast'
import Modal from '@/components/Modal'

export default function ProfilePage() {
  const { user, loading: authLoading, refreshUser } = useAuth()
  const { theme, changeTheme } = useTheme()
  const router = useRouter()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showApiKeyModal, setShowApiKeyModal] = useState(false)
  const [editName, setEditName] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editTheme, setEditTheme] = useState('system')
  const [updateLoading, setUpdateLoading] = useState(false)
  
  // États pour le changement de mot de passe
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)
  
  // États pour la gestion des clés API
  const [apiKey, setApiKey] = useState('')
  const [apiKeyLoading, setApiKeyLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  // États pour l'utilisation de l'API
  const [apiUsage, setApiUsage] = useState(null)
  const [apiUsageLoading, setApiUsageLoading] = useState(true)

  // États pour l'image de profil
  const [profileImageLoading, setProfileImageLoading] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/auth/login')
        return
      }
      fetchStats()
      fetchApiUsage()
      // Initialiser les valeurs du formulaire
      setEditName(user.name)
      setEditEmail(user.email)
      setEditTheme(user.theme || 'system')
    }
  }, [user, authLoading, router])

  const getAuthHeaders = () => {
    const token = Cookies.get('token')
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/user/stats', { 
        headers: getAuthHeaders() 
      })
      
      if (response.ok) {
        const stats = await response.json()
        setStats(stats)
      } else {
        console.error('Erreur lors du chargement des statistiques:', response.status)
        toast.error('Erreur lors du chargement des statistiques')
      }
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error)
      toast.error('Erreur lors du chargement des statistiques')
    } finally {
      setLoading(false)
    }
  }

  const fetchApiUsage = async () => {
    try {
      const response = await fetch('/api/user/api-usage', { 
        headers: getAuthHeaders() 
      })
      
      if (response.ok) {
        const usage = await response.json()
        setApiUsage(usage)
      } else {
        console.error('Erreur lors du chargement de l\'utilisation API:', response.status)
        // Ne pas afficher d'erreur si l'utilisateur n'a pas de clé API
        if (response.status !== 404) {
          toast.error('Erreur lors du chargement de l\'utilisation API')
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'utilisation API:', error)
    } finally {
      setApiUsageLoading(false)
    }
  }

  const fetchApiKey = async () => {
    try {
      const response = await fetch('/api/developer/api-key', {
        headers: getAuthHeaders()
      })
      
      if (response.ok) {
        const data = await response.json()
        setApiKey(data.apiKey || '')
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de la clé API:', error)
    }
  }

  const generateApiKey = async () => {
    setApiKeyLoading(true)
    try {
      const response = await fetch('/api/developer/api-key', {
        method: 'POST',
        headers: getAuthHeaders()
      })

      if (response.ok) {
        const data = await response.json()
        setApiKey(data.apiKey)
        toast.success('Clé API générée avec succès !')
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Erreur lors de la génération de la clé API')
      }
    } catch (error) {
      toast.error('Erreur de connexion')
    } finally {
      setApiKeyLoading(false)
    }
  }

  const regenerateApiKey = async () => {
    if (!confirm('Êtes-vous sûr de vouloir régénérer votre clé API ? L\'ancienne clé ne fonctionnera plus.')) {
      return
    }

    setApiKeyLoading(true)
    try {
      const response = await fetch('/api/developer/api-key', {
        method: 'PUT',
        headers: getAuthHeaders()
      })

      if (response.ok) {
        const data = await response.json()
        setApiKey(data.apiKey)
        toast.success('Clé API régénérée avec succès !')
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Erreur lors de la régénération de la clé API')
      }
    } catch (error) {
      toast.error('Erreur de connexion')
    } finally {
      setApiKeyLoading(false)
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(apiKey)
      setCopied(true)
      toast.success('Clé API copiée dans le presse-papiers')
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Erreur lors de la copie:', error)
      toast.error('Erreur lors de la copie')
    }
  }

  const handleImageUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    // Vérifier le type de fichier
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Type de fichier non supporté. Utilisez JPG, PNG ou WebP.')
      return
    }

    // Vérifier la taille (max 5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      toast.error('Le fichier est trop volumineux. Taille maximum : 5MB.')
      return
    }

    setProfileImageLoading(true)

    try {
      const formData = new FormData()
      formData.append('profileImage', file)

      const response = await fetch('/api/user/profile-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Cookies.get('token')}`
        },
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        toast.success('Image de profil mise à jour avec succès !')
        // Rafraîchir les données utilisateur
        await refreshUser()
        setImagePreview(null)
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Erreur lors de l\'upload')
      }
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error)
      toast.error('Erreur de connexion')
    } finally {
      setProfileImageLoading(false)
      // Reset l'input file
      event.target.value = ''
    }
  }

  const handleImageDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer votre image de profil ?')) {
      return
    }

    setProfileImageLoading(true)

    try {
      const response = await fetch('/api/user/profile-image', {
        method: 'DELETE',
        headers: getAuthHeaders()
      })

      if (response.ok) {
        toast.success('Image de profil supprimée avec succès !')
        await refreshUser()
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Erreur lors de la suppression')
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      toast.error('Erreur de connexion')
    } finally {
      setProfileImageLoading(false)
    }
  }

  const handleImagePreview = (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const updateProfile = async (e) => {
    e.preventDefault()
    if (!editName.trim() || !editEmail.trim()) {
      toast.error('Veuillez remplir tous les champs')
      return
    }

    setUpdateLoading(true)
    try {
      const response = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: editName.trim(),
          email: editEmail.trim(),
          theme: editTheme
        })
      })

      if (response.ok) {
        const updatedUser = await response.json()
        toast.success('Profil mis à jour avec succès !')
        setShowEditModal(false)
        
        // Synchroniser le thème avec le contexte
        changeTheme(editTheme)
        
        // Rafraîchir les données utilisateur dans le contexte
        refreshUser()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erreur lors de la mise à jour')
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error)
      toast.error('Erreur lors de la mise à jour du profil')
    } finally {
      setUpdateLoading(false)
    }
  }

  const updatePassword = async (e) => {
    e.preventDefault()
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Veuillez remplir tous les champs')
      return
    }
    
    if (newPassword !== confirmPassword) {
      toast.error('Les nouveaux mots de passe ne correspondent pas')
      return
    }
    
    if (newPassword.length < 6) {
      toast.error('Le nouveau mot de passe doit contenir au moins 6 caractères')
      return
    }

    setPasswordLoading(true)
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      })

      if (response.ok) {
        toast.success('Mot de passe modifié avec succès !')
        setShowPasswordModal(false)
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erreur lors de la modification du mot de passe')
      }
    } catch (error) {
      console.error('Erreur lors de la modification du mot de passe:', error)
      toast.error('Erreur lors de la modification du mot de passe')
    } finally {
      setPasswordLoading(false)
    }
  }

  const openEditModal = () => {
    setEditName(user.name)
    setEditEmail(user.email)
    setEditTheme(user.theme || 'system')
    setShowEditModal(true)
  }

  const closeEditModal = () => {
    setShowEditModal(false)
    setEditName(user.name)
    setEditEmail(user.email)
    setEditTheme(user.theme || 'system')
  }

  const openPasswordModal = () => {
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setShowPasswordModal(true)
  }

  const closePasswordModal = () => {
    setShowPasswordModal(false)
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
  }

  const openApiKeyModal = () => {
    setShowApiKeyModal(true)
    fetchApiKey()
  }

  const closeApiKeyModal = () => {
    setShowApiKeyModal(false)
    setApiKey('')
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <Link 
          href="/projects" 
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
        >
          <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Retour aux projets
        </Link>
        
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Mon Profil</h1>
        <p className="text-gray-600 dark:text-gray-300">Informations personnelles et statistiques</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informations utilisateur */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 sticky top-20">
            <div className="text-center">
              {/* Image de profil avec upload */}
              <div className="relative w-20 h-20 mx-auto mb-4 group">
                {user.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt="Photo de profil"
                    className="w-20 h-20 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                  />
                ) : (
                  <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                
                {/* Overlay pour l'upload */}
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer">
                  <label htmlFor="profile-image-upload" className="cursor-pointer">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </label>
                </div>
                
                {/* Input file caché */}
                <input
                  id="profile-image-upload"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={(e) => {
                    handleImagePreview(e)
                    handleImageUpload(e)
                  }}
                  className="hidden"
                  disabled={profileImageLoading}
                />
                
                {/* Indicateur de chargement */}
                {profileImageLoading && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>
                )}
              </div>
              
              {/* Boutons d'action pour l'image */}
              {user.profileImage && (
                <div className="flex justify-center space-x-2 mb-4">
                  <button
                    onClick={handleImageDelete}
                    disabled={profileImageLoading}
                    className="px-3 py-1 text-xs bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-full hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors duration-200 disabled:opacity-50"
                  >
                    Supprimer
                  </button>
                </div>
              )}
              
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{user.name}</h2>
              <p className="text-gray-600 dark:text-gray-300">{user.email}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Membre depuis le {formatDate(user.createdAt)}
              </p>
            </div>
            
            {/* Boutons d'actions */}
            <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700 space-y-3">
              <button
                onClick={openEditModal}
                className="w-full flex items-center justify-center px-4 py-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors duration-200 font-medium text-sm border border-blue-200 dark:border-blue-800"
              >
                <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Modifier mes informations
              </button>
              
              <button
                onClick={openPasswordModal}
                className="w-full flex items-center justify-center px-4 py-3 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors duration-200 font-medium text-sm border border-orange-200 dark:border-orange-800"
              >
                <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Modifier le mot de passe
              </button>
              
              <button
                onClick={openApiKeyModal}
                className="w-full flex items-center justify-center px-4 py-3 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors duration-200 font-medium text-sm border border-purple-200 dark:border-purple-800"
              >
                <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                Gérer les clés API
              </button>
            </div>
          </div>
        </div>

        {/* Statistiques */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">📊 Statistiques</h3>
            
            {stats && (
              <div className="space-y-6">
                {/* Statistiques principales */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.totalTodos}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Total todos</div>
                  </div>
                  
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.completed}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Terminés</div>
                  </div>
                  
                  <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.pending}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">En cours</div>
                </div>
                
                  <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.overdue}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">En retard</div>
                </div>
                
                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.highPriority}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Priorité haute</div>
                </div>
                
                  <div className="text-center p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{stats.totalCategories}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Catégories</div>
                  </div>
                </div>
                
                {/* Nouvelle ligne pour les projets */}
                <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                  <div className="text-center p-4 bg-teal-50 dark:bg-teal-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-teal-600 dark:text-teal-400">{stats.totalProjects}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Projets accessibles</div>
                  </div>
                </div>
                
                {/* Todos récents */}
                {stats.recentTodos && stats.recentTodos.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4">🕒 Todos récents</h4>
                    <div className="space-y-2">
                      {stats.recentTodos.map((todo) => (
                        <div key={todo.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div 
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: todo.project?.color || '#3B82F6' }}
                            />
                            <div>
                              <div className={`font-medium ${todo.completed ? 'line-through text-gray-500' : 'text-gray-900 dark:text-white'}`}>
                                {todo.title}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {todo.project?.emoji} {todo.project?.name}
                                {todo.category && ` • ${todo.category.name}`}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {todo.priority === 'high' && (
                              <span className="px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 text-xs rounded-full">
                                Haute
                              </span>
                            )}
                            {todo.completed ? (
                              <span className="text-green-500">✓</span>
                            ) : (
                              <span className="text-gray-400">○</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Graphique de progression */}
      {stats && stats.totalTodos > 0 && (
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Progression</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-1">
                <span>Tâches terminées</span>
                <span>{Math.round((stats.completed / stats.totalTodos) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(stats.completed / stats.totalTodos) * 100}%` }}
                />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-1">
                <span>Tâches en cours</span>
                <span>{Math.round((stats.pending / stats.totalTodos) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(stats.pending / stats.totalTodos) * 100}%` }}
                />
              </div>
            </div>
            
            {stats.overdue > 0 && (
              <div>
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-1">
                  <span>Tâches en retard</span>
                  <span>{Math.round((stats.overdue / stats.totalTodos) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-red-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(stats.overdue / stats.totalTodos) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Actions rapides */}
      <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Actions rapides</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/projects"
            className="flex items-center p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <svg className="w-8 h-8 text-blue-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <div>
              <div className="font-medium text-gray-900 dark:text-white">Gérer mes projets</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Voir et modifier vos projets</div>
            </div>
          </Link>
          
          <Link
            href="/categories"
            className="flex items-center p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <svg className="w-8 h-8 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <div>
              <div className="font-medium text-gray-900 dark:text-white">Mes catégories</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Organiser vos todos</div>
            </div>
          </Link>
          
          <button
            onClick={() => window.location.reload()}
            className="flex items-center p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <svg className="w-8 h-8 text-purple-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <div>
              <div className="font-medium text-gray-900 dark:text-white">Actualiser</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Mettre à jour les données</div>
            </div>
          </button>
        </div>
      </div>

      {/* Utilisation de l'API */}
      <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <svg className="w-5 h-5 mr-2 flex-shrink-0 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Utilisation de l'API
          </h3>
          <Link
            href="/api"
            className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium"
          >
            Documentation →
          </Link>
        </div>

        {apiUsageLoading ? (
          <div className="flex items-center justify-center py-8">
            <svg className="animate-spin h-8 w-8 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : apiUsage ? (
          <div className="space-y-6">
            {/* Plan et utilisation */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Plan actuel */}
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-purple-900 dark:text-purple-300">Plan {apiUsage.plan.name}</h4>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    apiUsage.plan.type === 'pro' 
                      ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {apiUsage.plan.type === 'pro' ? 'PRO' : 'GRATUIT'}
                  </span>
                </div>
                <ul className="text-sm text-purple-700 dark:text-purple-300 space-y-1 mb-4">
                  {apiUsage.plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <svg className="w-4 h-4 mr-2 flex-shrink-0 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/pricing"
                  className="w-full flex items-center justify-center px-3 py-2 bg-purple-100 dark:bg-purple-800 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-700 transition-colors duration-200 text-sm font-medium"
                >
                  <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-4 4" />
                  </svg>
                  Voir tous les plans
                </Link>
              </div>

              {/* Utilisation API externe */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-3">Utilisation de l'API</h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-blue-700 dark:text-blue-300">Requêtes utilisées</span>
                      <span className="font-medium text-blue-900 dark:text-blue-200">
                        {apiUsage.usage.current.toLocaleString()} / {apiUsage.usage.limit.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          apiUsage.usage.percentage > 80 ? 'bg-red-500' : 
                          apiUsage.usage.percentage > 60 ? 'bg-orange-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${Math.min(apiUsage.usage.percentage, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-blue-600 dark:text-blue-400 mt-1">
                      <span>{apiUsage.usage.percentage.toFixed(1)}% utilisé</span>
                      <span>{apiUsage.usage.remaining.toLocaleString()} restantes</span>
                    </div>
                  </div>
                  <div className="text-xs text-blue-600 dark:text-blue-400">
                    Réinitialisation le {new Date(apiUsage.usage.resetDate).toLocaleDateString('fr-FR')}
                  </div>
                </div>
              </div>
            </div>

            {/* Statistiques détaillées */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {apiUsage.statistics.totalRequests.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Total requêtes</div>
              </div>
              
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {apiUsage.statistics.averageResponseTime}ms
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Temps moyen</div>
              </div>
              
              <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {apiUsage.rateLimit.requestsPerMinute}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Limite/min</div>
              </div>
              
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {apiUsage.statistics.totalRequests > 0 ? 
                    Math.round(((apiUsage.statistics.responseCodes['200'] || 0) / apiUsage.statistics.totalRequests) * 100) : 0}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Taux de succès</div>
              </div>
            </div>

            {/* Endpoints les plus utilisés */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Endpoints API */}
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                  <svg className="w-4 h-4 mr-2 flex-shrink-0 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3" />
                  </svg>
                  Endpoints les plus utilisés
                </h4>
                <div className="space-y-2">
                  {apiUsage.statistics.topEndpoints.length > 0 ? apiUsage.statistics.topEndpoints.map((endpoint, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center space-x-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded ${
                          endpoint.method === 'GET' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                          endpoint.method === 'POST' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                          'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
                        }`}>
                          {endpoint.method}
                        </span>
                        <code className="text-sm font-mono text-gray-700 dark:text-gray-300">
                          {endpoint.endpoint}
                        </code>
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {endpoint.requests.toLocaleString()}
                      </span>
                    </div>
                  )) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3" />
                      </svg>
                      <p>Aucune requête API encore</p>
                      <p className="text-sm">Commencez à utiliser votre clé API</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Codes de réponse */}
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                  <svg className="w-4 h-4 mr-2 flex-shrink-0 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Codes de réponse
                </h4>
                <div className="space-y-2">
                  {Object.keys(apiUsage.statistics.responseCodes).length > 0 ? Object.entries(apiUsage.statistics.responseCodes).map(([code, count]) => (
                    <div key={code} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded ${
                          code.startsWith('2') ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                          code.startsWith('4') ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300' :
                          'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                        }`}>
                          {code}
                        </span>
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {code === '200' ? 'Succès' :
                           code === '201' ? 'Créé' :
                           code === '400' ? 'Requête invalide' :
                           code === '401' ? 'Non autorisé' :
                           code === '500' ? 'Erreur serveur' : 'Autre'}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {count.toLocaleString()}
                      </span>
                    </div>
                  )) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <p>Aucune donnée disponible</p>
                      <p className="text-sm">Les statistiques apparaîtront après utilisation</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Graphique des 7 derniers jours */}
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                <svg className="w-4 h-4 mr-2 flex-shrink-0 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Utilisation des 7 derniers jours
              </h4>
              <div className="grid grid-cols-7 gap-2">
                {apiUsage.statistics.last7Days.map((day, index) => {
                  const maxRequests = Math.max(...apiUsage.statistics.last7Days.map(d => d.requests))
                  const height = maxRequests > 0 ? (day.requests / maxRequests) * 100 : 0
                  
                  // Créer une date UTC à partir de la chaîne de date
                  const dateUTC = new Date(day.date + 'T00:00:00.000Z')
                  
                  // Vérifier si c'est aujourd'hui
                  const today = new Date()
                  const todayUTC = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()))
                  const isToday = dateUTC.getTime() === todayUTC.getTime()
                  
                  // Affichage conditionnel
                  let displayText
                  let tooltipText
                  
                  if (isToday) {
                    displayText = "Aujourd'hui"
                    tooltipText = `Aujourd'hui - ${day.requests} requêtes`
                  } else {
                    // Format "Lun 14/05"
                    const dayName = dateUTC.toLocaleDateString('fr-FR', { 
                      weekday: 'short',
                      timeZone: 'UTC'
                    })
                    const dayMonth = dateUTC.toLocaleDateString('fr-FR', { 
                      day: '2-digit',
                      month: '2-digit',
                      timeZone: 'UTC'
                    })
                    
                    // Capitaliser la première lettre du jour
                    const capitalizedDayName = dayName.charAt(0).toUpperCase() + dayName.slice(1)
                    displayText = `${capitalizedDayName} ${dayMonth}`
                    tooltipText = `${capitalizedDayName} ${dayMonth} - ${day.requests} requêtes`
                  }
                  
                  return (
                    <div key={index} className="text-center">
                      <div className="h-20 flex items-end justify-center mb-2">
                        <div 
                          className="w-8 bg-indigo-500 rounded-t transition-all duration-300 hover:bg-indigo-600"
                          style={{ height: `${Math.max(height, 5)}%` }}
                          title={tooltipText}
                        />
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-300 mb-1">
                        {displayText}
                      </div>
                      <div className="text-xs font-medium text-gray-900 dark:text-white">
                        {day.requests}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1721 9z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Aucune clé API trouvée
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
              Créez une clé API pour commencer à utiliser l'API CollabWave et voir vos statistiques d'utilisation.
            </p>
            <button
              onClick={openApiKeyModal}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl font-medium"
            >
              <svg className="w-5 h-5 md:mr-2 flex-shrink-0 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="hidden md:inline">Créer une clé API</span>
            </button>
          </div>
        )}
      </div>

      {/* Modal de modification du profil */}
      <Modal
        isOpen={showEditModal}
        onClose={closeEditModal}
        title="✏️ Modifier mes informations"
        description="Mettez à jour votre nom et votre adresse email"
        size="default"
      >
        <form onSubmit={updateProfile} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              👤 Nom complet *
            </label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Votre nom complet"
              required
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
              disabled={updateLoading}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              ✉️ Adresse email *
            </label>
            <input
              type="email"
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
              placeholder="votre@email.com"
              required
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
              disabled={updateLoading}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              🎨 Thème de l'interface
            </label>
            <select
              value={editTheme}
              onChange={(e) => setEditTheme(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm bg-white"
              disabled={updateLoading}
            >
              <option value="system">🖥️ Automatique (système)</option>
              <option value="light">☀️ Clair</option>
              <option value="dark">🌙 Sombre</option>
            </select>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Le thème automatique suit les préférences de votre système d'exploitation
            </p>
          </div>
          
          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
            <button
              type="submit"
              disabled={updateLoading}
              className="flex-1 sm:flex-none bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updateLoading ? (
                <>
                  <svg className="w-4 h-4 inline mr-2 flex-shrink-0 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Mise à jour...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 inline mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Enregistrer
                </>
              )}
            </button>
            <button
              type="button"
              onClick={closeEditModal}
              disabled={updateLoading}
              className="flex-1 sm:flex-none bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4 inline mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Annuler
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal de modification du mot de passe */}
      <Modal
        isOpen={showPasswordModal}
        onClose={closePasswordModal}
        title="🔒 Modifier le mot de passe"
        description="Changez votre mot de passe pour sécuriser votre compte"
        size="default"
      >
        <form onSubmit={updatePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              🔐 Mot de passe actuel *
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Votre mot de passe actuel"
              required
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-sm"
              disabled={passwordLoading}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              🔑 Nouveau mot de passe *
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Votre nouveau mot de passe"
              required
              minLength={6}
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-sm"
              disabled={passwordLoading}
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Le mot de passe doit contenir au moins 6 caractères
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              ✅ Confirmer le nouveau mot de passe *
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirmez votre nouveau mot de passe"
              required
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-sm"
              disabled={passwordLoading}
            />
          </div>
          
          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
            <button
              type="submit"
              disabled={passwordLoading || !currentPassword || !newPassword || !confirmPassword}
              className="flex-1 sm:flex-none bg-gradient-to-r from-orange-600 to-orange-700 text-white px-6 py-3 rounded-lg hover:from-orange-700 hover:to-orange-800 transition-all duration-200 font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {passwordLoading ? (
                <>
                  <svg className="w-4 h-4 inline mr-2 flex-shrink-0 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Modification...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 inline mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Modifier le mot de passe
                </>
              )}
            </button>
            <button
              type="button"
              onClick={closePasswordModal}
              disabled={passwordLoading}
              className="flex-1 sm:flex-none bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4 inline mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Annuler
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal de gestion des clés API */}
      <Modal
        isOpen={showApiKeyModal}
        onClose={closeApiKeyModal}
        title="🔑 Gestion des clés API"
        description="Gérez vos clés API pour intégrer CollabWave dans vos applications"
        size="large"
      >
        <div className="space-y-6">
          {apiKey ? (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                <h4 className="font-semibold text-purple-900 dark:text-purple-300 mb-2 flex items-center">
                  <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                  Votre clé API
                </h4>
                <div className="flex items-center space-x-3">
                  <div className="flex-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 p-3 rounded-lg">
                    <code className="text-sm font-mono text-gray-900 dark:text-white break-all select-all">
                      {apiKey}
                    </code>
                  </div>
                  <button
                    onClick={copyToClipboard}
                    className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 flex items-center space-x-2 shadow-md hover:shadow-lg transform hover:scale-105"
                  >
                    {copied ? (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="font-medium">Copié</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <span className="font-medium">Copier</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
              
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-lg">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div>
                    <h5 className="font-medium text-yellow-800 dark:text-yellow-300 mb-1">Sécurité importante</h5>
                    <ul className="text-sm text-yellow-700 dark:text-yellow-400 space-y-1">
                      <li>• Gardez cette clé secrète et sécurisée</li>
                      <li>• Ne la partagez jamais publiquement</li>
                      <li>• Utilisez HTTPS uniquement</li>
                      <li>• Régénérez-la si elle est compromise</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={regenerateApiKey}
                  disabled={apiKeyLoading}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-all duration-200 text-sm font-medium shadow-sm"
                >
                  {apiKeyLoading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Régénération...
                    </span>
                  ) : (
                    'Régénérer la clé'
                  )}
                </button>
                
                <Link
                  href="/api"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200 text-sm font-medium shadow-sm"
                >
                  Voir la documentation
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1721 9z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Générez votre première clé API
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
                Créez une clé API pour commencer à utiliser l'API CollabWave dans vos applications.
              </p>
              <button
                onClick={generateApiKey}
                disabled={apiKeyLoading}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl font-medium"
              >
                {apiKeyLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="hidden md:inline">Génération en cours...</span>
                  </span>
                ) : (
                  <span className="flex items-center">
                    <svg className="w-5 h-5 md:mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1721 9z" />
                    </svg>
                    <span className="hidden md:inline">Générer une clé API</span>
                  </span>
                )}
              </button>
            </div>
          )}
          
          {/* Actions du modal */}
          <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-700">
            <button
              onClick={closeApiKeyModal}
              className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 font-medium"
            >
              <svg className="w-4 h-4 inline mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Fermer
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
} 