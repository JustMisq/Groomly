import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authConfig } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'
import { generateDemoData, clearDemoData } from '@/lib/demo-data'

/**
 * POST /api/demo-data - Générer des données démo
 * DELETE /api/demo-data - Supprimer les données démo
 */

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig)
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const salon = await prisma.salon.findUnique({
      where: { userId: session.user.id },
    })

    if (!salon) {
      return NextResponse.json(
        { message: 'Vous devez d\'abord créer un salon' },
        { status: 400 }
      )
    }

    // Vérifier si le salon a déjà des données
    const existingClients = await prisma.client.count({
      where: { salonId: salon.id },
    })

    if (existingClients > 0) {
      const body = await request.json().catch(() => ({}))
      if (!body.force) {
        return NextResponse.json(
          { 
            message: 'Des données existent déjà. Utilisez force: true pour les remplacer.',
            existingClients,
          },
          { status: 409 }
        )
      }
      // Nettoyer les données existantes
      await clearDemoData(salon.id)
    }

    // Générer les données démo
    const stats = await generateDemoData(salon.id)

    return NextResponse.json({
      message: 'Données démo générées avec succès',
      ...stats,
    })
  } catch (error) {
    console.error('Generate demo data error:', error)
    return NextResponse.json(
      { message: 'Erreur lors de la génération', error: String(error) },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig)
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const salon = await prisma.salon.findUnique({
      where: { userId: session.user.id },
    })

    if (!salon) {
      return NextResponse.json(
        { message: 'Salon not found' },
        { status: 404 }
      )
    }

    await clearDemoData(salon.id)

    return NextResponse.json({
      message: 'Toutes les données ont été supprimées',
    })
  } catch (error) {
    console.error('Clear demo data error:', error)
    return NextResponse.json(
      { message: 'Erreur lors de la suppression', error: String(error) },
      { status: 500 }
    )
  }
}
