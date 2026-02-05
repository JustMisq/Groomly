'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface Interaction {
  id: string
  type: string
  subject?: string
  description: string
  userId: string
  status: string
  priority: string
  requiresReply: boolean
  replied: boolean
  createdAt: string
}

export default function AdminInteractionsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [interactions, setInteractions] = useState<Interaction[]>([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [requiresReply, setRequiresReply] = useState('all')

  useEffect(() => {
    if (session && !session.user?.isAdmin) {
      router.push('/dashboard')
    } else if (session) {
      fetchInteractions()
    }
  }, [session, router, typeFilter, statusFilter, requiresReply])

  const fetchInteractions = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()

      if (typeFilter !== 'all') params.append('type', typeFilter)
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (requiresReply !== 'all') params.append('requiresReply', requiresReply)

      const res = await fetch(`/api/admin/interactions?${params}`)
      if (!res.ok) throw new Error('Erreur')

      const data = await res.json()
      setInteractions(data.interactions || [])
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Impossible de charger les interactions')
    } finally {
      setLoading(false)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'support_ticket':
        return '🎫'
      case 'feature_request':
        return '✨'
      case 'bug_report':
        return '🐛'
      case 'feedback':
        return '💡'
      case 'question':
        return '❓'
      default:
        return '📢'
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
          <h1 className="text-3xl font-bold text-gray-900">💬 Interactions Utilisateur</h1>
          <p className="text-gray-600 mt-2">Feedback, Feature Requests, Bug Reports ({interactions.length})</p>
        </div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          ← Retour
        </Link>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type
          </label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">Tous les types</option>
            <option value="support_ticket">Ticket Support</option>
            <option value="feature_request">Demande Feature</option>
            <option value="bug_report">Report Bug</option>
            <option value="feedback">Feedback</option>
            <option value="question">Question</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Statut
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">Tous</option>
            <option value="open">Ouvert</option>
            <option value="in_progress">En cours</option>
            <option value="resolved">Résolu</option>
            <option value="archived">Archivé</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Besoin Réponse
          </label>
          <select
            value={requiresReply}
            onChange={(e) => setRequiresReply(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">Tous</option>
            <option value="true">⚠️ Besoin réponse</option>
            <option value="false">✓ Répondu</option>
          </select>
        </div>
      </div>

      {/* Interactions */}
      {interactions.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <p className="text-gray-500 text-lg">Aucune interaction détectée</p>
        </div>
      ) : (
        <div className="space-y-4">
          {interactions.map((interaction) => (
            <div
              key={interaction.id}
              className={`bg-white rounded-lg border p-5 hover:border-gray-300 transition ${
                interaction.requiresReply && !interaction.replied ? 'border-red-300 bg-red-50' : 'border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getTypeIcon(interaction.type)}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900">{interaction.subject || interaction.type}</h3>
                    <p className="text-sm text-gray-600 mt-1 max-w-2xl">{interaction.description}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getPriorityColor(interaction.priority)}`}>
                    {interaction.priority}
                  </span>
                </div>
              </div>

              <div className="text-xs text-gray-500 flex gap-4">
                <span>Crée: {new Date(interaction.createdAt).toLocaleString('fr-FR')}</span>
                {interaction.requiresReply && !interaction.replied && (
                  <span className="text-red-600 font-medium">⚠️ Besoin de réponse</span>
                )}
                {interaction.replied && (
                  <span className="text-green-600 font-medium">✓ Répondu</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
