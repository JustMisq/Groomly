# Architecture - Système de Paiement Stripe

## 🏗️ Vue d'ensemble du flux

```
┌─────────────────────────────────────────────────────────────────────┐
│                         UTILISATEUR                                 │
│                                                                     │
│  1. Visite: /dashboard/subscription                                 │
│  2. Clique: "S'abonner" (mensuel ou annuel)                        │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│              FRONTEND (Next.js Client)                              │
│                                                                     │
│  /dashboard/subscription/page.tsx                                   │
│  - Affiche 2 pricing cards (€15/mois, €150/an)                     │
│  - handleCheckout() → POST /api/checkout                           │
│  - Reçoit URL Stripe → Redirection (window.location.href)          │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│            BACKEND (Next.js API Route)                             │
│                                                                     │
│  /api/checkout (POST)                                              │
│  ├─ Reçoit { priceId }                                            │
│  ├─ Valide priceId (monthly ou yearly)                            │
│  ├─ stripe.checkout.sessions.create({                             │
│  │    mode: 'subscription'                                         │
│  │    line_items: [{ price: priceId, qty: 1 }]                   │
│  │    success_url: .../dashboard/subscription?success=true        │
│  │    cancel_url: .../dashboard/subscription?canceled=true        │
│  ├─ Retourne: { sessionId, url }                                  │
│  └─ Client redirige vers stripe.com/checkout/...                  │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    STRIPE CHECKOUT                                  │
│              (Formulaire hébergé par Stripe)                        │
│                                                                     │
│  - Affiche le formulaire de paiement                               │
│  - Accepte la carte (test: 4242 4242 4242 4242)                   │
│  - Crée subscription sur Stripe                                    │
│  └─ Envoie webhook → /api/webhooks/stripe                         │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
                ┌──────────┴──────────┬───────────────┐
                ▼                     ▼               ▼
            SUCCESS              CANCELLED         WEBHOOK
                │                     │               │
                └─────────┬───────────┘               │
                          ▼                           ▼
                   Redirection vers             /api/webhooks/stripe
              /dashboard/subscription           
              ?success=true ou                  Traite les événements:
              ?canceled=true                    ├─ checkout.session.completed
                                                ├─ customer.subscription.deleted
                                                └─ invoice.payment_succeeded
                                                
                          ▼
┌─────────────────────────────────────────────────────────────────────┐
│            BACKEND - WEBHOOK HANDLER                               │
│                                                                     │
│  /api/webhooks/stripe (POST)                                       │
│  ├─ Vérifie la signature (STRIPE_WEBHOOK_SECRET)                  │
│  ├─ Extract l'événement Stripe                                     │
│  ├─ Si checkout.session.completed:                                │
│  │   ├─ Récupère l'utilisateur par email                         │
│  │   ├─ Récupère les infos subscription Stripe                   │
│  │   ├─ Détermine le plan (monthly/yearly)                       │
│  │   └─ Crée/update Subscription en BDD                          │
│  │       (userId, stripeCustomerId, stripeSubscriptionId, ...)   │
│  │                                                                 │
│  ├─ Si customer.subscription.deleted:                             │
│  │   └─ Met status à 'canceled'                                  │
│  │                                                                 │
│  └─ Si invoice.payment_succeeded:                                 │
│      └─ Met à jour les dates de billing period                   │
│                                                                    │
│  Return: 200 OK { received: true }                                │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│              BASE DE DONNÉES (PostgreSQL)                           │
│                                                                     │
│  Table: Subscription                                               │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ id: cuid()                                                   │  │
│  │ userId: string (FK → User)                                   │  │
│  │ plan: 'monthly' | 'yearly'                                   │  │
│  │ price: 15 | 150                                              │  │
│  │ currency: 'EUR'                                              │  │
│  │ status: 'active' | 'canceled'                                │  │
│  │ stripeCustomerId: 'cus_xxxxx'                                │  │
│  │ stripeSubscriptionId: 'sub_xxxxx'                            │  │
│  │ currentPeriodStart: DateTime                                  │  │
│  │ currentPeriodEnd: DateTime                                    │  │
│  │ createdAt: DateTime                                          │  │
│  │ updatedAt: DateTime                                          │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  L'abonnement est maintenant actif pour l'utilisateur ✅            │
└─────────────────────────────────────────────────────────────────────┘
```

## 🔄 Flux détaillé des événements

### 1️⃣ Utilisateur clique "S'abonner"

```javascript
// Frontend: src/app/dashboard/subscription/page.tsx
onClick={() => handleCheckout(priceId, planName)}
  ↓
fetch('/api/checkout', {
  method: 'POST',
  body: { priceId: 'price_1SvnnRHL3SUhHs4bIEb5QuxA' }
})
  ↓
Reçoit: { url: 'https://checkout.stripe.com/pay/cs_...' }
  ↓
window.location.href = url  // Redirection vers Stripe
```

### 2️⃣ Backend crée la session Checkout

```javascript
// Backend: src/app/api/checkout/route.ts
POST /api/checkout
  ├─ Valide priceId
  ├─ Appel Stripe API:
  │   stripe.checkout.sessions.create({
  │     mode: 'subscription',
  │     line_items: [{ price, quantity: 1 }],
  │     success_url: '.../dashboard/subscription?success=true',
  │     cancel_url: '.../dashboard/subscription?canceled=true'
  │   })
  │
  └─ Retourne: { sessionId, url }
```

### 3️⃣ Utilisateur complète le paiement Stripe

```
Stripe Checkout (hébergé par Stripe)
  ├─ Affiche formulaire
  ├─ Utilisateur rentre la carte test (4242...)
  ├─ Clique "Payer"
  │
  ├─ Crée un Stripe Subscription
  │   └─ sub_xxxxxxxxxxxxx (active)
  │
  ├─ Envoie événement webhook:
  │   POST https://votre-domaine.com/api/webhooks/stripe
  │   {
  │     type: 'checkout.session.completed',
  │     data: {
  │       object: {
  │         customer_email: 'user@example.com',
  │         subscription: 'sub_xxxxx',
  │         customer: 'cus_xxxxx'
  │       }
  │     }
  │   }
  │
  └─ Redirige vers /dashboard/subscription?success=true
```

### 4️⃣ Webhook met à jour la BDD

```javascript
// Backend: src/app/api/webhooks/stripe/route.ts
POST /api/webhooks/stripe
  ├─ Vérifie signature: stripe.webhooks.constructEvent()
  ├─ Extract l'événement
  ├─ Si checkout.session.completed:
  │   ├─ Récupère l'utilisateur: prisma.user.findUnique({ email })
  │   ├─ Récupère la subscription Stripe: stripe.subscriptions.retrieve()
  │   ├─ Détermine le plan:
  │   │   price === PRICE_ID_MONTHLY ? 'monthly' : 'yearly'
  │   │
  │   └─ Crée l'enregistrement Subscription:
  │       prisma.subscription.upsert({
  │         userId, stripeCustomerId, stripeSubscriptionId,
  │         status: 'active', plan, price, currency,
  │         currentPeriodStart, currentPeriodEnd
  │       })
  │
  └─ Retourne: 200 OK { received: true }
```

### 5️⃣ Page affiche le message de succès

```javascript
// Frontend: src/app/dashboard/subscription/page.tsx
useSearchParams()
  ├─ Lit ?success=true
  ├─ Affiche: "✅ Paiement réussi! Votre abonnement est activé."
  └─ Toast: "Bienvenue!" (optionnel)
```

## 🔐 Sécurité

### Variables sensibles (côté serveur uniquement)
```env
STRIPE_SECRET_KEY=sk_test_xxxx  # ❌ JAMAIS au client
STRIPE_WEBHOOK_SECRET=whsec_xx  # ❌ JAMAIS au client
DATABASE_URL=postgresql://...   # ❌ JAMAIS au client
```

### Variables publiques (ok pour le client)
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxx  # ✅ Exposé
NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY=price_xxxx   # ✅ Exposé
NEXT_PUBLIC_STRIPE_PRICE_ID_YEARLY=price_xxxx    # ✅ Exposé
```

### Vérifications de signature webhook
```javascript
// Vérifie que le webhook vient de Stripe
const event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
// Lève une erreur si la signature est invalide
```

### Validation côté serveur
```javascript
// Valide que le priceId est autorisé
const validPrices = [PRICE_MONTHLY, PRICE_YEARLY]
if (!validPrices.includes(priceId)) return 400
```

## 🌐 Déploiement sur Vercel + Production

```
┌────────────────────────────────────────────────┐
│          DOMAINE DE PRODUCTION                 │
│     https://groomly-app.vercel.app             │
└────────────────────────────────────────────────┘
                      │
         ┌────────────┴────────────┐
         ▼                         ▼
    Checkout API              Webhook Endpoint
  /api/checkout          /api/webhooks/stripe
  (crée sessions)        (reçoit événements)
         │                        │
         └────────────┬───────────┘
                      ▼
              Stripe Dashboard
              (mode: LIVE, not test)
              ├─ Live Secret Key
              ├─ Live Publishable Key
              ├─ Live Price IDs
              └─ Webhook configuré
                  https://groomly-app.vercel.app
                  /api/webhooks/stripe
```

## 📊 Statuts d'abonnement

```
                    ┌─────────────────┐
                    │   En création   │
                    │  (incomplete)   │
                    └────────┬────────┘
                             │
                    Paiement complété
                             │
                    ┌────────▼────────┐
                    │     ACTIF       │◄───────┐
                    │    (active)     │        │
                    └────────┬────────┘        │
                             │         Renouvellement
                   ┌─────────┴─────────┐       automatique
                   │                   │
            Annulation        Renouvellement
            utilisateur       réussi
                   │                   │
         ┌─────────▼──────────────────▼────────┐
         │   ANNULÉ / EXPIRÉ                   │
         │ (canceled / past_due)               │
         └─────────────────────────────────────┘
```

## 🔄 Flux de renouvellement automatique

```
Date: current_period_end atteinte
  │
  ├─ Stripe essaie de charger la carte
  ├─ Si succès:
  │   └─ Webhook: invoice.payment_succeeded
  │       └─ Update currentPeriodStart/End
  │
  └─ Si échec:
      └─ Status passe à 'past_due'
          └─ À relancer manuellement
```

---

**Ce schéma montre l'intégration complète du système de paiement Stripe dans Groomly.**
