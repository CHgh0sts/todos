export default function GdprPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Conformité RGPD
      </h1>
      
      <div className="prose prose-gray dark:prose-invert max-w-none">
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
          Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
        </p>
        
        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-300 mb-3">
            Notre engagement RGPD
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            CollabWave s'engage à respecter le Règlement Général sur la Protection des Données (RGPD) 
            et à protéger vos données personnelles avec le plus grand soin.
          </p>
        </div>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Vos droits selon le RGPD
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <h3 className="font-semibold text-green-900 dark:text-green-300 mb-2">
                Droit d'accès
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Vous pouvez demander l'accès à vos données personnelles que nous traitons.
              </p>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
                Droit de rectification
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Vous pouvez demander la correction de données inexactes ou incomplètes.
              </p>
            </div>
            
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-900 dark:text-purple-300 mb-2">
                Droit à l'effacement
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Vous pouvez demander la suppression de vos données personnelles.
              </p>
            </div>
            
            <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
              <h3 className="font-semibold text-orange-900 dark:text-orange-300 mb-2">
                Droit à la portabilité
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Vous pouvez demander le transfert de vos données vers un autre service.
              </p>
            </div>
            
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
              <h3 className="font-semibold text-red-900 dark:text-red-300 mb-2">
                Droit d'opposition
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Vous pouvez vous opposer au traitement de vos données personnelles.
              </p>
            </div>
            
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
              <h3 className="font-semibold text-yellow-900 dark:text-yellow-300 mb-2">
                Droit de limitation
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Vous pouvez demander la limitation du traitement de vos données.
              </p>
            </div>
          </div>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Base légale du traitement
          </h2>
          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Exécution du contrat</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Nous traitons vos données pour fournir nos services de gestion de projets collaboratifs.
              </p>
            </div>
            
            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Intérêt légitime</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Nous analysons l'utilisation de notre plateforme pour améliorer nos services.
              </p>
            </div>
            
            <div className="border-l-4 border-purple-500 pl-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Consentement</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Nous demandons votre consentement pour les communications marketing.
              </p>
            </div>
          </div>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Durée de conservation
          </h2>
          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
            <ul className="space-y-2 text-gray-600 dark:text-gray-300">
              <li>• <strong>Données de compte :</strong> Conservées tant que votre compte est actif</li>
              <li>• <strong>Données de projets :</strong> Conservées selon vos paramètres de projet</li>
              <li>• <strong>Logs de sécurité :</strong> Conservés 12 mois maximum</li>
              <li>• <strong>Données de facturation :</strong> Conservées 10 ans (obligation légale)</li>
            </ul>
          </div>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Transferts internationaux
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Vos données peuvent être transférées vers des pays tiers dans le cadre de notre infrastructure cloud. 
            Nous nous assurons que ces transferts respectent les exigences du RGPD.
          </p>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <p className="text-blue-900 dark:text-blue-300">
              <strong>Garanties :</strong> Clauses contractuelles types approuvées par la Commission européenne
            </p>
          </div>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Délégué à la Protection des Données
          </h2>
          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
            <p className="text-gray-600 dark:text-gray-300 mb-2">
              <strong>Contact DPO :</strong> dpo@collabwave.com
            </p>
            <p className="text-gray-600 dark:text-gray-300">
              Notre DPO est à votre disposition pour toute question relative à la protection de vos données.
            </p>
          </div>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Comment exercer vos droits
          </h2>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                1
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Contactez-nous</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Envoyez votre demande à privacy@collabwave.com avec une pièce d'identité.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                2
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Vérification</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Nous vérifions votre identité pour protéger vos données.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                3
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Traitement</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Nous traitons votre demande dans un délai maximum de 30 jours.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Réclamation
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Si vous estimez que vos droits ne sont pas respectés, vous pouvez introduire une réclamation 
            auprès de la CNIL (Commission Nationale de l'Informatique et des Libertés) : 
            <a href="https://www.cnil.fr" className="text-blue-600 dark:text-blue-400 hover:underline">
              www.cnil.fr
            </a>
          </p>
        </section>
      </div>
    </div>
  )
} 