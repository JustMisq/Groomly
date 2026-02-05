export default function TermsPage() {
  return (
    <article className="bg-white rounded-lg p-8 shadow-sm">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Conditions d'Utilisation</h1>

      <div className="bg-blue-50 p-4 rounded-lg mb-8 border border-blue-200">
        <p className="text-sm text-gray-700">
          <strong>Dernière mise à jour :</strong> 5 février 2026<br/>
          Ces conditions d'utilisation régissent l'accès et l'utilisation de la plateforme Groomly. 
          En utilisant Groomly, vous acceptez ces conditions.
        </p>
      </div>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Définitions</h2>
        
        <div className="space-y-2 text-gray-700">
          <p><strong>"Service" :</strong> La plateforme Groomly et ses fonctionnalités</p>
          <p><strong>"Utilisateur" :</strong> Vous, la personne physique utilisant le Service</p>
          <p><strong>"Contenu" :</strong> Tous les données, informations saisies par l'Utilisateur</p>
          <p><strong>"Groomly Portugal" :</strong> L'entité exploitant la plateforme</p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Accès et compte utilisateur</h2>
        
        <h3 className="text-lg font-semibold text-gray-800 mb-3">2.1 Créer un compte</h3>
        <p className="text-gray-700 mb-3">
          Pour utiliser Groomly, vous devez :
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
          <li>Être âgé d'au moins 18 ans</li>
          <li>Fournir des informations exactes et complètes</li>
          <li>Accepter ces conditions</li>
          <li>Être autorisé par la loi à utiliser le Service</li>
        </ul>

        <h3 className="text-lg font-semibold text-gray-800 mb-3">2.2 Responsabilité de votre compte</h3>
        <p className="text-gray-700">
          Vous êtes responsable de la confidentialité de votre mot de passe et de toute activité effectuée sous votre compte. 
          Vous acceptez de nous notifier immédiatement de tout accès non autorisé.
        </p>

        <h3 className="text-lg font-semibold text-gray-800 mb-3 mt-4">2.3 Résiliation de compte</h3>
        <p className="text-gray-700">
          Vous pouvez résilier votre compte à tout moment. Votre abonnement restera actif jusqu'à la fin de la période de facturation.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Abonnement et paiement</h2>
        
        <h3 className="text-lg font-semibold text-gray-800 mb-3">3.1 Les plans</h3>
        <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-gray-700 mb-4">
          <p><strong>Plan Mensuel :</strong> 15€ HT / 18,45€ TTC (+ 23% IVA)</p>
          <p><strong>Plan Annuel :</strong> 150€ HT / 184,50€ TTC (+ 23% IVA)</p>
          <p className="text-sm"><strong>Note :</strong> Prix nets affichés pour professionnels HT. Consommateurs finaux payènt TTC.</p>
          <p className="text-sm">Les prix peuvent être modifiés avec 30 jours de préavis.</p>
        </div>

        <h3 className="text-lg font-semibold text-gray-800 mb-3">3.2 Renouvellement automatique</h3>
        <p className="text-gray-700 mb-3">
          Votre abonnement se renouvelle automatiquement à la fin de chaque période. 
          Vous pouvez annuler à tout moment via votre compte.
        </p>

        <h3 className="text-lg font-semibold text-gray-800 mb-3">3.3 Paiement</h3>
        <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
          <li>Les paiements s'effectuent via Stripe de manière sécurisée</li>
          <li>Nous conservons vos données de paiement conformément aux normes PCI-DSS</li>
          <li>Les factures sont générées automatiquement après chaque paiement</li>
          <li>Les factures sont conservées 6 ans selon le droit fiscal portugais</li>
        </ul>

        <h3 className="text-lg font-semibold text-gray-800 mb-3">3.4 Droit de rétractation</h3>
        <p className="text-gray-700 mb-4">
          Conformément au Código do Consumidor portugais, vous avez le droit de vous rétracter dans les 14 jours suivant votre achat, 
          sans avoir à justifier votre décision. <strong>Ce droit s'applique uniquement aux particuliers (consommateurs finaux)</strong>.
        </p>
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mb-4 text-sm text-gray-700">
          <p><strong>⚠️ Pour les professionnels :</strong> Les toiletteurs utilisant Groomly pour leur activité professionnelle ne bénéficient pas du droit de rétractation. 
          Les conditions commerciales standard s'appliquent.</p>
        </div>
        <p className="text-gray-700">Contactez contact@groomly.pt pour exercer ce droit (particuliers uniquement).</p>

        <h3 className="text-lg font-semibold text-gray-800 mb-3 mt-4">3.5 Remboursements</h3>
        <p className="text-gray-700">
          Les remboursements sont traités selon les conditions du Código do Consumidor. 
          Après annulation pendant la période de rétractation, le remboursement s'effectue dans 14 jours.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Restrictions et interdictions</h2>
        
        <p className="text-gray-700 mb-4">Vous acceptez de ne pas :</p>
        
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>Utiliser le Service de manière illégale ou contraire à la loi portugaise</li>
          <li>Partager votre compte avec des tiers</li>
          <li>Accéder aux données de manière non autorisée (hacking, reverse engineering)</li>
          <li>Diffuser du contenu offensant, discriminatoire ou contraire à l'éthique</li>
          <li>Utiliser le Service de manière excessive ou abusive</li>
          <li>Transférer votre compte sans consentement écrit</li>
          <li>Contourner les limitations techniques du Service</li>
          <li>Exploiter des vulnérabilités (divulguer responsablement à security@groomly.pt)</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Propriété du contenu</h2>
        
        <h3 className="text-lg font-semibold text-gray-800 mb-3">5.1 Contenu Groomly</h3>
        <p className="text-gray-700 mb-4">
          Tous les logos, textes, interfaces, graphiques et codes de Groomly sont la propriété exclusive de Groomly Portugal 
          ou de ses partenaires autorisés. Vous n'avez pas le droit de les reproduire ou modifier.
        </p>

        <h3 className="text-lg font-semibold text-gray-800 mb-3">5.2 Votre contenu</h3>
        <p className="text-gray-700 mb-4">
          Vous conservez tous les droits sur le contenu que vous créez (clients, animaux, photos, etc.). 
          En utilisant Groomly, vous nous accordez une licence pour stocker et traiter vos données selon cette politique.
        </p>

        <h3 className="text-lg font-semibold text-gray-800 mb-3">5.3 Données clients</h3>
        <p className="text-gray-700">
          Si vous utilisez Groomly pour gérer les données de clients, vous êtes responsable du traitement de ces données 
          conformément à la LPDP et au RGPD. Groomly est votre sous-traitant.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Limitation de responsabilité</h2>
        
        <h3 className="text-lg font-semibold text-gray-800 mb-3">6.1 Déclaration de non-garantie</h3>
        <p className="text-gray-700 mb-4">
          Le Service est fourni "tel quel", sans garantie d'aucune sorte. Nous ne garantissons pas :
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
          <li>Que le Service fonctionnera sans interruption</li>
          <li>Que le Service ne contiendra pas d'erreurs</li>
          <li>Que les données seront toujours disponibles</li>
          <li>Que les pannes internet de l'utilisateur n'affecteront pas l'accès au Service</li>
        </ul>

        <h3 className="text-lg font-semibold text-gray-800 mb-3">6.2 Qualité de la connexion internet</h3>
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4 text-gray-700">
          <p className="mb-2">
            <strong>L'utilisateur est responsable de :</strong>
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>La qualité de sa connexion internet</li>
            <li>La maintenance de son matériel informatique</li>
            <li>La sécurité de ses identifiants</li>
            <li>La conformité de son système d'exploitation</li>
          </ul>
          <p className="mt-3 text-sm">
            Groomly ne peut être tenu responsable des pannes internet, des problèmes de connectivité ou des équipements de l'utilisateur.
          </p>
        </div>

        <h3 className="text-lg font-semibold text-gray-800 mb-3">6.3 Limitations de dommages</h3>
        <p className="text-gray-700 mb-4">
          Sauf si interdit par la loi, Groomly Portugal ne sera pas responsable de :
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>Dommages indirects, incidents ou consécutifs</li>
          <li>Pertes de profits ou de revenus</li>
          <li>Pertes de données dues à vos actions</li>
          <li>Dommages causés par des tiers ou des contretemps externes</li>
        </ul>

        <p className="text-gray-700 mt-4">
          Notre responsabilité est limitée au montant de votre dernier paiement réel à Groomly.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Force Majeure</h2>
        
        <p className="text-gray-700 mb-4">
          Groomly ne sera pas responsable de tout manquement ou délai dans l'exécution de ses obligations si cela résulte d'un événement indépendant de sa volonté, incluant :
        </p>
        
        <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
          <li>Cataclysmes naturels (tremblements de terre, inondations, tempetes)</li>
          <li>Créises sanitaires (pandémies, épidémies)</li>
          <li>Conflits armés ou attaques terroristes</li>
          <li>Décisions gouvernementales ou restrictions légales</li>
          <li>Pannes d'infrastructure dépassant notre contrôle (FAI, prestataires externes)</li>
          <li>Attaques cybernétiques massives indéfendables</li>
        </ul>
        
        <p className="text-gray-700">
          En cas de force majeure, Groomly fera les efforts raisonnables pour minimiser l'impact et notifiera les utilisateurs.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Droit d'utilisation du Service</h2>
        
        <p className="text-gray-700 mb-4">Groomly se réserve le droit de :</p>
        
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>Suspendre ou terminer votre accès en cas de violation de ces conditions</li>
          <li>Modifier le Service (avec préavis de 30 jours si c'est significatif)</li>
          <li>Ajuster la tarification (avec 30 jours de préavis)</li>
          <li>Interrompre le Service temporairement pour maintenance</li>
          <li>Refuser l'accès à certains utilisateurs</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Protection du consommateur</h2>
        
        <p className="text-gray-700 mb-4">
          Ces conditions sont régies par le <strong>Código do Consumidor portugais</strong> et les lois de protection des consommateurs.
        </p>

        <h3 className="text-lg font-semibold text-gray-800 mb-3">9.1 Droits du consommateur</h3>
        <p className="text-gray-700">
          Si vous être un consommateur, <strong>vous bénéficiez de droits non renonçables</strong>, notamment :
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
          <li>Droit de rétractation (14 jours)</li>
          <li>Protection contre les clauses abusives</li>
          <li>Droit à l'information claire</li>
          <li>Droit à la résolution de litiges</li>
        </ul>

        <h3 className="text-lg font-semibold text-gray-800 mb-3">9.2 Résolution de litiges</h3>
        <p className="text-gray-700 mb-3">
          En cas de litige, nous vous invitons à nous contacter pour trouver une solution amiable.
        </p>

        <div className="bg-blue-50 p-4 rounded-lg text-gray-700">
          <p><strong>Email :</strong> contact@groomly.pt</p>
          <p className="mt-2">
            Si le litige persiste, vous pouvez saisir les juridictions compétentes au Portugal ou utiliser la 
            plateforme de résolution des litiges en ligne de l'UE : https://ec.europa.eu/consumers/odr
          </p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Conformité légale</h2>
        
        <p className="text-gray-700">
          Ces conditions d'utilisation sont conformes à :
        </p>
        
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>Código do Consumidor (Protection du Consommateur)</li>
          <li>Lei de Protecção de Dados Pessoais (LPDP)</li>
          <li>RGPD (Règlement UE 2016/679)</li>
          <li>Lei das Telecomunicações Electrónicas (Directiva Cookies UE)</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Modifications des conditions</h2>
        
        <p className="text-gray-700">
          Groomly peut modifier ces conditions à tout moment. Les modifications significatives seront annoncées 
          avec au minimum 30 jours de préavis par email. Votre utilisation continue du Service signifie votre acceptation.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Droit applicable et juridiction</h2>
        
        <p className="text-gray-700 mb-4">
          Ces conditions d'utilisation sont régies par la <strong>loi portugaise</strong>.
        </p>

        <p className="text-gray-700">
          Tout litige découlant ou en rapport avec ces conditions sera soumis à la juridiction compétente au Portugal.
        </p>

        <div className="bg-yellow-50 p-4 rounded-lg mt-4 text-gray-700 border border-yellow-200">
          <p className="text-sm">
            <strong>Exception :</strong> Si vous êtes un consommateur au Portugal, vous pouvez saisir le tribunal civil 
            ou la juridiction compétente selon le droit portugais.
          </p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Contact</h2>
        
        <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-gray-700">
          <p><strong>Questions sur ces conditions ?</strong></p>
          <p>Email : contact@groomly.pt</p>
          <p>Support : support@groomly.pt</p>
          <p className="text-sm mt-4">Nous répondrons à votre requête dans les 10 jours ouvrables.</p>
        </div>
      </section>

      <section className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-sm text-gray-700">
          <strong>Dernière mise à jour :</strong> 5 février 2026<br/>
          <strong>Entrée en vigueur :</strong> 5 février 2026
        </p>
      </section>
    </article>
  )
}
