# 🛡️ Admin Dashboard - Guide d'Utilisation Complet

## 📋 Vue d'ensemble

Vous avez maintenant un **système complet de monitoring et alertes** pour Groomly avec:
- ✅ Dashboard admin global
- ✅ 9 sections de gestion (Erreurs, Activité, Interactions, Usage, Performance, Webhooks, Tickets, Users, Analytics)
- ✅ 10+ API endpoints pour logger et suivre tout
- ✅ Système de webhooks pour alerter en temps réel (Slack, Discord, Email)
- ✅ Base de données avec 5 tables de monitoring

---

## 🎯 Accès Admin

**Pour devenir administrateur Groomly:**

```bash
# Se connecter à la base de données
npx prisma studio

# Ou créer un admin par script:
npx ts-node --esm -P tsconfig.json scripts/create-admin.ts your_email@example.com password123
```

**Puis dans l'interface:**
1. Allez sur `/auth/login`
2. Connectez-vous avec vos identifiants admin
3. Cliquez "Admin Groomly" dans la sidebar
4. Accédez à `/admin`

---

## 📊 Les 9 Sections Admin

### 1. **📈 Dashboard Principal** (`/admin`)
- Vue d'ensemble des stats clés (utilisateurs, salons, abonnements)
- Revenus MRR et total
- Churn rate
- Accès rapide à toutes les autres sections
- Signaux d'alerte automatiques

### 2. **🚨 Erreurs** (`/admin/errors`)
Monitoring des bugs en production

**Vue:**
- Liste de toutes les erreurs enregistrées
- Filtrer par sévérité (critical, error, warning)
- Filtrer par résolu/non résolu
- Stack traces et URL de l'erreur
- Timestamp de détection

**Utilisation:**
```typescript
// Depuis n'importe quel code:
import { logError } from '@/lib/logger'

await logError({
  message: 'Impossible de charger les clients',
  severity: 'error',
  stack: error.stack,
  url: window.location.href,
})
```

### 3. **📊 Activité Utilisateur** (`/admin/activity`)
Journal complet de toutes les actions

**Suivi automatique:**
- Créations (create)
- Modifications (update)
- Suppressions (delete)
- Connexions/déconnexions (login, logout)
- Imports/exports
- Visualisations

**Utilisation:**
```typescript
import { logActivity } from '@/lib/logger'

// Logger une action
await logActivity({
  action: 'create',
  resource: 'Client',
  userId: session.user.id,
  resourceId: client.id,
  salonId: salon.id,
  newValue: clientData,
})
```

### 4. **💬 Interactions Utilisateur** (`/admin/interactions`)
Feedback, demandes de features, bug reports

**Types trackés:**
- `support_ticket` - Tickets de support
- `feature_request` - Demandes de features
- `bug_report` - Reports de bugs
- `feedback` - Retours utilisateurs
- `question` - Questions

**Utilisation:**
```typescript
import { logInteraction } from '@/lib/logger'

await logInteraction({
  type: 'bug_report',
  subject: 'Calendrier ne charge pas',
  description: 'Le calendrier ne se charge pas après le login...',
  userId: session.user.id,
  salonId: session.user.salonId,
  priority: 'high',
  requiresReply: true,
})
```

### 5. **📈 Usage (Utilisation Features)** (`/admin/usage`)
Quelles features sont utilisées et par qui

**Affiche:**
- Feature la plus utilisée
- Comparaison % de chaque feature
- Temps total passé par feature
- Nombre d'items traités

**Utilisation:**
```typescript
import { logFeatureUsage } from '@/lib/logger'

const start = Date.now()
// ... user utilise la feature ...
const duration = Date.now() - start

await logFeatureUsage({
  featureName: 'appointments',
  action: 'view',
  userId: session.user.id,
  salonId: session.user.salonId,
  duration,
  itemCount: appointments.length,
})
```

### 6. **⚡ Performance** (`/admin/performance`)
Monitoring des temps de réponse et bottlenecks

**Affiche:**
- Temps moyen par endpoint
- Requêtes lentes (> 1000ms)
-  Min/Max temps
- Nombre de requêtes

**Utilisation:**
```typescript
import { logPerformanceMetric, measurePerformance } from '@/lib/logger'

// Option 1: Logger manuellement
await logPerformanceMetric({
  metric: 'api_fetch_clients',
  value: duration,
  endpoint: 'GET /api/clients',
  isSlowQuery: duration > 1000,
})

// Option 2: Mesurer automatiquement
const results = await measurePerformance(
  'database_query',
  () => prisma.client.findMany(),
  'GET /api/clients'
)
```

### 7. **🔔 Webhooks & Alertes** (`/admin/webhooks`)
Notifications en temps réel des erreurs critiques

**Services supportés:**
- 💬 **Slack** - Notifications dans un canal Slack
- 🎮 **Discord** - Messages embeds Discord
- 📧 **Email** - Emails d'alerte

**Configuration:**

```bash
# Dans .env.local:
SLACK_CRITICAL_WEBHOOK=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
DISCORD_CRITICAL_WEBHOOK=https://discordapp.com/api/webhooks/...
ALERT_EMAIL_ADDRESS=admin@groomly.fr
```

**Comment ça marche:**
1. Une erreur critique est loggée
2. Un webhook est envoyé automatiquement
3. Vous recevez une notification Slack/Discord/Email immédiatement

**Pour tester:**
1. Allez sur `/admin/webhooks`
2. Entrez un message de test
3. Cliquez "Envoyer notification de test"
4. Vérifiez que vous avez reçu l'alerte

### 8. **🎫 Support Tickets** (`/admin/tickets`)
Gestion des tickets de support client

**Affiche:**
- Liste de tous les tickets
- Filtrer par statut (open, in_progress, resolved, closed)
- Filtrer par priorité (low, normal, high, urgent)
- Nombre de messages par ticket
- Salon concerné (MAINTENANT CORRIGÉ ✅)

**Statuts:**
- `open` - Nouveau ticket
- `in_progress` - En cours de traitement
- `waiting_customer` - En attente de réponse client
- `resolved` - Résolu
- `closed` - Fermé définitivement

### 9. **👥 Gestion des Utilisateurs** (`/admin/users`)
Gérer les comptes utilisateurs

**Fonctionnalités:**
- Lister tous les utilisateurs
- Chercher par email
- Toggle admin (promouvoir/rétrograder)
- Suspendre un compte (soft delete)

---

## 📡 API & Intégrations

### Endpoints Disponibles

**Erreurs:**
```
GET /api/admin/errors?severity=critical&resolved=false
POST /api/admin/errors
```

**Activité:**
```
GET /api/admin/activity?action=create&resource=Client
POST /api/admin/activity
```

**Interactions:**
```
GET /api/admin/interactions?type=bug_report&status=open
POST /api/admin/interactions
PUT /api/admin/interactions?id=...
```

**Usage:**
```
GET /api/admin/usage?featureName=appointments&days=30
POST /api/admin/usage
```

**Performance:**
```
GET /api/admin/performance?metric=api_response_time&isSlowQuery=true
POST /api/admin/performance
```

**Webhooks:**
```
GET /api/admin/webhooks
POST /api/admin/webhooks (test)
```

**Tickets:**
```
GET /api/admin/tickets?status=open&priority=urgent
```

**Users:**
```
GET /api/admin/users?email=test@example.com
PUT /api/admin/users/[id]
```

**Analytics:**
```
GET /api/admin/analytics
```

---

## 🧰 Utilitaires de Logging

Import depuis `@/lib/logger`:

```typescript
// 1. Logger une erreur
import { logError } from '@/lib/logger'
await logError({
  message: 'String',
  severity: 'error' | 'warning' | 'critical',
  stack?: Error.stack,
  url?: window.location.href,
})

// 2. Logger une activité
import { logActivity } from '@/lib/logger'
await logActivity({
  action: 'create' | 'update' | 'delete' | 'login' | 'logout' | 'import' | 'export',
  resource: 'Client' | 'User' | 'Appointment' | '...',
  userId: string,
  resourceId?: string,
  salonId?: string,
  oldValue?: object,
  newValue?: object,
})

// 3. Logger une interaction
import { logInteraction } from '@/lib/logger'
await logInteraction({
  type: 'support_ticket' | 'feature_request' | 'bug_report' | 'feedback' | 'question',
  subject?: string,
  description: string,
  userId: string,
  salonId?: string,
  priority?: 'low' | 'normal' | 'high' | 'urgent',
  requiresReply?: boolean,
})

// 4. Logger usage d'une feature
import { logFeatureUsage } from '@/lib/logger'
await logFeatureUsage({
  featureName: 'appointments' | 'invoicing' | '...',
  action: 'view' | 'create' | 'update' | 'export',
  userId: string,
  salonId: string,
  duration?: number, // millisecondes
  itemCount?: number,
})

// 5. Logger une métrique de performance
import { logPerformanceMetric } from '@/lib/logger'
await logPerformanceMetric({
  metric: 'api_response_time' | '...',
  value: number, // millisecondes
  endpoint?: 'GET /api/clients',
  isSlowQuery?: boolean,
})

// 6. Mesurer automatiquement
import { measurePerformance } from '@/lib/logger'
const result = await measurePerformance(
  'metric_name',
  () => somePromise(),
  'endpoint_url'
)
```

---

## 🔐 Sécurité

**Tous les endpoints admin sont protégés:**
- ✅ Nécessitent `session.user.isAdmin === true`
- ✅ Vérifi authentification NextAuth
- ✅ Retournent 403 si accès refusé

**Données sensibles:**
- ❌ Les mots de passe ne sont jamais loggés
- ❌ Les données personnelles sont minimisées
- ✅ Audit trail complet disponible

---

## 📚 Exemples d'Intégration

### Exemple 1: Logger une erreur lors du chargement

```typescript
try {
  const clients = await fetch('/api/clients')
  if (!clients.ok) throw new Error('Failed to load clients')
} catch (error) {
  await logError({
    message: `Failed to load clients: ${error.message}`,
    severity: 'error',
    stack: error.stack,
    url: window.location.href,
  })
  toast.error('Impossible de charger les clients')
}
```

### Exemple 2: Logger un formulaire soumis

```typescript
const handleSubmit = async (data) => {
  await logActivity({
    action: 'create',
    resource: 'Client',
    userId: session.user.id,
    salonId: session.user.salonId,
    newValue: data,
  })
  
  // Soumettre le formulaire...
}
```

### Exemple 3: Logger une feature utilisée

```typescript
const generateReport = async () => {
  const start = Date.now()
  
  try {
    const report = await generatePDFReport()
    
    const duration = Date.now() - start
    await logFeatureUsage({
      featureName: 'reports',
      action: 'export',
      userId: session.user.id,
      salonId: session.user.salonId,
      duration,
      itemCount: report.pageCount,
    })
    
    return report
  } catch (error) {
    await logError({
      message: 'Failed to generate report',
      severity: 'critical',
      stack: error.stack,
    })
  }
}
```

---

## 📊 Cas d'Usage Courants

### 1. **Trouver pourquoi un utilisateur a un problème**
1. Aller sur `/admin/activity`
2. Chercher par userId de l'utilisateur
3. Voir exactement quelles actions il a faites
4. Chercher les erreurs sur `/admin/errors` au même moment

### 2. **Identifier les features non utilisées**
1. Aller sur `/admin/usage`
2. Voir le % d'utilisation par feature
3. Identifier celles avec 0% d'usage
4. Envisager de simplifier ou documenter mieux

### 3. **Détecter les bottlenecks**
1. Aller sur `/admin/performance`
2. Chercher les endpoints lents (> 1000ms)
3. Analyser et optimiser les requêtes DB

### 4. **Prioriser les features à développer**
1. Aller sur `/admin/interactions`
2. Chercher les bug_reports et feature_requests
3. Compter les votes par type
4. Développer ce qui est demandé le plus

### 5. **Suivi des erreurs critiques**
1. Configurer les webhooks (`/admin/webhooks`)
2. Recevoir les alertes immédiatement
3. Corriger rapidement les problèmes

---

## 💡 Bonnes Pratiques

✅ **À faire:**
- Logger les erreurs au moment où elles se produisent
- Inclure des détails utiles (stack, URL, contexte)
- Utiliser les sévérités correctement (critical pour urgent)
- Monitorer régulièrement `/admin/performance`

❌ **À éviter:**
- Logger les données sensibles (passwords, tokens)
- Logger trop souvent (risque de saturation DB)
- Ignorer les erreurs, les logger toujours

---

## 🚀 Prochaines Étapes

1. **Configurer webhooks** pour les alertes Slack/Discord
2. **Intégrer logError** dans vos route handlers
3. **Ajouter logActivity** aux actions importantes
4. **Monitorer** les pages `/admin/*` régulièrement
5. **Optimiser** basé sur les métriques de performance

---

## ❓ FAQ

**Q: Comment je deviens admin?**
A: Utilisez le script `scripts/create-admin.ts` ou modifiez directement `isAdmin: true` dans la DB

**Q: Qui peut accéder aux pages admin?**
A: Seulement les utilisateurs avec `isAdmin === true`

**Q: Combien de temps les logs sont gardés?**
A: Indéfiniment (configurable via script de nettoyage si désiré)

**Q: Comment recevoir les alertes?**
A: Configurez `SLACK_CRITICAL_WEBHOOK` ou `DISCORD_CRITICAL_WEBHOOK` dans `.env.local`

**Q: Que se passe-t-il si Slack/Discord est down?**
A: Les webhooks retentent automatiquement 3 fois avec délai croissant

---

**Dernière mise à jour:** 2026-02-05
**Tableau de bord créé:** Migration Prisma + 10+ pages + API + Logging
