import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authConfig } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

// GET /api/support/tickets - Liste des tickets de l'utilisateur
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig)
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const isAdmin = searchParams.get('admin') === 'true'

    // Vérifier si l'utilisateur est admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isAdmin: true },
    })

    // Construire le filtre
    const where: Record<string, unknown> = {}

    if (isAdmin && user?.isAdmin) {
      // Admin voit tous les tickets
      if (status && status !== 'all') {
        where.status = status
      }
    } else {
      // Utilisateur voit seulement ses tickets
      where.userId = session.user.id
      if (status && status !== 'all') {
        where.status = status
      }
    }

    const tickets = await prisma.supportTicket.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        _count: {
          select: { messages: true },
        },
      },
      orderBy: [
        { priority: 'desc' },
        { updatedAt: 'desc' },
      ],
    })

    return NextResponse.json({
      tickets,
      isAdmin: user?.isAdmin || false,
    })
  } catch (error) {
    console.error('Error fetching tickets:', error)
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}

// POST /api/support/tickets - Créer un nouveau ticket
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig)
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { subject, description, category, priority } = body

    if (!subject || !description) {
      return NextResponse.json({ message: 'Sujet et description requis' }, { status: 400 })
    }

    // Générer un numéro de ticket unique
    const year = new Date().getFullYear()
    const lastTicket = await prisma.supportTicket.findFirst({
      where: {
        ticketNumber: { startsWith: `TKT-${year}` },
      },
      orderBy: { ticketNumber: 'desc' },
    })

    let ticketNumber = `TKT-${year}-001`
    if (lastTicket) {
      const lastNum = parseInt(lastTicket.ticketNumber.split('-')[2])
      ticketNumber = `TKT-${year}-${String(lastNum + 1).padStart(3, '0')}`
    }

    // Récupérer le salonId si l'utilisateur en a un
    const salon = await prisma.salon.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    })

    // Récupérer les infos navigateur/OS (depuis headers ou body)
    const userAgent = request.headers.get('user-agent') || ''

    const ticket = await prisma.supportTicket.create({
      data: {
        ticketNumber,
        subject,
        description,
        category: category || 'general',
        priority: priority || 'normal',
        userId: session.user.id,
        salonId: salon?.id || null,
        browser: userAgent.substring(0, 255),
        appVersion: process.env.npm_package_version || '1.0.0',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    // Créer le premier message (la description)
    await prisma.ticketMessage.create({
      data: {
        ticketId: ticket.id,
        content: description,
        isStaffReply: false,
        authorId: session.user.id,
        authorName: session.user.name || 'Utilisateur',
      },
    })

    return NextResponse.json(ticket, { status: 201 })
  } catch (error) {
    console.error('Error creating ticket:', error)
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}

// PUT /api/support/tickets - Mettre à jour un ticket (admin ou propriétaire)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig)
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { id, status, priority, assignedToId } = body

    if (!id) {
      return NextResponse.json({ message: 'ID ticket requis' }, { status: 400 })
    }

    // Vérifier permissions
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isAdmin: true },
    })

    const ticket = await prisma.supportTicket.findUnique({
      where: { id },
    })

    if (!ticket) {
      return NextResponse.json({ message: 'Ticket non trouvé' }, { status: 404 })
    }

    // Seul le propriétaire ou un admin peut modifier
    if (ticket.userId !== session.user.id && !user?.isAdmin) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 403 })
    }

    const updateData: Record<string, unknown> = {}

    if (status) {
      updateData.status = status
      if (status === 'resolved') {
        updateData.resolvedAt = new Date()
      }
      if (status === 'closed') {
        updateData.closedAt = new Date()
      }
    }

    if (priority && user?.isAdmin) {
      updateData.priority = priority
    }

    if (assignedToId !== undefined && user?.isAdmin) {
      updateData.assignedToId = assignedToId
    }

    const updatedTicket = await prisma.supportTicket.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    return NextResponse.json(updatedTicket)
  } catch (error) {
    console.error('Error updating ticket:', error)
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}
