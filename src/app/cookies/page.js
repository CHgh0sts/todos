'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function CookiesPage() {
  const [cookiePreferences, setCookiePreferences] = useState({
    essential: true, // Toujours activé
    preferences: false,
    analytics: false,
    marketing: false
  })

  useEffect(() => {
    // Charger les préférences existantes
    const consent = localStorage.getItem('cookieConsent')
    const preferences = localStorage.getItem('cookiePreferences')
    
    if (preferences) {
      try {
        setCookiePreferences(JSON.parse(preferences))
      } catch (e) {
        console.error('Erreur lors du chargement des préférences cookies:', e)
      }
    } else if (consent === 'accepted') {
      // Si l'utilisateur a accepté tous les cookies
      setCookiePreferences({
        essential: true,
        preferences: true,
        analytics: true,
        marketing: true
      })
    }
  }, [])

  const handlePreferenceChange = (type) => {
    if (type === 'essential') return // Ne peut pas être désactivé
    
    setCookiePreferences(prev => ({
      ...prev,
      [type]: !prev[type]
    }))
  }

  const savePreferences = () => {
    localStorage.setItem('cookiePreferences', JSON.stringify(cookiePreferences))
    localStorage.setItem('cookieConsent', 'customized')
    
    // Afficher un message de confirmation
    const toast = document.createElement('div')
    toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50'
    toast.textContent = 'Préférences sauvegardées avec succès !'
    document.body.appendChild(toast)
    
    setTimeout(() => {
      document.body.removeChild(toast)
    }, 3000)
  }

  const acceptAllCookies = () => {
    const allAccepted = {
      essential: true,
      preferences: true,
      analytics: true,
      marketing: true
    }
    setCookiePreferences(allAccepted)
    localStorage.setItem('cookiePreferences', JSON.stringify(allAccepted))
    localStorage.setItem('cookieConsent', 'accepted')
    
    // Afficher un message de confirmation
    const toast = document.createElement('div')
    toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50'
    toast.textContent = 'Tous les cookies ont été acceptés !'
    document.body.appendChild(toast)
    
    setTimeout(() => {
      document.body.removeChild(toast)
    }, 3000)
  }

  const rejectAllCookies = () => {
    const onlyEssential = {
      essential: true,
      preferences: false,
      analytics: false,
      marketing: false
    }
    setCookiePreferences(onlyEssential)
    localStorage.setItem('cookiePreferences', JSON.stringify(onlyEssential))
    localStorage.setItem('cookieConsent', 'declined')
    
    // Afficher un message de confirmation
    const toast = document.createElement('div')
    toast.className = 'fixed top-4 right-4 bg-orange-500 text-white px-6 py-3 rounded-lg shadow-lg z-50'
    toast.textContent = 'Seuls les cookies essentiels sont activés'
    document.body.appendChild(toast)
    
    setTimeout(() => {
      document.body.removeChild(toast)
    }, 3000)
  }

  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          🍪 Politique des cookies
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          Gérez vos préférences de cookies et découvrez comment nous les utilisons
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Gestionnaire de cookies */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sticky top-24">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
              </svg>
              Gestionnaire de cookies
            </h2>
            
            <div className="space-y-4 mb-6">
              {/* Cookies essentiels */}
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Essentiels</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Toujours activés</p>
                </div>
                <div className="w-12 h-6 bg-green-500 rounded-full flex items-center justify-end px-1">
                  <div className="w-4 h-4 bg-white rounded-full"></div>
                </div>
              </div>

              {/* Cookies de préférences */}
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Préférences</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Thème, langue</p>
                </div>
                <button
                  onClick={() => handlePreferenceChange('preferences')}
                  className={`w-12 h-6 rounded-full flex items-center transition-colors ${
                    cookiePreferences.preferences ? 'bg-blue-500 justify-end' : 'bg-gray-300 dark:bg-gray-600 justify-start'
                  } px-1`}
                >
                  <div className="w-4 h-4 bg-white rounded-full"></div>
                </button>
              </div>

              {/* Cookies analytiques */}
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Analytiques</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Statistiques d'usage</p>
                </div>
                <button
                  onClick={() => handlePreferenceChange('analytics')}
                  className={`w-12 h-6 rounded-full flex items-center transition-colors ${
                    cookiePreferences.analytics ? 'bg-purple-500 justify-end' : 'bg-gray-300 dark:bg-gray-600 justify-start'
                  } px-1`}
                >
                  <div className="w-4 h-4 bg-white rounded-full"></div>
                </button>
              </div>

              {/* Cookies marketing */}
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Marketing</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Publicités ciblées</p>
                </div>
                <button
                  onClick={() => handlePreferenceChange('marketing')}
                  className={`w-12 h-6 rounded-full flex items-center transition-colors ${
                    cookiePreferences.marketing ? 'bg-pink-500 justify-end' : 'bg-gray-300 dark:bg-gray-600 justify-start'
                  } px-1`}
                >
                  <div className="w-4 h-4 bg-white rounded-full"></div>
                </button>
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="space-y-2">
              <button
                onClick={savePreferences}
                className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium"
              >
                Sauvegarder mes préférences
              </button>
              <button
                onClick={acceptAllCookies}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Accepter tous les cookies
              </button>
              <button
                onClick={rejectAllCookies}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                Refuser les cookies optionnels
              </button>
            </div>
          </div>
        </div>

        {/* Contenu informatif */}
        <div className="lg:col-span-2">
          <div className="prose prose-gray dark:prose-invert max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <span className="mr-2">🤔</span>
                Qu'est-ce qu'un cookie ?
              </h2>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl">
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Un cookie est un petit fichier texte stocké sur votre appareil lorsque vous visitez un site web. 
                  Les cookies nous permettent de reconnaître votre navigateur et de capturer et mémoriser certaines informations.
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  Ils sont essentiels pour offrir une expérience personnalisée et améliorer les fonctionnalités de notre site.
                </p>
              </div>
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <span className="mr-2">🔧</span>
                Comment utilisons-nous les cookies ?
              </h2>
              <div className="grid gap-4">
                <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-xl border border-green-200 dark:border-green-800">
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-green-900 dark:text-green-300">Cookies essentiels</h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">
                    Ces cookies sont nécessaires au fonctionnement du site et ne peuvent pas être désactivés. 
                    Ils incluent les cookies d'authentification, de session et de sécurité.
                  </p>
                  <div className="mt-3 text-sm text-green-700 dark:text-green-400">
                    <strong>Exemples :</strong> token d'authentification, préférences de session, protection CSRF
                  </div>
                </div>
                
                <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-blue-900 dark:text-blue-300">Cookies de préférences</h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">
                    Ces cookies nous permettent de mémoriser vos préférences comme le thème sombre/clair, 
                    la langue d'interface et vos paramètres personnalisés.
                  </p>
                  <div className="mt-3 text-sm text-blue-700 dark:text-blue-400">
                    <strong>Exemples :</strong> thème choisi, langue préférée, paramètres d'affichage
                  </div>
                </div>
                
                <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-xl border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-purple-900 dark:text-purple-300">Cookies analytiques</h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">
                    Ces cookies nous aident à comprendre comment vous utilisez notre site pour améliorer 
                    votre expérience utilisateur et optimiser nos fonctionnalités.
                  </p>
                  <div className="mt-3 text-sm text-purple-700 dark:text-purple-400">
                    <strong>Exemples :</strong> pages visitées, temps passé, interactions avec les fonctionnalités
                  </div>
                </div>

                <div className="bg-pink-50 dark:bg-pink-900/20 p-6 rounded-xl border border-pink-200 dark:border-pink-800">
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-pink-900 dark:text-pink-300">Cookies marketing</h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">
                    Ces cookies sont utilisés pour vous proposer des publicités et du contenu personnalisés 
                    basés sur vos intérêts et votre comportement de navigation.
                  </p>
                  <div className="mt-3 text-sm text-pink-700 dark:text-pink-400">
                    <strong>Exemples :</strong> publicités ciblées, recommandations personnalisées, retargeting
                  </div>
                </div>
              </div>
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <span className="mr-2">⚙️</span>
                Gestion des cookies
              </h2>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-xl border border-yellow-200 dark:border-yellow-800">
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Vous avez le contrôle total sur vos cookies. Vous pouvez :
                </p>
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2 mb-4">
                  <li>Utiliser le gestionnaire de cookies sur cette page</li>
                  <li>Configurer votre navigateur pour bloquer certains cookies</li>
                  <li>Supprimer tous les cookies existants</li>
                  <li>Être notifié quand des cookies sont placés</li>
                </ul>
                <div className="bg-yellow-100 dark:bg-yellow-800/30 p-4 rounded-lg">
                  <p className="text-yellow-800 dark:text-yellow-300 text-sm">
                    <strong>⚠️ Important :</strong> Si vous supprimez ou bloquez les cookies essentiels, 
                    certaines fonctionnalités de CollabWave pourraient ne pas fonctionner correctement.
                  </p>
                </div>
              </div>
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <span className="mr-2">🔗</span>
                Cookies tiers
              </h2>
              <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl">
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Nous pouvons utiliser des services tiers qui placent également des cookies sur votre appareil :
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-white dark:bg-gray-700 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Services d'analyse</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Pour comprendre l'utilisation du site et améliorer l'expérience utilisateur.
                    </p>
                  </div>
                  <div className="bg-white dark:bg-gray-700 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Support client</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Pour fournir une assistance personnalisée et améliorer notre support.
                    </p>
                  </div>
                </div>
              </div>
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <span className="mr-2">📞</span>
                Contact
              </h2>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl">
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Si vous avez des questions concernant notre utilisation des cookies ou souhaitez exercer vos droits, 
                  n'hésitez pas à nous contacter :
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link 
                    href="/contact" 
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Nous contacter
                  </Link>
                  <a 
                    href="mailto:privacy@collabwave.com" 
                    className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                    privacy@collabwave.com
                  </a>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
} 