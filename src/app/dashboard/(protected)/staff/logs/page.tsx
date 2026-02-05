'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface AuditLog {
  id: string
  action: string
  entityType: string
  entityId: string
  oldValue?: string
  newValue?: string
  user: {
    name: string
    email: string
  }
  createdAt: string
}

export default function LogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  useEffect(() => {
    fetchLogs()
  }, [page, filter, startDate, endDate])

  const fetchLogs = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50',
      })

      if (filter !== 'all') params.append('action', filter)
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)

      const res = await fetch(`/api/salon/logs?${params}`)
      if (!res.ok) throw new Error('Erreur lors de la récupération des logs')

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

  const getActionColor = (action: string) => {
    switch (action) {
      case 'create':
        return 'text-green-600'
      case 'update':
        return 'text-blue-600'
      case 'delete':
        return 'text-red-600'
      case 'cancel':
        return 'text-orange-600'
      case 'payment':
        return 'text-purple-600'
      default:
        return 'text-gray-600'
    }
  }

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      create: '➕ Créée',
      update: '✏️ Modifiée',
      delete: '🗑️ Supprimée',
      cancel: '❌ Annulée',
      no_show: '⛔ No-show',
      payment: '💳 Paiement',
    }
    return labels[action] || action
  }

  const getEntityTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      client: 'Client',
      animal: 'Animal',
      appointment: 'Rendez-vous',
      invoice: 'Facture',
      service: 'Service',
    }
    return labels[type] || type
  }

  const exportLogs = async () => {
    try {
      const params = new URLSearchParams({
        export: 'csv',
      })

      if (filter !== 'all') params.append('action', filter)
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)

      window.location.href = `/api/salon/logs?${params}`
      toast.success('Export en cours...')
    } catch (error) {
      toast.error('Erreur lors de l\'export')
    }
  }

  if (loading && logs.length === 0) {
    return (
      <div className="p-8">
        <div className="animate-spin text-4xl">⏳</div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-8">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📋 Logs d'Activité</h1>
          <p className="text-gray-600 mt-2">Historique de toutes les actions effectuées sur le salon</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={exportLogs}
            className="bg-gray-600 hover:bg-gray-700 text-white"
          >
            📥 Exporter CSV
          </Button>
          <Link
            href="/dashboard/staff"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-900"
          >
            ← Retour
          </Link>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
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
              <option value="create">Créations</option>
              <option value="update">Modifications</option>
              <option value="delete">Suppressions</option>
              <option value="cancel">Annulations</option>
              <option value="payment">Paiements</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date début
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value)
                setPage(1)
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date fin
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value)
                setPage(1)
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div className="flex items-end">
            <Button
              onClick={() => {
                setFilter('all')
                setStartDate('')
                setEndDate('')
                setPage(1)
              }}
              className="w-full bg-gray-500 hover:bg-gray-600 text-white"
            >
              Réinitialiser
            </Button>
          </div>
        </div>
      </div>

      {/* Tableau des logs */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {logs.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-600">Aucun log disponible</p>
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
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Détails
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="font-medium text-gray-900">{log.user.name}</div>
                      <div className="text-xs text-gray-500">{log.user.email}</div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={getActionColor(log.action)}>
                        {getActionLabel(log.action)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {getEntityTypeLabel(log.entityType)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {log.newValue && (
                        <details className="cursor-pointer">
                          <summary className="text-primary hover:underline">
                            Voir changements
                          </summary>
                          {log.oldValue && (
                            <div className="mt-2 text-xs bg-red-50 p-2 rounded border border-red-200">
                              <strong>Avant:</strong>
                              <pre className="mt-1 overflow-x-auto">
                                {JSON.stringify(JSON.parse(log.oldValue), null, 2)}
                              </pre>
                            </div>
                          )}
                          {log.newValue && (
                            <div className="mt-2 text-xs bg-green-50 p-2 rounded border border-green-200">
                              <strong>Après:</strong>
                              <pre className="mt-1 overflow-x-auto">
                                {JSON.stringify(JSON.parse(log.newValue), null, 2)}
                              </pre>
                            </div>
                          )}
                        </details>
                      )}
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
