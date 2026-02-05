'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface UsageSummary {
  [key: string]: {
    count: number
    totalDuration: number
    totalItems: number
  }
}

export default function AdminUsagePage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [summary, setSummary] = useState<UsageSummary>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session && !session.user?.isAdmin) {
      router.push('/dashboard')
    } else if (session) {
      fetchUsage()
    }
  }, [session, router])

  const fetchUsage = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/usage')
      if (!res.ok) throw new Error('Erreur')

      const data = await res.json()
      setSummary(data.summary || {})
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Impossible de charger les données')
    } finally {
      setLoading(false)
    }
  }

  const getFeatureIcon = (feature: string) => {
    switch (feature) {
      case 'appointments':
        return '📅'
      case 'invoicing':
        return '🧾'
      case 'staff_management':
        return '👥'
      case 'clients':
        return '👤'
      case 'animals':
        return '🐕'
      case 'services':
        return '✂️'
      case 'inventory':
        return '📦'
      case 'reports':
        return '📊'
      case 'settings':
        return '⚙️'
      default:
        return '📊'
    }
  }

  if (!session?.user?.isAdmin) {
    return <div className="p-8"><p className="text-gray-600">Accès refusé</p></div>
  }

  if (loading) {
    return <div className="p-8"><div className="animate-spin text-4xl">⏳</div></div>
  }

  const sortedFeatures = Object.entries(summary).sort(([, a], [, b]) => b.count - a.count)

  const totalUsage = Object.values(summary).reduce((acc, val) => acc + val.count, 0)
  const avgDuration = totalUsage > 0 
    ? Math.round(Object.values(summary).reduce((acc, val) => acc + val.totalDuration, 0) / totalUsage)
    : 0

  return (
    <div className="space-y-6 p-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📈 Utilisation Features</h1>
          <p className="text-gray-600 mt-2">Statistiques d'usage par fonctionnalité</p>
        </div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          ← Retour
        </Link>
      </div>

      {/* Stats globales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-sm font-medium text-gray-600">Total Utilisation</p>
          <p className="text-4xl font-bold text-gray-900 mt-2">{totalUsage}</p>
          <p className="text-xs text-gray-500 mt-1">Actions enregistrées</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-sm font-medium text-gray-600">Durée Moyenne</p>
          <p className="text-4xl font-bold text-gray-900 mt-2">{avgDuration}ms</p>
          <p className="text-xs text-gray-500 mt-1">Temps moyen par action</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-sm font-medium text-gray-600">Features Actives</p>
          <p className="text-4xl font-bold text-gray-900 mt-2">{Object.keys(summary).length}</p>
          <p className="text-xs text-gray-500 mt-1">Fonctionnalités utilisées</p>
        </div>
      </div>

      {/* Features ranking */}
      {sortedFeatures.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <p className="text-gray-500 text-lg">Aucune donnée d'usage disponible</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedFeatures.map(([feature, data]) => {
            const percentage = (data.count / totalUsage) * 100
            const avgItemsPerUse = data.totalItems > 0 ? Math.round(data.totalItems / data.count) : 0
            
            return (
              <div key={feature} className="bg-white rounded-lg border border-gray-200 p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{getFeatureIcon(feature)}</span>
                    <div>
                      <h3 className="font-semibold text-gray-900 capitalize">{feature.replace(/_/g, ' ')}</h3>
                      <p className="text-sm text-gray-600">{data.count} utilisations</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">{percentage.toFixed(1)}%</p>
                    <p className="text-xs text-gray-500">de l'usage total</p>
                  </div>
                </div>

                {/* Barre de progression */}
                <div className="w-full bg-gray-200 rounded-full h-2 mb-3 overflow-hidden">
                  <div
                    className="bg-primary h-full transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                {/* Détails */}
                <div className="text-xs text-gray-500 flex gap-4">
                  <span>⏱️ {Math.round(data.totalDuration / data.count)}ms / action</span>
                  {avgItemsPerUse > 0 && <span>📦 {avgItemsPerUse} items / action</span>}
                  <span>📊 Total: {(data.totalDuration / 1000).toFixed(1)}s</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
