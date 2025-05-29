'use client'

import { useState, useEffect } from 'react'
import { checkMaintenanceMode } from '@/lib/maintenanceMiddleware'
import { useRouter } from 'next/navigation'

export default function MaintenancePage() {
  const [maintenanceInfo, setMaintenanceInfo] = useState({
    isEnabled: true,
    message: 'Le site est temporairement en maintenance. Veuillez réessayer plus tard.'
  })
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const info = await checkMaintenanceMode()
        setMaintenanceInfo(info)
        
        // Si la maintenance est désactivée, rediriger vers l'accueil
        if (!info.isEnabled) {
          router.push('/')
          return
        }
      } catch (error) {
        console.error('Erreur lors de la vérification du statut:', error)
      } finally {
        setLoading(false)
      }
    }

    checkStatus()
  }, [router])

  if (loading) {
    return (
      <div className="fixed inset-0 top-16 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900 flex items-center justify-center overflow-hidden">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 top-16 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900 flex items-center justify-center overflow-hidden">
      <div className="max-w-4xl w-full text-center px-4">
        
        {/* Icône de maintenance */}
        <div className="mb-6">
          <div className="mx-auto w-24 h-24 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        </div>

        {/* Titre */}
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Maintenance en cours
        </h1>

        {/* Message */}
        <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed max-w-2xl mx-auto">
          {maintenanceInfo.message}
        </p>

        {/* Informations supplémentaires */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 mb-8 max-w-lg mx-auto">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Que se passe-t-il ?
          </h2>
          <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
            <div className="flex items-center">
              <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-3">
                <svg className="w-3 h-3 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span>Amélioration des performances</span>
            </div>
            <div className="flex items-center">
              <div className="w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mr-3">
                <svg className="w-3 h-3 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span>Mise à jour de sécurité</span>
            </div>
            <div className="flex items-center">
              <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mr-3">
                <svg className="w-3 h-3 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <span>Optimisation de la base de données</span>
            </div>
          </div>
        </div>

        {/* Bouton de rechargement */}
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-base font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 mb-6"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Vérifier à nouveau
        </button>

        {/* Footer */}
        <div className="text-sm text-gray-500 dark:text-gray-400">
          <p className="mb-1">Merci de votre patience</p>
          <p>
            Cliquez sur "Vérifier à nouveau" pour actualiser le statut
          </p>
        </div>

        {/* Animation de chargement */}
        <div className="mt-6 flex justify-center">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    </div>
  )
} 