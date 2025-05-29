'use client'

export default function MaintenanceResult({ result, action }) {
  if (!result) return null

  const getActionIcon = (action) => {
    const icons = {
      'clear-cache': '🧹',
      'optimize-db': '🗃️',
      'cleanup-logs': '📝',
      'restart-services': '🔄',
      'check-health': '🏥',
      'update-search-index': '🔍',
      'full-backup': '💾'
    }
    return icons[action] || '⚙️'
  }

  const getActionName = (action) => {
    const names = {
      'clear-cache': 'Nettoyage du cache',
      'optimize-db': 'Optimisation de la base de données',
      'cleanup-logs': 'Nettoyage des logs',
      'restart-services': 'Redémarrage des services',
      'check-health': 'Vérification de la santé',
      'update-search-index': 'Mise à jour de l\'index',
      'full-backup': 'Sauvegarde complète'
    }
    return names[action] || action
  }

  const formatValue = (value) => {
    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value, null, 2)
    }
    return String(value)
  }

  return (
    <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
      <div className="flex items-center space-x-2 mb-3">
        <span className="text-lg">{getActionIcon(action)}</span>
        <h4 className="font-medium text-green-800 dark:text-green-300">
          {getActionName(action)} - Terminé
        </h4>
        <span className="text-xs text-green-600 dark:text-green-400">
          {new Date(result.executedAt).toLocaleTimeString()}
        </span>
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-green-700 dark:text-green-300">Message:</span>
          <span className="text-green-800 dark:text-green-200 font-medium">
            {result.result.message}
          </span>
        </div>
        
        {result.executedBy && (
          <div className="flex items-center justify-between">
            <span className="text-green-700 dark:text-green-300">Exécuté par:</span>
            <span className="text-green-800 dark:text-green-200">
              {result.executedBy}
            </span>
          </div>
        )}

        {/* Affichage spécifique selon l'action */}
        {action === 'clear-cache' && result.result.freedSpace && (
          <div className="flex items-center justify-between">
            <span className="text-green-700 dark:text-green-300">Espace libéré:</span>
            <span className="text-green-800 dark:text-green-200 font-medium">
              {result.result.freedSpace}
            </span>
          </div>
        )}

        {action === 'optimize-db' && result.result.statistics && (
          <div className="mt-3">
            <span className="text-green-700 dark:text-green-300 block mb-2">Statistiques:</span>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="bg-green-100 dark:bg-green-800 p-2 rounded">
                <div className="font-medium">{result.result.statistics.users}</div>
                <div className="text-green-600 dark:text-green-400">Utilisateurs</div>
              </div>
              <div className="bg-green-100 dark:bg-green-800 p-2 rounded">
                <div className="font-medium">{result.result.statistics.projects}</div>
                <div className="text-green-600 dark:text-green-400">Projets</div>
              </div>
              <div className="bg-green-100 dark:bg-green-800 p-2 rounded">
                <div className="font-medium">{result.result.statistics.todos}</div>
                <div className="text-green-600 dark:text-green-400">Tâches</div>
              </div>
            </div>
          </div>
        )}

        {action === 'cleanup-logs' && result.result.deleted && (
          <div className="mt-3">
            <span className="text-green-700 dark:text-green-300 block mb-2">Logs supprimés:</span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-green-100 dark:bg-green-800 p-2 rounded">
                <div className="font-medium">{result.result.deleted.activityLogs}</div>
                <div className="text-green-600 dark:text-green-400">Logs d'activité</div>
              </div>
              <div className="bg-green-100 dark:bg-green-800 p-2 rounded">
                <div className="font-medium">{result.result.deleted.apiLogs}</div>
                <div className="text-green-600 dark:text-green-400">Logs API</div>
              </div>
            </div>
          </div>
        )}

        {action === 'restart-services' && result.result.services && (
          <div className="mt-3">
            <span className="text-green-700 dark:text-green-300 block mb-2">Services redémarrés:</span>
            <div className="flex flex-wrap gap-1">
              {result.result.services.map((service, index) => (
                <span key={index} className="px-2 py-1 bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 text-xs rounded">
                  {service}
                </span>
              ))}
            </div>
          </div>
        )}

        {action === 'check-health' && result.result.health && (
          <div className="mt-3">
            <span className="text-green-700 dark:text-green-300 block mb-2">État du système:</span>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span>Base de données:</span>
                <span className={`font-medium ${result.result.health.database === 'OK' ? 'text-green-600' : 'text-red-600'}`}>
                  {result.result.health.database}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Utilisateurs actifs (24h):</span>
                <span className="font-medium">{result.result.health.users?.active24h || 0}</span>
              </div>
            </div>
          </div>
        )}

        {action === 'update-search-index' && result.result.indexed && (
          <div className="mt-3">
            <span className="text-green-700 dark:text-green-300 block mb-2">Éléments indexés:</span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-green-100 dark:bg-green-800 p-2 rounded">
                <div className="font-medium">{result.result.indexed.projects}</div>
                <div className="text-green-600 dark:text-green-400">Projets</div>
              </div>
              <div className="bg-green-100 dark:bg-green-800 p-2 rounded">
                <div className="font-medium">{result.result.indexed.todos}</div>
                <div className="text-green-600 dark:text-green-400">Tâches</div>
              </div>
            </div>
          </div>
        )}

        {action === 'full-backup' && result.result.backupId && (
          <div className="mt-3">
            <span className="text-green-700 dark:text-green-300 block mb-2">Détails de la sauvegarde:</span>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span>ID de sauvegarde:</span>
                <span className="font-medium font-mono">{result.result.backupId}</span>
              </div>
              <div className="flex justify-between">
                <span>Taille:</span>
                <span className="font-medium">{result.result.size}</span>
              </div>
              {result.result.location && (
                <div className="flex justify-between">
                  <span>Emplacement:</span>
                  <span className="font-medium font-mono text-xs">{result.result.location}</span>
                </div>
              )}
            </div>
            {result.result.includes && (
              <div className="mt-3">
                <span className="text-green-700 dark:text-green-300 block mb-2">Données sauvegardées:</span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-green-100 dark:bg-green-800 p-2 rounded">
                    <div className="font-medium">{result.result.includes.users}</div>
                    <div className="text-green-600 dark:text-green-400">Utilisateurs</div>
                  </div>
                  <div className="bg-green-100 dark:bg-green-800 p-2 rounded">
                    <div className="font-medium">{result.result.includes.projects}</div>
                    <div className="text-green-600 dark:text-green-400">Projets</div>
                  </div>
                  <div className="bg-green-100 dark:bg-green-800 p-2 rounded">
                    <div className="font-medium">{result.result.includes.todos}</div>
                    <div className="text-green-600 dark:text-green-400">Tâches</div>
                  </div>
                  <div className="bg-green-100 dark:bg-green-800 p-2 rounded">
                    <div className="font-medium">{result.result.includes.categories}</div>
                    <div className="text-green-600 dark:text-green-400">Catégories</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
} 