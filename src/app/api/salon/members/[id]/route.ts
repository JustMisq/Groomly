import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authConfig } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

// GET /api/salon/members/[id] - Récupérer détails d'un membre
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authConfig)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const salon = await prisma.salon.findUnique({
      where: { userId: session.user.id },
    })

    if (!salon) {
      return NextResponse.json({ error: 'Salon non trouvé' }, { status: 404 })
    }

    const member = await prisma.salonMember.findFirst({
      where: {
        id,
        salonId: salon.id,
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

    if (!member) {
      return NextResponse.json(
        { error: 'Membre non trouvé' },
        { status: 404 }
      )
    }

    const permissions = {
      canManageClients: member.canManageClients,
      canManageAnimals: member.canManageAnimals,
      canManageAppointments: member.canManageAppointments,
      canManageServices: member.canManageServices,
      canManageInventory: member.canManageInventory,
      canViewReports: member.canViewReports,
      canManageBilling: member.canManageBilling,
      canManageSettings: member.canManageSettings,
      canManageMembers: member.canManageMembers,
    }

    return NextResponse.json({ member, permissions })
  } catch (error) {
    console.error('Erreur GET /api/salon/members/[id]:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// DELETE /api/salon/members/[id] - Supprimer un membre
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authConfig)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const salon = await prisma.salon.findUnique({
      where: { userId: session.user.id },
    })

    if (!salon) {
      return NextResponse.json({ error: 'Salon non trouvé' }, { status: 404 })
    }

    const member = await prisma.salonMember.findFirst({
      where: {
        id,
        salonId: salon.id,
      },
    })

    if (!member) {
      return NextResponse.json(
        { error: 'Membre non trouvé' },
        { status: 404 }
      )
    }

    if (member.role === 'owner') {
      return NextResponse.json(
        { error: 'Impossible de supprimer le propriétaire' },
        { status: 403 }
      )
    }

    await prisma.salonMember.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur DELETE /api/salon/members/[id]:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
