export default function Api() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-20 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">API</h1>
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">L'API CollabWave permet d'intégrer vos projets, tâches et notifications dans vos propres outils.</p>
        <ul className="space-y-4 text-gray-700 dark:text-gray-300">
          <li>Authentification JWT</li>
          <li>Endpoints RESTful pour tous les objets</li>
          <li>Webhooks pour notifications</li>
          <li>Documentation interactive (bientôt)</li>
        </ul>
      </div>
    </div>
  )
} 