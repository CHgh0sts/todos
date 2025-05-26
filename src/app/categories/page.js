'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Cookies from 'js-cookie'
import toast from 'react-hot-toast'
import Modal from '@/components/Modal'

export default function CategoriesPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState('#3B82F6')
  const [newEmoji, setNewEmoji] = useState('📁')

  const colors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
  ]

  const emojiGroups = {
    'Dossiers & Organisation': ['📁', '💼', '📂', '🗂️', '📋', '📊'],
    'Maison & Vie': ['🏠', '🛒', '🍔', '💡', '🔧', '🌱'],
    'Travail & Études': ['💻', '📚', '🎓', '📝', '💰', '📱'],
    'Loisirs & Sport': ['🎨', '🎵', '🎮', '🏋️', '🏃', '🎪'],
    'Objectifs & Succès': ['🎯', '🏆', '⚡', '🌟', '🔥', '🚀'],
    'Émotions & Divers': ['❤️', '💎', '✈️', '��', '🌈', '🎉']
  }

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/auth/login')
        return
      }
      fetchCategories()
    }
  }, [user, authLoading, router])

  const getAuthHeaders = () => {
    const token = Cookies.get('token')
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
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
      } else {
        toast.error('Erreur lors du chargement des catégories')
      }
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error)
      toast.error('Erreur lors du chargement des catégories')
    } finally {
      setLoading(false)
    }
  }

  const addCategory = async (e) => {
    e.preventDefault()
    if (!newName.trim()) return

    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ 
          name: newName,
          color: newColor,
          emoji: newEmoji
        }),
      })
      
      if (response.ok) {
        const category = await response.json()
        setCategories([...categories, category])
        setNewName('')
        setNewColor('#3B82F6')
        setNewEmoji('📁')
        setShowAddForm(false)
        toast.success('Catégorie ajoutée avec succès !')
      } else {
        toast.error('Erreur lors de l\'ajout de la catégorie')
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la catégorie:', error)
      toast.error('Erreur lors de l\'ajout de la catégorie')
    }
  }

  const updateCategory = async (e) => {
    e.preventDefault()
    if (!newName.trim() || !editingCategory) return

    try {
      const response = await fetch(`/api/categories/${editingCategory.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ 
          name: newName,
          color: newColor,
          emoji: newEmoji
        }),
      })
      
      if (response.ok) {
        const updatedCategory = await response.json()
        setCategories(categories.map(cat => 
          cat.id === editingCategory.id ? updatedCategory : cat
        ))
        setEditingCategory(null)
        setNewName('')
        setNewColor('#3B82F6')
        setNewEmoji('📁')
        setShowAddForm(false)
        toast.success('Catégorie mise à jour !')
      } else {
        toast.error('Erreur lors de la mise à jour')
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la catégorie:', error)
      toast.error('Erreur lors de la mise à jour')
    }
  }

  const deleteCategory = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ? Les todos associés ne seront pas supprimés.')) return

    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })
      
      if (response.ok) {
        setCategories(categories.filter(cat => cat.id !== id))
        toast.success('Catégorie supprimée !')
      } else {
        toast.error('Erreur lors de la suppression')
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de la catégorie:', error)
      toast.error('Erreur lors de la suppression')
    }
  }

  const startEdit = (category) => {
    setEditingCategory(category)
    setNewName(category.name)
    setNewColor(category.color)
    setNewEmoji(category.emoji)
    setShowAddForm(true)
  }

  const cancelEdit = () => {
    setEditingCategory(null)
    setNewName('')
    setNewColor('#3B82F6')
    setNewEmoji('📁')
    setShowAddForm(false)
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
        
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Mes Catégories</h1>
        <p className="text-gray-600 dark:text-gray-300">Organisez vos todos avec des catégories colorées</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="mb-4 sm:mb-0">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">🏷️ Gestion des catégories</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {categories.length === 0 
                ? 'Commencez par créer votre première catégorie' 
                : `${categories.length} catégorie${categories.length > 1 ? 's' : ''} créée${categories.length > 1 ? 's' : ''}`
              }
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className={`inline-flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              showAddForm 
                ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600' 
                : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg'
            }`}
          >
            {showAddForm ? (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Annuler
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {editingCategory ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Formulaire d'ajout/modification en modal */}
      <Modal
        isOpen={showAddForm}
        onClose={cancelEdit}
        title={editingCategory ? '✏️ Modifier la catégorie' : '✨ Nouvelle catégorie'}
        description={editingCategory 
          ? 'Modifiez les informations de votre catégorie' 
          : 'Créez une nouvelle catégorie pour organiser vos todos'
        }
        size="large"
      >
        <form onSubmit={editingCategory ? updateCategory : addCategory} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Colonne gauche - Informations de base */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  📝 Nom de la catégorie *
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ex: Travail, Personnel, Courses..."
                  required
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                />
              </div>
              
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
                <div className="mt-3 flex items-center justify-center p-2 bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">
                  <span className="text-sm text-gray-600 dark:text-gray-300 mr-2">Emoji sélectionné :</span>
                  <span className="text-2xl">{newEmoji}</span>
                  <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">({newName || 'Catégorie'})</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
            <button
              type="submit"
              className="flex-1 sm:flex-none bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
            >
              {editingCategory ? (
                <>
                  <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Modifier
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Créer la catégorie
                </>
              )}
            </button>
            <button
              type="button"
              onClick={cancelEdit}
              className="flex-1 sm:flex-none bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 font-medium"
            >
              <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Annuler
            </button>
          </div>
        </form>
      </Modal>

      {/* Liste des catégories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
            <svg className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <p className="text-gray-500 dark:text-gray-400 text-lg">Aucune catégorie</p>
            <p className="text-gray-400 dark:text-gray-500">Créez votre première catégorie pour organiser vos todos</p>
          </div>
        ) : (
          categories.map((category) => (
            <div
              key={category.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border-l-4 p-4 hover:shadow-md transition-shadow"
              style={{ borderLeftColor: category.color }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="text-lg">{category.emoji || '📁'}</span>
                  <h3 className="font-medium text-gray-900 dark:text-white">{category.name}</h3>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => startEdit(category)}
                    className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 p-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => deleteCategory(category.id)}
                    className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {category._count?.todos || 0} todo(s)
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  )
} 