'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface PerformanceSummary {
  [key: string]: {
    average: number
    max: number
    min: number
    count: number
    endpoint?: string
  }
}

export default function AdminPerformancePage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [summary, setSummary] = useState<PerformanceSummary>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session && !session.user?.isAdmin) {
      router.push('/dashboard')
    } else if (session) {
      fetchPerformance()
    }
  }, [session, router])

  const fetchPerformance = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/performance')
      if (!res.ok) throw new Error('Erreur')

      const data = await res.json()
      setSummary(data.summary || {})
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Impossible de charger les métriques')
    } finally {
      setLoading(false)
    }
  }

  const getPerformanceStatus = (avgMs: number) => {
    if (avgMs < 100) return { icon: '🟢', label: 'Excellent', color: 'bg-green-100 text-green-800' }
    if (avgMs < 300) return { icon: '🟡', label: 'Bon', color: 'bg-yellow-100 text-yellow-800' }
    if (avgMs < 1000) return { icon: '🟠', label: 'À améliorer', color: 'bg-orange-100 text-orange-800' }
    return { icon: '🔴', label: 'Critique', color: 'bg-red-100 text-red-800' }
  }

  if (!session?.user?.isAdmin) {
    return <div className="p-8"><p className="text-gray-600">Accès refusé</p></div>
  }

  if (loading) {
    return <div className="p-8"><div className="animate-spin text-4xl">⏳</div></div>
  }

  const sortedMetrics = Object.entries(summary).sort(([, a], [, b]) => b.average - a.average)

  const avgOverall = Object.values(summary).length > 0
    ? Math.round(Object.values(summary).reduce((acc, val) => acc + val.average, 0) / Object.values(summary).length)
    : 0

  const maxMetric = Object.entries(summary).reduce((max, [, data]) => 
    data.average > max.average ? data : max, { average: 0, max: 0, min: 0, count: 0 })

  return (
    <div className="space-y-6 p-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">⚡ Performance & Métriques</h1>
          <p className="text-gray-600 mt-2">Monitoring temps de réponse et goulots d'étranglement</p>
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
          <p className="text-sm font-medium text-gray-600">Temps Moyen Global</p>
          <p className="text-4xl font-bold text-gray-900 mt-2">{avgOverall}ms</p>
          <p className="text-xs text-gray-500 mt-1">Toutes requêtes</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-sm font-medium text-gray-600">Métrique Plus Lente</p>
          <p className="text-4xl font-bold text-red-600 mt-2">{Math.round(maxMetric.average)}ms</p>
          <p className="text-xs text-gray-500 mt-1">À améliorer prioritairement</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-sm font-medium text-gray-600">Metriques Trackées</p>
          <p className="text-4xl font-bold text-gray-900 mt-2">{Object.keys(summary).length}</p>
          <p className="text-xs text-gray-500 mt-1">Endpoints monitérés</p>
        </div>
      </div>

      {/* Métriques detail */}
      {sortedMetrics.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <p className="text-gray-500 text-lg">Aucune métrique disponible</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedMetrics.map(([metric, data]) => {
            const status = getPerformanceStatus(data.average)
            
            return (
              <div key={metric} className="bg-white rounded-lg border border-gray-200 p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-2xl">{status.icon}</span>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 capitalize">{metric.replace(/_/g, ' ')}</h3>
                      {data.endpoint && <p className="text-xs text-gray-500">{data.endpoint}</p>}
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${status.color}`}>
                    {status.label}
                  </span>
                </div>

                {/* Statistiques */}
                <div className="grid grid-cols-4 gap-4 mb-3">
                  <div className="bg-gray-50 rounded p-3">
                    <p className="text-xs text-gray-500">Moyenne</p>
                    <p className="text-xl font-bold text-gray-900">{data.average}ms</p>
                  </div>
                  <div className="bg-gray-50 rounded p-3">
                    <p className="text-xs text-gray-500">Min</p>
                    <p className="text-xl font-bold text-green-600">{data.min}ms</p>
                  </div>
                  <div className="bg-gray-50 rounded p-3">
                    <p className="text-xs text-gray-500">Max</p>
                    <p className="text-xl font-bold text-red-600">{data.max}ms</p>
                  </div>
                  <div className="bg-gray-50 rounded p-3">
                    <p className="text-xs text-gray-500">Requêtes</p>
                    <p className="text-xl font-bold text-gray-900">{data.count}</p>
                  </div>
                </div>

                {/* Barre de progression pour performance */}
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      data.average < 100 ? 'bg-green-500' :
                      data.average < 300 ? 'bg-yellow-500' :
                      data.average < 1000 ? 'bg-orange-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${Math.min((data.average / 1000) * 100, 100)}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
