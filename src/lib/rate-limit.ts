import { NextRequest, NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'

// ✅ Redis rate limiting (production-ready)
let redis: Redis | null = null

if (process.env.REDIS_URL) {
  try {
    redis = new Redis({
      url: process.env.REDIS_URL,
      token: process.env.REDIS_TOKEN || '',
    })
  } catch (error) {
    console.warn('⚠️  Redis connection failed, falling back to in-memory rate limiting')
  }
}

// In-memory fallback store
const inMemoryStore = new Map<string, { count: number; resetTime: number }>()

interface RateLimitConfig {
  windowMs: number  // Fenêtre en ms
  maxRequests: number  // Max requêtes par fenêtre
}

/**
 * Rate limit helper avec Redis + fallback in-memory
 * Retourne success: true si la requête peut continuer
 */
export async function checkRateLimit(
  identifier: string,
  action: string,
  maxRequests: number = 100,
  windowSeconds: number = 60
): Promise<{ success: true } | { success: false; retryAfter: number }> {
  const key = `ratelimit:${action}:${identifier}`
  const now = Date.now()
  const windowMs = windowSeconds * 1000

  try {
    // Try Redis if available
    if (redis) {
      const current = await redis.incr(key)
      
      if (current === 1) {
        // First request in this window, set expiry
        await redis.expire(key, windowSeconds)
      }

      if (current > maxRequests) {
        const ttl = await redis.ttl(key)
        const retryAfter = Math.max(1, ttl || windowSeconds)
        return { success: false, retryAfter }
      }

      return { success: true }
    }
  } catch (error) {
    console.error('Redis rate limit error, using fallback:', error)
    // Fallback to in-memory
  }

  // Fallback: In-memory rate limiting (for dev without Redis)
  const record = inMemoryStore.get(key)

  if (!record || record.resetTime < now) {
    inMemoryStore.set(key, {
      count: 1,
      resetTime: now + windowMs,
    })
    return { success: true }
  }

  if (record.count >= maxRequests) {
    const retryAfter = Math.ceil((record.resetTime - now) / 1000)
    return { success: false, retryAfter }
  }

  record.count++
  return { success: true }
}

// ✅ Pre-configured rate limiters for common operations
export const rateLimiters = {
  // Login: 5 attempts per minute
  login: async (identifier: string) => 
    checkRateLimit(identifier, 'login', 5, 60),

  // Register: 3 attempts per hour
  register: async (identifier: string) => 
    checkRateLimit(identifier, 'register', 3, 3600),

  // API general: 100 requests per minute
  api: async (identifier: string) => 
    checkRateLimit(identifier, 'api', 100, 60),

  // Password reset: 3 attempts per hour
  passwordReset: async (identifier: string) => 
    checkRateLimit(identifier, 'password_reset', 3, 3600),

  // Email verification: 5 attempts per 10 minutes
  emailVerification: async (identifier: string) => 
    checkRateLimit(identifier, 'email_verify', 5, 600),
}

/**
 * Extract client IP from request headers
 * Supports X-Forwarded-For and X-Real-IP headers
 */
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

/**
 * Middleware helper to apply rate limiting to routes
 * 
 * Usage in route handler:
 * ```typescript
 * const ip = getClientIP(request)
 * const limited = await checkRouteRateLimit(request, 'login')
 * if (limited) return limited
 * ```
 */
export async function checkRouteRateLimit(
  request: NextRequest,
  action: 'login' | 'register' | 'api' | 'passwordReset' | 'emailVerification'
): Promise<NextResponse | null> {
  const ip = getClientIP(request)
  
  let limiter: ((id: string) => Promise<{ success: true } | { success: false; retryAfter: number }>) | undefined
  
  switch (action) {
    case 'login':
      limiter = rateLimiters.login
      break
    case 'register':
      limiter = rateLimiters.register
      break
    case 'api':
      limiter = rateLimiters.api
      break
    case 'passwordReset':
      limiter = rateLimiters.passwordReset
      break
    case 'emailVerification':
      limiter = rateLimiters.emailVerification
      break
  }

  if (!limiter) {
    return null
  }

  const result = await limiter(ip)
  
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
          'X-RateLimit-Reset': String(Date.now() + result.retryAfter * 1000),
        },
      }
    )
  }
  
  return null
}

