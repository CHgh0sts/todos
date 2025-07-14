'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Shield, Lock, Eye, Users, AlertTriangle, CheckCircle, FileText, Monitor, Server, Key, Globe, UserCheck } from 'lucide-react'

export default function Security() {
  const [activeTab, setActiveTab] = useState('overview')

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: Shield },
    { id: 'technical', label: 'Sécurité technique', icon: Lock },
    { id: 'data', label: 'Protection des données', icon: Eye },
    { id: 'access', label: 'Gestion des accès', icon: Users },
    { id: 'compliance', label: 'Conformité', icon: FileText },
    { id: 'monitoring', label: 'Surveillance', icon: Monitor },
    { id: 'reporting', label: 'Signalement', icon: AlertTriangle }
  ]

  const securityFeatures = [
    {
      icon: Lock,
      title: 'Chiffrement bout-en-bout',
      description: 'Toutes les données sont chiffrées en transit avec TLS 1.3 et au repos avec AES-256'
    },
    {
      icon: Key,
      title: 'Authentification forte',
      description: 'JWT sécurisé, sessions gérées, authentification à deux facteurs disponible'
    },
    {
      icon: Server,
      title: 'Infrastructure sécurisée',
      description: 'Serveurs hébergés dans des centres de données certifiés, pare-feu avancé'
    },
    {
      icon: Users,
      title: 'Permissions granulaires',
      description: 'Contrôle d\'accès basé sur les rôles, permissions par projet'
    },
    {
      icon: Monitor,
      title: 'Surveillance 24/7',
      description: 'Monitoring en temps réel, détection d\'intrusions, alertes automatiques'
    },
    {
      icon: Globe,
      title: 'Conformité RGPD',
      description: 'Respect total du RGPD, droit à l\'oubli, portabilité des données'
    }
  ]

  const certifications = [
    { name: 'ISO 27001', status: 'Certifié', description: 'Gestion de la sécurité de l\'information' },
    { name: 'SOC 2 Type II', status: 'Certifié', description: 'Contrôles de sécurité et disponibilité' },
    { name: 'RGPD', status: 'Conforme', description: 'Règlement général sur la protection des données' },
    { name: 'OWASP Top 10', status: 'Protégé', description: 'Protection contre les vulnérabilités web' }
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {securityFeatures.map((feature, index) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
                  <feature.icon className="w-8 h-8 text-blue-600 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
                </div>
              ))}
            </div>
            
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Certifications et Conformité
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {certifications.map((cert, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <div>
                      <span className="font-medium text-gray-900 dark:text-white">{cert.name}</span>
                      <span className="ml-2 text-sm text-green-600 dark:text-green-400">({cert.status})</span>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{cert.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case 'technical':
        return (
          <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Chiffrement et Sécurité des Communications
              </h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li>• <strong>TLS 1.3</strong> pour toutes les communications HTTPS</li>
                <li>• <strong>AES-256</strong> pour le chiffrement des données au repos</li>
                <li>• <strong>HSTS</strong> (HTTP Strict Transport Security) activé</li>
                <li>• <strong>Certificate Pinning</strong> pour prévenir les attaques MITM</li>
                <li>• <strong>Perfect Forward Secrecy</strong> pour protéger les communications passées</li>
              </ul>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Sécurité de l'Infrastructure
              </h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li>• Serveurs hébergés dans des centres de données <strong>Tier 3+</strong></li>
                <li>• <strong>Pare-feu</strong> multicouche avec filtrage DPI</li>
                <li>• <strong>DDoS Protection</strong> avec mitigation automatique</li>
                <li>• <strong>Intrusion Detection System</strong> (IDS/IPS)</li>
                <li>• <strong>Sauvegarde chiffrée</strong> quotidienne avec réplication géographique</li>
              </ul>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Sécurité des Applications
              </h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li>• <strong>OWASP Top 10</strong> - Protection contre toutes les vulnérabilités</li>
                <li>• <strong>Input Validation</strong> - Validation stricte de tous les inputs</li>
                <li>• <strong>SQL Injection</strong> - Requêtes préparées et ORM sécurisé</li>
                <li>• <strong>XSS Protection</strong> - Sanitisation et CSP headers</li>
                <li>• <strong>CSRF Protection</strong> - Tokens anti-CSRF sur toutes les actions</li>
              </ul>
            </div>
          </div>
        )

      case 'data':
        return (
          <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Collecte et Stockage des Données
              </h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li>• <strong>Minimisation</strong> - Nous collectons uniquement les données nécessaires</li>
                <li>• <strong>Chiffrement</strong> - Toutes les données sont chiffrées AES-256</li>
                <li>• <strong>Pseudonymisation</strong> - Les données personnelles sont pseudonymisées</li>
                <li>• <strong>Rétention</strong> - Suppression automatique après expiration</li>
                <li>• <strong>Géolocalisation</strong> - Données stockées dans l'UE uniquement</li>
              </ul>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Droits des Utilisateurs (RGPD)
              </h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li>• <strong>Droit d'accès</strong> - Consultation de vos données via votre profil</li>
                <li>• <strong>Droit de rectification</strong> - Modification de vos informations</li>
                <li>• <strong>Droit à l'effacement</strong> - Suppression de compte et données</li>
                <li>• <strong>Droit à la portabilité</strong> - Export de vos données</li>
                <li>• <strong>Droit d'opposition</strong> - Refus du traitement</li>
              </ul>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Contrôle de vos Données
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Vous avez un contrôle total sur vos données. Vous pouvez :
              </p>
              <div className="space-y-2">
                <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                  Exporter mes données
                </button>
                <button className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors ml-2">
                  Gérer mes préférences
                </button>
              </div>
            </div>
          </div>
        )

      case 'access':
        return (
          <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Authentification et Sessions
              </h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li>• <strong>JWT sécurisé</strong> - Tokens signés avec clé secrète forte</li>
                <li>• <strong>Session timeout</strong> - Expiration automatique après inactivité</li>
                <li>• <strong>Multi-device</strong> - Gestion des sessions sur plusieurs appareils</li>
                <li>• <strong>2FA disponible</strong> - Authentification à deux facteurs</li>
                <li>• <strong>Passwords policy</strong> - Mots de passe forts obligatoires</li>
              </ul>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Permissions et Rôles
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Rôles Utilisateur</h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                    <li>• <strong>Propriétaire</strong> - Tous les droits</li>
                    <li>• <strong>Administrateur</strong> - Gestion complète</li>
                    <li>• <strong>Éditeur</strong> - Création/modification</li>
                    <li>• <strong>Lecteur</strong> - Consultation uniquement</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Permissions Granulaires</h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                    <li>• Gestion des projets</li>
                    <li>• Création/modification de tâches</li>
                    <li>• Invitation d'utilisateurs</li>
                    <li>• Accès aux rapports</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Accès API et Intégrations
              </h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li>• <strong>API Keys</strong> - Clés d'API avec permissions limitées</li>
                <li>• <strong>Rate limiting</strong> - Limitation des requêtes par utilisateur</li>
                <li>• <strong>IP Whitelisting</strong> - Restriction par adresse IP</li>
                <li>• <strong>Webhooks sécurisés</strong> - Signatures HMAC-SHA256</li>
                <li>• <strong>OAuth 2.0</strong> - Authentification tierce sécurisée</li>
              </ul>
            </div>
          </div>
        )

      case 'compliance':
        return (
          <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Conformité RGPD
              </h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li>• <strong>DPO désigné</strong> - Délégué à la protection des données</li>
                <li>• <strong>Registre des traitements</strong> - Documentation complète</li>
                <li>• <strong>Analyse d'impact</strong> - AIPD pour les traitements à risque</li>
                <li>• <strong>Notification des violations</strong> - Procédure sous 72h</li>
                <li>• <strong>Audits réguliers</strong> - Vérification de la conformité</li>
              </ul>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Standards et Certifications
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {certifications.map((cert, index) => (
                  <div key={index} className="border border-gray-200 dark:border-gray-700 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900 dark:text-white">{cert.name}</h4>
                      <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                        {cert.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{cert.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Audits et Évaluations
              </h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li>• <strong>Audits sécurité</strong> - Tests d'intrusion trimestriels</li>
                <li>• <strong>Code review</strong> - Révision de code par des tiers</li>
                <li>• <strong>Vulnerability scans</strong> - Scans automatisés quotidiens</li>
                <li>• <strong>Compliance checks</strong> - Vérifications mensuelles</li>
                <li>• <strong>Rapports publics</strong> - Transparence sur notre sécurité</li>
              </ul>
            </div>
          </div>
        )

      case 'monitoring':
        return (
          <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Surveillance en Temps Réel
              </h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li>• <strong>SOC 24/7</strong> - Centre de surveillance opérationnel</li>
                <li>• <strong>SIEM</strong> - Corrélation d'événements de sécurité</li>
                <li>• <strong>Alertes automatiques</strong> - Notification immédiate des incidents</li>
                <li>• <strong>Analyse comportementale</strong> - Détection d'anomalies</li>
                <li>• <strong>Forensics</strong> - Capacité d'analyse post-incident</li>
              </ul>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Logs et Audit Trail
              </h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li>• <strong>Logging complet</strong> - Tous les événements sont enregistrés</li>
                <li>• <strong>Immutabilité</strong> - Les logs ne peuvent pas être modifiés</li>
                <li>• <strong>Rétention</strong> - Conservation des logs pendant 2 ans</li>
                <li>• <strong>Chiffrement</strong> - Logs chiffrés et signés</li>
                <li>• <strong>Accès contrôlé</strong> - Consultation sur besoin strict</li>
              </ul>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Métriques de Sécurité
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400">99.9%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Disponibilité</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">&lt;1s</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Temps de réponse</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">0</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Incidents majeurs</div>
                </div>
              </div>
            </div>
          </div>
        )

      case 'reporting':
        return (
          <div className="space-y-6">
            <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Signalement de Vulnérabilités
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Nous encourageons la divulgation responsable des vulnérabilités. Si vous découvrez une faille de sécurité, veuillez nous contacter immédiatement.
              </p>
              <div className="space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <strong>Email de sécurité :</strong> security@collabwave.com
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <strong>Clé PGP :</strong> Disponible sur demande
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <strong>Délai de réponse :</strong> 24h maximum
                </p>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Programme Bug Bounty
              </h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li>• <strong>Récompenses</strong> - Jusqu'à 5 000€ pour les vulnérabilités critiques</li>
                <li>• <strong>Scope</strong> - Toutes nos applications et APIs</li>
                <li>• <strong>Processus</strong> - Évaluation sous 48h</li>
                <li>• <strong>Reconnaissance</strong> - Hall of Fame pour les chercheurs</li>
                <li>• <strong>Confidentialité</strong> - Divulgation coordonnée</li>
              </ul>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Gestion des Incidents
              </h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li>• <strong>Équipe d'urgence</strong> - Disponible 24/7</li>
                <li>• <strong>Procédure de réponse</strong> - Plan d'intervention structuré</li>
                <li>• <strong>Communication</strong> - Notifications utilisateurs transparentes</li>
                <li>• <strong>Post-mortem</strong> - Analyse et amélioration continue</li>
                <li>• <strong>Documentation</strong> - Rapport détaillé de chaque incident</li>
              </ul>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Contact Sécurité
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Urgence Sécurité</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">security@collabwave.com</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">+33 1 XX XX XX XX</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">DPO</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">dpo@collabwave.com</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Protection des données</p>
                  </div>
                </div>
                <button className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition-colors">
                  Signaler une vulnérabilité
                </button>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <Shield className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Sécurité et Confidentialité
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
              La protection de vos données est notre priorité absolue. Découvrez nos mesures de sécurité de niveau entreprise.
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3 py-4 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {renderTabContent()}
      </div>

      {/* Footer CTA */}
      <div className="bg-gray-50 dark:bg-gray-800 py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Des questions sur notre sécurité ?
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Notre équipe sécurité est à votre disposition pour répondre à toutes vos questions.
          </p>
          <div className="space-x-4">
            <button className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors">
              Contacter l'équipe sécurité
            </button>
            <button className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              Consulter nos rapports
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
                <li><Link href="/features" className="text-gray-300 hover:text-purple-500 transition-colors">Fonctionnalités</Link></li>
                <li><Link href="/pricing" className="text-gray-300 hover:text-purple-500 transition-colors">Tarifs</Link></li>
                <li><Link href="/security" className="text-gray-300 hover:text-purple-500 transition-colors">Sécurité</Link></li>
                <li><Link href="/integrations" className="text-gray-300 hover:text-purple-500 transition-colors">Intégrations</Link></li>
                <li><Link href="/api" className="text-gray-300 hover:text-purple-500 transition-colors">API</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-6">Support</h3>
              <ul className="space-y-3">
                <li><Link href="/help" className="text-gray-300 hover:text-purple-500 transition-colors">Centre d'aide</Link></li>
                <li><Link href="/documentation" className="text-gray-300 hover:text-purple-500 transition-colors">Documentation</Link></li>
                <li><Link href="/tutorials" className="text-gray-300 hover:text-purple-500 transition-colors">Tutoriels</Link></li>
                <li><Link href="/contact" className="text-gray-300 hover:text-purple-500 transition-colors">Contact</Link></li>
                <li><Link href="/status" className="text-gray-300 hover:text-purple-500 transition-colors">Statut du service</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-6">Entreprise</h3>
              <ul className="space-y-3">
                <li><Link href="/about" className="text-gray-300 hover:text-purple-500 transition-colors">À propos</Link></li>
                <li><Link href="/blog" className="text-gray-300 hover:text-purple-500 transition-colors">Blog</Link></li>
                <li><Link href="/careers" className="text-gray-300 hover:text-purple-500 transition-colors">Carrières</Link></li>
                <li><Link href="/press" className="text-gray-300 hover:text-purple-500 transition-colors">Presse</Link></li>
                <li><Link href="/partners" className="text-gray-300 hover:text-purple-500 transition-colors">Partenaires</Link></li>
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
                <Link href="/privacy" className="text-gray-400 hover:text-purple-500 transition-colors text-sm">Politique de confidentialité</Link>
                <Link href="/terms" className="text-gray-400 hover:text-purple-500 transition-colors text-sm">Conditions d'utilisation</Link>
                <Link href="/cookies" className="text-gray-400 hover:text-purple-500 transition-colors text-sm">Politique des cookies</Link>
                <Link href="/legal" className="text-gray-400 hover:text-purple-500 transition-colors text-sm">Mentions légales</Link>
                <Link href="/gdpr" className="text-gray-400 hover:text-purple-500 transition-colors text-sm">RGPD</Link>
              </div>
              <div className="text-gray-400 text-sm">© {new Date().getFullYear()} CollabWave. Tous droits réservés.</div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
} 