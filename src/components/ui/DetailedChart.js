'use client'

import { useState, useEffect, useRef } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function DetailedChart({ data }) {
  const [timeFilter, setTimeFilter] = useState('all')
  const [selectedMetrics, setSelectedMetrics] = useState(['cpuUsage', 'memoryUsage'])
  const [isInitialized, setIsInitialized] = useState(false)
  const previousDataRef = useRef(null)

  // Utiliser les données précédentes si les nouvelles sont vides (pendant la mise à jour)
  const currentData = data && data.length > 0 ? data : previousDataRef.current

  useEffect(() => {
    if (data && data.length > 0) {
      previousDataRef.current = data
      if (!isInitialized) {
        setIsInitialized(true)
      }
    }
  }, [data, isInitialized])

  const metrics = [
    { key: 'cpuUsage', name: 'CPU Usage (%)', color: '#3B82F6', unit: '%' },
    { key: 'memoryUsage', name: 'Mémoire (MB)', color: '#10B981', unit: 'MB' },
    { key: 'memoryPercent', name: 'Mémoire (%)', color: '#8B5CF6', unit: '%' },
    { key: 'diskUsage', name: 'Disque (GB)', color: '#F59E0B', unit: 'GB' },
    { key: 'diskPercent', name: 'Disque (%)', color: '#EF4444', unit: '%' },
    { key: 'requestsPerMinute', name: 'Requêtes/min', color: '#06B6D4', unit: '/min' },
    { key: 'avgResponseTime', name: 'Temps réponse (ms)', color: '#84CC16', unit: 'ms' },
    { key: 'errorsPerHour', name: 'Erreurs/h', color: '#F97316', unit: '/h' }
  ]

  const timeFilters = [
    { key: 'all', name: 'Tout', points: -1 },
    { key: '5min', name: '5 min', points: 60 }, // 5 secondes * 60 = 5 min
    { key: '15min', name: '15 min', points: 180 },
    { key: '30min', name: '30 min', points: 360 },
    { key: '1h', name: '1 heure', points: 720 }
  ]

  const getFilteredData = () => {
    if (!currentData || currentData.length === 0) return []
    
    const filter = timeFilters.find(f => f.key === timeFilter)
    if (filter.points === -1) return currentData
    
    return currentData.slice(-filter.points)
  }

  const toggleMetric = (metricKey) => {
    setSelectedMetrics(prev => 
      prev.includes(metricKey)
        ? prev.filter(m => m !== metricKey)
        : [...prev, metricKey]
    )
  }

  const filteredData = getFilteredData()

  // Afficher le loader seulement au premier chargement
  if (!isInitialized) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Graphique Détaillé
        </h3>
        <div className="h-96 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-500 dark:text-gray-400">Collecte des données...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
        <div className="flex items-center space-x-3 mb-4 lg:mb-0">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Graphique Détaillé des Métriques
          </h3>
          {/* Indicateur de mise à jour en temps réel */}
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Temps réel
            </span>
          </div>
        </div>
        
        {/* Filtres de temps */}
        <div className="flex flex-wrap gap-2">
          {timeFilters.map(filter => (
            <button
              key={filter.key}
              onClick={() => setTimeFilter(filter.key)}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                timeFilter === filter.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {filter.name}
            </button>
          ))}
        </div>
      </div>

      {/* Sélection des métriques */}
      <div className="mb-6">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Métriques à afficher:
        </p>
        <div className="flex flex-wrap gap-2">
          {metrics.map(metric => (
            <button
              key={metric.key}
              onClick={() => toggleMetric(metric.key)}
              className={`px-3 py-1 text-sm rounded-lg border transition-colors ${
                selectedMetrics.includes(metric.key)
                  ? 'border-transparent text-white'
                  : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
              style={{
                backgroundColor: selectedMetrics.includes(metric.key) ? metric.color : 'transparent'
              }}
            >
              <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ backgroundColor: metric.color }}></span>
              {metric.name}
            </button>
          ))}
        </div>
      </div>

      {/* Graphique */}
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={filteredData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
            <XAxis 
              dataKey="time" 
              stroke="#6B7280"
              fontSize={12}
              interval="preserveStartEnd"
            />
            <YAxis stroke="#6B7280" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#F9FAFB'
              }}
              formatter={(value, name) => {
                const metric = metrics.find(m => m.key === name)
                return [`${value}${metric?.unit || ''}`, metric?.name || name]
              }}
            />
            <Legend />
            {selectedMetrics.map(metricKey => {
              const metric = metrics.find(m => m.key === metricKey)
              return (
                <Line
                  key={metricKey}
                  type="monotone"
                  dataKey={metricKey}
                  stroke={metric.color}
                  strokeWidth={2}
                  dot={false}
                  name={metric.name}
                  connectNulls={false}
                />
              )
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Statistiques */}
      <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">Points de données</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">{filteredData.length}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">Période</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {timeFilters.find(f => f.key === timeFilter)?.name}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">Métriques actives</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">{selectedMetrics.length}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">Mise à jour</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">5s</p>
        </div>
      </div>
    </div>
  )
} 