'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setEmailSent(true)
        toast.success('Email de réinitialisation envoyé !')
      } else {
        toast.error(data.error || 'Erreur lors de l\'envoi de l\'email')
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors de l\'envoi de l\'email')
    } finally {
      setLoading(false)
    }
  }

  if (emailSent) {
    return (
      <div className="fixed inset-0 top-0 overflow-y-auto">
        <div className="min-h-screen bg-gradient-to-br from-orange-500 via-red-600 to-pink-700 flex items-center justify-center p-2">
          {/* Bouton retour à l'accueil */}
          <Link 
            href="/"
            className="fixed top-4 left-4 z-50 bg-white/20 backdrop-blur-sm text-white p-2 rounded-full hover:bg-white/30 transition-all duration-200 group"
          >
            <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>

          {/* Particules d'arrière-plan */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
          </div>

          <div className="relative w-full max-w-md">
            {/* Carte principale */}
            <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
              
              {/* Header avec gradient */}
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-5 text-center relative">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative">
                  {/* Logo/Icône */}
                  <div className="mx-auto w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-2 backdrop-blur-sm">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  
                  <h1 className="text-xl font-bold text-white mb-1">
                    📧 Email envoyé !
                  </h1>
                  <p className="text-white/90 text-sm">
                    Vérifiez votre boîte de réception
                  </p>
                </div>
              </div>

              {/* Contenu */}
              <div className="px-6 py-5 text-center">
                <div className="mb-5">
                  <p className="text-gray-700 text-sm leading-relaxed mb-3">
                    Nous avons envoyé un lien de réinitialisation à
                  </p>
                  <div className="bg-gray-50 rounded-lg p-3 border-2 border-gray-200">
                    <p className="font-semibold text-gray-900 text-sm">{email}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-blue-50 border-l-4 border-blue-400 rounded-lg p-3">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="h-4 w-4 text-blue-400 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-2 text-left">
                        <p className="text-xs text-blue-700 font-medium">
                          Suivez les instructions dans l'email pour réinitialiser votre mot de passe.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => setEmailSent(false)}
                    className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-2.5 px-4 rounded-lg font-semibold hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200"
                  >
                    📤 Renvoyer l'email
                  </button>
                  
                  <Link 
                    href="/auth/login"
                    className="inline-flex items-center justify-center w-full py-2.5 px-4 border-2 border-gray-200 text-gray-600 rounded-lg font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
                  >
                    <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Retour à la connexion
                  </Link>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center mt-3">
              <p className="text-white/80 text-sm">
                © {new Date().getFullYear()} CollabWave. Transformez vos idées en réalité.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 top-0 overflow-y-auto">
      <div className="min-h-screen bg-gradient-to-br from-orange-500 via-red-600 to-pink-700 flex items-center justify-center p-2">
        {/* Bouton retour à l'accueil */}
        <Link 
          href="/"
          className="fixed top-4 left-4 z-50 bg-white/20 backdrop-blur-sm text-white p-2 rounded-full hover:bg-white/30 transition-all duration-200 group"
        >
          <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>

        {/* Particules d'arrière-plan */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        </div>

        <div className="relative w-full max-w-md">
          {/* Carte principale */}
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
            
            {/* Header avec gradient */}
            <div className="bg-gradient-to-r from-orange-600 to-red-600 px-6 py-5 text-center relative">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative">
                {/* Logo/Icône */}
                <div className="mx-auto w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-2 backdrop-blur-sm">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
                
                <h1 className="text-xl font-bold text-white mb-1">
                  🔑 Mot de passe oublié
                </h1>
                <p className="text-white/90 text-sm">
                  Récupérez l'accès à votre compte
                </p>
              </div>
            </div>

            {/* Formulaire */}
            <div className="px-6 py-5">
              <div className="mb-4">
                <p className="text-gray-600 text-center text-sm leading-relaxed">
                  Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Champ Email */}
                <div className="space-y-1">
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                    📧 Adresse email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full px-3 py-2.5 pl-10 bg-gray-50 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:bg-white transition-all duration-200 text-gray-900 placeholder-gray-500"
                      placeholder="votre@email.com"
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Bouton d'envoi */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-2.5 px-4 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-all duration-200"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Envoi en cours...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Envoyer le lien
                    </span>
                  )}
                </button>
              </form>

              {/* Séparateur */}
              <div className="my-4 flex items-center">
                <div className="flex-1 border-t border-gray-200"></div>
                <span className="px-3 text-sm text-gray-500 bg-white">ou</span>
                <div className="flex-1 border-t border-gray-200"></div>
              </div>

              {/* Lien vers connexion */}
              <div className="text-center">
                <p className="text-gray-600 mb-2 text-sm">
                  Vous vous souvenez de votre mot de passe ?
                </p>
                <Link 
                  href="/auth/login" 
                  className="inline-flex items-center justify-center w-full py-2.5 px-4 border-2 border-orange-200 text-orange-600 rounded-lg font-semibold hover:bg-orange-50 hover:border-orange-300 transition-all duration-200"
                >
                  <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Retour à la connexion
                </Link>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-3">
            <p className="text-white/80 text-sm">
              © {new Date().getFullYear()} CollabWave. Transformez vos idées en réalité.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 