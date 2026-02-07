'use client'

import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface Salon {
  id: string
  name: string
  address: string
  city: string
  phone: string
  email: string
  description?: string
  logo?: string
  status: string
  createdAt: string
  updatedAt: string
  user?: User
  members: SalonMember[]
  clients: Client[]
  _count?: {
    appointments: number
    services: number
  }
}

interface User {
  id: string
  name: string
  email: string
  role: string
}

interface SalonMember {
  id: string
  firstName: string
  lastName: string
  role: string
  status: string
}

interface Client {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
}

export default function AdminSalonDetailPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const params = useParams()
  const salonId = params.id as string

  const [salon, setSalon] = useState<Salon | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [newStatus, setNewStatus] = useState<string>('')
  const [showEditModal, setShowEditModal] = useState(false)
  const [editData, setEditData] = useState({
    name: '',
    address: '',
    city: '',
    phone: '',
    email: '',
    description: ''
  })

  useEffect(() => {
    if (session && !session.user?.isAdmin) {
      router.push('/dashboard')
    } else if (session) {
      fetchSalon()
    }
  }, [session, router])

  const fetchSalon = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/admin/salons/${salonId}`)
      if (!res.ok) throw new Error('Erreur')

      const data = await res.json()
      setSalon(data.salon)
      setNewStatus(data.salon.status)
      setEditData({
        name: data.salon.name,
        address: data.salon.address,
        city: data.salon.city,
        phone: data.salon.phone,
        email: data.salon.email,
        description: data.salon.description || ''
      })
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Impossible de charger le salon')
      router.push('/admin/salons')
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (status: string) => {
    try {
      setUpdating(true)
      const res = await fetch(`/api/admin/salons/${salonId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })

      if (!res.ok) throw new Error('Erreur')
      toast.success('Statut mis à jour')
      setNewStatus(status)
      fetchSalon()
    } catch (error) {
      toast.error('Impossible de mettre à jour')
    } finally {
      setUpdating(false)
    }
  }

  const updateSalon = async () => {
    try {
      setUpdating(true)
      const res = await fetch(`/api/admin/salons/${salonId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData)
      })

      if (!res.ok) throw new Error('Erreur')
      toast.success('Salon mis à jour')
      setShowEditModal(false)
      fetchSalon()
    } catch (error) {
      toast.error('Impossible de mettre à jour')
    } finally {
      setUpdating(false)
    }
  }

  if (!session?.user?.isAdmin) {
    return <div className="p-8"><p className="text-gray-600">Accès refusé</p></div>
  }

  if (loading) {
    return <div className="p-8"><div className="animate-spin text-4xl">⏳</div></div>
  }

  if (!salon) {
    return (
      <div className="p-8">
        <div className="text-center space-y-4">
          <p className="text-gray-600">Salon non trouvé</p>
          <Link
            href="/admin/salons"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            ← Retour
          </Link>
        </div>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'inactive':
        return 'bg-gray-100 text-gray-800'
      case 'suspended':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6 p-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">🏢 {salon.name}</h1>
          <p className="text-gray-600 mt-2">Détails du salon de toilettage</p>
        </div>
        <Link
          href="/admin/salons"
          className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          ← Retour
        </Link>
      </div>

      {/* Informations Principales */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-900">Nom</label>
            <p className="text-gray-600">{salon.name}</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900">Statut</label>
            <span
              className={`inline-block px-3 py-1 rounded text-xs font-semibold mt-1 ${getStatusColor(
                salon.status
              )}`}
            >
              {salon.status === 'active' && '✅ Actif'}
              {salon.status === 'inactive' && '⚪ Inactif'}
              {salon.status === 'suspended' && '🚫 Suspendu'}
            </span>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900">Adresse</label>
            <p className="text-gray-600">
              {salon.address}
              {salon.city && `, ${salon.city}`}
            </p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900">Téléphone</label>
            <p className="text-gray-600">{salon.phone || '-'}</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900">Email</label>
            <p className="text-gray-600">{salon.email || '-'}</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900">Description</label>
            <p className="text-gray-600">{salon.description || '-'}</p>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            📅 Créé le {new Date(salon.createdAt).toLocaleDateString('fr-FR')}
          </label>
          <label className="block text-sm font-semibold text-gray-900">
            🔄 Modifié le {new Date(salon.updatedAt).toLocaleDateString('fr-FR')}
          </label>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-3">
        <h3 className="text-lg font-semibold text-gray-900">Gestion</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowEditModal(true)}
            className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 font-medium"
          >
            ✏️ Modifier
          </button>
          {newStatus !== 'active' && (
            <button
              onClick={() => updateStatus('active')}
              disabled={updating}
              className="px-4 py-2 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 font-medium disabled:opacity-50"
            >
              ✅ Activer
            </button>
          )}
          {newStatus !== 'inactive' && (
            <button
              onClick={() => updateStatus('inactive')}
              disabled={updating}
              className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 font-medium disabled:opacity-50"
            >
              ⚪ Désactiver
            </button>
          )}
          {newStatus !== 'suspended' && (
            <button
              onClick={() => updateStatus('suspended')}
              disabled={updating}
              className="px-4 py-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 font-medium disabled:opacity-50"
            >
              🚫 Suspendre
            </button>
          )}
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
          <p className="text-4xl font-bold text-primary">{salon._count?.appointments || 0}</p>
          <p className="text-gray-600 mt-2">Rendez-vous</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
          <p className="text-4xl font-bold text-primary">{salon._count?.services || 0}</p>
          <p className="text-gray-600 mt-2">Services</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
          <p className="text-4xl font-bold text-primary">{salon._count?.appointments || 0}</p>
          <p className="text-gray-600 mt-2">Clients</p>
        </div>
      </div>

      {/* Gérants du Salon */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">👥 Équipe ({( salon.user ? 1 : 0) + salon.members.length})</h3>
        <div className="space-y-2">
          {salon.user && (
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
              <div>
                <p className="font-medium text-gray-900">{salon.user.name} (Propriétaire)</p>
                <p className="text-sm text-gray-600">{salon.user.email}</p>
              </div>
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                Owner
              </span>
            </div>
          )}
          {salon.members.length === 0 && !salon.user && (
            <p className="text-gray-600">Aucun membre</p>
          )}
          {salon.members.map((member) => (
            <div
              key={member.id}
              className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
            >
              <div>
                <p className="font-medium text-gray-900">{member.firstName} {member.lastName}</p>
                <p className="text-sm text-gray-600">
                  {member.status === 'active' && '✅ Actif'}
                  {member.status === 'pending' && '⏳ En attente'}
                  {member.status === 'revoked' && '🚫 Révoqué'}
                </p>
              </div>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                {member.role}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Clients */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">👤 Clients ({salon.clients.length})</h3>
        {salon.clients.length === 0 ? (
          <p className="text-gray-600">Aucun client</p>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {salon.clients.map((client) => (
              <div key={client.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{client.firstName} {client.lastName}</p>
                  <p className="text-sm text-gray-600">{client.email}</p>
                </div>
                <p className="text-sm text-gray-600">{client.phone}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal d'édition */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">Modifier le salon</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
              <input
                type="text"
                value={editData.name}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
              <input
                type="text"
                value={editData.address}
                onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
              <input
                type="text"
                value={editData.city}
                onChange={(e) => setEditData({ ...editData, city: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
              <input
                type="tel"
                value={editData.phone}
                onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={editData.email}
                onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={editData.description}
                onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                rows={3}
              />
            </div>

            <div className="flex gap-2 pt-4 border-t border-gray-200">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={updateSalon}
                disabled={updating}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
              >
                {updating ? 'Sauvegarde...' : 'Sauvegarder'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
