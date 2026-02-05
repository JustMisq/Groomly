'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface Analytics {
  totalRevenue: number
  mrr: number
  arr: number
  avgMrr: number
  totalUsers: number
  activeUsers: number
  newUsersThisMonth: number
  churnRate: number
  ltv: number
  cac: number
  paybackPeriod: number
  activeSubscriptions: number
  monthlyGrowth: number
  growthTrend: Array<{
    month: string
    users: number
    revenue: number
  }>
}

export default function AdminAnalyticsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session && !session.user?.isAdmin) {
      router.push('/dashboard')
    } else if (session) {
      fetchAnalytics()
    }
  }, [session, router])

  const fetchAnalytics = async () => {
    try {
      const res = await fetch('/api/admin/analytics')
      if (!res.ok) throw new Error('Erreur')

      const data = await res.json()
      setAnalytics(data)
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Impossible de charger les analytics')
    } finally {
      setLoading(false)
    }
  }

  if (!session?.user?.isAdmin) {
    return <div className="p-8"><p className="text-gray-600">Accès refusé</p></div>
  }

  if (loading) {
    return <div className="p-8"><div className="animate-spin text-4xl">⏳</div></div>
  }

  return (
    <div className="space-y-8 p-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📊 Analytics</h1>
          <p className="text-gray-600 mt-2">Métriques détaillées de la plateforme</p>
        </div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          ← Retour
        </Link>
      </div>

      {/* Revenus */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Revenu Total"
          value={`${analytics?.totalRevenue?.toFixed(2) || 0}€`}
          icon="💰"
          color="green"
        />
        <MetricCard
          title="MRR"
          value={`${analytics?.mrr?.toFixed(2) || 0}€`}
          icon="📈"
          color="blue"
          subtitle="Monthly Recurring Revenue"
        />
        <MetricCard
          title="ARR"
          value={`${analytics?.arr?.toFixed(2) || 0}€`}
          icon="📊"
          color="purple"
          subtitle="Annual Recurring Revenue"
        />
        <MetricCard
          title="Growth (Mois)"
          value={`${analytics?.monthlyGrowth?.toFixed(1) || 0}%`}
          icon="🚀"
          color="orange"
        />
      </div>

      {/* Utilisateurs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Utilisateurs Actifs"
          value={`${analytics?.activeUsers || 0}`}
          icon="👥"
          color="blue"
          subtitle={`sur ${analytics?.totalUsers || 0} total`}
        />
        <MetricCard
          title="Nouveaux (Ce mois)"
          value={`${analytics?.newUsersThisMonth || 0}`}
          icon="✨"
          color="green"
        />
        <MetricCard
          title="Souscriptions Actives"
          value={`${analytics?.activeSubscriptions || 0}`}
          icon="💳"
          color="purple"
        />
      </div>

      {/* Métriques clés */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <DetailCard
          label="Churn Rate"
          value={`${analytics?.churnRate?.toFixed(2) || 0}%`}
          detail="Taux d'annulation mensuel"
          warning={analytics?.churnRate ? analytics.churnRate > 5 : false}
        />
        <DetailCard
          label="LTV"
          value={`${analytics?.ltv?.toFixed(0) || 0}€`}
          detail="Lifetime Value par client"
        />
        <DetailCard
          label="CAC"
          value={`${analytics?.cac?.toFixed(0) || 0}€`}
          detail="Customer Acquisition Cost"
        />
        <DetailCard
          label="Payback Period"
          value={`${analytics?.paybackPeriod?.toFixed(1) || 0} mois`}
          detail="Période de rentabilité"
        />
      </div>

      {/* Tendance (placeholder - à remplir avec le graphique) */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 Tendance (6 derniers mois)</h3>

        {analytics?.growthTrend && analytics.growthTrend.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-200">
                <tr>
                  <th className="text-left py-2 font-medium text-gray-700">Mois</th>
                  <th className="text-right py-2 font-medium text-gray-700">Utilisateurs</th>
                  <th className="text-right py-2 font-medium text-gray-700">Revenu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {analytics.growthTrend.map((item) => (
                  <tr key={item.month}>
                    <td className="py-3">{item.month}</td>
                    <td className="text-right">{item.users}</td>
                    <td className="text-right font-medium">{item.revenue.toFixed(0)}€</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">Données non disponibles</p>
        )}
      </div>

      {/* Notes */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
        <p className="font-semibold mb-2">💡 Définitions</p>
        <ul className="space-y-1 text-xs">
          <li><strong>MRR:</strong> Revenu mensuel récurrent</li>
          <li><strong>ARR:</strong> Revenu annuel récurrent (MRR × 12)</li>
          <li><strong>LTV:</strong> Valeur totale apportée par un client</li>
          <li><strong>CAC:</strong> Coût pour acquérir un client</li>
          <li><strong>Churn:</strong> % d'utilisateurs non-renouvelés chaque mois</li>
        </ul>
      </div>
    </div>
  )
}

function MetricCard({
  title,
  value,
  icon,
  color,
  subtitle,
}: {
  title: string
  value: string | number
  icon: string
  color: string
  subtitle?: string
}) {
  const colors: Record<string, string> = {
    green: 'bg-green-50 border-green-200',
    blue: 'bg-blue-50 border-blue-200',
    purple: 'bg-purple-50 border-purple-200',
    orange: 'bg-orange-50 border-orange-200',
  }

  return (
    <div className={`${colors[color]} border rounded-lg p-4`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
    </div>
  )
}

function DetailCard({
  label,
  value,
  detail,
  warning,
}: {
  label: string
  value: string
  detail: string
  warning?: boolean
}) {
  return (
    <div
      className={`border rounded-lg p-4 ${
        warning ? 'bg-yellow-50 border-yellow-200' : 'bg-white border-gray-200'
      }`}
    >
      <p className={warning ? 'text-yellow-700 text-sm' : 'text-gray-600 text-sm'}>
        {label}
      </p>
      <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
      <p className={warning ? 'text-xs text-yellow-600 mt-1' : 'text-xs text-gray-500 mt-1'}>
        {detail}
      </p>
    </div>
  )
}
