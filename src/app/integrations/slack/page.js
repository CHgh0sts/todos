'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Cookies from 'js-cookie'
import toast from 'react-hot-toast'
import { withMaintenanceCheck } from '@/lib/withMaintenanceCheck'

function SlackIntegrationPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [configured, setConfigured] = useState(false)
  const [config, setConfig] = useState(null)
  
  // États du formulaire
  const [webhookUrl, setWebhookUrl] = useState('')
  const [channel, setChannel] = useState('#general')
  const [selectedEvents, setSelectedEvents] = useState([])
  const [isEditing, setIsEditing] = useState(false)

  const availableEvents = [
    { id: 'project.created', name: 'Nouveau projet', description: 'Quand un projet est créé' },
    { id: 'project.updated', name: 'Projet modifié', description: 'Quand un projet est modifié' },
    { id: 'project.deleted', name: 'Projet supprimé', description: 'Quand un projet est supprimé' },
    { id: 'todo.created', name: 'Nouvelle tâche', description: 'Quand une tâche est créée' },
    { id: 'todo.updated', name: 'Tâche modifiée', description: 'Quand une tâche est modifiée' },
    { id: 'todo.completed', name: 'Tâche terminée', description: 'Quand une tâche est marquée comme terminée' },
    { id: 'collaboration.added', name: 'Nouveau collaborateur', description: 'Quand un collaborateur est ajouté' }
  ]

  useEffect(() => {
    if (user) {
      fetchConfig()
    }
  }, [user])

  const getAuthHeaders = () => {
    const token = Cookies.get('token')
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }

  const fetchConfig = async () => {
    try {
      const response = await fetch('/api/integrations/slack', {
        headers: getAuthHeaders()
      })
      
      if (response.ok) {
        const data = await response.json()
        setConfigured(data.configured)
        setConfig(data.settings)
        
        if (data.settings) {
          setChannel(data.settings.channel || '#general')
          setSelectedEvents(data.settings.events || [])
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la configuration:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!webhookUrl.trim() || !channel.trim() || selectedEvents.length === 0) {
      toast.error('Veuillez remplir tous les champs obligatoires')
      return
    }

    try {
      setLoading(true)
      const response = await fetch('/api/integrations/slack', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          webhookUrl,
          channel,
          events: selectedEvents
        })
      })
      
      if (response.ok) {
        toast.success('Intégration Slack configurée avec succès!')
        setIsEditing(false)
        fetchConfig()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erreur lors de la configuration')
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors de la configuration')
    } finally {
      setLoading(false)
    }
  }

  const handleDisable = async () => {
    if (!confirm('Êtes-vous sûr de vouloir désactiver l\'intégration Slack ?')) {
      return
    }

    try {
      setLoading(true)
      const response = await fetch('/api/integrations/slack', {
        method: 'DELETE',
        headers: getAuthHeaders()
      })
      
      if (response.ok) {
        toast.success('Intégration Slack désactivée')
        setConfigured(false)
        setConfig(null)
        setIsEditing(false)
      } else {
        toast.error('Erreur lors de la désactivation')
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors de la désactivation')
    } finally {
      setLoading(false)
    }
  }

  const handleEventToggle = (eventId) => {
    setSelectedEvents(prev => 
      prev.includes(eventId) 
        ? prev.filter(id => id !== eventId)
        : [...prev, eventId]
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Vous devez être connecté pour accéder aux intégrations
          </p>
          <Link
            href="/auth/login"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Se connecter
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/integrations"
            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Retour aux intégrations
          </Link>
          
          <div className="flex items-center space-x-4">
            <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-3">
              <span className="text-3xl">💬</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Intégration Slack
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Recevez des notifications de vos projets directement dans Slack
              </p>
            </div>
          </div>
        </div>

        {/* Configuration Status */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                État de l'intégration
              </h2>
              <div className="flex items-center space-x-2">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  configured 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}>
                  {configured ? '✅ Configurée' : '❌ Non configurée'}
                </span>
                {configured && config && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Canal: {config.channel} • {config.events?.length || 0} événement(s)
                  </span>
                )}
              </div>
            </div>
            <div className="space-x-2">
              {configured && !isEditing && (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={handleDisable}
                    disabled={loading}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                  >
                    {loading ? 'Désactivation...' : 'Désactiver'}
                  </button>
                </>
              )}
              {(!configured || isEditing) && (
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Annuler
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Configuration Form */}
        {(!configured || isEditing) && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Configuration Slack
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  URL du webhook Slack *
                </label>
                <input
                  type="url"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://hooks.slack.com/services/..."
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Créez un webhook dans votre espace Slack et copiez l'URL ici
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Canal Slack *
                </label>
                <input
                  type="text"
                  value={channel}
                  onChange={(e) => setChannel(e.target.value)}
                  placeholder="#general"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Le canal où les notifications seront envoyées (avec # pour les canaux publics)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                  Événements à notifier *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {availableEvents.map((event) => (
                    <label key={event.id} className="flex items-start space-x-3 p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedEvents.includes(event.id)}
                        onChange={() => handleEventToggle(event.id)}
                        className="mt-1 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {event.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {event.description}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
                {selectedEvents.length === 0 && (
                  <p className="text-sm text-red-500 mt-2">
                    Sélectionnez au moins un événement
                  </p>
                )}
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="submit"
                  disabled={loading || selectedEvents.length === 0}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium"
                >
                  {loading ? 'Configuration...' : 'Configurer Slack'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4">
            📋 Instructions de configuration
          </h3>
          <ol className="space-y-2 text-blue-800 dark:text-blue-200">
            <li>1. Allez dans votre espace Slack</li>
            <li>2. Cliquez sur votre nom d'espace → Paramètres et administration → Gérer les applications</li>
            <li>3. Recherchez "Incoming Webhooks" et cliquez dessus</li>
            <li>4. Cliquez sur "Ajouter à Slack"</li>
            <li>5. Choisissez le canal par défaut et cliquez sur "Ajouter l'intégration Incoming WebHooks"</li>
            <li>6. Copiez l'URL du webhook et collez-la dans le champ ci-dessus</li>
            <li>7. Sélectionnez les événements que vous souhaitez recevoir</li>
            <li>8. Cliquez sur "Configurer Slack"</li>
          </ol>
        </div>
      </div>
    </div>
  )
}

export default withMaintenanceCheck(SlackIntegrationPage) 