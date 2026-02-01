# Configuration Stripe - Guide Complet

## ✅ Étape 1 : Créer un compte Stripe (FAIT)
- [x] Accédez à https://dashboard.stripe.com
- [x] Créez votre compte et activez le mode test
- [x] Créez deux produits :
  - **Monthly**: €15/mois (price_1SvnnRHL3SUhHs4bIEb5QuxA)
  - **Yearly**: €150/an (price_1SvnlIHL3SUhHs4bHx5bJwKc)

## ✅ Étape 2 : Ajouter les variables d'environnement (FAIT)

Vous avez ajouté dans `.env.local` :

```env
STRIPE_PUBLISHABLE_KEY=pk_test_51Svng8HL3SUhHs4b...
STRIPE_SECRET_KEY=sk_test_51Svng8HL3SUhHs4b...
STRIPE_PRICE_ID_MONTHLY=price_1SvnnRHL3SUhHs4bIEb5QuxA
STRIPE_PRICE_ID_YEARLY=price_1SvnlIHL3SUhHs4bHx5bJwKc

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51Svng8HL3SUhHs4b...
NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY=price_1SvnnRHL3SUhHs4bIEb5QuxA
NEXT_PUBLIC_STRIPE_PRICE_ID_YEARLY=price_1SvnlIHL3SUhHs4bHx5bJwKc
```

## ⏳ Étape 3 : Configurer le Webhook (À FAIRE)

### 3.1 - Trouver votre Webhook Secret

1. Allez dans [Stripe Webhooks](https://dashboard.stripe.com/webhooks)
2. Cliquez sur "Ajouter endpoint"
3. **Entrez l'URL du webhook** :
   - **En développement local** : Utilisez **ngrok** pour exposer votre localhost
     ```bash
     ngrok http 3000
     # Copier l'URL : https://xxxx-xx-xxx-xxx-xx.ngrok.io
     # URL du webhook : https://xxxx-xx-xxx-xxx-xx.ngrok.io/api/webhooks/stripe
     ```
   - **En production** : `https://votre-domaine.com/api/webhooks/stripe`

4. **Sélectionnez les événements** à écouter :
   - `checkout.session.completed`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`

5. Cliquez sur "Ajouter endpoint"
6. Cliquez sur l'endpoint créé
7. Allez à l'onglet "Signing secret"
8. Cliquez sur "Révéler" et copiez le secret

### 3.2 - Ajouter le secret à `.env.local`

```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

## 🧪 Étape 4 : Tester localement

### Option A : Avec ngrok (Recommandé)

```bash
# Terminal 1 : Démarrer ngrok
ngrok http 3000

# Terminal 2 : Démarrer le serveur Next.js
npm run dev
```

### Option B : Avec Stripe CLI (Alternative)

1. Installez Stripe CLI : https://stripe.com/docs/stripe-cli
2. Connectez-vous à Stripe :
   ```bash
   stripe login
   ```
3. Écoutez les webhooks :
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
4. Copiez le webhook signing secret et ajoutez-le à `.env.local` :
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_xxxxx
   ```

## 📝 Points Importants

### Sécurité
- ✅ Le `STRIPE_SECRET_KEY` ne doit JAMAIS être visible au client
- ✅ Le `STRIPE_WEBHOOK_SECRET` doit rester secret
- ✅ Les variables `NEXT_PUBLIC_*` seront exposées au client (c'est normal)
- ✅ Vérifiez toujours la signature du webhook côté serveur

### Modes de test
- **Mode Test** : Utilisez les cartes de test Stripe
  - Carte valide : `4242 4242 4242 4242`
  - Toute date future et n'importe quel CVC
- **Mode Live** : À utiliser en production avec de vrais clients

### Flux de paiement
1. L'utilisateur clique sur "S'abonner"
2. `/api/checkout` crée une session Stripe
3. L'utilisateur est redirigé vers le formulaire de paiement Stripe
4. Après le paiement, Stripe envoie un webhook
5. `/api/webhooks/stripe` traite le webhook et crée l'abonnement en base de données
6. L'utilisateur est redirigé vers la page de succès

## 🐛 Débogage

### Vérifier les logs des webhooks Stripe
1. Allez dans [Stripe Dashboard > Developers > Webhooks](https://dashboard.stripe.com/webhooks)
2. Cliquez sur votre endpoint
3. Regardez l'onglet "Events" pour voir les tentatives

### Vérifier les logs locaux
```bash
# Recherchez les logs dans le terminal Next.js
npm run dev
# Vous verrez "Subscription created for user..." ou les erreurs
```

### Erreurs courantes
- **"STRIPE_WEBHOOK_SECRET not configured"** : Ajoutez la variable à `.env.local`
- **"Webhook signature verification failed"** : Le secret est invalide
- **"No subscription found"** : Vérifiez que le webhook a bien été reçu

## 📦 Étape suivante

Une fois le webhook configuré :
1. Testez le flow complet de paiement
2. Vérifiez que les abonnements sont créés en base de données
3. Configurez PostgreSQL (voir DATABASE_SETUP.md)
4. Lancez en production !

## Utiles
- [Stripe Docs - Webhooks](https://stripe.com/docs/webhooks)
- [Stripe Docs - Checkout Sessions](https://stripe.com/docs/payments/checkout)
- [Stripe Testing Cards](https://stripe.com/docs/testing)
