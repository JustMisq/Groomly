import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authConfig } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

// GET /api/admin/performance - Lister les métriques de performance
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig)
    if (!session?.user?.id || !session.user.isAdmin) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const metric = searchParams.get('metric')
    const isSlowQuery = searchParams.get('isSlowQuery')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    const skip = (page - 1) * limit

    const where: any = {}
    if (metric && metric !== 'all') where.metric = metric
    if (isSlowQuery === 'true') where.isSlowQuery = true

    const metrics = await prisma.performanceMetric.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    })

    const total = await prisma.performanceMetric.count({ where })
    const totalPages = Math.ceil(total / limit)

    // Get average response times per endpoint
    const allMetrics = await prisma.performanceMetric.findMany({ where })
    const averages = allMetrics.reduce((acc: any, m) => {
      const key = m.metric
      if (!acc[key]) {
        acc[key] = { values: [], endpoint: m.endpoint }
      }
      acc[key].values.push(m.value)
      return acc
    }, {})

    const summary = Object.entries(averages).reduce((acc: any, [key, data]: any) => {
      const values = data.values
      const avg = values.reduce((a: number, b: number) => a + b, 0) / values.length
      const max = Math.max(...values)
      const min = Math.min(...values)
      acc[key] = {
        average: Math.round(avg * 100) / 100,
        max,
        min,
        count: values.length,
        endpoint: data.endpoint,
      }
      return acc
    }, {})

    return NextResponse.json({
      metrics,
      summary,
      pagination: { page, limit, total, totalPages },
    })
  } catch (error) {
    console.error('Erreur GET /api/admin/performance:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// POST /api/admin/performance - Enregistrer une métrique
export async function POST(request: NextRequest) {
  try {
    const { metric, value, endpoint, userId, salonId, isSlowQuery } = await request.json()

    const perfMetric = await prisma.performanceMetric.create({
      data: {
        metric,
        value,
        endpoint,
        userId,
        salonId,
        isSlowQuery: isSlowQuery || value > 1000, // Marquer comme slow si > 1000ms
      },
    })

    return NextResponse.json(perfMetric, { status: 201 })
  } catch (error) {
    console.error('Erreur POST /api/admin/performance:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
