'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useSocket } from '@/contexts/SocketContext'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'

export default function LiveChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [chatSession, setChatSession] = useState(null)
  const [sessionStatus, setSessionStatus] = useState('ACTIVE')
  const [isMinimized, setIsMinimized] = useState(false)
  const messagesEndRef = useRef(null)
  const { user } = useAuth()
  const { socket, isConnected: socketConnected } = useSocket()
  const router = useRouter()

  // Ne pas afficher le LiveChat sur les pages admin
  const [currentPath, setCurrentPath] = useState('')
  
  useEffect(() => {
    setCurrentPath(window.location.pathname)
  }, [])

  // Masquer le LiveChat sur toutes les pages admin
  if (currentPath.startsWith('/admin')) {
    return null
  }

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
          text: 'Connexion...'
        }
    }
  }

  const statusInfo = getStatusInfo()

  return (
    <>
      {/* Bouton flottant */}
      {!isOpen && (
        <button
          data-chat-button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white p-4 rounded-full shadow-xl transition-all duration-300 hover:scale-110 z-50 group"
        >
          <svg className="w-6 h-6 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-pulse border-2 border-white"></div>
          {/* Effet de pulsation */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 animate-ping opacity-20"></div>
        </button>
      )}

      {/* Chat minimisé */}
      {isOpen && isMinimized && (
        <div className="fixed bottom-6 right-6 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
          <div 
            onClick={maximizeChat}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 cursor-pointer hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-between min-w-[280px]"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-sm">Support CollabWave</h3>
                <p className="text-xs opacity-90 flex items-center">
                  <div className={`w-2 h-2 ${statusInfo.dot} rounded-full mr-1 animate-pulse`}></div>
                  {statusInfo.text}
                </p>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                closeChat()
              }}
              className="text-white hover:text-gray-200 transition-colors p-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Fenêtre de chat complète */}
      {isOpen && !isMinimized && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col z-50 overflow-hidden">
          {/* Header amélioré */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">Support CollabWave</h3>
                <p className="text-xs opacity-90 flex items-center">
                  <div className={`w-2 h-2 ${statusInfo.dot} rounded-full mr-2 animate-pulse`}></div>
                  {statusInfo.text}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={minimizeChat}
                className="text-white hover:text-gray-200 transition-colors p-1 rounded hover:bg-white hover:bg-opacity-10"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              <button
                onClick={closeChat}
                className="text-white hover:text-gray-200 transition-colors p-1 rounded hover:bg-white hover:bg-opacity-10"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' || message.sender === 'USER' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
              >
                <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm transition-all hover:shadow-md ${
                  message.sender === 'user' || message.sender === 'USER'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                    : message.type === 'welcome'
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600'
                }`}>
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  <p className={`text-xs mt-2 opacity-75`}>
                    {message.timestamp ? 
                      message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) :
                      new Date(message.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    }
                  </p>
                </div>
              </div>
            ))}
            
            {/* Indicateur de frappe amélioré */}
            {isTyping && (
              <div className="flex justify-start animate-fadeIn">
                <div className="bg-white dark:bg-gray-700 px-4 py-3 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Un agent tape...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Zone d'input ou message de fermeture */}
          {sessionStatus === 'CLOSED' ? (
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20">
              <div className="text-center">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Conversation fermée</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  Cette conversation a été fermée par notre équipe support.
                </p>
                <button
                  onClick={closeChat}
                  className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white px-6 py-2 rounded-lg text-sm transition-all duration-200 transform hover:scale-105"
                >
                  Fermer la fenêtre
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <div className="flex space-x-3">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Tapez votre message..."
                  className="flex-1 resize-none border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  rows="2"
                  disabled={sessionStatus !== 'ACTIVE'}
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || sessionStatus !== 'ACTIVE'}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 text-white p-3 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
              {sessionStatus === 'WAITING' && (
                <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2 flex items-center">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  En attente qu'un agent prenne en charge votre demande...
                </p>
              )}
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </>
  )
} 