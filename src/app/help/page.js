'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function HelpPage() {
  const [activeSection, setActiveSection] = useState(null)
  const [openFaq, setOpenFaq] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  
  const sections = [
    { id: 'getting-started', title: 'Démarrage rapide', icon: '🚀' },
    { id: 'projects', title: 'Gestion de projets', icon: '📁' },
    { id: 'collaboration', title: 'Collaboration', icon: '🤝' },
    { id: 'tasks', title: 'Gestion des tâches', icon: '✅' },
    { id: 'notifications', title: 'Notifications', icon: '🔔' },
    { id: 'account', title: 'Compte et profil', icon: '👤' },
    { id: 'billing', title: 'Facturation', icon: '💳' },
    { id: 'security', title: 'Sécurité', icon: '🔒' },
    { id: 'troubleshooting', title: 'Dépannage', icon: '🔧' },
    { id: 'contact', title: 'Nous contacter', icon: '📧' }
  ]

  const faqData = [
    {
      category: 'getting-started',
      questions: [
        {
          q: "Comment créer mon premier projet ?",
          a: "Cliquez sur le bouton 'Nouveau projet' dans votre tableau de bord, donnez-lui un nom et une description, puis invitez vos collaborateurs."
        },
        {
          q: "Comment inviter des membres à mon équipe ?",
          a: "Dans les paramètres du projet, cliquez sur 'Inviter des membres', saisissez leurs adresses email et définissez leurs permissions."
        },
        {
          q: "Puis-je utiliser CollabWave gratuitement ?",
          a: "Oui, nous proposons un plan gratuit avec des fonctionnalités de base pour jusqu'à 3 projets et 5 collaborateurs."
        }
      ]
    },
    {
      category: 'projects',
      questions: [
        {
          q: "Comment organiser mes projets ?",
          a: "Utilisez les catégories et les tags pour organiser vos projets. Vous pouvez également créer des dossiers pour regrouper les projets similaires."
        },
        {
          q: "Puis-je dupliquer un projet existant ?",
          a: "Oui, cliquez sur les trois points à côté du nom du projet et sélectionnez 'Dupliquer'. Vous pouvez choisir quels éléments copier."
        },
        {
          q: "Comment archiver un projet terminé ?",
          a: "Dans les paramètres du projet, cliquez sur 'Archiver le projet'. Les projets archivés restent accessibles mais n'apparaissent plus dans votre liste active."
        }
      ]
    },
    {
      category: 'collaboration',
      questions: [
        {
          q: "Comment partager un projet avec des clients ?",
          a: "Créez un lien de partage public dans les paramètres du projet. Vous pouvez définir les permissions (lecture seule, commentaires, etc.)."
        },
        {
          q: "Comment voir qui travaille sur quoi ?",
          a: "Le tableau de bord d'activité montre en temps réel qui fait quoi. Vous pouvez aussi voir les indicateurs de présence en ligne."
        },
        {
          q: "Puis-je limiter l'accès à certaines tâches ?",
          a: "Oui, vous pouvez définir des permissions granulaires par tâche et assigner des responsables spécifiques."
        }
      ]
    },
    {
      category: 'tasks',
      questions: [
        {
          q: "Comment créer des sous-tâches ?",
          a: "Ouvrez une tâche et cliquez sur 'Ajouter une sous-tâche'. Vous pouvez créer plusieurs niveaux de hiérarchie."
        },
        {
          q: "Comment définir des échéances ?",
          a: "Lors de la création ou modification d'une tâche, cliquez sur l'icône calendrier pour définir une date d'échéance."
        },
        {
          q: "Puis-je créer des modèles de tâches ?",
          a: "Oui, sauvegardez vos tâches fréquentes comme modèles pour les réutiliser rapidement dans d'autres projets."
        }
      ]
    },
    {
      category: 'account',
      questions: [
        {
          q: "Comment changer mon mot de passe ?",
          a: "Allez dans Paramètres > Sécurité et cliquez sur 'Changer le mot de passe'. Vous recevrez un email de confirmation."
        },
        {
          q: "Comment supprimer mon compte ?",
          a: "Dans Paramètres > Compte, cliquez sur 'Supprimer le compte'. Cette action est irréversible après 30 jours."
        },
        {
          q: "Comment activer l'authentification à deux facteurs ?",
          a: "Dans Paramètres > Sécurité, activez la 2FA et scannez le QR code avec votre application d'authentification."
        }
      ]
    }
  ]

  const guides = [
    {
      title: "Guide de démarrage rapide",
      description: "Apprenez les bases de CollabWave en 10 minutes",
      duration: "10 min",
      level: "Débutant",
      icon: "🚀",
      steps: [
        "Créer votre premier projet",
        "Inviter des collaborateurs",
        "Créer et assigner des tâches",
        "Utiliser les notifications"
      ]
    },
    {
      title: "Maîtriser la collaboration",
      description: "Optimisez le travail d'équipe avec les fonctionnalités avancées",
      duration: "20 min",
      level: "Intermédiaire",
      icon: "🤝",
      steps: [
        "Permissions et rôles",
        "Partage de projets",
        "Commentaires et mentions",
        "Suivi d'activité en temps réel"
      ]
    },
    {
      title: "Gestion avancée des projets",
      description: "Techniques pour gérer des projets complexes",
      duration: "30 min",
      level: "Avancé",
      icon: "📊",
      steps: [
        "Modèles de projets",
        "Automatisations",
        "Rapports et analytics",
        "Intégrations tierces"
      ]
    }
  ]

  const filteredFaq = faqData.map(category => ({
    ...category,
    questions: category.questions.filter(item =>
      item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0)

  const toggleFaq = (categoryIndex, questionIndex) => {
    const key = `${categoryIndex}-${questionIndex}`
    setOpenFaq(openFaq === key ? null : key)
  }

  return (
    <div className="fixed inset-0 top-16 overflow-y-auto">
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full mb-6">
              <svg className="w-8 h-8 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Centre d'aide CollabWave
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Trouvez des réponses, apprenez les bonnes pratiques et maîtrisez CollabWave
            </p>
            
            {/* Barre de recherche */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Rechercher dans l'aide..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl leading-5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Guides de démarrage rapide */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
              Guides de démarrage
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {guides.map((guide, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-shadow">
                  <div className="text-center mb-4">
                    <div className="text-3xl mb-2">{guide.icon}</div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {guide.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                      {guide.description}
                    </p>
                    <div className="flex justify-center space-x-4 text-xs text-gray-500 dark:text-gray-400 mb-4">
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {guide.duration}
                      </span>
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        {guide.level}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2 mb-6">
                    {guide.steps.map((step, stepIndex) => (
                      <div key={stepIndex} className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                        <div className="w-5 h-5 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center text-xs font-semibold mr-3 flex-shrink-0">
                          {stepIndex + 1}
                        </div>
                        {step}
                      </div>
                    ))}
                  </div>
                  <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                    Commencer le guide
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* Navigation des sections */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 sticky top-8">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Catégories d'aide
                </h3>
                <nav className="space-y-2">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => {
                        document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth' })
                        setActiveSection(section.id)
                      }}
                      className={`w-full text-left flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                        activeSection === section.id
                          ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <span>{section.icon}</span>
                      <span className="truncate">{section.title}</span>
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Contenu principal */}
            <div className="lg:col-span-3">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
                
                {/* FAQ Sections */}
                {filteredFaq.map((category, categoryIndex) => (
                  <section key={category.category} id={category.category} className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                      <span className="mr-3">{sections.find(s => s.id === category.category)?.icon}</span>
                      {sections.find(s => s.id === category.category)?.title}
                    </h2>
                    <div className="space-y-4">
                      {category.questions.map((item, questionIndex) => (
                        <div key={questionIndex} className="border border-gray-200 dark:border-gray-600 rounded-lg">
                          <button
                            onClick={() => toggleFaq(categoryIndex, questionIndex)}
                            className="w-full text-left px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          >
                            <span className="font-medium text-gray-900 dark:text-white pr-4">
                              {item.q}
                            </span>
                            <svg
                              className={`w-5 h-5 text-gray-500 transition-transform ${
                                openFaq === `${categoryIndex}-${questionIndex}` ? 'rotate-180' : ''
                              }`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          {openFaq === `${categoryIndex}-${questionIndex}` && (
                            <div className="px-6 pb-4">
                              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                {item.a}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                ))}

                {/* Section Dépannage */}
                <section id="troubleshooting" className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                    <span className="mr-3">🔧</span>
                    Dépannage
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
                      <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">🚨 Problèmes courants</h4>
                      <ul className="text-red-700 dark:text-red-300 text-sm space-y-1">
                        <li>• Impossible de se connecter</li>
                        <li>• Notifications non reçues</li>
                        <li>• Synchronisation lente</li>
                        <li>• Erreurs de chargement</li>
                      </ul>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
                      <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">✅ Solutions rapides</h4>
                      <ul className="text-green-700 dark:text-green-300 text-sm space-y-1">
                        <li>• Vider le cache du navigateur</li>
                        <li>• Vérifier la connexion internet</li>
                        <li>• Redémarrer l'application</li>
                        <li>• Mettre à jour le navigateur</li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* Section Contact */}
                <section id="contact" className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                    <span className="mr-3">📧</span>
                    Nous contacter
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-6 text-center">
                      <div className="text-3xl mb-3">💬</div>
                      <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Chat en direct</h4>
                      <p className="text-blue-700 dark:text-blue-300 text-sm mb-4">
                        Disponible 24h/24, 7j/7
                      </p>
                      <button 
                        onClick={() => {
                          // Déclencher l'ouverture du chat en simulant un clic sur le bouton flottant
                          const chatButton = document.querySelector('[data-chat-button]')
                          if (chatButton) {
                            chatButton.click()
                          } else {
                            // Si le bouton n'est pas trouvé, on peut déclencher un événement personnalisé
                            window.dispatchEvent(new CustomEvent('openLiveChat'))
                          }
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                      >
                        Démarrer le chat
                      </button>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-6 text-center">
                      <div className="text-3xl mb-3">📧</div>
                      <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">Email</h4>
                      <p className="text-green-700 dark:text-green-300 text-sm mb-4">
                        Réponse sous 24h
                      </p>
                      <Link href="mailto:support@collabwave.com" className="inline-block bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                        Envoyer un email
                      </Link>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg p-6 text-center">
                      <div className="text-3xl mb-3">📚</div>
                      <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">Documentation</h4>
                      <p className="text-purple-700 dark:text-purple-300 text-sm mb-4">
                        Guides détaillés
                      </p>
                      <Link href="/documentation" className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                        Voir la doc
                      </Link>
                    </div>
                  </div>
                </section>

              </div>
            </div>
          </div>

          {/* Section ressources supplémentaires */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
              Ressources supplémentaires
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Link href="/tutorials" className="group bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-all hover:scale-105">
                <div className="text-center">
                  <div className="text-3xl mb-3">🎥</div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Tutoriels vidéo</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">Apprenez visuellement avec nos vidéos</p>
                </div>
              </Link>
              <Link href="/blog" className="group bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-all hover:scale-105">
                <div className="text-center">
                  <div className="text-3xl mb-3">📝</div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Blog</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">Conseils et bonnes pratiques</p>
                </div>
              </Link>
              <Link href="/status" className="group bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-all hover:scale-105">
                <div className="text-center">
                  <div className="text-3xl mb-3">📊</div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Statut du service</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">Vérifiez la disponibilité</p>
                </div>
              </Link>
              <Link href="/contact" className="group bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-all hover:scale-105">
                <div className="text-center">
                  <div className="text-3xl mb-3">🤝</div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Communauté</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">Échangez avec d'autres utilisateurs</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Footer de la page */}
          <div className="mt-16 text-center">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Vous ne trouvez pas ce que vous cherchez ?
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Notre équipe support est là pour vous aider. N'hésitez pas à nous contacter !
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <button 
                  onClick={() => {
                    // Déclencher l'ouverture du chat
                    window.dispatchEvent(new CustomEvent('openLiveChat'))
                  }}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
                >
                  Contacter le support
                </button>
                <Link href="/contact" className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium py-2 px-6 rounded-lg transition-colors">
                  Formulaire de contact
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
} 