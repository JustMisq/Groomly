# 🏢 Groomly - SaaS pour Toiletteurs

Plateforme complète de gestion pour salons de toilettage pour animaux domestiques.

**Status**: MVP Phase 1 ✅ + Stripe Integration 🚀

---

## 🎯 Fonctionnalités

### ✅ Phase 1 - MVP (Complétée)
- Authentification (register/login)
- Gestion du salon
- Gestion des clients
- Dashboard responsive
- Design mobile-first avec Tailwind CSS

### 🚀 Phase 2 - Paiements (En cours)
- Abonnement Stripe (€15/mois ou €150/an)
- Checkout sécurisé
- Webhooks pour confirmation de paiement
- Gestion des abonnements en BDD

### ⏳ Phase 3 - Fonctionnalités essentielles (À faire)
- Gestion des animaux
- Rendez-vous avec calendrier
- Services et tarification
- Gestion des stocks
- Notifications email
- Rapports et statistiques

---

## 🚀 Démarrage Rapide

### 1. Cloner & Installer

```bash
git clone <votre-repo>
cd groomly
npm install
```

### 2. Configurer les Variables

Créer `.env.local` :

```env
# Database (à ajouter après configuration)
DATABASE_URL="postgresql://user:password@localhost:5432/groomly"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="votre-secret"

# Stripe
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PRICE_ID_MONTHLY="price_..."
STRIPE_PRICE_ID_YEARLY="price_..."

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY="price_..."
NEXT_PUBLIC_STRIPE_PRICE_ID_YEARLY="price_..."
```

### 3. Setup Database

```bash
npm run prisma:migrate
```

### 4. Démarrer

```bash
npm run dev
```

Accédez à http://localhost:3000

---

## 📚 Documentation Complète

👉 **À LIRE EN PREMIER**: [NEXT_STEPS.md](NEXT_STEPS.md)

| Document | Description |
|----------|------------|
| [NEXT_STEPS.md](NEXT_STEPS.md) | Roadmap complète et plan d'action |
| [docs/setup/DATABASE_SETUP.md](docs/setup/DATABASE_SETUP.md) | Configuration PostgreSQL |
| [docs/setup/NGROK_SETUP.md](docs/setup/NGROK_SETUP.md) | Installation ngrok pour webhooks |
| [docs/setup/STRIPE_SETUP.md](docs/setup/STRIPE_SETUP.md) | Configuration Stripe complète |
| [docs/guides/TESTING_GUIDE.md](docs/guides/TESTING_GUIDE.md) | Guide de test paiements |
| [docs/guides/PAYMENT_ARCHITECTURE.md](docs/guides/PAYMENT_ARCHITECTURE.md) | Architecture technique |
| [docs/guides/INTEGRATION_CHECKLIST.md](docs/guides/INTEGRATION_CHECKLIST.md) | Checklist d'intégration |
| [docs/guides/DEPLOYMENT.md](docs/guides/DEPLOYMENT.md) | Déploiement en production |

---

## 🏗️ Stack Technologique

| Couche | Technology |
|--------|-----------|
| Frontend | Next.js 15 + React 19 + TypeScript + Tailwind CSS |
| Backend | Node.js API Routes (Next.js) |
| Database | PostgreSQL + Prisma ORM |
| Authentication | NextAuth.js v4 |
| Payments | Stripe SDK |
| UI Notifications | React Hot Toast |

---

## 🛠️ Commandes

```bash
npm run dev              # Démarrer dev
npm run build            # Build prod
npm start                # Lancer prod
npm run lint             # Linter
npm run prisma:migrate   # Migrations
npm run prisma:studio    # Visualiser DB
```

---

## 📊 Prochaines Étapes Critiques

1. **[NGROK_SETUP.md](NGROK_SETUP.md)** - Installer ngrok (30 min)
2. **[STRIPE_SETUP.md](STRIPE_SETUP.md)** - Configurer webhook (15 min)
3. **[DATABASE_SETUP.md](DATABASE_SETUP.md)** - Setup PostgreSQL (1h)
4. **[TESTING_GUIDE.md](TESTING_GUIDE.md)** - Tester le flow (45 min)

---

## 💡 Informations Importantes

- **Base de données**: PostgreSQL requise (Railway recommandé)
- **Webhooks**: ngrok nécessaire pour développement local
- **Paiements**: Mode test Stripe (clés pk_test_ et sk_test_)
- **Carte de test**: 4242 4242 4242 4242 (CVC: 123, Date: 12/25)

---

## 📞 Support

Consultez les guides dans le dossier racine pour vos questions.

---

**Status Global**: 80% développé - Intégration Stripe presque complète! 🎉
