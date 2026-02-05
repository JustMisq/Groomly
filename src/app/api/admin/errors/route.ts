import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authConfig } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

// GET /api/admin/errors - Lister les erreurs
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig)
    if (!session?.user?.id || !session.user.isAdmin) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const severity = searchParams.get('severity')
    const resolved = searchParams.get('resolved')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    const skip = (page - 1) * limit

    const where: any = {}
    if (severity && severity !== 'all') where.severity = severity
    if (resolved === 'true') where.resolved = true
    if (resolved === 'false') where.resolved = false

    const errors = await prisma.errorLog.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    })

    const total = await prisma.errorLog.count({ where })
    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      errors,
      pagination: { page, limit, total, totalPages },
    })
  } catch (error) {
    console.error('Erreur GET /api/admin/errors:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// POST /api/admin/errors - Créer une erreur (pour les erreurs frontend)
export async function POST(request: NextRequest) {
  try {
    const { message, stack, severity, url, method, userAgent, ipAddress } = await request.json()

    const errorLog = await prisma.errorLog.create({
      data: {
        message,
        stack,
        severity: severity || 'error',
        url,
        method,
        userAgent,
        ipAddress,
      },
    })

    return NextResponse.json(errorLog, { status: 201 })
  } catch (error) {
    console.error('Erreur POST /api/admin/errors:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
