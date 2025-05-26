'use client'

import { useNotificationBadges } from '@/lib/hooks/useNotificationBadges'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'

export default function TestBadgesPage() {
  const { user } = useAuth()
  const { 
    badges, 
    decrementNotifications, 
    decrementInvitations, 
    decrementFriends,
    incrementNotifications, 
    incrementInvitations, 
    incrementFriends,
    resetNotifications,
    resetInvitations,
    resetFriends,
    refreshBadges
  } = useNotificationBadges()

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto text-center py-16">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Connexion requise</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">Vous devez être connecté pour tester les badges</p>
        <Link href="/auth/login" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
          Se connecter
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <Link 
          href="/" 
          className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mb-4"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Retour à l'accueil
        </Link>
        
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">🧪 Test des Badges Dynamiques</h1>
        <p className="text-gray-600 dark:text-gray-300">Testez le comportement en temps réel des badges de notification dans la navbar</p>
      </div>

      {/* État actuel des badges */}
      <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">📊 État actuel des badges</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600 dark:text-red-400">{badges.notifications}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Notifications</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{badges.invitations}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Invitations</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">{badges.friends}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Demandes d'amis</div>
          </div>
        </div>

        <button
          onClick={refreshBadges}
          className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
        >
          🔄 Actualiser depuis l'API
        </button>
      </div>

      {/* Contrôles de test */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Notifications */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">🔔 Notifications</h3>
          
          <div className="space-y-3">
            <button
              onClick={() => incrementNotifications(1)}
              className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              + Ajouter 1
            </button>
            <button
              onClick={() => decrementNotifications(1)}
              className="w-full bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
              disabled={badges.notifications === 0}
            >
              - Retirer 1
            </button>
            <button
              onClick={resetNotifications}
              className="w-full bg-red-400 text-white px-4 py-2 rounded-lg hover:bg-red-500 transition-colors"
              disabled={badges.notifications === 0}
            >
              🗑️ Reset
            </button>
          </div>
        </div>

        {/* Invitations */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">📨 Invitations</h3>
          
          <div className="space-y-3">
            <button
              onClick={() => incrementInvitations(1)}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              + Ajouter 1
            </button>
            <button
              onClick={() => decrementInvitations(1)}
              className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              disabled={badges.invitations === 0}
            >
              - Retirer 1
            </button>
            <button
              onClick={resetInvitations}
              className="w-full bg-blue-400 text-white px-4 py-2 rounded-lg hover:bg-blue-500 transition-colors"
              disabled={badges.invitations === 0}
            >
              🗑️ Reset
            </button>
          </div>
        </div>

        {/* Amis */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">👥 Amis</h3>
          
          <div className="space-y-3">
            <button
              onClick={() => incrementFriends(1)}
              className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              + Ajouter 1
            </button>
            <button
              onClick={() => decrementFriends(1)}
              className="w-full bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
              disabled={badges.friends === 0}
            >
              - Retirer 1
            </button>
            <button
              onClick={resetFriends}
              className="w-full bg-green-400 text-white px-4 py-2 rounded-lg hover:bg-green-500 transition-colors"
              disabled={badges.friends === 0}
            >
              🗑️ Reset
            </button>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-3">💡 Instructions de test</h3>
        <ul className="space-y-2 text-blue-700 dark:text-blue-300">
          <li>• Regardez la navbar en haut - les badges apparaissent à côté des liens quand le nombre &gt; 0</li>
          <li>• Utilisez les boutons ci-dessus pour simuler l'ajout/suppression de notifications</li>
          <li>• Les badges disparaissent automatiquement quand le nombre atteint 0</li>
          <li>• Testez en visitant les vraies pages :</li>
          <ul className="ml-4 mt-2 space-y-1">
            <li>- <Link href="/notifications" className="underline hover:text-blue-600">Page Notifications</Link> (les badges se décrémentent quand vous marquez comme lu)</li>
            <li>- <Link href="/invitations" className="underline hover:text-blue-600">Page Invitations</Link> (les badges se décrémentent quand vous acceptez/refusez)</li>
            <li>- <Link href="/friends" className="underline hover:text-blue-600">Page Amis</Link> (les badges se décrémentent quand vous traitez une demande)</li>
          </ul>
        </ul>
      </div>
    </div>
  )
} 