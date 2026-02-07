'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface AdminStats {
  totalUsers: number
  totalSalons: number
  activeSubscriptions: number
  totalRevenue: number
  monthlyRevenue: number
  avgChurn: number
  totalTickets: number
  openTickets: number
}

export default function AdminDashboard() {
  const { data: session } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Vérifier que l'utilisateur est admin
    if (session && !session.user?.isAdmin) {
      router.push('/dashboard')
    } else if (session) {
      fetchStats()
    }
  }, [session, router])

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats')
      if (!res.ok) throw new Error('Erreur')
      const data = await res.json()
      setStats(data)
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!session?.user?.isAdmin) {
    return (
      <div className="p-8">
        <p className="text-gray-600">Accès refusé. Administrateur requis.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-spin text-4xl">⏳</div>
      </div>
    )
  }

  return (
    <div className="space-y-8 p-8">
      {/* En-tête */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900">🛡️ Admin Groomly</h1>
        <p className="text-gray-600 mt-2">Gestion de la plateforme SaaS</p>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Utilisateurs"
          value={stats?.totalUsers || 0}
          icon="👥"
          color="blue"
        />
        <StatCard
          title="Salons Actifs"
          value={stats?.totalSalons || 0}
          icon="🏪"
          color="green"
        />
        <StatCard
          title="Souscriptions"
          value={stats?.activeSubscriptions || 0}
          icon="💳"
          color="purple"
        />
        <StatCard
          title="Tickets Ouverts"
          value={stats?.openTickets || 0}
          icon="🎫"
          color="red"
        />
      </div>

      {/* Revenus */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4">💰 Revenus</h3>
          <div className="space-y-4">
            <div>
              <p className="text-gray-600 text-sm">MRR (Monthly Recurring)</p>
              <p className="text-3xl font-bold text-green-600">
                {stats?.monthlyRevenue?.toFixed(2)}€
              </p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Revenu Total</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.totalRevenue?.toFixed(2)}€
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4">📊 Métriques</h3>
          <div className="space-y-4">
            <div>
              <p className="text-gray-600 text-sm">Churn Rate (mois)</p>
              <p className="text-3xl font-bold text-orange-600">
                {stats?.avgChurn?.toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Taux de conversion</p>
              <p className="text-xl font-bold text-gray-900">-</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminLink
          href="/admin/users"
          title="👥 Utilisateurs"
          description="Gérer tous les comptes"
        />
        <AdminLink
          href="/admin/salons"
          title="🏢 Salons"
          description={`${stats?.totalSalons || 0} salon(s)`}
        />
        <AdminLink
          href="/admin/tickets"
          title="🎫 Support"
          description={`${stats?.openTickets || 0} ticket(s) ouvert(s)`}
        />
        <AdminLink
          href="/admin/errors"
          title="🚨 Erreurs"
          description="Monitoring bugs & erreurs"
        />
        <AdminLink
          href="/admin/activity"
          title="📊 Activité"
          description="Journal des actions"
        />
        <AdminLink
          href="/admin/interactions"
          title="💬 Interactions"
          description="Feedback & demandes"
        />
        <AdminLink
          href="/admin/usage"
          title="📈 Usage"
          description="Statistiques features"
        />
        <AdminLink
          href="/admin/performance"
          title="⚡ Performance"
          description="Métriques système"
        />
        <AdminLink
          href="/admin/webhooks"
          title="🔔 Webhooks"
          description="Alertes & notifications"
        />
        <AdminLink
          href="/admin/analytics"
          title="📊 Analytics"
          description="Statistiques détaillées"
        />
      </div>

      {/* Signaux d'alerte */}
      <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
        <h3 className="font-semibold text-yellow-900 mb-3">⚠️ Signaux d'alerte</h3>
        <ul className="space-y-2 text-sm text-yellow-800">
          {stats && stats.openTickets > 5 && (
            <li>• {stats.openTickets} tickets en attente de réponse</li>
          )}
          {stats && stats.avgChurn > 5 && (
            <li>• Churn rate élevée ({stats.avgChurn.toFixed(1)}%)</li>
          )}
          {stats && stats.monthlyRevenue === 0 && (
            <li>• Aucun revenu enregistré ce mois</li>
          )}
          {!stats && <li>• Chargement des données...</li>}
        </ul>
      </div>
    </div>
  )
}

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string
  value: number
  icon: string
  color: string
}) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 border-blue-200',
    green: 'bg-green-50 border-green-200',
    purple: 'bg-purple-50 border-purple-200',
    red: 'bg-red-50 border-red-200',
  }

  return (
    <div className={`${colors[color]} p-6 rounded-lg border`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <span className="text-4xl">{icon}</span>
      </div>
    </div>
  )
}

function AdminLink({
  href,
  title,
  description,
}: {
  href: string
  title: string
  description: string
}) {
  return (
    <Link
      href={href}
      className="p-6 rounded-lg border border-gray-200 hover:border-primary hover:shadow-lg transition bg-white"
    >
      <h4 className="font-semibold text-gray-900 mb-2">{title}</h4>
      <p className="text-sm text-gray-600">{description}</p>
    </Link>
  )
}
