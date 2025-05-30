'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { blogPosts, categories, getFeaturedPosts, getPostsByCategory, searchPosts } from '@/lib/blogData'

export default function Blog() {
  const [selectedCategory, setSelectedCategory] = useState("Tous")
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const postsPerPage = 4

  // Filtrer les articles
  const filteredPosts = searchTerm 
    ? searchPosts(searchTerm).filter(post => 
        selectedCategory === "Tous" || post.category === selectedCategory
      )
    : getPostsByCategory(selectedCategory)

  // Pagination
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage)
  const startIndex = (currentPage - 1) * postsPerPage
  const currentPosts = filteredPosts.slice(startIndex, startIndex + postsPerPage)

  // Articles en vedette
  const featuredPosts = getFeaturedPosts()

  // Réinitialiser la page lors du changement de filtre
  useEffect(() => {
    setCurrentPage(1)
  }, [selectedCategory, searchTerm])

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="fixed inset-0 top-16 overflow-y-auto">
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900">
        
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-5xl font-bold mb-6">
                Blog CollabWave
              </h1>
              <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
                Découvrez les dernières actualités, conseils et guides pour optimiser votre collaboration d'équipe
              </p>
              
              {/* Barre de recherche */}
              <div className="max-w-md mx-auto">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Rechercher un article..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-3 pl-12 rounded-full text-gray-900 bg-white/90 backdrop-blur-sm border-0 focus:ring-2 focus:ring-white/50 focus:outline-none"
                  />
                  <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          
          {/* Articles en vedette */}
          {featuredPosts.length > 0 && selectedCategory === "Tous" && !searchTerm && (
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Articles en vedette</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {featuredPosts.map((post) => (
                  <article key={post.id} className="group bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                    <div className="relative h-64 overflow-hidden">
                      <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                          ⭐ En vedette
                        </span>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center space-x-4 mb-4">
                        <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm font-medium">
                          {post.category}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400 text-sm">
                          {post.readTime} de lecture
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Image
                            src={post.authorImage}
                            alt={post.author}
                            width={32}
                            height={32}
                            className="rounded-full"
                          />
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{post.author}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(post.publishedAt)}</p>
                          </div>
                        </div>
                        <Link href={`/blog/${post.id}`} className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm">
                          Lire la suite →
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}

          {/* Filtres par catégorie */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-3">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full font-medium transition-all duration-200 ${
                    selectedCategory === category
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Grille d'articles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {currentPosts.map((post) => (
              <article key={post.id} className="group bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center space-x-4 mb-3">
                    <span className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-3 py-1 rounded-full text-sm font-medium">
                      {post.category}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400 text-sm">
                      {post.readTime} de lecture
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Image
                        src={post.authorImage}
                        alt={post.author}
                        width={24}
                        height={24}
                        className="rounded-full"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{post.author}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(post.publishedAt)}</p>
                      </div>
                    </div>
                    <Link href={`/blog/${post.id}`} className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm">
                      Lire →
                    </Link>
                  </div>
                  
                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    {post.tags.map((tag) => (
                      <span key={tag} className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded text-xs">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Message si aucun résultat */}
          {filteredPosts.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Aucun article trouvé
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Essayez de modifier vos critères de recherche ou de sélectionner une autre catégorie.
              </p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Précédent
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    currentPage === page
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Suivant
              </button>
            </div>
          )}
        </div>

        {/* Newsletter Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Restez informé des dernières actualités
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Recevez nos articles directement dans votre boîte mail
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Votre adresse email"
                className="flex-1 px-4 py-3 rounded-lg text-gray-900 bg-white/90 backdrop-blur-sm border-0 focus:ring-2 focus:ring-white/50 focus:outline-none"
              />
              <button className="px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                S'abonner
              </button>
            </div>
          </div>
        </div>

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