export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Conditions d'utilisation
      </h1>
      
      <div className="prose prose-gray dark:prose-invert max-w-none">
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
          Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
        </p>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            1. Acceptation des conditions
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            En utilisant CollabWave, vous acceptez d'être lié par ces conditions d'utilisation.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            2. Description du service
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            CollabWave est une plateforme de gestion de projets et de tâches collaboratives.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            3. Responsabilités de l'utilisateur
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Vous êtes responsable de maintenir la confidentialité de votre compte et de toutes les activités qui s'y déroulent.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            4. Contact
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Pour toute question concernant ces conditions, contactez-nous à support@collabwave.com
          </p>
        </section>
      </div>
    </div>
  )
} 