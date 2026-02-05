import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authConfig } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

// PUT /api/admin/users/[id] - Modifier un utilisateur
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authConfig)
    if (!session?.user?.id || !session.user.isAdmin) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const body = await request.json()
    const { isAdmin } = body

    const user = await prisma.user.update({
      where: { id },
      data: { isAdmin },
      select: {
        id: true,
        email: true,
        name: true,
        isAdmin: true,
      },
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error('Erreur PUT /api/admin/users/[id]:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// POST /api/admin/users/[id]/suspend - Suspendre un utilisateur
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { pathname } = new URL(request.url)

    // Vérifier si c'est un appel suspend
    if (pathname.includes('suspend')) {
      const session = await getServerSession(authConfig)
      if (!session?.user?.id || !session.user.isAdmin) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
      }

      // Soft delete
      const user = await prisma.user.update({
        where: { id },
        data: { deletedAt: new Date() },
      })

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Route non trouvée' }, { status: 404 })
  } catch (error) {
    console.error('Erreur POST /api/admin/users/[id]:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
