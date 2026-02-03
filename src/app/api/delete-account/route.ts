import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authConfig } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig)
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { password } = body

    if (!password) {
      return NextResponse.json(
        { message: 'Password is required' },
        { status: 400 }
      )
    }

    // Vérifier le mot de passe
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }

    const passwordMatch = await bcrypt.compare(password, user.password)
    if (!passwordMatch) {
      return NextResponse.json(
        { message: 'Invalid password' },
        { status: 401 }
      )
    }

    // Récupérer le salon
    const salon = await prisma.salon.findUnique({
      where: { userId: user.id },
    })

    // Supprimer toutes les données en cascade
    if (salon) {
      await Promise.all([
        prisma.invoice.deleteMany({ where: { salonId: salon.id } }),
        prisma.appointment.deleteMany({ where: { salonId: salon.id } }),
        prisma.inventoryItem.deleteMany({ where: { salonId: salon.id } }),
        prisma.service.deleteMany({ where: { salonId: salon.id } }),
        prisma.animal.deleteMany({
          where: {
            client: { salonId: salon.id },
          },
        }),
        prisma.client.deleteMany({ where: { salonId: salon.id } }),
        prisma.salon.delete({ where: { id: salon.id } }),
      ])
    }

    // Supprimer l'abonnement
    if (user.id) {
      await prisma.subscription.deleteMany({
        where: { userId: user.id },
      })
    }

    // Supprimer l'utilisateur
    await prisma.user.delete({
      where: { id: user.id },
    })

    return NextResponse.json({
      message: 'Account deleted successfully',
    })
  } catch (error) {
    console.error('Delete account error:', error)
    return NextResponse.json(
      { message: 'Error deleting account', error: String(error) },
      { status: 500 }
    )
  }
}
