import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authConfig } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig)
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    // Récupérer toutes les données de l'utilisateur
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        salon: {
          include: {
            clients: {
              include: {
                animals: true,
                appointments: true,
                invoices: true,
              },
            },
            services: true,
            appointments: {
              include: {
                client: true,
                animal: true,
                service: true,
              },
            },
            invoices: {
              include: {
                client: true,
                appointment: true,
              },
            },
            inventory: true,
          },
        },
        subscription: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }

    // Structurer les données pour l'export
    const exportData = {
      exportDate: new Date().toISOString(),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
      },
      salon: user.salon,
      subscription: user.subscription,
    }

    return NextResponse.json(exportData)
  } catch (error) {
    console.error('Export data error:', error)
    return NextResponse.json(
      { message: 'Error exporting data' },
      { status: 500 }
    )
  }
}
