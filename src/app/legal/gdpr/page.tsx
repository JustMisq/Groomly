export default function GDPRPage() {
  return (
    <article className="bg-white rounded-lg p-8 shadow-sm">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">RGPD et LPDP - Protection des Données Personnelles</h1>

      <div className="bg-blue-50 p-4 rounded-lg mb-8 border border-blue-200">
        <p className="text-sm text-gray-700">
          <strong>Dernière mise à jour :</strong> 5 février 2026<br/>
          Groomly respecte le <strong>Règlement Général sur la Protection des Données (RGPD)</strong> de l'Union Européenne 
          et la <strong>Lei da Proteção de Dados Pessoais (LPDP)</strong> portugaise.
        </p>
      </div>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Qui sommes-nous ?</h2>
        
        <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-gray-700">
          <p><strong>Responsable du traitement :</strong> Groomly Portugal, Lda.</p>
          <p><strong>Délégué à la Protection des Données (DPO) :</strong> dpo@groomly.pt</p>
          <p><strong>Autorité de contrôle compétente :</strong> CNPD (Comissão Nacional de Proteção de Dados) - Portugal</p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Cadre juridique</h2>
        
        <div className="space-y-4">
          <div className="border-l-4 border-primary pl-4">
            <h3 className="font-semibold text-gray-900">🇪🇺 RGPD - Règlement (UE) 2016/679</h3>
            <p className="text-sm text-gray-700">Applicable à tous les traitements de données personnelles dans l'UE</p>
          </div>

          <div className="border-l-4 border-primary pl-4">
            <h3 className="font-semibold text-gray-900">🇵🇹 Lei da Protecção de Dados Pessoais (LPDP) - Lei 58/2019</h3>
            <p className="text-sm text-gray-700">Transposition de la LPDP à la législation portugaise</p>
          </div>

          <div className="border-l-4 border-primary pl-4">
            <h3 className="font-semibold text-gray-900">💳 Normes de Paiement - PCI-DSS</h3>
            <p className="text-sm text-gray-700">Sécurité des données bancaires gérée par Stripe</p>
          </div>

          <div className="border-l-4 border-primary pl-4">
            <h3 className="font-semibold text-gray-900">📋 Código do Consumidor</h3>
            <p className="text-sm text-gray-700">Protection des droits des consommateurs au Portugal</p>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Vos droits selon le RGPD et la LPDP</h2>
        
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Vous avez 7 droits fondamentaux :</h3>

        <div className="space-y-4">
          <div className="border-l-4 border-green-500 pl-4 pb-4">
            <h4 className="font-semibold text-gray-900 mb-2">1️⃣ Droit d'accès (Article 15 RGPD / Article 13 LPDP)</h4>
            <p className="text-gray-700 text-sm">
              <strong>Quoi :</strong> Vous avez le droit de savoir quelles données nous avons sur vous<br/>
              <strong>Comment :</strong> Accédez à votre compte ou contactez dpo@groomly.pt<br/>
              <strong>Délai :</strong> Nous vous répondrons dans les 30 jours<br/>
              <strong>Coût :</strong> Gratuit (sauf demandes excessives)
            </p>
          </div>

          <div className="border-l-4 border-green-500 pl-4 pb-4">
            <h4 className="font-semibold text-gray-900 mb-2">2️⃣ Droit de rectification (Article 16 RGPD / Article 14 LPDP)</h4>
            <p className="text-gray-700 text-sm">
              <strong>Quoi :</strong> Corriger les données inexactes ou incomplètes<br/>
              <strong>Comment :</strong> Modifiez votre profil directement ou demandez à dpo@groomly.pt<br/>
              <strong>Délai :</strong> Immédiat dans votre compte, 30 jours pour demande écrite<br/>
              <strong>Coût :</strong> Gratuit
            </p>
          </div>

          <div className="border-l-4 border-red-500 pl-4 pb-4">
            <h4 className="font-semibold text-gray-900 mb-2">3️⃣ Droit à l'oubli / Suppression (Article 17 RGPD / Article 15 LPDP)</h4>
            <p className="text-gray-700 text-sm">
              <strong>Quoi :</strong> Demander la suppression de vos données<br/>
              <strong>Comment :</strong> Utilisez "Supprimer mon compte" dans Paramètres ou contactez dpo@groomly.pt<br/>
              <strong>Exceptions :</strong> Données de facturation (conservées 6 ans légalement)<br/>
              <strong>Délai :</strong> 30 jours<br/>
              <strong>Coût :</strong> Gratuit
            </p>
          </div>

          <div className="border-l-4 border-blue-500 pl-4 pb-4">
            <h4 className="font-semibold text-gray-900 mb-2">4️⃣ Droit de limitation du traitement (Article 18 RGPD / Article 16 LPDP)</h4>
            <p className="text-gray-700 text-sm">
              <strong>Quoi :</strong> Arrêter le traitement de vos données (sauf obligations légales)<br/>
              <strong>Comment :</strong> Contactez dpo@groomly.pt<br/>
              <strong>Résultat :</strong> Vos données seront stockées mais non utilisées<br/>
              <strong>Délai :</strong> 30 jours
            </p>
          </div>

          <div className="border-l-4 border-purple-500 pl-4 pb-4">
            <h4 className="font-semibold text-gray-900 mb-2">5️⃣ Droit à la portabilité (Article 20 RGPD / Article 17 LPDP)</h4>
            <p className="text-gray-700 text-sm">
              <strong>Quoi :</strong> Recevoir vos données dans un format standard et transférable<br/>
              <strong>Comment :</strong> Utilisez "Exporter mes données" dans Paramètres ou contactez dpo@groomly.pt<br/>
              <strong>Format :</strong> JSON et/ou CSV<br/>
              <strong>Délai :</strong> 30 jours<br/>
              <strong>Coût :</strong> Gratuit
            </p>
          </div>

          <div className="border-l-4 border-orange-500 pl-4 pb-4">
            <h4 className="font-semibold text-gray-900 mb-2">6️⃣ Droit d'opposition (Article 21 RGPD / Article 18 LPDP)</h4>
            <p className="text-gray-700 text-sm">
              <strong>Quoi :</strong> S'opposer au traitement de vos données<br/>
              <strong>Cas utilisés :</strong> Marketing, intérêt légitime, profilage<br/>
              <strong>Comment :</strong> Désinscrivez-vous des emails ou contactez dpo@groomly.pt<br/>
              <strong>Période :</strong> À tout moment
            </p>
          </div>

          <div className="border-l-4 border-pink-500 pl-4 pb-4">
            <h4 className="font-semibold text-gray-900 mb-2">7️⃣ Droit à la décision non-automatisée (Article 22 RGPD)</h4>
            <p className="text-gray-700 text-sm">
              <strong>Quoi :</strong> Ne pas être soumis à des décisions automatisées significatives<br/>
              <strong>Exemple :</strong> Refus de service basé uniquement sur un algorithme<br/>
              <strong>Droit :</strong> Demander une intervention humaine<br/>
              <strong>Comment :</strong> Contactez dpo@groomly.pt
            </p>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Comment exercer vos droits ?</h2>
        
        <div className="bg-blue-50 p-6 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-4">Option 1️⃣ : Directement dans votre compte</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
            <li>Paramètres → Données & Confidentialité</li>
            <li>Cliquez sur "Exporter mes données"</li>
            <li>Ou "Supprimer mon compte"</li>
          </ul>

          <h3 className="font-semibold text-gray-900 mb-4">Option 2️⃣ : Par email au DPO</h3>
          <div className="bg-white p-4 rounded border border-blue-200 mb-6">
            <p className="text-gray-700 mb-2"><strong>Adresse :</strong> dpo@groomly.pt</p>
            <p className="text-gray-700 mb-2"><strong>Objet :</strong> [Droit RGPD] - [Votre nom] - [Nature de la demande]</p>
            <p className="text-gray-700 text-sm"><strong>Exemple :</strong> "[Droit d'accès] - Jean Silva - Demande de copie de données"</p>
          </div>

          <h3 className="font-semibold text-gray-900 mb-4">Ce qu'on a besoin de vous</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Votre nom complet</li>
            <li>Votre email associé au compte</li>
            <li>Nature précise de votre demande</li>
            <li>Une copie d'identité (pour verification, facultatif mais recommandé)</li>
          </ul>
        </div>

        <div className="mt-6 bg-green-50 p-4 rounded-lg border border-green-200">
          <p className="text-sm text-gray-700">
            <strong>Délai legale  :</strong> Nous devons répondre dans les <strong>30 jours</strong> à toute demande RGPD/LPDP. 
            Ce délai peut être prolongé de 60 jours si la demande est complexe.
          </p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Si vous êtes un responsable de traitement (Professionnel)</h2>
        
        <p className="text-gray-700 mb-4">
          Si vous gérez les données de vos clients via Groomly, vous êtes <strong>responsable du traitement</strong> 
          et Groomly est votre <strong>sous-traitant</strong>.
        </p>

        <h3 className="text-lg font-semibold text-gray-800 mb-3">Vos obligations :</h3>
        <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
          <li>📋 Informer vos clients que vous traitez leurs données</li>
          <li>✅ Obtenir leur consentement (si applicable)</li>
          <li>🔒 Prendre les mesures de sécurité appropriées</li>
          <li>📝 Documenter vos traitements (Registre de traitement)</li>
          <li>⚠️ Notifier les violations de données dans les 72 heures à la CNPD</li>
        </ul>

        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <p className="text-sm text-gray-700">
            <strong>Accord de sous-traitance :</strong> Groomly a en place un accord de traitement des données 
            (Data Processing Agreement) conformément à l'Article 28 du RGPD.
          </p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Sécurité et Mesures Techniques</h2>
        
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Mesures de sécurité implémentées :</h3>
        
        <div className="space-y-3">
          <div className="flex gap-3">
            <span className="text-2xl">🔐</span>
            <div>
              <p className="font-semibold text-gray-900">Chiffrement SSL/TLS</p>
              <p className="text-sm text-gray-700">Tous les données en transit sont chiffrées (HTTPS)</p>
            </div>
          </div>

          <div className="flex gap-3">
            <span className="text-2xl">🗝️</span>
            <div>
              <p className="font-semibold text-gray-900">Hachage de mots de passe</p>
              <p className="text-sm text-gray-700">bcryptjs avec 10 rounds - les mots de passe ne sont jamais stockés en clair</p>
            </div>
          </div>

          <div className="flex gap-3">
            <span className="text-2xl">☁️</span>
            <div>
              <p className="font-semibold text-gray-900">Infrastructure Cloud sécurisée</p>
              <p className="text-sm text-gray-700">Basée en Union Européenne, conforme à la directive DNSH</p>
            </div>
          </div>

          <div className="flex gap-3">
            <span className="text-2xl">🛡️</span>
            <div>
              <p className="font-semibold text-gray-900">Pare-feu et Détection d'intrusion</p>
              <p className="text-sm text-gray-700">Monitoring 24/7 des tentatives d'accès non autorisé</p>
            </div>
          </div>

          <div className="flex gap-3">
            <span className="text-2xl">💾</span>
            <div>
              <p className="font-semibold text-gray-900">Sauvegardes régulières</p>
              <p className="text-sm text-gray-700">Sauvegardes chiffrées testées régulièrement</p>
            </div>
          </div>

          <div className="flex gap-3">
            <span className="text-2xl">✅</span>
            <div>
              <p className="font-semibold text-gray-900">Audits de sécurité</p>
              <p className="text-sm text-gray-700">Audits externes annuels et tests de pénétration</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Violations de données et notification</h2>
        
        <p className="text-gray-700 mb-4">
          En cas de violation de données personnelles, Groomly notifiera les autorités compétentes et les utilisateurs concernés 
          sans délai injustifié et au plus tard <strong>72 heures après la découverte</strong> (Article 33 RGPD).
        </p>

        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <p className="text-sm text-gray-700 mb-3">
            <strong>Comment signaler une violation ?</strong>
          </p>
          <p className="text-gray-700">Email : security@groomly.pt (confidentiel)</p>
          <p className="text-gray-700">ou DPO : dpo@groomly.pt</p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Transferts de données en dehors de l'UE</h2>
        
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <p className="text-gray-700 mb-2">
            ✅ <strong>Toutes les données restent en Union Européenne</strong>
          </p>
          <p className="text-gray-700 text-sm">
            Groomly ne transfère pas vos données en dehors de l'UE. Notre infrastructure est basée au Portugal ou dans d'autres États membres.
          </p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Autorités de contrôle</h2>
        
        <div className="space-y-4">
          <div className="border-l-4 border-primary pl-4">
            <h3 className="font-semibold text-gray-900">CNPD (Comissão Nacional de Proteção de Dados) - Portugal</h3>
            <p className="text-gray-700 text-sm">
              <strong>Site :</strong> https://www.cnpd.pt<br/>
              <strong>Email :</strong> geral@cnpd.pt<br/>
              <strong>Téléphone :</strong> +351 213 928 400<br/>
              <strong>Adresse :</strong> Rua de São Bento, 148 - 3.º, 1200-821 Lisboa
            </p>
          </div>

          <div className="border-l-4 border-primary pl-4">
            <h3 className="font-semibold text-gray-900">Plateforme de résolution en ligne des litiges UE</h3>
            <p className="text-gray-700 text-sm">
              <strong>Site :</strong> https://ec.europa.eu/consumers/odr<br/>
              <strong>Utilisation :</strong> Pour les litiges de consommation transfrontaliers
            </p>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. FAQ RGPD/LPDP</h2>
        
        <div className="space-y-6">
          <div className="border-b pb-4">
            <h4 className="font-semibold text-gray-900 mb-2">❓ Combien de temps conservez-vous mes données ?</h4>
            <p className="text-gray-700 text-sm">
              <strong>Données actives :</strong> Tant que votre compte est actif<br/>
              <strong>Après suppression du compte :</strong> 30 jours (sauf données de facturation)<br/>
              <strong>Factures :</strong> 6 ans (obligation légale portugaise)
            </p>
          </div>

          <div className="border-b pb-4">
            <h4 className="font-semibold text-gray-900 mb-2">❓ Partagez-vous mes données avec des tiers ?</h4>
            <p className="text-gray-700 text-sm">
              Uniquement quand c'est nécessaire : Stripe (paiements), services d'email, infrastructure cloud. 
              Jamais pour marketing ou revente.
            </p>
          </div>

          <div className="border-b pb-4">
            <h4 className="font-semibold text-gray-900 mb-2">❓ Qu'est-ce qu'un "responsable du traitement" ?</h4>
            <p className="text-gray-700 text-sm">
              La personne/entité qui décide comment et pourquoi traiter des données. 
              Si vous gérez des clients via Groomly, vous êtes responsable du traitement de leurs données.
            </p>
          </div>

          <div className="border-b pb-4">
            <h4 className="font-semibold text-gray-900 mb-2">❓ Comment puis-je déterminer si une demande RGPD est valide ?</h4>
            <p className="text-gray-700 text-sm">
              Si elle concerne vos droits fondamentaux à la protection des données et si elle est faite en personne, 
              elle est valide. Nous acceptons toutes les demandes légitimes.
            </p>
          </div>

          <div className="border-b pb-4">
            <h4 className="font-semibold text-gray-900 mb-2">❓ Que faire si j'ai une plainte RGPD ?</h4>
            <p className="text-gray-700 text-sm">
              1. Contactez-nous d'abord : dpo@groomly.pt<br/>
              2. Si non résolu, saisissez la CNPD : https://www.cnpd.pt/queixa
            </p>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Dénonciation de violations</h2>
        
        <p className="text-gray-700 mb-4">
          Vous pouvez signaler une violation présumée de RGPD/LPDP à la CNPD (Comissão Nacional de Proteção de Dados) :
        </p>

        <div className="bg-red-50 p-4 rounded-lg border border-red-200 space-y-2 text-gray-700">
          <p><strong>📧 Email :</strong> queixa@cnpd.pt</p>
          <p><strong>🌐 Formulaire en ligne :</strong> https://www.cnpd.pt/queixa</p>
          <p><strong>📱 AppSGC :</strong> Application pour soumettre des plaintes</p>
          <p className="text-sm mt-3">Vous n'êtes pas obligé de contacter Groomly d'abord, vous pouvez directement saisir l'autorité.</p>
        </div>
      </section>

      <section className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-2">📞 Toujours des questions ?</h3>
        <p className="text-gray-700 text-sm">
          <strong>DPO :</strong> dpo@groomly.pt<br/>
          <strong>Support :</strong> support@groomly.pt<br/>
          <strong>Autorité :</strong> CNPD - https://www.cnpd.pt
        </p>
      </section>

      <section className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-sm text-gray-700">
          <strong>Dernière mise à jour :</strong> 5 février 2026<br/>
          <strong>Prochaine révision :</strong> février 2027 ou suite à changement de loi
        </p>
      </section>
    </article>
  )
}
