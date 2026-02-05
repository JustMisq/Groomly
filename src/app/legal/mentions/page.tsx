export default function MentionsPage() {
  return (
    <article className="bg-white rounded-lg p-8 shadow-sm">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Mentions Légales</h1>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Identification de l'éditeur</h2>
        
        <div className="bg-gray-50 p-6 rounded-lg space-y-3 text-gray-700">
          <p><strong>Dénomination sociale :</strong> Groomly Portugal, Lda.</p>
          <p><strong>Siège social :</strong> [À compléter - Lisbonne/Portugal]</p>
          <p className="text-sm text-gray-600">Adresse complète requise lors de l'enregistrement de la société</p>
          <p><strong>NIF (Número de Identificação Fiscal) :</strong> [À compléter par l'utilisateur lors de la création du compte]</p>
          <p><strong>Capital social :</strong> [À compléter]</p>
          <p><strong>Registre commercial :</strong> [À compléter à la DGAE - Direção-Geral das Atividades Económicas]</p>
          <p><strong>Directeur de publication :</strong> [À définir]</p>
          <p><strong>Autorité fiscale :</strong> Autoridade Tributária e Aduaneira (AT)</p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Hébergement et infrastructure</h2>
        
        <p className="text-gray-700 mb-4">
          Ce site est hébergé et opéré selon les normes de sécurité et conformité suivantes :
        </p>
        
        <div className="bg-gray-50 p-4 rounded-lg mb-4 text-sm text-gray-700 space-y-2">
          <p><strong>Hébergeur :</strong> AWS EMEA (Amazon Web Services Europe)</p>
          <p><strong>Localisation :</strong> Luxembourg (Union Européenne)</p>
          <p><strong>Conformité :</strong> AWS Data Processing Agreement (DPA) inclus</p>
        </div>
        
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>Infrastructure cloud sécurisée basée en Union Européenne</li>
          <li>Conformité avec RGPD (Règlement Général sur la Protection des Données)</li>
          <li>Conformité avec la LPDP (Lei da Proteção de Dados Pessoais) portugaise</li>
          <li>Certificats SSL/TLS pour le chiffrement des données en transit</li>
          <li>Sauvegarde régulière des données (multi-région EU)</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Propriété intellectuelle</h2>
        
        <p className="text-gray-700 mb-4">
          Tous les contenus, textes, images, logos et éléments du site Groomly sont la propriété exclusive de Groomly Portugal ou sont utilisés avec autorisation. 
          Leur reproduction, modification ou réutilisation sans autorisation expresse est interdite.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Limitation de responsabilité</h2>
        
        <p className="text-gray-700 mb-4">
          Groomly Portugal ne pourra être tenue responsable de :
        </p>
        
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>Des données incorrectes ou imprécises fournies par l'utilisateur</li>
          <li>Des pertes de données dues à des défaillances informatiques indépendantes de notre volonté</li>
          <li>Des interruptions de service causées par des tiers (fournisseurs, opérateurs télécom)</li>
          <li>Des dommages indirects ou consécutifs à l'utilisation du service</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Frais de service et TVA</h2>
        
        <div className="bg-blue-50 p-6 rounded-lg space-y-3 text-gray-700">
          <p><strong>Tarification HT (Professionnels) :</strong></p>
          <ul className="list-disc list-inside ml-4 mb-3">
            <li>15€/mois HT (18,45€ TTC pour les consommateurs)</li>
            <li>150€/an HT (184,50€ TTC pour les consommateurs)</li>
          </ul>
          <p><strong>TVA (IVA) portugaise :</strong> 23% (taux normal applicable aux services numériques en Portugal)</p>
          <p><strong>Conditions de paiement :</strong> À réception de facture - net 30 jours par défaut</p>
          <p><strong>Droit d'annulation :</strong> 14 jours pour les consommateurs finaux uniquement (Código do Consumidor)</p>
          <p><strong>Professionnels :</strong> Pas de droit d'annulation - conditions commerciales standard</p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Droit applicable et juridiction</h2>
        
        <p className="text-gray-700">
          Ces mentions légales, ainsi que les conditions d'utilisation et la politique de confidentialité, 
          sont régies par la loi portugaise. Tout litige sera soumis à la juridiction compétente au Portugal.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Conformité légale</h2>
        
        <p className="text-gray-700 mb-4">Groomly Portugal respecte les dispositions légales suivantes :</p>
        
        <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
          <li><strong>Lei de Protecção de Dados Pessoais (LPDP) :</strong> Loi 58/2019</li>
          <li><strong>RGPD (Règlement UE 2016/679) :</strong> Applicable en tant que service UE</li>
          <li><strong>Código do Consumidor :</strong> Droit du consommateur portugais</li>
          <li><strong>CNPD (Comissão Nacional de Proteção de Dados) :</strong> Autorité de contrôle portugaise</li>
          <li><strong>IVA - Decreto-Lei 21/1998 :</strong> Régime de TVA portugaise</li>
          <li><strong>CIRC (Código do Imposto sobre o Rendimento de Pessoas Coletivas) :</strong> Art. 123.º n.º 4</li>
        </ul>

        <p className="text-gray-700 text-sm bg-yellow-50 p-4 rounded-lg mb-4">
          <strong>Note :</strong> Les utilisateurs professionnels (toiletteurs) doivent enregistrer leur activité auprès des autorités fiscales portugaises.
          Groomly ne se substitue pas aux obligations légales et fiscales individuelles.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Livro de Reclamações Eletrónico</h2>
        
        <p className="text-gray-700 mb-4">
          En cas de litige ou de réclamation concernant le service fourni, les consommateurs au Portugal ont le droit de saisir le Livro de Reclamações Eletrónico :
        </p>
        
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <p className="text-gray-700">
            <strong>Livro de Reclamações Eletrónico :</strong> <a href="https://www.livroreclamacoes.pt" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">www.livroreclamacoes.pt</a>
          </p>
          <p className="text-sm text-gray-600 mt-2">Plateforme officielle de réclamation des consommateurs en Portugal</p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact et signalements</h2>
        
        <div className="bg-gray-50 p-6 rounded-lg space-y-3 text-gray-700">
          <p><strong>Email :</strong> contact@groomly.pt</p>
          <p><strong>Support :</strong> support@groomly.pt</p>
          <p><strong>Plaintes données :</strong> dpo@groomly.pt</p>
          <p><strong>Autorité de contrôle :</strong> CNPD (Comissão Nacional de Proteção de Dados) - https://www.cnpd.pt</p>
        </div>
      </section>

      <section className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-gray-700">
          <strong>Dernière mise à jour :</strong> 5 février 2026<br/>
          <strong>Prochaine révision :</strong> février 2027 (ou suite à changement légal)
        </p>
      </section>
    </article>
  )
}
