'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useNotificationBadges } from '@/lib/hooks/useNotificationBadges'
import Modal from '@/components/Modal'
import UserAvatar from '@/components/UserAvatar'
import Link from 'next/link'
import Cookies from 'js-cookie'
import toast from 'react-hot-toast'

export default function FriendsPage() {
  const { user, loading: authLoading } = useAuth()
  const { decrementFriends, incrementFriends } = useNotificationBadges()
  const [friends, setFriends] = useState([])
  const [receivedRequests, setReceivedRequests] = useState([])
  const [sentRequests, setSentRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newFriendEmail, setNewFriendEmail] = useState('')
  const [newFriendMessage, setNewFriendMessage] = useState('')
  const [activeTab, setActiveTab] = useState('friends')

  useEffect(() => {
    if (user) {
      fetchFriends()
    }
  }, [user])

  const getAuthHeaders = () => {
    const token = Cookies.get('token')
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }

  const fetchFriends = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/friends', {
        headers: getAuthHeaders()
      })
      
      if (response.ok) {
        const data = await response.json()
        setFriends(data.friends || [])
        setReceivedRequests(data.receivedRequests || [])
        setSentRequests(data.sentRequests || [])
      } else {
        toast.error('Erreur lors du chargement des amis')
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  const sendFriendRequest = async (e) => {
    e.preventDefault()
    if (!newFriendEmail.trim()) return

    try {
      const response = await fetch('/api/friends', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          email: newFriendEmail,
          message: newFriendMessage
        })
      })
      
      if (response.ok) {
        toast.success('Demande d\'ami envoyée!')
        setNewFriendEmail('')
        setNewFriendMessage('')
        setShowAddModal(false)
        fetchFriends()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erreur lors de l\'envoi')
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors de l\'envoi')
    }
  }

  const handleFriendRequest = async (requestId, action) => {
    try {
      const response = await fetch(`/api/friends/${requestId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ action })
      })
      
      if (response.ok) {
        decrementFriends(1)
        toast.success(action === 'accept' ? 'Demande acceptée!' : 'Demande refusée')
        fetchFriends()
      } else {
        toast.error('Erreur lors du traitement')
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors du traitement')
    }
  }

  const removeFriend = async (friendId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet ami ?')) return

    try {
      const response = await fetch(`/api/friends/${friendId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })
      
      if (response.ok) {
        toast.success('Ami supprimé')
        fetchFriends()
      } else {
        toast.error('Erreur lors de la suppression')
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors de la suppression')
    }
  }

  const tabs = [
    { id: 'friends', label: '👥 Mes amis', count: friends.length },
    { id: 'received', label: '📨 Reçues', count: receivedRequests.length },
    { id: 'sent', label: '📤 Envoyées', count: sentRequests.length }
  ]

  if (authLoading || loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-300 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto text-center py-16">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Connexion requise</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">Vous devez être connecté pour voir vos amis</p>
        <Link href="/auth/login" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
          Se connecter
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">👥 Mes Amis</h1>
            <p className="text-gray-600 dark:text-gray-300">Gérez votre réseau d'amis et collaborez sur vos projets</p>
          </div>
          
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
          >
            <svg className="w-5 h-5 md:mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="hidden md:inline">Ajouter un ami</span>
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">📊 Aperçu</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{friends.length}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Amis</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{receivedRequests.length}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Demandes reçues</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{sentRequests.length}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Demandes envoyées</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {friends.length + receivedRequests.length + sentRequests.length}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Total</div>
          </div>
        </div>
      </div>

      {/* Onglets */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="ml-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-300 py-0.5 px-2 rounded-full text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Contenu des onglets */}
      <div className="space-y-6">
        {/* Onglet Mes amis */}
        {activeTab === 'friends' && (
          <div>
            {friends.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
                <svg className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Aucun ami pour le moment</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">Commencez à construire votre réseau !</p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <svg className="w-4 h-4 md:mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="hidden md:inline">Ajouter votre premier ami</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {friends.map((friend) => (
                  <div key={friend.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <UserAvatar user={friend} />
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">{friend.name}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{friend.email}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFriend(friend.id)}
                        className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1"
                        title="Supprimer l'ami"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Onglet Demandes reçues */}
        {activeTab === 'received' && (
          <div>
            {receivedRequests.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
                <svg className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Aucune demande d'ami</h3>
                <p className="text-gray-500 dark:text-gray-400">Les nouvelles demandes d'ami apparaîtront ici</p>
              </div>
            ) : (
              <div className="space-y-4">
                {receivedRequests.map((request) => (
                  <div key={request.id} className="bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <UserAvatar user={request.sender} />
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">{request.sender.name}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{request.sender.email}</p>
                          {request.message && (
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 italic">"{request.message}"</p>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleFriendRequest(request.id, 'accept')}
                          className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                        >
                          Accepter
                        </button>
                        <button
                          onClick={() => handleFriendRequest(request.id, 'reject')}
                          className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                        >
                          Refuser
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Onglet Demandes envoyées */}
        {activeTab === 'sent' && (
          <div>
            {sentRequests.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
                <svg className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Aucune demande envoyée</h3>
                <p className="text-gray-500 dark:text-gray-400">Vos demandes d'ami en attente apparaîtront ici</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sentRequests.map((request) => (
                  <div key={request.id} className="bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-700 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <UserAvatar user={request.receiver} />
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">{request.receiver.name}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{request.receiver.email}</p>
                          {request.message && (
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 italic">"{request.message}"</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300">
                          En attente
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(request.createdAt).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal d'ajout d'ami */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="➕ Ajouter un ami"
        description="Envoyez une demande d'ami à quelqu'un pour commencer à collaborer"
        size="default"
      >
        <form onSubmit={sendFriendRequest} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              📧 Email de votre ami
            </label>
            <input
              type="email"
              value={newFriendEmail}
              onChange={(e) => setNewFriendEmail(e.target.value)}
              placeholder="ami@example.com"
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              💬 Message personnalisé (optionnel)
            </label>
            <textarea
              value={newFriendMessage}
              onChange={(e) => setNewFriendMessage(e.target.value)}
              placeholder="Salut ! On peut devenir amis ?"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Envoyer la demande
            </button>
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
            >
              Annuler
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
} 