'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useSocket } from '@/contexts/SocketContext'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import TransferChatModal from '@/components/TransferChatModal'

export default function AdminChatPage() {
  const [chatSessions, setChatSessions] = useState([])
  const [selectedSession, setSelectedSession] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ACTIVE')
  const [isTyping, setIsTyping] = useState(false)
  const [showTransferModal, setShowTransferModal] = useState(false)
  const [transferNotification, setTransferNotification] = useState('')
  const messagesEndRef = useRef(null)
  const { user } = useAuth()
  const { socket, isConnected } = useSocket()
  const router = useRouter()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (!user || (user.role !== 'ADMIN' && user.role !== 'MODERATOR')) {
      router.push('/admin')
      return
    }
    
    // Charger les sessions initiales
    fetchChatSessions()
    
    // Rejoindre la salle admin pour recevoir les mises à jour
    if (socket && isConnected) {
      socket.emit('join_admin_chat')
    }
  }, [user, socket, isConnected])

  useEffect(() => {
    if (socket && isConnected) {
      // Écouter les nouvelles sessions de chat
      socket.on('new_chat_session', (session) => {
        setChatSessions(prev => [session, ...prev])
        // Notification sonore ou visuelle pour nouvelle session
        if (Notification.permission === 'granted') {
          new Notification('Nouvelle session de chat', {
            body: `${session.user?.name || 'Un utilisateur'} a démarré une conversation`,
            icon: '/icons/chat.png'
          })
        }
      })

      // Écouter les mises à jour de sessions
      socket.on('chat_session_updated', (updatedSession) => {
        setChatSessions(prev => 
          prev.map(session => 
            session.id === updatedSession.id ? updatedSession : session
          )
        )
        
        // Mettre à jour la session sélectionnée si c'est la même
        if (selectedSession?.id === updatedSession.id) {
          setSelectedSession(updatedSession)
        }
      })

      // Écouter les nouveaux messages
      socket.on('new_chat_message', (message) => {
        // Si c'est pour la session actuellement sélectionnée
        if (selectedSession?.id === message.sessionId) {
          setMessages(prev => [...prev, message])
        }
        
        // Mettre à jour la dernière activité de la session
        setChatSessions(prev => 
          prev.map(session => 
            session.id === message.sessionId 
              ? { ...session, lastActivity: new Date(), hasNewMessage: message.sender === 'USER' }
              : session
          )
        )
      })

      // Écouter les sessions fermées
      socket.on('chat_session_closed', (sessionId) => {
        setChatSessions(prev => 
          prev.map(session => 
            session.id === sessionId 
              ? { ...session, status: 'CLOSED' }
              : session
          )
        )
        
        if (selectedSession?.id === sessionId) {
          setSelectedSession(prev => ({ ...prev, status: 'CLOSED' }))
        }
      })

      return () => {
        socket.off('new_chat_session')
        socket.off('chat_session_updated')
        socket.off('new_chat_message')
        socket.off('chat_session_closed')
      }
    }
  }, [socket, isConnected, selectedSession])

  // Afficher la notification de transfert
  useEffect(() => {
    if (transferNotification) {
      const timer = setTimeout(() => {
        setTransferNotification('')
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [transferNotification])

  const getAuthHeaders = () => {
    const token = Cookies.get('token')
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }

  const fetchChatSessions = async () => {
    try {
      const response = await fetch(`/api/admin/chat/sessions?status=${filter}`, {
        headers: getAuthHeaders()
      })
      if (response.ok) {
        const data = await response.json()
        setChatSessions(data)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des sessions:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (sessionId) => {
    try {
      const response = await fetch(`/api/admin/chat/messages/${sessionId}`, {
        headers: getAuthHeaders()
      })
      if (response.ok) {
        const data = await response.json()
        setMessages(data)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des messages:', error)
    }
  }

  const selectSession = (session) => {
    setSelectedSession(session)
    fetchMessages(session.id)
    
    // Marquer comme lu
    setChatSessions(prev => 
      prev.map(s => 
        s.id === session.id ? { ...s, hasNewMessage: false } : s
      )
    )
    
    // Rejoindre la salle de cette session spécifique
    if (socket && isConnected) {
      socket.emit('join_chat_session', session.id)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedSession) return

    // Simuler la frappe
    setIsTyping(true)
    
    // Ajouter le message immédiatement à l'interface (optimistic update)
    const tempMessage = {
      id: `temp-${Date.now()}`,
      content: newMessage,
      sender: 'SUPPORT',
      sentAt: new Date(),
      sessionId: selectedSession.id
    }
    setMessages(prev => [...prev, tempMessage])
    const messageContent = newMessage
    setNewMessage('')

    try {
      const response = await fetch('/api/admin/chat/reply', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          sessionId: selectedSession.id,
          content: messageContent
        })
      })

      if (response.ok) {
        const realMessage = await response.json()
        // Remplacer le message temporaire par le vrai
        setMessages(prev => 
          prev.map(msg => 
            msg.id === tempMessage.id ? realMessage : msg
          )
        )
      } else {
        // Supprimer le message temporaire en cas d'erreur
        setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id))
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error)
      // Supprimer le message temporaire en cas d'erreur
      setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id))
    } finally {
      setIsTyping(false)
    }
  }

  const assignSession = async (sessionId) => {
    try {
      const response = await fetch('/api/admin/chat/assign', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ sessionId })
      })

      if (response.ok) {
        // La mise à jour sera gérée par Socket.IO
      }
    } catch (error) {
      console.error('Erreur lors de l\'assignation:', error)
    }
  }

  const closeSession = async (sessionId) => {
    try {
      const response = await fetch('/api/admin/chat/close', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ sessionId })
      })

      if (response.ok) {
        // La mise à jour sera gérée par Socket.IO
      }
    } catch (error) {
      console.error('Erreur lors de la fermeture:', error)
    }
  }

  const handleTransfer = (updatedSession, message) => {
    setTransferNotification(message)
    // La session sera mise à jour via Socket.IO
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
      case 'WAITING': return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
      case 'CLOSED': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
        )
      case 'WAITING':
        return (
          <div className="w-3 h-3 bg-amber-500 rounded-full animate-bounce"></div>
        )
      case 'CLOSED':
        return (
          <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
        )
      default:
        return (
          <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
        )
    }
  }

  const formatTime = (date) => {
    return new Date(date).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTimeAgo = (date) => {
    const now = new Date()
    const diff = now - new Date(date)
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (days > 0) return `il y a ${days}j`
    if (hours > 0) return `il y a ${hours}h`
    if (minutes > 0) return `il y a ${minutes}min`
    return 'À l\'instant'
  }

  // Filtrer les sessions selon le filtre actuel
  const filteredSessions = chatSessions.filter(session => {
    if (filter === 'ALL') return true
    return session.status === filter
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-blue-600"></div>
            <div className="absolute inset-0 rounded-full border-4 border-blue-200 dark:border-blue-800"></div>
          </div>
          <p className="mt-4 text-lg font-medium text-gray-700 dark:text-gray-300">Chargement du chat support...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[90dvh] bg-gray-50 dark:bg-gray-900 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 overflow-hidden">
        
        {/* Notification de transfert */}
        {transferNotification && (
          <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>{transferNotification}</span>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Chat Support
                </h1>
                <p className="text-gray-600 dark:text-gray-300 flex items-center">
                  {isConnected ? (
                    <>
                      <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></div>
                      Connecté en temps réel • {filteredSessions.length} session{filteredSessions.length > 1 ? 's' : ''}
                    </>
                  ) : (
                    <>
                      <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                      Déconnecté
                    </>
                  )}
                </p>
              </div>
            </div>
            
            {/* Filtres */}
            <div className="flex space-x-2">
              {['ACTIVE', 'WAITING', 'CLOSED'].map((status) => {
                const count = chatSessions.filter(s => s.status === status).length
                return (
                  <button
                    key={status}
                    onClick={() => setFilter(status)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                      filter === status
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(status)}
                      <span>
                        {status === 'ACTIVE' ? 'Actives' : status === 'WAITING' ? 'En attente' : 'Fermées'}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        filter === status 
                          ? 'bg-white/20 text-white' 
                          : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                      }`}>
                        {count}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="flex h-[700px]">
            
            {/* Liste des sessions */}
            <div className="w-80 border-r border-gray-200 dark:border-gray-700 flex flex-col">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                <h3 className="font-semibold text-gray-900 dark:text-white">Sessions de chat</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {filteredSessions.length} conversation{filteredSessions.length > 1 ? 's' : ''}
                </p>
              </div>
              
              <div className="flex-1 overflow-y-auto p-3">
                {filteredSessions.length === 0 ? (
                  <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <h3 className="font-medium mb-2">Aucune session {filter.toLowerCase()}</h3>
                    <p className="text-sm">Les nouvelles conversations apparaîtront ici</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredSessions.map((session) => (
                      <div
                        key={session.id}
                        onClick={() => selectSession(session)}
                        className={`relative p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md ${
                          selectedSession?.id === session.id
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md'
                            : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        {/* Indicateur de nouveau message */}
                        {session.hasNewMessage && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                        )}
                        
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <div className="relative">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-md ${
                                session.isGuest 
                                  ? 'bg-gradient-to-br from-orange-500 to-red-600' 
                                  : 'bg-gradient-to-br from-blue-500 to-purple-600'
                              }`}>
                                {session.user?.name?.charAt(0) || 'U'}
                              </div>
                              <div className="absolute -bottom-1 -right-1">
                                {getStatusIcon(session.status)}
                              </div>
                              {/* Indicateur invité */}
                              {session.isGuest && (
                                <div className="absolute -top-1 -left-1 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
                                  <span className="text-xs text-white font-bold">👤</span>
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2">
                                <p className="font-medium text-gray-900 dark:text-white truncate text-sm">
                                  {session.user?.name || 'Utilisateur'}
                                </p>
                                {session.isGuest && (
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                                    Invité
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {getTimeAgo(session.startedAt)}
                                {session.isGuest && session.userEmail && (
                                  <span className="ml-2">• {session.userEmail}</span>
                                )}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Informations de contexte */}
                        {session.subject && (
                          <div className="mb-2">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              📋 {session.subject}
                            </p>
                          </div>
                        )}

                        {session.category && (
                          <div className="mb-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              session.category === 'Urgente' || session.category === 'Bug' 
                                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                : session.category === 'Technique'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                : session.category === 'Facturation'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                            }`}>
                              {session.category}
                            </span>
                            {session.priority && session.priority !== 'Normale' && (
                              <span className={`ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                session.priority === 'Urgente' 
                                  ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                  : session.priority === 'Élevée'
                                  ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                              }`}>
                                🔥 {session.priority}
                              </span>
                            )}
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}>
                            {session.status === 'ACTIVE' ? 'Active' : session.status === 'WAITING' ? 'Attente' : 'Fermée'}
                          </span>
                          
                          {!session.assignedTo && session.status === 'WAITING' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                assignSession(session.id)
                              }}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs py-1 px-2 rounded transition-colors"
                            >
                              Prendre
                            </button>
                          )}
                        </div>
                        
                        {session.assignedTo && (
                          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            {session.assignedTo === user.id ? 'Vous' : 'Autre modérateur'}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Zone de chat */}
            <div className="flex-1 flex flex-col">
              
              {selectedSession ? (
                <>
                  {/* Header du chat */}
                  <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shadow-lg ${
                            selectedSession.isGuest 
                              ? 'bg-gradient-to-br from-orange-500 to-red-600' 
                              : 'bg-gradient-to-br from-blue-500 to-purple-600'
                          }`}>
                            {selectedSession.user?.name?.charAt(0) || 'U'}
                          </div>
                          <div className="absolute -bottom-1 -right-1">
                            {getStatusIcon(selectedSession.status)}
                          </div>
                          {/* Indicateur invité */}
                          {selectedSession.isGuest && (
                            <div className="absolute -top-1 -left-1 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                              <span className="text-xs text-white font-bold">👤</span>
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-bold text-gray-900 dark:text-white">
                              {selectedSession.user?.name || 'Utilisateur'}
                            </h3>
                            {selectedSession.isGuest && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                                👤 Utilisateur invité
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {selectedSession.user?.email}
                            {selectedSession.isGuest && (
                              <span className="ml-2 text-orange-600 dark:text-orange-400">
                                • Non connecté
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedSession.status)}`}>
                          {selectedSession.status === 'ACTIVE' ? '🟢 Active' : selectedSession.status === 'WAITING' ? '🟡 Attente' : '🔴 Fermée'}
                        </span>
                        
                        {selectedSession.status === 'ACTIVE' && selectedSession.assignedTo === user.id && (
                          <button
                            onClick={() => setShowTransferModal(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors flex items-center space-x-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                            </svg>
                            <span>Transférer</span>
                          </button>
                        )}
                        
                        {selectedSession.status === 'ACTIVE' && (
                          <button
                            onClick={() => closeSession(selectedSession.id)}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                          >
                            Fermer
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Informations de contexte détaillées */}
                    {(selectedSession.subject || selectedSession.category || selectedSession.description) && (
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Contexte de la demande
                        </h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {selectedSession.subject && (
                            <div>
                              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                Sujet
                              </label>
                              <p className="text-sm text-gray-900 dark:text-white font-medium">
                                {selectedSession.subject}
                              </p>
                            </div>
                          )}
                          
                          {selectedSession.category && (
                            <div>
                              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                Catégorie
                              </label>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                selectedSession.category === 'Urgente' || selectedSession.category === 'Bug' 
                                  ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                  : selectedSession.category === 'Technique'
                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                  : selectedSession.category === 'Facturation'
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                              }`}>
                                {selectedSession.category}
                              </span>
                            </div>
                          )}
                          
                          {selectedSession.priority && (
                            <div>
                              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                Priorité
                              </label>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                selectedSession.priority === 'Urgente' 
                                  ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                  : selectedSession.priority === 'Élevée'
                                  ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                                  : selectedSession.priority === 'Normale'
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                              }`}>
                                {selectedSession.priority === 'Urgente' ? '🔥' : selectedSession.priority === 'Élevée' ? '⚡' : '📋'} {selectedSession.priority}
                              </span>
                            </div>
                          )}
                          
                          {(selectedSession.userEmail || selectedSession.userPhone) && (
                            <div>
                              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                Contact
                              </label>
                              <div className="space-y-1">
                                {selectedSession.userEmail && (
                                  <p className="text-sm text-gray-900 dark:text-white">
                                    📧 {selectedSession.userEmail}
                                  </p>
                                )}
                                {selectedSession.userPhone && (
                                  <p className="text-sm text-gray-900 dark:text-white">
                                    📞 {selectedSession.userPhone}
                                  </p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {selectedSession.description && (
                          <div className="mt-4">
                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                              Description détaillée
                            </label>
                            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                              <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
                                {selectedSession.description}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-900">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender === 'USER' ? 'justify-start' : 'justify-end'} animate-fadeIn`}
                      >
                        <div className={`max-w-md px-4 py-2 rounded-2xl shadow-sm ${
                          message.sender === 'USER'
                            ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600'
                            : message.sender === 'SYSTEM'
                            ? 'bg-amber-500 text-white'
                            : 'bg-blue-600 text-white'
                        }`}>
                          <p className="text-sm">{message.content}</p>
                          <p className="text-xs mt-1 opacity-75">
                            {formatTime(message.sentAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                    
                    {/* Indicateur de frappe */}
                    {isTyping && (
                      <div className="flex justify-end animate-fadeIn">
                        <div className="bg-blue-100 dark:bg-blue-900/30 px-4 py-2 rounded-2xl">
                          <div className="flex items-center space-x-2">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                            <span className="text-xs text-blue-600 dark:text-blue-400">Vous tapez...</span>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input de réponse ou message de fermeture */}
                  {selectedSession.status === 'CLOSED' ? (
                    <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-red-50 dark:bg-red-900/20">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-3">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Conversation fermée</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                          Cette conversation a été fermée. L'utilisateur a été notifié.
                        </p>
                        <button
                          onClick={() => setSelectedSession(null)}
                          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                        >
                          Retour à la liste
                        </button>
                      </div>
                    </div>
                  ) : selectedSession.assignedTo === user.id ? (
                    <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                      <div className="flex space-x-3">
                        <textarea
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Tapez votre réponse..."
                          className="flex-1 resize-none border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows="2"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault()
                              sendMessage()
                            }
                          }}
                        />
                        <button
                          onClick={sendMessage}
                          disabled={!newMessage.trim()}
                          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-amber-50 dark:bg-amber-900/20">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-3">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Session non assignée</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                          Vous devez prendre en charge cette conversation pour pouvoir répondre.
                        </p>
                        <button
                          onClick={() => assignSession(selectedSession.id)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                        >
                          Prendre en charge
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      Sélectionnez une conversation
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      Choisissez une session de chat dans la liste pour commencer à répondre
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de transfert */}
      <TransferChatModal
        isOpen={showTransferModal}
        onClose={() => setShowTransferModal(false)}
        session={selectedSession}
        onTransfer={handleTransfer}
      />

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateX(100%); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  )
} 