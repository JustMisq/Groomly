export default function CookiesPage() {
  return (
    <article className="bg-white rounded-lg p-8 shadow-sm">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Politique Cookies</h1>

      <div className="bg-blue-50 p-4 rounded-lg mb-8 border border-blue-200">
        <p className="text-sm text-gray-700">
          <strong>Dernière mise à jour :</strong> 5 février 2026<br/>
          Cette politique explique comment Groomly utilise les cookies et autres technologies de suivi, 
          en conformité avec la Directive Cookies UE et la loi portugaise.
        </p>
      </div>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Qu'est-ce qu'un cookie ?</h2>
        
        <p className="text-gray-700 mb-4">
          Un cookie est un petit fichier texte stocké sur votre appareil (ordinateur, téléphone, tablette) 
          quand vous visitez un site web. Il permet à Groomly de :
        </p>
        
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>Vous reconnaître lors de votre prochaine visite</li>
          <li>Mémoriser vos préférences</li>
          <li>Améliorer votre expérience</li>
          <li>Comprendre comment vous utilisez le service</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Types de cookies utilisés</h2>
        
        <h3 className="text-lg font-semibold text-gray-800 mb-4">2.1 Cookies essentiels (Sans consentement)</h3>
        <div className="bg-green-50 p-4 rounded-lg mb-4 border border-green-200">
          <p className="text-gray-700 mb-3">
            <strong>✓ Ces cookies sont NÉCESSAIRES pour que Groomly fonctionne</strong>
          </p>
          
          <div className="space-y-3 text-sm text-gray-700">
            <div>
              <p className="font-semibold">NEXT.JS Session (next-auth.session-token)</p>
              <p>Maintient votre session connectée</p>
              <p className="text-xs text-gray-600">Durée : Jusqu'à la fermeture du navigateur</p>
            </div>

            <div>
              <p className="font-semibold">CSRF Protection (_XSRF-TOKEN)</p>
              <p>Sécurité contre les attaques CSRF</p>
              <p className="text-xs text-gray-600">Durée : Durée de session</p>
            </div>

            <div>
              <p className="font-semibold">Préférences UI (groomly-theme, groomly-lang)</p>
              <p>Sauvegarde votre thème (clair/sombre) et langue</p>
              <p className="text-xs text-gray-600">Durée : 1 an</p>
            </div>
          </div>

          <p className="text-xs text-gray-600 mt-3">
            ℹ️ Ces cookies n'nécessitent pas de consentement selon la Directive Cookies UE
          </p>
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">2.1b Cookies de Sécurité Essentiels (Sans consentement)</h3>
        <div className="bg-green-50 p-4 rounded-lg mb-4 border border-green-200">
          <p className="text-gray-700 mb-3">
            <strong>🔐 Ces cookies assurent la sécurité du Service</strong>
          </p>
          
          <div className="space-y-3 text-sm text-gray-700">
            <div>
              <p className="font-semibold">Stripe Session (stripe_session_id)</p>
              <p>Sécurité des paiements et jetons d'authentification</p>
              <p className="text-xs text-gray-600">Durée : Durée de session | Consentement : ✗ Pas requis (essentiel)</p>
            </div>

            <div>
              <p className="font-semibold">Cloudflare Protection (__cfruid, __cf_bm)</p>
              <p>Sécurité contre les attaques DDoS et détection des bots</p>
              <p className="text-xs text-gray-600">Durée : Session / 30 minutes | Consentement : ✗ Pas requis (essentiel)</p>
            </div>
          </div>

          <p className="text-xs text-gray-600 mt-3">
            ℹ️ Ces cookies de sécurité sont exemptés de consentement par les autorités de protection des données (CNPD, CNIL)
          </p>
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">2.2 Cookies analytiques (Consentement requis)</h3>
        <div className="bg-blue-50 p-4 rounded-lg mb-4 border border-blue-200">
          <p className="text-gray-700 mb-3">
            <strong>❓ Ces cookies nous aident à comprendre comment vous utilisez Groomly</strong>
          </p>
          
          <div className="space-y-3 text-sm text-gray-700">
            <div>
              <p className="font-semibold">Google Analytics (optionnel)</p>
              <p>Voir le nombre d'utilisateurs, pages visitées, durée des visites</p>
              <p className="text-xs text-gray-600">Durée : 2 ans | Consentement : ✓ Requis</p>
            </div>

            <div>
              <p className="font-semibold">Logs de visite (Groomly)</p>
              <p>Enregistrement interne des pages consultées pour amélioration du service</p>
              <p className="text-xs text-gray-600">Durée : 90 jours | Consentement : ✓ Requis</p>
            </div>
          </div>

          <p className="text-xs text-gray-600 mt-3">
            ℹ️ Vous pouvez refuser ces cookies - Groomly fonctionnera normalement
          </p>
        </div>

        <h3 className="text-lg font-semibold text-gray-800 mb-4">2.3 Cookies marketing (Consentement requis)</h3>
        <div className="bg-purple-50 p-4 rounded-lg mb-4 border border-purple-200">
          <p className="text-gray-700 mb-3">
            <strong>📢 Ces cookies permettent les communications marketing</strong>
          </p>
          
          <div className="space-y-3 text-sm text-gray-700">
            <div>
              <p className="font-semibold">Cookies marketing universels</p>
              <p>Suivi de campagnes publicitaires et newsletters</p>
              <p className="text-xs text-gray-600">Durée : 1 an | Consentement : ✓ Requis</p>
            </div>
          </div>

          <p className="text-xs text-gray-600 mt-3">
            ℹ️ Vous pouvez vous désinscrire des emails à tout moment (lien "Se désinscrire" en bas de chaque email)
          </p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Consentement et choix</h2>
        
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Comment gérer les cookies ?</h3>
        
        <div className="space-y-4 mb-4">
          <div className="border-l-4 border-primary pl-4">
            <h4 className="font-semibold text-gray-900 mb-2">🍪 Au premier visiteur : Banneau de consentement</h4>
            <p className="text-gray-700 text-sm">
              Un banneau s'affichera demandant votre consentement pour les cookies non-essentiels
            </p>
          </div>

          <div className="border-l-4 border-primary pl-4">
            <h4 className="font-semibold text-gray-900 mb-2">⚙️ Dans Paramètres : Gérer les préférences</h4>
            <p className="text-gray-700 text-sm">
              Paramètres → Cookies → Choisir quels types accepter
            </p>
          </div>

          <div className="border-l-4 border-primary pl-4">
            <h4 className="font-semibold text-gray-900 mb-2">🌐 Dans votre navigateur : Contrôle global</h4>
            <p className="text-gray-700 text-sm">
              Chrome, Firefox, Safari, Edge permettent de bloquer tous les cookies
            </p>
          </div>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <p className="text-sm text-gray-700 mb-2">
            <strong>⚠️ Attention :</strong> Si vous bloquez tous les cookies essentiels, Groomly ne fonctionnera pas correctement.
          </p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Cookies tiers (partenaires)</h2>
        
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Prestataires utilisant des cookies :</h3>
        
        <div className="space-y-4">
          <div className="border-l-4 border-green-500 pl-4">
            <h4 className="font-semibold text-gray-900">💳 Stripe (Paiements)</h4>
            <p className="text-gray-700 text-sm mb-2">
              Stripe place des cookies pour la sécurité des paiements et la prévention de la fraude
            </p>
            <p className="text-xs text-green-700 font-semibold mb-1">✓ Cookie essentiel - Pas de consentement requis</p>
            <p className="text-gray-700 text-xs"><a href="https://stripe.com/cookie-policy" className="text-primary hover:underline">Politique Cookies Stripe</a></p>
          </div>

          <div className="border-l-4 border-blue-500 pl-4">
            <h4 className="font-semibold text-gray-900">📊 Google Analytics</h4>
            <p className="text-gray-700 text-sm mb-2">
              Utilisé optionnellement pour l'analyse des visites (analytique)
            </p>
            <p className="text-xs text-blue-700 font-semibold mb-1">⚠️ Cookie analytique - Consentement requis</p>
            <p className="text-gray-700 text-xs"><a href="https://policies.google.com/privacy" className="text-primary hover:underline">Politique Cookies Google</a></p>
          </div>

          <div className="border-l-4 border-green-500 pl-4">
            <h4 className="font-semibold text-gray-900">🔐 Cloudflare (CDN/Sécurité)</h4>
            <p className="text-gray-700 text-sm mb-2">
              Assure la sécurité, la performance et la protection contre les attaques DDoS
            </p>
            <p className="text-xs text-green-700 font-semibold mb-1">✓ Cookie essentiel - Pas de consentement requis</p>
            <p className="text-gray-700 text-xs"><a href="https://www.cloudflare.com/cookie-policy/" className="text-primary hover:underline">Politique Cookies Cloudflare</a></p>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Durée de conservation</h2>
        
        <table className="w-full border-collapse mb-4">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-200 p-3 text-left font-semibold">Nom du Cookie</th>
              <th className="border border-gray-200 p-3 text-left font-semibold">Type</th>
              <th className="border border-gray-200 p-3 text-left font-semibold">Durée</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            <tr>
              <td className="border border-gray-200 p-3">next-auth.session-token</td>
              <td className="border border-gray-200 p-3">Essentiel</td>
              <td className="border border-gray-200 p-3">Fin de session</td>
            </tr>
            <tr className="bg-gray-50">
              <td className="border border-gray-200 p-3">_XSRF-TOKEN</td>
              <td className="border border-gray-200 p-3">Essentiel</td>
              <td className="border border-gray-200 p-3">Fin de session</td>
            </tr>
            <tr>
              <td className="border border-gray-200 p-3">groomly-theme</td>
              <td className="border border-gray-200 p-3">Préférence</td>
              <td className="border border-gray-200 p-3">1 an</td>
            </tr>
            <tr className="bg-gray-50">
              <td className="border border-gray-200 p-3">_ga, _gid (Analytics)</td>
              <td className="border border-gray-200 p-3">Analytique</td>
              <td className="border border-gray-200 p-3">2 ans</td>
            </tr>
            <tr>
              <td className="border border-gray-200 p-3">groomly-consent</td>
              <td className="border border-gray-200 p-3">Consentement</td>
              <td className="border border-gray-200 p-3">1 an</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Vos droits relatifs aux cookies</h2>
        
        <div className="space-y-3 text-gray-700">
          <p className="flex gap-3">
            <span className="text-xl">🗑️</span>
            <span><strong>Supprimer les cookies :</strong> Vous pouvez les supprimer à tout moment dans votre navigateur</span>
          </p>
          
          <p className="flex gap-3">
            <span className="text-xl">🚫</span>
            <span><strong>Bloquer les cookies :</strong> Paramètres du navigateur ou banneau de consentement Groomly</span>
          </p>
          
          <p className="flex gap-3">
            <span className="text-xl">🔍</span>
            <span><strong>Voir les cookies :</strong> Outils de développement du navigateur (F12) → Application → Cookies</span>
          </p>
          
          <p className="flex gap-3">
            <span className="text-xl">❌</span>
            <span><strong>Do Not Track :</strong> Groomly respecte le signal DNT si vous l'activez</span>
          </p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Comment supprimer les cookies ?</h2>
        
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Par navigateur :</h3>
        
        <div className="space-y-4">
          <div>
            <p className="font-semibold text-gray-900">🔵 Google Chrome</p>
            <ol className="list-decimal list-inside text-sm text-gray-700 mt-2 ml-2">
              <li>Paramètres → Confidentialité et sécurité → Cookies</li>
              <li>Sélectionnez les cookies à supprimer</li>
              <li>Cliquez "Supprimer"</li>
            </ol>
          </div>

          <div>
            <p className="font-semibold text-gray-900">🦊 Mozilla Firefox</p>
            <ol className="list-decimal list-inside text-sm text-gray-700 mt-2 ml-2">
              <li>Paramètres → Vie privée → Cookies et données de sites</li>
              <li>Cliquez "Gérer les données"</li>
              <li>Sélectionnez et supprimez</li>
            </ol>
          </div>

          <div>
            <p className="font-semibold text-gray-900">🍎 Safari</p>
            <ol className="list-decimal list-inside text-sm text-gray-700 mt-2 ml-2">
              <li>Safari → Préférences → Confidentialité</li>
              <li>Cliquez "Gérer les données de sites"</li>
              <li>Sélectionnez et supprimez</li>
            </ol>
          </div>

          <div>
            <p className="font-semibold text-gray-900">🔷 Microsoft Edge</p>
            <ol className="list-decimal list-inside text-sm text-gray-700 mt-2 ml-2">
              <li>Paramètres → Confidentialité → Cookies</li>
              <li>Gérer les cookies</li>
              <li>Supprimez ceux de groomly.pt</li>
            </ol>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Conformité légale</h2>
        
        <p className="text-gray-700 mb-4">
          La politique Cookies de Groomly respecte :
        </p>
        
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li><strong>Directive Cookies UE (2002/58/CE)</strong></li>
          <li><strong>Règlement RGPD (UE 2016/679)</strong></li>
          <li><strong>Lei da Proteção de Dados Pessoais (LPDP) - Lei 58/2019</strong></li>
          <li><strong>Lei das Telecomunicações Eletrónicas (Portugal)</strong></li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Questions sur les cookies ?</h2>
        
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 space-y-2 text-gray-700">
          <p><strong>📧 Contactez :</strong> dpo@groomly.pt</p>
          <p><strong>💬 Support :</strong> support@groomly.pt</p>
          <p className="text-sm mt-3">
            Nous répondrons à vos questions sur les cookies et la gestion de la confidentialité dans les 10 jours.
          </p>
        </div>
      </section>

      <section className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-sm text-gray-700">
          <strong>Dernière mise à jour :</strong> 5 février 2026<br/>
          <strong>Prochaine révision :</strong> février 2027 ou suite à changement technologique
        </p>
      </section>
    </article>
  )
}
