'use client'

import { useState } from 'react'
import { 
  BookOpenIcon, 
  PlayIcon, 
  CheckCircleIcon, 
  UserGroupIcon, 
  BellIcon, 
  CogIcon,
  FolderIcon,
  ClipboardDocumentListIcon,
  ShareIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  StarIcon,
  LinkIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'

const tutorials = [
  {
    id: 'getting-started',
    title: 'Premiers pas',
    description: 'Découvrez les bases de WorkWave',
    icon: PlayIcon,
    color: 'from-blue-500 to-cyan-500',
    duration: '10 min',
    difficulty: 'Débutant',
    steps: [
      {
        title: 'Créer votre compte',
        content: 'Commencez par créer un compte gratuit sur WorkWave. Remplissez le formulaire d\'inscription avec votre email et choisissez un mot de passe sécurisé.',
        tips: ['Utilisez un email professionnel', 'Choisissez un mot de passe fort', 'Vérifiez votre boîte de réception']
      },
      {
        title: 'Configuration du profil',
        content: 'Personnalisez votre profil en ajoutant une photo, votre nom complet et vos informations professionnelles.',
        tips: ['Ajoutez une photo de profil', 'Remplissez vos informations', 'Configurez vos préférences']
      },
      {
        title: 'Interface utilisateur',
        content: 'Familiarisez-vous avec l\'interface : tableau de bord, menu de navigation, et les différentes sections.',
        tips: ['Explorez le tableau de bord', 'Testez le menu de navigation', 'Activez le mode sombre si désiré']
      }
    ]
  },
  {
    id: 'project-management',
    title: 'Gestion des projets',
    description: 'Créez et organisez vos projets efficacement',
    icon: FolderIcon,
    color: 'from-green-500 to-emerald-500',
    duration: '15 min',
    difficulty: 'Débutant',
    steps: [
      {
        title: 'Créer un nouveau projet',
        content: 'Cliquez sur "Nouveau projet" et remplissez les informations : nom, description, et catégorie.',
        tips: ['Choisissez un nom descriptif', 'Ajoutez une description claire', 'Sélectionnez la bonne catégorie']
      },
      {
        title: 'Organiser avec des catégories',
        content: 'Utilisez les catégories pour organiser vos projets par domaine, priorité ou équipe.',
        tips: ['Créez des catégories logiques', 'Utilisez des couleurs distinctes', 'Groupez par thème']
      },
      {
        title: 'Paramètres du projet',
        content: 'Configurez les paramètres : visibilité, autorisations, et notifications.',
        tips: ['Définissez la visibilité', 'Configurez les autorisations', 'Activez les notifications']
      }
    ]
  },
  {
    id: 'task-management',
    title: 'Gestion des tâches',
    description: 'Maîtrisez la création et le suivi des tâches',
    icon: ClipboardDocumentListIcon,
    color: 'from-purple-500 to-pink-500',
    duration: '20 min',
    difficulty: 'Intermédiaire',
    steps: [
      {
        title: 'Créer une tâche',
        content: 'Ajoutez des tâches à vos projets avec un titre, description, priorité et échéance.',
        tips: ['Soyez précis dans le titre', 'Ajoutez une description détaillée', 'Définissez une priorité']
      },
      {
        title: 'Organiser les tâches',
        content: 'Utilisez les statuts (À faire, En cours, Terminé) et les filtres pour organiser vos tâches.',
        tips: ['Mettez à jour les statuts', 'Utilisez les filtres', 'Triez par priorité']
      },
      {
        title: 'Suivi et deadlines',
        content: 'Suivez l\'avancement de vos tâches et respectez les échéances.',
        tips: ['Vérifiez régulièrement', 'Respectez les deadlines', 'Anticipez les retards']
      }
    ]
  },
  {
    id: 'collaboration',
    title: 'Collaboration',
    description: 'Travaillez efficacement en équipe',
    icon: UserGroupIcon,
    color: 'from-orange-500 to-red-500',
    duration: '25 min',
    difficulty: 'Intermédiaire',
    steps: [
      {
        title: 'Inviter des collaborateurs',
        content: 'Invitez des membres de votre équipe à rejoindre vos projets via email ou lien de partage.',
        tips: ['Utilisez les emails professionnels', 'Définissez les rôles', 'Envoyez des invitations groupées']
      },
      {
        title: 'Gestion des permissions',
        content: 'Attribuez les bons rôles : Propriétaire, Éditeur, ou Lecteur selon les besoins.',
        tips: ['Propriétaire : contrôle total', 'Éditeur : modification', 'Lecteur : consultation']
      },
      {
        title: 'Communication',
        content: 'Utilisez les commentaires et le chat intégré pour communiquer avec votre équipe.',
        tips: ['Commentez les tâches', 'Utilisez le chat', 'Mentionnez les utilisateurs']
      }
    ]
  },
  {
    id: 'sharing',
    title: 'Partage et liens',
    description: 'Partagez vos projets avec des liens sécurisés',
    icon: ShareIcon,
    color: 'from-indigo-500 to-blue-500',
    duration: '12 min',
    difficulty: 'Débutant',
    steps: [
      {
        title: 'Créer un lien de partage',
        content: 'Générez des liens de partage pour permettre l\'accès à vos projets sans création de compte.',
        tips: ['Choisissez le type d\'accès', 'Définissez une expiration', 'Copiez le lien']
      },
      {
        title: 'Contrôler l\'accès',
        content: 'Gérez qui peut voir et modifier vos projets via les paramètres de partage.',
        tips: ['Limitez les permissions', 'Surveillez l\'utilisation', 'Révoquez si nécessaire']
      },
      {
        title: 'Partage public',
        content: 'Rendez certains projets publics pour une visibilité maximale.',
        tips: ['Sélectionnez soigneusement', 'Vérifiez le contenu', 'Mettez à jour régulièrement']
      }
    ]
  },
  {
    id: 'notifications',
    title: 'Notifications',
    description: 'Restez informé des activités importantes',
    icon: BellIcon,
    color: 'from-yellow-500 to-orange-500',
    duration: '8 min',
    difficulty: 'Débutant',
    steps: [
      {
        title: 'Configurer les notifications',
        content: 'Personnalisez vos préférences de notification pour recevoir les informations importantes.',
        tips: ['Choisissez les types', 'Définissez la fréquence', 'Configurez les canaux']
      },
      {
        title: 'Notifications par email',
        content: 'Activez les notifications par email pour ne rien manquer même hors ligne.',
        tips: ['Vérifiez votre email', 'Configurez les filtres', 'Évitez le spam']
      },
      {
        title: 'Notifications en temps réel',
        content: 'Utilisez les notifications push pour être alerté instantanément.',
        tips: ['Autorisez les notifications', 'Personnalisez les sons', 'Gérez les priorités']
      }
    ]
  },
  {
    id: 'integrations',
    title: 'Intégrations',
    description: 'Connectez WorkWave à vos outils préférés',
    icon: LinkIcon,
    color: 'from-teal-500 to-green-500',
    duration: '30 min',
    difficulty: 'Avancé',
    steps: [
      {
        title: 'API et clés',
        content: 'Générez des clés API pour connecter WorkWave à d\'autres applications.',
        tips: ['Gardez les clés secrètes', 'Définissez les permissions', 'Surveillez l\'usage']
      },
      {
        title: 'Webhooks',
        content: 'Configurez des webhooks pour recevoir des notifications en temps réel.',
        tips: ['Testez les endpoints', 'Sécurisez les URLs', 'Gérez les erreurs']
      },
      {
        title: 'Intégrations tierces',
        content: 'Connectez Slack, Discord et autres outils de communication.',
        tips: ['Suivez les guides', 'Testez les connexions', 'Configurez les canaux']
      }
    ]
  },
  {
    id: 'advanced',
    title: 'Fonctionnalités avancées',
    description: 'Exploitez tout le potentiel de WorkWave',
    icon: CogIcon,
    color: 'from-rose-500 to-pink-500',
    duration: '45 min',
    difficulty: 'Avancé',
    steps: [
      {
        title: 'Automatisations',
        content: 'Créez des règles automatiques pour optimiser votre workflow.',
        tips: ['Identifiez les tâches répétitives', 'Configurez les déclencheurs', 'Testez les règles']
      },
      {
        title: 'Rapports et analytics',
        content: 'Analysez vos performances avec des rapports détaillés.',
        tips: ['Consultez régulièrement', 'Identifiez les tendances', 'Optimisez les processus']
      },
      {
        title: 'Personnalisation',
        content: 'Adaptez WorkWave à vos besoins spécifiques.',
        tips: ['Customisez l\'interface', 'Créez des modèles', 'Configurez les raccourcis']
      }
    ]
  }
]

const TutorialCard = ({ tutorial, isOpen, onToggle }) => {
  const Icon = tutorial.icon
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300 hover:shadow-xl">
      <div 
        className="p-6 cursor-pointer"
        onClick={onToggle}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <div className={`p-3 rounded-lg bg-gradient-to-r ${tutorial.color} text-white shadow-lg`}>
              <Icon className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {tutorial.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {tutorial.description}
              </p>
              <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-1">
                  <BookOpenIcon className="w-4 h-4" />
                  <span>{tutorial.duration}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <StarIcon className="w-4 h-4" />
                  <span>{tutorial.difficulty}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex-shrink-0 ml-4">
            {isOpen ? (
              <ChevronDownIcon className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronRightIcon className="w-5 h-5 text-gray-400" />
            )}
          </div>
        </div>
      </div>
      
      {isOpen && (
        <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <div className="p-6 space-y-6">
            {tutorial.steps.map((step, index) => (
              <div key={index} className="flex space-x-4">
                <div className="flex-shrink-0">
                  <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${tutorial.color} text-white flex items-center justify-center text-sm font-medium`}>
                    {index + 1}
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    {step.title}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 mb-3">
                    {step.content}
                  </p>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                    <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                      💡 Conseils :
                    </h5>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      {step.tips.map((tip, tipIndex) => (
                        <li key={tipIndex} className="flex items-start space-x-2">
                          <CheckCircleIcon className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function Tutorials() {
  const [openTutorials, setOpenTutorials] = useState(new Set(['getting-started']))

  const toggleTutorial = (tutorialId) => {
    const newOpenTutorials = new Set(openTutorials)
    if (newOpenTutorials.has(tutorialId)) {
      newOpenTutorials.delete(tutorialId)
    } else {
      newOpenTutorials.add(tutorialId)
    }
    setOpenTutorials(newOpenTutorials)
  }

  const openAll = () => {
    setOpenTutorials(new Set(tutorials.map(t => t.id)))
  }

  const closeAll = () => {
    setOpenTutorials(new Set())
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl text-white shadow-lg">
                <BookOpenIcon className="w-12 h-12" />
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Tutoriels WorkWave
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-8">
              Apprenez à utiliser WorkWave grâce à nos tutoriels pas à pas. 
              Du débutant à l'expert, découvrez toutes les fonctionnalités.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={openAll}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Tout ouvrir
              </button>
              <button
                onClick={closeAll}
                className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200"
              >
                Tout fermer
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">{tutorials.length}</div>
            <div className="text-gray-600 dark:text-gray-400">Tutoriels disponibles</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">3h</div>
            <div className="text-gray-600 dark:text-gray-400">Temps total d'apprentissage</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">All</div>
            <div className="text-gray-600 dark:text-gray-400">Niveaux couverts</div>
          </div>
        </div>

        {/* Tutorials */}
        <div className="space-y-6">
          {tutorials.map((tutorial) => (
            <TutorialCard
              key={tutorial.id}
              tutorial={tutorial}
              isOpen={openTutorials.has(tutorial.id)}
              onToggle={() => toggleTutorial(tutorial.id)}
            />
          ))}
        </div>

        {/* Help Section */}
        <div className="mt-16 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Besoin d'aide supplémentaire ?
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Notre équipe de support est là pour vous aider à tirer le meilleur parti de WorkWave.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contact"
                className="inline-flex items-center px-6 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Contacter le support
                <ArrowRightIcon className="w-4 h-4 ml-2" />
              </a>
              <a
                href="/help"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Centre d'aide
                <ArrowRightIcon className="w-4 h-4 ml-2" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 