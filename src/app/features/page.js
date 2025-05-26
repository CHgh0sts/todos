export default function Features() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-20 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Fonctionnalités</h1>
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">Découvrez tout ce que CollabWave peut faire pour booster la collaboration et la productivité de votre équipe.</p>
        <ul className="space-y-6 text-gray-700 dark:text-gray-300">
          <li><b className="text-gray-900 dark:text-white">Gestion de projets</b> : Créez, organisez et personnalisez vos projets avec couleurs, emojis et descriptions.</li>
          <li><b className="text-gray-900 dark:text-white">Collaboration temps réel</b> : Travaillez ensemble avec Socket.IO, voyez les modifications instantanément.</li>
          <li><b className="text-gray-900 dark:text-white">Interface moderne</b> : Design responsive, thème sombre/clair, notifications temps réel.</li>
          <li><b className="text-gray-900 dark:text-white">Sécurité avancée</b> : Authentification JWT, chiffrement des données, permissions granulaires.</li>
        </ul>
      </div>
    </div>
  )
} 