import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authConfig } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

// GET /api/salon/logs - Récupérer les audit logs
export async function GET(request: NextRequest) {
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

    // Paramètres de pagination et filtrage
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const action = searchParams.get('action')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const exportCsv = searchParams.get('export') === 'csv'

    const skip = (page - 1) * limit

    // Construire les filtres
    const where: any = { salonId: salon.id }

    if (action && action !== 'all') {
      where.action = action
    }

    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) {
        where.createdAt.gte = new Date(startDate)
      }
      if (endDate) {
        const end = new Date(endDate)
        end.setHours(23, 59, 59, 999)
        where.createdAt.lte = end
      }
    }

    // Récupérer les logs
    const logs = await prisma.auditLog.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: exportCsv ? undefined : skip,
      take: exportCsv ? undefined : limit,
    })

    if (exportCsv) {
      // Générer CSV
      const headers = ['Date', 'Utilisateur', 'Email', 'Action', 'Type', 'Entité ID']
      const rows = logs.map((log) => [
        new Date(log.createdAt).toLocaleString('fr-FR'),
        log.user.name,
        log.user.email,
        log.action,
        log.entityType,
        log.entityId,
      ])

      const csv = [headers, ...rows]
        .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        .join('\n')

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="audit-logs.csv"',
        },
      })
    }

    // Compter total pour pagination
    const total = await prisma.auditLog.count({ where })
    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    })
  } catch (error) {
    console.error('Erreur GET /api/salon/logs:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
