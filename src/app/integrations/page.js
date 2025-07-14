'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import Cookies from 'js-cookie'
import toast from 'react-hot-toast'
import { withMaintenanceCheck } from '@/lib/withMaintenanceCheck'

function IntegrationsPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('api')
  const [apiKey, setApiKey] = useState('')
  const [showApiKey, setShowApiKey] = useState(false)
  const [webhooks, setWebhooks] = useState([])
  const [showCreateWebhook, setShowCreateWebhook] = useState(false)
  const [apiUsage, setApiUsage] = useState(null)
  const [selectedTech, setSelectedTech] = useState('javascript')
  const [loading, setLoading] = useState(false)
  const [copyStates, setCopyStates] = useState({})

  // États pour webhook
  const [webhookName, setWebhookName] = useState('')
  const [webhookUrl, setWebhookUrl] = useState('')
  const [webhookEvents, setWebhookEvents] = useState([])
  const [webhookSecret, setWebhookSecret] = useState('')

  const technologies = [
    { id: 'javascript', name: 'JavaScript', color: 'yellow', icon: '🟨' },
    { id: 'python', name: 'Python', color: 'blue', icon: '🐍' },
    { id: 'php', name: 'PHP', color: 'purple', icon: '🐘' },
    { id: 'curl', name: 'cURL', color: 'green', icon: '🌐' },
    { id: 'node', name: 'Node.js', color: 'green', icon: '🟢' }
  ]

  const availableEvents = [
    { id: 'project.created', name: 'Projet créé', description: 'Déclenché lors de la création d\'un nouveau projet' },
    { id: 'project.updated', name: 'Projet modifié', description: 'Déclenché lors de la modification d\'un projet' },
    { id: 'project.deleted', name: 'Projet supprimé', description: 'Déclenché lors de la suppression d\'un projet' },
    { id: 'todo.created', name: 'Tâche créée', description: 'Déclenché lors de la création d\'une nouvelle tâche' },
    { id: 'todo.updated', name: 'Tâche modifiée', description: 'Déclenché lors de la modification d\'une tâche' },
    { id: 'todo.completed', name: 'Tâche terminée', description: 'Déclenché lorsqu\'une tâche est marquée comme terminée' },
    { id: 'collaboration.added', name: 'Collaborateur ajouté', description: 'Déclenché lors de l\'ajout d\'un collaborateur' }
  ]

  const integrations = [
    {
      id: 'slack',
      name: 'Slack',
      icon: '💬',
      description: 'Recevez des notifications de vos projets directement dans Slack',
      status: 'available',
      color: 'purple'
    },
    {
      id: 'discord',
      name: 'Discord',
      icon: '🎮',
      description: 'Intégrez vos projets avec Discord pour une collaboration en temps réel',
      status: 'available',
      color: 'indigo'
    },
    {
      id: 'zapier',
      name: 'Zapier',
      icon: '⚡',
      description: 'Connectez CollabWave à plus de 3000 applications',
      status: 'coming_soon',
      color: 'orange'
    },
    {
      id: 'github',
      name: 'GitHub',
      icon: '🐱',
      description: 'Synchronisez vos issues GitHub avec vos projets',
      status: 'coming_soon',
      color: 'gray'
    },
    {
      id: 'google_calendar',
      name: 'Google Calendar',
      icon: '📅',
      description: 'Synchronisez vos échéances avec Google Calendar',
      status: 'coming_soon',
      color: 'blue'
    },
    {
      id: 'microsoft_teams',
      name: 'Microsoft Teams',
      icon: '🟣',
      description: 'Intégrez vos projets avec Microsoft Teams',
      status: 'coming_soon',
      color: 'blue'
    }
  ]

  useEffect(() => {
    if (user && activeTab === 'api') {
      fetchApiKey()
      fetchApiUsage()
    }
    if (user && activeTab === 'webhooks') {
      fetchWebhooks()
    }
  }, [user, activeTab])

  const getAuthHeaders = () => {
    const token = Cookies.get('token')
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }

  const fetchApiKey = async () => {
    try {
      const response = await fetch('/api/developer/api-key', {
        headers: getAuthHeaders()
      })
      
      if (response.ok) {
        const data = await response.json()
        setApiKey(data.apiKey || '')
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la clé API:', error)
    }
  }

  const fetchApiUsage = async () => {
    try {
      const response = await fetch('/api/user/api-usage', {
        headers: getAuthHeaders()
      })
      
      if (response.ok) {
        const data = await response.json()
        setApiUsage(data)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error)
    }
  }

  const fetchWebhooks = async () => {
    try {
      const response = await fetch('/api/webhooks', {
        headers: getAuthHeaders()
      })
      
      if (response.ok) {
        const data = await response.json()
        setWebhooks(data.webhooks || [])
      }
    } catch (error) {
      console.error('Erreur lors du chargement des webhooks:', error)
    }
  }

  const generateApiKey = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/developer/api-key', {
        method: 'POST',
        headers: getAuthHeaders()
      })
      
      if (response.ok) {
        const data = await response.json()
        setApiKey(data.apiKey)
        toast.success('Clé API générée avec succès!')
      } else {
        toast.error('Erreur lors de la génération de la clé API')
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors de la génération')
    } finally {
      setLoading(false)
    }
  }

  const regenerateApiKey = async () => {
    if (!confirm('Êtes-vous sûr de vouloir régénérer votre clé API ? L\'ancienne clé sera immédiatement invalidée.')) {
      return
    }

    try {
      setLoading(true)
      const response = await fetch('/api/developer/api-key', {
        method: 'PUT',
        headers: getAuthHeaders()
      })
      
      if (response.ok) {
        const data = await response.json()
        setApiKey(data.apiKey)
        toast.success('Clé API régénérée avec succès!')
      } else {
        toast.error('Erreur lors de la régénération de la clé API')
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors de la régénération')
    } finally {
      setLoading(false)
    }
  }

  const createWebhook = async (e) => {
    e.preventDefault()
    
    if (!webhookName.trim() || !webhookUrl.trim() || webhookEvents.length === 0) {
      toast.error('Veuillez remplir tous les champs obligatoires')
      return
    }

    try {
      setLoading(true)
      const response = await fetch('/api/webhooks', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: webhookName,
          url: webhookUrl,
          events: webhookEvents,
          secret: webhookSecret
        })
      })
      
      if (response.ok) {
        toast.success('Webhook créé avec succès!')
        setShowCreateWebhook(false)
        setWebhookName('')
        setWebhookUrl('')
        setWebhookEvents([])
        setWebhookSecret('')
        fetchWebhooks()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erreur lors de la création du webhook')
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors de la création')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text)
    setCopyStates(prev => ({ ...prev, [key]: true }))
    setTimeout(() => {
      setCopyStates(prev => ({ ...prev, [key]: false }))
    }, 2000)
    toast.success('Copié dans le presse-papiers!')
  }

  const getCodeExample = (tech) => {
    const baseUrl = typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.host}` : 'https://yourapp.com'
    
    switch (tech) {
      case 'javascript':
        return `// Récupérer tous les projets
const response = await fetch('${baseUrl}/api/projects', {
  headers: {
    'Authorization': 'Bearer ${apiKey}',
    'Content-Type': 'application/json'
  }
});

const projects = await response.json();
console.log(projects);

// Créer un nouveau projet
const newProject = await fetch('${baseUrl}/api/projects', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ${apiKey}',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Mon nouveau projet',
    description: 'Description du projet',
    color: '#3B82F6',
    emoji: '🚀'
  })
});`

      case 'python':
        return `import requests

# Configuration
base_url = '${baseUrl}'
headers = {
    'Authorization': 'Bearer ${apiKey}',
    'Content-Type': 'application/json'
}

# Récupérer tous les projets
response = requests.get(f'{base_url}/api/projects', headers=headers)
projects = response.json()
print(projects)

# Créer un nouveau projet
new_project = {
    'name': 'Mon nouveau projet',
    'description': 'Description du projet',
    'color': '#3B82F6',
    'emoji': '🚀'
}

response = requests.post(f'{base_url}/api/projects', 
                        headers=headers, 
                        json=new_project)
print(response.json())`

      case 'php':
        return `<?php
$baseUrl = '${baseUrl}';
$apiKey = '${apiKey}';

$headers = [
    'Authorization: Bearer ' . $apiKey,
    'Content-Type: application/json'
];

// Récupérer tous les projets
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $baseUrl . '/api/projects');
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
$projects = json_decode($response, true);
curl_close($ch);

// Créer un nouveau projet
$newProject = [
    'name' => 'Mon nouveau projet',
    'description' => 'Description du projet',
    'color' => '#3B82F6',
    'emoji' => '🚀'
];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $baseUrl . '/api/projects');
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($newProject));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
curl_close($ch);`

      case 'curl':
        return `# Récupérer tous les projets
curl -X GET "${baseUrl}/api/projects" \\
  -H "Authorization: Bearer ${apiKey}" \\
  -H "Content-Type: application/json"

# Créer un nouveau projet
curl -X POST "${baseUrl}/api/projects" \\
  -H "Authorization: Bearer ${apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Mon nouveau projet",
    "description": "Description du projet",
    "color": "#3B82F6",
    "emoji": "🚀"
  }'

# Récupérer les tâches d'un projet
curl -X GET "${baseUrl}/api/todos?projectId=1" \\
  -H "Authorization: Bearer ${apiKey}" \\
  -H "Content-Type: application/json"`

      case 'node':
        return `const axios = require('axios');

const api = axios.create({
  baseURL: '${baseUrl}/api',
  headers: {
    'Authorization': 'Bearer ${apiKey}',
    'Content-Type': 'application/json'
  }
});

// Récupérer tous les projets
async function getProjects() {
  try {
    const response = await api.get('/projects');
    return response.data;
  } catch (error) {
    console.error('Erreur:', error.response?.data || error.message);
  }
}

// Créer un nouveau projet
async function createProject(projectData) {
  try {
    const response = await api.post('/projects', projectData);
    return response.data;
  } catch (error) {
    console.error('Erreur:', error.response?.data || error.message);
  }
}

// Exemple d'utilisation
getProjects().then(projects => {
  console.log('Projets:', projects);
});`

      default:
        return ''
    }
  }

  const tabs = [
    { id: 'api', label: 'API & Documentation', icon: '🔧' },
    { id: 'webhooks', label: 'Webhooks', icon: '🪝' },
    { id: 'integrations', label: 'Intégrations', icon: '🔗' },
    { id: 'examples', label: 'Exemples', icon: '📚' }
  ]

  const endpoints = [
    { method: 'GET', endpoint: '/api/projects', description: 'Récupérer tous vos projets' },
    { method: 'POST', endpoint: '/api/projects', description: 'Créer un nouveau projet' },
    { method: 'GET', endpoint: '/api/projects/{id}', description: 'Récupérer un projet spécifique' },
    { method: 'PUT', endpoint: '/api/projects/{id}', description: 'Mettre à jour un projet' },
    { method: 'DELETE', endpoint: '/api/projects/{id}', description: 'Supprimer un projet' },
    { method: 'GET', endpoint: '/api/todos', description: 'Récupérer toutes vos tâches' },
    { method: 'POST', endpoint: '/api/todos', description: 'Créer une nouvelle tâche' },
    { method: 'PUT', endpoint: '/api/todos/{id}', description: 'Mettre à jour une tâche' },
    { method: 'DELETE', endpoint: '/api/todos/{id}', description: 'Supprimer une tâche' },
    { method: 'GET', endpoint: '/api/categories', description: 'Récupérer vos catégories' },
    { method: 'POST', endpoint: '/api/categories', description: 'Créer une nouvelle catégorie' },
    { method: 'GET', endpoint: '/api/friends', description: 'Récupérer votre liste d\'amis' },
    { method: 'GET', endpoint: '/api/notifications', description: 'Récupérer vos notifications' }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-20">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent mb-6">
              Intégrations & API
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Connectez CollabWave à vos outils préférés et automatisez vos workflows avec notre API puissante
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/api"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Documentation API
              </Link>
              <button
                onClick={() => setActiveTab('examples')}
                className="inline-flex items-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                Voir les exemples
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* API Tab */}
        {activeTab === 'api' && (
          <div className="space-y-8">
            {/* API Key Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                <svg className="w-6 h-6 mr-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-12 0v-3a2 2 0 012-2h6zM7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
                Clé API
              </h2>
              
              {user ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 dark:text-gray-300">
                        Utilisez votre clé API pour accéder aux endpoints de l'API CollabWave
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Gardez votre clé secrète et ne la partagez jamais publiquement
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {apiKey ? (
                        <button
                          onClick={regenerateApiKey}
                          disabled={loading}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                        >
                          {loading ? 'Génération...' : 'Régénérer'}
                        </button>
                      ) : (
                        <button
                          onClick={generateApiKey}
                          disabled={loading}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                        >
                          {loading ? 'Génération...' : 'Générer une clé'}
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {apiKey && (
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Votre clé API
                          </label>
                          <div className="flex items-center space-x-2">
                            <input
                              type={showApiKey ? 'text' : 'password'}
                              value={apiKey}
                              readOnly
                              className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg font-mono text-sm"
                            />
                            <button
                              onClick={() => setShowApiKey(!showApiKey)}
                              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                              {showApiKey ? '🙈' : '👁️'}
                            </button>
                            <button
                              onClick={() => copyToClipboard(apiKey, 'apiKey')}
                              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                              {copyStates.apiKey ? '✅' : '📋'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    Vous devez être connecté pour accéder à votre clé API
                  </p>
                  <Link
                    href="/auth/login"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Se connecter
                  </Link>
                </div>
              )}
            </div>

            {/* API Usage Stats */}
            {user && apiUsage && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Utilisation de l'API
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {apiUsage.usage?.current || 0}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Requêtes ce mois
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-500">
                      Limite: {apiUsage.usage?.limit || 0}
                    </div>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {apiUsage.usage?.remaining || 0}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Requêtes restantes
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-500">
                      Plan: {apiUsage.plan?.name || 'Gratuit'}
                    </div>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {apiUsage.rateLimit?.requestsPerMinute || 0}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Limite par minute
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-500">
                      Rate limiting
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* API Endpoints */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                Endpoints disponibles
              </h3>
              <div className="space-y-3">
                {endpoints.map((endpoint, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        endpoint.method === 'GET' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                        endpoint.method === 'POST' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        endpoint.method === 'PUT' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                        'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {endpoint.method}
                      </span>
                      <code className="font-mono text-sm text-gray-900 dark:text-gray-100">
                        {endpoint.endpoint}
                      </code>
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {endpoint.description}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Webhooks Tab */}
        {activeTab === 'webhooks' && (
          <div className="space-y-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                  <svg className="w-6 h-6 mr-3 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  Webhooks
                </h2>
                <button
                  onClick={() => setShowCreateWebhook(true)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Créer un webhook
                </button>
              </div>

              {user ? (
                <div>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    Les webhooks permettent de recevoir des notifications en temps réel lorsque des événements se produisent dans vos projets.
                  </p>

                  {/* Create Webhook Form */}
                  {showCreateWebhook && (
                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6 mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Créer un nouveau webhook
                      </h3>
                      <form onSubmit={createWebhook} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Nom du webhook
                            </label>
                            <input
                              type="text"
                              value={webhookName}
                              onChange={(e) => setWebhookName(e.target.value)}
                              placeholder="Mon webhook Slack"
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              URL du webhook
                            </label>
                            <input
                              type="url"
                              value={webhookUrl}
                              onChange={(e) => setWebhookUrl(e.target.value)}
                              placeholder="https://hooks.slack.com/services/..."
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              required
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Événements à surveiller
                          </label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {availableEvents.map((event) => (
                              <label key={event.id} className="flex items-center space-x-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={webhookEvents.includes(event.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setWebhookEvents([...webhookEvents, event.id])
                                    } else {
                                      setWebhookEvents(webhookEvents.filter(id => id !== event.id))
                                    }
                                  }}
                                  className="rounded border-gray-300 dark:border-gray-600 text-purple-600 focus:ring-purple-500"
                                />
                                <div>
                                  <div className="font-medium text-gray-900 dark:text-white text-sm">
                                    {event.name}
                                  </div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {event.description}
                                  </div>
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Secret (optionnel)
                          </label>
                          <input
                            type="password"
                            value={webhookSecret}
                            onChange={(e) => setWebhookSecret(e.target.value)}
                            placeholder="Secret pour valider les requêtes"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Utilisé pour signer les requêtes webhook avec HMAC-SHA256
                          </p>
                        </div>
                        
                        <div className="flex gap-2">
                          <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
                          >
                            {loading ? 'Création...' : 'Créer le webhook'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowCreateWebhook(false)}
                            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                          >
                            Annuler
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Webhooks List */}
                  {webhooks.length > 0 ? (
                    <div className="space-y-4">
                      {webhooks.map((webhook) => (
                        <div key={webhook.id} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold text-gray-900 dark:text-white">
                                {webhook.name}
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {webhook.url}
                              </p>
                              <div className="flex flex-wrap gap-1 mt-2">
                                {webhook.events.map((event) => (
                                  <span key={event} className="px-2 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded text-xs">
                                    {event}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                webhook.active 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              }`}>
                                {webhook.active ? 'Actif' : 'Inactif'}
                              </span>
                              <button className="text-red-500 hover:text-red-700 p-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                      <p className="text-gray-500 dark:text-gray-400">
                        Aucun webhook configuré
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    Vous devez être connecté pour gérer vos webhooks
                  </p>
                  <Link
                    href="/auth/login"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Se connecter
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Integrations Tab */}
        {activeTab === 'integrations' && (
          <div className="space-y-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                <svg className="w-6 h-6 mr-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                Intégrations disponibles
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {integrations.map((integration) => (
                  <div key={integration.id} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">{integration.icon}</div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {integration.name}
                        </h3>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        integration.status === 'available' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      }`}>
                        {integration.status === 'available' ? 'Disponible' : 'Bientôt'}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {integration.description}
                    </p>
                    {integration.status === 'available' ? (
                      <Link
                        href={`/integrations/${integration.id}`}
                        className={`w-full px-4 py-2 rounded-lg font-medium transition-colors text-center block bg-${integration.color}-600 text-white hover:bg-${integration.color}-700`}
                      >
                        Configurer
                      </Link>
                    ) : (
                      <button
                        disabled
                        className="w-full px-4 py-2 rounded-lg font-medium transition-colors bg-gray-200 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400"
                      >
                        Bientôt disponible
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Examples Tab */}
        {activeTab === 'examples' && (
          <div className="space-y-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                <svg className="w-6 h-6 mr-3 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                Exemples de code
              </h2>
              
              {/* Technology Selector */}
              <div className="flex flex-wrap gap-2 mb-6">
                {technologies.map((tech) => (
                  <button
                    key={tech.id}
                    onClick={() => setSelectedTech(tech.id)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedTech === tech.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    <span className="mr-2">{tech.icon}</span>
                    {tech.name}
                  </button>
                ))}
              </div>

              {/* Code Example */}
              <div className="bg-gray-900 rounded-lg p-6 overflow-x-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-semibold">
                    Exemple {technologies.find(t => t.id === selectedTech)?.name}
                  </h3>
                  <button
                    onClick={() => copyToClipboard(getCodeExample(selectedTech), 'code')}
                    className="px-3 py-1 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors text-sm"
                  >
                    {copyStates.code ? '✅ Copié' : '📋 Copier'}
                  </button>
                </div>
                <pre className="text-green-400 font-mono text-sm overflow-x-auto whitespace-pre-wrap">
                  {getCodeExample(selectedTech)}
                </pre>
              </div>
            </div>

            {/* Webhook Example */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Exemple de payload webhook
              </h3>
              <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                <pre className="text-green-400 font-mono text-sm">
{`{
  "event": "project.created",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "project": {
      "id": 123,
      "name": "Mon nouveau projet",
      "description": "Description du projet",
      "color": "#3B82F6",
      "emoji": "🚀",
      "userId": 456,
      "createdAt": "2024-01-15T10:30:00Z"
    },
    "user": {
      "id": 456,
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}`}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white relative">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
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
          <div className="border-t border-gray-800 mt-12 pt-8">
            <div className="flex flex-col lg:flex-row justify-between items-center">
              <div className="mb-6 lg:mb-0">
                <h3 className="text-lg font-semibold mb-2">Restez informé</h3>
                <p className="text-gray-300">Recevez les dernières nouvelles et mises à jour de <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">CollabWave</span>.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <input type="email" placeholder="Votre adresse email" className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                <button className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium">S'abonner</button>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8">
            <div className="flex flex-col lg:flex-row justify-between items-center">
              <div className="flex flex-wrap justify-center lg:justify-start gap-6 mb-4 lg:mb-0">
                <Link href="/privacy" className="text-gray-400 hover:text-purple-500 transition-colors text-sm">Politique de confidentialité</Link>
                <Link href="/terms" className="text-gray-400 hover:text-purple-500 transition-colors text-sm">Conditions d'utilisation</Link>
                <Link href="/cookies" className="text-gray-400 hover:text-purple-500 transition-colors text-sm">Politique des cookies</Link>
                <Link href="/legal" className="text-gray-400 hover:text-purple-500 transition-colors text-sm">Mentions légales</Link>
                <Link href="/gdpr" className="text-gray-400 hover:text-purple-500 transition-colors text-sm">RGPD</Link>
              </div>
              <div className="text-gray-400 text-sm">© {new Date().getFullYear()} CollabWave. Tous droits réservés.</div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default withMaintenanceCheck(IntegrationsPage) 