import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authConfig } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

// GET /api/support/tickets/[id] - Détails d'un ticket
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authConfig)
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 })
    }

    const { id } = await params

    // Vérifier si l'utilisateur est admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isAdmin: true },
    })

    const ticket = await prisma.supportTicket.findUnique({
      where: { id },
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

    if (!ticket) {
      return NextResponse.json({ message: 'Ticket non trouvé' }, { status: 404 })
    }

    // Vérifier permissions
    if (ticket.userId !== session.user.id && !user?.isAdmin) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 403 })
    }

    // Filtrer les messages internes si pas admin
    const filteredTicket = {
      ...ticket,
      messages: user?.isAdmin 
        ? ticket.messages 
        : ticket.messages.filter(m => !m.isInternal),
    }

    return NextResponse.json({
      ticket: filteredTicket,
      isAdmin: user?.isAdmin || false,
    })
  } catch (error) {
    console.error('Error fetching ticket:', error)
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}

// POST /api/support/tickets/[id] - Ajouter un message au ticket
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authConfig)
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { content, isInternal } = body

    if (!content) {
      return NextResponse.json({ message: 'Contenu requis' }, { status: 400 })
    }

    // Vérifier si l'utilisateur est admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isAdmin: true, name: true },
    })

    const ticket = await prisma.supportTicket.findUnique({
      where: { id },
    })

    if (!ticket) {
      return NextResponse.json({ message: 'Ticket non trouvé' }, { status: 404 })
    }

    // Vérifier permissions
    if (ticket.userId !== session.user.id && !user?.isAdmin) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 403 })
    }

    // Vérifier que le ticket n'est pas fermé
    if (ticket.status === 'closed') {
      return NextResponse.json({ message: 'Ticket fermé, impossible d\'ajouter un message' }, { status: 400 })
    }

    const isStaffReply = user?.isAdmin || false

    const message = await prisma.ticketMessage.create({
      data: {
        ticketId: id,
        content,
        isStaffReply,
        isInternal: isStaffReply && isInternal === true,
        authorId: session.user.id,
        authorName: isStaffReply ? 'Support Groomly' : (user?.name || 'Utilisateur'),
      },
    })

    // Mettre à jour le statut du ticket selon qui répond
    let newStatus = ticket.status
    if (isStaffReply && ticket.status === 'open') {
      newStatus = 'in_progress'
    } else if (isStaffReply && ticket.status !== 'resolved') {
      newStatus = 'waiting_customer'
    } else if (!isStaffReply && ticket.status === 'waiting_customer') {
      newStatus = 'in_progress'
    }

    if (newStatus !== ticket.status) {
      await prisma.supportTicket.update({
        where: { id },
        data: { status: newStatus },
      })
    }

    return NextResponse.json(message, { status: 201 })
  } catch (error) {
    console.error('Error adding message:', error)
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}
