'use client'

import { LineChart, Line, ResponsiveContainer } from 'recharts'

export default function MiniChart({ data, dataKey, color = '#3B82F6', height = 40 }) {
  // Ne pas afficher de loader si les données sont vides, juste un graphique vide
  if (!data || data.length === 0) {
    return (
      <div className="w-full" style={{ height: `${height}px` }}>
        <div className="w-full h-full bg-gray-50 dark:bg-gray-700/50 rounded border border-gray-200 dark:border-gray-600 flex items-center justify-center">
          <span className="text-xs text-gray-400 dark:text-gray-500">En attente...</span>
        </div>
      </div>
    )
  }

  // Prendre les 20 derniers points pour le mini graphique
  const chartData = data.slice(-20)

  return (
    <div className="w-full" style={{ height: `${height}px` }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2}
            dot={false}
            activeDot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
} 