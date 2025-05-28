'use client'

import { useState, useEffect } from 'react'
import { usePWA } from './PWAManager'

export default function ConnectionStatus() {
  const { isOnline } = usePWA()
  const [showOfflineMessage, setShowOfflineMessage] = useState(false)
  const [wasOffline, setWasOffline] = useState(false)

  useEffect(() => {
    if (!isOnline && !wasOffline) {
      setShowOfflineMessage(true)
      setWasOffline(true)
    } else if (isOnline && wasOffline) {
      setShowOfflineMessage(true)
      setWasOffline(false)
      // Masquer le message après 3 secondes
      setTimeout(() => setShowOfflineMessage(false), 3000)
    }
  }, [isOnline, wasOffline])

  if (!showOfflineMessage) return null

  return (
    <div className={`fixed top-20 left-4 right-4 z-40 md:left-auto md:right-4 md:w-80 transition-all duration-300 ${
      showOfflineMessage ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
    }`}>
      <div className={`rounded-lg shadow-lg border p-4 ${
        isOnline 
          ? 'bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-700'
          : 'bg-orange-50 dark:bg-orange-900 border-orange-200 dark:border-orange-700'
      }`}>
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              isOnline 
                ? 'bg-green-100 dark:bg-green-800'
                : 'bg-orange-100 dark:bg-orange-800'
            }`}>
              <span className="text-xl">
                {isOnline ? '🌐' : '📱'}
              </span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className={`text-sm font-medium ${
              isOnline 
                ? 'text-green-900 dark:text-green-100'
                : 'text-orange-900 dark:text-orange-100'
            }`}>
              {isOnline ? 'Connexion rétablie' : 'Mode hors ligne'}
            </h3>
            <p className={`text-xs mt-1 ${
              isOnline 
                ? 'text-green-700 dark:text-green-300'
                : 'text-orange-700 dark:text-orange-300'
            }`}>
              {isOnline 
                ? 'Toutes les fonctionnalités sont disponibles'
                : 'Fonctionnalités limitées - Les données sont mises en cache'
              }
            </p>
            {!isOnline && (
              <div className="mt-2">
                <div className="text-xs text-orange-600 dark:text-orange-400">
                  <div className="flex items-center space-x-1 mb-1">
                    <span>✅</span>
                    <span>Consultation des projets</span>
                  </div>
                  <div className="flex items-center space-x-1 mb-1">
                    <span>✅</span>
                    <span>Lecture des tâches</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span>❌</span>
                    <span>Création/modification</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          <button
            onClick={() => setShowOfflineMessage(false)}
            className={`flex-shrink-0 hover:opacity-75 ${
              isOnline 
                ? 'text-green-400 hover:text-green-500'
                : 'text-orange-400 hover:text-orange-500'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

// Composant pour afficher l'indicateur de connexion dans la navbar
export function ConnectionIndicator() {
  const { isOnline } = usePWA()

  return (
    <div className="flex items-center space-x-2">
      <div className={`w-2 h-2 rounded-full ${
        isOnline ? 'bg-green-500' : 'bg-orange-500'
      }`} />
      <span className={`text-xs ${
        isOnline 
          ? 'text-green-600 dark:text-green-400' 
          : 'text-orange-600 dark:text-orange-400'
      }`}>
        {isOnline ? 'En ligne' : 'Hors ligne'}
      </span>
    </div>
  )
} 