import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authConfig } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

// GET /api/admin/stats - Stats globales
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig)
    if (!session?.user?.id || !session.user.isAdmin) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    // Comptes
    const totalUsers = await prisma.user.count()
    const totalSalons = await prisma.salon.count()

    // Souscriptions
    const subscriptions = await prisma.subscription.findMany({
      where: { user: { deletedAt: null } },
      include: { user: true },
    })

    const activeSubscriptions = subscriptions.filter(
      (s) => s.status === 'active'
    ).length

    // Revenus
    const totalRevenue = subscriptions.reduce((acc, s) => acc + s.price, 0)

    // MRR (Monthly Recurring Revenue)
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    const monthlySubscriptions = subscriptions.filter(
      (s) =>
        new Date(s.currentPeriodStart) <= monthEnd &&
        new Date(s.currentPeriodEnd) >= monthStart &&
        s.status === 'active'
    )

    const monthlyRevenue = monthlySubscriptions.reduce((acc, s) => {
      // Calculer le revenu proportionnel au mois
      const monthPlan = s.plan === 'yearly' ? s.price / 12 : s.price
      return acc + monthPlan
    }, 0)

    // Churn (% d'annulations ce mois)
    const lastMonthStart = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1
    )
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)

    const cancelledThisMonth = subscriptions.filter(
      (s) =>
        s.status === 'cancelled' &&
        s.updatedAt >= monthStart &&
        s.updatedAt <= monthEnd
    ).length

    const activeLastMonth = subscriptions.filter(
      (s) =>
        new Date(s.currentPeriodStart) <= lastMonthEnd &&
        new Date(s.currentPeriodEnd) >= lastMonthStart
    ).length

    const churnRate = activeLastMonth > 0 
      ? (cancelledThisMonth / activeLastMonth) * 100 
      : 0

    // Tickets
    const totalTickets = await prisma.supportTicket.count()
    const openTickets = await prisma.supportTicket.count({
      where: { status: { in: ['open', 'in_progress'] } },
    })

    return NextResponse.json({
      totalUsers,
      totalSalons,
      activeSubscriptions,
      totalRevenue,
      monthlyRevenue,
      avgChurn: churnRate,
      totalTickets,
      openTickets,
    })
  } catch (error) {
    console.error('Erreur GET /api/admin/stats:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
