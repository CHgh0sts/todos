export default function Status() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-20 px-4">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Statut du service</h1>
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">Tous les systèmes sont <span className='text-green-500 font-bold'>opérationnels</span>.</p>
        <div className="mt-8 text-gray-400 text-sm">Dernière mise à jour : {new Date().toLocaleString('fr-FR')}</div>
      </div>
    </div>
  )
} 