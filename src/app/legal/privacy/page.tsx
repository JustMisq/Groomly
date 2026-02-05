export default function PrivacyPage() {
  return (
    <article className="bg-white rounded-lg p-8 shadow-sm">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Politique de Confidentialité</h1>

      <div className="bg-blue-50 p-4 rounded-lg mb-8 border border-blue-200">
        <p className="text-sm text-gray-700">
          <strong>Dernière mise à jour :</strong> 5 février 2026<br/>
          Cette politique de confidentialité explique comment Groomly Portugal collecte, utilise et protège vos données personnelles, 
          en conformité avec la LPDP (Lei da Proteção de Dados Pessoais) et le RGPD.
        </p>
      </div>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Responsable du traitement</h2>
        
        <div className="bg-gray-50 p-4 rounded-lg text-gray-700">
          <p><strong>Groomly Portugal, Lda.</strong></p>
          <p>Email : dpo@groomly.pt</p>
          <p>Notre délégué à la protection des données (DPO) est à votre disposition pour toute question.</p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Données collectées</h2>
        
        <h3 className="text-lg font-semibold text-gray-800 mb-3">2.1 Données obligatoires</h3>
        <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
          <li>Email et mot de passe</li>
          <li>Nom et prénom</li>
          <li>Numéro de téléphone (optionnel)</li>
          <li>Informations du salon (nom, adresse, NIF)</li>
        </ul>

        <h3 className="text-lg font-semibold text-gray-800 mb-3">2.2 Données des clients</h3>
        <p className="text-gray-700 mb-3">
          Si vous utiliser Groomly pour gérer vos clients, vous serez vous-même responsable de traitement pour :
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>Informations clients (nom, téléphone, email)</li>
          <li>Informations sur les animaux (nom, espèce, race, date de naissance, observations)</li>
          <li>Historique des rendez-vous et services</li>
          <li>Historique des paiements (factures, montants)</li>
        </ul>

        <h3 className="text-lg font-semibold text-gray-800 mb-3 mt-4">2.3 Données techniques</h3>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>Adresse IP, type de navigateur, pages visitées</li>
          <li>Cookies et identifiants de session</li>
          <li>Logs de connexion et d'utilisation</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Base légale du traitement</h2>
        
        <div className="space-y-3 text-gray-700">
          <p><strong>✓ Exécution du contrat :</strong> Vos données sont nécessaires pour vous fournir accès à Groomly</p>
          <p><strong>✓ Intérêt légitime :</strong> Amélioration du service, prévention de la fraude, sécurité</p>
          <p><strong>✓ Consentement :</strong> Pour les emails marketing (vous pouvez vous désinscrire à tout moment)</p>
          <p><strong>✓ Obligation légale :</strong> Conservation des données de facturation (6 ans selon droit fiscal portugais)</p>
          <p><strong>✓ Protection des intérêts vitaux :</strong> Sécurité de notre infrastructure</p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Utilisation des données</h2>
        
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Nous utilisons vos données pour :</h3>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>✓ Fournir et maintenir le service Groomly</li>
          <li>✓ Traiter les paiements et générer les factures</li>
          <li>✓ Communiquer avec vous (support, mises à jour)</li>
          <li>✓ Améliorer l'expérience utilisateur et le service</li>
          <li>✓ Assurer la sécurité et prévenir la fraude</li>
          <li>✓ Respecter les obligations légales et fiscales</li>
          <li>✓ Envoyer des newsletters (avec votre consentement)</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Partage des données</h2>
        
        <p className="text-gray-700 mb-4">Vos données ne sont partagées que lorsque c'est nécessaire :</p>

        <h3 className="text-lg font-semibold text-gray-800 mb-3">5.1 Prestataires de service</h3>
        <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
          <li><strong>Stripe :</strong> Pour les paiements (voir politique Stripe)</li>
          <li><strong>Infrastructure cloud :</strong> Hébergement des données (basé UE)</li>
          <li><strong>Services email :</strong> Envoi de communications</li>
        </ul>

        <h3 className="text-lg font-semibold text-gray-800 mb-3">5.2 Obligations légales</h3>
        <p className="text-gray-700">
          Nous pouvons divulguer vos données si exigé par la loi ou une autorité compétente portugaise.
        </p>

        <h3 className="text-lg font-semibold text-gray-800 mb-3 mt-4">5.3 Pas de transfert en dehors de l'UE</h3>
        <p className="text-gray-700">
          Toutes les données restent dans l'Union Européenne (notamment au Portugal ou dans d'autres États membres).
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Droits des utilisateurs</h2>
        
        <p className="text-gray-700 mb-4">
          Conformément à la LPDP et au RGPD, vous avez les droits suivants :
        </p>

        <div className="space-y-4">
          <div className="border-l-4 border-primary pl-4">
            <h3 className="font-semibold text-gray-900">📋 Droit d'accès</h3>
            <p className="text-gray-700">Accéder à vos données via votre compte ou en contactant contact@groomly.pt</p>
          </div>

          <div className="border-l-4 border-primary pl-4">
            <h3 className="font-semibold text-gray-900">✏️ Droit de rectification</h3>
            <p className="text-gray-700">Corriger vos données inexactes directement dans votre profil</p>
          </div>

          <div className="border-l-4 border-primary pl-4">
            <h3 className="font-semibold text-gray-900">🗑️ Droit à l'oubli (suppression)</h3>
            <p className="text-gray-700">Demander la suppression sous réserve des obligations de conservation légales</p>
          </div>

          <div className="border-l-4 border-primary pl-4">
            <h3 className="font-semibold text-gray-900">🚫 Droit de limitation</h3>
            <p className="text-gray-700">Cesser le traitement de vos données (sauf si légalement obligatoire)</p>
          </div>

          <div className="border-l-4 border-primary pl-4">
            <h3 className="font-semibold text-gray-900">📊 Droit à la portabilité</h3>
            <p className="text-gray-700">Recevoir vos données dans un format standard et transférable</p>
          </div>

          <div className="border-l-4 border-primary pl-4">
            <h3 className="font-semibold text-gray-900">🚫 Droit d'opposition</h3>
            <p className="text-gray-700">Vous opposer au traitement pour intérêt légitime ou marketing</p>
          </div>

          <div className="border-l-4 border-primary pl-4">
            <h3 className="font-semibold text-gray-900">⚖️ Droit à la décision non-automatisée</h3>
            <p className="text-gray-700">Ne pas être soumis à un traitement automatisé sans intervention humaine</p>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Durée de conservation des données</h2>
        
        <div className="space-y-3 text-gray-700">
          <p><strong>Compte actif :</strong> Pendant la durée de votre abonnement + 30 jours après résiliation</p>
          <p><strong>Facturation/IVA :</strong> 10 ans civiles (obligation légale portugaise - Art. 123.º n.º 4 CIRC)</p>
          <p><strong>Données clients :</strong> Selon votre utilisation (vous pouvez les supprimer à tout moment)</p>
          <p><strong>Logs techniques :</strong> 90 jours maximum</p>
          <p><strong>Cookies :</strong> 1 an (résiliables à tout moment)</p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Sécurité des données</h2>
        
        <p className="text-gray-700 mb-4">Nous implémentons les mesures techniques suivantes :</p>
        
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>✓ Chiffrement SSL/TLS de tous les données en transit</li>
          <li>✓ Hachage des mots de passe avec bcryptjs</li>
          <li>✓ Infrastructure cloud sécurisée basée en UE</li>
          <li>✓ Pare-feu et détection des intrusions</li>
          <li>✓ Sauvegardes régulières et testées</li>
          <li>✓ Audit de sécurité régulier</li>
        </ul>

        <p className="text-gray-700 mt-4 text-sm bg-yellow-50 p-3 rounded-lg">
          <strong>Note :</strong> Vous êtes responsable de la sécurité de votre mot de passe et de l'accès à votre compte.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Cookies et technologies similaires</h2>
        
        <p className="text-gray-700 mb-4">Voir notre <a href="/legal/cookies" className="text-primary hover:underline">Politique Cookies</a> complète.</p>
        
        <p className="text-gray-700">
          Nous utilisons des cookies pour la session utilisateur, les préférences et l'analyse (toujours avec consentement).
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Questions ou inquiétudes ?</h2>
        
        <div className="bg-blue-50 p-4 rounded-lg space-y-2 text-gray-700">
          <p><strong>Contactez notre DPO (Délégué à la Protection des Données) :</strong></p>
          <p>Email : dpo@groomly.pt</p>
          <p><strong>Ou contactez directement :</strong></p>
          <p>contact@groomly.pt</p>
          <p className="mt-4"><strong>Autorité de contrôle portugaise :</strong></p>
          <p>CNPD (Comissão Nacional de Proteção de Dados)<br/>
          https://www.cnpd.pt<br/>
          +351 213928400</p>
        </div>
      </section>

      <section className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-sm text-gray-700">
          Cette politique de confidentialité s'applique au 5 février 2026 et sera mise à jour en cas de changement légal ou de modification de nos pratiques.
        </p>
      </section>
    </article>
  )
}
