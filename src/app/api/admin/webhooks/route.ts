import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authConfig } from '@/lib/auth-config'
import { sendWebhookNotification, type WebhookConfig, type WebhookData } from '@/lib/webhooks'

/**
 * API pour gérer les webhooks
 */

// GET - Lister les webhooks configurés
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig)
    if (!session?.user?.id || !session.user.isAdmin) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const webhooks: WebhookConfig[] = []

    // Chercher les webhooks configurés via env variables
    if (process.env.SLACK_CRITICAL_WEBHOOK) {
      webhooks.push({
        id: 'slack-critical',
        type: 'slack',
        url: process.env.SLACK_CRITICAL_WEBHOOK,
        severityLevel: 'critical',
        enabled: true,
        retries: 3,
      })
    }

    if (process.env.DISCORD_CRITICAL_WEBHOOK) {
      webhooks.push({
        id: 'discord-critical',
        type: 'discord',
        url: process.env.DISCORD_CRITICAL_WEBHOOK,
        severityLevel: 'critical',
        enabled: true,
        retries: 3,
      })
    }

    if (process.env.ALERT_EMAIL_ADDRESS) {
      webhooks.push({
        id: 'email-critical',
        type: 'email',
        url: process.env.ALERT_EMAIL_ADDRESS,
        severityLevel: 'critical',
        enabled: true,
        retries: 1,
      })
    }

    return NextResponse.json({
      webhooks,
      message: 'Configurez les webhooks via variables d\'environnement',
    })
  } catch (error) {
    console.error('Erreur GET /api/admin/webhooks:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// POST - Déclencher manuellement une notification de test
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig)
    if (!session?.user?.id || !session.user.isAdmin) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const { testMessage } = await request.json()

    // Construire la liste des webhooks actifs
    const webhooks: WebhookConfig[] = []

    if (process.env.SLACK_CRITICAL_WEBHOOK) {
      webhooks.push({
        id: 'slack-critical',
        type: 'slack',
        url: process.env.SLACK_CRITICAL_WEBHOOK,
        severityLevel: 'critical',
        enabled: true,
        retries: 3,
      })
    }

    if (process.env.DISCORD_CRITICAL_WEBHOOK) {
      webhooks.push({
        id: 'discord-critical',
        type: 'discord',
        url: process.env.DISCORD_CRITICAL_WEBHOOK,
        severityLevel: 'critical',
        enabled: true,
        retries: 3,
      })
    }

    // Envoyer à tous les webhooks actifs
    const results = await Promise.all(
      webhooks.map(webhook =>
        sendWebhookNotification(webhook, {
          type: 'test',
          message: testMessage || 'Test de notification webhook depuis Groomly Admin',
          timestamp: new Date().toISOString(),
        })
      )
    )

    return NextResponse.json({
      success: true,
      results,
      message: `${results.length} webhook(s) notifié(s)`,
    })
  } catch (error) {
    console.error('Erreur POST /api/admin/webhooks:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
