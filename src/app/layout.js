'use client'

import './globals.css'
import { Inter } from 'next/font/google'
import { AuthProvider } from '@/contexts/AuthContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { NotificationBadgeProvider } from '@/contexts/NotificationBadgeContext'
import { SocketProvider } from '@/contexts/SocketContext'
import { Toaster } from 'react-hot-toast'
import Navbar from '@/components/Navbar'
import CookieConsent from '@/components/CookieConsent'
import SocketDiagnostic from '@/components/SocketDiagnostic'
import PWAManager from '@/components/PWAManager'
import ConnectionStatus from '@/components/ConnectionStatus'
import { usePathname } from 'next/navigation'
import Head from 'next/head'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({ children }) {
  const pathname = usePathname()
  
  // Pages d'authentification où on ne veut pas la navbar
  const isAuthPage = pathname?.startsWith('/auth/')
  
  // Pages qui gèrent leur propre layout pleine largeur (sans container)
  const isFullWidthPage = pathname === '/' || pathname === '/api'
  
  // Afficher le diagnostic seulement en développement
  const isDevelopment = process.env.NODE_ENV === 'development'
  
  return (
    <html lang="fr">
      <head>
        {/* Métadonnées PWA */}
        <meta name="application-name" content="CollabWave" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="CollabWave" />
        <meta name="description" content="Plateforme de gestion de projets collaboratifs avec tâches, équipes et notifications en temps réel" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/icons/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#3B82F6" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="theme-color" content="#3B82F6" />

        {/* Viewport optimisé pour PWA */}
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, user-scalable=no, viewport-fit=cover" />

        {/* Icônes Apple */}
        <link rel="apple-touch-icon" href="/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-192x192.png" />

        {/* Icônes génériques */}
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/icon-16x16.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="mask-icon" href="/icons/safari-pinned-tab.svg" color="#3B82F6" />
        <link rel="shortcut icon" href="/favicon.ico" />

        {/* Écran de démarrage iOS */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        
        {/* Métadonnées Open Graph pour le partage */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="CollabWave - Gestion de Projets Collaboratifs" />
        <meta property="og:description" content="Plateforme de gestion de projets collaboratifs avec tâches, équipes et notifications en temps réel" />
        <meta property="og:site_name" content="CollabWave" />
        <meta property="og:url" content="https://todo.chghosts.fr" />
        <meta property="og:image" content="https://todo.chghosts.fr/icons/icon-512x512.png" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:url" content="https://todo.chghosts.fr" />
        <meta name="twitter:title" content="CollabWave - Gestion de Projets Collaboratifs" />
        <meta name="twitter:description" content="Plateforme de gestion de projets collaboratifs avec tâches, équipes et notifications en temps réel" />
        <meta name="twitter:image" content="https://todo.chghosts.fr/icons/icon-512x512.png" />
        <meta name="twitter:creator" content="@collabwave" />

        <title>CollabWave - Gestion de Projets Collaboratifs</title>
      </head>
      <body className={inter.className}>
        <ThemeProvider>
          <AuthProvider>
            <SocketProvider>
              <NotificationBadgeProvider>
                {isAuthPage ? (
                  // Layout pour les pages d'authentification (sans navbar, sans container)
                  <>
                    {children}
                    <Toaster 
                      position="bottom-right"
                      toastOptions={{
                        duration: 3000,
                        style: {
                          background: '#363636',
                          color: '#fff',
                        },
                      }}
                    />
                    <CookieConsent />
                    <PWAManager />
                    <ConnectionStatus />
                    {isDevelopment && <SocketDiagnostic />}
                  </>
                ) : isFullWidthPage ? (
                  // Layout pour les pages pleine largeur (avec navbar mais sans container)
                  <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                    <Navbar />
                    <main className="pt-20">
                      {children}
                    </main>
                    <Toaster 
                      position="bottom-right"
                      toastOptions={{
                        duration: 3000,
                        style: {
                          background: '#363636',
                          color: '#fff',
                        },
                      }}
                    />
                    <CookieConsent />
                    <PWAManager />
                    <ConnectionStatus />
                    {isDevelopment && <SocketDiagnostic />}
                  </div>
                ) : (
                  // Layout normal pour les autres pages
                  <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                    <Navbar />
                    <main className="container mx-auto px-4 pt-20 pb-8">
                      {children}
                    </main>
                    <Toaster 
                      position="bottom-right"
                      toastOptions={{
                        duration: 3000,
                        style: {
                          background: '#363636',
                          color: '#fff',
                        },
                      }}
                    />
                    <CookieConsent />
                    <PWAManager />
                    <ConnectionStatus />
                    {isDevelopment && <SocketDiagnostic />}
                  </div>
                )}
              </NotificationBadgeProvider>
            </SocketProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
} 