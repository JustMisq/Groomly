import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authConfig } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

// GET /api/admin/logs - Logs globaux
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig)
    if (!session?.user?.id || !session.user.isAdmin) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '100')
    const action = searchParams.get('action')
    const severity = searchParams.get('severity')

    const skip = (page - 1) * limit

    const where: any = {}

    if (action && action !== 'all') {
      where.action = action
    }

    // Récupérer les logs avec les modèles existants
    // Combinaison de AuditLog + SupportTicket + Subscription events
    const auditLogs = await prisma.auditLog.findMany({
      where,
      include: {
        user: {
          select: { name: true, email: true },
        },
        salon: {
          select: { id: true, name: true },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    })

    // Mapper les audit logs au format global
    const logs = auditLogs.map((log) => ({
      id: log.id,
      action: log.action,
      entityType: log.entityType,
      entityId: log.entityId,
      description: `${log.entityType} ${log.action}d (ID: ${log.entityId})`,
      createdAt: log.createdAt,
      user: log.user,
      salon: log.salon,
      severity: log.action === 'delete' ? 'warning' : 'info',
    }))

    const total = await prisma.auditLog.count({ where })
    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      logs,
      pagination: { page, limit, total, totalPages },
      totalPages,
    })
  } catch (error) {
    console.error('Erreur GET /api/admin/logs:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
