import { NextRequest, NextResponse } from 'next/server'

/**
 * Middleware simple pour logging des performances
 * Le logging détaillé se fera via des fonctions utilitaires
 */

export function middleware(request: NextRequest) {
  // Skip pour les assets et fichiers statiques
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/_next') || pathname.startsWith('/static')) {
    return NextResponse.next()
  }

  // Pour maintenant, on n'ajoute pas de logging ici
  // Le logging se fera via les route handlers et les utilitaires
  return NextResponse.next()
}

export const config = {
  matcher: [
    // Exclure les chemins statiques
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
