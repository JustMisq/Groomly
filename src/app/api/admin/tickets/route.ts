import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authConfig } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

// GET /api/admin/tickets - Lister les tickets
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig)
    if (!session?.user?.id || !session.user.isAdmin) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    const skip = (page - 1) * limit

    const where: any = {}
    if (status && status !== 'all') where.status = status
    if (priority && priority !== 'all') where.priority = priority

    const tickets = await prisma.supportTicket.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        salon: {
          select: {
            name: true,
          },
        },
        _count: {
          select: { messages: true },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    })

    const total = await prisma.supportTicket.count({ where })
    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      tickets,
      pagination: { page, limit, total, totalPages },
    })
  } catch (error) {
    console.error('Erreur GET /api/admin/tickets:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
