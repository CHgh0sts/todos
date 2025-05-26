'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import Cookies from 'js-cookie'

export default function ApiPage() {
  const { user } = useAuth()
  const [apiKey, setApiKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [activeTab, setActiveTab] = useState('overview')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (user) {
      fetchApiKey()
    }
  }, [user])

  const fetchApiKey = async () => {
    try {
      const token = Cookies.get('token')
      if (!token) {
        setError('Vous devez être connecté pour accéder à cette fonctionnalité')
        return
      }

      const response = await fetch('/api/developer/api-key', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setApiKey(data.apiKey || '')
        setError('') // Clear any previous errors
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Erreur lors de la récupération de la clé API')
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de la clé API:', error)
      setError('Erreur de connexion au serveur')
    }
  }

  const generateApiKey = async () => {
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const token = Cookies.get('token')
      const response = await fetch('/api/developer/api-key', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setApiKey(data.apiKey)
        setSuccess('Clé API générée avec succès !')
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Erreur lors de la génération de la clé API')
      }
    } catch (error) {
      setError('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  const regenerateApiKey = async () => {
    if (!confirm('Êtes-vous sûr de vouloir régénérer votre clé API ? L\'ancienne clé ne fonctionnera plus.')) {
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const token = Cookies.get('token')
      const response = await fetch('/api/developer/api-key', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setApiKey(data.apiKey)
        setSuccess('Clé API régénérée avec succès !')
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Erreur lors de la régénération de la clé API')
      }
    } catch (error) {
      setError('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(apiKey)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Erreur lors de la copie:', error)
    }
  }

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: '📋' },
    { id: 'authentication', label: 'Authentification', icon: '🔐' },
    { id: 'endpoints', label: 'Endpoints', icon: '🔗' },
    { id: 'examples', label: 'Exemples', icon: '💡' },
    { id: 'limits', label: 'Limites', icon: '⚡' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900">
      <div className="w-full">
        {/* Header */}
        <div className="text-center py-12 px-4">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            API CollabWave
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Intégrez la puissance de CollabWave dans vos applications avec notre API RESTful complète
          </p>
        </div>

        {/* API Key Section pour les utilisateurs connectés */}
        {user && (
          <div className="max-w-6xl mx-auto px-4 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <span className="mr-2">🔑</span>
                Votre clé API
              </h2>
              
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg mb-4">
                  {error}
                </div>
              )}
              
              {success && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-4 py-3 rounded-lg mb-4">
                  {success}
                </div>
              )}

              {apiKey ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex-1 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 border border-gray-200 dark:border-gray-600 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium">Votre clé API</p>
                          <code className="text-sm font-mono text-gray-900 dark:text-white break-all select-all">
                            {apiKey}
                          </code>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={copyToClipboard}
                      className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 flex items-center space-x-2 shadow-md hover:shadow-lg transform hover:scale-105"
                    >
                      {copied ? (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="font-medium">Copié</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          <span className="font-medium">Copier</span>
                        </>
                      )}
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      <span className="inline-flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        Gardez cette clé secrète et sécurisée
                      </span>
                    </div>
                    <button
                      onClick={regenerateApiKey}
                      disabled={loading}
                      className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md"
                    >
                      {loading ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Régénération...
                        </span>
                      ) : (
                        'Régénérer la clé'
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Générez votre première clé API
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
                    Créez une clé API pour commencer à utiliser l'API CollabWave dans vos applications.
                  </p>
                  <button
                    onClick={generateApiKey}
                    disabled={loading}
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl font-medium"
                  >
                    {loading ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Génération en cours...
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                        Générer une clé API
                      </span>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Login prompt pour les utilisateurs non connectés */}
        {!user && (
          <div className="max-w-6xl mx-auto px-4 mb-8">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Commencez avec l'API CollabWave</h2>
              <p className="mb-6">Connectez-vous pour obtenir votre clé API et accéder à la documentation complète</p>
              <div className="space-x-4">
                <Link
                  href="/auth/login"
                  className="inline-block px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  Se connecter
                </Link>
                <Link
                  href="/auth/register"
                  className="inline-block px-6 py-3 border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
                >
                  Créer un compte
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Navigation tabs */}
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="flex space-x-8 px-6">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    <span className="mr-2">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {/* Vue d'ensemble */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                      Qu'est-ce que l'API CollabWave ?
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      L'API CollabWave vous permet d'intégrer nos fonctionnalités de gestion de projets collaboratifs 
                      directement dans vos applications. Créez, gérez et synchronisez vos projets, tâches et équipes 
                      en temps réel.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">🚀 Fonctionnalités</h4>
                      <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                        <li>• Gestion complète des projets</li>
                        <li>• CRUD des tâches et catégories</li>
                        <li>• Collaboration en temps réel</li>
                        <li>• Notifications et invitations</li>
                        <li>• Gestion des utilisateurs</li>
                      </ul>
                    </div>

                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                      <h4 className="font-semibold text-green-900 dark:text-green-300 mb-2">⚡ Avantages</h4>
                      <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                        <li>• API RESTful simple</li>
                        <li>• Authentification JWT sécurisée</li>
                        <li>• Webhooks pour les événements</li>
                        <li>• Documentation interactive</li>
                        <li>• Support technique dédié</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Authentification */}
              {activeTab === 'authentication' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                      Authentification
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      L'API CollabWave utilise l'authentification par clé API. Incluez votre clé dans l'en-tête 
                      de chaque requête.
                    </p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">En-tête requis</h4>
                    <pre className="text-sm text-gray-600 dark:text-gray-300 font-mono">
{`Authorization: Bearer YOUR_API_KEY`}
                    </pre>
                  </div>

                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                    <h4 className="font-semibold text-yellow-900 dark:text-yellow-300 mb-2">⚠️ Sécurité</h4>
                    <ul className="text-sm text-yellow-800 dark:text-yellow-300 space-y-1">
                      <li>• Ne partagez jamais votre clé API</li>
                      <li>• Utilisez HTTPS uniquement</li>
                      <li>• Régénérez votre clé si elle est compromise</li>
                      <li>• Stockez-la de manière sécurisée côté serveur</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Endpoints */}
              {activeTab === 'endpoints' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                      Endpoints disponibles
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      Base URL: <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">https://todo.chghosts.fr/api</code>
                    </p>
                  </div>

                  <div className="space-y-4">
                    {[
                      { method: 'GET', endpoint: '/projects', description: 'Récupérer tous les projets' },
                      { method: 'POST', endpoint: '/projects', description: 'Créer un nouveau projet' },
                      { method: 'GET', endpoint: '/projects/{id}', description: 'Récupérer un projet spécifique' },
                      { method: 'PUT', endpoint: '/projects/{id}', description: 'Mettre à jour un projet' },
                      { method: 'DELETE', endpoint: '/projects/{id}', description: 'Supprimer un projet' },
                      { method: 'GET', endpoint: '/todos', description: 'Récupérer toutes les tâches' },
                      { method: 'POST', endpoint: '/todos', description: 'Créer une nouvelle tâche' },
                      { method: 'PUT', endpoint: '/todos/{id}', description: 'Mettre à jour une tâche' },
                      { method: 'DELETE', endpoint: '/todos/{id}', description: 'Supprimer une tâche' },
                    ].map((endpoint, index) => (
                      <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <span className={`px-2 py-1 text-xs font-semibold rounded ${
                          endpoint.method === 'GET' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                          endpoint.method === 'POST' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                          endpoint.method === 'PUT' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300' :
                          'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                        }`}>
                          {endpoint.method}
                        </span>
                        <code className="font-mono text-sm text-gray-700 dark:text-gray-300">
                          {endpoint.endpoint}
                        </code>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {endpoint.description}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Exemples */}
              {activeTab === 'examples' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                      Exemples de code
                    </h3>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">JavaScript / Node.js</h4>
                      <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                        <pre className="text-sm">
{`// Récupérer tous les projets
const response = await fetch('https://todo.chghosts.fr/api/projects', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

const projects = await response.json();
console.log(projects);

// Créer un nouveau projet
const newProject = await fetch('https://todo.chghosts.fr/api/projects', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Mon nouveau projet',
    description: 'Description du projet',
    color: '#3B82F6',
    emoji: '🚀'
  })
});`}
                        </pre>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Python</h4>
                      <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                        <pre className="text-sm">
{`import requests

# Configuration
API_KEY = "YOUR_API_KEY"
BASE_URL = "https://todo.chghosts.fr/api"
headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

# Récupérer tous les projets
response = requests.get(f"{BASE_URL}/projects", headers=headers)
projects = response.json()
print(projects)

# Créer un nouveau projet
new_project = {
    "name": "Mon nouveau projet",
    "description": "Description du projet",
    "color": "#3B82F6",
    "emoji": "🚀"
}

response = requests.post(f"{BASE_URL}/projects", 
                        headers=headers, 
                        json=new_project)
project = response.json()`}
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Limites */}
              {activeTab === 'limits' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                      Limites et quotas
                    </h3>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">Plan Gratuit</h4>
                      <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                        <li>• 1 000 requêtes/mois</li>
                        <li>• 10 requêtes/minute</li>
                        <li>• Accès aux endpoints de base</li>
                        <li>• Support communautaire</li>
                      </ul>
                    </div>

                    <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                      <h4 className="font-semibold text-purple-900 dark:text-purple-300 mb-2">Plan Pro</h4>
                      <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                        <li>• 100 000 requêtes/mois</li>
                        <li>• 100 requêtes/minute</li>
                        <li>• Accès complet à l'API</li>
                        <li>• Webhooks inclus</li>
                        <li>• Support prioritaire</li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                    <h4 className="font-semibold text-yellow-900 dark:text-yellow-300 mb-2">📊 Codes de réponse</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border">
                        <span className="font-mono font-semibold text-green-600 dark:text-green-400">200</span>
                        <span className="text-gray-600 dark:text-gray-300">Succès</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border">
                        <span className="font-mono font-semibold text-red-600 dark:text-red-400">401</span>
                        <span className="text-gray-600 dark:text-gray-300">Non autorisé</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border">
                        <span className="font-mono font-semibold text-orange-600 dark:text-orange-400">403</span>
                        <span className="text-gray-600 dark:text-gray-300">Accès refusé</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border">
                        <span className="font-mono font-semibold text-purple-600 dark:text-purple-400">429</span>
                        <span className="text-gray-600 dark:text-gray-300">Limite de taux dépassée</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="max-w-6xl mx-auto px-4 mt-12">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Prêt à commencer ?</h2>
            <p className="mb-6">Rejoignez des milliers de développeurs qui utilisent déjà l'API CollabWave</p>
            {!user && (
              <Link
                href="/auth/register"
                className="inline-block px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Créer un compte gratuit
              </Link>
            )}
            {user && !apiKey && (
              <button
                onClick={generateApiKey}
                disabled={loading}
                className="px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Génération...' : 'Générer ma clé API'}
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-gray-900 text-white mt-16 relative">
          {/* Bordure dégradée en haut */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
          
          <div className="mx-auto px-4 py-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Logo et description */}
              <div className="lg:col-span-1">
                <div className="flex items-center space-x-2 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">W</span>
                  </div>
                  <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    CollabWave
                  </span>
                </div>
                <p className="text-gray-300 mb-6 leading-relaxed">
                  La plateforme collaborative moderne pour gérer vos projets et tâches en équipe avec des mises à jour en temps réel.
                </p>
                <div className="flex space-x-4">
                  <a href="#" className="text-gray-400 hover:text-purple-500 transition-colors">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                    </svg>
                  </a>
                  <a href="#" className="text-gray-400 hover:text-purple-500 transition-colors">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                    </svg>
                  </a>
                  <a href="#" className="text-gray-400 hover:text-purple-500 transition-colors">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </a>
                </div>
              </div>

              {/* Produit */}
              <div>
                <h3 className="text-lg font-semibold mb-6">Produit</h3>
                <ul className="space-y-3">
                  <li><Link href="/features" className="text-gray-300 hover:text-purple-500 transition-colors">Fonctionnalités</Link></li>
                  <li><Link href="/pricing" className="text-gray-300 hover:text-purple-500 transition-colors">Tarifs</Link></li>
                  <li><Link href="/security" className="text-gray-300 hover:text-purple-500 transition-colors">Sécurité</Link></li>
                  <li><Link href="/integrations" className="text-gray-300 hover:text-purple-500 transition-colors">Intégrations</Link></li>
                  <li><Link href="/api" className="text-gray-300 hover:text-purple-500 transition-colors">API</Link></li>
                </ul>
              </div>

              {/* Support */}
              <div>
                <h3 className="text-lg font-semibold mb-6">Support</h3>
                <ul className="space-y-3">
                  <li><Link href="/help" className="text-gray-300 hover:text-purple-500 transition-colors">Centre d'aide</Link></li>
                  <li><Link href="/documentation" className="text-gray-300 hover:text-purple-500 transition-colors">Documentation</Link></li>
                  <li><Link href="/tutorials" className="text-gray-300 hover:text-purple-500 transition-colors">Tutoriels</Link></li>
                  <li><Link href="/contact" className="text-gray-300 hover:text-purple-500 transition-colors">Contact</Link></li>
                  <li><Link href="/status" className="text-gray-300 hover:text-purple-500 transition-colors">Statut du service</Link></li>
                </ul>
              </div>

              {/* Entreprise */}
              <div>
                <h3 className="text-lg font-semibold mb-6">Entreprise</h3>
                <ul className="space-y-3">
                  <li><Link href="/about" className="text-gray-300 hover:text-purple-500 transition-colors">À propos</Link></li>
                  <li><Link href="/blog" className="text-gray-300 hover:text-purple-500 transition-colors">Blog</Link></li>
                  <li><Link href="/careers" className="text-gray-300 hover:text-purple-500 transition-colors">Carrières</Link></li>
                  <li><Link href="/press" className="text-gray-300 hover:text-purple-500 transition-colors">Presse</Link></li>
                  <li><Link href="/partners" className="text-gray-300 hover:text-purple-500 transition-colors">Partenaires</Link></li>
                </ul>
              </div>
            </div>

            {/* Newsletter */}
            <div className="border-t border-gray-800 mt-12 pt-8">
              <div className="flex flex-col lg:flex-row justify-between items-center">
                <div className="mb-6 lg:mb-0">
                  <h3 className="text-lg font-semibold mb-2">Restez informé</h3>
                  <p className="text-gray-300">Recevez les dernières nouvelles et mises à jour de <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  CollabWave
                </span>.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    placeholder="Votre adresse email"
                    className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                  <button className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium">
                    S'abonner
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom footer */}
            <div className="border-t border-gray-800 mt-8 pt-8">
              <div className="flex flex-col lg:flex-row justify-between items-center">
                <div className="flex flex-wrap justify-center lg:justify-start gap-6 mb-4 lg:mb-0">
                  <Link href="/privacy" className="text-gray-400 hover:text-purple-500 transition-colors text-sm">
                    Politique de confidentialité
                  </Link>
                  <Link href="/terms" className="text-gray-400 hover:text-purple-500 transition-colors text-sm">
                    Conditions d'utilisation
                  </Link>
                  <Link href="/cookies" className="text-gray-400 hover:text-purple-500 transition-colors text-sm">
                    Politique des cookies
                  </Link>
                  <Link href="/legal" className="text-gray-400 hover:text-purple-500 transition-colors text-sm">
                    Mentions légales
                  </Link>
                  <Link href="/gdpr" className="text-gray-400 hover:text-purple-500 transition-colors text-sm">
                    RGPD
                  </Link>
                </div>
                <div className="text-gray-400 text-sm">
                  © {new Date().getFullYear()} CollabWave. Tous droits réservés.
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
} 