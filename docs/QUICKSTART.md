# 🎯 Groomly - Quick Start

## 1️⃣ Installation (2 minutes)

```bash
# Le projet est prêt à démarrer!
npm install  # Déjà fait ✅

# Configurer la base de données
cp .env.example .env.local  # Éditer avec vos params
```

## 2️⃣ Base de données

**Choisir une option:**

### Option A: PostgreSQL Local (facile)
```bash
# Créer la DB
createdb groomly

# .env.local
DATABASE_URL="postgresql://localhost/groomly"
```

### Option B: Railway (recommandé)
1. [Railway.app](https://railway.app) → Sign up
2. New Project → PostgreSQL
3. Copier l'URL dans `.env.local`

**Puis:**
```bash
npm run prisma:migrate
```

## 3️⃣ Démarrer le dev

```bash
npm run dev
```

→ [http://localhost:3000](http://localhost:3000)

---

## 📚 Stack au coup d'œil

```
Frontend:   Next.js 15 + TypeScript + Tailwind
Backend:    API Routes Next.js
DB:         PostgreSQL + Prisma ORM
Auth:       NextAuth.js (Credentials)
Paiements:  Stripe (à intégrer)
UI:         React Hot Toast notifications
```

---

## 🎨 Démos des pages

| Page | URL | Status |
|------|-----|--------|
| Landing | `/` | ✅ Live |
| Signup | `/auth/register` | ✅ Live |
| Login | `/auth/login` | ✅ Live |
| Dashboard | `/dashboard` | ✅ Live |
| Salon | `/dashboard/salon` | ✅ Live |
| Clients | `/dashboard/clients` | ✅ Live |
| RDV | `/dashboard/appointments` | ⏳ WIP |
| Stocks | `/dashboard/inventory` | ⏳ WIP |
| Services | `/dashboard/services` | ⏳ WIP |

---

## 🚀 Premier client

```
Email:    test@example.com
Password: Test123!
```

Ou créez votre compte via l'interface.

---

## 📁 Structure clé

```
src/
├── app/
│   ├── api/          # Endpoints API
│   ├── auth/         # Pages authentification
│   ├── dashboard/    # Dashboard utilisateur
│   └── page.tsx      # Landing page
├── components/       # Composants réutilisables
└── lib/
    ├── auth.ts       # NextAuth config
    ├── prisma.ts     # DB client
    └── utils.ts      # Utilities

prisma/
└── schema.prisma     # Schéma DB
```

---

## 🔑 .env.local requis

```env
# Required
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"

# Optional (Stripe)
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
```

Générer un secret NextAuth:
```bash
openssl rand -base64 32
```

---

## 💡 Commandes courantes

```bash
npm run dev                 # Développement
npm run build               # Build production
npm start                   # Production
npm run lint                # Vérifier code
npm run prisma:studio       # Voir la DB (GUI)
npm run prisma:migrate      # Créer migrations
npm run prisma:generate     # Régénérer Prisma
```

---

## ❌ Troubleshooting

**"Cannot connect to database"**
→ Vérifier `DATABASE_URL` dans `.env.local`

**"NEXTAUTH_SECRET is not set"**
→ Générer: `openssl rand -base64 32`

**"Module not found"**
```bash
npm install
npm run prisma:generate
```

**Build échoue**
→ `npm run build` → voir erreurs TypeScript

---

## 🎯 Tâches à faire

- [ ] Configurer PostgreSQL
- [ ] Ajouter `.env.local`
- [ ] `npm run prisma:migrate`
- [ ] `npm run dev`
- [ ] Tester signup/login
- [ ] Ajouter un client
- [ ] Configurer le salon

---

## 📖 Documentation

- [README.md](./README.md) - Overview général
- [SETUP.md](./SETUP.md) - Configuration détaillée
- [CHECKLIST.md](./CHECKLIST.md) - Features à implémenter

---

## 🔗 Ressources utiles

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs/)
- [NextAuth Docs](https://next-auth.js.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Stripe Docs](https://stripe.com/docs)

---

## 💬 Questions?

Consultez les fichiers `.md` du projet ou les links ci-dessus.

Bon développement! 🚀
