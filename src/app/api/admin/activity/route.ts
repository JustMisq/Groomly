import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authConfig } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

// GET /api/admin/activity - Lister les activités
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig)
    if (!session?.user?.id || !session.user.isAdmin) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const resource = searchParams.get('resource')
    const userId = searchParams.get('userId')
    const salonId = searchParams.get('salonId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    const skip = (page - 1) * limit

    const where: any = {}
    if (action && action !== 'all') where.action = action
    if (resource && resource !== 'all') where.resource = resource
    if (userId) where.userId = userId
    if (salonId) where.salonId = salonId

    const activities = await prisma.activityLog.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    })

    const total = await prisma.activityLog.count({ where })
    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      activities,
      pagination: { page, limit, total, totalPages },
    })
  } catch (error) {
    console.error('Erreur GET /api/admin/activity:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// POST /api/admin/activity - Créer une activité
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const { action, resource, resourceId, salonId, oldValue, newValue, ipAddress, userAgent } = await request.json()

    const activity = await prisma.activityLog.create({
      data: {
        action,
        resource,
        resourceId,
        userId: session.user.id,
        salonId,
        oldValue,
        newValue,
        ipAddress,
        userAgent,
      },
    })

    return NextResponse.json(activity, { status: 201 })
  } catch (error) {
    console.error('Erreur POST /api/admin/activity:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
