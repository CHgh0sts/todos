import './globals.css'
import { Inter } from 'next/font/google'
import { AuthProvider } from '@/contexts/AuthContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { NotificationBadgeProvider } from '@/contexts/NotificationBadgeContext'
import { SocketProvider } from '@/contexts/SocketContext'
import { Toaster } from 'react-hot-toast'
import Navbar from '@/components/Navbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Todos App',
  description: 'Application de gestion de tâches collaboratives',
}

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <ThemeProvider>
          <AuthProvider>
            <SocketProvider>
              <NotificationBadgeProvider>
                <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                  <Navbar />
                  <main className="container mx-auto px-4 pt-20 pb-8">
                    {children}
                  </main>
                </div>
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
              </NotificationBadgeProvider>
            </SocketProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
} 