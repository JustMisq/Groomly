import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { initSentry, setUserContext, clearUserContext } from '@/lib/sentry'

// Initialize Sentry on first middleware call
let sentryInitialized = false

/**
 * Middleware pour logging des performances et gestion des sessions
 * Intégration avec Sentry pour le tracking des erreurs
 */

export async function middleware(request: NextRequest) {
  // Initialize Sentry once
  if (!sentryInitialized) {
    initSentry()
    sentryInitialized = true
  }

  // Skip pour les assets et fichiers statiques
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/_next') || pathname.startsWith('/static')) {
    return NextResponse.next()
  }

  // Get session and set user context in Sentry
  try {
    const token = await getToken({ req: request })
    if (token?.sub) {
      setUserContext(token.sub, token.email || undefined, token.name || undefined)
    } else {
      clearUserContext()
    }
  } catch (error) {
    // Silently fail if we can't get the token
    clearUserContext()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Exclure les chemins statiques
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
