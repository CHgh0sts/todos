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
  const [sessionStatus, setSessionStatus] = useState('ACTIVE')
  const messagesEndRef = useRef(null)
  
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
    if (isOpen && !chatSession) {
      initializeChat()
    }
  }, [isOpen])

  useEffect(() => {
    // Écouter l'événement personnalisé pour ouvrir le chat
    const handleOpenChat = () => {
      setIsOpen(true)
      setIsMinimized(false)
    }
    
    window.addEventListener('openLiveChat', handleOpenChat)
    
    return () => {
      window.removeEventListener('openLiveChat', handleOpenChat)
    }
  }, [])

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
    const token = Cookies.get('token')
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }

  const initializeChat = async () => {
    try {
      const response = await fetch('/api/chat/session', {
        method: 'POST',
        headers: getAuthHeaders()
      })
      
      if (response.ok) {
        const session = await response.json()
        setChatSession(session)
        setSessionStatus(session.status)
        setIsConnected(true)
        
        // Message de bienvenue plus sophistiqué
        setMessages([{
          id: 'welcome-1',
          content: `Bonjour ${user?.name || 'cher utilisateur'} ! 👋`,
          sender: 'support',
          timestamp: new Date(),
          senderName: 'Support CollabWave',
          type: 'welcome'
        }, {
          id: 'welcome-2',
          content: "Je suis là pour vous aider avec toutes vos questions. Comment puis-je vous assister aujourd'hui ?",
          sender: 'support',
          timestamp: new Date(),
          senderName: 'Support CollabWave'
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

    const userMessage = {
      id: Date.now(),
      content: newMessage,
      sender: 'user',
      timestamp: new Date(),
      senderName: user?.name || 'Vous'
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
    setSessionStatus('ACTIVE')
    setIsMinimized(false)
  }

  const minimizeChat = () => {
    setIsMinimized(true)
  }

  const maximizeChat = () => {
    setIsMinimized(false)
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
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 group"
          aria-label="Ouvrir le chat support"
        >
          <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          
          {/* Badge de notification */}
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-xs font-bold">!</span>
          </div>
        </button>
      )}

      {/* Fenêtre de chat */}
      {isOpen && (
        <div className={`fixed bottom-6 right-6 z-50 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 transition-all duration-300 ${
          isMinimized ? 'w-80 h-16' : 'w-96 h-[500px]'
        }`}>
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
              {/* Messages */}
              <div className="flex-1 p-4 h-80 overflow-y-auto space-y-4 bg-gray-50 dark:bg-gray-900">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                      message.sender === 'user'
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                        : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'
                    }`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-xs font-medium ${
                          message.sender === 'user' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          {message.senderName}
                        </span>
                        <span className={`text-xs ${
                          message.sender === 'user' ? 'text-blue-100' : 'text-gray-400'
                        }`}>
                          {formatTime(message.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed">{message.content}</p>
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
        </div>
      )}
    </>
  )
} 