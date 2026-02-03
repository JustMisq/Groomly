'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function DashboardPage() {
  const { data: session } = useSession()

  return (
    <div className="p-8">
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
          value="0"
          icon="👥"
          href="/dashboard/clients"
        />
        <StatCard
          title="Animaux"
          value="0"
          icon="🐕"
          href="/dashboard/clients"
        />
        <StatCard
          title="Rendez-vous"
          value="0"
          icon="📅"
          href="/dashboard/appointments"
        />
        <StatCard
          title="Revenu ce mois"
          value="0€"
          icon="💰"
          href="/dashboard/appointments"
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

        {/* Subscription */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            💳 Gérer mon abonnement
          </h2>
          <p className="text-gray-600 mb-4">
            Visualisez et gérez votre abonnement Groomly
          </p>
          <Link href="/dashboard/subscription">
            <Button className="bg-blue-500 hover:bg-blue-600">
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
