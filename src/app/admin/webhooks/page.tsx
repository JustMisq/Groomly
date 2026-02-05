'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface Webhook {
  id: string
  type: 'slack' | 'discord' | 'email'
  url: string
  severityLevel: string
  enabled: boolean
}

export default function AdminWebhooksPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [webhooks, setWebhooks] = useState<Webhook[]>([])
  const [loading, setLoading] = useState(true)
  const [testMessage, setTestMessage] = useState('')
  const [sendingTest, setSendingTest] = useState(false)

  useEffect(() => {
    if (session && !session.user?.isAdmin) {
      router.push('/dashboard')
    } else if (session) {
      fetchWebhooks()
    }
  }, [session, router])

  const fetchWebhooks = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/webhooks')
      if (!res.ok) throw new Error('Erreur')

      const data = await res.json()
      setWebhooks(data.webhooks || [])
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Impossible de charger les webhooks')
    } finally {
      setLoading(false)
    }
  }

  const sendTestNotification = async () => {
    try {
      setSendingTest(true)
      const res = await fetch('/api/admin/webhooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testMessage: testMessage || 'Test de notification webhook depuis Groomly',
        }),
      })

      if (!res.ok) throw new Error('Erreur')

      const data = await res.json()
      toast.success(`✅ ${data.message}`)
      setTestMessage('')
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors de l\'envoi du test')
    } finally {
      setSendingTest(false)
    }
  }

  const getWebhookIcon = (type: string) => {
    switch (type) {
      case 'slack':
        return '💬'
      case 'discord':
        return '🎮'
      case 'email':
        return '📧'
      default:
        return '🔗'
    }
  }

  if (!session?.user?.isAdmin) {
    return <div className="p-8"><p className="text-gray-600">Accès refusé</p></div>
  }

  if (loading) {
    return <div className="p-8"><div className="animate-spin text-4xl">⏳</div></div>
  }

  return (
    <div className="space-y-6 p-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">🔔 Webhooks & Alertes</h1>
          <p className="text-gray-600 mt-2">Notifications en temps réel des erreurs critiques</p>
        </div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          ← Retour
        </Link>
      </div>

      {/* Instructions de configuration */}
      <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-3">⚙️ Configuration</h3>
        <div className="text-sm text-blue-800 space-y-2">
          <p>
            <strong>Slack:</strong> Ajouter la variable{' '}
            <code className="bg-white px-2 py-1 rounded">SLACK_CRITICAL_WEBHOOK</code>
          </p>
          <p>
            <strong>Discord:</strong> Ajouter la variable{' '}
            <code className="bg-white px-2 py-1 rounded">DISCORD_CRITICAL_WEBHOOK</code>
          </p>
          <p>
            <strong>Email:</strong> Ajouter la variable{' '}
            <code className="bg-white px-2 py-1 rounded">ALERT_EMAIL_ADDRESS</code>
          </p>
          <p className="mt-3 text-xs">
            Redémarrer le serveur après avoir ajouté les variables d'environnement.
          </p>
        </div>
      </div>

      {/* Webhooks configurés */}
      {webhooks.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <p className="text-gray-500 text-lg">Aucun webhook configuré</p>
          <p className="text-sm text-gray-400 mt-2">Configurez les variables d'environnement pour activer les alertes</p>
        </div>
      ) : (
        <div className="space-y-4">
          {webhooks.map((webhook) => (
            <div key={webhook.id} className="bg-white rounded-lg border border-gray-200 p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-3xl">{getWebhookIcon(webhook.type)}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900 capitalize">{webhook.type}</h3>
                    <p className="text-sm text-gray-600 break-all">{webhook.url}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Sévérité: <span className="font-medium">{webhook.severityLevel}</span>
                    </p>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${webhook.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
                >
                  {webhook.enabled ? '✓ Actif' : '✗ Inactif'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Test des webhooks */}
      {webhooks.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">🧪 Tester les webhooks</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message de test
              </label>
              <textarea
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                placeholder="Entrez un message de test personnalisé (optionnel)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                rows={3}
              />
            </div>
            <button
              onClick={sendTestNotification}
              disabled={sendingTest}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sendingTest ? '⏳ Envoi...' : '📤 Envoyer notification de test'}
            </button>
          </div>
        </div>
      )}

      {/* Guide d'utilisation */}
      <div className="bg-gray-50 border border-gray-200 p-6 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-3">📖 Guide d'utilisation</h3>
        <div className="text-sm text-gray-700 space-y-3">
          <div>
            <p className="font-medium mb-1">Slack</p>
            <ol className="list-decimal list-inside text-xs text-gray-600 space-y-1">
              <li>Créer un webhook incoming sur workspace.slack.com</li>
              <li>Copier l'URL du webhook</li>
              <li>Ajouter l'URL à la variable <code className="bg-white px-1">SLACK_CRITICAL_WEBHOOK</code></li>
              <li>Les erreurs critiques seront postées automatiquement au canal</li>
            </ol>
          </div>

          <div className="mt-4">
            <p className="font-medium mb-1">Discord</p>
            <ol className="list-decimal list-inside text-xs text-gray-600 space-y-1">
              <li>Créer un webhook webhook_settings sur un canal Discord</li>
              <li>Copier l'URL du webhook</li>
              <li>Ajouter l'URL à la variable <code className="bg-white px-1">DISCORD_CRITICAL_WEBHOOK</code></li>
              <li>Les erreurs critiques seront postées en embed Discord</li>
            </ol>
          </div>

          <div className="mt-4">
            <p className="font-medium mb-1">Email</p>
            <ol className="list-decimal list-inside text-xs text-gray-600 space-y-1">
              <li>Configurer votre fournisseur email (Resend, SendGrid, etc.)</li>
              <li>Ajouter l'adresse email admin à <code className="bg-white px-1">ALERT_EMAIL_ADDRESS</code></li>
              <li>Les erreurs critiques seront envoyées par email</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}
