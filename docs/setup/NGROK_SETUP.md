# 🚀 Installation & Configuration NGROK - Guide Rapide

ngrok est un outil qui expose votre serveur local à Internet pour recevoir les webhooks Stripe en développement.

## 📥 Installation (5 min)

### Windows

1. **Télécharger ngrok**
   - Allez sur https://ngrok.com/download
   - Téléchargez la version Windows
   - Décompressez le fichier `.zip`
   - Vous obtenez `ngrok.exe`

2. **Créer un compte ngrok (gratuit)**
   - https://dashboard.ngrok.com/signup
   - Confirmez votre email
   - Allez dans l'onglet "Your Authtoken"
   - Copiez votre auth token

3. **Configurer ngrok**
   ```bash
   # Ouvrir PowerShell dans le dossier où vous avez décompressé ngrok
   cd C:\Users\YourName\Downloads\ngrok  # Ajuster le chemin

   # Configurer l'auth token
   .\ngrok.exe config add-authtoken YOUR_AUTH_TOKEN_HERE
   
   # Exemple:
   # .\ngrok.exe config add-authtoken 2V8...Abc
   ```

### Mac / Linux

```bash
# Télécharger ngrok
brew install ngrok/ngrok/ngrok

# Ou télécharger directement depuis https://ngrok.com/download

# Configurer l'auth token
ngrok config add-authtoken YOUR_AUTH_TOKEN_HERE
```

## ✅ Vérifier l'installation

```bash
# Windows
.\ngrok.exe version

# Mac/Linux
ngrok version

# Doit retourner : ngrok version X.X.X
```

## 🎯 Utiliser ngrok pour Stripe

### Étape 1 : Démarrer ngrok

```bash
# Windows
.\ngrok.exe http 3000

# Mac/Linux
ngrok http 3000
```

### Étape 2 : Copier l'URL générée

L'output ressemble à ceci :

```
ngrok                                                     (Ctrl+C to quit)

Add HTTP Basic authentication to the ngrok session so requests autopopulate the Authorization header. HTTP requests from the ngrok browser session will be blocked.

Session Status                online
Account                       your@email.com (Plan: Free)
Version                       3.0.0
Region                        eu (Europe)
Forwarding                    https://abc123-def456-ghi789.eu.ngrok.io -> http://localhost:3000
Forwarding                    http://abc123-def456-ghi789.eu.ngrok.io -> http://localhost:3000

Web Interface                 http://127.0.0.1:4040
```

**Copier cette URL** : `https://abc123-def456-ghi789.eu.ngrok.io`

### Étape 3 : Configurer le webhook Stripe

1. Allez à https://dashboard.stripe.com/webhooks
2. Cliquez "Ajouter endpoint"
3. **URL endpoint** : `https://abc123-def456-ghi789.eu.ngrok.io/api/webhooks/stripe`
4. **Événements à écouter** :
   - ✓ checkout.session.completed
   - ✓ customer.subscription.deleted  
   - ✓ invoice.payment_succeeded
5. Cliquez "Ajouter endpoint"
6. L'endpoint apparaît dans la liste
7. Cliquez dessus pour l'ouvrir
8. Allez à l'onglet "Signing secret"
9. Cliquez sur "Révéler" et copiez-le

### Étape 4 : Ajouter le secret à `.env.local`

```env
# .env.local
STRIPE_WEBHOOK_SECRET=whsec_test_xxxxxxxxxxxxxxxxxxxx
```

**Redémarrez** votre serveur Next.js après cette modification :

```bash
# Ctrl+C pour arrêter
# Puis relancer
npm run dev
```

## 🧪 Tester que c'est connecté

### Terminal ngrok (devrait afficher les requêtes)

```
POST /api/webhooks/stripe                 200 OK
```

### Terminal Next.js (devrait afficher les logs)

```
Subscription created for user cld7z...
```

### Stripe Dashboard (l'événement doit être en vert ✅)

1. https://dashboard.stripe.com/webhooks
2. Cliquez sur votre endpoint
3. Onglet "Events"
4. Cherchez `checkout.session.completed` en vert

## ⚠️ Important

- **ngrok crée une nouvelle URL à chaque redémarrage**
- Si vous redémarrez ngrok, vous devez mettre à jour le webhook Stripe
- Astuce: Gardez ngrok tourner dans un terminal séparé
- Vérifiez que Next.js tourne dans un AUTRE terminal

## 📊 Terminal 1 vs Terminal 2

```
TERMINAL 1: ngrok
┌────────────────────────────────────────┐
│ $ ngrok http 3000                      │
│ Forwarding https://abc123.ngrok.io    │
│ -> http://localhost:3000               │
│                                        │
│ POST /api/webhooks/stripe   200 OK    │
│ POST /api/webhooks/stripe   200 OK    │
└────────────────────────────────────────┘

TERMINAL 2: Next.js
┌────────────────────────────────────────┐
│ $ npm run dev                          │
│ ▲ Next.js 15.0.0                       │
│ - Local: http://localhost:3000         │
│                                        │
│ Subscription created for user...       │
│ Webhook processed successfully         │
└────────────────────────────────────────┘
```

## 🐛 Dépannage ngrok

### "command not found: ngrok"
- Vérifiez que le dossier ngrok est dans le PATH
- Ou utilisez le chemin complet : `C:\Users\YourName\ngrok\ngrok.exe http 3000`

### "Error: Invalid auth token"
- Copiez correctement le token depuis le dashboard
- Exécutez : `ngrok config add-authtoken YOUR_TOKEN`

### "Webhook ne s'affiche pas dans Stripe"
- Vérifiez que ngrok tourne (`https://abc123.ngrok.io`)
- Vérifiez que l'URL dans Stripe finit par `/api/webhooks/stripe`
- Vérifiez que Next.js tourne (`npm run dev` dans l'autre terminal)

### "Address already in use :3000"
- C'est normal, c'est que Next.js tourne déjà
- ngrok va le proxy, c'est exactement ce qu'on veut

## 🎉 Succès!

Si vous voyez:
- ✅ ngrok affiche une URL stable
- ✅ Webhook configuré dans Stripe Dashboard
- ✅ `STRIPE_WEBHOOK_SECRET` dans `.env.local`
- ✅ Next.js redémarré

Vous êtes prêt à tester le flow de paiement!

Voir: [TESTING_GUIDE.md](TESTING_GUIDE.md)
