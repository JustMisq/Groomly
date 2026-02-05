# 🛡️ Admin Dashboard Groomly

## 📍 Accès

L'Admin Dashboard est accessible à `/admin` **uniquement pour les utilisateurs marqués comme admins** dans la base de données.

### Comment créer un admin?

#### Option 1: Script (Recommandé)

```bash
npx ts-node --esm -P tsconfig.json scripts/create-admin.ts admin@groomly.fr MonMotDePasse123
```

#### Option 2: SQL Direct

```sql
UPDATE "User" SET "isAdmin" = true WHERE email = 'your-email@example.com';
```

#### Option 3: Via le code

```typescript
await prisma.user.update({
  where: { email: 'admin@groomly.fr' },
  data: { isAdmin: true }
})
```

---

## 📊 Sections Admin

### 1. **Dashboard** (`/admin`)
Vue d'ensemble avec:
- 📈 Statistiques globales (utilisateurs, salons, souscriptions)
- 💰 MRR (Monthly Recurring Revenue)
- 📉 Churn Rate
- 🎫 Tickets en attente
- ⚠️ Signaux d'alerte

### 2. **Utilisateurs** (`/admin/users`)
Gestion complète des comptes:
- Liste de tous les utilisateurs/salons
- Recherche par email
- **Toggle Admin** - Accorder/Retirer les permissions admin
- **Suspendre** - Soft delete des utilisateurs
- Affichage du statut de souscription

### 3. **Support Tickets** (`/admin/tickets`)
Gestion des demandes clients:
- Liste tous les tickets avec filtres
- Filtrer par statut (Ouvert, En cours, Résolu, Fermé)
- Filtrer par priorité (Urgent, Haute, Normale, Basse)
- Modifier le statut directement
- Voir le nombre de messages par ticket
- Affichage du client et salon associé

### 4. **Analytics** (`/admin/analytics`)
Métriques détaillées de la plateforme:
- **Revenus**: Total, MRR, ARR
- **Utilisateurs**: Total, Actifs, Nouveaux ce mois
- **Métriques clés**:
  - LTV (Lifetime Value)
  - CAC (Customer Acquisition Cost)
  - Payback Period
  - Churn Rate
- **Tendance**: 6 derniers mois (utilisateurs + revenus)

### 5. **Logs Globaux** (`/admin/logs`)
Audit trail complet:
- Logs de toutes les actions de la plateforme
- Filtrer par type d'action
- Filtrer par niveau (Info, Warning, Error)
- Pagination (100 par page)
- Voir détails: utilisateur, salon, description

---

## 🔐 Sécurité

✅ **Toutes les routes admin nécessitent:**
- Authentification valide
- Flag `isAdmin: true` sur l'utilisateur
- Vérification côté serveur + client

✅ **Données sensibles protégées:**
- Les soft deletes (utilisateurs) sont gérés via `deletedAt`
- Les changements d'admin sont loggés
- Pas d'accès direct aux mots de passe

---

## 🚀 API Admin

### GET `/api/admin/stats`
Statistiques globales en JSON

### GET `/api/admin/users?page=1&search=email`
Liste des utilisateurs avec pagination

### PUT `/api/admin/users/[id]`
Modifier un utilisateur (isAdmin)

### POST `/api/admin/users/[id]/suspend`
Suspendre un utilisateur

### GET `/api/admin/tickets?status=open&priority=urgent`
Liste des tickets avec filtres

### PUT `/api/admin/tickets/[id]`
Modifier un ticket (status, priority)

### GET `/api/admin/analytics`
Métriques détaillées (MRR, LTV, Churn, etc.)

### GET `/api/admin/logs?page=1&action=user_created`
Logs globaux avec filtres

---

## 📋 Fonctionnalités Futures

- [ ] Éditer les salons/utilisateurs
- [ ] Voir les détails d'un salon
- [ ] Dashboard utilisateur (vue du salon)
- [ ] Export des données (CSV)
- [ ] Graphiques détaillés (Chart.js)
- [ ] Gestion des coupon/promo codes
- [ ] Statistiques par période (dates custom)
- [ ] Notifications admin (emails de support)

---

## 🧪 Tester Localement

```bash
# 1. Créer un admin
npx ts-node --esm -P tsconfig.json scripts/create-admin.ts admin@localhost.fr password

# 2. Se connecter à /auth/login
# Email: admin@localhost.fr
# Password: password

# 3. Dans le dashboard, voir le lien "Admin Groomly" 🛡️
# Cliquer pour accéder à /admin
```

---

## 📧 Support

Pour des questions sur l'admin panel:
- Email: hello@groomly.fr (à set up)
- Documentation: `/legal` pages pour les politiques
