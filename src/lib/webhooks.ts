/**
 * Fonctions utilitaires pour envoyer des webhooks
 * À ne pas exporter depuis les routes API
 */

export interface WebhookConfig {
  id: string
  type: 'slack' | 'discord' | 'email'
  url: string
  severityLevel: 'error' | 'warning' | 'critical'
  enabled: boolean
  retries: number
}

export interface WebhookData {
  type: 'error' | 'warning' | 'critical' | 'test'
  message: string
  errorId?: string
  severity?: string
  timestamp: string
  additionalInfo?: Record<string, any>
}

/**
 * Envoyer une notification webhook
 */
export async function sendWebhookNotification(
  webhook: WebhookConfig,
  data: WebhookData,
  retryCount = 0
): Promise<{ success: boolean; error?: string }> {
  try {
    if (webhook.type === 'slack') {
      return await sendSlackNotification(webhook.url, data)
    } else if (webhook.type === 'discord') {
      return await sendDiscordNotification(webhook.url, data)
    } else if (webhook.type === 'email') {
      return await sendEmailNotification(webhook.url, data)
    }

    return { success: false, error: 'Type webhook non supporté' }
  } catch (error) {
    console.error(`Erreur envoi webhook ${webhook.type}:`, error)

    // Retry logic
    if (retryCount < webhook.retries) {
      await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)))
      return sendWebhookNotification(webhook, data, retryCount + 1)
    }

    return { success: false, error: String(error) }
  }
}

/**
 * Envoyer notification Slack
 */
async function sendSlackNotification(webhookUrl: string, data: WebhookData): Promise<{ success: boolean }> {
  const color = data.type === 'critical' ? 'danger' : data.type === 'error' ? 'warning' : 'good'

  const payload = {
    attachments: [
      {
        color,
        title: `🚨 ${data.type.toUpperCase()}: ${data.message}`,
        text: data.additionalInfo?.stack || data.message,
        fields: [
          {
            title: 'Timestamp',
            value: new Date(data.timestamp).toLocaleString('fr-FR'),
            short: true,
          },
          ...(data.errorId ? [{ title: 'Error ID', value: data.errorId, short: true }] : []),
          ...(data.additionalInfo?.url ? [{ title: 'URL', value: data.additionalInfo.url, short: false }] : []),
        ],
        footer: 'Groomly Admin Alerts',
      },
    ],
  }

  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  return { success: res.ok }
}

/**
 * Envoyer notification Discord
 */
async function sendDiscordNotification(webhookUrl: string, data: WebhookData): Promise<{ success: boolean }> {
  const color =
    data.type === 'critical'
      ? 16711680 // Red
      : data.type === 'error'
        ? 16776960 // Yellow
        : 65280 // Green

  const embed = {
    title: `🚨 ${data.type.toUpperCase()}: ${data.message}`,
    description: data.additionalInfo?.stack || data.message,
    color,
    fields: [
      {
        name: 'Timestamp',
        value: new Date(data.timestamp).toLocaleString('fr-FR'),
        inline: true,
      },
      ...(data.errorId ? [{ name: 'Error ID', value: data.errorId, inline: true }] : []),
      ...(data.additionalInfo?.url ? [{ name: 'URL', value: data.additionalInfo.url, inline: false }] : []),
    ],
    footer: { text: 'Groomly Admin Alerts' },
  }

  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ embeds: [embed] }),
  })

  return { success: res.ok }
}

/**
 * Envoyer notification Email
 */
async function sendEmailNotification(email: string, data: WebhookData): Promise<{ success: boolean }> {
  try {
    // À intégrer avec votre service email (SendGrid, Resend, etc.)
    // Ceci est un placeholder
    console.log(`[EMAIL] Envoyer alerte à ${email}:`, data.message)

    return { success: true }
  } catch (error) {
    return { success: false }
  }
}

/**
 * Fonction pour déclencher une alerte critique
 */
export async function triggerCriticalAlert(errorData: {
  message: string
  severity: string
  errorId?: string
  stack?: string
  url?: string
}) {
  // Webhooks configurés
  const CRITICAL_WEBHOOKS: WebhookConfig[] = []

  // Ajouter les webhooks depuis les variables d'environnement
  if (process.env.SLACK_CRITICAL_WEBHOOK) {
    CRITICAL_WEBHOOKS.push({
      id: 'slack-critical',
      type: 'slack',
      url: process.env.SLACK_CRITICAL_WEBHOOK,
      severityLevel: 'critical',
      enabled: true,
      retries: 3,
    })
  }

  if (process.env.DISCORD_CRITICAL_WEBHOOK) {
    CRITICAL_WEBHOOKS.push({
      id: 'discord-critical',
      type: 'discord',
      url: process.env.DISCORD_CRITICAL_WEBHOOK,
      severityLevel: 'critical',
      enabled: true,
      retries: 3,
    })
  }

  if (CRITICAL_WEBHOOKS.length === 0) return

  await Promise.all(
    CRITICAL_WEBHOOKS.map(webhook =>
      sendWebhookNotification(webhook, {
        type: 'critical',
        message: errorData.message,
        errorId: errorData.errorId,
        severity: errorData.severity,
        timestamp: new Date().toISOString(),
        additionalInfo: {
          stack: errorData.stack,
          url: errorData.url,
        },
      })
    )
  )
}
