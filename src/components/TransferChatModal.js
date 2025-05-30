'use client'

import { useState, useEffect } from 'react'
import Cookies from 'js-cookie'

export default function TransferChatModal({ isOpen, onClose, session, onTransfer }) {
  const [moderators, setModerators] = useState([])
  const [selectedModerator, setSelectedModerator] = useState('')
  const [loading, setLoading] = useState(false)
  const [transferring, setTransferring] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetchModerators()
    }
  }, [isOpen])

  const getAuthHeaders = () => {
    const token = Cookies.get('token')
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }

  const fetchModerators = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/moderators', {
        headers: getAuthHeaders()
      })
      if (response.ok) {
        const data = await response.json()
        // Filtrer pour exclure l'utilisateur actuellement assigné
        const availableModerators = data.moderators.filter(mod => 
          mod.id !== session?.assignedTo
        )
        setModerators(availableModerators)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des modérateurs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTransfer = async () => {
    if (!selectedModerator) return

    setTransferring(true)
    try {
      const response = await fetch('/api/admin/chat/transfer', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          sessionId: session.id,
          targetUserId: selectedModerator
        })
      })

      if (response.ok) {
        const data = await response.json()
        onTransfer(data.session, data.message)
        onClose()
        setSelectedModerator('')
      } else {
        const error = await response.json()
        alert(`Erreur: ${error.error}`)
      }
    } catch (error) {
      console.error('Erreur lors du transfert:', error)
      alert('Erreur lors du transfert de la conversation')
    } finally {
      setTransferring(false)
    }
  }

  const handleClose = () => {
    setSelectedModerator('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Transférer la conversation
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Avec {session?.user?.name || 'Utilisateur'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600 dark:text-gray-300">Chargement des modérateurs...</span>
            </div>
          ) : (
            <>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Sélectionnez un modérateur ou administrateur pour transférer cette conversation :
              </p>

              <div className="space-y-3 max-h-64 overflow-y-auto">
                {moderators.length === 0 ? (
                  <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                    Aucun autre modérateur disponible
                  </div>
                ) : (
                  moderators.map((moderator) => (
                    <label
                      key={moderator.id}
                      className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                        selectedModerator === moderator.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="moderator"
                        value={moderator.id}
                        checked={selectedModerator === moderator.id}
                        onChange={(e) => setSelectedModerator(e.target.value)}
                        className="sr-only"
                      />
                      
                      <div className="flex items-center space-x-3 flex-1">
                        <div className="relative">
                          {moderator.profileImage ? (
                            <img
                              src={moderator.profileImage}
                              alt={moderator.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                              {moderator.name.charAt(0)}
                            </div>
                          )}
                          
                          {/* Indicateur de statut */}
                          <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                            moderator.isOnline ? 'bg-green-500' : 'bg-gray-400'
                          }`}></div>
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <p className="font-medium text-gray-900 dark:text-white">
                              {moderator.name}
                            </p>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              moderator.role === 'ADMIN' 
                                ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                                : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                            }`}>
                              {moderator.role === 'ADMIN' ? 'Admin' : 'Modérateur'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {moderator.statusText}
                          </p>
                        </div>
                        
                        {selectedModerator === moderator.id && (
                          <div className="text-blue-600 dark:text-blue-400">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </label>
                  ))
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            disabled={transferring}
          >
            Annuler
          </button>
          <button
            onClick={handleTransfer}
            disabled={!selectedModerator || transferring || loading}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2"
          >
            {transferring ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Transfert...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                <span>Transférer</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
} 