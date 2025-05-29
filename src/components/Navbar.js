'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { useSocket } from '@/contexts/SocketContext'
import { useNotificationBadges } from '@/contexts/NotificationBadgeContext'
import NotificationBadge from './ui/NotificationBadge'
import { useState, useEffect } from 'react'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { theme, changeTheme } = useTheme()
  const { isConnected } = useSocket()
  const { badges } = useNotificationBadges()
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const isActive = (path) => {
    if (path === '/') return pathname === '/'
    return pathname.startsWith(path)
  }

  const getLinkClasses = (path, isMobile = false) => {
    const baseClasses = isMobile 
      ? 'flex items-center py-2 px-2 text-sm font-medium transition-colors duration-200'
      : 'flex items-center text-sm font-medium transition-colors duration-200'
    
    if (isActive(path)) {
      return `${baseClasses} text-blue-600 dark:text-blue-400 ${
        isMobile ? 'bg-blue-50 dark:bg-blue-900/30 rounded-md' : ''
      }`
    }
    
    return `${baseClasses} text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 ${
      isMobile ? 'hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-md -mx-2' : ''
    }`
  }

  // Fonction pour gérer le clic sur un lien mobile
  const handleMobileLinkClick = (callback) => {
    // Exécuter le callback immédiatement
    if (callback) callback()
    // Fermer le menu avec un délai pour permettre la navigation
    setTimeout(() => {
      setIsMenuOpen(false)
    }, 150)
  }

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-sm shadow-sm border-b transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/90 dark:bg-gray-800/90 border-gray-200/80 dark:border-gray-700/80' 
        : 'bg-white/95 dark:bg-gray-800/95 border-gray-200 dark:border-gray-700'
    }`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex justify-between items-center transition-all duration-300 ${
          isScrolled ? 'h-10' : 'h-16'
        }`}>
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">W</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              CollabWave
            </span>
          </Link>

          <div className={`hidden lg:flex items-center transition-all duration-300 ${
            isScrolled ? 'space-x-3' : 'space-x-6'
          }`}>
            {user ? (
              <>
                <Link href="/projects" className={getLinkClasses('/projects')}>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  Projets
                </Link>
                <Link href="/invitations" className={getLinkClasses('/invitations')}>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 1.05a2 2 0 001.67-1.93V4a2 2 0 00-2-2H8a2 2 0 00-2 2v3.05L3 8zm0 0v8a2 2 0 002 2h8a2 2 0 002-2V8m-13 0L21 8m0 0v8a2 2 0 01-2 2H11" />
                  </svg>
                  <span className="relative">
                    Invitations
                    <NotificationBadge count={badges.invitations} />
                  </span>
                </Link>
                <Link href="/notifications" className={getLinkClasses('/notifications')}>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM15 17V7a2 2 0 00-2-2H5a2 2 0 00-2 2v13l3-3h6a2 2 0 002-2z" />
                  </svg>
                  <span className="relative">
                    Notifications
                    <NotificationBadge count={badges.notifications} />
                  </span>
                </Link>
                <Link href="/categories" className={getLinkClasses('/categories')}>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  Catégories
                </Link>
                <Link href="/api" className={getLinkClasses('/api')}>
                  <svg className={`transition-all duration-300 ${isScrolled ? 'w-3 h-3 mr-2' : 'w-4 h-4 mr-2'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <span className="relative">
                    API
                    <NotificationBadge count={badges.friends} />
                  </span>
                </Link>
                
                {/* Bouton toggle thème */}
                <button
                  onClick={() => {
                    if (theme === 'system') {
                      changeTheme('light')
                    } else if (theme === 'light') {
                      changeTheme('dark')
                    } else {
                      changeTheme('system')
                    }
                  }}
                  className={`rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 ${
                    isScrolled ? 'p-1.5 text-sm' : 'p-2'
                  }`}
                  title={`Thème actuel: ${theme === 'system' ? 'automatique' : theme === 'light' ? 'clair' : 'sombre'}`}
                >
                  {theme === 'system' ? '🖥️' : theme === 'light' ? '☀️' : '🌙'}
                </button>
                
                <div className="relative">
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className={`flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 ${
                      isScrolled ? 'text-sm' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span>{user.name}</span>
                      {/* Indicateur de connexion Socket.IO */}
                      <div 
                        className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                          isConnected ? 'bg-green-500' : 'bg-red-500'
                        }`}
                        title={isConnected ? 'Connecté en temps réel' : 'Déconnecté'}
                      />
                    </div>
                    <svg className={`transition-all duration-300 ${isScrolled ? 'w-3 h-3' : 'w-4 h-4'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {isMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                      <Link
                        href="/profile"
                        className={`flex items-center px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                          isActive('/profile') 
                            ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30' 
                            : 'text-gray-700 dark:text-gray-300'
                        }`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Profil
                      </Link>
                      <Link
                        href="/friends"
                        className={`flex items-center px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                          isActive('/friends') 
                            ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30' 
                            : 'text-gray-700 dark:text-gray-300'
                        }`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Mes amis
                      </Link>
                      <button
                        onClick={() => {
                          logout()
                          setIsMenuOpen(false)
                        }}
                        className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Déconnexion
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className={`flex items-center transition-all duration-300 ${
                isScrolled ? 'space-x-2' : 'space-x-4'
              }`}>
                {/* Bouton toggle thème pour utilisateurs non connectés */}
                <button
                  onClick={() => {
                    if (theme === 'system') {
                      changeTheme('light')
                    } else if (theme === 'light') {
                      changeTheme('dark')
                    } else {
                      changeTheme('system')
                    }
                  }}
                  className={`rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 ${
                    isScrolled ? 'p-1.5 text-sm' : 'p-2'
                  }`}
                  title={`Thème actuel: ${theme === 'system' ? 'automatique' : theme === 'light' ? 'clair' : 'sombre'}`}
                >
                  {theme === 'system' ? '🖥️' : theme === 'light' ? '☀️' : '🌙'}
                </button>
                <Link
                  href="/auth/login"
                  className={getLinkClasses('/auth/login')}
                >
                  Connexion
                </Link>
                <Link
                  href="/auth/register"
                  className={`bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-all duration-300 ${
                    isScrolled ? 'px-3 py-1 text-sm' : 'px-4 py-2'
                  }`}
                >
                  Inscription
                </Link>
              </div>
            )}
          </div>

          {/* Menu mobile */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
            >
              <svg className={`transition-all duration-300 ${isScrolled ? 'w-5 h-5' : 'w-6 h-6'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Menu mobile ouvert */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gray-200 dark:border-gray-700">
            {/* Bouton de fermeture du menu mobile */}
            <div className="flex justify-between items-center mb-4 px-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Menu</span>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 p-1"
                title="Fermer le menu"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {user ? (
              <div className="space-y-2">
                <Link
                  href="/projects"
                  className={getLinkClasses('/projects', true)}
                  onClick={() => handleMobileLinkClick(() => {})}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  Projets
                </Link>
                <Link
                  href="/invitations"
                  className={getLinkClasses('/invitations', true)}
                  onClick={() => handleMobileLinkClick(() => {})}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 1.05a2 2 0 001.67-1.93V4a2 2 0 00-2-2H8a2 2 0 00-2 2v3.05L3 8zm0 0v8a2 2 0 002 2h8a2 2 0 002-2V8m-13 0L21 8m0 0v8a2 2 0 01-2 2H11" />
                  </svg>
                  <span className="relative">
                    Invitations
                    <NotificationBadge count={badges.invitations} />
                  </span>
                </Link>
                <Link
                  href="/notifications"
                  className={getLinkClasses('/notifications', true)}
                  onClick={() => handleMobileLinkClick(() => {})}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM15 17V7a2 2 0 00-2-2H5a2 2 0 00-2 2v13l3-3h6a2 2 0 002-2z" />
                  </svg>
                  <span className="relative">
                    Notifications
                    <NotificationBadge count={badges.notifications} />
                  </span>
                </Link>
                <Link
                  href="/categories"
                  className={getLinkClasses('/categories', true)}
                  onClick={() => handleMobileLinkClick(() => {})}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  Catégories
                </Link>
                <Link
                  href="/api"
                  className={getLinkClasses('/api', true)}
                  onClick={() => handleMobileLinkClick(() => {})}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <span className="relative">
                    API
                    <NotificationBadge count={badges.friends} />
                  </span>
                </Link>
                <Link
                  href="/profile"
                  className={getLinkClasses('/profile', true)}
                  onClick={() => handleMobileLinkClick(() => {})}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Profil
                </Link>
                
                {/* Bouton toggle thème mobile */}
                <button
                  onClick={() => {
                    if (theme === 'system') {
                      changeTheme('light')
                    } else if (theme === 'light') {
                      changeTheme('dark')
                    } else {
                      changeTheme('system')
                    }
                  }}
                  className="flex items-center py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 w-full text-left"
                >
                  <span className="mr-2">
                    {theme === 'system' ? '🖥️' : theme === 'light' ? '☀️' : '🌙'}
                  </span>
                  Thème: {theme === 'system' ? 'Automatique' : theme === 'light' ? 'Clair' : 'Sombre'}
                </button>
                
                <button
                  onClick={() => {
                    handleMobileLinkClick(() => logout())
                  }}
                  className="flex items-center w-full text-left py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Déconnexion
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {/* Bouton toggle thème mobile pour utilisateurs non connectés */}
                <button
                  onClick={() => {
                    if (theme === 'system') {
                      changeTheme('light')
                    } else if (theme === 'light') {
                      changeTheme('dark')
                    } else {
                      changeTheme('system')
                    }
                  }}
                  className="flex items-center py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 w-full text-left"
                >
                  <span className="mr-2">
                    {theme === 'system' ? '🖥️' : theme === 'light' ? '☀️' : '🌙'}
                  </span>
                  Thème: {theme === 'system' ? 'Automatique' : theme === 'light' ? 'Clair' : 'Sombre'}
                </button>
                <Link
                  href="/auth/login"
                  className={getLinkClasses('/auth/login', true)}
                  onClick={() => handleMobileLinkClick(() => {})}
                >
                  Connexion
                </Link>
                <Link
                  href="/auth/register"
                  className={getLinkClasses('/auth/register', true)}
                  onClick={() => handleMobileLinkClick(() => {})}
                >
                  Inscription
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  )
} 