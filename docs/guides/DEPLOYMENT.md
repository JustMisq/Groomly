# 🚀 Déploiement en Production

Guide complet pour déployer Groomly en production sur Vercel.

---

## 📋 Checklist Pré-Déploiement

### Code & Tests
- [ ] Tous les tests passent : `npm run build`
- [ ] Pas d'erreurs TypeScript : `npm run lint`
- [ ] Variables d'env configurées localement
- [ ] Tous les secrets sont dans `.env.local` (jamais committé)
- [ ] `node_modules` et `.env` dans `.gitignore`

### Database
- [ ] PostgreSQL configuré (Railway ou autre)
- [ ] Migrations exécutées avec succès
- [ ] Tables créées et vérifiées
- [ ] Connexion stable testée

### Stripe
- [ ] Compte Stripe créé et vérifié
- [ ] Mode LIVE activé (pas test)
- [ ] Clés LIVE obtenues (pk_live_ et sk_live_)
- [ ] Webhook configuré en production
- [ ] Stripe Webhook Secret obtenu

---

## 🔧 Configuration Stripe Production

### 1. Passer en Mode LIVE

1. Dans [Stripe Dashboard](https://dashboard.stripe.com)
2. Cliquez sur votre nom → Account Settings
3. Allez à "Business settings"
4. Activez le "Live mode"

### 2. Obtenir les Clés LIVE

1. Allez à [API Keys](https://dashboard.stripe.com/apikeys)
2. Assurez-vous que "Live" est activé (bouton bleu)
3. Copiez:
   - `Publishable key` (commence par `pk_live_`)
   - `Secret key` (commence par `sk_live_`)

### 3. Créer les Produits en LIVE

**IMPORTANT**: Les Price IDs du test ne fonctionnent PAS en mode live!

1. Allez à [Products](https://dashboard.stripe.com/products)
2. Créez deux nouveaux produits :
   - **Mensuel**: €15/mois
   - **Annuel**: €150/an
3. Obtenez les nouveaux PRICE_IDs

### 4. Configurer le Webhook en Production

1. Allez à [Webhooks](https://dashboard.stripe.com/webhooks)
2. Créez un nouvel endpoint:
   - **URL** : `https://votre-domaine-vercel.app/api/webhooks/stripe`
   - **Événements** : 
     - checkout.session.completed
     - customer.subscription.deleted
     - invoice.payment_succeeded
3. Copiez le Webhook Secret (commence par `whsec_`)

---

## 🚀 Déploiement sur Vercel

### 1. Créer un Compte Vercel

- https://vercel.com/signup
- Connecter votre GitHub

### 2. Importer le Projet

1. Allez à https://vercel.com/new
2. Sélectionnez votre repo Groomly
3. Cliquez "Import"

### 3. Configurer les Variables d'Environnement

Dans Vercel → Settings → Environment Variables, ajouter :

```env
# Database (depuis Railway)
DATABASE_URL=postgresql://...

# NextAuth
NEXTAUTH_URL=https://votre-domaine-vercel.app
NEXTAUTH_SECRET=<générer-un-nouveau-secret>

# Stripe LIVE (pas test!)
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PRICE_ID_MONTHLY=price_... (nouveau pour LIVE)
STRIPE_PRICE_ID_YEARLY=price_... (nouveau pour LIVE)
STRIPE_WEBHOOK_SECRET=whsec_...

# Public (ok d'exposer)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY=price_...
NEXT_PUBLIC_STRIPE_PRICE_ID_YEARLY=price_...
NEXT_PUBLIC_APP_NAME=Groomly
```

### 4. Configurer le Domain

1. Allez à Settings → Domains
2. Ajoutez votre domaine custom (optionnel)
3. Vercel fournit automatiquement `*.vercel.app`

### 5. Déployer

```bash
# Push votre code sur GitHub
git add .
git commit -m "Production deployment"
git push origin main
```

Vercel va automatiquement :
- Builder votre app
- Lancer les migrations Prisma
- Déployer sur CDN global
- Vous donner une URL publique

---

## 📦 Configuration PostgreSQL Production

### Option 1 : Railway (Recommandé)

#### 1. Créer un compte Railway
- https://railway.app
- Connecter GitHub

#### 2. Créer un nouveau projet
1. New Project
2. Sélectionner PostgreSQL
3. Attendre la création

#### 3. Obtenir la chaîne de connexion
1. Cliquez sur le service PostgreSQL
2. Allez à l'onglet "Connect"
3. Copiez la chaîne de connexion (commence par `postgresql://`)

#### 4. Ajouter à Vercel
- Allez à Vercel → Project Settings → Environment Variables
- Ajouter `DATABASE_URL` avec la chaîne Railway

#### 5. Lancer les migrations
```bash
# Une fois le déploiement initial réussi
# Vous pouvez re-déployer ou utiliser Vercel CLI
vercel env pull
npm run prisma:migrate
```

### Option 2 : Supabase

1. Créer compte https://supabase.com
2. Créer nouveau projet
3. Obtenir `postgresql://...` depuis Settings → Database
4. Ajouter à Vercel
5. Migrations automatiques

### Option 3 : AWS RDS

1. Créer instance RDS PostgreSQL
2. Obtenir l'endpoint
3. Ajouter à Vercel
4. Lancer migrations

---

## ✅ Vérifications Post-Déploiement

### 1. Vérifier que le site est accessible
```bash
curl https://votre-domaine-vercel.app
# Doit retourner 200 OK
```

### 2. Vérifier la connexion à la base
1. Allez sur votre app en production
2. Inscrivez-vous
3. Allez à `/dashboard`
4. Vérifiez que les données s'affichent

### 3. Vérifier Stripe
1. Allez à `/dashboard/subscription`
2. Cliquez sur "S'abonner"
3. Utilisez une VRAIE carte Stripe (pas test!)
4. Complétez le paiement
5. Vérifiez le webhook dans Stripe Dashboard

### 4. Vérifier le webhook
1. Allez à https://dashboard.stripe.com/webhooks
2. Cliquez sur l'endpoint production
3. L'onglet "Events" doit afficher les events en vert ✅

---

## 🔐 Sécurité Production

### Activer HTTPS
- ✅ Vercel active HTTPS automatiquement
- ✅ Tous les cookies sont "Secure"

### Secrets
- ✅ Jamais committer `.env.local`
- ✅ Jamais afficher les clés secrètes dans les logs
- ✅ Utiliser Vercel Environment Variables (cryptées)

### CORS
- ✅ Vérifier que les requêtes API sont sécurisées
- ✅ Valider les origines

### Stripe
- ✅ Clés LIVE utilisées (pas test)
- ✅ Vérification des signatures webhook
- ✅ Webhook secret non exposé au client

---

## 🛡️ Monitoring en Production

### Logs Vercel
- Allez à Vercel → Deployments → Logs
- Cherchez les erreurs

### Logs Stripe
- Dashboard Stripe → Developers → Webhooks
- Vérifier les événements

### Database
- Via Railway ou Supabase UI
- Vérifier que les tables sont peuplées
- Vérifier les abonnements créés

---

## 📊 Mise à Jour du Code

### Déploiement d'une nouvelle version

```bash
# 1. Faire vos changements
# 2. Commit et push
git add .
git commit -m "New feature"
git push origin main

# Vercel redéploie automatiquement
# Vérifier les logs dans Vercel Dashboard
```

### Avec migrations Prisma

```bash
# 1. Modifier prisma/schema.prisma
# 2. Créer la migration locale
npm run prisma:migrate -- --name feature_name

# 3. Commit et push
git add .
git commit -m "Add feature"
git push origin main

# Vercel va:
# - Builder la nouvelle version
# - Exécuter les migrations en prod
# - Redéployer
```

---

## 🚨 Troubleshooting

### "Database connection refused"
- Vérifier `DATABASE_URL` dans Vercel
- Vérifier que PostgreSQL est accessible publiquement
- Vérifier les firewall rules

### "Webhook signature verification failed"
- Vérifier `STRIPE_WEBHOOK_SECRET` en Vercel
- Redéployer après modification
- Vérifier que c'est le secret LIVE (pas test)

### "Payment button not working"
- Vérifier les `STRIPE_PRICE_ID_*` en LIVE (pas test)
- Vérifier que `NEXT_PUBLIC_*` sont présentes

### "Can't create user"
- Vérifier `NEXTAUTH_SECRET` en Vercel
- Vérifier `NEXTAUTH_URL` = votre domaine
- Vérifier que migrations ont réussi

---

## 🎯 Checklist Final

- [ ] Code buildet sans erreurs
- [ ] Database connectée et migrations passées
- [ ] Stripe mode LIVE activé
- [ ] Webhook configuré en production
- [ ] Toutes les env vars dans Vercel
- [ ] Domaine custom configuré (optionnel)
- [ ] Premier paiement test réussi
- [ ] Abonnement créé en base
- [ ] Logs consultables et propres
- [ ] Monitoring/alertes configurés

---

## 🎉 Bravo!

Votre plateforme SaaS Groomly est maintenant en production! 🚀

**Prochaines étapes:**
- Tester avec quelques clients
- Collecter du feedback
- Implémenter Phase 3 (animaux, rendez-vous, etc.)
- Scaler selon les besoins

---

## 📞 Ressources

- [Vercel Docs](https://vercel.com/docs)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
- [Prisma Deployment](https://www.prisma.io/docs/guides/deployment)
- [NextAuth Deployment](https://next-auth.js.org/deployment)
- [Railway Docs](https://docs.railway.app)
