# Guide de Test Local - Stripe + Webhooks

## 🚀 Configuration Rapide (5 minutes)

### Prérequis
- Node.js 18+
- npm/yarn
- Un compte Stripe (test mode)
- ngrok installé (https://ngrok.com/download)

## 📋 Étapes

### 1. Installer et configurer ngrok

```bash
# Créer un compte ngrok et télécharger l'executable
# https://ngrok.com/download

# Mac/Linux : 
ngrok http 3000

# Windows : Ouvrir ngrok.exe depuis le dossier où il est

# Copier l'URL générée : https://xxxx-xx-xxx-xxx.ngrok.io
```

### 2. Configurer le webhook Stripe

**Dans le Stripe Dashboard :**

1. Allez à https://dashboard.stripe.com/webhooks
2. Cliquez "Ajouter endpoint"
3. Collez votre URL ngrok + endpoint : `https://xxxx-xxxx.ngrok.io/api/webhooks/stripe`
4. Sélectionnez les événements :
   - ✓ `checkout.session.completed`
   - ✓ `customer.subscription.deleted`
   - ✓ `invoice.payment_succeeded`
5. Cliquez "Ajouter endpoint"
6. Allez à l'onglet "Signing secret"
7. Cliquez "Révéler" et copiez le secret
8. Ajoutez-le à `.env.local` :

```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

### 3. Démarrer l'appli

```bash
# Terminal 1 : ngrok continue de tourner
# Terminal 2 : Démarrer Next.js
npm run dev

# L'app est maintenant sur http://localhost:3000
# ET accessible de l'extérieur via https://xxxx-xxxx.ngrok.io
```

### 4. Tester le flow de paiement

1. **S'enregistrer** : Allez sur http://localhost:3000/auth/register
   - Email : `test@example.com`
   - Mot de passe : `test123456`

2. **Se connecter** : Allez sur http://localhost:3000/auth/login

3. **Accéder à la page d'abonnement** : 
   - Cliquez sur "Dashboard" dans la sidebar
   - Allez à "Mon Abonnement"

4. **Tester un paiement** :
   - Cliquez sur "S'abonner" (mensuel ou annuel)
   - Vous êtes redirigé vers Stripe Checkout
   - Utilisez une carte de test :
     ```
     Numéro : 4242 4242 4242 4242
     Expiration : 12/34
     CVC : 567
     Email : test@example.com
     ```

5. **Vérifier le webhook** :
   - Complétez le paiement
   - Vous êtes redirigé vers `/dashboard/subscription?success=true`
   - **Vérifiez** : Allez dans Stripe Dashboard → Developers → Webhooks → votre endpoint → Events
   - Vous devriez voir `checkout.session.completed` en vert ✅

6. **Vérifier la base de données** :
   ```bash
   npm run prisma:studio
   # Allez à la table "Subscription"
   # Vous devriez voir un nouvel enregistrement avec :
   # - stripeCustomerId: cus_xxxxx
   # - stripeSubscriptionId: sub_xxxxx
   # - status: active
   # - plan: monthly ou yearly
   ```

## 🔧 Dépannage

### Webhook ne s'affiche pas dans Stripe Dashboard
- Vérifiez que ngrok continue de tourner
- Vérifiez que le terminal Next.js affiche "ready - started server"
- Essayez de naviguer sur http://localhost:3000 pour tester

### Erreur "Webhook signature verification failed"
- Vérifiez que le `STRIPE_WEBHOOK_SECRET` dans `.env.local` est correct
- Redémarrez Next.js après modification de `.env.local`
- Supprimez et recréez le webhook

### Erreur "user not found" dans les logs
- Vérifiez que vous êtes connecté (il y a une session)
- Vérifiez que l'email utilisé pour s'enregistrer = email Stripe Checkout
- Vérifiez la base de données pour voir l'utilisateur

### La session Stripe crée un abonnement "Incomplete"
- C'est normal ! Cliquez sur le bouton paiement dans Stripe Checkout
- Après le paiement, il devient "active"

## 📊 Monitoring en temps réel

### Terminal 1 : Voir les logs ngrok
```
ngrok expose http logs
# Vous verrez chaque requête de webhook
```

### Terminal 2 : Voir les logs Next.js
```
npm run dev
# Cherchez "Subscription created for user" ou les erreurs
```

### Stripe Dashboard
1. Allez à https://dashboard.stripe.com/webhooks
2. Cliquez sur votre endpoint
3. Allez à l'onglet "Events"
4. Cliquez sur un événement pour voir les détails

## ✅ Checklist de test

- [ ] ngrok tourne (`https://xxxx.ngrok.io`)
- [ ] Webhook configuré dans Stripe Dashboard
- [ ] `STRIPE_WEBHOOK_SECRET` dans `.env.local`
- [ ] Next.js redémarré (`npm run dev`)
- [ ] Compte test créé sur l'app
- [ ] Paiement complété avec carte 4242...
- [ ] Webhook reçu (voir Stripe Dashboard)
- [ ] Abonnement créé en base (voir Prisma Studio)
- [ ] Message de succès affiché

## 🎉 Bravo !

Si tout est ✅, votre système de paiement Stripe fonctionne !

**Prochaine étape** : Mettre en place PostgreSQL en production
