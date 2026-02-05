import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authConfig } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

// GET /api/admin/interactions - Lister les interactions
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig)
    if (!session?.user?.id || !session.user.isAdmin) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const status = searchParams.get('status')
    const requiresReply = searchParams.get('requiresReply')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    const skip = (page - 1) * limit

    const where: any = {}
    if (type && type !== 'all') where.type = type
    if (status && status !== 'all') where.status = status
    if (requiresReply === 'true') where.requiresReply = true
    if (requiresReply === 'false') where.requiresReply = false

    const interactions = await prisma.userInteraction.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    })

    const total = await prisma.userInteraction.count({ where })
    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      interactions,
      pagination: { page, limit, total, totalPages },
    })
  } catch (error) {
    console.error('Erreur GET /api/admin/interactions:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// POST /api/admin/interactions - Créer une interaction
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const { type, subject, description, salonId, priority, tags, requiresReply } = await request.json()

    const interaction = await prisma.userInteraction.create({
      data: {
        type,
        subject,
        description,
        userId: session.user.id,
        salonId,
        priority,
        tags: tags || [],
        requiresReply: requiresReply || false,
      },
    })

    return NextResponse.json(interaction, { status: 201 })
  } catch (error) {
    console.error('Erreur POST /api/admin/interactions:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// PUT /api/admin/interactions/[id] - Mettre à jour une interaction
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig)
    if (!session?.user?.id || !session.user.isAdmin) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID manquant' }, { status: 400 })
    }

    const { status, resolved, replied } = await request.json()

    const interaction = await prisma.userInteraction.update({
      where: { id },
      data: {
        status,
        resolved,
        replied,
        lastReplyAt: replied ? new Date() : undefined,
      },
    })

    return NextResponse.json(interaction)
  } catch (error) {
    console.error('Erreur PUT /api/admin/interactions:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
