# 🚀 Groomly - Plan d'Amélioration Pré-Production

## Synthèse Exécutive

Ce document présente une roadmap priorisée pour consolider Groomly avant mise en production, en distinguant ce qui est **critique maintenant** de ce qui peut attendre.

---

## 📊 État des Lieux

### ✅ Déjà Implémenté
- Authentification NextAuth + sessions JWT
- Gestion complète : clients, animaux, RDV, services, factures, stock
- Intégration Stripe avec webhooks
- Dashboard KPI basique
- Export données RGPD (JSON + CSV)
- Suppression compte/données

### 🆕 Ajouté dans cette itération
- [x] Schema enrichi (soft delete, statuts RDV, notes internes)
- [x] Fiche santé/comportement animal
- [x] Validation Zod pour toutes les entités
- [x] Rate limiting API
- [x] Système d'audit log
- [x] API statistiques avancées
- [x] Composant dashboard enrichi
- [x] Mode démo avec données fictives
- [x] Infos légales salon (SIRET, TVA, mentions factures)

---

## 📋 CHECKLIST PRIORISÉE

### 🔴 PHASE 1 - CRITIQUE (Avant production)

| Priorité | Tâche | Status | Fichiers |
|----------|-------|--------|----------|
| P0 | Migrer le schema Prisma | ⏳ | `prisma/schema.prisma` |
| P0 | Tester les APIs avec nouvelles validations | ⏳ | `src/lib/validations.ts` |
| P0 | Implémenter rate limit sur routes sensibles | ⏳ | `src/lib/rate-limit.ts` |
| P1 | Formulaire infos légales salon | ⏳ | À créer dans settings |
| P1 | Afficher mentions légales sur factures PDF | ⏳ | À créer |

### 🟠 PHASE 2 - ROI MÉTIER (Post-lancement, 1-2 mois)

| Priorité | Tâche | Effort | Impact |
|----------|-------|--------|--------|
| P2 | Rappels email 24h avant RDV | Moyen | 🔥 Fort |
| P2 | Workflow no-show + pénalités | Moyen | 🔥 Fort |
| P2 | Politique annulation tardive | Faible | 💰 Moyen |
| P3 | Rôles & permissions (owner/staff) | Élevé | 📈 Moyen |

### 🟢 PHASE 3 - DIFFÉRENCIATION (3-6 mois)

| Priorité | Tâche | Effort | Impact |
|----------|-------|--------|--------|
| P4 | Photos avant/après | Moyen | ⭐ Différenciant |
| P4 | Export comptable FEC | Moyen | 🏢 Pro |
| P4 | Dashboard personnalisable | Élevé | ⭐ Différenciant |

---

## 📁 Fichiers Créés/Modifiés

### Nouveaux fichiers

```
src/
├── lib/
│   ├── validations.ts      # Schemas Zod pour validation
│   ├── rate-limit.ts       # Middleware rate limiting
│   ├── audit.ts            # Système d'audit log
│   └── demo-data.ts        # Génération données démo
├── app/api/
│   ├── stats/route.ts      # API statistiques avancées
│   └── demo-data/route.ts  # API mode démo
└── components/
    ├── advanced-stats.tsx      # Dashboard enrichi
    └── animal-health-form.tsx  # Fiche santé animal
```

### Schema Prisma enrichi

Nouveaux champs ajoutés :

**User**
- `role` : owner, staff, readonly
- `deletedAt` : soft delete

**Client**
- `privateNotes` : notes confidentielles
- `deletedAt` : soft delete

**Animal**
- `weight` : poids en kg
- `temperament` : calme, anxieux, joueur, agressif, mixte
- `allergies` : allergies connues
- `healthNotes` : contraintes santé
- `groomingNotes` : préférences toilettage
- `lastGrooming` : dernier toilettage
- `deletedAt` : soft delete

**Appointment**
- `internalNotes` : notes staff
- `cancellationReason` : raison annulation
- `cancelledAt` : date annulation
- `isLateCancel` : annulation < 24h
- `deletedAt` : soft delete
- Nouveaux statuts : confirmed, in_progress, no_show

**Invoice**
- `dueDate` : date échéance
- `paymentMethod` : cash, card, transfer, check
- `deletedAt` : soft delete
- Nouveau statut : overdue

**Salon**
- `siret` : numéro SIRET
- `tvaNumber` : TVA intracommunautaire
- `legalName` : raison sociale
- `legalForm` : forme juridique
- `invoiceTerms` : conditions paiement
- `invoiceNotes` : mentions légales factures

**Nouveaux modèles**
- `AuditLog` : journal d'audit
- `Reminder` : rappels automatiques

---

## 🔧 Actions Immédiates

### 1. Migrer la base de données

```bash
npm run prisma:migrate
```

### 2. Intégrer le rate limiting aux routes sensibles

Ajouter au début des routes API :

```typescript
import { checkRateLimit } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  const rateLimitResponse = checkRateLimit(request, 'create')
  if (rateLimitResponse) return rateLimitResponse
  
  // ... reste du code
}
```

### 3. Intégrer la validation Zod

```typescript
import { clientSchema, validateRequest } from '@/lib/validations'

const validation = validateRequest(clientSchema, body)
if (!validation.success) {
  return NextResponse.json(
    { message: 'Validation error', errors: validation.errors },
    { status: 400 }
  )
}
```

### 4. Activer le dashboard avancé

Dans `src/app/dashboard/(protected)/page.tsx`, remplacer les StatCards par :

```tsx
import AdvancedStats from '@/components/advanced-stats'

// Dans le return
<AdvancedStats />
```

### 5. Générer des données démo

```bash
# Via API
curl -X POST http://localhost:3000/api/demo-data
```

---

## 📈 KPIs Dashboard Enrichi

Le nouveau dashboard affiche :

| KPI | Description | Seuil d'alerte |
|-----|-------------|----------------|
| Revenu période | Total TTC factures payées | - |
| Panier moyen | Revenu / nb factures | - |
| Taux no-show | No-shows / total RDV | > 10% ⚠️ |
| Taux annulation | Annulés / total RDV | > 15% ⚠️ |
| Conversion paiement | Payées / RDV complétés | < 70% ⚠️ |
| Clients actifs | Clients avec RDV < 30j | - |
| Top 5 services | Par nombre de RDV | - |
| Évolution vs N-1 | % croissance | - |

---

## 🔒 Sécurité Pragmatique

### Implémenté
- [x] Rate limiting (100 req/min standard, 10 req/min auth)
- [x] Validation Zod sur entrées
- [x] Soft delete (traçabilité)
- [x] Audit log (actions critiques)

### À faire (Phase 2)
- [ ] HTTPS obligatoire (Vercel)
- [ ] CSP headers
- [ ] Sanitization XSS
- [ ] 2FA optionnel

---

## 💡 Recommandations Business

### Court terme (avant lancement)
1. **Compléter les infos légales** : formulaire SIRET/TVA dans settings
2. **Tester le mode démo** : onboarding utilisateurs
3. **Vérifier les exports CSV** : format comptable

### Moyen terme (1-3 mois)
1. **Rappels email** : Resend ou SendGrid, CRON ou Edge Functions
2. **Politique no-show** : frais après 2 absences
3. **Multi-utilisateurs** : rôles staff/readonly

### Long terme (6 mois+)
1. **App mobile** : PWA ou React Native
2. **Intégration calendrier** : Google/Outlook sync
3. **Analytics avancées** : prédiction churn

---

## 📞 Support

Pour toute question sur cette roadmap :
- Revoir les fichiers de référence dans `docs/`
- Tester en local avec `npm run dev`
- Vérifier les logs Prisma avec `npm run prisma:studio`
