import { NextRequest, NextResponse } from 'next/server'

interface RateLimitConfig {
  windowMs: number  // Fenêtre en ms
  maxRequests: number  // Max requêtes par fenêtre
}

// Store en mémoire (pour prod, utiliser Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// Nettoyage périodique des entrées expirées
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetTime < now) {
      rateLimitStore.delete(key)
    }
  }
}, 60000) // Nettoyage toutes les minutes

export function rateLimit(config: RateLimitConfig = { windowMs: 60000, maxRequests: 100 }) {
  return function checkRateLimit(
    identifier: string
  ): { success: true } | { success: false; retryAfter: number } {
    const now = Date.now()
    const record = rateLimitStore.get(identifier)

    if (!record || record.resetTime < now) {
      // Nouvelle fenêtre
      rateLimitStore.set(identifier, {
        count: 1,
        resetTime: now + config.windowMs,
      })
      return { success: true }
    }

    if (record.count >= config.maxRequests) {
      const retryAfter = Math.ceil((record.resetTime - now) / 1000)
      return { success: false, retryAfter }
    }

    record.count++
    return { success: true }
  }
}

// Configurations prédéfinies
export const rateLimiters = {
  // API standard : 100 req/min
  standard: rateLimit({ windowMs: 60000, maxRequests: 100 }),
  
  // Auth : 10 req/min (contre brute force)
  auth: rateLimit({ windowMs: 60000, maxRequests: 10 }),
  
  // Création : 30 req/min
  create: rateLimit({ windowMs: 60000, maxRequests: 30 }),
  
  // Export : 5 req/min
  export: rateLimit({ windowMs: 60000, maxRequests: 5 }),
}

// Helper pour extraire l'IP
export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  if (realIP) {
    return realIP
  }
  
  return 'unknown'
}

// Middleware helper
export function withRateLimit(
  limiter: ReturnType<typeof rateLimit>,
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async function (request: NextRequest): Promise<NextResponse> {
    const ip = getClientIP(request)
    const result = limiter(ip)
    
    if (!result.success) {
      return NextResponse.json(
        { 
          error: 'Too many requests',
          message: 'Trop de requêtes. Réessayez dans quelques instants.',
          retryAfter: result.retryAfter,
        },
        { 
          status: 429,
          headers: {
            'Retry-After': String(result.retryAfter),
          },
        }
      )
    }
    
    return handler(request)
  }
}

// Fonction simple pour vérifier le rate limit dans une route
export function checkRateLimit(
  request: NextRequest,
  type: keyof typeof rateLimiters = 'standard'
): NextResponse | null {
  const ip = getClientIP(request)
  const result = rateLimiters[type](ip)
  
  if (!result.success) {
    return NextResponse.json(
      { 
        error: 'Too many requests',
        message: 'Trop de requêtes. Réessayez dans quelques instants.',
        retryAfter: result.retryAfter,
      },
      { 
        status: 429,
        headers: {
          'Retry-After': String(result.retryAfter),
        },
      }
    )
  }
  
  return null
}
