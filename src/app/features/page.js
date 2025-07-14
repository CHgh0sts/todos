'use client'

import { useState } from 'react'
import NextLink from 'next/link'
import { 
  CheckCircle, 
  Users, 
  Zap, 
  Shield, 
  Smartphone, 
  Globe, 
  BarChart3, 
  Bell, 
  MessageSquare, 
  FileText, 
  Settings, 
  Search,
  Calendar,
  Clock,
  Target,
  Workflow,
  Database,
  Palette,
  Share2,
  Lock,
  Eye,
  Download,
  Upload,
  RefreshCw,
  Star,
  Heart,
  Lightbulb,
  Rocket,
  Award,
  TrendingUp,
  Filter,
  Tag,
  Link,
  ArrowRight,
  PlayCircle,
  Pause,
  SkipForward
} from 'lucide-react'

export default function Features() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [activeDemo, setActiveDemo] = useState(null)

  const categories = [
    { id: 'all', label: 'Toutes', icon: Star },
    { id: 'productivity', label: 'Productivité', icon: Target },
    { id: 'collaboration', label: 'Collaboration', icon: Users },
    { id: 'security', label: 'Sécurité', icon: Shield },
    { id: 'integration', label: 'Intégrations', icon: Link },
    { id: 'mobile', label: 'Mobile', icon: Smartphone }
  ]

  const features = [
    {
      id: 'project-management',
      category: 'productivity',
      title: 'Gestion de Projets Avancée',
      description: 'Créez, organisez et personnalisez vos projets avec un système flexible et intuitif.',
      icon: Workflow,
      color: 'blue',
      features: [
        'Création de projets avec couleurs et emojis personnalisés',
        'Organisation par catégories et tags',
        'Descriptions riches avec formatage Markdown',
        'Statuts personnalisables et workflow adaptatif',
        'Archivage et restauration de projets'
      ],
      demo: {
        type: 'interactive',
        component: 'ProjectDemo'
      }
    },
    {
      id: 'real-time-collaboration',
      category: 'collaboration',
      title: 'Collaboration Temps Réel',
      description: 'Travaillez ensemble instantanément avec Socket.IO et voyez les modifications en direct.',
      icon: Zap,
      color: 'purple',
      features: [
        'Modifications synchronisées en temps réel',
        'Curseurs collaboratifs et présence utilisateur',
        'Notifications instantanées des actions',
        'Système de commentaires et mentions',
        'Historique des modifications'
      ],
      demo: {
        type: 'video',
        thumbnail: '/screenshots/collaboration.png'
      }
    },
    {
      id: 'task-management',
      category: 'productivity',
      title: 'Gestion de Tâches Intelligente',
      description: 'Organisez vos tâches avec des outils puissants et une interface intuitive.',
      icon: CheckCircle,
      color: 'green',
      features: [
        'Création et édition de tâches rapide',
        'Priorités et dates d\'échéance',
        'Sous-tâches et dépendances',
        'Assignation aux membres de l\'équipe',
        'Statuts personnalisables (À faire, En cours, Terminé)'
      ],
      demo: {
        type: 'interactive',
        component: 'TaskDemo'
      }
    },
    {
      id: 'permissions-system',
      category: 'security',
      title: 'Système de Permissions Granulaires',
      description: 'Contrôlez précisément qui peut faire quoi dans chaque projet.',
      icon: Lock,
      color: 'red',
      features: [
        'Rôles utilisateur (Propriétaire, Admin, Éditeur, Lecteur)',
        'Permissions par projet et par fonctionnalité',
        'Invitations sécurisées avec liens temporaires',
        'Audit trail des actions et modifications',
        'Révocation instantanée des accès'
      ],
      demo: {
        type: 'interactive',
        component: 'PermissionsDemo'
      }
    },
    {
      id: 'notifications',
      category: 'productivity',
      title: 'Notifications Intelligentes',
      description: 'Restez informé des activités importantes sans être submergé.',
      icon: Bell,
      color: 'yellow',
      features: [
        'Notifications en temps réel dans l\'application',
        'Système de badges et compteurs',
        'Filtrages et préférences personnalisables',
        'Notifications push pour mobile',
        'Résumés quotidiens et hebdomadaires'
      ],
      demo: {
        type: 'interactive',
        component: 'NotificationsDemo'
      }
    },
    {
      id: 'integrations',
      category: 'integration',
      title: 'Intégrations Puissantes',
      description: 'Connectez CollabWave à vos outils préférés pour un workflow unifié.',
      icon: Link,
      color: 'indigo',
      features: [
        'Webhooks personnalisables pour tous les événements',
        'API REST complète avec documentation',
        'Intégrations Slack et Discord natives',
        'Connexions avec outils de développement',
        'Système de clés API avec gestion fine'
      ],
      demo: {
        type: 'interactive',
        component: 'IntegrationsDemo'
      }
    },
    {
      id: 'mobile-app',
      category: 'mobile',
      title: 'Application Mobile Progressive',
      description: 'Accédez à vos projets partout avec notre PWA optimisée.',
      icon: Smartphone,
      color: 'pink',
      features: [
        'Installation directe depuis le navigateur',
        'Interface responsive et tactile',
        'Synchronisation offline/online',
        'Notifications push natives',
        'Raccourcis et widgets d\'accueil'
      ],
      demo: {
        type: 'screenshots',
        images: ['/screenshots/mobile-projects.png', '/screenshots/mobile-tasks.png']
      }
    },
    {
      id: 'analytics',
      category: 'productivity',
      title: 'Analyses et Rapports',
      description: 'Suivez la performance de vos projets avec des métriques détaillées.',
      icon: BarChart3,
      color: 'cyan',
      features: [
        'Tableaux de bord personnalisables',
        'Métriques de productivité par projet',
        'Graphiques de progression temporelle',
        'Rapports d\'activité des membres',
        'Export des données en CSV/PDF'
      ],
      demo: {
        type: 'interactive',
        component: 'AnalyticsDemo'
      }
    },
    {
      id: 'search',
      category: 'productivity',
      title: 'Recherche Avancée',
      description: 'Trouvez rapidement ce que vous cherchez avec notre moteur de recherche intelligent.',
      icon: Search,
      color: 'orange',
      features: [
        'Recherche globale dans tous les projets',
        'Filtres avancés (date, auteur, statut)',
        'Recherche par mots-clés et tags',
        'Suggestions automatiques',
        'Historique des recherches'
      ],
      demo: {
        type: 'interactive',
        component: 'SearchDemo'
      }
    },
    {
      id: 'customization',
      category: 'productivity',
      title: 'Personnalisation Complète',
      description: 'Adaptez CollabWave à vos besoins avec de nombreuses options de personnalisation.',
      icon: Palette,
      color: 'emerald',
      features: [
        'Thèmes sombre et clair avec auto-switch',
        'Couleurs et icônes personnalisées',
        'Layouts et vues configurables',
        'Raccourcis clavier personnalisables',
        'Profils utilisateur avec avatars'
      ],
      demo: {
        type: 'interactive',
        component: 'CustomizationDemo'
      }
    },
    {
      id: 'security-advanced',
      category: 'security',
      title: 'Sécurité de Niveau Entreprise',
      description: 'Protégez vos données avec les standards de sécurité les plus élevés.',
      icon: Shield,
      color: 'slate',
      features: [
        'Chiffrement AES-256 pour toutes les données',
        'Authentification JWT avec refresh tokens',
        'Authentification à deux facteurs (2FA)',
        'Logs d\'audit complets et traçabilité',
        'Conformité RGPD et SOC 2'
      ],
      demo: {
        type: 'interactive',
        component: 'SecurityDemo'
      }
    },
    {
      id: 'chat-system',
      category: 'collaboration',
      title: 'Chat et Support Intégré',
      description: 'Communiquez directement dans l\'application avec le chat en temps réel.',
      icon: MessageSquare,
      color: 'violet',
      features: [
        'Chat en temps réel avec les membres',
        'Système de support client intégré',
        'Partage de fichiers et captures d\'écran',
        'Mentions et notifications contextuelles',
        'Modération et administration'
      ],
      demo: {
        type: 'interactive',
        component: 'ChatDemo'
      }
    }
  ]

  const filteredFeatures = activeCategory === 'all' 
    ? features 
    : features.filter(feature => feature.category === activeCategory)

  const colorClasses = {
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
    yellow: 'bg-yellow-500',
    indigo: 'bg-indigo-500',
    pink: 'bg-pink-500',
    cyan: 'bg-cyan-500',
    orange: 'bg-orange-500',
    emerald: 'bg-emerald-500',
    slate: 'bg-slate-500',
    violet: 'bg-violet-500'
  }

  const stats = [
    { label: 'Projets créés', value: '10,000+', icon: Workflow },
    { label: 'Utilisateurs actifs', value: '2,500+', icon: Users },
    { label: 'Tâches complétées', value: '100,000+', icon: CheckCircle },
    { label: 'Intégrations', value: '50+', icon: Link }
  ]

  const InteractiveDemo = ({ feature }) => {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border-2 border-dashed border-gray-300 dark:border-gray-600">
        <div className="text-center">
          <feature.icon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Démo Interactive
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Découvrez {feature.title} en action
          </p>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
            Lancer la démo
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <Rocket className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Fonctionnalités Avancées
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto mb-8">
              Découvrez tout ce que CollabWave peut faire pour transformer votre productivité et collaboration d'équipe.
            </p>
            <div className="flex justify-center space-x-4">
              <button className="bg-white text-blue-600 px-8 py-3 rounded-md font-medium hover:bg-gray-100 transition-colors">
                Essayer gratuitement
              </button>
              <button className="border border-white text-white px-8 py-3 rounded-md font-medium hover:bg-white hover:text-blue-600 transition-colors">
                Voir la démo
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-12 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <stat.icon className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Categories Filter */}
      <div className="py-8 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full font-medium transition-colors ${
                  activeCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <category.icon className="w-4 h-4" />
                <span>{category.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredFeatures.map((feature) => (
              <div key={feature.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className={`p-3 rounded-lg ${colorClasses[feature.color]} text-white mr-4`}>
                      <feature.icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {feature.title}
                    </h3>
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {feature.description}
                  </p>
                  
                  <ul className="space-y-2 mb-6">
                    {feature.features.map((item, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">{item}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <div className="space-y-3">
                    <button
                      onClick={() => setActiveDemo(activeDemo === feature.id ? null : feature.id)}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <PlayCircle className="w-4 h-4" />
                      <span>Voir la démo</span>
                    </button>
                    
                    {activeDemo === feature.id && (
                      <div className="mt-4">
                        <InteractiveDemo feature={feature} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Technical Highlights */}
      <div className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Technologies de Pointe
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              CollabWave utilise les dernières technologies pour vous offrir la meilleure expérience
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow">
              <Database className="w-8 h-8 text-blue-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Base de Données</h3>
              <p className="text-gray-600 dark:text-gray-300">PostgreSQL avec Prisma ORM pour des performances optimales</p>
            </div>
            
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow">
              <Zap className="w-8 h-8 text-yellow-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Temps Réel</h3>
              <p className="text-gray-600 dark:text-gray-300">Socket.IO pour la collaboration instantanée</p>
            </div>
            
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow">
              <Shield className="w-8 h-8 text-green-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Sécurité</h3>
              <p className="text-gray-600 dark:text-gray-300">Chiffrement AES-256 et authentification JWT</p>
            </div>
            
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow">
              <Globe className="w-8 h-8 text-purple-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">PWA</h3>
              <p className="text-gray-600 dark:text-gray-300">Application web progressive avec support offline</p>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Performance Exceptionnelle
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Des métriques qui parlent d'elles-mêmes
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">99.9%</div>
              <div className="text-lg font-medium text-gray-900 dark:text-white mb-1">Disponibilité</div>
              <div className="text-gray-600 dark:text-gray-300">Service fiable 24/7</div>
            </div>
            
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">&lt;100ms</div>
              <div className="text-lg font-medium text-gray-900 dark:text-white mb-1">Latence</div>
              <div className="text-gray-600 dark:text-gray-300">Réactivité instantanée</div>
            </div>
            
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">256-bit</div>
              <div className="text-lg font-medium text-gray-900 dark:text-white mb-1">Chiffrement</div>
              <div className="text-gray-600 dark:text-gray-300">Sécurité maximale</div>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Prêt à Transformer Votre Productivité ?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Rejoignez des milliers d'équipes qui utilisent déjà CollabWave pour collaborer plus efficacement.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 px-8 py-3 rounded-md font-medium hover:bg-gray-100 transition-colors">
              Commencer gratuitement
            </button>
            <button className="border border-white text-white px-8 py-3 rounded-md font-medium hover:bg-white hover:text-blue-600 transition-colors">
              Planifier une démo
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white relative">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
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
            <div>
              <h3 className="text-lg font-semibold mb-6">Produit</h3>
              <ul className="space-y-3">
                <li><NextLink href="/features" className="text-gray-300 hover:text-purple-500 transition-colors">Fonctionnalités</NextLink></li>
                <li><NextLink href="/pricing" className="text-gray-300 hover:text-purple-500 transition-colors">Tarifs</NextLink></li>
                <li><NextLink href="/security" className="text-gray-300 hover:text-purple-500 transition-colors">Sécurité</NextLink></li>
                <li><NextLink href="/integrations" className="text-gray-300 hover:text-purple-500 transition-colors">Intégrations</NextLink></li>
                <li><NextLink href="/api" className="text-gray-300 hover:text-purple-500 transition-colors">API</NextLink></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-6">Support</h3>
              <ul className="space-y-3">
                <li><NextLink href="/help" className="text-gray-300 hover:text-purple-500 transition-colors">Centre d'aide</NextLink></li>
                <li><NextLink href="/documentation" className="text-gray-300 hover:text-purple-500 transition-colors">Documentation</NextLink></li>
                <li><NextLink href="/tutorials" className="text-gray-300 hover:text-purple-500 transition-colors">Tutoriels</NextLink></li>
                <li><NextLink href="/contact" className="text-gray-300 hover:text-purple-500 transition-colors">Contact</NextLink></li>
                <li><NextLink href="/status" className="text-gray-300 hover:text-purple-500 transition-colors">Statut du service</NextLink></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-6">Entreprise</h3>
              <ul className="space-y-3">
                <li><NextLink href="/about" className="text-gray-300 hover:text-purple-500 transition-colors">À propos</NextLink></li>
                <li><NextLink href="/blog" className="text-gray-300 hover:text-purple-500 transition-colors">Blog</NextLink></li>
                <li><NextLink href="/careers" className="text-gray-300 hover:text-purple-500 transition-colors">Carrières</NextLink></li>
                <li><NextLink href="/press" className="text-gray-300 hover:text-purple-500 transition-colors">Presse</NextLink></li>
                <li><NextLink href="/partners" className="text-gray-300 hover:text-purple-500 transition-colors">Partenaires</NextLink></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8">
            <div className="flex flex-col lg:flex-row justify-between items-center">
              <div className="mb-6 lg:mb-0">
                <h3 className="text-lg font-semibold mb-2">Restez informé</h3>
                <p className="text-gray-300">Recevez les dernières nouvelles et mises à jour de <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">CollabWave</span>.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <input type="email" placeholder="Votre adresse email" className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                <button className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium">S'abonner</button>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8">
            <div className="flex flex-col lg:flex-row justify-between items-center">
              <div className="flex flex-wrap justify-center lg:justify-start gap-6 mb-4 lg:mb-0">
                <NextLink href="/privacy" className="text-gray-400 hover:text-purple-500 transition-colors text-sm">Politique de confidentialité</NextLink>
                <NextLink href="/terms" className="text-gray-400 hover:text-purple-500 transition-colors text-sm">Conditions d'utilisation</NextLink>
                <NextLink href="/cookies" className="text-gray-400 hover:text-purple-500 transition-colors text-sm">Politique des cookies</NextLink>
                <NextLink href="/legal" className="text-gray-400 hover:text-purple-500 transition-colors text-sm">Mentions légales</NextLink>
                <NextLink href="/gdpr" className="text-gray-400 hover:text-purple-500 transition-colors text-sm">RGPD</NextLink>
              </div>
              <div className="text-gray-400 text-sm">© {new Date().getFullYear()} CollabWave. Tous droits réservés.</div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
} 