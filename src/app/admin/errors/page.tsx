'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface ErrorLog {
  id: string
  message: string
  severity: string
  resolved: boolean
  url?: string
  createdAt: string
  userId?: string
}

export default function AdminErrorsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [errors, setErrors] = useState<ErrorLog[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [resolved, setResolved] = useState('all')

  useEffect(() => {
    if (session && !session.user?.isAdmin) {
      router.push('/dashboard')
    } else if (session) {
      fetchErrors()
    }
  }, [session, router, filter, resolved])

  const fetchErrors = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()

      if (filter !== 'all') params.append('severity', filter)
      if (resolved !== 'all') params.append('resolved', resolved)

      const res = await fetch(`/api/admin/errors?${params}`)
      if (!res.ok) throw new Error('Erreur')

      const data = await res.json()
      setErrors(data.errors || [])
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Impossible de charger les erreurs')
    } finally {
      setLoading(false)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800'
      case 'error':
        return 'bg-orange-100 text-orange-800'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (!session?.user?.isAdmin) {
    return <div className="p-8"><p className="text-gray-600">Accès refusé</p></div>
  }

  if (loading) {
    return <div className="p-8"><div className="animate-spin text-4xl">⏳</div></div>
  }

  return (
    <div className="space-y-6 p-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">🚨 Erreurs Système</h1>
          <p className="text-gray-600 mt-2">Monitoring des erreurs en production ({errors.length})</p>
        </div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          ← Retour
        </Link>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sévérité
          </label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">Toutes les sévérités</option>
            <option value="critical">Critique</option>
            <option value="error">Erreur</option>
            <option value="warning">Avertissement</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Statut
          </label>
          <select
            value={resolved}
            onChange={(e) => setResolved(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">Tous</option>
            <option value="false">Non résolu</option>
            <option value="true">Résolu</option>
          </select>
        </div>
      </div>

      {/* Erreurs */}
      {errors.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <p className="text-gray-500 text-lg">✅ Aucune erreur détectée</p>
        </div>
      ) : (
        <div className="space-y-4">
          {errors.map((error) => (
            <div
              key={error.id}
              className="bg-white rounded-lg border border-gray-200 p-5 hover:border-gray-300 transition"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getSeverityColor(error.severity)}`}>
                    {error.severity.toUpperCase()}
                  </span>
                  <h3 className="font-semibold text-gray-900 max-w-2xl">{error.message}</h3>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${error.resolved ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {error.resolved ? '✓ Résolu' : '⏳ En attente'}
                </span>
              </div>

              <div className="text-sm text-gray-500 space-y-1">
                {error.url && <p>URL: <code className="bg-gray-100 px-2 py-1 rounded">{error.url}</code></p>}
                <p>Détecté: {new Date(error.createdAt).toLocaleString('fr-FR')}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
