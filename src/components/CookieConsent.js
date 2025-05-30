'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function CookieConsent() {
  const [showConsent, setShowConsent] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Vérifier si l'utilisateur a déjà donné son consentement
    const consent = localStorage.getItem('cookieConsent')
    if (!consent) {
      // Afficher le modal après un petit délai pour une meilleure UX
      setTimeout(() => {
        setShowConsent(true)
        setTimeout(() => setIsVisible(true), 100)
      }, 1000)
    }
  }, [])

  const acceptCookies = () => {
    localStorage.setItem('cookieConsent', 'accepted')
    setIsVisible(false)
    setTimeout(() => setShowConsent(false), 300)
  }

  const declineCookies = () => {
    localStorage.setItem('cookieConsent', 'declined')
    setIsVisible(false)
    setTimeout(() => setShowConsent(false), 300)
  }

  if (!showConsent) return null

  return (
    <div className={`fixed bottom-4 right-4 z-50 max-w-sm transition-all duration-300 transform ${
      isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
    }`}>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 backdrop-blur-sm">
        {/* Header avec icône */}
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            🍪 Cookies
          </h3>
        </div>

        {/* Contenu */}
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
          Nous utilisons des cookies pour améliorer votre expérience sur CollabWave. 
          Ces cookies nous aident à analyser l'utilisation du site et à personnaliser votre expérience.
        </p>

        {/* Lien vers la politique */}
        <div className="mb-4">
          <Link 
            href="/cookies" 
            className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline transition-colors"
          >
            En savoir plus sur notre politique des cookies
          </Link>
        </div>

        {/* Boutons d'action */}
        <div className="flex flex-col gap-2">
          <button
            onClick={acceptCookies}
            className="w-full px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-[1.02]"
          >
            <span className="flex items-center justify-center">
              <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Accepter tous les cookies
            </span>
          </button>
          
          <button
            onClick={declineCookies}
            className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200"
          >
            <span className="flex items-center justify-center">
              <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Refuser
            </span>
          </button>
        </div>

        {/* Bouton de fermeture */}
        <button
          onClick={declineCookies}
          className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          aria-label="Fermer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
} 