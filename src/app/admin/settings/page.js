'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Cookies from 'js-cookie'
import toast from 'react-hot-toast'
import MiniChart from '@/components/ui/MiniChart'
import DetailedChart from '@/components/ui/DetailedChart'
import MaintenanceResult from '@/components/ui/MaintenanceResult'

export default function AdminSettings() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [maintenanceLoading, setMaintenanceLoading] = useState({})
  const [maintenanceResults, setMaintenanceResults] = useState({})
  const [systemStats, setSystemStats] = useState({})
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    registrationEnabled: true,
    emailVerificationRequired: true,
    maxProjectsPerUser: 10,
    maxTodosPerProject: 100,
    sessionTimeout: 7, // jours
    maintenanceMessage: ''
  })
  const [activeTab, setActiveTab] = useState('general')

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/auth/login')
        return
      }
      
      if (user.role !== 'ADMIN') {
        toast.error('Accès refusé. Seuls les administrateurs peuvent accéder aux paramètres.')
        router.push('/admin')
        return
      }
      
      // Chargement initial des données
      fetchInitialData()
    }
  }, [user, authLoading, router])

  // useEffect séparé pour la mise à jour automatique de l'onglet système
  useEffect(() => {
    let interval = null
    
    if (user && activeTab === 'system') {
      // Mise à jour automatique des statistiques système toutes les 5 secondes
      interval = setInterval(() => {
        fetchSystemStats()
      }, 5000)
    }
    
    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [activeTab, user])

  const getAuthHeaders = () => {
    const token = Cookies.get('token')
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }

  // Fonction pour le chargement initial complet
  const fetchInitialData = async () => {
    try {
      setLoading(true)
      
      // Récupérer les statistiques système
      const statsResponse = await fetch('/api/admin/system-stats', {
        headers: getAuthHeaders()
      })
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setSystemStats(statsData)
      }

      // Récupérer les paramètres système
      const settingsResponse = await fetch('/api/admin/settings', {
        headers: getAuthHeaders()
      })
      
      if (settingsResponse.ok) {
        const settingsData = await settingsResponse.json()
        setSettings(settingsData.settings)
      }
      
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors du chargement des données système')
    } finally {
      setLoading(false)
      setIsInitialLoad(false)
    }
  }

  // Fonction optimisée pour les mises à jour automatiques (stats seulement)
  const fetchSystemStats = async () => {
    try {
      setIsUpdating(true)
      const statsResponse = await fetch('/api/admin/system-stats', {
        headers: getAuthHeaders()
      })
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setSystemStats(statsData)
      }
      
    } catch (error) {
      console.error('Erreur lors de la mise à jour des stats:', error)
      // Ne pas afficher d'erreur pour les mises à jour automatiques
    } finally {
      setIsUpdating(false)
    }
  }

  // Fonction pour récupérer toutes les données (utilisée par les actions de maintenance)
  const fetchSystemData = async () => {
    try {
      // Récupérer les statistiques système
      const statsResponse = await fetch('/api/admin/system-stats', {
        headers: getAuthHeaders()
      })
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setSystemStats(statsData)
      }

      // Récupérer les paramètres système
      const settingsResponse = await fetch('/api/admin/settings', {
        headers: getAuthHeaders()
      })
      
      if (settingsResponse.ok) {
        const settingsData = await settingsResponse.json()
        setSettings(settingsData.settings)
      }
      
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors du chargement des données système')
    }
  }

  const updateSetting = async (key, value) => {
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ 
          settings: { [key]: value } 
        })
      })

      if (response.ok) {
        setSettings(prev => ({ ...prev, [key]: value }))
        toast.success('Paramètre mis à jour avec succès')
        
        // Si c'est le mode maintenance, invalider le cache
        if (key === 'maintenanceMode') {
          // Optionnel: recharger la page après un délai pour voir l'effet
          if (value) {
            toast.success('Mode maintenance activé. Les utilisateurs non-admin seront redirigés.')
          } else {
            toast.success('Mode maintenance désactivé. L\'accès normal est restauré.')
          }
        }
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Erreur lors de la mise à jour')
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors de la mise à jour du paramètre')
    }
  }

  const performMaintenance = async (action) => {
    try {
      // Marquer l'action comme en cours
      setMaintenanceLoading(prev => ({ ...prev, [action]: true }))
      
      // Effacer les résultats précédents
      setMaintenanceResults(prev => ({ ...prev, [action]: null }))
      
      const response = await fetch('/api/admin/maintenance', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ action })
      })

      if (response.ok) {
        const result = await response.json()
        
        // Stocker le résultat détaillé
        setMaintenanceResults(prev => ({ ...prev, [action]: result }))
        
        // Afficher un toast de succès avec détails
        const actionNames = {
          'clear-cache': 'Nettoyage du cache',
          'optimize-db': 'Optimisation de la base de données',
          'cleanup-logs': 'Nettoyage des logs',
          'restart-services': 'Redémarrage des services',
          'check-health': 'Vérification de la santé du système',
          'update-search-index': 'Mise à jour de l\'index de recherche'
        }
        
        toast.success(`${actionNames[action]} terminé avec succès`)
        
        // Rafraîchir les stats système après certaines actions
        if (['clear-cache', 'optimize-db', 'restart-services'].includes(action)) {
          fetchSystemStats()
        }
      } else {
        const errorData = await response.json()
        toast.error(`Erreur lors de l'action de maintenance: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error(`Erreur lors de l'action de maintenance: ${error.message}`)
    } finally {
      // Marquer l'action comme terminée
      setMaintenanceLoading(prev => ({ ...prev, [action]: false }))
    }
  }

  const exportData = async (type) => {
    try {
      const response = await fetch(`/api/admin/export?type=${type}`, {
        headers: getAuthHeaders()
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = url
        a.download = `${type}-export-${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        toast.success(`Export ${type} réussi`)
      } else {
        toast.error(`Erreur lors de l'export ${type}`)
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error(`Erreur lors de l'export ${type}`)
    }
  }

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatUptime = (seconds) => {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${days}j ${hours}h ${minutes}m`
  }

  if (authLoading || (loading && isInitialLoad)) {
    return (
      <div className="fixed inset-0 top-16 overflow-y-auto">
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 top-16 overflow-y-auto">
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <Link href="/admin" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium mb-2 inline-block">
                  ← Retour au dashboard
                </Link>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Paramètres Système
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mt-2">
                  Configuration et maintenance de la plateforme
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                  {user.role}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {user.name}
                </span>
              </div>
            </div>
          </div>

          {/* Onglets */}
          <div className="mb-8">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="-mb-px flex space-x-8">
                {[
                  { id: 'general', name: 'Général', icon: '⚙️' },
                  { id: 'system', name: 'Système', icon: '🖥️' },
                  { id: 'maintenance', name: 'Maintenance', icon: '🔧' },
                  { id: 'backup', name: 'Sauvegarde', icon: '💾' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                    }`}
                  >
                    <span>{tab.icon}</span>
                    <span>{tab.name}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Contenu des onglets */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              {/* Paramètres généraux */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Configuration Générale
                </h2>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">Mode Maintenance</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Désactiver l'accès à la plateforme pour maintenance</p>
                    </div>
                    <button
                      onClick={() => updateSetting('maintenanceMode', !settings.maintenanceMode)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.maintenanceMode ? 'bg-red-600' : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.maintenanceMode ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">Inscription Ouverte</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Permettre aux nouveaux utilisateurs de s'inscrire</p>
                    </div>
                    <button
                      onClick={() => updateSetting('registrationEnabled', !settings.registrationEnabled)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.registrationEnabled ? 'bg-green-600' : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.registrationEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">Vérification Email Obligatoire</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Exiger la vérification email pour l'inscription</p>
                    </div>
                    <button
                      onClick={() => updateSetting('emailVerificationRequired', !settings.emailVerificationRequired)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.emailVerificationRequired ? 'bg-green-600' : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.emailVerificationRequired ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Projets max par utilisateur
                      </label>
                      <input
                        type="number"
                        value={settings.maxProjectsPerUser}
                        onChange={(e) => updateSetting('maxProjectsPerUser', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Tâches max par projet
                      </label>
                      <input
                        type="number"
                        value={settings.maxTodosPerProject}
                        onChange={(e) => updateSetting('maxTodosPerProject', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>

                  {/* Message de maintenance */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Message de Maintenance
                    </label>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                      Message affiché aux utilisateurs pendant la maintenance
                    </p>
                    <textarea
                      value={settings.maintenanceMessage || ''}
                      onChange={(e) => setSettings(prev => ({ ...prev, maintenanceMessage: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                      placeholder="Le site est temporairement en maintenance. Veuillez réessayer plus tard."
                    />
                    <button
                      onClick={() => updateSetting('maintenanceMessage', settings.maintenanceMessage)}
                      className="mt-3 px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors duration-200 flex items-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Valider</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'system' && (
            <div className="space-y-6">
              {/* Indicateur de mise à jour */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${isUpdating ? 'bg-orange-500 animate-pulse' : 'bg-green-500 animate-pulse'}`}></div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                        {isUpdating ? 'Mise à jour en cours...' : 'Données en temps réel'}
                      </span>
                      <span className="text-xs text-blue-600 dark:text-blue-400">
                        Actualisation automatique toutes les 5 secondes
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    {systemStats.timestamp && (
                      <div className="text-right">
                        <div className="text-xs text-blue-600 dark:text-blue-400">
                          Dernière mise à jour
                        </div>
                        <div className="text-sm font-medium text-blue-700 dark:text-blue-300">
                          {new Date(systemStats.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    )}
                    {isUpdating && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    )}
                  </div>
                </div>
              </div>

              {/* Statistiques système */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center mb-3">
                    <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
                      <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">CPU Usage</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {systemStats.cpuUsage !== undefined ? systemStats.cpuUsage : '...'}%
                      </p>
                      {systemStats.cpuCores && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {systemStats.cpuCores} cœurs
                        </p>
                      )}
                    </div>
                  </div>
                  <MiniChart 
                    data={systemStats.history} 
                    dataKey="cpuUsage" 
                    color="#3B82F6" 
                    height={40}
                  />
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center mb-3">
                    <div className="p-3 rounded-full bg-green-100 dark:bg-green-900">
                      <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Mémoire</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {systemStats.memory?.heapUsedMB ? `${systemStats.memory.heapUsedMB} MB` : formatBytes(systemStats.memoryUsage || 0)}
                      </p>
                      {systemStats.memoryUsagePercent && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {systemStats.memoryUsagePercent}% utilisé
                        </p>
                      )}
                    </div>
                  </div>
                  <MiniChart 
                    data={systemStats.history} 
                    dataKey="memoryUsage" 
                    color="#10B981" 
                    height={40}
                  />
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center mb-3">
                    <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900">
                      <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Stockage</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {systemStats.diskUsage ? formatBytes(systemStats.diskUsage) : 'N/A'}
                      </p>
                      {systemStats.diskUsagePercent && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {systemStats.diskUsagePercent}% utilisé
                        </p>
                      )}
                    </div>
                  </div>
                  <MiniChart 
                    data={systemStats.history} 
                    dataKey="diskUsage" 
                    color="#8B5CF6" 
                    height={40}
                  />
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center mb-3">
                    <div className="p-3 rounded-full bg-orange-100 dark:bg-orange-900">
                      <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Uptime</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {systemStats.uptime ? formatUptime(systemStats.uptime) : 'N/A'}
                      </p>
                      {systemStats.systemUptime && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Système: {formatUptime(systemStats.systemUptime)}
                        </p>
                      )}
                    </div>
                  </div>
                  <MiniChart 
                    data={systemStats.history} 
                    dataKey="requestsPerMinute" 
                    color="#F59E0B" 
                    height={40}
                  />
                </div>
              </div>

              {/* Informations système détaillées */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Informations système */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                    Informations Système
                  </h2>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Environnement</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Node.js:</span>
                          <span className="text-gray-900 dark:text-white">{systemStats.environment?.nodeVersion || process.version}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Plateforme:</span>
                          <span className="text-gray-900 dark:text-white">{systemStats.environment?.platform || 'Unknown'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Architecture:</span>
                          <span className="text-gray-900 dark:text-white">{systemStats.environment?.arch || 'Unknown'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Hostname:</span>
                          <span className="text-gray-900 dark:text-white">{systemStats.environment?.hostname || 'Unknown'}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Base de données</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Utilisateurs:</span>
                          <span className="text-gray-900 dark:text-white">{systemStats.database?.users || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Projets:</span>
                          <span className="text-gray-900 dark:text-white">{systemStats.database?.projects || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Tâches:</span>
                          <span className="text-gray-900 dark:text-white">{systemStats.database?.todos || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Logs d'activité:</span>
                          <span className="text-gray-900 dark:text-white">{systemStats.database?.activityLogs || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Performance et métriques */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                    Performance & Métriques
                  </h2>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Mémoire détaillée</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Heap utilisé:</span>
                          <span className="text-gray-900 dark:text-white">{systemStats.memory?.heapUsedMB || 0} MB</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Heap total:</span>
                          <span className="text-gray-900 dark:text-white">{systemStats.memory?.heapTotalMB || 0} MB</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">RSS:</span>
                          <span className="text-gray-900 dark:text-white">{systemStats.memory?.rss || 0} MB</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">External:</span>
                          <span className="text-gray-900 dark:text-white">{systemStats.memory?.externalMB || 0} MB</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Performance</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Requêtes/min:</span>
                          <span className="text-gray-900 dark:text-white">{systemStats.requestsPerMinute || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Temps réponse moyen:</span>
                          <span className="text-gray-900 dark:text-white">{systemStats.avgResponseTime || 'N/A'}ms</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Erreurs/h:</span>
                          <span className="text-gray-900 dark:text-white">{systemStats.errorsPerHour || 0}</span>
                        </div>
                        {systemStats.loadAverage && (
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Load Average:</span>
                            <span className="text-gray-900 dark:text-white">
                              {systemStats.loadAverage.map(load => load.toFixed(2)).join(', ')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Graphique détaillé */}
              <DetailedChart data={systemStats.history} />
            </div>
          )}

          {activeTab === 'maintenance' && (
            <div className="space-y-6">
              {/* Actions de maintenance */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Actions de Maintenance
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    {/* Vider le Cache */}
                    <div>
                      <button
                        onClick={() => performMaintenance('clear-cache')}
                        disabled={maintenanceLoading['clear-cache']}
                        className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-all duration-200"
                      >
                        {maintenanceLoading['clear-cache'] ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            <span>Nettoyage en cours...</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            <span>Vider le Cache</span>
                          </>
                        )}
                      </button>
                      <MaintenanceResult result={maintenanceResults['clear-cache']} action="clear-cache" />
                    </div>

                    {/* Optimiser la Base de Données */}
                    <div>
                      <button
                        onClick={() => performMaintenance('optimize-db')}
                        disabled={maintenanceLoading['optimize-db']}
                        className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-all duration-200"
                      >
                        {maintenanceLoading['optimize-db'] ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            <span>Optimisation en cours...</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                            </svg>
                            <span>Optimiser la Base de Données</span>
                          </>
                        )}
                      </button>
                      <MaintenanceResult result={maintenanceResults['optimize-db']} action="optimize-db" />
                    </div>

                    {/* Nettoyer les Logs */}
                    <div>
                      <button
                        onClick={() => performMaintenance('cleanup-logs')}
                        disabled={maintenanceLoading['cleanup-logs']}
                        className="w-full px-4 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-all duration-200"
                      >
                        {maintenanceLoading['cleanup-logs'] ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            <span>Nettoyage en cours...</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            <span>Nettoyer les Logs Anciens</span>
                          </>
                        )}
                      </button>
                      <MaintenanceResult result={maintenanceResults['cleanup-logs']} action="cleanup-logs" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Redémarrer les Services */}
                    <div>
                      <button
                        onClick={() => performMaintenance('restart-services')}
                        disabled={maintenanceLoading['restart-services']}
                        className="w-full px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-all duration-200"
                      >
                        {maintenanceLoading['restart-services'] ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            <span>Redémarrage en cours...</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            <span>Redémarrer les Services</span>
                          </>
                        )}
                      </button>
                      <MaintenanceResult result={maintenanceResults['restart-services']} action="restart-services" />
                    </div>

                    {/* Vérifier la Santé du Système */}
                    <div>
                      <button
                        onClick={() => performMaintenance('check-health')}
                        disabled={maintenanceLoading['check-health']}
                        className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-all duration-200"
                      >
                        {maintenanceLoading['check-health'] ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            <span>Vérification en cours...</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Vérifier la Santé du Système</span>
                          </>
                        )}
                      </button>
                      <MaintenanceResult result={maintenanceResults['check-health']} action="check-health" />
                    </div>

                    {/* Mettre à Jour l'Index de Recherche */}
                    <div>
                      <button
                        onClick={() => performMaintenance('update-search-index')}
                        disabled={maintenanceLoading['update-search-index']}
                        className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-all duration-200"
                      >
                        {maintenanceLoading['update-search-index'] ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            <span>Mise à jour en cours...</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <span>Mettre à Jour l'Index de Recherche</span>
                          </>
                        )}
                      </button>
                      <MaintenanceResult result={maintenanceResults['update-search-index']} action="update-search-index" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'backup' && (
            <div className="space-y-6">
              {/* Sauvegarde et export */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Sauvegarde et Export
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Exports de Données</h3>
                    <div className="space-y-3">
                      <button
                        onClick={() => exportData('users')}
                        className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                        </svg>
                        <span>Exporter les Utilisateurs</span>
                      </button>

                      <button
                        onClick={() => exportData('projects')}
                        className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center space-x-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        <span>Exporter les Projets</span>
                      </button>

                      <button
                        onClick={() => exportData('activity-logs')}
                        className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center justify-center space-x-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <span>Exporter les Logs</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Sauvegarde Complète</h3>
                    <div className="space-y-3">
                      <div>
                        <button
                          onClick={() => performMaintenance('full-backup')}
                          disabled={maintenanceLoading['full-backup']}
                          className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-all duration-200"
                        >
                          {maintenanceLoading['full-backup'] ? (
                            <>
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                              <span>Sauvegarde en cours...</span>
                            </>
                          ) : (
                            <>
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                              </svg>
                              <span>Sauvegarde Complète</span>
                            </>
                          )}
                        </button>
                        <MaintenanceResult result={maintenanceResults['full-backup']} action="full-backup" />
                      </div>

                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        <p className="mb-2">Dernière sauvegarde:</p>
                        <p className="font-medium">Il y a 2 jours (23/05/2024)</p>
                      </div>

                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        <p className="mb-2">Prochaine sauvegarde automatique:</p>
                        <p className="font-medium">Dans 5 jours (30/05/2024)</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 