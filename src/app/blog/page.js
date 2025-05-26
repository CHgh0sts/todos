export default function Blog() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-20 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Blog</h1>
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">Les dernières actualités et conseils de l'équipe CollabWave arrivent bientôt !</p>
        <ul className="space-y-4 text-gray-700 dark:text-gray-300">
          <li>Articles</li>
          <li>Tutoriels</li>
          <li>Mises à jour</li>
        </ul>
      </div>
    </div>
  )
} 