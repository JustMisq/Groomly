/**
 * Sentry Configuration for Groomly
 * Error tracking and performance monitoring
 */

import * as Sentry from '@sentry/nextjs'

export function initSentry() {
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) {
    console.warn('⚠️  Sentry DSN not configured. Error tracking disabled.')
    return
  }

  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    
    // Set tracesSampleRate to control performance monitoring sampling
    // Development: 100%, Production: 10%
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

    environment: process.env.NODE_ENV,
    
    // Filter out errors from extensions and local files in development
    beforeSend(event, hint) {
      // Filter out known harmless errors
      if (event.exception) {
        const error = hint.originalException as Error
        
        // Skip "Network request failed" errors in development
        if (
          process.env.NODE_ENV === 'development' &&
          error.message?.includes('Network request failed')
        ) {
          return null
        }
      }
      
      return event
    },
  })
}

/**
 * Capture an exception with context
 */
export function captureException(error: Error, context?: Record<string, any>) {
  Sentry.captureException(error, {
    contexts: {
      custom: context,
    },
  })
}

/**
 * Capture a message
 */
export function captureMessage(message: string, level: Sentry.SeverityLevel = 'info') {
  Sentry.captureMessage(message, level)
}

/**
 * Set user context for error tracking
 */
export function setUserContext(userId: string, email?: string, name?: string) {
  Sentry.setUser({
    id: userId,
    email,
    username: name,
  })
}

/**
 * Clear user context (on logout)
 */
export function clearUserContext() {
  Sentry.setUser(null)
}
