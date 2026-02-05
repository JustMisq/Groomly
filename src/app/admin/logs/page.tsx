'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface GlobalLog {
  id: string
  action: string
  entityType: string
  entityId: string
  description: string
  createdAt: string
  user: {
    name: string
    email: string
  }
  salon?: {
    id: string
    name: string
  }
  severity: 'info' | 'warning' | 'error'
}

export default function AdminLogsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [logs, setLogs] = useState<GlobalLog[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [severity, setSeverity] = useState('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    if (session && !session.user?.isAdmin) {
      router.push('/dashboard')
    } else if (session) {
      fetchLogs()
    }
  }, [session, router, page, filter, severity])

  const fetchLogs = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '100',
      })

      if (filter !== 'all') params.append('action', filter)
      if (severity !== 'all') params.append('severity', severity)

      const res = await fetch(`/api/admin/logs?${params}`)
      if (!res.ok) throw new Error('Erreur')

      const data = await res.json()
      setLogs(data.logs || [])
      setTotalPages(data.totalPages || 1)
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Impossible de charger les logs')
    } finally {
      setLoading(false)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error':
        return 'bg-red-100 text-red-800'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800'
      case 'info':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error':
        return '🔴'
      case 'warning':
        return '🟡'
      case 'info':
        return '🔵'
      default:
        return '⚪'
    }
  }

  if (!session?.user?.isAdmin) {
    return <div className="p-8"><p className="text-gray-600">Accès refusé</p></div>
  }

  if (loading && logs.length === 0) {
    return <div className="p-8"><div className="animate-spin text-4xl">⏳</div></div>
  }

  return (
    <div className="space-y-6 p-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📋 Logs Globaux</h1>
          <p className="text-gray-600 mt-2">Audit trail complet du SaaS</p>
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
            Type d'action
          </label>
          <select
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value)
              setPage(1)
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">Toutes les actions</option>
            <option value="user_created">Utilisateur créé</option>
            <option value="subscription_created">Souscription créée</option>
            <option value="payment_received">Paiement reçu</option>
            <option value="subscription_cancelled">Souscription annulée</option>
            <option value="user_deleted">Utilisateur supprimé</option>
            <option value="admin_action">Action admin</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Niveau
          </label>
          <select
            value={severity}
            onChange={(e) => {
              setSeverity(e.target.value)
              setPage(1)
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">Tous les niveaux</option>
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
          </select>
        </div>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {logs.length === 0 ? (
          <div className="p-12 text-center text-gray-600">
            Aucun log trouvé
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Date/Heure
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Utilisateur
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Détails
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Niveau
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="font-medium text-gray-900">{log.user.name}</div>
                      <div className="text-xs text-gray-500">{log.user.email}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                      {log.action}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {log.description}
                      {log.salon && (
                        <div className="text-xs text-gray-500 mt-1">
                          Salon: {log.salon.name}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getSeverityColor(
                          log.severity
                        )}`}
                      >
                        {getSeverityIcon(log.severity)} {log.severity}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            ← Précédent
          </button>
          <span className="text-sm text-gray-600">
            Page {page} sur {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Suivant →
          </button>
        </div>
      )}
    </div>
  )
}
