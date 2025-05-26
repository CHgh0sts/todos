export default function About() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-20 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">À propos</h1>
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">CollabWave est une plateforme collaborative moderne conçue pour simplifier la gestion de projets en équipe.</p>
        <ul className="space-y-4 text-gray-700 dark:text-gray-300">
          <li>Notre mission</li>
          <li>L'équipe</li>
          <li>Nos valeurs</li>
        </ul>
      </div>
    </div>
  )
} 