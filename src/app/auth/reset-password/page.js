'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [validToken, setValidToken] = useState(null)
  const [tokenChecked, setTokenChecked] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  useEffect(() => {
    if (token) {
      verifyToken()
    } else {
      setValidToken(false)
      setTokenChecked(true)
    }
  }, [token])

  const verifyToken = async () => {
    try {
      const response = await fetch('/api/auth/verify-reset-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      })

      const data = await response.json()
      setValidToken(response.ok)
      setTokenChecked(true)

      if (!response.ok) {
        toast.error(data.error || 'Token invalide ou expiré')
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du token:', error)
      setValidToken(false)
      setTokenChecked(true)
      toast.error('Erreur lors de la vérification du token')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas')
      return
    }

    if (password.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Mot de passe réinitialisé avec succès !')
        router.push('/auth/login')
      } else {
        toast.error(data.error || 'Erreur lors de la réinitialisation')
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors de la réinitialisation')
    } finally {
      setLoading(false)
    }
  }

  if (!tokenChecked) {
    return (
      <div className="fixed inset-0 top-0 overflow-y-auto">
        <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-600 to-red-700 flex items-center justify-center p-2">
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
            <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600 text-sm">Vérification du token...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!validToken) {
    return (
      <div className="fixed inset-0 top-0 overflow-y-auto">
        <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-600 to-red-700 flex items-center justify-center p-2">
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
              <div className="bg-gradient-to-r from-red-600 to-pink-600 px-6 py-5 text-center relative">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative">
                  {/* Logo/Icône */}
                  <div className="mx-auto w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-2 backdrop-blur-sm">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  
                  <h1 className="text-xl font-bold text-white mb-1">
                    ❌ Lien invalide
                  </h1>
                  <p className="text-white/90 text-sm">
                    Ce lien a expiré ou n'est plus valide
                  </p>
                </div>
              </div>

              {/* Contenu */}
              <div className="px-6 py-5 text-center">
                <div className="mb-5">
                  <p className="text-gray-700 text-sm leading-relaxed mb-4">
                    Ce lien de réinitialisation est invalide ou a expiré. 
                    Veuillez demander un nouveau lien de réinitialisation.
                  </p>
                  
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-3 mb-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="h-4 w-4 text-yellow-400 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-2 text-left">
                        <p className="text-xs text-yellow-700 font-medium">
                          Les liens de réinitialisation expirent après 1 heure pour votre sécurité.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Link 
                    href="/auth/forgot-password"
                    className="inline-block w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2.5 px-4 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200"
                  >
                    <span className="flex items-center justify-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Demander un nouveau lien
                    </span>
                  </Link>
                  
                  <Link 
                    href="/auth/login"
                    className="inline-flex items-center justify-center w-full py-2.5 px-4 border-2 border-gray-200 text-gray-600 rounded-lg font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-600 to-red-700 flex items-center justify-center p-2">
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
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-5 text-center relative">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative">
                {/* Logo/Icône */}
                <div className="mx-auto w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-2 backdrop-blur-sm">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1721 9z" />
                  </svg>
                </div>
                
                <h1 className="text-xl font-bold text-white mb-1">
                  🔐 Nouveau mot de passe
                </h1>
                <p className="text-white/90 text-sm">
                  Choisissez un mot de passe sécurisé
                </p>
              </div>
            </div>

            {/* Formulaire */}
            <div className="px-6 py-5">
              <form onSubmit={handleSubmit} className="space-y-3">
                
                {/* Champ Nouveau mot de passe */}
                <div className="space-y-1">
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                    🔒 Nouveau mot de passe
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full px-3 py-2.5 pl-10 pr-10 bg-gray-50 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:bg-white transition-all duration-200 text-gray-900 placeholder-gray-500"
                      placeholder="••••••••"
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">Au moins 6 caractères</p>
                </div>

                {/* Champ Confirmation mot de passe */}
                <div className="space-y-1">
                  <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700">
                    🔐 Confirmer le mot de passe
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="w-full px-3 py-2.5 pl-10 pr-10 bg-gray-50 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:bg-white transition-all duration-200 text-gray-900 placeholder-gray-500"
                      placeholder="••••••••"
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {password && confirmPassword && password !== confirmPassword && (
                    <p className="text-xs text-red-500">Les mots de passe ne correspondent pas</p>
                  )}
                </div>

                {/* Bouton de réinitialisation */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2.5 px-4 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-all duration-200"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Réinitialisation...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Réinitialiser le mot de passe
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
                  className="inline-flex items-center justify-center w-full py-2.5 px-4 border-2 border-purple-200 text-purple-600 rounded-lg font-semibold hover:bg-purple-50 hover:border-purple-300 transition-all duration-200"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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