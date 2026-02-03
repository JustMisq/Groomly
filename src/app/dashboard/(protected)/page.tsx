'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import SalonCheckBanner from '@/components/salon-check-banner'
import { useState, useEffect } from 'react'

export default function DashboardPage() {
  const { data: session } = useSession()
  const [stats, setStats] = useState({
    clientCount: 0,
    animalCount: 0,
    appointmentCount: 0,
    monthlyRevenue: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const [clientsRes, animalsRes, appointmentsRes, invoicesRes] = await Promise.all([
        fetch('/api/clients'),
        fetch('/api/animals'),
        fetch('/api/appointments'),
        fetch('/api/invoices'),
      ])

      const clients = clientsRes.ok ? await clientsRes.json() : []
      const animals = animalsRes.ok ? await animalsRes.json() : []
      const appointments = appointmentsRes.ok ? await appointmentsRes.json() : []
      const invoices = invoicesRes.ok ? await invoicesRes.json() : []

      // Calculer le revenu du mois actuel
      const now = new Date()
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      
      const monthlyInvoices = invoices.filter((inv: any) => {
        const invDate = new Date(inv.createdAt)
        return invDate >= monthStart && invDate <= monthEnd && inv.status === 'paid'
      })
      
      const monthlyRevenue = monthlyInvoices.reduce((sum: number, inv: any) => sum + (inv.total || 0), 0)

      setStats({
        clientCount: clients.length,
        animalCount: animals.length,
        appointmentCount: appointments.length,
        monthlyRevenue,
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8">
      <SalonCheckBanner />
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Bienvenue, {session?.user?.name}!
        </h1>
        <p className="text-gray-600 mt-2">
          Gérez votre salon de toilettage depuis ce tableau de bord
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Clients"
          value={loading ? '-' : stats.clientCount.toString()}
          icon="👥"
          href="/dashboard/clients"
        />
        <StatCard
          title="Animaux"
          value={loading ? '-' : stats.animalCount.toString()}
          icon="🐕"
          href="/dashboard/animals"
        />
        <StatCard
          title="Rendez-vous"
          value={loading ? '-' : stats.appointmentCount.toString()}
          icon="📅"
          href="/dashboard/appointments"
        />
        <StatCard
          title="Revenu ce mois"
          value={loading ? '-' : `${stats.monthlyRevenue.toFixed(2)}€`}
          icon="💰"
          href="/dashboard/reports"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Setup Salon */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-primary">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            🏪 Configurer mon salon
          </h2>
          <p className="text-gray-600 mb-4">
            Complétez les informations de votre salon pour commencer
          </p>
          <Link href="/dashboard/salon">
            <Button className="bg-primary hover:bg-primary/90">
              Configurer mon salon
            </Button>
          </Link>
        </div>

        {/* Setup Services */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-secondary">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            ✂️ Ajouter des services
          </h2>
          <p className="text-gray-600 mb-4">
            Créez vos services de toilettage avec prix et durée
          </p>
          <Link href="/dashboard/services">
            <Button className="bg-secondary hover:bg-secondary/90">
              Ajouter des services
            </Button>
          </Link>
        </div>

        {/* First Client */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            👥 Ajouter un client
          </h2>
          <p className="text-gray-600 mb-4">
            Créez votre première fiche client
          </p>
          <Link href="/dashboard/clients">
            <Button className="bg-green-500 hover:bg-green-600">
              Ajouter un client
            </Button>
          </Link>
        </div>

        {/* Appointments & Revenue */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-orange-500">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            📅 Créer un rendez-vous
          </h2>
          <p className="text-gray-600 mb-4">
            Planifiez un rendez-vous et générez une facture
          </p>
          <Link href="/dashboard/appointments">
            <Button className="bg-orange-500 hover:bg-orange-600">
              Nouveau rendez-vous
            </Button>
          </Link>
        </div>

        {/* Invoices & Revenue */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            💰 Gérer mes revenus
          </h2>
          <p className="text-gray-600 mb-4 text-sm">
            Visualisez toutes vos factures, revenus et statistiques financières
          </p>
          <Link href="/dashboard/reports">
            <Button className="bg-blue-500 hover:bg-blue-600 w-full">
              Voir mes factures et revenus
            </Button>
          </Link>
        </div>

        {/* Subscription */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-indigo-500">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            💳 Abonnement
          </h2>
          <p className="text-gray-600 mb-4">
            Visualisez et gérez votre abonnement Groomly
          </p>
          <Link href="/dashboard/subscription">
            <Button className="bg-indigo-500 hover:bg-indigo-600">
              Gérer l&apos;abonnement
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  title,
  value,
  icon,
  href,
}: {
  title: string
  value: string
  icon: string
  href: string
}) {
  return (
    <Link href={href}>
      <div className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          </div>
          <div className="text-4xl">{icon}</div>
        </div>
      </div>
    </Link>
  )
}
