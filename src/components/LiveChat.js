'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useSocket } from '@/contexts/SocketContext'
import { usePathname } from 'next/navigation'
import Cookies from 'js-cookie'

export default function LiveChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [chatSession, setChatSession] = useState(null)
  const [sessionStatus, setSessionStatus] = useState('WAITING')
  const [showContextForm, setShowContextForm] = useState(true)
  const [contextData, setContextData] = useState({
    subject: '',
    category: '',
    priority: 'Normale',
    description: '',
    userEmail: '',
    userPhone: '',
    firstName: '',
    lastName: ''
  })
  const [hasUsedChat, setHasUsedChat] = useState(false)
  const [unreadMessages, setUnreadMessages] = useState(0)
  const [showBadge, setShowBadge] = useState(true)
  const [badgeAutoHideTimer, setBadgeAutoHideTimer] = useState(null)
  const messagesEndRef = useRef(null)
  const chatRef = useRef(null)
  
  const { user } = useAuth()
  const { socket, isConnected: socketConnected } = useSocket()
  const currentPath = usePathname()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Pré-remplir l'email si l'utilisateur est connecté
    if (user && user.email) {
      setContextData(prev => ({
        ...prev,
        userEmail: user.email
      }))
    }
  }, [user])

  // Gestion de la persistance du badge et auto-masquage
  useEffect(() => {
    // Vérifier si l'utilisateur a déjà utilisé le chat
    const chatUsed = localStorage.getItem('collabwave_chat_used')
    if (chatUsed === 'true') {
      setHasUsedChat(true)
    }

    // Timer d'auto-masquage du badge (30 secondes après le chargement de la page)
    const timer = setTimeout(() => {
      if (!hasUsedChat && !chatSession) {
        setShowBadge(false)
      }
    }, 30000) // 30 secondes

    setBadgeAutoHideTimer(timer)

    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [hasUsedChat, chatSession])

  useEffect(() => {
    // Écouter l'événement personnalisé pour ouvrir le chat
    const handleOpenChat = () => {
      setIsOpen(true)
      setIsMinimized(false)
      markChatAsUsed()
      resetUnreadMessages()
    }
    
    window.addEventListener('openLiveChat', handleOpenChat)
    
    return () => {
      window.removeEventListener('openLiveChat', handleOpenChat)
    }
  }, [])

  // Gestionnaire pour fermer le chat en cliquant en dehors
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (chatRef.current && !chatRef.current.contains(event.target) && isOpen && !isMinimized) {
        closeChatWithoutReset()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, isMinimized])

  useEffect(() => {
    if (socket && socketConnected && chatSession) {
      // Rejoindre la session de chat pour recevoir les messages en temps réel
      socket.emit('join_chat_session', chatSession.id)

      // Écouter les nouveaux messages
      socket.on('new_chat_message', (message) => {
        // Seulement ajouter les messages pour cette session et qui ne viennent pas de l'utilisateur
        if (message.sessionId === chatSession.id && message.sender !== 'USER') {
          setMessages(prev => {
            // Éviter les doublons
            const exists = prev.some(msg => msg.id === message.id)
            if (exists) return prev
            return [...prev, message]
          })
          
          // Incrémenter les messages non lus si le chat est fermé ou minimisé
          if (!isOpen || isMinimized) {
            setUnreadMessages(prev => prev + 1)
          }
        }
      })

      // Écouter les changements de statut de session
      socket.on('chat_session_updated', (updatedSession) => {
        if (updatedSession.id === chatSession.id) {
          setSessionStatus(updatedSession.status)
          setChatSession(updatedSession)
        }
      })

      socket.on('chat_session_closed', (sessionId) => {
        if (sessionId === chatSession.id) {
          setSessionStatus('CLOSED')
        }
      })

      return () => {
        socket.off('new_chat_message')
        socket.off('chat_session_updated')
        socket.off('chat_session_closed')
        socket.emit('leave_chat_session', chatSession.id)
      }
    }
  }, [socket, socketConnected, chatSession])

  // Masquer le LiveChat sur toutes les pages admin
  if (currentPath.startsWith('/admin')) {
    return null
  }

  const getAuthHeaders = () => {
    const headers = {
      'Content-Type': 'application/json'
    }
    
    // Ajouter le token seulement si l'utilisateur est connecté
    if (user) {
    const token = Cookies.get('token')
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
    }
    
    return headers
  }

  const handleContextSubmit = async (e) => {
    e.preventDefault()
    
    // Validation basique
    if (!contextData.subject.trim() || !contextData.category || !contextData.description.trim()) {
      alert('Veuillez remplir tous les champs obligatoires')
      return
    }

    // Validation supplémentaire pour les utilisateurs non connectés
    if (!user) {
      if (!contextData.firstName.trim() || !contextData.lastName.trim() || !contextData.userEmail.trim()) {
        alert('Veuillez remplir votre nom, prénom et email')
        return
      }
      
      // Validation email basique
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(contextData.userEmail)) {
        alert('Veuillez saisir une adresse email valide')
        return
      }
    }

    await initializeChat()
  }

  const handleContextChange = (field, value) => {
    setContextData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const initializeChat = async () => {
    try {
      const requestBody = {
        subject: contextData.subject,
        category: contextData.category,
        priority: contextData.priority,
        description: contextData.description,
        userEmail: contextData.userEmail,
        userPhone: contextData.userPhone
      }

      // Ajouter les informations nom/prénom pour les utilisateurs non connectés
      if (!user) {
        requestBody.firstName = contextData.firstName
        requestBody.lastName = contextData.lastName
        requestBody.isGuest = true
      }

      const response = await fetch('/api/chat/session', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(requestBody)
      })
      
      if (response.ok) {
        const session = await response.json()
        setChatSession(session)
        setSessionStatus(session.status)
        setIsConnected(true)
        setShowContextForm(false)
        
        // Message de bienvenue adapté selon le statut de connexion
        const userName = user?.name || `${contextData.firstName} ${contextData.lastName}`
        const userStatus = user ? 'utilisateur connecté' : 'visiteur'
        
        setMessages([{
          id: 'welcome-1',
          content: `Bonjour ${userName} ! 👋`,
          sender: 'support',
          timestamp: new Date(),
          senderName: 'Support CollabWave',
          type: 'welcome'
        }, {
          id: 'welcome-2',
          content: `Merci d'avoir fourni les détails de votre demande concernant "${contextData.subject}". Un agent va prendre en charge votre demande dans les plus brefs délais.`,
          sender: 'support',
          timestamp: new Date(),
          senderName: 'Support CollabWave'
        }, {
          id: 'context-summary',
          content: `📋 **Résumé de votre demande:**\n**Catégorie:** ${contextData.category}\n**Priorité:** ${contextData.priority}\n**Description:** ${contextData.description}\n**Statut:** ${userStatus}`,
          sender: 'system',
          timestamp: new Date(),
          senderName: 'Système',
          type: 'context'
        }])
      } else {
        console.error('Erreur lors de l\'initialisation du chat:', response.status)
      }
    } catch (error) {
      console.error('Erreur lors de l\'initialisation du chat:', error)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !chatSession || sessionStatus === 'CLOSED') return

    const userName = user?.name || `${contextData.firstName} ${contextData.lastName}` || 'Vous'

    const userMessage = {
      id: Date.now(),
      content: newMessage,
      sender: 'user',
      timestamp: new Date(),
      senderName: userName
    }

    setMessages(prev => [...prev, userMessage])
    const messageContent = newMessage
    setNewMessage('')

    try {
      const response = await fetch('/api/chat/message', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          sessionId: chatSession.id,
          content: messageContent
        })
      })

      if (response.ok) {
        // Le message sera ajouté via Socket.IO si nécessaire
      } else {
        console.error('Erreur lors de l\'envoi du message')
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const closeChat = () => {
    if (socket && chatSession) {
      socket.emit('leave_chat_session', chatSession.id)
    }
    setIsOpen(false)
    setMessages([])
    setChatSession(null)
    setIsConnected(false)
    setSessionStatus('WAITING')
    setIsMinimized(false)
    setShowContextForm(true)
    // Réinitialiser le formulaire mais garder l'email
    setContextData({
      subject: '',
      category: '',
      priority: 'Normale',
      description: '',
      userEmail: user?.email || '',
      userPhone: '',
      firstName: '',
      lastName: ''
    })
  }

  // Fonction pour fermer sans réinitialiser (pour le clic en dehors)
  const closeChatWithoutReset = () => {
    setIsOpen(false)
  }

  // Fonctions pour la gestion du badge intelligent
  const markChatAsUsed = () => {
    setHasUsedChat(true)
    localStorage.setItem('collabwave_chat_used', 'true')
    // Annuler le timer d'auto-masquage
    if (badgeAutoHideTimer) {
      clearTimeout(badgeAutoHideTimer)
      setBadgeAutoHideTimer(null)
    }
  }

  const resetUnreadMessages = () => {
    setUnreadMessages(0)
  }

  const shouldShowBadge = () => {
    // Afficher le badge si :
    // 1. Il n'a pas été masqué automatiquement ET
    // 2. (L'utilisateur n'a jamais utilisé le chat OU il y a des messages non lus)
    return showBadge && (!hasUsedChat || unreadMessages > 0)
  }

  const getBadgeContent = () => {
    if (unreadMessages > 0) {
      return unreadMessages > 9 ? '9+' : unreadMessages.toString()
    }
    return '!'
  }

  // Fonction pour réactiver le badge (si l'utilisateur le souhaite)
  const reactivateBadge = () => {
    setShowBadge(true)
    setHasUsedChat(false)
    localStorage.removeItem('collabwave_chat_used')
  }

  const minimizeChat = () => {
    setIsMinimized(true)
  }

  const maximizeChat = () => {
    setIsMinimized(false)
    resetUnreadMessages()
  }

  const getStatusInfo = () => {
    switch (sessionStatus) {
      case 'ACTIVE':
        return {
          color: 'text-green-400',
          dot: 'bg-green-400',
          text: 'En ligne - Support actif'
        }
      case 'WAITING':
        return {
          color: 'text-yellow-400',
          dot: 'bg-yellow-400',
          text: 'En attente d\'un agent'
        }
      case 'CLOSED':
        return {
          color: 'text-red-400',
          dot: 'bg-red-400',
          text: 'Conversation fermée'
        }
      default:
        return {
          color: 'text-gray-400',
          dot: 'bg-gray-400',
          text: 'Hors ligne'
        }
    }
  }

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const statusInfo = getStatusInfo()

  return (
    <>
      {/* Bouton flottant pour ouvrir le chat */}
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true)
            markChatAsUsed()
            resetUnreadMessages()
          }}
          className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 group"
          aria-label="Ouvrir le chat support"
        >
          <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          
          {/* Badge de notification intelligent */}
          {shouldShowBadge() && (
            <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${
              unreadMessages > 0 
                ? 'bg-red-500 animate-pulse' 
                : 'bg-red-500'
            }`}>
              <span className="text-xs font-bold text-white">
                {getBadgeContent()}
              </span>
            </div>
          )}
        </button>
      )}

      {/* Fenêtre de chat */}
      {isOpen && (
        <div 
          ref={chatRef}
          className={`fixed bottom-6 right-6 z-50 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 transition-all duration-300 ${
            isMinimized ? 'w-80 h-16' : 'w-96 h-[500px]'
          }`}
        >
          {/* Header du chat */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-2xl">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div className={`absolute -bottom-1 -right-1 w-3 h-3 ${statusInfo.dot} rounded-full border-2 border-white`}></div>
              </div>
              <div>
                <h3 className="font-semibold text-sm">Support CollabWave</h3>
                <p className={`text-xs ${statusInfo.color}`}>{statusInfo.text}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={isMinimized ? maximizeChat : minimizeChat}
                className="p-1 hover:bg-white/20 rounded transition-colors"
                aria-label={isMinimized ? "Agrandir" : "Réduire"}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMinimized ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 14l9-9 3 3L9 18l-4-4z" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  )}
                </svg>
              </button>
              <button
                onClick={closeChat}
                className="p-1 hover:bg-white/20 rounded transition-colors"
                aria-label="Fermer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Corps du chat */}
          {!isMinimized && (
            <>
              {showContextForm ? (
                /* Formulaire de contexte - Prend toute la hauteur disponible */
                <div className="flex-1 p-4 overflow-y-auto bg-gray-50 dark:bg-gray-900" style={{ height: '420px' }}>
                  <form onSubmit={handleContextSubmit} className="h-full flex flex-col">
                    {/* Contenu du formulaire dans un conteneur scrollable */}
                    <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                      {/* Header dans la zone scrollable */}
                      <div className="text-center pb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          Démarrer une conversation
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Aidez-nous à mieux comprendre votre demande en remplissant ces informations
                        </p>
                      </div>

                      {/* Message informatif pour les utilisateurs non connectés - dans la zone scrollable */}
                      {!user && (
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-500">
                          <div className="flex items-center">
                            <svg className="w-4 h-4 text-blue-600 dark:text-blue-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">
                              Vous n'êtes pas connecté. Vos informations nous aideront à mieux vous assister.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Nom et Prénom pour les utilisateurs non connectés */}
                      {!user && (
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Prénom *
                            </label>
                            <input
                              type="text"
                              value={contextData.firstName}
                              onChange={(e) => handleContextChange('firstName', e.target.value)}
                              placeholder="Votre prénom"
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Nom *
                            </label>
                            <input
                              type="text"
                              value={contextData.lastName}
                              onChange={(e) => handleContextChange('lastName', e.target.value)}
                              placeholder="Votre nom"
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                              required
                            />
                          </div>
                        </div>
                      )}

                      {/* Sujet */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Sujet de votre demande *
                        </label>
                        <input
                          type="text"
                          value={contextData.subject}
                          onChange={(e) => handleContextChange('subject', e.target.value)}
                          placeholder="Ex: Problème de connexion, Question sur la facturation..."
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                          required
                        />
                      </div>

                      {/* Catégorie */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Catégorie *
                        </label>
                        <select
                          value={contextData.category}
                          onChange={(e) => handleContextChange('category', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                          required
                        >
                          <option value="">Sélectionnez une catégorie</option>
                          <option value="Technique">Problème technique</option>
                          <option value="Compte">Gestion de compte</option>
                          <option value="Facturation">Facturation</option>
                          <option value="Fonctionnalité">Question sur une fonctionnalité</option>
                          <option value="Bug">Signaler un bug</option>
                          <option value="Général">Question générale</option>
                          <option value="Autre">Autre</option>
                        </select>
                      </div>

                      {/* Priorité */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Priorité
                        </label>
                        <select
                          value={contextData.priority}
                          onChange={(e) => handleContextChange('priority', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                        >
                          <option value="Faible">Faible</option>
                          <option value="Normale">Normale</option>
                          <option value="Élevée">Élevée</option>
                          <option value="Urgente">Urgente</option>
                        </select>
                      </div>

                      {/* Description */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Description détaillée *
                        </label>
                        <textarea
                          value={contextData.description}
                          onChange={(e) => handleContextChange('description', e.target.value)}
                          placeholder="Décrivez votre problème ou votre question en détail..."
                          rows="3"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm resize-none"
                          required
                        />
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Email de contact {!user && '*'}
                        </label>
                        <input
                          type="email"
                          value={contextData.userEmail}
                          onChange={(e) => handleContextChange('userEmail', e.target.value)}
                          placeholder="votre@email.com"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                          required={!user}
                        />
                        {!user && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Nous utiliserons cet email pour vous recontacter si nécessaire
                          </p>
                        )}
                      </div>

                      {/* Téléphone */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Téléphone (optionnel)
                        </label>
                        <input
                          type="tel"
                          value={contextData.userPhone}
                          onChange={(e) => handleContextChange('userPhone', e.target.value)}
                          placeholder="+33 1 23 45 67 89"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                        />
                      </div>
                    </div>

                    {/* Bouton de soumission fixe en bas */}
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                      >
                        Démarrer la conversation
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                /* Interface de chat normale */
                <>
              <div className="flex-1 p-4 h-80 overflow-y-auto space-y-4 bg-gray-50 dark:bg-gray-900">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                      message.sender === 'user'
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                            : message.sender === 'system'
                            ? 'bg-amber-100 dark:bg-amber-900 text-amber-900 dark:text-amber-100 border border-amber-200 dark:border-amber-700'
                        : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'
                    }`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-xs font-medium ${
                              message.sender === 'user' 
                                ? 'text-blue-100' 
                                : message.sender === 'system'
                                ? 'text-amber-700 dark:text-amber-300'
                                : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          {message.senderName}
                        </span>
                        <span className={`text-xs ${
                              message.sender === 'user' 
                                ? 'text-blue-100' 
                                : message.sender === 'system'
                                ? 'text-amber-600 dark:text-amber-400'
                                : 'text-gray-400'
                        }`}>
                          {formatTime(message.timestamp)}
                        </span>
                      </div>
                          <div className="text-sm leading-relaxed whitespace-pre-line">
                            {message.content}
                          </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Zone de saisie */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                {sessionStatus === 'CLOSED' ? (
                  <div className="text-center text-gray-500 dark:text-gray-400 text-sm">
                    Cette conversation a été fermée
                  </div>
                ) : (
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Tapez votre message..."
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                      disabled={!isConnected}
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!newMessage.trim() || !isConnected}
                      className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
                </>
              )}
            </>
          )}
        </div>
      )}
    </>
  )
} 