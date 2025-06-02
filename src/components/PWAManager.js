'use client'

import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

export default function PWAManager() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showInstallButton, setShowInstallButton] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [swRegistration, setSwRegistration] = useState(null)
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    // Marquer que nous sommes côté client et hydratés
    setIsClient(true)
    setIsHydrated(true)
    
    // Vérifier si l'utilisateur a déjà refusé l'installation
    try {
      const dismissed = localStorage.getItem('pwa-install-dismissed')
      if (dismissed) {
        setIsDismissed(true)
      }
    } catch (error) {
      console.warn('Erreur accès localStorage:', error)
    }

    // Vérifier si l'app est déjà installée
    try {
    if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      }
    } catch (error) {
      console.warn('Erreur vérification installation:', error)
    }

    // Enregistrer le service worker seulement en production
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      registerServiceWorker()
    } else if ('serviceWorker' in navigator && process.env.NODE_ENV === 'development') {
      // En développement, utiliser le SW simplifié ou désactiver complètement
      // unregisterServiceWorker() // <- décommentez cette ligne pour désactiver complètement
      registerDevServiceWorker() // <- commentez cette ligne pour désactiver complètement
    }

    // Écouter l'événement beforeinstallprompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstallButton(true)
    }

    // Écouter l'installation de l'app
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setShowInstallButton(false)
      setDeferredPrompt(null)
      toast.success('🎉 CollabWave installé avec succès !', {
        duration: 4000,
        icon: '📱'
      })
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      })

      setSwRegistration(registration)

      // Vérifier les mises à jour
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            setUpdateAvailable(true)
            toast('🔄 Mise à jour disponible !', {
              duration: 6000,
              icon: '⬆️',
              action: {
                label: 'Mettre à jour',
                onClick: () => handleUpdate()
              }
            })
          }
        })
      })

      // Écouter les messages du service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'SW_UPDATED') {
          setUpdateAvailable(true)
        }
      })

      console.log('✅ Service Worker enregistré avec succès')
    } catch (error) {
      console.error('❌ Erreur enregistrement Service Worker:', error)
    }
  }

  const registerDevServiceWorker = async () => {
    try {
      // D'abord, désactiver tous les service workers existants
      await unregisterServiceWorker()
      
      // Ensuite, enregistrer le SW de développement simplifié
      const registration = await navigator.serviceWorker.register('/sw-dev.js', {
        scope: '/'
      })

      setSwRegistration(registration)
      console.log('✅ Service Worker DEV enregistré avec succès')
    } catch (error) {
      console.error('❌ Erreur enregistrement Service Worker DEV:', error)
      // Si ça échoue, désactiver complètement
      await unregisterServiceWorker()
    }
  }

  const unregisterServiceWorker = async () => {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations()
      for (const registration of registrations) {
        await registration.unregister()
      }
      console.log('✅ Service Worker désactivé avec succès')
    } catch (error) {
      console.error('❌ Erreur désactivation Service Worker:', error)
    }
  }

  const handleInstall = async () => {
    if (!deferredPrompt) return

    try {
      // Afficher le prompt d'installation
      deferredPrompt.prompt()
      
      // Attendre la réponse de l'utilisateur
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        console.log('✅ Installation acceptée')
      } else {
        console.log('❌ Installation refusée')
      }
      
      setDeferredPrompt(null)
      setShowInstallButton(false)
    } catch (error) {
      console.error('❌ Erreur installation:', error)
    }
  }

  const handleUpdate = () => {
    console.log('🔄 Tentative de mise à jour PWA...')
    
    if (swRegistration && swRegistration.waiting) {
      console.log('✅ Service Worker en attente trouvé, activation...')
      // Dire au service worker d'activer la nouvelle version
      swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' })
      
      // Attendre un peu puis recharger
      setTimeout(() => {
        console.log('🔄 Rechargement de la page...')
        window.location.reload()
      }, 500)
    } else if (swRegistration) {
      console.log('⚠️ Aucun service worker en attente, rechargement direct...')
      // Pas de SW en attente, recharger directement
      window.location.reload()
    } else {
      console.log('❌ Aucun service worker enregistré')
      // Fallback : recharger quand même
      window.location.reload()
    }
    
    // Masquer la notification immédiatement
    setUpdateAvailable(false)
  }

  const dismissInstall = () => {
    setShowInstallButton(false)
    setIsDismissed(true)
    try {
      if (isClient) {
    localStorage.setItem('pwa-install-dismissed', 'true')
      }
    } catch (error) {
      console.warn('Erreur sauvegarde localStorage:', error)
    }
  }

  // Ne pas afficher pendant l'hydratation ou si pas côté client
  if (!isHydrated || !isClient || isInstalled || isDismissed) {
    return null
  }

  return (
    <>
      {/* Bouton d'installation PWA */}
      {showInstallButton && (
        <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-80">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  <span className="text-xl">📱</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                  Installer CollabWave
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Accédez rapidement à vos projets depuis votre écran d'accueil
                </p>
                <div className="flex space-x-2 mt-3">
                  <button
                    onClick={handleInstall}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Installer
                  </button>
                  <button
                    onClick={dismissInstall}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-xs font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Plus tard
                  </button>
                </div>
              </div>
              <button
                onClick={dismissInstall}
                className="flex-shrink-0 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification de mise à jour */}
      {updateAvailable && (
        <div className="fixed top-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-80">
          <div className="bg-green-50 dark:bg-green-900 rounded-lg shadow-lg border border-green-200 dark:border-green-700 p-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-800 rounded-lg flex items-center justify-center">
                  <span className="text-xl">🔄</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-green-900 dark:text-green-100">
                  Mise à jour disponible
                </h3>
                <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                  Une nouvelle version de CollabWave est prête
                </p>
                <div className="flex space-x-2 mt-3">
                  <button
                    onClick={handleUpdate}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Mettre à jour
                  </button>
                  <button
                    onClick={() => setUpdateAvailable(false)}
                    className="inline-flex items-center px-3 py-1.5 border border-green-300 dark:border-green-600 text-xs font-medium rounded-md text-green-700 dark:text-green-300 bg-white dark:bg-green-800 hover:bg-green-50 dark:hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Plus tard
                  </button>
                </div>
              </div>
              <button
                onClick={() => setUpdateAvailable(false)}
                className="flex-shrink-0 text-green-400 hover:text-green-500 dark:hover:text-green-300"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// Hook pour vérifier le statut PWA
export function usePWA() {
  const [isInstalled, setIsInstalled] = useState(false)
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    // Vérifier si installé
    try {
    if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      }
    } catch (error) {
      console.warn('Erreur vérification PWA:', error)
    }

    // Écouter le statut de connexion
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return { isInstalled, isOnline }
} 