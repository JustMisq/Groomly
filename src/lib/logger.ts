import { prisma } from './prisma'
import { triggerCriticalAlert } from './webhooks'

export interface ErrorLogInput {
  message: string
  stack?: string
  severity?: 'error' | 'warning' | 'critical'
  url?: string
  method?: string
  userAgent?: string
  ipAddress?: string
  userId?: string
  salonId?: string
  context?: Record<string, any>
}

/**
 * Logger une erreur dans la base de données et déclencher les webhooks si critique
 */
export async function logError(error: ErrorLogInput) {
  try {
    const errorLog = await prisma.errorLog.create({
      data: {
        message: error.message,
        stack: error.stack,
        severity: error.severity || 'error',
        url: error.url || (typeof window !== 'undefined' ? window.location.href : undefined),
        method: error.method,
        userAgent: error.userAgent,
        ipAddress: error.ipAddress,
        userId: error.userId,
        salonId: error.salonId,
      },
    })

    // Déclencher une alerte pour les erreurs critiques
    if (error.severity === 'critical') {
      await triggerCriticalAlert({
        message: error.message,
        severity: 'critical',
        errorId: errorLog.id,
        stack: error.stack,
        url: error.url,
      })
    }

    return errorLog
  } catch (err) {
    // Fallback: logger à la console si la DB n'est pas accessible
    console.error('CRITICAL ERROR LOG FAILED:', error)
    console.error('Fallback error:', err)
    throw err
  }
}

/**
 * Logger une action utilisateur/système
 */
export interface ActivityLogInput {
  action: 'create' | 'update' | 'delete' | 'login' | 'logout' | 'import' | 'export' | 'view' | string
  resource: string
  userId: string
  resourceId?: string
  salonId?: string
  oldValue?: Record<string, any>
  newValue?: Record<string, any>
  ipAddress?: string
  userAgent?: string
}

export async function logActivity(activity: ActivityLogInput) {
  try {
    const activityLog = await prisma.activityLog.create({
      data: {
        action: activity.action,
        resource: activity.resource,
        userId: activity.userId,
        resourceId: activity.resourceId,
        salonId: activity.salonId,
        oldValue: activity.oldValue ? JSON.stringify(activity.oldValue) : null,
        newValue: activity.newValue ? JSON.stringify(activity.newValue) : null,
        ipAddress: activity.ipAddress,
        userAgent: activity.userAgent,
      },
    })

    return activityLog
  } catch (err) {
    console.error('Failed to log activity:', err)
  }
}

/**
 * Logger une interaction utilisateur (feedback, bug report, feature request)
 */
export interface UserInteractionInput {
  type: 'support_ticket' | 'feature_request' | 'bug_report' | 'feedback' | 'question'
  subject?: string
  description: string
  userId: string
  salonId?: string
  priority?: 'low' | 'normal' | 'high' | 'urgent'
  tags?: string[]
  requiresReply?: boolean
}

export async function logInteraction(interaction: UserInteractionInput) {
  try {
    const userInteraction = await prisma.userInteraction.create({
      data: {
        type: interaction.type,
        subject: interaction.subject,
        description: interaction.description,
        userId: interaction.userId,
        salonId: interaction.salonId,
        priority: interaction.priority || 'normal',
        tags: interaction.tags || [],
        requiresReply: interaction.requiresReply || false,
      },
    })

    return userInteraction
  } catch (err) {
    console.error('Failed to log interaction:', err)
  }
}

/**
 * Logger une métrique de performance
 */
export interface PerformanceMetricInput {
  metric: string
  value: number
  endpoint?: string
  userId?: string
  salonId?: string
  isSlowQuery?: boolean
}

export async function logPerformanceMetric(metric: PerformanceMetricInput) {
  try {
    const perfMetric = await prisma.performanceMetric.create({
      data: {
        metric: metric.metric,
        value: metric.value,
        endpoint: metric.endpoint,
        userId: metric.userId,
        salonId: metric.salonId,
        isSlowQuery: metric.isSlowQuery || metric.value > 1000,
      },
    })

    return perfMetric
  } catch (err) {
    console.error('Failed to log performance metric:', err)
  }
}

/**
 * Logger l'utilisation d'une feature
 */
export interface FeatureUsageInput {
  featureName: string
  action: 'view' | 'create' | 'update' | 'export' | 'report' | string
  userId: string
  salonId: string
  duration?: number
  itemCount?: number
}

export async function logFeatureUsage(usage: FeatureUsageInput) {
  try {
    const usageLog = await prisma.featureUsageLog.create({
      data: {
        featureName: usage.featureName,
        action: usage.action,
        userId: usage.userId,
        salonId: usage.salonId,
        duration: usage.duration,
        itemCount: usage.itemCount,
      },
    })

    return usageLog
  } catch (err) {
    console.error('Failed to log feature usage:', err)
  }
}

/**
 * Fonction pour mesurer le temps et logger une métrique automatiquement
 */
export async function measurePerformance<T>(
  metric: string,
  fn: () => Promise<T>,
  endpoint?: string
): Promise<T> {
  const startTime = Date.now()
  try {
    const result = await fn()
    const duration = Date.now() - startTime
    
    if (duration > 500) {
      // Log seulement si > 500ms
      await logPerformanceMetric({
        metric,
        value: duration,
        endpoint,
        isSlowQuery: duration > 1000,
      })
    }
    
    return result
  } catch (error) {
    const duration = Date.now() - startTime
    await logPerformanceMetric({
      metric,
      value: duration,
      endpoint,
      isSlowQuery: true,
    })
    throw error
  }
}

/**
 * ✅ SÉCURITÉ: Fonctions utilitaires pour logs + gestion erreurs
 */

const isDev = process.env.NODE_ENV === 'development'

function sanitize(data: any): any {
  if (!data) return data
  
  const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'STRIPE_SECRET_KEY']
  const stringify = JSON.stringify(data)
  
  let sanitized = stringify
  sensitiveFields.forEach(field => {
    const regex = new RegExp(`"${field}":\\s*"[^"]*"`, 'gi')
    sanitized = sanitized.replace(regex, `"${field}": "***"`)
  })
  
  try {
    return JSON.parse(sanitized)
  } catch {
    return data
  }
}

function formatMessage(level: string, context: string, message: string, data?: any) {
  const timestamp = new Date().toISOString()
  const baseMsg = `[${timestamp}] [${level}] [${context}]`
  
  if (data) {
    try {
      return `${baseMsg} ${message}\n${JSON.stringify(sanitize(data), null, 2)}`
    } catch {
      return `${baseMsg} ${message}`
    }
  }
  return `${baseMsg} ${message}`
}

export const simpleLogger = {
  info: (context: string, message: string, data?: any) => {
    if (isDev) {
      console.log(formatMessage('INFO', context, message, data))
    }
  },
  warn: (context: string, message: string, data?: any) => {
    console.warn(formatMessage('WARN', context, message, data))
  },
  error: (context: string, message: string, error?: any) => {
    const errorData = error instanceof Error ? {
      message: error.message,
      stack: isDev ? error.stack : undefined,
      name: error.name,
    } : error
    console.error(formatMessage('ERROR', context, message, errorData))
  },
  debug: (context: string, message: string, data?: any) => {
    if (isDev) {
      console.log(formatMessage('DEBUG', context, message, data))
    }
  },
  audit: (context: string, action: string, userId: string, details?: any) => {
    const msg = `AUDIT: ${action} by user ${userId}`
    console.log(formatMessage('AUDIT', context, msg, details))
  },
}

export function getErrorMessage(error: any): { message: string; errorId: string } {
  const errorId = `ERR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  let message = 'Une erreur est survenue'
  
  if (isDev && error instanceof Error) {
    message = error.message
  }
  
  return { message, errorId }
}

export function logApiCall(
  method: string,
  path: string,
  statusCode: number,
  duration: number,
  userId?: string
) {
  const statusEmoji = statusCode < 300 ? '✅' : statusCode < 400 ? '⚠️' : '❌'
  const msg = `${statusEmoji} ${method} ${path} (${statusCode}) ${duration}ms${userId ? ` [${userId}]` : ''}`
  
  if (isDev) {
    console.log(`[API] ${msg}`)
  } else if (statusCode >= 400) {
    console.error(`[API] ${msg}`)
  }
}

// ✅ Alias for backwards compatibility
export const logger = simpleLogger
