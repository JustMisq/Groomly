'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'

interface SalonMember {
  id: string
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  role: string
  status: string
  invitedAt: string
  acceptedAt?: string
  user?: {
    email: string
    name: string
  }
  inviteEmail?: string
}

export default function StaffPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [members, setMembers] = useState<SalonMember[]>([])
  const [loading, setLoading] = useState(true)
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('staff')
  const [inviting, setInviting] = useState(false)

  useEffect(() => {
    fetchMembers()
  }, [])

  const fetchMembers = async () => {
    try {
      const res = await fetch('/api/salon/members')
      if (!res.ok) throw new Error('Erreur lors de la récupération des membres')
      const data = await res.json()
      setMembers(data.members || [])
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Impossible de charger les membres')
    } finally {
      setLoading(false)
    }
  }

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail) {
      toast.error('Email requis')
      return
    }

    setInviting(true)
    try {
      const res = await fetch('/api/salon/members/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: inviteEmail,
          role: inviteRole,
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || 'Erreur lors de l\'invitation')
      }

      toast.success('Invitation envoyée avec succès!')
      setInviteEmail('')
      setShowInviteForm(false)
      fetchMembers()
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de l\'invitation')
    } finally {
      setInviting(false)
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce membre?')) return

    try {
      const res = await fetch(`/api/salon/members/${memberId}`, {
        method: 'DELETE',
      })

      if (!res.ok) throw new Error('Erreur lors de la suppression')

      toast.success('Membre supprimé')
      fetchMembers()
    } catch (error) {
      toast.error('Erreur lors de la suppression')
    }
  }

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      owner: '👑 Propriétaire',
      admin: '⚙️ Admin',
      staff: '👤 Staff',
      readonly: '👁️ Lecture seule',
    }
    return labels[role] || role
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'revoked':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
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
          <h1 className="text-3xl font-bold text-gray-900">👥 Gestion du Staff</h1>
          <p className="text-gray-600 mt-2">Gérez les membres de votre équipe et leurs permissions</p>
        </div>
        <Button
          onClick={() => setShowInviteForm(!showInviteForm)}
          className="bg-primary hover:bg-primary/90 text-white"
        >
          {showInviteForm ? '✕ Annuler' : '+ Inviter un membre'}
        </Button>
      </div>

      {/* Formulaire d'invitation */}
      {showInviteForm && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Inviter un nouveau membre</h3>
          <form onSubmit={handleInviteMember} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="membre@example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rôle
              </label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="staff">👤 Staff</option>
                <option value="admin">⚙️ Admin</option>
                <option value="readonly">👁️ Lecture seule</option>
              </select>
            </div>

            <div className="bg-white p-4 rounded border border-gray-200 text-sm text-gray-700">
              <p className="font-semibold mb-2">Permissions par rôle</p>
              <ul className="space-y-1">
                <li>👤 <strong>Staff</strong> : Clients, Animaux, RDV, Services, Stocks</li>
                <li>⚙️ <strong>Admin</strong> : Staff + Factures, Rapports, Paramètres</li>
                <li>👁️ <strong>Lecture seule</strong> : Lecture uniquement, pas de modification</li>
              </ul>
            </div>

            <Button
              type="submit"
              disabled={inviting}
              className="w-full bg-primary hover:bg-primary/90 text-white"
            >
              {inviting ? 'Envoi en cours...' : 'Envoyer l\'invitation'}
            </Button>
          </form>
        </div>
      )}

      {/* Liste des membres */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Membres ({members.length})
          </h2>
        </div>

        {members.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-600">Aucun membre pour le moment</p>
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
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Rôle
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Invité le
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {members.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {member.user ? (
                        member.user.name
                      ) : (
                        <span className="text-gray-500 italic">
                          {member.firstName && member.lastName
                            ? `${member.firstName} ${member.lastName}`
                            : 'En attente...'}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {member.user?.email || member.inviteEmail}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {getRoleLabel(member.role)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(member.status)}`}>
                        {member.status === 'pending' && '⏳ En attente'}
                        {member.status === 'active' && '✅ Actif'}
                        {member.status === 'revoked' && '🚫 Révoqué'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(member.invitedAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 text-right text-sm space-x-2">
                      {member.role !== 'owner' && (
                        <>
                          <Link
                            href={`/dashboard/staff/${member.id}`}
                            className="text-primary hover:underline"
                          >
                            Permissions
                          </Link>
                          <button
                            onClick={() => handleRemoveMember(member.id)}
                            className="text-red-600 hover:underline ml-2"
                          >
                            Supprimer
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Lien vers les logs */}
      <div className="flex gap-4">
        <Link
          href="/dashboard/staff/logs"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition"
        >
          📋 Voir les logs d'activité
        </Link>
      </div>
    </div>
  )
}
