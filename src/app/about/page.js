'use client'

import Link from 'next/link'
import Image from 'next/image'

export default function About() {
  const teamMembers = [
    {
      name: "Marie Dubois",
      role: "CEO & Co-fondatrice",
      bio: "Experte en productivité avec 15 ans d'expérience dans la tech. Passionnée par l'innovation et la collaboration d'équipe.",
      image: "/icons/icon-192x192.png",
      linkedin: "#",
      twitter: "#"
    },
    {
      name: "Thomas Martin",
      role: "CTO & Co-fondateur",
      bio: "Architecte logiciel senior spécialisé dans les systèmes distribués et l'expérience utilisateur moderne.",
      image: "/icons/icon-192x192.png",
      linkedin: "#",
      twitter: "#"
    },
    {
      name: "Sophie Laurent",
      role: "Head of Product",
      bio: "Designer UX/UI avec une vision centrée utilisateur. Elle façonne l'expérience CollabWave au quotidien.",
      image: "/icons/icon-192x192.png",
      linkedin: "#",
      twitter: "#"
    },
    {
      name: "Alexandre Petit",
      role: "Head of Security",
      bio: "Expert en cybersécurité, il garantit la protection de vos données avec les plus hauts standards de sécurité.",
      image: "/icons/icon-192x192.png",
      linkedin: "#",
      twitter: "#"
    }
  ]

  const values = [
    {
      icon: "🚀",
      title: "Innovation",
      description: "Nous repoussons constamment les limites pour offrir les meilleures solutions collaboratives."
    },
    {
      icon: "🤝",
      title: "Collaboration",
      description: "Nous croyons en la puissance du travail d'équipe et de la communication transparente."
    },
    {
      icon: "🔒",
      title: "Sécurité",
      description: "La protection de vos données est notre priorité absolue avec des standards de sécurité élevés."
    },
    {
      icon: "⚡",
      title: "Performance",
      description: "Nous optimisons chaque aspect de notre plateforme pour une expérience fluide et rapide."
    },
    {
      icon: "🌍",
      title: "Accessibilité",
      description: "Notre plateforme est conçue pour être accessible à tous, partout dans le monde."
    },
    {
      icon: "💡",
      title: "Simplicité",
      description: "Nous privilégions la simplicité d'usage sans compromettre la puissance des fonctionnalités."
    }
  ]

  const milestones = [
    {
      year: "2022",
      title: "Fondation de CollabWave",
      description: "Création de l'entreprise avec une vision claire : révolutionner la collaboration d'équipe."
    },
    {
      year: "2023",
      title: "Lancement de la plateforme",
      description: "Première version publique avec les fonctionnalités de base de gestion de projets."
    },
    {
      year: "2024",
      title: "Chat temps réel",
      description: "Intégration du système de chat en temps réel et des fonctionnalités collaboratives avancées."
    },
    {
      year: "2024",
      title: "10 000+ utilisateurs",
      description: "Franchissement du cap des 10 000 utilisateurs actifs dans plus de 50 pays."
    }
  ]

  return (
    <div className="fixed inset-0 top-16 overflow-y-auto">
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900">
        
        {/* Hero Section */}
        <section className="relative py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                À propos de CollabWave
              </h1>
              <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-4xl mx-auto leading-relaxed">
                Nous révolutionnons la façon dont les équipes collaborent et gèrent leurs projets avec des outils modernes, intuitifs et puissants.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/auth/register" className="inline-flex items-center px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-300 hover:shadow-lg">
                  <span>Rejoindre CollabWave</span>
                  <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
                <Link href="/contact" className="inline-flex items-center px-8 py-4 border-2 border-white text-white rounded-xl font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300">
                  Nous contacter
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
                  Notre Mission
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                  Chez CollabWave, nous croyons que la collaboration efficace est la clé du succès de toute organisation. Notre mission est de fournir aux équipes du monde entier les outils dont elles ont besoin pour travailler ensemble de manière plus intelligente, plus rapide et plus harmonieuse.
                </p>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                  Nous nous engageons à créer une plateforme qui non seulement simplifie la gestion de projets, mais qui inspire également l'innovation et favorise une culture de collaboration authentique.
                </p>
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">10K+</div>
                    <div className="text-gray-600 dark:text-gray-300">Utilisateurs actifs</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">50+</div>
                    <div className="text-gray-600 dark:text-gray-300">Pays</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">99.9%</div>
                    <div className="text-gray-600 dark:text-gray-300">Uptime</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">24/7</div>
                    <div className="text-gray-600 dark:text-gray-300">Support</div>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl p-8 text-white">
                  <h3 className="text-2xl font-bold mb-4">Notre Vision</h3>
                  <p className="text-blue-100 mb-6">
                    Devenir la plateforme de référence mondiale pour la collaboration d'équipe, en permettant à chaque organisation de libérer son plein potentiel créatif et productif.
                  </p>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold">Innovation Continue</div>
                      <div className="text-blue-100 text-sm">Toujours à la pointe de la technologie</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20 bg-white dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
                Nos Valeurs
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Ces valeurs guident chacune de nos décisions et façonnent l'expérience que nous offrons à nos utilisateurs.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {values.map((value, index) => (
                <div key={index} className="group bg-gray-50 dark:bg-gray-700 rounded-xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="text-4xl mb-4">{value.icon}</div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {value.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
                Notre Équipe
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Une équipe passionnée et expérimentée, unie par la vision de transformer la collaboration d'équipe.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {teamMembers.map((member, index) => (
                <div key={index} className="group bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                  <div className="relative h-64 overflow-hidden">
                    <Image
                      src={member.image}
                      alt={member.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="flex space-x-3">
                        <a href={member.linkedin} className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                          </svg>
                        </a>
                        <a href={member.twitter} className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                          </svg>
                        </a>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {member.name}
                    </h3>
                    <p className="text-blue-600 dark:text-blue-400 font-medium mb-3">
                      {member.role}
                    </p>
                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                      {member.bio}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline Section */}
        <section className="py-20 bg-white dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
                Notre Histoire
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Découvrez les étapes clés qui ont marqué l'évolution de CollabWave depuis sa création.
              </p>
            </div>
            <div className="relative">
              <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
              <div className="space-y-12">
                {milestones.map((milestone, index) => (
                  <div key={index} className={`flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                    <div className={`w-1/2 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8 text-left'}`}>
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                          {milestone.year}
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                          {milestone.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300">
                          {milestone.description}
                        </p>
                      </div>
                    </div>
                    <div className="relative z-10">
                      <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full border-4 border-white dark:border-gray-900"></div>
                    </div>
                    <div className="w-1/2"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-white mb-6">
              Rejoignez l'aventure CollabWave
            </h2>
            <p className="text-xl text-blue-100 mb-10">
              Découvrez comment notre plateforme peut transformer la collaboration de votre équipe dès aujourd'hui.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register" className="inline-flex items-center px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-300 hover:shadow-lg">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Commencer gratuitement
              </Link>
              <Link href="/contact" className="inline-flex items-center px-8 py-4 border-2 border-white text-white rounded-xl font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Nous contacter
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white relative">
          {/* Bordure dégradée en haut */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
          
          <div className="max-w-7xl mx-auto px-4 py-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Logo et description */}
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

              {/* Produit */}
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

              {/* Support */}
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

              {/* Entreprise */}
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

            {/* Newsletter */}
            <div className="border-t border-gray-800 mt-12 pt-8">
              <div className="flex flex-col lg:flex-row justify-between items-center">
                <div className="mb-6 lg:mb-0">
                  <h3 className="text-lg font-semibold mb-2">Restez informé</h3>
                  <p className="text-gray-300">Recevez les dernières nouvelles et mises à jour de <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  CollabWave
                </span>.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    placeholder="Votre adresse email"
                    className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                  <button className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium">
                    S'abonner
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom footer */}
            <div className="border-t border-gray-800 mt-8 pt-8">
              <div className="flex flex-col lg:flex-row justify-between items-center">
                <div className="flex flex-wrap justify-center lg:justify-start gap-6 mb-4 lg:mb-0">
                  <Link href="/privacy" className="text-gray-400 hover:text-purple-500 transition-colors text-sm">
                    Politique de confidentialité
                  </Link>
                  <Link href="/terms" className="text-gray-400 hover:text-purple-500 transition-colors text-sm">
                    Conditions d'utilisation
                  </Link>
                  <Link href="/cookies" className="text-gray-400 hover:text-purple-500 transition-colors text-sm">
                    Politique des cookies
                  </Link>
                  <Link href="/legal" className="text-gray-400 hover:text-purple-500 transition-colors text-sm">
                    Mentions légales
                  </Link>
                  <Link href="/gdpr" className="text-gray-400 hover:text-purple-500 transition-colors text-sm">
                    RGPD
                  </Link>
                </div>
                <div className="text-gray-400 text-sm">
                  © {new Date().getFullYear()} CollabWave. Tous droits réservés.
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
} 