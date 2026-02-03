import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authConfig } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

// GET /api/salon/members - Liste les membres du salon
export async function GET() {
  try {
    const session = await getServerSession(authConfig)
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 })
    }

    const salon = await prisma.salon.findUnique({
      where: { userId: session.user.id },
    })

    if (!salon) {
      return NextResponse.json({ message: 'Salon non trouvé' }, { status: 404 })
    }

    const members = await prisma.salonMember.findMany({
      where: { salonId: salon.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Ajouter le propriétaire comme premier "membre"
    const owner = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, name: true, email: true },
    })

    const allMembers = [
      {
        id: 'owner',
        role: 'owner',
        firstName: owner?.name?.split(' ')[0] || '',
        lastName: owner?.name?.split(' ').slice(1).join(' ') || '',
        status: 'active',
        user: owner,
        inviteEmail: owner?.email,
        createdAt: salon.createdAt,
        isOwner: true,
      },
      ...members.map(m => ({ ...m, isOwner: false })),
    ]

    return NextResponse.json(allMembers)
  } catch (error) {
    console.error('Error fetching members:', error)
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}

// POST /api/salon/members - Inviter un nouveau membre
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig)
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 })
    }

    const salon = await prisma.salon.findUnique({
      where: { userId: session.user.id },
    })

    if (!salon) {
      return NextResponse.json({ message: 'Salon non trouvé' }, { status: 404 })
    }

    const body = await request.json()
    const { email, role, firstName, lastName, phone, permissions } = body

    if (!email || !role) {
      return NextResponse.json({ message: 'Email et rôle requis' }, { status: 400 })
    }

    // Vérifier si déjà invité
    const existing = await prisma.salonMember.findFirst({
      where: {
        salonId: salon.id,
        inviteEmail: email.toLowerCase(),
      },
    })

    if (existing) {
      return NextResponse.json({ message: 'Cet email est déjà invité' }, { status: 409 })
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    // Générer un token d'invitation
    const inviteToken = crypto.randomBytes(32).toString('hex')

    // Définir les permissions par défaut selon le rôle
    const defaultPermissions = getDefaultPermissions(role)
    const finalPermissions = { ...defaultPermissions, ...permissions }

    const member = await prisma.salonMember.create({
      data: {
        salonId: salon.id,
        userId: existingUser?.id || null,
        inviteEmail: email.toLowerCase(),
        inviteToken,
        role,
        firstName: firstName || '',
        lastName: lastName || '',
        phone: phone || null,
        status: existingUser ? 'active' : 'pending',
        acceptedAt: existingUser ? new Date() : null,
        ...finalPermissions,
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

    // TODO: Envoyer email d'invitation si pending
    // await sendInviteEmail(email, inviteToken, salon.name)

    return NextResponse.json(member, { status: 201 })
  } catch (error) {
    console.error('Error creating member:', error)
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}

// PUT /api/salon/members - Mettre à jour un membre
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig)
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 })
    }

    const salon = await prisma.salon.findUnique({
      where: { userId: session.user.id },
    })

    if (!salon) {
      return NextResponse.json({ message: 'Salon non trouvé' }, { status: 404 })
    }

    const body = await request.json()
    const { id, role, firstName, lastName, phone, status, ...permissions } = body

    if (!id) {
      return NextResponse.json({ message: 'ID membre requis' }, { status: 400 })
    }

    // Vérifier que le membre appartient au salon
    const existing = await prisma.salonMember.findFirst({
      where: {
        id,
        salonId: salon.id,
      },
    })

    if (!existing) {
      return NextResponse.json({ message: 'Membre non trouvé' }, { status: 404 })
    }

    const member = await prisma.salonMember.update({
      where: { id },
      data: {
        role: role || existing.role,
        firstName: firstName ?? existing.firstName,
        lastName: lastName ?? existing.lastName,
        phone: phone ?? existing.phone,
        status: status || existing.status,
        ...permissions,
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

    return NextResponse.json(member)
  } catch (error) {
    console.error('Error updating member:', error)
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}

// DELETE /api/salon/members?id=xxx - Supprimer un membre
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig)
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 })
    }

    const salon = await prisma.salon.findUnique({
      where: { userId: session.user.id },
    })

    if (!salon) {
      return NextResponse.json({ message: 'Salon non trouvé' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ message: 'ID membre requis' }, { status: 400 })
    }

    // Vérifier que le membre appartient au salon
    const existing = await prisma.salonMember.findFirst({
      where: {
        id,
        salonId: salon.id,
      },
    })

    if (!existing) {
      return NextResponse.json({ message: 'Membre non trouvé' }, { status: 404 })
    }

    await prisma.salonMember.delete({ where: { id } })

    return NextResponse.json({ message: 'Membre supprimé' })
  } catch (error) {
    console.error('Error deleting member:', error)
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}

// Helper pour les permissions par défaut
function getDefaultPermissions(role: string) {
  switch (role) {
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
        canManageMembers: false,
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
