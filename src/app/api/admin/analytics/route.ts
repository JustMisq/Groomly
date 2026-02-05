import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authConfig } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

// GET /api/admin/analytics - Détails analytiques
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig)
    if (!session?.user?.id || !session.user.isAdmin) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const now = new Date()
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1)

    // Utilisateurs
    const totalUsers = await prisma.user.count()
    const activeUsers = await prisma.user.count({
      where: { deletedAt: null },
    })
    const newUsersThisMonth = await prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(now.getFullYear(), now.getMonth(), 1),
        },
      },
    })

    // Souscriptions
    const subscriptions = await prisma.subscription.findMany({
      include: { user: true },
    })

    const activeSubscriptions = subscriptions.filter(
      (s) => s.status === 'active'
    ).length

    // Calculs financiers
    const totalRevenue = subscriptions.reduce((acc, s) => acc + s.price, 0)

    // MRR
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    const monthlySubscriptions = subscriptions.filter(
      (s) =>
        new Date(s.currentPeriodStart) <= monthEnd &&
        new Date(s.currentPeriodEnd) >= monthStart &&
        s.status === 'active'
    )

    const mrr = monthlySubscriptions.reduce((acc, s) => {
      const monthPlan = s.plan === 'yearly' ? s.price / 12 : s.price
      return acc + monthPlan
    }, 0)

    const arr = mrr * 12

    // Churn
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
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

    // LTV (Lifetime Value) - Revenu moyen par client
    const ltv = activeUsers > 0 ? totalRevenue / activeUsers : 0

    // CAC (Customer Acquisition Cost) - Estimation: coûts marketing / nouveaux clients
    // Pour la démo: on estime à 0 (pas de tracking des coûts)
    const cac = 0

    // Payback Period = CAC / (MRR / activeSubscriptions)
    const monthlyRevenuePerCustomer = activeSubscriptions > 0 ? mrr / activeSubscriptions : 0
    const paybackPeriod = monthlyRevenuePerCustomer > 0 && cac > 0
      ? cac / monthlyRevenuePerCustomer
      : 0

    // Croissance mensuelle
    const monthlyGrowth = activeLastMonth > 0
      ? ((activeSubscriptions - activeLastMonth) / activeLastMonth) * 100
      : 0

    // Tendance (6 derniers mois)
    const growthTrend = []
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthDateEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0)

      const usersAtMonth = await prisma.user.count({
        where: {
          createdAt: { lte: monthDateEnd },
          deletedAt: null,
        },
      })

      const revenueAtMonth = await prisma.subscription.aggregate({
        where: {
          createdAt: { lte: monthDateEnd },
          status: 'active',
        },
        _sum: { price: true },
      })

      growthTrend.push({
        month: monthDate.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }),
        users: usersAtMonth,
        revenue: revenueAtMonth._sum.price || 0,
      })
    }

    return NextResponse.json({
      totalRevenue,
      mrr,
      arr,
      avgMrr: mrr,
      totalUsers,
      activeUsers,
      newUsersThisMonth,
      churnRate,
      ltv,
      cac,
      paybackPeriod: Math.round(paybackPeriod * 10) / 10,
      activeSubscriptions,
      monthlyGrowth,
      growthTrend,
    })
  } catch (error) {
    console.error('Erreur GET /api/admin/analytics:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
