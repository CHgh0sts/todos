'use client'

import { useState, useEffect } from 'react'
import Modal from '@/components/Modal'
import Cookies from 'js-cookie'
import toast from 'react-hot-toast'

export default function ProjectCollaborationModal({ isOpen, onClose, project }) {
  const [collaborators, setCollaborators] = useState([])
  const [invitations, setInvitations] = useState([])
  const [friends, setFriends] = useState([])
  const [shareLinks, setShareLinks] = useState([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('collaborators')
  
  // États pour les modals d'invitation
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [showFriendsModal, setShowFriendsModal] = useState(false)
  const [showLinkModal, setShowLinkModal] = useState(false)
  
  // États pour l'invitation par email
  const [inviteEmail, setInviteEmail] = useState('')
  const [invitePermission, setInvitePermission] = useState('view')
  const [inviteMessage, setInviteMessage] = useState('')
  
  // États pour l'invitation d'amis
  const [selectedFriends, setSelectedFriends] = useState([])
  const [friendsPermission, setFriendsPermission] = useState('view')
  
  // États pour les liens de partage
  const [linkPermission, setLinkPermission] = useState('view')
  const [linkExpiresAt, setLinkExpiresAt] = useState('')
  const [linkMaxUses, setLinkMaxUses] = useState('')

  // États pour le changement de permissions
  const [changingPermission, setChangingPermission] = useState(null)

  useEffect(() => {
    if (isOpen && project) {
      fetchCollaborators()
      fetchFriends()
      fetchShareLinks()
    }
  }, [isOpen, project])

  const getAuthHeaders = () => {
    const token = Cookies.get('token')
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }

  const fetchCollaborators = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/projects/${project.id}/share`, {
        headers: getAuthHeaders()
      })
      
      if (response.ok) {
        const data = await response.json()
        setCollaborators(data.shares || [])
        setInvitations(data.invitations || [])
      }
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchFriends = async () => {
    try {
      const response = await fetch('/api/friends', {
        headers: getAuthHeaders()
      })
      
      if (response.ok) {
        const data = await response.json()
        setFriends(data.friends || [])
      }
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const fetchShareLinks = async () => {
    try {
      const response = await fetch(`/api/projects/${project.id}/share-links`, {
        headers: getAuthHeaders()
      })
      
      if (response.ok) {
        const data = await response.json()
        setShareLinks(data.shareLinks || [])
      }
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const sendEmailInvitation = async (e) => {
    e.preventDefault()
    if (!inviteEmail.trim()) return

    try {
      const response = await fetch(`/api/projects/${project.id}/share`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          email: inviteEmail,
          permission: invitePermission,
          message: inviteMessage
        })
      })
      
      if (response.ok) {
        toast.success('Invitation envoyée avec succès!')
        setInviteEmail('')
        setInviteMessage('')
        setInvitePermission('view')
        setShowEmailModal(false)
        fetchCollaborators()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erreur lors de l\'envoi de l\'invitation')
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors de l\'envoi')
    }
  }

  const inviteFriends = async () => {
    if (selectedFriends.length === 0) return

    try {
      const selectedFriendsData = friends.filter(friend => 
        selectedFriends.includes(friend.id)
      )

      const promises = selectedFriendsData.map(friend => 
        fetch(`/api/projects/${project.id}/share`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            email: friend.email,
            permission: friendsPermission
          })
        })
      )

      const results = await Promise.all(promises)
      
      let successful = 0
      let errors = []
      
      for (let i = 0; i < results.length; i++) {
        const result = results[i]
        const friend = selectedFriendsData[i]
        
        if (result.ok) {
          successful++
        } else {
          const errorData = await result.json()
          errors.push(`${friend.name}: ${errorData.error || 'Erreur inconnue'}`)
        }
      }
      
      if (successful > 0) {
        toast.success(`${successful} ami(s) invité(s) avec succès!`)
        setSelectedFriends([])
        setFriendsPermission('view')
        setShowFriendsModal(false)
        fetchCollaborators()
      }
      
      if (errors.length > 0) {
        toast.error(`Erreurs: ${errors.join(', ')}`)
      }
      
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors de l\'invitation')
    }
  }

  const createShareLink = async (e) => {
    e.preventDefault()

    try {
      const response = await fetch(`/api/projects/${project.id}/share-links`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          permission: linkPermission,
          expiresAt: linkExpiresAt || null,
          maxUses: linkMaxUses ? parseInt(linkMaxUses) : null
        })
      })
      
      if (response.ok) {
        toast.success('Lien de partage créé avec succès!')
        setLinkPermission('view')
        setLinkExpiresAt('')
        setLinkMaxUses('')
        setShowLinkModal(false)
        fetchShareLinks()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erreur lors de la création du lien')
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors de la création')
    }
  }

  const copyShareLink = (linkId) => {
    const url = `${window.location.protocol}//${window.location.host}/share/${linkId}`
    navigator.clipboard.writeText(url)
    toast.success('Lien copié dans le presse-papiers!')
  }

  const deleteShareLink = async (linkId) => {
    try {
      const response = await fetch(`/api/share-links/${linkId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })
      
      if (response.ok) {
        toast.success('Lien de partage supprimé')
        fetchShareLinks()
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors de la suppression')
    }
  }

  const removeCollaborator = async (shareId) => {
    if (!confirm('Êtes-vous sûr de vouloir retirer cet utilisateur du projet ?')) return

    try {
      const response = await fetch(`/api/project-shares/${shareId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })
      
      if (response.ok) {
        toast.success('Collaborateur retiré')
        fetchCollaborators()
      } else {
        toast.error('Erreur lors de la suppression')
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors de la suppression')
    }
  }

  const cancelInvitation = async (invitationId) => {
    try {
      const response = await fetch(`/api/invitations/${invitationId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })
      
      if (response.ok) {
        toast.success('Invitation annulée')
        fetchCollaborators()
      } else {
        toast.error('Erreur lors de l\'annulation')
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors de l\'annulation')
    }
  }

  const changeCollaboratorPermission = async (shareId, newPermission) => {
    try {
      setChangingPermission(shareId)
      const response = await fetch(`/api/project-shares/${shareId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          permission: newPermission
        })
      })
      
      if (response.ok) {
        toast.success('Permissions mises à jour')
        fetchCollaborators()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erreur lors de la mise à jour')
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors de la mise à jour')
    } finally {
      setChangingPermission(null)
    }
  }

  const getPermissionLabel = (permission) => {
    switch (permission) {
      case 'view': return 'Lecture'
      case 'edit': return 'Modification'
      case 'admin': return 'Administration'
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

  const tabs = [
    { id: 'collaborators', label: '👥 Équipe', count: collaborators.length + invitations.length },
    { id: 'invite', label: '➕ Inviter', count: null },
    { id: 'links', label: '🔗 Liens', count: shareLinks.length }
  ]

  if (!project) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`👥 Collaboration - ${project.name}`}
      description="Gérez les collaborateurs, invitez des amis ou créez des liens de partage"
      size="large"
    >
      <div className="space-y-6">
        {/* Onglets - Responsive */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-2 sm:space-x-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors min-w-fit ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                {tab.count !== null && (
                  <span className="ml-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-300 py-0.5 px-2 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Contenu des onglets */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Chargement...</p>
          </div>
        ) : (
          <>
            {/* Onglet Équipe */}
            {activeTab === 'collaborators' && (
              <div className="space-y-6">
                {/* Propriétaire */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    👑 Propriétaire
                  </h4>
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {project.user.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 break-all">
                          {project.user.email}
                        </div>
                      </div>
                      <span className="self-start sm:self-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                        Propriétaire
                      </span>
                    </div>
                  </div>
                </div>

                {/* Collaborateurs */}
                {collaborators.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      👥 Collaborateurs ({collaborators.length})
                    </h4>
                    <div className="space-y-2">
                      {collaborators.map((share) => (
                        <div key={share.id} className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-3">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div className="flex-1">
                              <div className="font-medium text-gray-900 dark:text-white">
                                {share.user.name}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400 break-all">
                                {share.user.email}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                              {/* Sélecteur de permissions */}
                              {(project.isOwner || project.permission === 'admin') ? (
                                <div className="relative">
                                  <select
                                    value={share.permission}
                                    onChange={(e) => changeCollaboratorPermission(share.id, e.target.value)}
                                    disabled={changingPermission === share.id}
                                    className={`px-2 py-1 rounded-full text-xs font-medium border-0 focus:ring-2 focus:ring-blue-500 cursor-pointer disabled:opacity-50 ${getPermissionColor(share.permission)}`}
                                  >
                                    <option value="view">Lecture</option>
                                    <option value="edit">Modification</option>
                                    <option value="admin">Administration</option>
                                  </select>
                                  {changingPermission === share.id && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                      <div className="animate-spin rounded-full h-3 w-3 border border-gray-400 border-t-transparent"></div>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPermissionColor(share.permission)}`}>
                                  {getPermissionLabel(share.permission)}
                                </span>
                              )}
                              
                              {/* Bouton supprimer */}
                              {(project.isOwner || project.permission === 'admin') && (
                                <button
                                  onClick={() => removeCollaborator(share.id)}
                                  className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                  title="Retirer du projet"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Invitations en attente */}
                {invitations.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      ⏳ Invitations en attente ({invitations.length})
                    </h4>
                    <div className="space-y-2">
                      {invitations.map((invitation) => (
                        <div key={invitation.id} className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-700 p-3">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div className="flex-1">
                              <div className="font-medium text-gray-900 dark:text-white break-all">
                                {invitation.email}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                Invité par {invitation.sender.name}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPermissionColor(invitation.permission)}`}>
                                {getPermissionLabel(invitation.permission)}
                              </span>
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                                En attente
                              </span>
                              <button
                                onClick={() => cancelInvitation(invitation.id)}
                                className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                title="Annuler l'invitation"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Message si aucun collaborateur */}
                {collaborators.length === 0 && invitations.length === 0 && (
                  <div className="text-center py-8">
                    <svg className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <p className="text-gray-500 dark:text-gray-400">Ce projet n'a pas encore de collaborateurs</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500">Utilisez l'onglet "Inviter" pour ajouter des collaborateurs</p>
                  </div>
                )}
              </div>
            )}

            {/* Onglet Inviter */}
            {activeTab === 'invite' && (
              <div className="space-y-6">
                {/* Méthodes d'invitation - Responsive Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Invitation par email */}
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <span className="text-2xl">📧</span>
                      </div>
                      <h3 className="font-medium text-gray-900 dark:text-white mb-2">Invitation par email</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Invitez quelqu'un par son adresse email</p>
                      <button
                        onClick={() => setShowEmailModal(!showEmailModal)}
                        className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        Inviter par email
                      </button>
                    </div>
                  </div>

                  {/* Invitation d'amis */}
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <span className="text-2xl">👥</span>
                      </div>
                      <h3 className="font-medium text-gray-900 dark:text-white mb-2">Inviter des amis</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Invitez vos amis déjà connectés</p>
                      <button
                        onClick={() => setShowFriendsModal(!showFriendsModal)}
                        className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                      >
                        Inviter des amis
                      </button>
                    </div>
                  </div>

                  {/* Création de lien */}
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 sm:col-span-2 lg:col-span-1">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <span className="text-2xl">🔗</span>
                      </div>
                      <h3 className="font-medium text-gray-900 dark:text-white mb-2">Lien de partage</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Créez un lien que vous pouvez partager</p>
                      <button
                        onClick={() => setShowLinkModal(!showLinkModal)}
                        className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                      >
                        Créer un lien
                      </button>
                    </div>
                  </div>
                </div>

                {/* Formulaire d'invitation par email */}
                {showEmailModal && (
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-blue-50 dark:bg-blue-900/10">
                    <h3 className="font-medium text-gray-900 dark:text-white mb-4">📧 Invitation par email</h3>
                    <form onSubmit={sendEmailInvitation} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Adresse email
                        </label>
                        <input
                          type="email"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                          placeholder="exemple@email.com"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Permissions
                        </label>
                        <select
                          value={invitePermission}
                          onChange={(e) => setInvitePermission(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          <option value="view">Lecture seule</option>
                          <option value="edit">Modification</option>
                          <option value="admin">Administration</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Message personnalisé (optionnel)
                        </label>
                        <textarea
                          value={inviteMessage}
                          onChange={(e) => setInviteMessage(e.target.value)}
                          placeholder="Ajoutez un message personnalisé..."
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                        />
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-2">
                        <button
                          type="submit"
                          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                          Envoyer l'invitation
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowEmailModal(false)}
                          className="flex-1 sm:flex-none bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
                        >
                          Annuler
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Formulaire d'invitation d'amis */}
                {showFriendsModal && (
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-green-50 dark:bg-green-900/10">
                    <h3 className="font-medium text-gray-900 dark:text-white mb-4">👥 Inviter des amis</h3>
                    
                    {friends.length === 0 ? (
                      <p className="text-gray-500 dark:text-gray-400 text-sm">
                        Vous n'avez pas encore d'amis ajoutés. Ajoutez des amis depuis la page dédiée.
                      </p>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Permissions pour les amis invités
                          </label>
                          <select
                            value={friendsPermission}
                            onChange={(e) => setFriendsPermission(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          >
                            <option value="view">Lecture seule</option>
                            <option value="edit">Modification</option>
                            <option value="admin">Administration</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Sélectionnez les amis à inviter
                          </label>
                          <div className="max-h-40 overflow-y-auto space-y-2 border border-gray-200 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700">
                            {friends.map((friend) => (
                              <label key={friend.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-600 rounded cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={selectedFriends.includes(friend.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedFriends([...selectedFriends, friend.id])
                                    } else {
                                      setSelectedFriends(selectedFriends.filter(id => id !== friend.id))
                                    }
                                  }}
                                  className="rounded border-gray-300 dark:border-gray-600 text-green-600 focus:ring-green-500"
                                />
                                <div className="flex-1">
                                  <div className="font-medium text-gray-900 dark:text-white text-sm">
                                    {friend.name}
                                  </div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400 break-all">
                                    {friend.email}
                                  </div>
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-2">
                          <button
                            onClick={inviteFriends}
                            disabled={selectedFriends.length === 0}
                            className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                          >
                            Inviter {selectedFriends.length > 0 ? `(${selectedFriends.length})` : ''}
                          </button>
                          <button
                            onClick={() => setShowFriendsModal(false)}
                            className="flex-1 sm:flex-none bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
                          >
                            Annuler
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Formulaire de création de lien */}
                {showLinkModal && (
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-purple-50 dark:bg-purple-900/10">
                    <h3 className="font-medium text-gray-900 dark:text-white mb-4">🔗 Créer un lien de partage</h3>
                    <form onSubmit={createShareLink} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Permissions
                        </label>
                        <select
                          value={linkPermission}
                          onChange={(e) => setLinkPermission(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          <option value="view">Lecture seule</option>
                          <option value="edit">Modification</option>
                          <option value="admin">Administration</option>
                        </select>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Date d'expiration (optionnel)
                          </label>
                          <input
                            type="datetime-local"
                            value={linkExpiresAt}
                            onChange={(e) => setLinkExpiresAt(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Utilisation max (optionnel)
                          </label>
                          <input
                            type="number"
                            value={linkMaxUses}
                            onChange={(e) => setLinkMaxUses(e.target.value)}
                            placeholder="Illimité"
                            min="1"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-2">
                        <button
                          type="submit"
                          className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                        >
                          Créer le lien
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowLinkModal(false)}
                          className="flex-1 sm:flex-none bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
                        >
                          Annuler
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            )}

            {/* Onglet Liens */}
            {activeTab === 'links' && (
              <div className="space-y-4">
                {shareLinks.length === 0 ? (
                  <div className="text-center py-8">
                    <svg className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.1a3 3 0 10-4.243-4.243l-1.102 1.1a1 1 0 00-1.414 1.414l1.1-1.1a5 5 0 017.072 7.072l-1.1 1.1a1 1 0 00-1.414-1.414l1.1-1.1a3 3 0 10-4.243-4.243l1.102 1.1a3 3 0 004.243 4.243l1.102-1.1a5 5 0 000-7.072l-4-4zM8 12a1 1 0 100-2 1 1 0 000 2z" />
                    </svg>
                    <p className="text-gray-500 dark:text-gray-400">Aucun lien de partage créé</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500">Utilisez l'onglet "Inviter" pour créer des liens</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {shareLinks.map((link) => (
                      <div key={link.id} className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPermissionColor(link.permission)}`}>
                                {getPermissionLabel(link.permission)}
                              </span>
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                Créé par {link.user.name}
                              </span>
                            </div>
                            
                            <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                              <div>Utilisé: {link.usedCount}/{link.maxUses || '∞'} fois</div>
                              {link.expiresAt && (
                                <div>
                                  Expire: {new Date(link.expiresAt).toLocaleString('fr-FR')}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => copyShareLink(link.id)}
                              className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                              <span className="hidden sm:inline">Copier</span>
                            </button>
                            <button
                              onClick={() => deleteShareLink(link.id)}
                              className="flex items-center gap-1 bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              <span className="hidden sm:inline">Supprimer</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </Modal>
  )
} 