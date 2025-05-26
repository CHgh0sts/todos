'use client'

import { useEffect, useState, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'

export default function VerifyPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState('loading')
  const [message, setMessage] = useState('')
  const hasVerified = useRef(false) // Protection contre les doubles requêtes

  useEffect(() => {
    const verifyToken = async () => {
      // Éviter les doubles requêtes
      if (hasVerified.current) {
        return
      }
      hasVerified.current = true

      try {
        const token = searchParams.get('token')
        if (!token) {
          // Attendre un peu avant d'afficher l'erreur pour éviter le scintillement
          await new Promise(resolve => setTimeout(resolve, 1000))
          setStatus('error')
          setMessage('Token manquant')
          return
        }

        // Attendre au minimum 800ms pour éviter l'affichage trop rapide
        const [response] = await Promise.all([
          fetch(`/api/auth/verify?token=${token}`),
          new Promise(resolve => setTimeout(resolve, 800))
        ])
        
        const data = await response.json()

        if (response.ok) {
          setStatus('success')
          setMessage(data.message)
          // Rediriger vers la page de connexion après 3 secondes avec le message de succès
          setTimeout(() => {
            router.push('/auth/login?message=verified')
          }, 3000)
        } else {
          setStatus('error')
          setMessage(data.error || 'Une erreur est survenue')
        }
      } catch (error) {
        console.error('Erreur de vérification:', error)
        // Attendre un peu avant d'afficher l'erreur
        await new Promise(resolve => setTimeout(resolve, 1000))
        setStatus('error')
        setMessage('Une erreur est survenue lors de la vérification')
      }
    }

    verifyToken()
  }, [searchParams, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Vérification du compte
          </h2>
        </div>

        <div className="mt-8 space-y-6">
          <div className="rounded-md shadow-sm -space-y-px">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow">
              {status === 'loading' && (
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                  <p className="mt-4 text-gray-600 dark:text-gray-300">Vérification en cours...</p>
                </div>
              )}

              {status === 'success' && (
                <div className="text-center">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900">
                    <svg className="h-6 w-6 text-green-600 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="mt-4 text-lg font-medium text-gray-900 dark:text-white">{message}</p>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Redirection vers la page de connexion...
                  </p>
                </div>
              )}

              {status === 'error' && (
                <div className="text-center">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900">
                    <svg className="h-6 w-6 text-red-600 dark:text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <p className="mt-4 text-lg font-medium text-gray-900 dark:text-white">{message}</p>
                  <a 
                    href="/auth/login"
                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Retour à la connexion
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 