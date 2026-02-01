# ⚡ PROCHAINES ÉTAPES - Roadmap Complète

**Status actuel** : 80% de l'intégration Stripe est prête
**Blockers** : Database PostgreSQL + Webhook configuration

---

## 📋 TODO Liste Priorisée

### 🔴 CRITIQUE (À faire MAINTENANT)

#### 1️⃣ Configuration du Webhook (30 min)
- [ ] Installer ngrok (voir [docs/setup/NGROK_SETUP.md](docs/setup/NGROK_SETUP.md))
- [ ] Configurer le webhook dans Stripe Dashboard (voir [docs/setup/STRIPE_SETUP.md](docs/setup/STRIPE_SETUP.md))
- [ ] Ajouter `STRIPE_WEBHOOK_SECRET` à `.env.local`
- [ ] Redémarrer Next.js

**Vérification** :
```bash
# Terminal 1
ngrok http 3000

# Terminal 2
npm run dev

# Vérifier dans Stripe Dashboard → Webhooks → Events
# Vous devez voir des requêtes vertes ✅
```

#### 2️⃣ Configuration PostgreSQL (1h)
- [ ] Choisir entre Railway (cloud) ou local
  - **Recommandé** : Railway (plus simple)
  - **Alternative** : PostgreSQL local
- [ ] Créer la base de données
- [ ] Obtenir la `DATABASE_URL`
- [ ] Ajouter `DATABASE_URL` à `.env.local`
- [ ] Lancer les migrations : `npm run prisma:migrate`

**Railway (Recommandé)**
1. Créer compte : https://railway.app
2. Connecter GitHub
3. Créer nouveau projet → PostgreSQL
4. Copier CONNECTION_STRING
5. Ajouter à `.env.local` : `DATABASE_URL="postgresql://..."`

**PostgreSQL Local**
1. Installer PostgreSQL (https://www.postgresql.org/download/)
2. Créer une base `groomly`
3. `DATABASE_URL="postgresql://postgres:password@localhost:5432/groomly"`

**Vérification** :
```bash
# Tester la connexion
npm run prisma:studio

# Vous devez voir les tables vides dans Prisma Studio
```

---

### 🟠 IMPORTANT (Après les critiques)

#### 3️⃣ Tester le Flow Complet (45 min)
- [ ] Suivre [docs/guides/TESTING_GUIDE.md](docs/guides/TESTING_GUIDE.md)
- [ ] Tester la création de compte
- [ ] Tester l'abonnement mensuel
- [ ] Tester l'abonnement annuel
- [ ] Vérifier les données en BDD

**Vérification** :
```bash
# Voir les abonnements créés
npm run prisma:studio
# Table: Subscription → vous devez voir l'abonnement créé
```

#### 4️⃣ Intégration du Statut d'Abonnement au Dashboard
- [ ] Créer un endpoint `/api/subscription/status` pour récupérer l'abonnement actif
- [ ] Afficher le statut dans le dashboard (plan actuel, date de renouvellement)
- [ ] Ajouter un bouton "Gérer mon abonnement" (Stripe Customer Portal)
- [ ] Ajouter un bouton "Annuler" pour canceler l'abonnement

**Code exemple** :
```typescript
// /api/subscription/status
export async function GET(request: NextRequest) {
  const session = await auth()
  const subscription = await prisma.subscription.findUnique({
    where: { userId: session.user.id }
  })
  return NextResponse.json(subscription)
}
```

---

### 🟡 IMPORTANT (Avant production)

#### 5️⃣ Setup Production (2h)
- [ ] Déployer sur Vercel
  - [ ] Connecter votre repo GitHub
  - [ ] Configurer les variables d'environnement
  - [ ] Lancer le build
  
- [ ] Configurer PostgreSQL Production
  - [ ] Utiliser Railway pour PostgreSQL (recommandé)
  - [ ] Passer la DATABASE_URL de production à Vercel
  - [ ] Lancer migrations en production
  
- [ ] Activer le Mode LIVE Stripe
  - [ ] Dans Stripe Dashboard : Passer en mode LIVE
  - [ ] Copier les clés LIVE (pas test)
  - [ ] Ajouter à Vercel : STRIPE_SECRET_KEY (live)
  - [ ] Ajouter à Vercel : NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY (live)
  
- [ ] Configurer le webhook production
  - [ ] URL: `https://votre-domaine-vercel.app/api/webhooks/stripe`
  - [ ] Ajouter à Vercel : `STRIPE_WEBHOOK_SECRET`

#### 6️⃣ Tester en Production (30 min)
- [ ] Visiter votre app en production
- [ ] Créer un compte
- [ ] Aller à /dashboard/subscription
- [ ] Faire un paiement test (ou vrai si prêt)
- [ ] Vérifier le webhook dans Stripe Dashboard
- [ ] Vérifier la BDD en production

---

### 🟢 OPTIONNEL (Phase 2+)

#### 7️⃣ Gestion des Animaux
- [ ] Créer API `/api/animals` (CRUD)
- [ ] Créer page `/dashboard/animals`
- [ ] Ajouter upload de photos (Cloudinary)

#### 8️⃣ Gestion des Rendez-vous
- [ ] Créer calendrier (react-big-calendar ou fullcalendar)
- [ ] API `/api/appointments` (CRUD)
- [ ] Notifications par email (resend ou nodemailer)

#### 9️⃣ Gestion des Services
- [ ] Page `/dashboard/services` (CRUD)
- [ ] Afficher les services dans le checkout
- [ ] Pricing personnalisé par service

#### 🔟 Gestion des Stocks
- [ ] Page `/dashboard/inventory` (CRUD)
- [ ] Alertes quand stock bas

---

## 📚 Documentation à Lire

| Document | Sujet | Temps |
|----------|-------|-------|
| [NGROK_SETUP.md](NGROK_SETUP.md) | Installer ngrok | 10 min |
| [STRIPE_SETUP.md](STRIPE_SETUP.md) | Configurer webhook Stripe | 15 min |
| [TESTING_GUIDE.md](TESTING_GUIDE.md) | Tester le flow complet | 45 min |
| [PAYMENT_ARCHITECTURE.md](PAYMENT_ARCHITECTURE.md) | Comprendre l'architecture | 20 min |
| [DATABASE_SETUP.md](DATABASE_SETUP.md) | Setup PostgreSQL | 30 min |
| [INTEGRATION_CHECKLIST.md](INTEGRATION_CHECKLIST.md) | Checklist globale | 10 min |

---

## 🎯 Plan d'Action AUJOURD'HUI

```
Matin (1h):
├─ Installer ngrok (10 min) [NGROK_SETUP.md]
├─ Configurer webhook Stripe (15 min) [STRIPE_SETUP.md]
└─ Ajouter STRIPE_WEBHOOK_SECRET à .env.local (5 min)

Après-midi (2h):
├─ Setup PostgreSQL (30 min) [DATABASE_SETUP.md]
├─ Tester le flow complet (45 min) [TESTING_GUIDE.md]
└─ Vérifier tout en console/Stripe Dashboard (15 min)

Demain (2h):
├─ Intégrer statut abonnement au dashboard (60 min)
├─ Tester en développement (30 min)
└─ Préparer déploiement Vercel (30 min)
```

---

## ✅ Checklist de Vérification

### Avant de continuer
- [ ] Vous avez créé un compte Stripe
- [ ] Vous avez les clés API (pk_test + sk_test)
- [ ] Vous avez les PRICE_IDs (monthly + yearly)
- [ ] Variables d'environnement ajoutées à `.env.local`
- [ ] Next.js démarre sans erreurs : `npm run dev`

### Avant de tester
- [ ] ngrok installé et tournant
- [ ] Webhook configuré dans Stripe Dashboard
- [ ] `STRIPE_WEBHOOK_SECRET` dans `.env.local`
- [ ] Next.js redémarré
- [ ] PostgreSQL configuré (DATABASE_URL dans `.env.local`)
- [ ] Migrations exécutées : `npm run prisma:migrate`

### Avant la production
- [ ] Tous les tests en dev passent ✅
- [ ] Mode LIVE Stripe activé
- [ ] Clés LIVE ajoutées à Vercel
- [ ] App déployée sur Vercel
- [ ] PostgreSQL en production configuré
- [ ] Webhook production configuré
- [ ] Un paiement de test réussi en production

---

## 🔗 Liens Utiles

- [Stripe Dashboard](https://dashboard.stripe.com)
- [Railway](https://railway.app)
- [Vercel](https://vercel.com)
- [ngrok](https://ngrok.com)
- [PostgreSQL](https://www.postgresql.org)
- [Prisma Docs](https://www.prisma.io/docs)

---

## 💬 Questions Fréquentes

**Q: Peux-je tester sans ngrok?**
A: Non, ngrok est nécessaire pour que Stripe envoie les webhooks à votre localhost.

**Q: Puis-je utiliser une base locale au lieu de Railway?**
A: Oui, mais Railway est plus simple et mieux pour la production.

**Q: Combien de temps jusqu'à la production?**
A: 3-4h total si vous suivez ce guide étape par étape.

**Q: Mes données d'abonnement seront-elles perdues si je redéploie?**
A: Non, elles sont stockées dans PostgreSQL, pas sur Vercel.

**Q: Comment gérer les abonnements des clients?**
A: Vous pouvez créer une page "Manage Subscription" qui ouvre le Stripe Customer Portal.

---

## 🎉 Après Tous les Setup

Votre plateforme SaaS Groomly sera:

✅ Prête pour les vrais paiements (mode LIVE Stripe)
✅ Avec une base de données en production
✅ Déployée sur Vercel (CDN global)
✅ Avec webhooks actifs et sécurisés
✅ Prête pour les premiers clients!

---

**Bonne chance! 🚀**
