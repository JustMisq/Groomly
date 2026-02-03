'use client'

import { useState, useEffect } from 'react'

interface Stats {
  period: string
  overview: {
    totalClients: number
    totalAnimals: number
    appointmentsThisPeriod: number
    completedAppointments: number
    revenue: number
    unpaidAmount: number
  }
  metrics: {
    averageBasket: number
    noShowRate: number
    cancellationRate: number
    conversionRate: number
    noShowCount: number
  }
  trends: {
    revenueGrowth: number
    appointmentGrowth: number
    previousRevenue: number
    previousAppointments: number
  }
  topServices: Array<{
    id: string
    name: string
    count: number
    revenue: number
  }>
  activeClientsCount: number
}

interface StatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: string
  trend?: number
  trendLabel?: string
  color?: 'primary' | 'green' | 'orange' | 'red' | 'blue'
}

function StatsCard({ title, value, subtitle, icon, trend, trendLabel, color = 'primary' }: StatsCardProps) {
  const colorClasses = {
    primary: 'border-l-primary',
    green: 'border-l-green-500',
    orange: 'border-l-orange-500',
    red: 'border-l-red-500',
    blue: 'border-l-blue-500',
  }

  return (
    <div className={`bg-white rounded-lg p-5 border border-gray-200 border-l-4 ${colorClasses[color]}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <span className="text-2xl">{icon}</span>
      </div>
      {trend !== undefined && (
        <div className="mt-3 flex items-center gap-1">
          <span className={`text-sm font-medium ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
          <span className="text-xs text-gray-500">{trendLabel || 'vs période précédente'}</span>
        </div>
      )}
    </div>
  )
}

function MetricBadge({ label, value, color }: { label: string; value: string; color: 'green' | 'orange' | 'red' | 'blue' }) {
  const colors = {
    green: 'bg-green-100 text-green-800',
    orange: 'bg-orange-100 text-orange-800',
    red: 'bg-red-100 text-red-800',
    blue: 'bg-blue-100 text-blue-800',
  }

  return (
    <div className={`px-3 py-2 rounded-lg ${colors[color]}`}>
      <p className="text-xs font-medium opacity-75">{label}</p>
      <p className="text-lg font-bold">{value}</p>
    </div>
  )
}

export default function AdvancedStats() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<'month' | 'quarter' | 'year'>('month')

  useEffect(() => {
    fetchStats()
  }, [period])

  const fetchStats = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/stats?period=${period}`)
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const periodLabels = {
    month: 'Ce mois',
    quarter: 'Ce trimestre',
    year: 'Cette année',
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-48"></div>
        <div className="grid md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800">
        Créez votre salon pour voir les statistiques
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header avec sélecteur de période */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-xl font-semibold text-gray-900">📊 Tableau de bord</h2>
        <div className="flex gap-2">
          {(['month', 'quarter', 'year'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                period === p
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {periodLabels[p]}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs principaux */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Revenu"
          value={`${stats.overview.revenue.toFixed(2)}€`}
          subtitle={periodLabels[period]}
          icon="💰"
          trend={stats.trends.revenueGrowth}
          color="green"
        />
        <StatsCard
          title="Rendez-vous"
          value={stats.overview.appointmentsThisPeriod}
          subtitle={`${stats.overview.completedAppointments} terminés`}
          icon="📅"
          trend={stats.trends.appointmentGrowth}
          color="blue"
        />
        <StatsCard
          title="Panier moyen"
          value={`${stats.metrics.averageBasket.toFixed(2)}€`}
          subtitle="Par facture payée"
          icon="🛒"
          color="primary"
        />
        <StatsCard
          title="Impayés"
          value={`${stats.overview.unpaidAmount.toFixed(2)}€`}
          subtitle="En attente de paiement"
          icon="⏳"
          color="orange"
        />
      </div>

      {/* Métriques business */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 Indicateurs clés</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricBadge
            label="Taux de no-show"
            value={`${stats.metrics.noShowRate}%`}
            color={stats.metrics.noShowRate > 10 ? 'red' : stats.metrics.noShowRate > 5 ? 'orange' : 'green'}
          />
          <MetricBadge
            label="Taux d'annulation"
            value={`${stats.metrics.cancellationRate}%`}
            color={stats.metrics.cancellationRate > 15 ? 'red' : stats.metrics.cancellationRate > 8 ? 'orange' : 'green'}
          />
          <MetricBadge
            label="Conversion paiement"
            value={`${stats.metrics.conversionRate}%`}
            color={stats.metrics.conversionRate > 90 ? 'green' : stats.metrics.conversionRate > 70 ? 'orange' : 'red'}
          />
          <MetricBadge
            label="Clients actifs"
            value={`${stats.activeClientsCount}`}
            color="blue"
          />
        </div>
        
        {/* Alerte no-show si élevé */}
        {stats.metrics.noShowCount > 0 && stats.metrics.noShowRate > 5 && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-3">
            <span className="text-red-500">⚠️</span>
            <div>
              <p className="text-sm font-medium text-red-800">
                {stats.metrics.noShowCount} no-show(s) {periodLabels[period].toLowerCase()}
              </p>
              <p className="text-xs text-red-600 mt-1">
                Pensez à activer les rappels automatiques par email 24h avant les RDV
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Top services */}
      {stats.topServices.length > 0 && (
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🏆 Top services</h3>
          <div className="space-y-3">
            {stats.topServices.map((service, index) => (
              <div key={service.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    index === 0 ? 'bg-yellow-400 text-yellow-900' :
                    index === 1 ? 'bg-gray-300 text-gray-700' :
                    index === 2 ? 'bg-orange-300 text-orange-900' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {index + 1}
                  </span>
                  <span className="font-medium text-gray-900">{service.name}</span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-gray-500">{service.count} RDV</span>
                  <span className="font-semibold text-green-600">{service.revenue.toFixed(2)}€</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Vue d'ensemble */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg p-5 border border-gray-200">
          <h4 className="text-sm font-medium text-gray-500 mb-3">👥 Fichier client</h4>
          <div className="flex items-end gap-6">
            <div>
              <p className="text-3xl font-bold text-gray-900">{stats.overview.totalClients}</p>
              <p className="text-sm text-gray-500">clients</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">{stats.overview.totalAnimals}</p>
              <p className="text-sm text-gray-500">animaux</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-5 border border-gray-200">
          <h4 className="text-sm font-medium text-gray-500 mb-3">💳 Comparatif période précédente</h4>
          <div className="flex items-end gap-6">
            <div>
              <p className="text-lg text-gray-500 line-through">{stats.trends.previousRevenue.toFixed(2)}€</p>
              <p className="text-sm text-gray-400">{stats.trends.previousAppointments} RDV</p>
            </div>
            <span className="text-2xl">→</span>
            <div>
              <p className="text-lg font-bold text-green-600">{stats.overview.revenue.toFixed(2)}€</p>
              <p className="text-sm text-gray-500">{stats.overview.appointmentsThisPeriod} RDV</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
