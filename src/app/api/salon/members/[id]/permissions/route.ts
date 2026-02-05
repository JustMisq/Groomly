import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authConfig } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

// PUT /api/salon/members/[id]/permissions - Metter à jour les permissions
export async function PUT(
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
        { error: 'Impossible de modifier les permissions du propriétaire' },
        { status: 403 }
      )
    }

    const body = await request.json()

    const updated = await prisma.salonMember.update({
      where: { id },
      data: {
        canManageClients: body.canManageClients,
        canManageAnimals: body.canManageAnimals,
        canManageAppointments: body.canManageAppointments,
        canManageServices: body.canManageServices,
        canManageInventory: body.canManageInventory,
        canViewReports: body.canViewReports,
        canManageBilling: body.canManageBilling,
        canManageSettings: body.canManageSettings,
        canManageMembers: body.canManageMembers,
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

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Erreur PUT /api/salon/members/[id]/permissions:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
