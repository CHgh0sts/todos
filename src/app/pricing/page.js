export default function Pricing() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-20 px-4">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Tarifs</h1>
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">WorkWave est gratuit pour les équipes jusqu'à 5 membres.<br/>Des offres Pro et Entreprise arrivent bientôt !</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-8">
            <h2 className="text-2xl font-bold mb-2">Gratuit</h2>
            <div className="text-3xl font-extrabold mb-4">0€</div>
            <ul className="text-left text-gray-600 dark:text-gray-300 space-y-2 mb-4">
              <li>5 membres max</li>
              <li>Projets illimités</li>
              <li>Notifications temps réel</li>
              <li>Support communautaire</li>
            </ul>
            <button className="w-full py-2 bg-blue-600 text-white rounded-lg font-semibold">Commencer</button>
          </div>
          <div className="bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-xl p-8 shadow-lg scale-105">
            <h2 className="text-2xl font-bold mb-2">Pro</h2>
            <div className="text-3xl font-extrabold mb-4">à venir</div>
            <ul className="text-left space-y-2 mb-4">
              <li>Jusqu'à 50 membres</li>
              <li>Support prioritaire</li>
              <li>Intégrations avancées</li>
              <li>Export de données</li>
            </ul>
            <button className="w-full py-2 bg-white text-blue-600 rounded-lg font-semibold">Bientôt disponible</button>
          </div>
          <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-8">
            <h2 className="text-2xl font-bold mb-2">Entreprise</h2>
            <div className="text-3xl font-extrabold mb-4">à venir</div>
            <ul className="text-left text-gray-600 dark:text-gray-300 space-y-2 mb-4">
              <li>Utilisateurs illimités</li>
              <li>SSO & sécurité avancée</li>
              <li>Support dédié</li>
              <li>Personnalisation</li>
            </ul>
            <button className="w-full py-2 bg-blue-600 text-white rounded-lg font-semibold">Contactez-nous</button>
          </div>
        </div>
      </div>
    </div>
  )
} 