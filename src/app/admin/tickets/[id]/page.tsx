'use client'

import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface TicketMessage {
  id: string
  content: string
  createdAt: string
  user: {
    name: string
    email: string
  }
}

interface Ticket {
  id: string
  ticketNumber: string
  subject: string
  category: string
  priority: string
  status: string
  description: string
  createdAt: string
  updatedAt: string
  user: {
    id: string
    name: string
    email: string
  }
  salon?: {
    id: string
    name: string
  }
  messages: TicketMessage[]
}

export default function TicketDetailPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const params = useParams()
  const ticketId = params.id as string

  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [loading, setLoading] = useState(true)
  const [messageContent, setMessageContent] = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)

  useEffect(() => {
    if (session && !session.user?.isAdmin) {
      router.push('/dashboard')
    } else if (session) {
      fetchTicket()
    }
  }, [session, router, ticketId])

  const fetchTicket = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/admin/tickets/${ticketId}`)
      if (!res.ok) throw new Error('Ticket non trouvé')

      const data = await res.json()
      setTicket(data.ticket)
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Impossible de charger le ticket')
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!messageContent.trim()) return

    try {
      setSendingMessage(true)
      const res = await fetch(`/api/admin/tickets/${ticketId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: messageContent }),
      })

      if (!res.ok) throw new Error('Erreur')

      toast.success('Message envoyé')
      setMessageContent('')
      fetchTicket()
    } catch (error) {
      toast.error('Erreur lors de l\'envoi du message')
    } finally {
      setSendingMessage(false)
    }
  }

  const updateStatus = async (newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/tickets/${ticketId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!res.ok) throw new Error('Erreur')

      toast.success('Ticket mis à jour')
      fetchTicket()
    } catch (error) {
      toast.error('Erreur lors de la mise à jour')
    }
  }

  if (!session?.user?.isAdmin) {
    return <div className="p-8"><p className="text-gray-600">Accès refusé</p></div>
  }

  if (loading) {
    return <div className="p-8"><div className="animate-spin text-4xl">⏳</div></div>
  }

  if (!ticket) {
    return (
      <div className="p-8">
        <p className="text-gray-600">Ticket non trouvé</p>
        <Link href="/admin/tickets" className="text-primary hover:underline mt-4 inline-block">
          ← Retour aux tickets
        </Link>
      </div>
    )
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
        return '🔴 Ouvert'
      case 'in_progress':
        return '🟡 En cours'
      case 'resolved':
        return '✅ Résolu'
      case 'closed':
        return '⚫ Fermé'
      default:
        return status
    }
  }

  return (
    <div className="space-y-6 p-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">🎫 {ticket.ticketNumber}</h1>
          <p className="text-gray-600 mt-2">{ticket.subject}</p>
        </div>
        <Link
          href="/admin/tickets"
          className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          ← Retour
        </Link>
      </div>

      {/* Info Card */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <p className="text-sm text-gray-600">Priorité</p>
          <span className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-semibold ${getPriorityColor(ticket.priority)}`}>
            {ticket.priority}
          </span>
        </div>
        <div>
          <p className="text-sm text-gray-600">Statut</p>
          <p className="text-lg font-semibold mt-1">{getStatusColor(ticket.status)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Catégorie</p>
          <p className="text-lg font-semibold mt-1">{ticket.category}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Messages</p>
          <p className="text-lg font-semibold mt-1">💬 {ticket.messages.length}</p>
        </div>
      </div>

      {/* Client Info */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">👤 Informations Client</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Nom</p>
            <p className="text-lg font-semibold text-gray-900">{ticket.user.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Email</p>
            <p className="text-lg font-semibold text-gray-900">{ticket.user.email}</p>
          </div>
          {ticket.salon && (
            <div>
              <p className="text-sm text-gray-600">Salon</p>
              <p className="text-lg font-semibold text-gray-900">{ticket.salon.name}</p>
            </div>
          )}
          <div>
            <p className="text-sm text-gray-600">Créé le</p>
            <p className="text-lg font-semibold text-gray-900">
              {new Date(ticket.createdAt).toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">📝 Description</h2>
        <div className="prose prose-sm prose-blue max-w-none">
          <p className="text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">💬 Messages ({ticket.messages.length})</h2>
        
        <div className="space-y-4 mb-6">
          {ticket.messages.length === 0 ? (
            <p className="text-gray-600 text-center py-8">Aucun message pour le moment</p>
          ) : (
            ticket.messages.map((message) => (
              <div key={message.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold text-gray-900">{message.user.name}</p>
                    <p className="text-xs text-gray-500">{message.user.email}</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    {new Date(message.createdAt).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap">{message.content}</p>
              </div>
            ))
          )}
        </div>

        {/* Send Message Form */}
        {ticket.status !== 'closed' && (
          <div className="border-t border-gray-200 pt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ajouter un message
            </label>
            <textarea
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              placeholder="Écrivez votre message ici..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              rows={4}
            />
            <button
              onClick={sendMessage}
              disabled={sendingMessage || !messageContent.trim()}
              className="mt-3 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sendingMessage ? '📤 Envoi...' : '📤 Envoyer'}
            </button>
          </div>
        )}
      </div>

      {/* Status Update */}
      {ticket.status !== 'closed' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">⚙️ Changer le statut</h2>
          <div className="flex gap-2">
            {['open', 'in_progress', 'resolved', 'closed'].map((status) => (
              <button
                key={status}
                onClick={() => updateStatus(status)}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  ticket.status === status
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}
              >
                {status === 'open' && '🔴 Ouvert'}
                {status === 'in_progress' && '🟡 En cours'}
                {status === 'resolved' && '✅ Résolu'}
                {status === 'closed' && '⚫ Fermé'}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
