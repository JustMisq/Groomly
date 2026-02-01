# 📋 Checklist - Stripe Integration Complète

## ✅ Phase 1 : Configuration Stripe (COMPLÉTÉE)

### Compte Stripe
- [x] Compte Stripe créé
- [x] Mode test activé
- [x] Clés API obtenues

### Produits & Prix
- [x] Produit "Abonnement Mensuel" créé (€15/mois)
  - Price ID: `price_1SvnnRHL3SUhHs4bIEb5QuxA`
- [x] Produit "Abonnement Annuel" créé (€150/an)
  - Price ID: `price_1SvnlIHL3SUhHs4bHx5bJwKc`

### Variables d'environnement
- [x] `.env.local` configuré avec :
  - `STRIPE_PUBLISHABLE_KEY`
  - `STRIPE_SECRET_KEY`
  - `STRIPE_PRICE_ID_MONTHLY`
  - `STRIPE_PRICE_ID_YEARLY`
  - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
  - `NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY`
  - `NEXT_PUBLIC_STRIPE_PRICE_ID_YEARLY`

## ⏳ Phase 2 : Implémentation (EN COURS)

### Backend
- [x] API Route créée : `/api/checkout`
  - Crée une Stripe Checkout Session
  - Valide le priceId
  - Retourne l'URL Stripe
  
- [x] API Route créée : `/api/webhooks/stripe`
  - Vérifie la signature du webhook
  - Traite `checkout.session.completed`
  - Traite `customer.subscription.deleted`
  - Traite `invoice.payment_succeeded`
  - Crée/met à jour les abonnements en BDD

### Frontend
- [x] Page d'abonnement mise à jour : `/dashboard/subscription`
  - Affiche deux plans (mensuel/annuel)
  - Boutons de paiement fonctionnels
  - Notifications toast
  - Messages de succès/annulation

### Base de données
- [x] Schéma Subscription prêt dans Prisma
  - Champs: userId, plan, price, status, stripeCustomerId, stripeSubscriptionId
  - Relations: User → Subscription

## 🚀 Phase 3 : Configuration Webhook (À FAIRE)

### Étapes à suivre :

**3.1 Installer ngrok (développement local)**
```bash
# https://ngrok.com/download
# Télécharger et installer
```

**3.2 Configurer le webhook Stripe**
1. Allez à https://dashboard.stripe.com/webhooks
2. Cliquez "Ajouter endpoint"
3. URL : `https://<votre-ngrok-url>/api/webhooks/stripe`
4. Événements : ✓ checkout.session.completed, ✓ customer.subscription.deleted, ✓ invoice.payment_succeeded
5. Copiez le Webhook Secret

**3.3 Ajouter la clé secrète**
```env
# .env.local
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxx
```

**3.4 Tester localement**
```bash
# Terminal 1
ngrok http 3000

# Terminal 2
npm run dev
```

## 🧪 Phase 4 : Test (À FAIRE)

### Tests manuels à effectuer :
- [ ] Naviguer jusqu'à `/dashboard/subscription` en étant connecté
- [ ] Cliquer sur "S'abonner" (mensuel)
- [ ] Remplir le formulaire de paiement Stripe
- [ ] Utiliser la carte test : `4242 4242 4242 4242`
- [ ] Vérifier le webhook dans Stripe Dashboard
- [ ] Vérifier l'abonnement créé en BDD (Prisma Studio)
- [ ] Tester l'abonnement annuel
- [ ] Tester l'annulation d'abonnement

### Vérifications :
- [ ] Pas d'erreurs TypeScript : `npm run lint`
- [ ] Build réussi : `npm run build`
- [ ] Dev server fonctionne : `npm run dev`
- [ ] Les logs webhook s'affichent dans le terminal

## 📊 Phase 5 : Production (À FAIRE)

### Avant le déploiement :
- [ ] PostgreSQL configuré (voir DATABASE_SETUP.md)
- [ ] Webhook configuré avec domaine de production
- [ ] Mode Stripe activé (clés live, pas test)
- [ ] NEXTAUTH_SECRET défini en production
- [ ] Variables d'environnement en production

### Déploiement :
- [ ] Déployer sur Vercel
- [ ] Configurer PostgreSQL en production (Railway recommandé)
- [ ] Mettre à jour les variables d'environnement
- [ ] Configurer le webhook pour le domaine de production
- [ ] Tester le flow complet en production

## 📚 Fichiers créés/modifiés

### Nouvellement créés :
- ✅ `src/app/api/webhooks/stripe/route.ts` (webhook handler)
- ✅ `STRIPE_SETUP.md` (guide de configuration)
- ✅ `TESTING_GUIDE.md` (guide de test local)

### Modifiés :
- ✅ `src/app/dashboard/subscription/page.tsx` (UI avec boutons)
- ✅ `src/app/api/checkout/route.ts` (endpoint checkout)
- ✅ `.env.local` (variables Stripe)

## 🎯 Prochaines étapes

1. **URGENT** : Configurer le webhook Stripe (voir Phase 3)
2. **IMPORTANT** : Tester localement avec ngrok (voir TESTING_GUIDE.md)
3. **IMPORTANT** : Configurer PostgreSQL (voir DATABASE_SETUP.md)
4. **ALORS** : Tester le flow complet
5. **FINALEMENT** : Déployer en production

## 💡 Tips
- Relisez TESTING_GUIDE.md pour la marche à suivre
- Utilisez Prisma Studio pour vérifier les données : `npm run prisma:studio`
- Consultez les logs Stripe Dashboard pour déboguer les webhooks
- Redémarrez Next.js après modification de `.env.local`

---

**Status Global** : 80% des développements terminés. Il reste l'intégration du webhook et les tests.
