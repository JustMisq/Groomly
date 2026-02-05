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
