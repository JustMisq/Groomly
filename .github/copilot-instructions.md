# Groomly - SaaS pour Toiletteurs

## Vue d'ensemble du projet

Groomly est une plateforme SaaS complète conçue pour les toiletteurs. Elle permet de gérer :
- Les clients et leurs animaux
- Les rendez-vous et calendrier
- Les services et tarification
- L'inventaire/stocks
- Les paiements via Stripe (15€/mois ou 150€/an)

## Stack Technologique

- **Frontend** : Next.js 15+ avec TypeScript et Tailwind CSS
- **Backend** : API Routes Next.js
- **BDD** : PostgreSQL avec Prisma ORM
- **Authentification** : NextAuth.js avec credentials provider
- **Paiements** : Stripe (à intégrer)
- **Notifications** : React Hot Toast
- **Hashage** : bcryptjs

## Structure du Projet

```
src/
├── app/
│   ├── api/              # Routes API
│   │   ├── auth/
│   │   ├── clients/
│   │   ├── salon/
│   │   └── pricing/
│   ├── auth/             # Pages authentification
│   │   ├── login/
│   │   └── register/
│   ├── dashboard/        # Dashboard utilisateur
│   │   ├── clients/
│   │   ├── appointments/
│   │   ├── inventory/
│   │   ├── services/
│   │   ├── settings/
│   │   ├── subscription/
│   │   └── salon/
│   ├── layout.tsx
│   ├── page.tsx          # Landing page
│   └── globals.css
├── components/
│   ├── ui/
│   │   └── button.tsx
│   └── providers.tsx
├── lib/
│   ├── auth-config.ts    # NextAuth configuration
│   ├── auth.ts           # Auth utilities
│   ├── prisma.ts         # Prisma client
│   └── utils.ts          # Helper functions
└── prisma/
    └── schema.prisma
```

## Modèles de Données Prisma

- **User** : Utilisateur (email, password, name)
- **Salon** : Salon de toilettage (nom, adresse, contact)
- **Client** : Client du salon
- **Animal** : Animal du client (espèce, race, date naissance)
- **Service** : Services offerts (nom, prix, durée)
- **Appointment** : Rendez-vous
- **InventoryItem** : Articles en stock
- **Subscription** : Abonnement utilisateur (Stripe)

## Configuration Required

1. PostgreSQL database (local ou Railway)
2. `.env.local` avec :
   - DATABASE_URL
   - NEXTAUTH_URL
   - NEXTAUTH_SECRET
   - STRIPE_PUBLISHABLE_KEY (optionnel)
   - STRIPE_SECRET_KEY (optionnel)

## Commandes Principales

```bash
npm run dev              # Démarrer le serveur de dev
npm run build            # Build production
npm start                # Démarrer en production
npm run lint             # Linter
npm run prisma:migrate   # Migrations Prisma
npm run prisma:studio    # Visualiser la DB
```

## Fonctionnalités Actuelles ✅

- ✅ Landing page responsive
- ✅ Authentification (register/login)
- ✅ Dashboard principal
- ✅ Gestion du salon
- ✅ Gestion des clients
- ✅ API pour clients et salon
- ✅ Sidebar navigation
- ✅ Design responsive Tailwind

## Fonctionnalités À Implémenter

- ⏳ Intégration Stripe (checkout, webhooks)
- ⏳ Gestion des rendez-vous (calendrier)
- ⏳ Services et tarification
- ⏳ Gestion des stocks
- ⏳ Photos animaux (Cloudinary)
- ⏳ Notifications email/SMS
- ⏳ Statistiques et rapports
- ⏳ Détails client et animaux
- ⏳ Export PDF factures

## Design Pattern

- Utilisation de `'use client'` pour les composants client (Next.js 13+ App Router)
- API routes pour backend
- Prisma pour requêtes DB type-safe
- Tailwind pour styling
- Toast notifications avec react-hot-toast

## Prochaines Étapes

1. Configurer PostgreSQL (local ou Railway)
2. Intégrer Stripe pour paiements
3. Implémenter calendrier pour rendez-vous
4. Ajouter upload photos animaux
5. Créer pages détails client/animal
6. Ajouter notifications
7. Déployer sur Vercel + Railway

## Notes importantes

- Password hashing avec bcryptjs (10 salt rounds)
- Session JWT avec NextAuth
- CORS headers configurés pour API
- Responsive design Mobile-first
- Index Prisma sur salonId pour perfs
- NextAuth v4 avec Credentials provider

## Projet Status

**Phase 1 - MVP**: ✅ Complétée
- Landing page
- Authentification
- Dashboard basique
- Gestion salon
- Gestion clients

**Phase 2 - Fonctionnalités essentielles**: ⏳ À faire
- Gestion animaux
- Rendez-vous avec calendrier
- Services et tarification
- Intégration Stripe
- Notifications

**Phase 3 - Avancé**: ⏳ À faire
- Rapports et statistiques
- Photos/galerie
- Export PDF
- Mobile app
