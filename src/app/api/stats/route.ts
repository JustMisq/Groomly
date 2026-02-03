import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authConfig } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/stats
 * Statistiques avancées pour le dashboard
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig)
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const salon = await prisma.salon.findUnique({
      where: { userId: session.user.id },
    })

    if (!salon) {
      return NextResponse.json({
        message: 'No salon found',
        stats: null,
      })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'month' // month, quarter, year

    // Calculer les dates
    const now = new Date()
    let startDate: Date
    let previousStartDate: Date
    let previousEndDate: Date

    switch (period) {
      case 'quarter':
        const currentQuarter = Math.floor(now.getMonth() / 3)
        startDate = new Date(now.getFullYear(), currentQuarter * 3, 1)
        previousStartDate = new Date(now.getFullYear(), (currentQuarter - 1) * 3, 1)
        previousEndDate = new Date(now.getFullYear(), currentQuarter * 3, 0)
        break
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1)
        previousStartDate = new Date(now.getFullYear() - 1, 0, 1)
        previousEndDate = new Date(now.getFullYear() - 1, 11, 31)
        break
      default: // month
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        previousStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        previousEndDate = new Date(now.getFullYear(), now.getMonth(), 0)
    }

    // Récupérer les données en parallèle
    const [
      totalClients,
      totalAnimals,
      currentAppointments,
      previousAppointments,
      currentInvoices,
      previousInvoices,
      serviceStats,
      recentNoShows,
    ] = await Promise.all([
      // Total clients actifs
      prisma.client.count({
        where: { salonId: salon.id, deletedAt: null },
      }),
      // Total animaux
      prisma.animal.count({
        where: { 
          client: { salonId: salon.id },
          deletedAt: null,
        },
      }),
      // RDV période actuelle
      prisma.appointment.findMany({
        where: {
          salonId: salon.id,
          startTime: { gte: startDate },
          deletedAt: null,
        },
      }),
      // RDV période précédente
      prisma.appointment.findMany({
        where: {
          salonId: salon.id,
          startTime: { gte: previousStartDate, lte: previousEndDate },
          deletedAt: null,
        },
      }),
      // Factures période actuelle
      prisma.invoice.findMany({
        where: {
          salonId: salon.id,
          createdAt: { gte: startDate },
          deletedAt: null,
        },
      }),
      // Factures période précédente
      prisma.invoice.findMany({
        where: {
          salonId: salon.id,
          createdAt: { gte: previousStartDate, lte: previousEndDate },
          deletedAt: null,
        },
      }),
      // Stats par service
      prisma.appointment.groupBy({
        by: ['serviceId'],
        where: {
          salonId: salon.id,
          startTime: { gte: startDate },
          status: 'completed',
          deletedAt: null,
        },
        _count: true,
        _sum: { totalPrice: true },
      }),
      // No-shows récents
      prisma.appointment.count({
        where: {
          salonId: salon.id,
          status: 'no_show',
          startTime: { gte: startDate },
        },
      }),
    ])

    // Calculer les métriques
    const completedAppointments = currentAppointments.filter(a => a.status === 'completed')
    const cancelledAppointments = currentAppointments.filter(a => a.status === 'cancelled')
    const paidInvoices = currentInvoices.filter(i => i.status === 'paid')
    const unpaidInvoices = currentInvoices.filter(i => ['draft', 'sent', 'overdue'].includes(i.status))

    // Revenu
    const currentRevenue = paidInvoices.reduce((sum, i) => sum + i.total, 0)
    const previousRevenue = previousInvoices
      .filter(i => i.status === 'paid')
      .reduce((sum, i) => sum + i.total, 0)

    // Panier moyen
    const averageBasket = paidInvoices.length > 0
      ? currentRevenue / paidInvoices.length
      : 0

    // Taux de no-show
    const noShowRate = currentAppointments.length > 0
      ? (recentNoShows / currentAppointments.length) * 100
      : 0

    // Taux d'annulation
    const cancellationRate = currentAppointments.length > 0
      ? (cancelledAppointments.length / currentAppointments.length) * 100
      : 0

    // Taux de conversion RDV -> Paiement
    const conversionRate = completedAppointments.length > 0
      ? (paidInvoices.length / completedAppointments.length) * 100
      : 0

    // Évolution vs période précédente
    const revenueGrowth = previousRevenue > 0
      ? ((currentRevenue - previousRevenue) / previousRevenue) * 100
      : currentRevenue > 0 ? 100 : 0

    const appointmentGrowth = previousAppointments.length > 0
      ? ((currentAppointments.length - previousAppointments.length) / previousAppointments.length) * 100
      : currentAppointments.length > 0 ? 100 : 0

    // Top services
    const servicesWithDetails = await prisma.service.findMany({
      where: { id: { in: serviceStats.map(s => s.serviceId) } },
    })

    const topServices = serviceStats
      .map(stat => {
        const service = servicesWithDetails.find(s => s.id === stat.serviceId)
        return {
          id: stat.serviceId,
          name: service?.name || 'Service inconnu',
          count: stat._count,
          revenue: stat._sum.totalPrice || 0,
        }
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // Clients les plus actifs (derniers 30 jours)
    const activeClients = await prisma.appointment.groupBy({
      by: ['clientId'],
      where: {
        salonId: salon.id,
        startTime: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        status: 'completed',
      },
      _count: true,
    })

    return NextResponse.json({
      period,
      overview: {
        totalClients,
        totalAnimals,
        appointmentsThisPeriod: currentAppointments.length,
        completedAppointments: completedAppointments.length,
        revenue: currentRevenue,
        unpaidAmount: unpaidInvoices.reduce((sum, i) => sum + i.total, 0),
      },
      metrics: {
        averageBasket: Math.round(averageBasket * 100) / 100,
        noShowRate: Math.round(noShowRate * 10) / 10,
        cancellationRate: Math.round(cancellationRate * 10) / 10,
        conversionRate: Math.round(conversionRate * 10) / 10,
        noShowCount: recentNoShows,
      },
      trends: {
        revenueGrowth: Math.round(revenueGrowth * 10) / 10,
        appointmentGrowth: Math.round(appointmentGrowth * 10) / 10,
        previousRevenue,
        previousAppointments: previousAppointments.length,
      },
      topServices,
      activeClientsCount: activeClients.length,
    })
  } catch (error) {
    console.error('Stats error:', error)
    return NextResponse.json(
      { message: 'Error fetching stats', error: String(error) },
      { status: 500 }
    )
  }
}
