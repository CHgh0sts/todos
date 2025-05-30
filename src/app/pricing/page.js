'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import toast from 'react-hot-toast'
import Cookies from 'js-cookie'

export default function Pricing() {
  const { user } = useAuth()
  const [currentPlan, setCurrentPlan] = useState('free')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      setCurrentPlan(user.plan || 'free')
    }
  }, [user])

  const getAuthHeaders = () => {
    const token = Cookies.get('token')
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }

  const plans = [
    {
      id: 'free',
      name: 'Gratuit',
      price: '0€',
      period: '/mois',
      description: 'Parfait pour commencer avec l\'API',
      features: [
        '1 000 requêtes API par mois',
        '10 requêtes par minute',
        '3 projets maximum',
        '5 participants par projet',
        'Endpoints de base',
        'Support communautaire',
        'Documentation complète'
      ],
      limitations: [
        'Pas de webhooks',
        'Support limité',
        'Projets limités'
      ],
      buttonText: 'Plan actuel',
      buttonStyle: 'bg-gray-100 text-gray-500 cursor-not-allowed',
      popular: false
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '29€',
      period: '/mois',
      description: 'Pour les développeurs et équipes actives',
      features: [
        '100 000 requêtes API par mois',
        '100 requêtes par minute',
        '50 projets maximum',
        '25 participants par projet',
        'Accès complet à l\'API',
        'Webhooks en temps réel',
        'Support prioritaire',
        'Analytics avancées',
        'Intégrations tierces'
      ],
      limitations: [],
      buttonText: 'Passer au Pro',
      buttonStyle: 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700',
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Entreprise',
      price: 'Sur mesure',
      period: '',
      description: 'Solutions personnalisées pour grandes entreprises',
      features: [
        'Requêtes illimitées',
        'Limite de débit personnalisée',
        'Projets illimités',
        'Participants illimités',
        'SLA garanti 99.9%',
        'Support dédié 24/7',
        'Intégrations sur mesure',
        'Formation équipe',
        'Sécurité renforcée',
        'Déploiement on-premise'
      ],
      limitations: [],
      buttonText: 'Nous contacter',
      buttonStyle: 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100',
      popular: false
    }
  ]

  const handlePlanSelection = async (planId) => {
    if (!user) {
      toast.error('Veuillez vous connecter pour changer de plan')
      return
    }

    if (planId === currentPlan) {
      return
    }

    if (planId === 'enterprise') {
      window.location.href = 'mailto:contact@collabwave.com?subject=Demande plan Entreprise'
      return
    }

    setLoading(true)
    try {
      // Ici vous pourriez ajouter la logique de changement de plan
      // Pour l'instant, on simule juste
      toast.success(`Changement vers le plan ${planId === 'pro' ? 'Pro' : 'Gratuit'} en cours...`)
      
      // Redirection vers la page de paiement ou traitement
      if (planId === 'pro') {
        toast.info('Redirection vers le système de paiement...')
        // window.location.href = '/checkout?plan=pro'
      }
    } catch (error) {
      toast.error('Erreur lors du changement de plan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 top-16 overflow-y-auto">
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900 py-20 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <Link 
              href="/profile" 
              className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
            >
              <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Retour au profil
            </Link>
            
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Plans & Tarifs API
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Choisissez le plan qui correspond à vos besoins d'intégration API. 
              Commencez gratuitement et évoluez selon votre croissance.
            </p>
            
            {user && (
              <div className="mt-6 inline-flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
                <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Plan actuel : {currentPlan === 'pro' ? 'Pro' : 'Gratuit'}
              </div>
            )}
          </div>

          {/* Plans */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl ${
                  plan.popular ? 'ring-2 ring-purple-500 scale-105' : ''
                } ${currentPlan === plan.id ? 'ring-2 ring-blue-500' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-center py-2 text-sm font-medium">
                    ⭐ Le plus populaire
                  </div>
                )}
                
                {currentPlan === plan.id && (
                  <div className="absolute top-0 left-0 right-0 bg-blue-600 text-white text-center py-2 text-sm font-medium">
                    ✅ Votre plan actuel
                  </div>
                )}

                <div className={`p-8 ${plan.popular || currentPlan === plan.id ? 'pt-12' : ''}`}>
                  {/* Header du plan */}
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {plan.name}
                    </h3>
                    <div className="flex items-baseline justify-center mb-4">
                      <span className="text-4xl font-extrabold text-gray-900 dark:text-white">
                        {plan.price}
                      </span>
                      {plan.period && (
                        <span className="text-lg text-gray-500 dark:text-gray-400 ml-1">
                          {plan.period}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 dark:text-gray-300">
                      {plan.description}
                    </p>
                  </div>

                  {/* Fonctionnalités */}
                  <div className="mb-8">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2 flex-shrink-0 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Inclus
                    </h4>
                    <ul className="space-y-3">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-gray-600 dark:text-gray-300 text-sm">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Limitations */}
                  {plan.limitations.length > 0 && (
                    <div className="mb-8">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                        <svg className="w-5 h-5 mr-2 flex-shrink-0 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Limitations
                      </h4>
                      <ul className="space-y-3">
                        {plan.limitations.map((limitation, index) => (
                          <li key={index} className="flex items-start">
                            <svg className="w-5 h-5 text-red-500 mr-3 flex-shrink-0 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            <span className="text-gray-600 dark:text-gray-300 text-sm">
                              {limitation}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Bouton d'action */}
                  <button
                    onClick={() => handlePlanSelection(plan.id)}
                    disabled={loading || currentPlan === plan.id}
                    className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:transform-none disabled:hover:scale-100 ${
                      currentPlan === plan.id 
                        ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
                        : plan.buttonStyle
                    }`}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Traitement...
                      </span>
                    ) : (
                      currentPlan === plan.id ? 'Plan actuel' : plan.buttonText
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Tableau de comparaison */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-16">
            <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
              Comparaison détaillée
            </h2>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-4 px-6 font-semibold text-gray-900 dark:text-white">Fonctionnalités</th>
                    <th className="text-center py-4 px-6 font-semibold text-gray-900 dark:text-white">Gratuit</th>
                    <th className="text-center py-4 px-6 font-semibold text-purple-600 dark:text-purple-400">Pro</th>
                    <th className="text-center py-4 px-6 font-semibold text-gray-900 dark:text-white">Entreprise</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  <tr>
                    <td className="py-4 px-6 font-medium text-gray-900 dark:text-white">Requêtes API / mois</td>
                    <td className="py-4 px-6 text-center text-gray-600 dark:text-gray-300">1 000</td>
                    <td className="py-4 px-6 text-center text-purple-600 dark:text-purple-400 font-semibold">100 000</td>
                    <td className="py-4 px-6 text-center text-gray-600 dark:text-gray-300">Illimitées</td>
                  </tr>
                  <tr>
                    <td className="py-4 px-6 font-medium text-gray-900 dark:text-white">Limite par minute</td>
                    <td className="py-4 px-6 text-center text-gray-600 dark:text-gray-300">10</td>
                    <td className="py-4 px-6 text-center text-purple-600 dark:text-purple-400 font-semibold">100</td>
                    <td className="py-4 px-6 text-center text-gray-600 dark:text-gray-300">Personnalisée</td>
                  </tr>
                  <tr>
                    <td className="py-4 px-6 font-medium text-gray-900 dark:text-white">Projets maximum</td>
                    <td className="py-4 px-6 text-center text-gray-600 dark:text-gray-300">3</td>
                    <td className="py-4 px-6 text-center text-purple-600 dark:text-purple-400 font-semibold">50</td>
                    <td className="py-4 px-6 text-center text-gray-600 dark:text-gray-300">Illimités</td>
                  </tr>
                  <tr>
                    <td className="py-4 px-6 font-medium text-gray-900 dark:text-white">Participants par projet</td>
                    <td className="py-4 px-6 text-center text-gray-600 dark:text-gray-300">5</td>
                    <td className="py-4 px-6 text-center text-purple-600 dark:text-purple-400 font-semibold">25</td>
                    <td className="py-4 px-6 text-center text-gray-600 dark:text-gray-300">Illimités</td>
                  </tr>
                  <tr>
                    <td className="py-4 px-6 font-medium text-gray-900 dark:text-white">Webhooks</td>
                    <td className="py-4 px-6 text-center">
                      <svg className="w-5 h-5 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <svg className="w-5 h-5 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <svg className="w-5 h-5 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-4 px-6 font-medium text-gray-900 dark:text-white">Support</td>
                    <td className="py-4 px-6 text-center text-gray-600 dark:text-gray-300">Communautaire</td>
                    <td className="py-4 px-6 text-center text-purple-600 dark:text-purple-400 font-semibold">Prioritaire</td>
                    <td className="py-4 px-6 text-center text-gray-600 dark:text-gray-300">Dédié 24/7</td>
                  </tr>
                  <tr>
                    <td className="py-4 px-6 font-medium text-gray-900 dark:text-white">Analytics</td>
                    <td className="py-4 px-6 text-center text-gray-600 dark:text-gray-300">Basiques</td>
                    <td className="py-4 px-6 text-center text-purple-600 dark:text-purple-400 font-semibold">Avancées</td>
                    <td className="py-4 px-6 text-center text-gray-600 dark:text-gray-300">Personnalisées</td>
                  </tr>
                  <tr>
                    <td className="py-4 px-6 font-medium text-gray-900 dark:text-white">SLA</td>
                    <td className="py-4 px-6 text-center">
                      <svg className="w-5 h-5 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <svg className="w-5 h-5 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </td>
                    <td className="py-4 px-6 text-center text-gray-600 dark:text-gray-300">99.9%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
              Questions fréquentes
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Puis-je changer de plan à tout moment ?
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Oui, vous pouvez passer d'un plan à l'autre à tout moment. Les changements prennent effet immédiatement.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Que se passe-t-il si je dépasse ma limite ?
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Vos requêtes seront limitées jusqu'au prochain cycle de facturation. Nous vous recommandons de passer au plan supérieur.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Y a-t-il une période d'essai gratuite ?
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Le plan gratuit vous permet de tester l'API avec 1000 requêtes par mois, sans limitation de durée.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Comment fonctionne le support prioritaire ?
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Les utilisateurs Pro bénéficient d'un temps de réponse garanti sous 24h et d'un accès direct à notre équipe technique.
                </p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center mt-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Prêt à commencer ?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Créez votre compte et commencez à utiliser l'API dès maintenant
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/api"
                className="px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors duration-200 shadow-lg hover:shadow-xl"
              >
                📚 Voir la documentation
              </Link>
              
              {!user && (
                <Link
                  href="/auth/register"
                  className="px-8 py-4 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors duration-200 shadow-lg hover:shadow-xl"
                >
                  🚀 Créer un compte gratuit
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 