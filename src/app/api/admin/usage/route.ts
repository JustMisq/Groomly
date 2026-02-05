import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authConfig } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

// GET /api/admin/usage - Lister les usages de features
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig)
    if (!session?.user?.id || !session.user.isAdmin) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const featureName = searchParams.get('featureName')
    const userId = searchParams.get('userId')
    const salonId = searchParams.get('salonId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    const skip = (page - 1) * limit

    const where: any = {}
    if (featureName && featureName !== 'all') where.featureName = featureName
    if (userId) where.userId = userId
    if (salonId) where.salonId = salonId

    // Get usage logs
    const usageLogs = await prisma.featureUsageLog.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    })

    const total = await prisma.featureUsageLog.count({ where })
    const totalPages = Math.ceil(total / limit)

    // Get summary stats
    const allLogs = await prisma.featureUsageLog.findMany({
      where,
      select: { featureName: true, duration: true, itemCount: true },
    })

    const summary = allLogs.reduce((acc: any, log) => {
      if (!acc[log.featureName]) {
        acc[log.featureName] = { count: 0, totalDuration: 0, totalItems: 0 }
      }
      acc[log.featureName].count += 1
      acc[log.featureName].totalDuration += log.duration || 0
      acc[log.featureName].totalItems += log.itemCount || 0
      return acc
    }, {})

    return NextResponse.json({
      usageLogs,
      summary,
      pagination: { page, limit, total, totalPages },
    })
  } catch (error) {
    console.error('Erreur GET /api/admin/usage:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// POST /api/admin/usage - Enregistrer un usage de feature
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const { featureName, action, salonId, duration, itemCount } = await request.json()

    const usageLog = await prisma.featureUsageLog.create({
      data: {
        featureName,
        action,
        userId: session.user.id,
        salonId: salonId || '',
        duration,
        itemCount,
      },
    })

    return NextResponse.json(usageLog, { status: 201 })
  } catch (error) {
    console.error('Erreur POST /api/admin/usage:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
