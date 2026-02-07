'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
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
  status: string
  createdAt: string
  _count?: {
    users: number
    clients: number
    appointments: number
  }
}

export default function AdminSalonsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [salons, setSalons] = useState<Salon[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    if (session && !session.user?.isAdmin) {
      router.push('/dashboard')
    } else if (session) {
      fetchSalons()
    }
  }, [session, router, filter])

  const fetchSalons = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filter !== 'all') params.append('status', filter)

      const res = await fetch(`/api/admin/salons?${params}`)
      if (!res.ok) throw new Error('Erreur')

      const data = await res.json()
      setSalons(data.salons || [])
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Impossible de charger les salons')
    } finally {
      setLoading(false)
    }
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
          <h1 className="text-3xl font-bold text-gray-900">🏢 Salons de Toilettage</h1>
          <p className="text-gray-600 mt-2">Gérer tous les salons ({salons.length})</p>
        </div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          ← Retour
        </Link>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Statut
        </label>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          <option value="all">Tous les statuts</option>
          <option value="active">Actif</option>
          <option value="inactive">Inactif</option>
          <option value="suspended">Suspendu</option>
        </select>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {salons.length === 0 ? (
          <div className="p-12 text-center text-gray-600">
            Aucun salon trouvé
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Nom
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Adresse
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Téléphone
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Stats
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
                {salons.map((salon) => (
                  <tr key={salon.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      <Link
                        href={`/admin/salons/${salon.id}`}
                        className="text-primary hover:underline"
                      >
                        {salon.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {salon.address}
                      {salon.city && `, ${salon.city}`}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {salon.phone || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {salon.email || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getStatusColor(
                          salon.status
                        )}`}
                      >
                        {salon.status === 'active' && '✅ Actif'}
                        {salon.status === 'inactive' && '⚪ Inactif'}
                        {salon.status === 'suspended' && '🚫 Suspendu'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      👤 {salon._count?.users || 0} • 👥 {salon._count?.clients || 0} • 📅 {salon._count?.appointments || 0}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(salon.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 text-right text-sm">
                      <Link
                        href={`/admin/salons/${salon.id}`}
                        className="text-primary hover:underline"
                      >
                        Voir →
                      </Link>
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
