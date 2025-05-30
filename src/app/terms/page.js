'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function TermsPage() {
  const [activeSection, setActiveSection] = useState(null)
  
  const lastUpdated = "26 mai 2024"
  
  const sections = [
    { id: 'acceptance', title: '1. Acceptation des conditions', icon: '✅' },
    { id: 'definitions', title: '2. Définitions', icon: '📖' },
    { id: 'service', title: '3. Description du service', icon: '🛠️' },
    { id: 'account', title: '4. Compte utilisateur', icon: '👤' },
    { id: 'usage', title: '5. Utilisation acceptable', icon: '✔️' },
    { id: 'content', title: '6. Contenu utilisateur', icon: '📝' },
    { id: 'privacy', title: '7. Confidentialité et données', icon: '🔒' },
    { id: 'collaboration', title: '8. Fonctionnalités collaboratives', icon: '🤝' },
    { id: 'subscription', title: '9. Abonnements et paiements', icon: '💳' },
    { id: 'intellectual', title: '10. Propriété intellectuelle', icon: '©️' },
    { id: 'limitation', title: '11. Limitation de responsabilité', icon: '⚖️' },
    { id: 'termination', title: '12. Résiliation', icon: '🚪' },
    { id: 'modifications', title: '13. Modifications des conditions', icon: '📋' },
    { id: 'governing', title: '14. Droit applicable', icon: '🏛️' },
    { id: 'contact', title: '15. Contact', icon: '📧' }
  ]

  const toggleSection = (sectionId) => {
    setActiveSection(activeSection === sectionId ? null : sectionId)
  }

  return (
    <div className="fixed inset-0 top-16 overflow-y-auto">
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full mb-6">
              <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Conditions d'Utilisation
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-2">
              CollabWave - Plateforme de Gestion de Projets Collaboratifs
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Dernière mise à jour : {lastUpdated}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* Table des matières */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 sticky top-8">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Table des matières
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
                          ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
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
                
                {/* Section 1: Acceptation des conditions */}
                <section id="acceptance" className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                    <span className="mr-3">✅</span>
                    1. Acceptation des conditions
                  </h2>
                  <div className="prose prose-gray dark:prose-invert max-w-none">
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      En accédant et en utilisant CollabWave (le "Service"), vous acceptez d'être lié par ces Conditions d'Utilisation ("Conditions"). Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre service.
                    </p>
                    <p className="text-gray-600 dark:text-gray-300">
                      Ces conditions constituent un accord légalement contraignant entre vous et CollabWave. Votre utilisation continue du service constitue votre acceptation de toute modification de ces conditions.
                    </p>
                  </div>
                </section>

                {/* Section 2: Définitions */}
                <section id="definitions" className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                    <span className="mr-3">📖</span>
                    2. Définitions
                  </h2>
                  <div className="prose prose-gray dark:prose-invert max-w-none">
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                      <dl className="space-y-4">
                        <div>
                          <dt className="font-semibold text-gray-900 dark:text-white">"Service" ou "CollabWave"</dt>
                          <dd className="text-gray-600 dark:text-gray-300">La plateforme de gestion de projets collaboratifs accessible via notre site web et applications.</dd>
                        </div>
                        <div>
                          <dt className="font-semibold text-gray-900 dark:text-white">"Utilisateur" ou "Vous"</dt>
                          <dd className="text-gray-600 dark:text-gray-300">Toute personne qui accède ou utilise notre service.</dd>
                        </div>
                        <div>
                          <dt className="font-semibold text-gray-900 dark:text-white">"Contenu"</dt>
                          <dd className="text-gray-600 dark:text-gray-300">Toute information, donnée, texte, logiciel, musique, son, photographie, graphique, vidéo, message ou autre matériel.</dd>
                        </div>
                        <div>
                          <dt className="font-semibold text-gray-900 dark:text-white">"Projet"</dt>
                          <dd className="text-gray-600 dark:text-gray-300">Un espace de travail collaboratif contenant des tâches, des fichiers et des membres.</dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                </section>

                {/* Section 3: Description du service */}
                <section id="service" className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                    <span className="mr-3">🛠️</span>
                    3. Description du service
                  </h2>
                  <div className="prose prose-gray dark:prose-invert max-w-none">
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      CollabWave est une plateforme SaaS (Software as a Service) qui permet aux utilisateurs de :
                    </p>
                    <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2 mb-4">
                      <li>Créer et gérer des projets collaboratifs</li>
                      <li>Organiser des tâches et suivre leur progression</li>
                      <li>Collaborer en temps réel avec d'autres utilisateurs</li>
                      <li>Partager des fichiers et des ressources</li>
                      <li>Communiquer via des notifications et commentaires</li>
                      <li>Générer des rapports et analyses de productivité</li>
                    </ul>
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                      <p className="text-blue-800 dark:text-blue-200 text-sm">
                        <strong>Note :</strong> Nous nous réservons le droit de modifier, suspendre ou interrompre tout aspect du service à tout moment, avec ou sans préavis.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Section 4: Compte utilisateur */}
                <section id="account" className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                    <span className="mr-3">👤</span>
                    4. Compte utilisateur
                  </h2>
                  <div className="prose prose-gray dark:prose-invert max-w-none">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">4.1 Création de compte</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      Pour utiliser certaines fonctionnalités du service, vous devez créer un compte. Vous devez fournir des informations exactes, complètes et à jour lors de l'inscription.
                    </p>
                    
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">4.2 Sécurité du compte</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      Vous êtes responsable de :
                    </p>
                    <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1 mb-4">
                      <li>Maintenir la confidentialité de vos identifiants de connexion</li>
                      <li>Toutes les activités qui se produisent sous votre compte</li>
                      <li>Nous notifier immédiatement de toute utilisation non autorisée</li>
                    </ul>

                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">4.3 Âge minimum</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Vous devez avoir au moins 16 ans pour utiliser notre service. Si vous avez moins de 18 ans, vous confirmez avoir l'autorisation de vos parents ou tuteurs légaux.
                    </p>
                  </div>
                </section>

                {/* Section 5: Utilisation acceptable */}
                <section id="usage" className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                    <span className="mr-3">✔️</span>
                    5. Utilisation acceptable
                  </h2>
                  <div className="prose prose-gray dark:prose-invert max-w-none">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">5.1 Utilisations autorisées</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      Vous pouvez utiliser notre service uniquement à des fins légales et conformément à ces conditions.
                    </p>

                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">5.2 Utilisations interdites</h3>
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4 mb-4">
                      <p className="text-red-800 dark:text-red-200 font-semibold mb-2">Il est strictement interdit de :</p>
                      <ul className="list-disc list-inside text-red-700 dark:text-red-300 space-y-1 text-sm">
                        <li>Violer des lois ou réglementations applicables</li>
                        <li>Harceler, menacer ou intimider d'autres utilisateurs</li>
                        <li>Publier du contenu illégal, offensant ou inapproprié</li>
                        <li>Tenter d'accéder non autorisé aux systèmes</li>
                        <li>Distribuer des virus ou codes malveillants</li>
                        <li>Utiliser le service à des fins commerciales non autorisées</li>
                        <li>Créer de faux comptes ou usurper l'identité d'autrui</li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* Section 6: Contenu utilisateur */}
                <section id="content" className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                    <span className="mr-3">📝</span>
                    6. Contenu utilisateur
                  </h2>
                  <div className="prose prose-gray dark:prose-invert max-w-none">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">6.1 Propriété du contenu</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      Vous conservez tous les droits de propriété sur le contenu que vous créez ou téléchargez sur notre service. Cependant, vous nous accordez une licence pour utiliser ce contenu dans le cadre de la fourniture du service.
                    </p>

                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">6.2 Licence accordée</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      En publiant du contenu, vous nous accordez une licence mondiale, non exclusive, libre de redevances pour utiliser, reproduire, modifier, adapter et distribuer votre contenu uniquement dans le cadre de la fourniture du service.
                    </p>

                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">6.3 Responsabilité du contenu</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Vous êtes seul responsable du contenu que vous publiez et garantissez que vous avez tous les droits nécessaires pour le faire.
                    </p>
                  </div>
                </section>

                {/* Section 7: Confidentialité et données */}
                <section id="privacy" className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                    <span className="mr-3">🔒</span>
                    7. Confidentialité et données
                  </h2>
                  <div className="prose prose-gray dark:prose-invert max-w-none">
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      La protection de vos données personnelles est une priorité. Notre traitement de vos informations personnelles est régi par notre <Link href="/privacy" className="text-blue-600 dark:text-blue-400 hover:underline">Politique de Confidentialité</Link>, qui fait partie intégrante de ces conditions.
                    </p>
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
                      <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">Conformité RGPD</h4>
                      <p className="text-green-700 dark:text-green-300 text-sm">
                        Nous respectons le Règlement Général sur la Protection des Données (RGPD) et vous garantissons le contrôle sur vos données personnelles.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Section 8: Fonctionnalités collaboratives */}
                <section id="collaboration" className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                    <span className="mr-3">🤝</span>
                    8. Fonctionnalités collaboratives
                  </h2>
                  <div className="prose prose-gray dark:prose-invert max-w-none">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">8.1 Partage de projets</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      Lorsque vous partagez un projet, vous accordez aux collaborateurs invités l'accès au contenu selon les permissions définies.
                    </p>

                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">8.2 Responsabilité collaborative</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      En tant que propriétaire de projet, vous êtes responsable de :
                    </p>
                    <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1">
                      <li>Gérer les permissions d'accès appropriées</li>
                      <li>Surveiller l'activité des collaborateurs</li>
                      <li>Respecter les droits de propriété intellectuelle</li>
                    </ul>
                  </div>
                </section>

                {/* Section 9: Abonnements et paiements */}
                <section id="subscription" className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                    <span className="mr-3">💳</span>
                    9. Abonnements et paiements
                  </h2>
                  <div className="prose prose-gray dark:prose-invert max-w-none">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">9.1 Plans d'abonnement</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      Nous proposons différents plans d'abonnement avec des fonctionnalités et limites variables. Les détails sont disponibles sur notre <Link href="/pricing" className="text-blue-600 dark:text-blue-400 hover:underline">page de tarification</Link>.
                    </p>

                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">9.2 Facturation</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      Les frais d'abonnement sont facturés à l'avance selon la période choisie. Le renouvellement est automatique sauf annulation.
                    </p>

                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">9.3 Remboursements</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Les remboursements sont traités selon notre politique de remboursement de 30 jours pour les nouveaux abonnements.
                    </p>
                  </div>
                </section>

                {/* Section 10: Propriété intellectuelle */}
                <section id="intellectual" className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                    <span className="mr-3">©️</span>
                    10. Propriété intellectuelle
                  </h2>
                  <div className="prose prose-gray dark:prose-invert max-w-none">
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      Le service CollabWave, incluant son code source, design, logos, et documentation, est protégé par les lois sur la propriété intellectuelle. Tous les droits sont réservés.
                    </p>
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
                      <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                        <strong>Important :</strong> Vous ne pouvez pas copier, modifier, distribuer ou créer des œuvres dérivées de notre service sans autorisation écrite explicite.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Section 11: Limitation de responsabilité */}
                <section id="limitation" className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                    <span className="mr-3">⚖️</span>
                    11. Limitation de responsabilité
                  </h2>
                  <div className="prose prose-gray dark:prose-invert max-w-none">
                    <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Clause de non-responsabilité</h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-4">
                        Le service est fourni "en l'état" sans garantie d'aucune sorte. Nous ne garantissons pas que le service sera ininterrompu, sécurisé ou exempt d'erreurs.
                      </p>
                      <p className="text-gray-600 dark:text-gray-300">
                        Notre responsabilité totale envers vous ne dépassera pas le montant payé pour le service au cours des 12 derniers mois.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Section 12: Résiliation */}
                <section id="termination" className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                    <span className="mr-3">🚪</span>
                    12. Résiliation
                  </h2>
                  <div className="prose prose-gray dark:prose-invert max-w-none">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">12.1 Résiliation par l'utilisateur</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      Vous pouvez résilier votre compte à tout moment via les paramètres de votre compte ou en nous contactant.
                    </p>

                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">12.2 Résiliation par CollabWave</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      Nous pouvons suspendre ou résilier votre compte en cas de violation de ces conditions, avec ou sans préavis.
                    </p>

                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">12.3 Effets de la résiliation</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Après résiliation, votre accès au service cessera et vos données pourront être supprimées selon notre politique de rétention.
                    </p>
                  </div>
                </section>

                {/* Section 13: Modifications des conditions */}
                <section id="modifications" className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                    <span className="mr-3">📋</span>
                    13. Modifications des conditions
                  </h2>
                  <div className="prose prose-gray dark:prose-invert max-w-none">
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      Nous nous réservons le droit de modifier ces conditions à tout moment. Les modifications importantes seront notifiées par email ou via le service.
                    </p>
                    <p className="text-gray-600 dark:text-gray-300">
                      Votre utilisation continue du service après notification constitue votre acceptation des conditions modifiées.
                    </p>
                  </div>
                </section>

                {/* Section 14: Droit applicable */}
                <section id="governing" className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                    <span className="mr-3">🏛️</span>
                    14. Droit applicable
                  </h2>
                  <div className="prose prose-gray dark:prose-invert max-w-none">
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      Ces conditions sont régies par le droit français. Tout litige sera soumis à la compétence exclusive des tribunaux français.
                    </p>
                    <p className="text-gray-600 dark:text-gray-300">
                      Si une disposition de ces conditions est jugée invalide, les autres dispositions restent en vigueur.
                    </p>
                  </div>
                </section>

                {/* Section 15: Contact */}
                <section id="contact" className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                    <span className="mr-3">📧</span>
                    15. Contact
                  </h2>
                  <div className="prose prose-gray dark:prose-invert max-w-none">
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                      Pour toute question concernant ces conditions d'utilisation, vous pouvez nous contacter :
                    </p>
                    
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Email</h4>
                          <p className="text-blue-700 dark:text-blue-300">legal@collabwave.com</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Support</h4>
                          <p className="text-blue-700 dark:text-blue-300">support@collabwave.com</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Adresse</h4>
                          <p className="text-blue-700 dark:text-blue-300">
                            CollabWave SAS<br />
                            123 Avenue de l'Innovation<br />
                            75001 Paris, France
                          </p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Liens utiles</h4>
                          <div className="space-y-1">
                            <Link href="/privacy" className="block text-blue-600 dark:text-blue-400 hover:underline text-sm">
                              Politique de confidentialité
                            </Link>
                            <Link href="/cookies" className="block text-blue-600 dark:text-blue-400 hover:underline text-sm">
                              Politique des cookies
                            </Link>
                            <Link href="/contact" className="block text-blue-600 dark:text-blue-400 hover:underline text-sm">
                              Nous contacter
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

              </div>
            </div>
          </div>

          {/* Footer de la page */}
          <div className="mt-12 text-center">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Ces conditions d'utilisation sont effectives à partir du {lastUpdated}.
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-sm">
                <Link href="/privacy" className="text-blue-600 dark:text-blue-400 hover:underline">
                  Politique de confidentialité
                </Link>
                <span className="text-gray-400">•</span>
                <Link href="/cookies" className="text-blue-600 dark:text-blue-400 hover:underline">
                  Cookies
                </Link>
                <span className="text-gray-400">•</span>
                <Link href="/contact" className="text-blue-600 dark:text-blue-400 hover:underline">
                  Contact
                </Link>
                <span className="text-gray-400">•</span>
                <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline">
                  Retour à l'accueil
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
} 