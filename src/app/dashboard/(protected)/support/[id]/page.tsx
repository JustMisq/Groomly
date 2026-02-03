'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

interface Message {
  id: string
  content: string
  isStaffReply: boolean
  isInternal: boolean
  authorName: string
  createdAt: string
  attachments: string[]
}

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
  resolvedAt: string | null
  closedAt: string | null
  user: {
    id: string
    name: string
    email: string
  }
  messages: Message[]
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

export default function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [newMessage, setNewMessage] = useState('')
  const [isInternal, setIsInternal] = useState(false)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    fetchTicket()
  }, [id])

  const fetchTicket = async () => {
    try {
      const res = await fetch(`/api/support/tickets/${id}`)
      if (res.ok) {
        const data = await res.json()
        setTicket(data.ticket)
        setIsAdmin(data.isAdmin)
      } else {
        toast.error('Ticket non trouvé')
        router.push('/dashboard/support')
      }
    } catch {
      toast.error('Erreur réseau')
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    setSending(true)
    try {
      const res = await fetch(`/api/support/tickets/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          content: newMessage,
          isInternal: isAdmin && isInternal,
        }),
      })

      if (res.ok) {
        setNewMessage('')
        setIsInternal(false)
        fetchTicket()
        toast.success('Message envoyé')
      } else {
        const data = await res.json()
        toast.error(data.message || 'Erreur')
      }
    } catch {
      toast.error('Erreur réseau')
    } finally {
      setSending(false)
    }
  }

  const handleUpdateStatus = async (newStatus: string) => {
    try {
      const res = await fetch('/api/support/tickets', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      })

      if (res.ok) {
        fetchTicket()
        toast.success('Statut mis à jour')
      } else {
        toast.error('Erreur')
      }
    } catch {
      toast.error('Erreur réseau')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
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

  if (!ticket) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <button
            onClick={() => router.push('/dashboard/support')}
            className="text-gray-500 hover:text-gray-700 mb-2 flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Retour
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{ticket.ticketNumber}</h1>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[ticket.status]}`}>
              {statusLabels[ticket.status]}
            </span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityColors[ticket.priority]}`}>
              {priorityLabels[ticket.priority]}
            </span>
          </div>
          <h2 className="text-xl text-gray-700 mt-1">{ticket.subject}</h2>
        </div>

        {/* Actions admin */}
        {isAdmin && (
          <div className="flex gap-2">
            <select
              value={ticket.status}
              onChange={(e) => handleUpdateStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm"
            >
              <option value="open">Ouvert</option>
              <option value="in_progress">En cours</option>
              <option value="waiting_customer">En attente client</option>
              <option value="resolved">Résolu</option>
              <option value="closed">Fermé</option>
            </select>
          </div>
        )}
      </div>

      {/* Infos ticket */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-wrap gap-6 text-sm">
          <div>
            <span className="text-gray-500">Catégorie:</span>
            <span className="ml-2 font-medium">{categoryLabels[ticket.category]}</span>
          </div>
          <div>
            <span className="text-gray-500">Créé le:</span>
            <span className="ml-2 font-medium">{formatDate(ticket.createdAt)}</span>
          </div>
          {isAdmin && (
            <div>
              <span className="text-gray-500">Utilisateur:</span>
              <span className="ml-2 font-medium">{ticket.user.email}</span>
            </div>
          )}
          {ticket.resolvedAt && (
            <div>
              <span className="text-gray-500">Résolu le:</span>
              <span className="ml-2 font-medium">{formatDate(ticket.resolvedAt)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="space-y-4">
        {ticket.messages.map((message) => (
          <div
            key={message.id}
            className={`rounded-xl p-4 ${
              message.isInternal
                ? 'bg-yellow-50 border-2 border-yellow-200'
                : message.isStaffReply
                ? 'bg-pink-50 border border-pink-200 ml-8'
                : 'bg-white border border-gray-200 mr-8'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                  message.isStaffReply ? 'bg-gradient-to-br from-pink-500 to-purple-500' : 'bg-gradient-to-br from-gray-400 to-gray-600'
                }`}>
                  {message.isStaffReply ? '🎫' : message.authorName[0]?.toUpperCase()}
                </div>
                <span className="font-medium text-gray-900">{message.authorName}</span>
                {message.isInternal && (
                  <span className="px-2 py-0.5 bg-yellow-200 text-yellow-800 text-xs rounded-full">
                    Note interne
                  </span>
                )}
              </div>
              <span className="text-sm text-gray-500">{formatDate(message.createdAt)}</span>
            </div>
            <div className="text-gray-700 whitespace-pre-wrap">{message.content}</div>
          </div>
        ))}
      </div>

      {/* Formulaire de réponse */}
      {ticket.status !== 'closed' && (
        <form onSubmit={handleSendMessage} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <textarea
            rows={4}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Écrivez votre message..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
          />
          <div className="flex items-center justify-between mt-3">
            <div>
              {isAdmin && (
                <label className="flex items-center gap-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={isInternal}
                    onChange={(e) => setIsInternal(e.target.checked)}
                    className="w-4 h-4 text-yellow-600 rounded focus:ring-yellow-500"
                  />
                  Note interne (invisible pour l'utilisateur)
                </label>
              )}
            </div>
            <button
              type="submit"
              disabled={sending || !newMessage.trim()}
              className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {sending ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Envoi...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Envoyer
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Message ticket fermé */}
      {ticket.status === 'closed' && (
        <div className="bg-gray-100 rounded-xl p-6 text-center">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-1">Ticket fermé</h3>
          <p className="text-gray-500">
            Ce ticket a été fermé. Si vous avez besoin d'aide supplémentaire, créez un nouveau ticket.
          </p>
        </div>
      )}
    </div>
  )
}
