'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

interface Ticket {
  id: string
  ticketNumber: string
  subject: string
  description: string
  category: string
  priority: string
  status: string
  createdAt: string
  updatedAt: string
  user: {
    id: string
    name: string
    email: string
  }
  messages: {
    id: string
    content: string
    createdAt: string
  }[]
  _count: {
    messages: number
  }
}

const categoryLabels: Record<string, string> = {
  general: 'Général',
  billing: 'Facturation',
  technical: 'Technique',
  feature_request: 'Suggestion',
  bug: 'Bug',
}

const priorityLabels: Record<string, string> = {
  low: 'Basse',
  normal: 'Normale',
  high: 'Haute',
  urgent: 'Urgente',
}

const priorityColors: Record<string, string> = {
  low: 'bg-gray-100 text-gray-800',
  normal: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800',
}

const statusLabels: Record<string, string> = {
  open: 'Ouvert',
  in_progress: 'En cours',
  waiting_customer: 'En attente de réponse',
  resolved: 'Résolu',
  closed: 'Fermé',
}

const statusColors: Record<string, string> = {
  open: 'bg-green-100 text-green-800',
  in_progress: 'bg-blue-100 text-blue-800',
  waiting_customer: 'bg-yellow-100 text-yellow-800',
  resolved: 'bg-purple-100 text-purple-800',
  closed: 'bg-gray-100 text-gray-800',
}

export default function SupportPage() {
  const router = useRouter()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showNewModal, setShowNewModal] = useState(false)
  const [filter, setFilter] = useState('all')

  const [newTicket, setNewTicket] = useState({
    subject: '',
    description: '',
    category: 'general',
    priority: 'normal',
  })

  useEffect(() => {
    fetchTickets()
  }, [filter])

  const fetchTickets = async () => {
    try {
      const res = await fetch(`/api/support/tickets?status=${filter}&admin=true`)
      if (res.ok) {
        const data = await res.json()
        setTickets(data.tickets)
        setIsAdmin(data.isAdmin)
      } else {
        toast.error('Erreur lors du chargement')
      }
    } catch {
      toast.error('Erreur réseau')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/support/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTicket),
      })

      if (res.ok) {
        const ticket = await res.json()
        toast.success('Ticket créé !')
        setShowNewModal(false)
        setNewTicket({ subject: '', description: '', category: 'general', priority: 'normal' })
        router.push(`/dashboard/support/${ticket.id}`)
      } else {
        const data = await res.json()
        toast.error(data.message || 'Erreur')
      }
    } catch {
      toast.error('Erreur réseau')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isAdmin ? '🎫 Gestion des tickets' : '💬 Support'}
          </h1>
          <p className="mt-1 text-gray-600">
            {isAdmin
              ? 'Gérez les demandes de support des utilisateurs'
              : 'Besoin d\'aide ? Créez un ticket et notre équipe vous répondra.'}
          </p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Nouveau ticket
        </button>
      </div>

      {/* Filtres */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {['all', 'open', 'in_progress', 'waiting_customer', 'resolved', 'closed'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              filter === status
                ? 'bg-pink-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {status === 'all' ? 'Tous' : statusLabels[status]}
          </button>
        ))}
      </div>

      {/* Liste des tickets */}
      {tickets.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-1">Aucun ticket</h3>
          <p className="text-gray-500">
            {filter === 'all' 
              ? 'Vous n\'avez pas encore créé de ticket de support.'
              : 'Aucun ticket avec ce statut.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              onClick={() => router.push(`/dashboard/support/${ticket.id}`)}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm font-mono text-gray-500">{ticket.ticketNumber}</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityColors[ticket.priority]}`}>
                      {priorityLabels[ticket.priority]}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[ticket.status]}`}>
                      {statusLabels[ticket.status]}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{ticket.subject}</h3>
                  <p className="text-gray-600 text-sm line-clamp-2">{ticket.description}</p>
                  <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                    <span>{categoryLabels[ticket.category]}</span>
                    <span>•</span>
                    <span>{formatDate(ticket.createdAt)}</span>
                    <span>•</span>
                    <span>{ticket._count.messages} message{ticket._count.messages > 1 ? 's' : ''}</span>
                    {isAdmin && (
                      <>
                        <span>•</span>
                        <span className="text-pink-600">{ticket.user.email}</span>
                      </>
                    )}
                  </div>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Nouveau ticket */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Nouveau ticket de support</h2>
            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sujet *
                </label>
                <input
                  type="text"
                  required
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="Résumez votre problème en quelques mots"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Catégorie
                  </label>
                  <select
                    value={newTicket.category}
                    onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  >
                    <option value="general">Général</option>
                    <option value="billing">Facturation</option>
                    <option value="technical">Technique</option>
                    <option value="feature_request">Suggestion</option>
                    <option value="bug">Bug</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priorité
                  </label>
                  <select
                    value={newTicket.priority}
                    onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  >
                    <option value="low">Basse</option>
                    <option value="normal">Normale</option>
                    <option value="high">Haute</option>
                    <option value="urgent">Urgente</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  required
                  rows={5}
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="Décrivez votre problème en détail. Plus vous donnez d'informations, plus nous pourrons vous aider rapidement."
                />
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                >
                  Créer le ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
