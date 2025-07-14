'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Cookies from 'js-cookie'
import toast from 'react-hot-toast'
import { withMaintenanceCheck } from '@/lib/withMaintenanceCheck'

function DiscordIntegrationPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [configured, setConfigured] = useState(false)
  const [config, setConfig] = useState(null)
  
  // États du formulaire
  const [webhookUrl, setWebhookUrl] = useState('')
  const [serverName, setServerName] = useState('')
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
      const response = await fetch('/api/integrations/discord', {
        headers: getAuthHeaders()
      })
      
      if (response.ok) {
        const data = await response.json()
        setConfigured(data.configured)
        setConfig(data.settings)
        
        if (data.settings) {
          setServerName(data.settings.serverName || '')
          setSelectedEvents(data.settings.events || [])
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la configuration:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!webhookUrl.trim() || !serverName.trim() || selectedEvents.length === 0) {
      toast.error('Veuillez remplir tous les champs obligatoires')
      return
    }

    try {
      setLoading(true)
      const response = await fetch('/api/integrations/discord', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          webhookUrl,
          serverName,
          events: selectedEvents
        })
      })
      
      if (response.ok) {
        toast.success('Intégration Discord configurée avec succès!')
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
    if (!confirm('Êtes-vous sûr de vouloir désactiver l\'intégration Discord ?')) {
      return
    }

    try {
      setLoading(true)
      const response = await fetch('/api/integrations/discord', {
        method: 'DELETE',
        headers: getAuthHeaders()
      })
      
      if (response.ok) {
        toast.success('Intégration Discord désactivée')
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
            <div className="bg-indigo-100 dark:bg-indigo-900/20 rounded-lg p-3">
              <svg className="w-8 h-8 text-indigo-600 dark:text-indigo-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Intégration Discord
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Recevez des notifications de vos projets directement dans Discord
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
                    Serveur: {config.serverName} • {config.events?.length || 0} événement(s)
                  </span>
                )}
              </div>
            </div>
            <div className="space-x-2">
              {configured && !isEditing && (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
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
              Configuration Discord
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  URL du webhook Discord *
                </label>
                <input
                  type="url"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://discord.com/api/webhooks/..."
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Créez un webhook dans votre serveur Discord et copiez l'URL ici
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nom du serveur Discord *
                </label>
                <input
                  type="text"
                  value={serverName}
                  onChange={(e) => setServerName(e.target.value)}
                  placeholder="Mon serveur Discord"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Le nom de votre serveur Discord pour référence
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
                        className="mt-1 rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500"
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
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors font-medium"
                >
                  {loading ? 'Configuration...' : 'Configurer Discord'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-indigo-900 dark:text-indigo-100 mb-4">
            📋 Instructions de configuration
          </h3>
          <ol className="space-y-2 text-indigo-800 dark:text-indigo-200">
            <li>1. Ouvrez votre serveur Discord</li>
            <li>2. Cliquez sur la roue dentée à côté du nom du canal où vous voulez recevoir les notifications</li>
            <li>3. Allez dans l'onglet "Intégrations"</li>
            <li>4. Cliquez sur "Créer un webhook"</li>
            <li>5. Donnez un nom au webhook (ex: "CollabWave Notifications")</li>
            <li>6. Copiez l'URL du webhook et collez-la dans le champ ci-dessus</li>
            <li>7. Entrez le nom de votre serveur Discord</li>
            <li>8. Sélectionnez les événements que vous souhaitez recevoir</li>
            <li>9. Cliquez sur "Configurer Discord"</li>
          </ol>
          
          <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
              💡 Conseil
            </h4>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              Vous pouvez personnaliser l'apparence du webhook dans Discord en lui donnant un nom et une image d'avatar.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default withMaintenanceCheck(DiscordIntegrationPage) 