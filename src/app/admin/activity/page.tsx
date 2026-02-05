'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface Activity {
  id: string
  action: string
  resource: string
  userId: string
  resourceId?: string
  salonId?: string
  createdAt: string
}

export default function AdminActivityPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [resource, setResource] = useState('all')

  useEffect(() => {
    if (session && !session.user?.isAdmin) {
      router.push('/dashboard')
    } else if (session) {
      fetchActivities()
    }
  }, [session, router, filter, resource])

  const fetchActivities = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()

      if (filter !== 'all') params.append('action', filter)
      if (resource !== 'all') params.append('resource', resource)

      const res = await fetch(`/api/admin/activity?${params}`)
      if (!res.ok) throw new Error('Erreur')

      const data = await res.json()
      setActivities(data.activities || [])
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Impossible de charger les activités')
    } finally {
      setLoading(false)
    }
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'create':
        return '➕'
      case 'update':
        return '✏️'
      case 'delete':
        return '🗑️'
      case 'login':
        return '🔓'
      case 'logout':
        return '🔒'
      case 'export':
        return '📤'
      case 'import':
        return '📥'
      default:
        return '📋'
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
          <h1 className="text-3xl font-bold text-gray-900">📊 Activité Utilisateur</h1>
          <p className="text-gray-600 mt-2">Journal des actions ({activities.length})</p>
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
            Action
          </label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">Toutes les actions</option>
            <option value="create">Créer</option>
            <option value="update">Modifier</option>
            <option value="delete">Supprimer</option>
            <option value="login">Connexion</option>
            <option value="logout">Déconnexion</option>
            <option value="export">Export</option>
            <option value="import">Import</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ressource
          </label>
          <select
            value={resource}
            onChange={(e) => setResource(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">Toutes les ressources</option>
            <option value="User">Utilisateur</option>
            <option value="Client">Client</option>
            <option value="Animal">Animal</option>
            <option value="Appointment">Rendez-vous</option>
            <option value="Invoice">Facture</option>
            <option value="Service">Service</option>
            <option value="Subscription">Abonnement</option>
          </select>
        </div>
      </div>

      {/* Activités */}
      {activities.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <p className="text-gray-500 text-lg">Aucune activité détectée</p>
        </div>
      ) : (
        <div className="space-y-3">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="bg-white rounded-lg border border-gray-200 p-4 hover:border-gray-300 transition flex items-center gap-4"
            >
              <span className="text-2xl">{getActionIcon(activity.action)}</span>
              <div className="flex-1">
                <p className="font-medium text-gray-900">
                  <span className="capitalize">{activity.action}</span> {' '}
                  <span className="text-gray-600">{activity.resource}</span>
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(activity.createdAt).toLocaleString('fr-FR')}
                </p>
              </div>
              {activity.resourceId && (
                <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">
                  {activity.resourceId.slice(0, 8)}
                </code>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
