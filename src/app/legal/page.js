export default function LegalPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Mentions légales
      </h1>
      
      <div className="prose prose-gray dark:prose-invert max-w-none">
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
          Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
        </p>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Éditeur du site
          </h2>
          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
            <p className="text-gray-600 dark:text-gray-300 mb-2">
              <strong>Raison sociale :</strong> CollabWave SAS
            </p>
            <p className="text-gray-600 dark:text-gray-300 mb-2">
              <strong>Siège social :</strong> 123 Avenue de l'Innovation, 75001 Paris, France
            </p>
            <p className="text-gray-600 dark:text-gray-300 mb-2">
              <strong>SIRET :</strong> 123 456 789 00012
            </p>
            <p className="text-gray-600 dark:text-gray-300 mb-2">
              <strong>Capital social :</strong> 100 000 €
            </p>
            <p className="text-gray-600 dark:text-gray-300 mb-2">
              <strong>Directeur de la publication :</strong> Jean Dupont
            </p>
            <p className="text-gray-600 dark:text-gray-300">
              <strong>Contact :</strong> legal@collabwave.com
            </p>
          </div>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Hébergement
          </h2>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
            <p className="text-gray-600 dark:text-gray-300 mb-2">
              <strong>Hébergeur :</strong> Vercel Inc.
            </p>
            <p className="text-gray-600 dark:text-gray-300 mb-2">
              <strong>Adresse :</strong> 340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis
            </p>
            <p className="text-gray-600 dark:text-gray-300">
              <strong>Site web :</strong> https://vercel.com
            </p>
          </div>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Propriété intellectuelle
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            L'ensemble de ce site relève de la législation française et internationale sur le droit d'auteur 
            et la propriété intellectuelle. Tous les droits de reproduction sont réservés, y compris pour 
            les documents téléchargeables et les représentations iconographiques et photographiques.
          </p>
          <p className="text-gray-600 dark:text-gray-300">
            La reproduction de tout ou partie de ce site sur un support électronique quel qu'il soit 
            est formellement interdite sauf autorisation expresse du directeur de la publication.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Responsabilité
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Les informations contenues sur ce site sont aussi précises que possible et le site remis à jour 
            à différentes périodes de l'année, mais peut toutefois contenir des inexactitudes ou des omissions.
          </p>
          <p className="text-gray-600 dark:text-gray-300">
            Si vous constatez une lacune, erreur ou ce qui parait être un dysfonctionnement, 
            merci de bien vouloir le signaler par email à l'adresse support@collabwave.com, 
            en décrivant le problème de la manière la plus précise possible.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Liens hypertextes
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Les liens hypertextes mis en place dans le cadre du présent site web en direction d'autres 
            ressources présentes sur le réseau Internet ne sauraient engager la responsabilité de CollabWave.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Collecte et traitement de données
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Conformément aux dispositions de la loi n° 78-17 du 6 janvier 1978 relative à l'informatique, 
            aux fichiers et aux libertés, le traitement automatisé des données nominatives réalisé à partir 
            de ce site web fait l'objet d'une déclaration auprès de la CNIL.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Contact
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Pour toute question relative aux mentions légales, contactez-nous à legal@collabwave.com
          </p>
        </section>
      </div>
    </div>
  )
} 