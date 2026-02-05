'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface User {
  id: string
  email: string
  name: string
  createdAt: string
  isAdmin: boolean
  salon?: {
    id: string
    name: string
  }
  _count?: {
    auditLogs: number
  }
  subscription?: {
    status: string
    plan: string
  }
}

export default function AdminUsersPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchEmail, setSearchEmail] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    if (session && !session.user?.isAdmin) {
      router.push('/dashboard')
    } else if (session) {
      fetchUsers()
    }
  }, [session, router, page, searchEmail])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50',
      })

      if (searchEmail) {
        params.append('search', searchEmail)
      }

      const res = await fetch(`/api/admin/users?${params}`)
      if (!res.ok) throw new Error('Erreur')

      const data = await res.json()
      setUsers(data.users || [])
      setTotalPages(data.totalPages || 1)
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Impossible de charger les utilisateurs')
    } finally {
      setLoading(false)
    }
  }

  const toggleAdmin = async (userId: string, isAdmin: boolean) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAdmin: !isAdmin }),
      })

      if (!res.ok) throw new Error('Erreur')

      toast.success(isAdmin ? 'Admin retiré' : 'Admin accordé')
      fetchUsers()
    } catch (error) {
      toast.error('Erreur lors de la mise à jour')
    }
  }

  const suspendUser = async (userId: string) => {
    if (!confirm('Êtes-vous sûr?')) return

    try {
      const res = await fetch(`/api/admin/users/${userId}/suspend`, {
        method: 'POST',
      })

      if (!res.ok) throw new Error('Erreur')

      toast.success('Utilisateur suspendu')
      fetchUsers()
    } catch (error) {
      toast.error('Erreur lors de la suspension')
    }
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'expired':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  if (!session?.user?.isAdmin) {
    return <div className="p-8"><p className="text-gray-600">Accès refusé</p></div>
  }

  if (loading && users.length === 0) {
    return <div className="p-8"><div className="animate-spin text-4xl">⏳</div></div>
  }

  return (
    <div className="space-y-6 p-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">👥 Utilisateurs</h1>
          <p className="text-gray-600 mt-2">Tous les comptes Groomly ({users.length})</p>
        </div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          ← Retour
        </Link>
      </div>

      {/* Recherche */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <input
          type="email"
          placeholder="Rechercher par email..."
          value={searchEmail}
          onChange={(e) => {
            setSearchEmail(e.target.value)
            setPage(1)
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {users.length === 0 ? (
          <div className="p-12 text-center text-gray-600">
            Aucun utilisateur trouvé
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Nom
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Salon
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Souscription
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {user.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {user.salon ? (
                        <Link
                          href={`/admin/users/${user.id}`}
                          className="text-primary hover:underline"
                        >
                          {user.salon.name}
                        </Link>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {user.subscription ? (
                        <span
                          className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getStatusColor(
                            user.subscription.status
                          )}`}
                        >
                          {user.subscription.plan}
                        </span>
                      ) : (
                        <span className="text-gray-400">Aucune</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {user.isAdmin ? (
                        <span className="inline-block bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-semibold">
                          👑 Admin
                        </span>
                      ) : (
                        <span className="text-gray-500 text-xs">Utilisateur</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right text-sm space-x-2">
                      <button
                        onClick={() => toggleAdmin(user.id, user.isAdmin)}
                        className="text-primary hover:underline"
                      >
                        {user.isAdmin ? 'Retirer admin' : 'Faire admin'}
                      </button>
                      <button
                        onClick={() => suspendUser(user.id)}
                        className="text-red-600 hover:underline ml-2"
                      >
                        Suspendre
                      </button>
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
