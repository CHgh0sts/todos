'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function PrivacyPage() {
  const [activeSection, setActiveSection] = useState(null)
  
  const lastUpdated = "26 mai 2024"
  
  const sections = [
    { id: 'introduction', title: '1. Introduction', icon: '🛡️' },
    { id: 'controller', title: '2. Responsable du traitement', icon: '🏢' },
    { id: 'data-collected', title: '3. Données collectées', icon: '📊' },
    { id: 'purposes', title: '4. Finalités du traitement', icon: '🎯' },
    { id: 'legal-basis', title: '5. Base légale', icon: '⚖️' },
    { id: 'sharing', title: '6. Partage des données', icon: '🤝' },
    { id: 'retention', title: '7. Conservation des données', icon: '🗄️' },
    { id: 'security', title: '8. Sécurité des données', icon: '🔒' },
    { id: 'rights', title: '9. Vos droits RGPD', icon: '👤' },
    { id: 'cookies', title: '10. Cookies et technologies', icon: '🍪' },
    { id: 'transfers', title: '11. Transferts internationaux', icon: '🌍' },
    { id: 'minors', title: '12. Données des mineurs', icon: '👶' },
    { id: 'changes', title: '13. Modifications', icon: '📝' },
    { id: 'contact', title: '14. Contact et DPO', icon: '📧' }
  ]

  return (
    <div className="fixed inset-0 top-16 overflow-y-auto">
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full mb-6">
              <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Politique de Confidentialité
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-2">
              CollabWave - Protection de vos données personnelles
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
                          ? 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400'
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
                
                {/* Section 1: Introduction */}
                <section id="introduction" className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                    <span className="mr-3">🛡️</span>
                    1. Introduction
                  </h2>
                  <div className="prose prose-gray dark:prose-invert max-w-none">
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      Chez CollabWave, nous nous engageons à protéger et respecter votre vie privée. Cette politique de confidentialité explique comment nous collectons, utilisons, stockons et protégeons vos données personnelles lorsque vous utilisez notre plateforme de gestion de projets collaboratifs.
                    </p>
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
                      <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">Conformité RGPD</h4>
                      <p className="text-green-700 dark:text-green-300 text-sm">
                        Cette politique est conforme au Règlement Général sur la Protection des Données (RGPD) et aux lois françaises sur la protection des données.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Section 2: Responsable du traitement */}
                <section id="controller" className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                    <span className="mr-3">🏢</span>
                    2. Responsable du traitement
                  </h2>
                  <div className="prose prose-gray dark:prose-invert max-w-none">
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-6">
                      <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">CollabWave SAS</h4>
                      <div className="text-blue-700 dark:text-blue-300 space-y-1">
                        <p><strong>Adresse :</strong> 123 Avenue de l'Innovation, 75001 Paris, France</p>
                        <p><strong>SIRET :</strong> 123 456 789 00012</p>
                        <p><strong>Email :</strong> privacy@collabwave.com</p>
                        <p><strong>DPO :</strong> dpo@collabwave.com</p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Section 3: Données collectées */}
                <section id="data-collected" className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                    <span className="mr-3">📊</span>
                    3. Données collectées
                  </h2>
                  <div className="prose prose-gray dark:prose-invert max-w-none">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">3.1 Données d'identification</h3>
                    <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1 mb-4">
                      <li>Nom et prénom</li>
                      <li>Adresse email</li>
                      <li>Photo de profil (optionnelle)</li>
                      <li>Informations de compte (nom d'utilisateur, mot de passe chiffré)</li>
                    </ul>

                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">3.2 Données d'utilisation</h3>
                    <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1 mb-4">
                      <li>Projets créés et gérés</li>
                      <li>Tâches et commentaires</li>
                      <li>Fichiers partagés</li>
                      <li>Historique d'activité</li>
                      <li>Préférences utilisateur</li>
                    </ul>

                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">3.3 Données techniques</h3>
                    <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1 mb-4">
                      <li>Adresse IP</li>
                      <li>Type de navigateur et version</li>
                      <li>Système d'exploitation</li>
                      <li>Pages visitées et temps passé</li>
                      <li>Cookies et identifiants de session</li>
                    </ul>

                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">3.4 Données de facturation</h3>
                    <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1">
                      <li>Informations de paiement (via processeurs tiers sécurisés)</li>
                      <li>Historique des transactions</li>
                      <li>Adresse de facturation</li>
                    </ul>
                  </div>
                </section>

                {/* Section 4: Finalités du traitement */}
                <section id="purposes" className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                    <span className="mr-3">🎯</span>
                    4. Finalités du traitement
                  </h2>
                  <div className="prose prose-gray dark:prose-invert max-w-none">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">🔧 Fourniture du service</h4>
                        <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                          <li>Création et gestion de compte</li>
                          <li>Fonctionnalités collaboratives</li>
                          <li>Synchronisation des données</li>
                          <li>Support technique</li>
                        </ul>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">💳 Gestion commerciale</h4>
                        <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                          <li>Traitement des paiements</li>
                          <li>Facturation</li>
                          <li>Gestion des abonnements</li>
                          <li>Prévention de la fraude</li>
                        </ul>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">📈 Amélioration du service</h4>
                        <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                          <li>Analyses d'usage anonymisées</li>
                          <li>Développement de nouvelles fonctionnalités</li>
                          <li>Optimisation des performances</li>
                          <li>Tests A/B</li>
                        </ul>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">📧 Communication</h4>
                        <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                          <li>Notifications de service</li>
                          <li>Mises à jour importantes</li>
                          <li>Support client</li>
                          <li>Newsletter (avec consentement)</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Section 5: Base légale */}
                <section id="legal-basis" className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                    <span className="mr-3">⚖️</span>
                    5. Base légale du traitement
                  </h2>
                  <div className="prose prose-gray dark:prose-invert max-w-none">
                    <div className="space-y-4">
                      <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">📋 Exécution du contrat</h4>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">
                          Traitement nécessaire à l'exécution de nos conditions d'utilisation et à la fourniture du service.
                        </p>
                      </div>
                      <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">✅ Consentement</h4>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">
                          Pour les cookies non essentiels, la newsletter et certaines fonctionnalités optionnelles.
                        </p>
                      </div>
                      <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">🏢 Intérêt légitime</h4>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">
                          Amélioration du service, sécurité, prévention de la fraude et analyses statistiques.
                        </p>
                      </div>
                      <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">⚖️ Obligation légale</h4>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">
                          Conservation des données de facturation et respect des obligations comptables et fiscales.
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Section 6: Partage des données */}
                <section id="sharing" className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                    <span className="mr-3">🤝</span>
                    6. Partage des données
                  </h2>
                  <div className="prose prose-gray dark:prose-invert max-w-none">
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      Nous ne vendons jamais vos données personnelles. Nous pouvons partager vos données uniquement dans les cas suivants :
                    </p>
                    
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">6.1 Prestataires de services</h3>
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 mb-4">
                      <ul className="text-yellow-800 dark:text-yellow-200 text-sm space-y-1">
                        <li><strong>Hébergement :</strong> Serveurs sécurisés en Europe</li>
                        <li><strong>Paiements :</strong> Stripe (conforme PCI DSS)</li>
                        <li><strong>Email :</strong> Services de messagerie transactionnelle</li>
                        <li><strong>Analytics :</strong> Données anonymisées uniquement</li>
                      </ul>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">6.2 Collaboration</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      Dans le cadre des projets collaboratifs, certaines données sont partagées avec les membres de votre équipe selon les permissions que vous définissez.
                    </p>

                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">6.3 Obligations légales</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Nous pouvons divulguer vos données si requis par la loi, une décision de justice ou pour protéger nos droits légitimes.
                    </p>
                  </div>
                </section>

                {/* Section 7: Conservation des données */}
                <section id="retention" className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                    <span className="mr-3">🗄️</span>
                    7. Conservation des données
                  </h2>
                  <div className="prose prose-gray dark:prose-invert max-w-none">
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-gray-300 dark:border-gray-600">
                        <thead>
                          <tr className="bg-gray-50 dark:bg-gray-700">
                            <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left text-gray-900 dark:text-white">Type de données</th>
                            <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left text-gray-900 dark:text-white">Durée de conservation</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-600 dark:text-gray-300">Données de compte actif</td>
                            <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-600 dark:text-gray-300">Durée de l'abonnement + 1 an</td>
                          </tr>
                          <tr>
                            <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-600 dark:text-gray-300">Données de facturation</td>
                            <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-600 dark:text-gray-300">10 ans (obligation légale)</td>
                          </tr>
                          <tr>
                            <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-600 dark:text-gray-300">Logs de sécurité</td>
                            <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-600 dark:text-gray-300">1 an</td>
                          </tr>
                          <tr>
                            <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-600 dark:text-gray-300">Données marketing</td>
                            <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-600 dark:text-gray-300">3 ans ou jusqu'au retrait du consentement</td>
                          </tr>
                          <tr>
                            <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-600 dark:text-gray-300">Cookies</td>
                            <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-600 dark:text-gray-300">13 mois maximum</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </section>

                {/* Section 8: Sécurité des données */}
                <section id="security" className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                    <span className="mr-3">🔒</span>
                    8. Sécurité des données
                  </h2>
                  <div className="prose prose-gray dark:prose-invert max-w-none">
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données :
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">🔐 Chiffrement</h4>
                        <ul className="text-blue-700 dark:text-blue-300 text-sm space-y-1">
                          <li>HTTPS/TLS 1.3 en transit</li>
                          <li>AES-256 au repos</li>
                          <li>Mots de passe hachés (bcrypt)</li>
                        </ul>
                      </div>
                      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
                        <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">🛡️ Accès</h4>
                        <ul className="text-green-700 dark:text-green-300 text-sm space-y-1">
                          <li>Authentification à deux facteurs</li>
                          <li>Contrôle d'accès basé sur les rôles</li>
                          <li>Audit des accès</li>
                        </ul>
                      </div>
                      <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg p-4">
                        <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">🏗️ Infrastructure</h4>
                        <ul className="text-purple-700 dark:text-purple-300 text-sm space-y-1">
                          <li>Serveurs sécurisés (ISO 27001)</li>
                          <li>Sauvegardes chiffrées</li>
                          <li>Monitoring 24/7</li>
                        </ul>
                      </div>
                      <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-lg p-4">
                        <h4 className="font-semibold text-orange-900 dark:text-orange-100 mb-2">👥 Équipe</h4>
                        <ul className="text-orange-700 dark:text-orange-300 text-sm space-y-1">
                          <li>Formation sécurité régulière</li>
                          <li>Accès au strict nécessaire</li>
                          <li>Clauses de confidentialité</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Section 9: Vos droits RGPD */}
                <section id="rights" className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                    <span className="mr-3">👤</span>
                    9. Vos droits RGPD
                  </h2>
                  <div className="prose prose-gray dark:prose-invert max-w-none">
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      Conformément au RGPD, vous disposez des droits suivants :
                    </p>
                    
                    <div className="space-y-4">
                      <div className="border-l-4 border-blue-500 pl-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white">🔍 Droit d'accès</h4>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">Obtenir une copie de vos données personnelles et des informations sur leur traitement.</p>
                      </div>
                      <div className="border-l-4 border-green-500 pl-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white">✏️ Droit de rectification</h4>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">Corriger ou mettre à jour vos données personnelles inexactes ou incomplètes.</p>
                      </div>
                      <div className="border-l-4 border-red-500 pl-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white">🗑️ Droit à l'effacement</h4>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">Demander la suppression de vos données dans certaines conditions.</p>
                      </div>
                      <div className="border-l-4 border-yellow-500 pl-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white">⏸️ Droit à la limitation</h4>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">Limiter le traitement de vos données dans certaines circonstances.</p>
                      </div>
                      <div className="border-l-4 border-purple-500 pl-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white">📦 Droit à la portabilité</h4>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">Récupérer vos données dans un format structuré et lisible par machine.</p>
                      </div>
                      <div className="border-l-4 border-orange-500 pl-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white">🚫 Droit d'opposition</h4>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">Vous opposer au traitement de vos données pour des raisons légitimes.</p>
                      </div>
                    </div>

                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4 mt-6">
                      <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">Comment exercer vos droits ?</h4>
                      <p className="text-green-700 dark:text-green-300 text-sm mb-2">
                        Contactez-nous à <strong>privacy@collabwave.com</strong> ou via votre espace personnel.
                      </p>
                      <p className="text-green-700 dark:text-green-300 text-sm">
                        Nous répondrons dans un délai maximum de 30 jours.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Section 10: Cookies */}
                <section id="cookies" className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                    <span className="mr-3">🍪</span>
                    10. Cookies et technologies similaires
                  </h2>
                  <div className="prose prose-gray dark:prose-invert max-w-none">
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      Nous utilisons des cookies pour améliorer votre expérience. Pour plus de détails, consultez notre <Link href="/cookies" className="text-blue-600 dark:text-blue-400 hover:underline">Politique des Cookies</Link>.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">🔧 Essentiels</h4>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">Nécessaires au fonctionnement du site (session, sécurité)</p>
                      </div>
                      <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">📊 Analytiques</h4>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">Mesure d'audience anonymisée (avec consentement)</p>
                      </div>
                      <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">🎯 Préférences</h4>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">Mémorisation de vos choix (thème, langue)</p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Section 11: Transferts internationaux */}
                <section id="transfers" className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                    <span className="mr-3">🌍</span>
                    11. Transferts internationaux
                  </h2>
                  <div className="prose prose-gray dark:prose-invert max-w-none">
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      Vos données sont principalement traitées au sein de l'Union Européenne. Tout transfert vers des pays tiers est encadré par :
                    </p>
                    <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2">
                      <li>Décisions d'adéquation de la Commission européenne</li>
                      <li>Clauses contractuelles types (CCT)</li>
                      <li>Certifications appropriées (Privacy Shield successors)</li>
                      <li>Garanties de sécurité renforcées</li>
                    </ul>
                  </div>
                </section>

                {/* Section 12: Données des mineurs */}
                <section id="minors" className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                    <span className="mr-3">👶</span>
                    12. Protection des mineurs
                  </h2>
                  <div className="prose prose-gray dark:prose-invert max-w-none">
                    <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-lg p-4">
                      <p className="text-orange-800 dark:text-orange-200 mb-2">
                        <strong>Âge minimum :</strong> 16 ans
                      </p>
                      <p className="text-orange-700 dark:text-orange-300 text-sm">
                        Notre service n'est pas destiné aux enfants de moins de 16 ans. Si vous avez moins de 18 ans, l'autorisation parentale est requise. Nous supprimons immédiatement toute donnée d'enfant de moins de 16 ans portée à notre connaissance.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Section 13: Modifications */}
                <section id="changes" className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                    <span className="mr-3">📝</span>
                    13. Modifications de cette politique
                  </h2>
                  <div className="prose prose-gray dark:prose-invert max-w-none">
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      Nous pouvons mettre à jour cette politique de confidentialité pour refléter les changements dans nos pratiques ou pour des raisons légales.
                    </p>
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Notification des changements</h4>
                      <ul className="text-blue-700 dark:text-blue-300 text-sm space-y-1">
                        <li>Email pour les modifications importantes</li>
                        <li>Notification dans l'application</li>
                        <li>Publication sur cette page avec la nouvelle date</li>
                        <li>Période de préavis de 30 jours minimum</li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* Section 14: Contact et DPO */}
                <section id="contact" className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                    <span className="mr-3">📧</span>
                    14. Contact et Délégué à la Protection des Données
                  </h2>
                  <div className="prose prose-gray dark:prose-invert max-w-none">
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                      Pour toute question concernant cette politique de confidentialité ou l'exercice de vos droits :
                    </p>
                    
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">📧 Contact principal</h4>
                          <p className="text-green-700 dark:text-green-300 text-sm">privacy@collabwave.com</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">🛡️ Délégué à la Protection des Données</h4>
                          <p className="text-green-700 dark:text-green-300 text-sm">dpo@collabwave.com</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">📮 Adresse postale</h4>
                          <p className="text-green-700 dark:text-green-300 text-sm">
                            CollabWave SAS - Service Confidentialité<br />
                            123 Avenue de l'Innovation<br />
                            75001 Paris, France
                          </p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">⚖️ Autorité de contrôle</h4>
                          <p className="text-green-700 dark:text-green-300 text-sm">
                            CNIL (Commission Nationale de l'Informatique et des Libertés)<br />
                            <a href="https://www.cnil.fr" className="text-green-600 dark:text-green-400 hover:underline">www.cnil.fr</a>
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 mt-4">
                      <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">⏱️ Délais de réponse</h4>
                      <ul className="text-yellow-700 dark:text-yellow-300 text-sm space-y-1">
                        <li>Demandes d'exercice de droits : 30 jours maximum</li>
                        <li>Questions générales : 72 heures</li>
                        <li>Incidents de sécurité : 24 heures</li>
                      </ul>
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
                Cette politique de confidentialité est effective à partir du {lastUpdated}.
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-sm">
                <Link href="/terms" className="text-blue-600 dark:text-blue-400 hover:underline">
                  Conditions d'utilisation
                </Link>
                <span className="text-gray-400">•</span>
                <Link href="/cookies" className="text-blue-600 dark:text-blue-400 hover:underline">
                  Politique des cookies
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