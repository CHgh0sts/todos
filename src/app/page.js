'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useEffect, useState } from 'react'

export default function Home() {
  const { user, loading } = useAuth()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Ajouter le CSS pour les cartes de la timeline
    const style = document.createElement('style')
    style.textContent = `
      .timeline-card {
        opacity: 0;
        transform: translateY(50px);
        transition: opacity 0.6s ease-out, transform 0.6s ease-out;
      }
      
      .timeline-card.animate {
        opacity: 1;
        transform: translateY(0);
      }
    `
    document.head.appendChild(style)

    // Activer l'animation après un court délai
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 100)

    return () => {
      clearTimeout(timer)
      if (style.parentNode) {
        style.parentNode.removeChild(style)
      }
    }
  }, [])

  // Fonction pour ajouter la classe d'animation
  const cardClass = (index) => {
    return `opacity-0 translate-y-12 animate-[fade-up_1s_ease-out_forwards]`
  }

  if (loading) {
    return (
      <div className="mx-auto">
        <div className="animate-pulse">
          <div className="h-12 bg-gray-300 dark:bg-gray-600 rounded mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 top-16 overflow-y-auto">
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          {/* Background avec formes géométriques animées - Style 21st.dev */}
          <div className="absolute inset-0">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice">
              <defs>
                {/* Gradients pour les formes */}
                <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.08" />
                </linearGradient>
                <linearGradient id="purpleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.08" />
                </linearGradient>
                <linearGradient id="tealGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#0891b2" stopOpacity="0.08" />
                </linearGradient>
                <linearGradient id="pinkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ec4899" stopOpacity="0.12" />
                  <stop offset="100%" stopColor="#be185d" stopOpacity="0.06" />
                </linearGradient>
                <linearGradient id="greenGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.12" />
                  <stop offset="100%" stopColor="#047857" stopOpacity="0.06" />
                </linearGradient>
              </defs>
              
              {/* Très grandes formes principales */}
              <path d="M600,50 Q1400,0 1700,500 Q1600,900 1000,950 Q400,1000 300,600 Q200,200 600,50 Z" 
                    fill="url(#blueGradient)" opacity="0.8">
                <animateTransform attributeName="transform" type="rotate" 
                  values="0 960 500;360 960 500" dur="80s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.8;0.4;0.8" dur="12s" repeatCount="indefinite" />
              </path>
              
              <path d="M100,300 Q800,200 1200,700 Q1000,1100 500,1050 Q0,1000 50,500 Q100,250 100,300 Z" 
                    fill="url(#purpleGradient)" opacity="0.7">
                <animateTransform attributeName="transform" type="rotate" 
                  values="360 650 650;0 650 650" dur="60s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.7;0.3;0.7" dur="10s" repeatCount="indefinite" />
              </path>
              
              <path d="M1000,100 Q1800,200 1900,700 Q1700,1100 1200,1000 Q700,900 800,400 Q900,50 1000,100 Z" 
                    fill="url(#tealGradient)" opacity="0.6">
                <animateTransform attributeName="transform" type="rotate" 
                  values="0 1350 550;-360 1350 550" dur="70s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.6;0.9;0.6" dur="14s" repeatCount="indefinite" />
              </path>
              
              {/* Formes moyennes supplémentaires */}
              <path d="M200,600 Q600,500 900,800 Q700,1100 400,1000 Q100,900 150,700 Q180,550 200,600 Z" 
                    fill="url(#pinkGradient)" opacity="0.5">
                <animateTransform attributeName="transform" type="rotate" 
                  values="0 550 800;360 550 800" dur="45s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.5;0.8;0.5" dur="8s" repeatCount="indefinite" />
              </path>
              
              <path d="M1200,200 Q1600,100 1800,500 Q1700,800 1400,750 Q1100,700 1150,400 Q1180,150 1200,200 Z" 
                    fill="url(#greenGradient)" opacity="0.6">
                <animateTransform attributeName="transform" type="rotate" 
                  values="360 1450 450;0 1450 450" dur="55s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.6;0.3;0.6" dur="9s" repeatCount="indefinite" />
              </path>
              
              {/* Cercles de tailles variées */}
              <circle cx="300" cy="200" r="120" fill="url(#blueGradient)" opacity="0.4">
                <animateTransform attributeName="transform" type="translate" 
                  values="0,0;80,50;0,0" dur="15s" repeatCount="indefinite" />
                <animate attributeName="r" values="120;180;120" dur="12s" repeatCount="indefinite" />
              </circle>
              
              <circle cx="1600" cy="300" r="100" fill="url(#purpleGradient)" opacity="0.5">
                <animateTransform attributeName="transform" type="translate" 
                  values="0,0;-60,80;0,0" dur="18s" repeatCount="indefinite" />
                <animate attributeName="r" values="100;150;100" dur="10s" repeatCount="indefinite" />
              </circle>
              
              <circle cx="1700" cy="800" r="90" fill="url(#tealGradient)" opacity="0.4">
                <animateTransform attributeName="transform" type="translate" 
                  values="0,0;-50,-60;0,0" dur="22s" repeatCount="indefinite" />
                <animate attributeName="r" values="90;140;90" dur="11s" repeatCount="indefinite" />
              </circle>
              
              <circle cx="400" cy="900" r="110" fill="url(#pinkGradient)" opacity="0.3">
                <animateTransform attributeName="transform" type="translate" 
                  values="0,0;70,-40;0,0" dur="16s" repeatCount="indefinite" />
                <animate attributeName="r" values="110;160;110" dur="13s" repeatCount="indefinite" />
              </circle>
              
              <circle cx="1400" cy="150" r="80" fill="url(#greenGradient)" opacity="0.5">
                <animateTransform attributeName="transform" type="translate" 
                  values="0,0;-40,60;0,0" dur="20s" repeatCount="indefinite" />
                <animate attributeName="r" values="80;130;80" dur="9s" repeatCount="indefinite" />
              </circle>
              
              {/* Polygones géométriques plus gros */}
              <polygon points="150,700 250,600 350,700 250,800" fill="url(#blueGradient)" opacity="0.3">
                <animateTransform attributeName="transform" type="rotate" 
                  values="0 250 700;360 250 700" dur="30s" repeatCount="indefinite" />
              </polygon>
              
              <polygon points="1400,100 1550,50 1650,150 1500,200" fill="url(#purpleGradient)" opacity="0.35">
                <animateTransform attributeName="transform" type="rotate" 
                  values="360 1525 125;0 1525 125" dur="35s" repeatCount="indefinite" />
              </polygon>
              
              <polygon points="1500,900 1650,850 1700,950 1550,1000" fill="url(#tealGradient)" opacity="0.4">
                <animateTransform attributeName="transform" type="rotate" 
                  values="0 1600 925;360 1600 925" dur="28s" repeatCount="indefinite" />
              </polygon>
              
              <polygon points="50,400 150,350 200,450 100,500" fill="url(#pinkGradient)" opacity="0.3">
                <animateTransform attributeName="transform" type="rotate" 
                  values="360 125 425;0 125 425" dur="32s" repeatCount="indefinite" />
              </polygon>
              
              {/* Triangles arrondis */}
              <path d="M800,50 Q950,0 1000,150 Q900,250 750,200 Q700,100 800,50 Z" 
                    fill="url(#greenGradient)" opacity="0.4">
                <animateTransform attributeName="transform" type="rotate" 
                  values="0 850 125;360 850 125" dur="40s" repeatCount="indefinite" />
              </path>
              
              <path d="M100,1000 Q250,950 300,1100 Q200,1200 50,1150 Q0,1050 100,1000 Z" 
                    fill="url(#blueGradient)" opacity="0.35">
                <animateTransform attributeName="transform" type="rotate" 
                  values="360 175 1075;0 175 1075" dur="38s" repeatCount="indefinite" />
              </path>
              
              {/* Lignes connectrices plus nombreuses */}
              <path d="M300,200 Q800,100 1400,300" stroke="url(#blueGradient)" strokeWidth="3" fill="none" opacity="0.15">
                <animate attributeName="stroke-dasharray" values="0,1500;1500,0;0,1500" dur="25s" repeatCount="indefinite" />
              </path>
              
              <path d="M500,800 Q1000,600 1600,900" stroke="url(#purpleGradient)" strokeWidth="3" fill="none" opacity="0.15">
                <animate attributeName="stroke-dasharray" values="1500,0;0,1500;1500,0" dur="30s" repeatCount="indefinite" />
              </path>
              
              <path d="M200,500 Q600,300 1200,600" stroke="url(#tealGradient)" strokeWidth="2" fill="none" opacity="0.12">
                <animate attributeName="stroke-dasharray" values="0,1200;1200,0;0,1200" dur="28s" repeatCount="indefinite" />
              </path>
              
              <path d="M1000,200 Q1400,400 1800,700" stroke="url(#pinkGradient)" strokeWidth="2" fill="none" opacity="0.12">
                <animate attributeName="stroke-dasharray" values="1200,0;0,1200;1200,0" dur="33s" repeatCount="indefinite" />
              </path>
            </svg>
        </div>

          {/* Overlay pour améliorer la lisibilité */}
          <div className="absolute inset-0 bg-white/30 dark:bg-gray-900/30"></div>
          
          {/* Effet de particules flottantes */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400 rounded-full opacity-40 animate-pulse"></div>
            <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-purple-400 rounded-full opacity-50 animate-ping" style={{animationDelay: '1s'}}></div>
            <div className="absolute bottom-1/3 left-1/3 w-1.5 h-1.5 bg-teal-400 rounded-full opacity-30 animate-pulse" style={{animationDelay: '2s'}}></div>
            <div className="absolute top-2/3 right-1/3 w-1 h-1 bg-blue-500 rounded-full opacity-40 animate-ping" style={{animationDelay: '3s'}}></div>
            <div className="absolute bottom-1/4 right-1/5 w-2 h-2 bg-purple-500 rounded-full opacity-30 animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>

          <div className="relative mx-auto px-4 sm:py-24 h-[100dvh] flex flex-col items-center justify-center">
      <div className="text-center">
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 dark:text-white mb-6">
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  CollabWave
                </span>
                <br />
                <span className="text-3xl sm:text-4xl lg:text-5xl text-gray-700 dark:text-gray-300">
                  {user ? `Bienvenue ${user.name} !` : 'Collaboratif'}
                </span>
              </h1>
              
              <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 mb-12 mx-auto leading-relaxed">
                {user 
                  ? 'Organisez vos projets, collaborez en temps réel et atteignez vos objectifs avec votre équipe'
                  : 'La plateforme collaborative moderne pour gérer vos projets et tâches en équipe avec des mises à jour en temps réel'
                }
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
        {user ? (
                  <>
            <Link 
                      href="/projects" 
                      className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg font-semibold rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
                      <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
                      Mes Projets
            </Link>
            <Link 
                      href="/friends" 
                      className="inline-flex items-center px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-lg font-semibold rounded-2xl border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
                      <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
                      Mes Amis
            </Link>
                  </>
        ) : (
                  <>
            <Link 
              href="/auth/register" 
                      className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg font-semibold rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
                      <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
                      Commencer Gratuitement
            </Link>
            <Link 
              href="/auth/login" 
                      className="inline-flex items-center px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-lg font-semibold rounded-2xl border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
                      <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                      Se Connecter
            </Link>
                  </>
                )}
              </div>

              {/* Stats ou aperçu pour les utilisateurs connectés */}
              {user && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mx-auto">
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">📊</div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Projets</div>
                    <div className="text-gray-600 dark:text-gray-400">Organisés et structurés</div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                    <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">🚀</div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Temps Réel</div>
                    <div className="text-gray-600 dark:text-gray-400">Collaboration instantanée</div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                    <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">👥</div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Équipe</div>
                    <div className="text-gray-600 dark:text-gray-400">Travail collaboratif</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-white dark:bg-gray-800">
          <div className="mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Fonctionnalités Puissantes
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 mx-auto">
                Découvrez tout ce que CollabWave peut faire pour améliorer votre productivité et celle de votre équipe
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="opacity-0 translate-y-12 animate-[fade-up_1s_ease-out_forwards] bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl p-8 hover:shadow-lg transition-all duration-200 group" style={{ animationDelay: '100ms' }}>
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-200">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  Gestion de Projets
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Organisez vos tâches par projets avec des couleurs personnalisées, des catégories et des priorités pour une meilleure visibilité.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="opacity-0 translate-y-12 animate-[fade-up_1s_ease-out_forwards] bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-2xl p-8 hover:shadow-lg transition-all duration-200 group" style={{ animationDelay: '200ms' }}>
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-200">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  Collaboration Temps Réel
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Travaillez ensemble avec Socket.IO : voyez les modifications instantanément, partagez des projets et invitez des collaborateurs.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="opacity-0 translate-y-12 animate-[fade-up_1s_ease-out_forwards] bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-2xl p-8 hover:shadow-lg transition-all duration-200 group" style={{ animationDelay: '300ms' }}>
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-200">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  Interface Moderne
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Design responsive avec thème sombre/clair, notifications en temps réel et interface intuitive pour une expérience optimale.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="opacity-0 translate-y-12 animate-[fade-up_1s_ease-out_forwards] bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-2xl p-8 hover:shadow-lg transition-all duration-200 group" style={{ animationDelay: '400ms' }}>
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-200">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM15 17V7a2 2 0 00-2-2H5a2 2 0 00-2 2v13l3-3h6a2 2 0 002-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  Notifications Intelligentes
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Restez informé avec des badges automatiques, notifications d'invitations et alertes de modifications en temps réel.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="opacity-0 translate-y-12 animate-[fade-up_1s_ease-out_forwards] bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 rounded-2xl p-8 hover:shadow-lg transition-all duration-200 group" style={{ animationDelay: '500ms' }}>
                <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-200">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  Catégories & Filtres
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Organisez avec des catégories colorées, filtrez par priorité, statut ou échéance pour une productivité maximale.
                </p>
              </div>

              {/* Feature 6 */}
              <div className="opacity-0 translate-y-12 animate-[fade-up_1s_ease-out_forwards] bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 rounded-2xl p-8 hover:shadow-lg transition-all duration-200 group" style={{ animationDelay: '600ms' }}>
                <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-200">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  Sécurité & Permissions
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Contrôlez l'accès avec des permissions granulaires : lecture, modification, administration pour chaque collaborateur.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose CollabWave Section */}
        <section className="py-20 bg-gray-50 dark:bg-gray-900">
          <div className="mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Pourquoi Choisir <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  CollabWave
                </span> ?
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 mx-auto">
                Une expérience utilisateur pensée pour votre productivité
              </p>
            </div>

            {/* Timeline de l'expérience utilisateur */}
            <div className="relative timeline-container">
              {/* Ligne centrale */}
              <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
              
              <div className="space-y-16">
                {/* Étape 1 - Inscription */}
                <div className="flex items-center timeline-step" data-step="1">
                  <div className="w-1/2 pr-8 text-right">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 translate-y-12 animate-[fade-up_1s_ease-out_forwards]" style={{ animationDelay: '100ms' }}>
                      <div className="flex items-center justify-end mb-4">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mr-3">Inscription Rapide</h3>
                        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-xl">⚡</span>
                        </div>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300">
                        Créez votre compte en 30 secondes. Aucune configuration complexe, juste votre email et c'est parti !
                      </p>
                      <div className="mt-4 text-sm text-green-600 dark:text-green-400 font-semibold">
                        ✓ Moins de 30 secondes
                      </div>
                    </div>
                  </div>
                  
                  {/* Point central */}
                  <div className="relative z-10">
                    <div className="w-6 h-6 bg-green-500 rounded-full border-4 border-white dark:border-gray-900 timeline-point"></div>
                  </div>
                  
                  <div className="w-1/2 pl-8">
                    <div className="text-6xl opacity-20">1</div>
                  </div>
                </div>

                {/* Étape 2 - Premier projet */}
                <div className="flex items-center timeline-step" data-step="2">
                  <div className="w-1/2 pr-8">
                    <div className="text-6xl opacity-20 text-right">2</div>
                  </div>
                  
                  {/* Point central */}
                  <div className="relative z-10">
                    <div className="w-6 h-6 bg-blue-500 rounded-full border-4 border-white dark:border-gray-900 timeline-point"></div>
                  </div>
                  
                  <div className="w-1/2 pl-8">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 translate-y-12 animate-[fade-up_1s_ease-out_forwards]" style={{ animationDelay: '200ms' }}>
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mr-3">
                          <span className="text-white text-xl">🚀</span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Premier Projet</h3>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300">
                        Interface intuitive qui vous guide naturellement. Créez votre premier projet et ajoutez des tâches sans tutoriel.
                      </p>
                      <div className="mt-4 text-sm text-blue-600 dark:text-blue-400 font-semibold">
                        ✓ Interface intuitive
                      </div>
                    </div>
                  </div>
                </div>

                {/* Étape 3 - Collaboration */}
                <div className="flex items-center timeline-step" data-step="3">
                  <div className="w-1/2 pr-8 text-right">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 translate-y-12 animate-[fade-up_1s_ease-out_forwards]" style={{ animationDelay: '300ms' }}>
                      <div className="flex items-center justify-end mb-4">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mr-3">Collaboration Fluide</h3>
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-xl">👥</span>
                        </div>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300">
                        Invitez votre équipe en un clic. Voyez les modifications en temps réel sans rafraîchir la page.
                      </p>
                      <div className="mt-4 text-sm text-purple-600 dark:text-purple-400 font-semibold">
                        ✓ Temps réel avec Socket.IO
                      </div>
                    </div>
                  </div>
                  
                  {/* Point central */}
                  <div className="relative z-10">
                    <div className="w-6 h-6 bg-purple-500 rounded-full border-4 border-white dark:border-gray-900 timeline-point"></div>
                  </div>
                  
                  <div className="w-1/2 pl-8">
                    <div className="text-6xl opacity-20">3</div>
                  </div>
                </div>

                {/* Étape 4 - Productivité */}
                <div className="flex items-center timeline-step" data-step="4">
                  <div className="w-1/2 pr-8">
                    <div className="text-6xl opacity-20 text-right">4</div>
                  </div>
                  
                  {/* Point central */}
                  <div className="relative z-10">
                    <div className="w-6 h-6 bg-orange-500 rounded-full border-4 border-white dark:border-gray-900 timeline-point"></div>
                  </div>
                  
                  <div className="w-1/2 pl-8">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 translate-y-12 animate-[fade-up_1s_ease-out_forwards]" style={{ animationDelay: '400ms' }}>
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center mr-3">
                          <span className="text-white text-xl">📈</span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Productivité Maximale</h3>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300">
                        Organisez avec des catégories, filtrez par priorité, recevez des notifications intelligentes. Votre équipe est plus efficace.
                      </p>
                      <div className="mt-4 text-sm text-orange-600 dark:text-orange-400 font-semibold">
                        ✓ Résultats immédiats
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section statistiques comparatives */}
            <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-8 text-white mb-4">
                  <div className="text-4xl font-bold mb-2">30s</div>
                  <div className="text-lg">Temps de démarrage</div>
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                  Contre 2-3 heures pour configurer d'autres solutions
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-8 text-white mb-4">
                  <div className="text-4xl font-bold mb-2">0</div>
                  <div className="text-lg">Formation requise</div>
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                  Interface si intuitive qu'aucune formation n'est nécessaire
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-8 text-white mb-4">
                  <div className="text-4xl font-bold mb-2">100%</div>
                  <div className="text-lg">Temps réel</div>
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                  Collaboration instantanée avec Socket.IO
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        {!user && (
          <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
            <div className="mx-auto text-center px-4">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                Prêt à transformer votre productivité ?
              </h2>
              <p className="text-xl text-blue-100 mb-10 mx-auto">
                Rejoignez des milliers d'équipes qui utilisent déjà CollabWave pour organiser leurs projets et collaborer efficacement.
              </p>
              <Link 
                href="/auth/register" 
                className="inline-flex items-center px-10 py-5 bg-white text-blue-600 text-xl font-bold rounded-2xl hover:bg-gray-100 transition-all duration-200 shadow-2xl hover:shadow-3xl transform hover:-translate-y-1"
              >
                <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Commencer Maintenant - C'est Gratuit !
              </Link>
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="bg-gray-900 text-white relative">
          {/* Bordure dégradée en haut */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
          
          <div className="mx-auto px-4 py-16">
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