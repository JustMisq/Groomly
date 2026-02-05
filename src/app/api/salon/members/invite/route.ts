import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authConfig } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

// POST /api/salon/members/invite - Inviter un nouveau membre
export async function POST(request: NextRequest) {
  try {
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

    const body = await request.json()
    const { email, role } = body

    if (!email || !role) {
      return NextResponse.json(
        { message: 'Email et rôle requis' },
        { status: 400 }
      )
    }

    // Vérifier si déjà invité
    const existing = await prisma.salonMember.findFirst({
      where: {
        salonId: salon.id,
        inviteEmail: email.toLowerCase(),
      },
    })

    if (existing) {
      return NextResponse.json(
        { message: 'Cet email est déjà invité' },
        { status: 409 }
      )
    }

    // Générer un token d'invitation
    const inviteToken = crypto.randomBytes(32).toString('hex')

    // Permissions par défaut selon le rôle
    const getDefaultPermissions = (r: string) => {
      switch (r) {
        case 'admin':
          return {
            canManageClients: true,
            canManageAnimals: true,
            canManageAppointments: true,
            canManageServices: true,
            canManageInventory: true,
            canViewReports: true,
            canManageBilling: true,
            canManageSettings: true,
            canManageMembers: true,
          }
        case 'staff':
          return {
            canManageClients: true,
            canManageAnimals: true,
            canManageAppointments: true,
            canManageServices: false,
            canManageInventory: true,
            canViewReports: false,
            canManageBilling: false,
            canManageSettings: false,
            canManageMembers: false,
          }
        case 'readonly':
          return {
            canManageClients: false,
            canManageAnimals: false,
            canManageAppointments: false,
            canManageServices: false,
            canManageInventory: false,
            canViewReports: false,
            canManageBilling: false,
            canManageSettings: false,
            canManageMembers: false,
          }
        default:
          return {
            canManageClients: true,
            canManageAnimals: true,
            canManageAppointments: true,
            canManageServices: false,
            canManageInventory: true,
            canViewReports: false,
            canManageBilling: false,
            canManageSettings: false,
            canManageMembers: false,
          }
      }
    }

    const member = await prisma.salonMember.create({
      data: {
        salonId: salon.id,
        inviteEmail: email.toLowerCase(),
        inviteToken,
        role,
        status: 'pending',
        ...getDefaultPermissions(role),
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

    return NextResponse.json(member, { status: 201 })
  } catch (error) {
    console.error('Erreur POST /api/salon/members/invite:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
