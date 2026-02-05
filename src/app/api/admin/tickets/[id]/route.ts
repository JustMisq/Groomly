import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authConfig } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

// PUT /api/admin/tickets/[id] - Modifier un ticket
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
    const { status, priority } = body

    const ticket = await prisma.supportTicket.update({
      where: { id },
      data: {
        status: status || undefined,
        priority: priority || undefined,
        ...(status === 'resolved' && { resolvedAt: new Date() }),
        ...(status === 'closed' && { closedAt: new Date() }),
      },
      include: {
        messages: true,
        user: true,
      },
    })

    return NextResponse.json(ticket)
  } catch (error) {
    console.error('Erreur PUT /api/admin/tickets/[id]:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
