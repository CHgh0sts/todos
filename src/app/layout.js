'use client'

import './globals.css'
import { Inter } from 'next/font/google'
import { AuthProvider } from '@/contexts/AuthContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { NotificationBadgeProvider } from '@/contexts/NotificationBadgeContext'
import { SocketProvider } from '@/contexts/SocketContext'
import { Toaster } from 'react-hot-toast'
import Navbar from '@/components/Navbar'
import { usePathname } from 'next/navigation'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({ children }) {
  const pathname = usePathname()
  
  // Pages d'authentification où on ne veut pas la navbar
  const isAuthPage = pathname?.startsWith('/auth/')
  
  return (
    <html lang="fr">
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
                      position="top-right"
                      toastOptions={{
                        duration: 3000,
                        style: {
                          background: '#363636',
                          color: '#fff',
                        },
                      }}
                    />
                  </>
                ) : (
                  // Layout normal pour les autres pages
                  <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                    <Navbar />
                    <main className="container mx-auto px-4 pt-20 pb-8">
                      {children}
                    </main>
                    <Toaster 
                      position="top-right"
                      toastOptions={{
                        duration: 3000,
                        style: {
                          background: '#363636',
                          color: '#fff',
                        },
                      }}
                    />
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