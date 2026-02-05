# 🚀 Snippets - Intégration Logging (Copy-Paste Ready)

## 1️⃣ Dans une Route API (Next.js)

```typescript
// src/app/api/clients/route.ts
import { logActivity, logError, logPerformanceMetric } from '@/lib/logger'
import { getServerSession } from 'next-auth/next'

export async function POST(request: Request) {
  const start = Date.now()
  const session = await getServerSession()

  try {
    const data = await request.json()

    // Créer le client
    const client = await prisma.client.create({
      data: {
        ...data,
        salonId: session.user.salonId,
      },
    })

    // Logger l'activité
    await logActivity({
      action: 'create',
      resource: 'Client',
      userId: session.user.id,
      resourceId: client.id,
      salonId: session.user.salonId,
      newValue: client,
    })

    // Logger la performance
    const duration = Date.now() - start
    if (duration > 500) {
      await logPerformanceMetric({
        metric: 'create_client',
        value: duration,
        endpoint: 'POST /api/clients',
      })
    }

    return Response.json(client, { status: 201 })
  } catch (error) {
    // Logger l'erreur
    await logError({
      message: `Failed to create client: ${error.message}`,
      severity: 'error',
      stack: error.stack,
      url: request.url,
      method: 'POST',
    })

    return Response.json({ error: error.message }, { status: 500 })
  }
}
```

---

## 2️⃣ Dans un Composant Client

```typescript
// src/app/dashboard/clients/page.tsx
'use client'

import { logError, logActivity, logFeatureUsage } from '@/lib/logger'
import { useSession } from 'next-auth/react'
import { useState } from 'react'

export default function ClientsPage() {
  const { data: session } = useSession()
  const [clients, setClients] = useState([])

  const loadClients = async () => {
    try {
      const start = Date.now()
      const res = await fetch('/api/clients')
      if (!res.ok) throw new Error('Failed to load')

      const data = await res.json()
      setClients(data)

      // Logger l'usage
      await logFeatureUsage({
        featureName: 'clients',
        action: 'view',
        userId: session.user.id,
        salonId: session.user.salonId,
        duration: Date.now() - start,
        itemCount: data.length,
      })
    } catch (error) {
      // Logger l'erreur
      await logError({
        message: 'Failed to load clients',
        severity: 'error',
        stack: error.stack,
      })
    }
  }

  const deleteClient = async (clientId: string) => {
    try {
      const res = await fetch(`/api/clients/${clientId}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Delete failed')

      // Logger l'activité
      await logActivity({
        action: 'delete',
        resource: 'Client',
        userId: session.user.id,
        resourceId: clientId,
        salonId: session.user.salonId,
      })

      setClients(clients.filter(c => c.id !== clientId))
      toast.success('Client supprimé')
    } catch (error) {
      await logError({
        message: 'Failed to delete client',
        severity: 'error',
      })
    }
  }

  return (
    // ... JSX ...
  )
}
```

---

## 3️⃣ Dans un Gestionnaire de Formulaire

```typescript
// Créer un client via formulaire
const handleCreateClient = async (formData) => {
  const start = Date.now()

  try {
    const res = await fetch('/api/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })

    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.message)
    }

    const client = await res.json()

    // Logger l'activité
    await logActivity({
      action: 'create',
      resource: 'Client',
      userId: session.user.id,
      resourceId: client.id,
      salonId: session.user.salonId,
      newValue: formData,
    })

    // Logger l'usage de la feature
    await logFeatureUsage({
      featureName: 'clients',
      action: 'create',
      userId: session.user.id,
      salonId: session.user.salonId,
      duration: Date.now() - start,
    })

    toast.success('Client créé avec succès!')
    router.push('/dashboard/clients')
  } catch (error) {
    await logError({
      message: `Error creating client: ${error.message}`,
      severity: 'error',
    })
    toast.error('Erreur: ' + error.message)
  }
}
```

---

## 4️⃣ Generateur de Rapport avec Tracking

```typescript
// Exporter un rapport PDF
const generateReport = async () => {
  const start = Date.now()

  try {
    // Mesurer automatiquement la performance
    const report = await measurePerformance(
      'generate_report',
      async () => {
        const res = await fetch('/api/reports/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(reportParams),
        })
        return res.blob()
      },
      'POST /api/reports/generate'
    )

    const duration = Date.now() - start

    // Logger l'usage
    await logFeatureUsage({
      featureName: 'reports',
      action: 'export',
      userId: session.user.id,
      salonId: session.user.salonId,
      duration,
    })

    // Télécharger
    const url = URL.createObjectURL(report)
    const a = document.createElement('a')
    a.href = url
    a.download = 'rapport.pdf'
    a.click()

    toast.success('Rapport généré avec succès!')
  } catch (error) {
    await logError({
      message: 'Failed to generate report',
      severity: 'critical',
      stack: error.stack,
    })
    toast.error('Erreur lors de la génération du rapport')
  }
}
```

---

## 5️⃣ Logging Global des Erreurs

```typescript
// Configuration globale (dans _app.tsx ou layout.tsx)
import { logError } from '@/lib/logger'

// Catcher les erreurs non gérées
if (typeof window !== 'undefined') {
  window.addEventListener('error', async (event) => {
    await logError({
      message: 'Uncaught error: ' + event.message,
      severity: 'critical',
      stack: event.error?.stack,
      url: window.location.href,
      userAgent: navigator.userAgent,
    })
  })

  window.addEventListener('unhandledrejection', async (event) => {
    await logError({
      message: 'Unhandled promise rejection: ' + event.reason,
      severity: 'critical',
      url: window.location.href,
    })
  })
}
```

---

## 6️⃣ Feedback Modal avec Interaction Logging

```typescript
// Composant pour recueillir le feedback utilisateur
'use client'

import { logInteraction } from '@/lib/logger'
import { useState } from 'react'

export function FeedbackButton() {
  const [open, setOpen] = useState(false)
  const [type, setType] = useState<'feedback' | 'bug_report' | 'feature_request'>('feedback')
  const [message, setMessage] = useState('')

  const submit = async () => {
    try {
      await logInteraction({
        type,
        description: message,
        userId: session.user.id,
        salonId: session.user.salonId,
        priority: 'normal',
        requiresReply: true,
      })

      toast.success('Thank you for your feedback!')
      setMessage('')
      setOpen(false)
    } catch (error) {
      toast.error('Failed to send feedback')
    }
  }

  return (
    <>
      <button onClick={() => setOpen(true)}>Feedback</button>
      {open && (
        <div className="modal">
          <select value={type} onChange={(e) => setType(e.target.value as any)}>
            <option value="feedback">Feedback</option>
            <option value="bug_report">Bug Report</option>
            <option value="feature_request">Feature Request</option>
          </select>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tell us what you think..."
          />
          <button onClick={submit}>Send</button>
        </div>
      )}
    </>
  )
}
```

---

## 7️⃣ Protection avec Try-Catch Avancée

```typescript
// Wrapper pour routes API avec logging automatique
import { logError, logActivity, logPerformanceMetric } from '@/lib/logger'

export function withErrorHandling(handler: any) {
  return async (request: any) => {
    const start = Date.now()
    const method = request.method
    const url = request.url

    try {
      const response = await handler(request)
      const duration = Date.now() - start

      // Logger les requêtes lentes
      if (duration > 1000) {
        await logPerformanceMetric({
          metric: `${method} ${url}`,
          value: duration,
          endpoint: `${method} ${new URL(url).pathname}`,
          isSlowQuery: true,
        })
      }

      return response
    } catch (error) {
      const duration = Date.now() - start

      await logError({
        message: `${method} ${url} failed: ${error.message}`,
        severity: 'error',
        stack: error.stack,
        url,
        method,
      })

      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500 }
      )
    }
  }
}

// Utilisation:
// export const POST = withErrorHandling(async (request) => { ... })
```

---

## 8️⃣ Webhook Test depuis le Frontend

```typescript
// Tester les webhooks depuis l'admin panel
const testWebhooks = async () => {
  const message = 'Test message from ' + new Date().toLocaleTimeString()

  try {
    const res = await fetch('/api/admin/webhooks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ testMessage: message }),
    })

    const data = await res.json()
    toast.success(`${data.message} - Check Slack/Discord!`)
  } catch (error) {
    toast.error('Webhook test failed')
  }
}
```

---

## Checkliste d'Intégration

- [ ] Installer les imports de logger dans 5+ route handlers
- [ ] Ajouter logError dans try-catch principaux
- [ ] Logger les actions de formulaire importantes
- [ ] Ajouter logFeatureUsage aux features complexes
- [ ] Configurer webhooks Slack/Discord
- [ ] Tester `/admin/errors` et `/admin/activity`
- [ ] Monitorer `/admin/performance` pour optimiser
- [ ] Créer des rapports basé sur `/admin/analytics`
- [ ] Former le team sur comment utiliser l'admin
- [ ] Mettre en place des alertes pour les erreurs critiques

---

**Happy logging! 📊**
