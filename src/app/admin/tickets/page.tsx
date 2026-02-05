'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface Ticket {
  id: string
  ticketNumber: string
  subject: string
  category: string
  priority: string
  status: string
  createdAt: string
  user: {
    name: string
    email: string
  }
  salon?: {
    name: string
  }
  _count?: {
    messages: number
  }
}

export default function AdminTicketsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [priority, setPriority] = useState('all')

  useEffect(() => {
    if (session && !session.user?.isAdmin) {
      router.push('/dashboard')
    } else if (session) {
      fetchTickets()
    }
  }, [session, router, filter, priority])

  const fetchTickets = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()

      if (filter !== 'all') params.append('status', filter)
      if (priority !== 'all') params.append('priority', priority)

      const res = await fetch(`/api/admin/tickets?${params}`)
      if (!res.ok) throw new Error('Erreur')

      const data = await res.json()
      setTickets(data.tickets || [])
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Impossible de charger les tickets')
    } finally {
      setLoading(false)
    }
  }

  const updateTicketStatus = async (ticketId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/tickets/${ticketId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!res.ok) throw new Error('Erreur')

      toast.success('Ticket mis à jour')
      fetchTickets()
    } catch (error) {
      toast.error('Erreur lors de la mise à jour')
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800'
      case 'high':
        return 'bg-orange-100 text-orange-800'
      case 'normal':
        return 'bg-blue-100 text-blue-800'
      case 'low':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'text-red-600'
      case 'in_progress':
        return 'text-blue-600'
      case 'resolved':
        return 'text-green-600'
      case 'closed':
        return 'text-gray-600'
      default:
        return 'text-gray-600'
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
          <h1 className="text-3xl font-bold text-gray-900">🎫 Support Tickets</h1>
          <p className="text-gray-600 mt-2">Gérer les demandes des clients ({tickets.length})</p>
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
            Statut
          </label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">Tous les statuts</option>
            <option value="open">Ouvert</option>
            <option value="in_progress">En cours</option>
            <option value="resolved">Résolu</option>
            <option value="closed">Fermé</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Priorité
          </label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">Toutes les priorités</option>
            <option value="urgent">Urgent</option>
            <option value="high">Haute</option>
            <option value="normal">Normale</option>
            <option value="low">Basse</option>
          </select>
        </div>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {tickets.length === 0 ? (
          <div className="p-12 text-center text-gray-600">
            Aucun ticket trouvé
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    #
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Sujet
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Priorité
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Messages
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {tickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-mono text-gray-600">
                      {ticket.ticketNumber}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <Link
                        href={`/admin/tickets/${ticket.id}`}
                        className="text-primary hover:underline"
                      >
                        {ticket.subject}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="font-medium">{ticket.user.name}</div>
                      <div className="text-xs text-gray-400">{ticket.user.email}</div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getPriorityColor(
                          ticket.priority
                        )}`}
                      >
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={getStatusColor(ticket.status)}>
                        {ticket.status === 'open' && '🔴 Ouvert'}
                        {ticket.status === 'in_progress' && '🟡 En cours'}
                        {ticket.status === 'resolved' && '✅ Résolu'}
                        {ticket.status === 'closed' && '⚫ Fermé'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      💬 {ticket._count?.messages || 0}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(ticket.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 text-right text-sm">
                      {ticket.status !== 'closed' && (
                        <select
                          value={ticket.status}
                          onChange={(e) =>
                            updateTicketStatus(ticket.id, e.target.value)
                          }
                          className="px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                          <option value="open">Ouvert</option>
                          <option value="in_progress">En cours</option>
                          <option value="resolved">Résolu</option>
                          <option value="closed">Fermé</option>
                        </select>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
