# 🗄️ Configuration PostgreSQL - Database Setup

Guide complet pour configurer PostgreSQL (locale ou cloud) pour Groomly.

---

## 📋 Choix: Où Héberger PostgreSQL?

| Option | Avantages | Inconvénients | Recommandé |
|--------|-----------|---------------|-----------|
| **Railway** | ☁️ Cloud, simple, gratuit au départ | Pas gratuit à long terme | ⭐ OUI |
| **PostgreSQL Local** | 🖥️ Gratuit, contrôle total | Complexe à setup, pas accessible à distance | Non |
| **Supabase** | ☁️ Cloud, simplifié, gratuit | Moins populaire | Peut-être |
| **AWS RDS** | ☁️ Scalable, professionnel | Cher, complexe | Pour production |

**Recommandation pour MVP**: **Railway** (le plus simple et idéal pour commencer)

---

## 🚀 Option 1: Railway (Recommandé - 5 min)

### Étape 1: Créer un Compte Railway

1. Allez sur https://railway.app
2. Cliquez "Sign up"
3. Connectez avec GitHub
4. Autorisez l'accès

### Étape 2: Créer un Nouveau Projet

1. Dashboard Railway → "New Project"
2. Cherchez "PostgreSQL"
3. Cliquez "PostgreSQL"
4. Attendez ~1 minute (Railway crée la base)

### Étape 3: Obtenir la Chaîne de Connexion

1. Cliquez sur le service PostgreSQL créé
2. Allez à l'onglet "Connect"
3. Cherchez "Database URL" (commence par `postgresql://`)
4. Cliquez "Copy" pour copier la chaîne complète

Exemple de chaîne:
```
postgresql://postgres:password@postgres.railway.internal:5432/railway?sslmode=require
```

### Étape 4: Ajouter à `.env.local`

```env
# Copier la chaîne exactement (ne pas modifier)
DATABASE_URL="postgresql://postgres:xxxxx@postgres.railway.internal:5432/railway?sslmode=require"
```

### Étape 5: Lancer les Migrations

```bash
npm run prisma:migrate

# Output:
# ✓ Prisma schema loaded from prisma/schema.prisma
# ✓ Database schema created
# ✓ Tables created
```

### ✅ Vérifier la Connexion

```bash
npm run prisma:studio

# Une fenêtre du navigateur s'ouvre
# Vous devez voir les tables vides (Subscription, User, etc.)
```

---

## 🖥️ Option 2: PostgreSQL Local

### Windows

#### Étape 1: Installer PostgreSQL

1. Télécharger depuis https://www.postgresql.org/download/windows/
2. Exécuter l'installateur
3. **Password**: Définir un mot de passe (ex: `postgres123`)
4. **Port**: Laisser 5432 (défaut)
5. Finir l'installation

#### Étape 2: Créer une Base de Données

1. Ouvrir "pgAdmin" (vient avec l'installation)
2. Se connecter (username: `postgres`, password: ce que vous avez défini)
3. Right-click "Databases" → "Create" → "Database"
4. Nom: `groomly`
5. Click "Save"

#### Étape 3: Ajouter à `.env.local`

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/groomly?schema=public"
```

Remplacer:
- `YOUR_PASSWORD` par le mot de passe PostgreSQL que vous avez défini
- Exemple: `postgresql://postgres:postgres123@localhost:5432/groomly?schema=public`

#### Étape 4: Lancer les Migrations

```bash
npm run prisma:migrate
```

### Mac

#### Installer avec Homebrew (Plus facile)

```bash
# Installer PostgreSQL
brew install postgresql@15

# Démarrer le service
brew services start postgresql@15

# Créer l'utilisateur (accepter les defaults)
createuser postgres
```

#### Ou installer directement

1. Télécharger depuis https://www.postgresql.org/download/macosx/
2. Suivre l'installateur

#### Créer la Base

```bash
# Se connecter à PostgreSQL
psql -U postgres

# Dans le prompt PostgreSQL:
CREATE DATABASE groomly;

# Quitter
\q
```

#### Ajouter à `.env.local`

```env
DATABASE_URL="postgresql://postgres@localhost:5432/groomly?schema=public"
```

### Linux (Ubuntu/Debian)

```bash
# Installer PostgreSQL
sudo apt-get install postgresql postgresql-contrib

# Démarrer le service
sudo systemctl start postgresql

# Créer la base
sudo -u postgres createdb groomly

# Ajouter à .env.local
# DATABASE_URL="postgresql://postgres@localhost:5432/groomly?schema=public"
```

---

## 🌐 Option 3: Supabase

### Étape 1: Créer un Compte

1. Allez sur https://supabase.com
2. Cliquez "Sign up"
3. Connectez avec GitHub

### Étape 2: Créer un Projet

1. Dashboard → "New Project"
2. Remplissez les infos
3. Attendez ~2 minutes

### Étape 3: Obtenir la Chaîne

1. Settings → Database
2. Cherchez "Connection String"
3. Sélectionnez "URI" (pas Psql)
4. Copier la chaîne

### Étape 4: Ajouter à `.env.local`

```env
DATABASE_URL="postgresql://[user]:[password]@[host]:[port]/[database]"
```

---

## ✅ Tester la Connexion

### Après l'installation, vérifier que tout fonctionne:

```bash
# 1. Vérifier que DATABASE_URL est dans .env.local
cat .env.local | grep DATABASE_URL

# 2. Lancer Prisma Studio pour vérifier la connexion
npm run prisma:studio

# 3. Vous devez voir l'UI avec les tables vides
```

### Erreurs courantes

#### "Database connection refused"
```bash
# Vérifier DATABASE_URL
# Vérifier que PostgreSQL tourne (Railway: automatique)
# Vérifier les credentials (username/password)
```

#### "FATAL: password authentication failed"
```bash
# Le mot de passe est incorrect
# Vérifier la DATABASE_URL
# Exemple bon: postgresql://postgres:PASSWORD@localhost:5432/groomly
```

#### "database "groomly" does not exist"
```bash
# La base n'a pas été créée
# Créer la base:
#   Railway: automatique
#   PostgreSQL local: CREATE DATABASE groomly;
```

---

## 📊 Comprendre la Chaîne de Connexion

```
postgresql://[user]:[password]@[host]:[port]/[database]?schema=public

Exemple réel:
postgresql://postgres:mypassword@localhost:5432/groomly?schema=public

Parties:
├─ postgresql:// - Protocole
├─ postgres - Utilisateur (user)
├─ mypassword - Mot de passe (password)
├─ localhost - Serveur (host)
├─ 5432 - Port (port)
├─ groomly - Nom de la base (database)
└─ ?schema=public - Schéma (Prisma)
```

### Exemples par Plateforme

**Railway:**
```
postgresql://postgres:password@postgres.railway.internal:5432/railway?sslmode=require
```

**PostgreSQL Local (Windows):**
```
postgresql://postgres:password@localhost:5432/groomly?schema=public
```

**PostgreSQL Local (Mac/Linux):**
```
postgresql://postgres@localhost:5432/groomly?schema=public
```

**Supabase:**
```
postgresql://postgres:[password]@db.xxxx.supabase.co:5432/postgres
```

---

## 🚀 Lancer les Migrations

Une fois que `DATABASE_URL` est configurée:

```bash
# Créer les tables
npm run prisma:migrate

# Output:
# ? Enter a name for the new migration: › initial
# ✓ Your database is now in sync with your Prisma schema.
# ✓ Generated Prisma Client to ./node_modules/@prisma/client in 123ms
```

### Si vous avez déjà des migrations:

```bash
# Déployer les migrations existantes
npm run prisma:migrate deploy

# Ou réinitialiser (données perdues!)
npm run prisma:migrate reset
```

---

## 🔍 Explorer la Base de Données

### Avec Prisma Studio (Recommandé)

```bash
# Ouvrir l'UI interactive
npm run prisma:studio

# Affiche: http://localhost:5555
# Vous pouvez explorer toutes les tables
```

### Avec psql (PostgreSQL local)

```bash
# Se connecter à PostgreSQL
psql -U postgres -d groomly

# Voir les tables
\dt

# Voir le schéma d'une table
\d users

# Quitter
\q
```

### Avec Railway Dashboard

1. Allez sur https://railway.app
2. Cliquez sur votre project PostgreSQL
3. Allez à l'onglet "Data"
4. Voir les tables et données

---

## 📦 Schéma des Tables

Après les migrations, vous devez avoir ces tables:

```
Tables:
├─ User (utilisateurs)
├─ Salon (salons de toilettage)
├─ Client (clients des salons)
├─ Animal (animaux des clients)
├─ Service (services proposés)
├─ Appointment (rendez-vous)
├─ InventoryItem (stocks)
└─ Subscription (abonnements Stripe)
```

Voir le schéma complet dans `prisma/schema.prisma`

---

## 🔐 Sécurité

### En Développement
- ✅ PostgreSQL local accepte les connexions non-SSL
- ✅ Password simple ok (ex: `postgres`)

### En Production
- ✅ Utiliser un password fort
- ✅ Activer SSL (Railway: automatique)
- ✅ Limiter les accès (firewall)
- ✅ Backups réguliers
- ✅ Ne JAMAIS exposer DATABASE_URL

---

## 🛠️ Commandes Utiles

```bash
# Voir l'état de la base
npm run prisma:db seed

# Générer le client Prisma
npm run prisma:generate

# Valider le schéma
npm run prisma:validate

# Afficher l'URL de la base
cat .env.local | grep DATABASE_URL

# Se connecter à PostgreSQL (local)
psql -U postgres -d groomly

# Réinitialiser la base (données perdues!)
npm run prisma:migrate reset
```

---

## 📝 Checklist Setup Database

- [ ] Choisir Railway (recommandé) ou PostgreSQL local
- [ ] Créer la base de données
- [ ] Obtenir DATABASE_URL
- [ ] Ajouter DATABASE_URL à `.env.local`
- [ ] Redémarrer le serveur Next.js
- [ ] Lancer les migrations: `npm run prisma:migrate`
- [ ] Vérifier avec Prisma Studio: `npm run prisma:studio`
- [ ] Voir les tables vides (User, Salon, Client, etc.)

---

## ✨ Après la Configuration

Une fois que la base est configurée:

1. L'authentification fonctionnera (enregistrement créera des User)
2. Les données seront persistées (vraie base de données)
3. Les webhooks Stripe pourront créer des Subscription
4. Tout est prêt pour le testing!

**Prochaine étape**: [NGROK_SETUP.md](NGROK_SETUP.md) pour les webhooks

---

## 🆘 Besoin d'Aide?

### Railway ne se connecte pas
- Vérifier que la DATABASE_URL est correcte
- Attendre un peu (Railway peut être lent)
- Vérifier les logs: Settings → Logs

### PostgreSQL local ne démarre pas
- Windows: Ouvrir "Services" et chercher PostgreSQL
- Mac: `brew services restart postgresql@15`
- Linux: `sudo systemctl start postgresql`

### Migrations échouent
- Vérifier la DATABASE_URL
- Vérifier que la base existe
- Vérifier les permisions (utilisateur a accès)

### Erreur de permissions
- Railway: généralement résolu automatiquement
- Local: Vérifier que l'utilisateur a les bons droits
  ```bash
  ALTER USER postgres CREATEDB;
  ```

---

**Bon setup! 🎉**
