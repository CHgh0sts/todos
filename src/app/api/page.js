'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function ApiPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [apiKey, setApiKey] = useState('')
  const [showApiKey, setShowApiKey] = useState(false)
  const [loading, setLoading] = useState(true)
  const [selectedTech, setSelectedTech] = useState('javascript')
  const [copyButtonStates, setCopyButtonStates] = useState({})
  const [regenerateLoading, setRegenerateLoading] = useState(false)

  const technologies = [
    { id: 'javascript', name: 'JavaScript', color: 'yellow' },
    { id: 'python', name: 'Python', color: 'blue' },
    { id: 'php', name: 'PHP', color: 'purple' },
    { id: 'curl', name: 'cURL', color: 'green' },
    { id: 'ruby', name: 'Ruby', color: 'red' }
  ]

  useEffect(() => {
    if (!authLoading) {
      if (user) {
        fetchApiKey()
      } else {
        setLoading(false)
      }
    }
  }, [user, authLoading, router])

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
    } finally {
      setLoading(false)
    }
  }

  const generateApiKey = async () => {
    setRegenerateLoading(true)
    try {
      const response = await fetch('/api/developer/api-key', {
        method: 'POST',
        headers: getAuthHeaders()
      })
      
      if (response.ok) {
        const data = await response.json()
        setApiKey(data.apiKey)
        setShowApiKey(true)
        toast.success('Nouvelle clé API générée avec succès!')
      } else {
        toast.error('Erreur lors de la génération de la clé API')
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors de la génération')
    } finally {
      setRegenerateLoading(false)
    }
  }

  const copyToClipboard = async (text, type = 'api-key') => {
    try {
      await navigator.clipboard.writeText(text)
      setCopyButtonStates(prev => ({ ...prev, [type]: 'copied' }))
      toast.success('Copié dans le presse-papiers!')
      
      setTimeout(() => {
        setCopyButtonStates(prev => ({ ...prev, [type]: 'default' }))
      }, 2000)
    } catch (error) {
      toast.error('Erreur lors de la copie')
    }
  }

  const getCodeExample = (tech) => {
    const baseUrl = typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.host}` : 'https://votre-domaine.com'
    
    const examples = {
      javascript: `<span style="color: #6b7280;">// Récupérer tous les projets</span>
<span style="color: #3b82f6;">const</span> <span style="color: #ffffff;">response</span> <span style="color: #ec4899;">=</span> <span style="color: #3b82f6;">await</span> <span style="color: #fbbf24;">fetch</span><span style="color: #ec4899;">(</span><span style="color: #10b981;">'${baseUrl}/api/projects'</span><span style="color: #ec4899;">,</span> <span style="color: #ec4899;">{</span>
  <span style="color: #ef4444;">headers</span><span style="color: #ec4899;">:</span> <span style="color: #ec4899;">{</span>
    <span style="color: #10b981;">'Authorization'</span><span style="color: #ec4899;">:</span> <span style="color: #10b981;">\`Bearer \${apiKey}\`</span><span style="color: #ec4899;">,</span>
    <span style="color: #10b981;">'Content-Type'</span><span style="color: #ec4899;">:</span> <span style="color: #10b981;">'application/json'</span>
  <span style="color: #ec4899;">}</span>
<span style="color: #ec4899;">}</span><span style="color: #ec4899;">)</span><span style="color: #ec4899;">;</span>

<span style="color: #3b82f6;">const</span> <span style="color: #ffffff;">data</span> <span style="color: #ec4899;">=</span> <span style="color: #3b82f6;">await</span> <span style="color: #ffffff;">response</span><span style="color: #ec4899;">.</span><span style="color: #fbbf24;">json</span><span style="color: #ec4899;">(</span><span style="color: #ec4899;">)</span><span style="color: #ec4899;">;</span>
<span style="color: #fbbf24;">console</span><span style="color: #ec4899;">.</span><span style="color: #fbbf24;">log</span><span style="color: #ec4899;">(</span><span style="color: #ffffff;">data</span><span style="color: #ec4899;">)</span><span style="color: #ec4899;">;</span>`,

      python: `<span style="color: #6b7280;"># Récupérer tous les projets</span>
<span style="color: #3b82f6;">import</span> <span style="color: #ffffff;">requests</span>

<span style="color: #ffffff;">headers</span> <span style="color: #ec4899;">=</span> <span style="color: #ec4899;">{</span>
    <span style="color: #10b981;">'Authorization'</span><span style="color: #ec4899;">:</span> <span style="color: #10b981;">f'Bearer {api_key}'</span><span style="color: #ec4899;">,</span>
    <span style="color: #10b981;">'Content-Type'</span><span style="color: #ec4899;">:</span> <span style="color: #10b981;">'application/json'</span>
<span style="color: #ec4899;">}</span>

<span style="color: #ffffff;">response</span> <span style="color: #ec4899;">=</span> <span style="color: #ffffff;">requests</span><span style="color: #ec4899;">.</span><span style="color: #fbbf24;">get</span><span style="color: #ec4899;">(</span><span style="color: #10b981;">'${baseUrl}/api/projects'</span><span style="color: #ec4899;">,</span> <span style="color: #ffffff;">headers</span><span style="color: #ec4899;">=</span><span style="color: #ffffff;">headers</span><span style="color: #ec4899;">)</span>
<span style="color: #ffffff;">data</span> <span style="color: #ec4899;">=</span> <span style="color: #ffffff;">response</span><span style="color: #ec4899;">.</span><span style="color: #fbbf24;">json</span><span style="color: #ec4899;">(</span><span style="color: #ec4899;">)</span>
<span style="color: #fbbf24;">print</span><span style="color: #ec4899;">(</span><span style="color: #ffffff;">data</span><span style="color: #ec4899;">)</span>`,

      php: `<span style="color: #6b7280;">// Récupérer tous les projets</span>
<span style="color: #ec4899;">&lt;?</span><span style="color: #3b82f6;">php</span>

<span style="color: #ffffff;">$headers</span> <span style="color: #ec4899;">=</span> <span style="color: #ec4899;">[</span>
    <span style="color: #10b981;">'Authorization: Bearer '</span> <span style="color: #ec4899;">.</span> <span style="color: #ffffff;">$apiKey</span><span style="color: #ec4899;">,</span>
    <span style="color: #10b981;">'Content-Type: application/json'</span>
<span style="color: #ec4899;">]</span><span style="color: #ec4899;">;</span>

<span style="color: #ffffff;">$context</span> <span style="color: #ec4899;">=</span> <span style="color: #fbbf24;">stream_context_create</span><span style="color: #ec4899;">(</span><span style="color: #ec4899;">[</span>
    <span style="color: #10b981;">'http'</span> <span style="color: #ec4899;">=></span> <span style="color: #ec4899;">[</span>
        <span style="color: #10b981;">'header'</span> <span style="color: #ec4899;">=></span> <span style="color: #fbbf24;">implode</span><span style="color: #ec4899;">(</span><span style="color: #10b981;">"\r\n"</span><span style="color: #ec4899;">,</span> <span style="color: #ffffff;">$headers</span><span style="color: #ec4899;">)</span>
    <span style="color: #ec4899;">]</span>
<span style="color: #ec4899;">]</span><span style="color: #ec4899;">)</span><span style="color: #ec4899;">;</span>

<span style="color: #ffffff;">$response</span> <span style="color: #ec4899;">=</span> <span style="color: #fbbf24;">file_get_contents</span><span style="color: #ec4899;">(</span><span style="color: #10b981;">'${baseUrl}/api/projects'</span><span style="color: #ec4899;">,</span> <span style="color: #3b82f6;">false</span><span style="color: #ec4899;">,</span> <span style="color: #ffffff;">$context</span><span style="color: #ec4899;">)</span><span style="color: #ec4899;">;</span>
<span style="color: #ffffff;">$data</span> <span style="color: #ec4899;">=</span> <span style="color: #fbbf24;">json_decode</span><span style="color: #ec4899;">(</span><span style="color: #ffffff;">$response</span><span style="color: #ec4899;">,</span> <span style="color: #3b82f6;">true</span><span style="color: #ec4899;">)</span><span style="color: #ec4899;">;</span>
<span style="color: #fbbf24;">print_r</span><span style="color: #ec4899;">(</span><span style="color: #ffffff;">$data</span><span style="color: #ec4899;">)</span><span style="color: #ec4899;">;</span>`,

      curl: `<span style="color: #6b7280;"># Récupérer tous les projets</span>
<span style="color: #fbbf24;">curl</span> <span style="color: #ec4899;">-X</span> <span style="color: #10b981;">GET</span> <span style="color: #ec4899;">\\</span>
  <span style="color: #10b981;">"${baseUrl}/api/projects"</span> <span style="color: #ec4899;">\\</span>
  <span style="color: #ec4899;">-H</span> <span style="color: #10b981;">"Authorization: Bearer YOUR_API_KEY"</span> <span style="color: #ec4899;">\\</span>
  <span style="color: #ec4899;">-H</span> <span style="color: #10b981;">"Content-Type: application/json"</span>`,

      ruby: `<span style="color: #6b7280;"># Récupérer tous les projets</span>
<span style="color: #3b82f6;">require</span> <span style="color: #10b981;">'net/http'</span>
<span style="color: #3b82f6;">require</span> <span style="color: #10b981;">'json'</span>

<span style="color: #ffffff;">uri</span> <span style="color: #ec4899;">=</span> <span style="color: #fbbf24;">URI</span><span style="color: #ec4899;">(</span><span style="color: #10b981;">'${baseUrl}/api/projects'</span><span style="color: #ec4899;">)</span>
<span style="color: #ffffff;">http</span> <span style="color: #ec4899;">=</span> <span style="color: #fbbf24;">Net::HTTP</span><span style="color: #ec4899;">.</span><span style="color: #fbbf24;">new</span><span style="color: #ec4899;">(</span><span style="color: #ffffff;">uri</span><span style="color: #ec4899;">.</span><span style="color: #ffffff;">host</span><span style="color: #ec4899;">,</span> <span style="color: #ffffff;">uri</span><span style="color: #ec4899;">.</span><span style="color: #ffffff;">port</span><span style="color: #ec4899;">)</span>

<span style="color: #ffffff;">request</span> <span style="color: #ec4899;">=</span> <span style="color: #fbbf24;">Net::HTTP::Get</span><span style="color: #ec4899;">.</span><span style="color: #fbbf24;">new</span><span style="color: #ec4899;">(</span><span style="color: #ffffff;">uri</span><span style="color: #ec4899;">)</span>
<span style="color: #ffffff;">request</span><span style="color: #ec4899;">[</span><span style="color: #10b981;">'Authorization'</span><span style="color: #ec4899;">]</span> <span style="color: #ec4899;">=</span> <span style="color: #10b981;">"Bearer #{api_key}"</span>
<span style="color: #ffffff;">request</span><span style="color: #ec4899;">[</span><span style="color: #10b981;">'Content-Type'</span><span style="color: #ec4899;">]</span> <span style="color: #ec4899;">=</span> <span style="color: #10b981;">'application/json'</span>

<span style="color: #ffffff;">response</span> <span style="color: #ec4899;">=</span> <span style="color: #ffffff;">http</span><span style="color: #ec4899;">.</span><span style="color: #fbbf24;">request</span><span style="color: #ec4899;">(</span><span style="color: #ffffff;">request</span><span style="color: #ec4899;">)</span>
<span style="color: #ffffff;">data</span> <span style="color: #ec4899;">=</span> <span style="color: #fbbf24;">JSON</span><span style="color: #ec4899;">.</span><span style="color: #fbbf24;">parse</span><span style="color: #ec4899;">(</span><span style="color: #ffffff;">response</span><span style="color: #ec4899;">.</span><span style="color: #ffffff;">body</span><span style="color: #ec4899;">)</span>
<span style="color: #fbbf24;">puts</span> <span style="color: #ffffff;">data</span>`
    }
    
    return examples[tech] || examples.javascript
  }

  if (authLoading || loading) {
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

          {/* Section Clé API */}
          <div className="max-w-4xl mx-auto px-4 mb-12">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                <svg className="w-6 h-6 mr-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-6 6c-3 0-5.5-1.5-6.5-4a6 6 0 016.5-4c3 0 5.5 1.5 6.5 4z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 01-2-2V9a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H9z" />
                </svg>
                Authentification
              </h2>
              
              {user ? (
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Votre clé API
                      </label>
                      <div className="h-px bg-gray-300 dark:bg-gray-600 flex-1 mx-4"></div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => copyToClipboard(apiKey, 'api-key')}
                          className={`p-2 rounded-lg transition-all duration-200 ${
                            copyButtonStates['api-key'] === 'copied'
                              ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400'
                              : 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-800'
                          }`}
                          title="Copier la clé API"
                        >
                          {copyButtonStates['api-key'] === 'copied' ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          )}
                        </button>
                        
                        <button
                          onClick={generateApiKey}
                          disabled={regenerateLoading}
                          className={`p-2 rounded-lg transition-all duration-200 ${
                            regenerateLoading
                              ? 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed'
                              : 'bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-400 hover:bg-orange-200 dark:hover:bg-orange-800'
                          }`}
                          title="Régénérer la clé API"
                        >
                          {regenerateLoading ? (
                            <div className="w-4 h-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"></div>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                          )}
                        </button>
                        
                        <button
                          onClick={() => setShowApiKey(!showApiKey)}
                          className="p-2 rounded-lg bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200"
                          title={showApiKey ? "Masquer la clé" : "Afficher la clé"}
                        >
                          {showApiKey ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 font-mono text-sm border border-gray-200 dark:border-gray-700">
                      <span className="text-gray-900 dark:text-gray-100">
                        {apiKey ? (
                          showApiKey ? apiKey : '•'.repeat(32)
                        ) : (
                          <span className="text-gray-500 dark:text-gray-400">Aucune clé API générée</span>
                        )}
                      </span>
                    </div>
                  </div>

                  {!apiKey && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
                      <div className="flex items-start">
                        <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <div>
                          <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Clé API requise</h4>
                          <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                            Vous devez générer une clé API pour accéder aux endpoints. Cliquez sur le bouton de régénération pour en créer une.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-6">
                    <div className="flex items-start">
                      <svg className="w-6 h-6 text-blue-600 dark:text-blue-400 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <h4 className="text-lg font-medium text-blue-800 dark:text-blue-200 mb-2">Connexion requise pour l'API</h4>
                        <p className="text-blue-700 dark:text-blue-300 mb-4">
                          Pour utiliser l'API CollabWave, vous devez créer un compte et générer une clé API. 
                          Cette clé vous permettra d'accéder à tous vos projets, tâches et catégories via notre API RESTful.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3">
                          <a 
                            href="/auth/login"
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                            </svg>
                            Se connecter
                          </a>
                          <a 
                            href="/auth/register"
                            className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                            </svg>
                            Créer un compte
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Exemple de clé API
                      </label>
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 font-mono text-sm border border-gray-200 dark:border-gray-600">
                      <span className="text-gray-500 dark:text-gray-400">
                        cw_1234567890abcdef1234567890abcdef
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      * Ceci est un exemple. Votre vraie clé API sera générée après connexion.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section Exemples */}
          <div className="max-w-4xl mx-auto px-4 mb-12">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                <svg className="w-6 h-6 mr-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                Exemples de code
              </h2>

              {/* Sélecteur de technologies */}
              <div className="mb-6">
                <div className="flex flex-wrap gap-2">
                  {technologies.map((tech) => (
                    <button
                      key={tech.id}
                      onClick={() => setSelectedTech(tech.id)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
                        selectedTech === tech.id
                          ? `bg-${tech.color}-100 text-${tech.color}-900 dark:bg-${tech.color}-900 dark:text-${tech.color}-300 ring-2 ring-${tech.color}-500`
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {/* Icônes SVG pour chaque langage */}
                      {tech.id === 'javascript' && (
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M0 0h24v24H0V0zm22.034 18.276c-.175-1.095-.888-2.015-3.003-2.873-.736-.345-1.554-.585-1.797-1.14-.091-.33-.105-.51-.046-.705.15-.646.915-.84 1.515-.66.39.12.75.42.976.9 1.034-.676 1.034-.676 1.755-1.125-.27-.42-.404-.601-.586-.78-.63-.705-1.469-1.065-2.834-1.034l-.705.089c-.676.165-1.32.525-1.71 1.005-1.14 1.291-.811 3.541.569 4.471 1.365 1.02 3.361 1.244 3.616 2.205.24 1.17-.87 1.545-1.966 1.41-.811-.18-1.26-.586-1.755-1.336l-1.83 1.051c.21.48.45.689.81 1.109 1.74 1.756 6.09 1.666 6.871-1.004.029-.09.24-.705.074-1.65l.046.067zm-8.983-7.245h-2.248c0 1.938-.009 3.864-.009 5.805 0 1.232.063 2.363-.138 2.711-.33.689-1.18.601-1.566.48-.396-.196-.597-.466-.83-.855-.063-.105-.11-.196-.127-.196l-1.825 1.125c.305.63.75 1.172 1.324 1.517.855.51 2.004.675 3.207.405.783-.226 1.458-.691 1.811-1.411.51-.93.402-2.07.397-3.346.012-2.054 0-4.109 0-6.179l.004-.056z"/>
                        </svg>
                      )}
                      {tech.id === 'python' && (
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M14.25.18l.9.2.73.26.59.3.45.32.34.34.25.34.16.33.1.3.04.26.02.2-.01.13V8.5l-.05.63-.13.55-.21.46-.26.38-.3.31-.33.25-.35.19-.35.14-.33.1-.3.07-.26.04-.21.02H8.77l-.69.05-.59.14-.5.22-.41.27-.33.32-.27.35-.2.36-.15.37-.1.35-.07.32-.04.27-.02.21v3.06H3.17l-.21-.03-.28-.07-.32-.12-.35-.18-.36-.26-.36-.36-.35-.46-.32-.59-.28-.73-.21-.88-.14-1.05-.05-1.23.06-1.22.16-1.04.24-.87.32-.71.36-.57.4-.44.42-.33.42-.24.4-.16.36-.1.32-.05.24-.01h.16l.06.01h8.16v-.83H6.18l-.01-2.75-.02-.37.05-.34.11-.31.17-.28.25-.26.31-.23.38-.2.44-.18.51-.15.58-.12.64-.1.71-.06.77-.04.84-.02 1.27.05zm-6.3 1.98l-.23.33-.08.41.08.41.23.34.33.22.41.09.41-.09.33-.22.23-.34.08-.41-.08-.41-.23-.33-.33-.23-.41-.08-.41.08z"/>
                        </svg>
                      )}
                      {tech.id === 'php' && (
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                          <ellipse cx="12" cy="12" rx="11" ry="6" fill="currentColor" opacity="0.8"/>
                          <text x="12" y="15" textAnchor="middle" fontSize="8" fontWeight="bold" fill="white">php</text>
                        </svg>
                      )}
                      {tech.id === 'curl' && (
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.568 14.794c-.478 1.196-1.479 2.075-2.904 2.552-1.425.477-2.999.477-4.568 0-1.569-.477-2.904-1.356-3.904-2.552C5.192 13.598 4.692 12.196 4.692 10.598c0-1.598.5-3 1.5-4.196C7.192 5.206 8.527 4.327 10.096 3.85c1.569-.477 3.143-.477 4.568 0 1.425.477 2.426 1.356 2.904 2.552.478 1.196.478 2.598 0 4.196-.478 1.598-.978 3-1.978 4.196z"/>
                        </svg>
                      )}
                      {tech.id === 'ruby' && (
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M20.156.083c3.033.525 3.893 2.598 3.829 4.77L24 4.822 22.635 22.71 4.89 23.926h.016C3.433 23.864.15 23.729.002 19.526L0 19.696.98 1.45l1.097-.124.208 10.395 8.157 11.174 10.006-2.023L20.156.083zm-5.4 21.716l6.519-1.314.013-.665.343-5.572-7.157 1.92.282 5.631zm-8.967-.654L18.55 18.1l-.308-6.177-12.385 2.449-.068 6.773zm1.774-7.96L20.818 10.8 20.364.359l-13.218 2.816.417 10.01z"/>
                        </svg>
                      )}
                      <span>{tech.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Code avec coloration syntaxique */}
              <div className="relative">
                <div className="bg-gray-900 rounded-lg overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-700">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                    <span className="text-sm text-gray-400 font-mono">
                      {technologies.find(t => t.id === selectedTech)?.name} Example
                    </span>
                    <button
                      onClick={() => copyToClipboard(getCodeExample(selectedTech).replace(/<[^>]*>/g, ''), selectedTech)}
                      className={`px-3 py-1 rounded text-xs font-medium transition-all duration-200 ${
                        copyButtonStates[selectedTech] === 'copied'
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {copyButtonStates[selectedTech] === 'copied' ? '✓ Copié' : 'Copier'}
                    </button>
                  </div>
                  <div className="p-4 overflow-x-auto">
                    <pre className="text-sm leading-relaxed">
                      <code dangerouslySetInnerHTML={{ __html: getCodeExample(selectedTech) }} />
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section Endpoints */}
          <div className="max-w-4xl mx-auto px-4 mb-12">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                <svg className="w-6 h-6 mr-3 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Endpoints disponibles
              </h2>

              <div className="space-y-4">
                {[
                  { method: 'GET', endpoint: '/api/projects', description: 'Récupérer tous vos projets' },
                  { method: 'POST', endpoint: '/api/projects', description: 'Créer un nouveau projet' },
                  { method: 'GET', endpoint: '/api/projects/{id}', description: 'Récupérer un projet spécifique' },
                  { method: 'PUT', endpoint: '/api/projects/{id}', description: 'Mettre à jour un projet' },
                  { method: 'DELETE', endpoint: '/api/projects/{id}', description: 'Supprimer un projet' },
                  { method: 'GET', endpoint: '/api/todos', description: 'Récupérer toutes vos tâches' },
                  { method: 'POST', endpoint: '/api/todos', description: 'Créer une nouvelle tâche' },
                  { method: 'PUT', endpoint: '/api/todos/{id}', description: 'Mettre à jour une tâche' },
                  { method: 'DELETE', endpoint: '/api/todos/{id}', description: 'Supprimer une tâche' },
                  { method: 'GET', endpoint: '/api/categories', description: 'Récupérer vos catégories' }
                ].map((endpoint, index) => (
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
                      <code className="font-mono text-sm text-gray-900 dark:text-gray-100">{endpoint.endpoint}</code>
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{endpoint.description}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <footer className="bg-gray-900 text-white relative">
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
    </div>
  )
}