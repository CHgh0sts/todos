export default function Security() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-20 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Sécurité</h1>
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">La sécurité de vos données est notre priorité. CollabWave utilise le chiffrement, l'authentification sécurisée et respecte les meilleures pratiques du secteur.</p>
        <ul className="space-y-4 text-gray-700 dark:text-gray-300">
          <li><b className="text-gray-900 dark:text-white">Chiffrement</b> des données en transit et au repos</li>
          <li><b className="text-gray-900 dark:text-white">Authentification JWT</b> et gestion des sessions</li>
          <li><b className="text-gray-900 dark:text-white">Permissions</b> granulaires par projet</li>
          <li><b className="text-gray-900 dark:text-white">Conformité RGPD</b> et protection des données</li>
        </ul>
      </div>
    </div>
  )
} 