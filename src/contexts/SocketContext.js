'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import io from 'socket.io-client'
import { useAuth } from './AuthContext'
import Cookies from 'js-cookie'
import toast from 'react-hot-toast'

const SocketContext = createContext()

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}

export const SocketProvider = ({ children }) => {
  const { user } = useAuth()
  const [socket, setSocket] = useState(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (user) {
      const token = Cookies.get('token')
      
      if (token) {
        // Créer la connexion Socket.IO
        const newSocket = io('http://localhost:3000', {
          auth: {
            token: token
          }
        })

        // Événements de connexion
        newSocket.on('connect', () => {
          console.log('🔌 Connecté au serveur Socket.IO')
          setIsConnected(true)
        })

        newSocket.on('disconnect', () => {
          console.log('❌ Déconnecté du serveur Socket.IO')
          setIsConnected(false)
        })

        newSocket.on('connect_error', (error) => {
          console.error('Erreur de connexion Socket.IO:', error.message)
          setIsConnected(false)
        })

        // Écouter les invitations reçues
        newSocket.on('invitation_received', (data) => {
          toast.success(`📨 Nouvelle invitation de ${data.senderName} pour le projet "${data.projectName}"`)
          
          // Déclencher un événement personnalisé pour mettre à jour les badges
          window.dispatchEvent(new CustomEvent('invitation_received', { detail: data }))
        })

        // Écouter les notifications générales
        newSocket.on('notification_received', (data) => {
          toast.success(`🔔 ${data.title}`)
          
          // Déclencher un événement pour mettre à jour les badges
          window.dispatchEvent(new CustomEvent('notification_received', { detail: data }))
        })

        // Écouter les mises à jour de projet
        newSocket.on('project_updated', (data) => {
          // Déclencher un événement pour mettre à jour l'interface
          window.dispatchEvent(new CustomEvent('project_updated', { detail: data }))
        })

        // Écouter les changements de todos
        newSocket.on('todo_created', (data) => {
          window.dispatchEvent(new CustomEvent('todo_created', { detail: data }))
        })

        newSocket.on('todo_updated', (data) => {
          window.dispatchEvent(new CustomEvent('todo_updated', { detail: data }))
        })

        newSocket.on('todo_deleted', (data) => {
          window.dispatchEvent(new CustomEvent('todo_deleted', { detail: data }))
        })

        // Écouter les changements de collaborateurs
        newSocket.on('collaborator_added', (data) => {
          toast.success(`👥 ${data.userName} a rejoint le projet "${data.projectName}"`)
          window.dispatchEvent(new CustomEvent('collaborator_added', { detail: data }))
        })

        newSocket.on('collaborator_removed', (data) => {
          window.dispatchEvent(new CustomEvent('collaborator_removed', { detail: data }))
        })

        setSocket(newSocket)

        return () => {
          newSocket.close()
        }
      }
    } else {
      // Déconnecter si l'utilisateur n'est pas connecté
      if (socket) {
        socket.close()
        setSocket(null)
        setIsConnected(false)
      }
    }
  }, [user])

  // Fonctions utilitaires
  const joinProject = (projectId) => {
    if (socket && isConnected) {
      socket.emit('join_project', projectId)
    }
  }

  const leaveProject = (projectId) => {
    if (socket && isConnected) {
      socket.emit('leave_project', projectId)
    }
  }

  const value = {
    socket,
    isConnected,
    joinProject,
    leaveProject
  }

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  )
} 