'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

interface Member {
  id: string
  role: string
  firstName: string | null
  lastName: string | null
  phone: string | null
  status: string
  inviteEmail: string | null
  createdAt: string
  isOwner: boolean
  user: {
    id: string
    name: string
    email: string
  } | null
  canManageClients: boolean
  canManageAnimals: boolean
  canManageAppointments: boolean
  canManageServices: boolean
  canManageInventory: boolean
  canViewReports: boolean
  canManageBilling: boolean
  canManageSettings: boolean
  canManageMembers: boolean
}

const roleLabels: Record<string, string> = {
  owner: 'Propriétaire',
  admin: 'Administrateur',
  staff: 'Employé',
  readonly: 'Lecture seule',
}

const roleColors: Record<string, string> = {
  owner: 'bg-purple-100 text-purple-800',
  admin: 'bg-blue-100 text-blue-800',
  staff: 'bg-green-100 text-green-800',
  readonly: 'bg-gray-100 text-gray-800',
}

const statusLabels: Record<string, string> = {
  pending: 'En attente',
  active: 'Actif',
  revoked: 'Révoqué',
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  active: 'bg-green-100 text-green-800',
  revoked: 'bg-red-100 text-red-800',
}

export default function MembersPage() {
  const router = useRouter()
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)

  // Formulaire d'invitation
  const [inviteForm, setInviteForm] = useState({
    email: '',
    role: 'staff',
    firstName: '',
    lastName: '',
    phone: '',
  })

  useEffect(() => {
    fetchMembers()
  }, [])

  const fetchMembers = async () => {
    try {
      const res = await fetch('/api/salon/members')
      if (res.ok) {
        const data = await res.json()
        setMembers(data)
      } else {
        toast.error('Erreur lors du chargement')
      }
    } catch {
      toast.error('Erreur réseau')
    } finally {
      setLoading(false)
    }
  }

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/salon/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inviteForm),
      })

      if (res.ok) {
        toast.success('Invitation envoyée !')
        setShowInviteModal(false)
        setInviteForm({ email: '', role: 'staff', firstName: '', lastName: '', phone: '' })
        fetchMembers()
      } else {
        const data = await res.json()
        toast.error(data.message || 'Erreur')
      }
    } catch {
      toast.error('Erreur réseau')
    }
  }

  const handleUpdateMember = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedMember) return

    try {
      const res = await fetch('/api/salon/members', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedMember),
      })

      if (res.ok) {
        toast.success('Membre mis à jour')
        setShowEditModal(false)
        setSelectedMember(null)
        fetchMembers()
      } else {
        const data = await res.json()
        toast.error(data.message || 'Erreur')
      }
    } catch {
      toast.error('Erreur réseau')
    }
  }

  const handleRevoke = async (memberId: string) => {
    if (!confirm('Révoquer l\'accès de ce membre ?')) return

    try {
      const res = await fetch(`/api/salon/members?id=${memberId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        toast.success('Accès révoqué')
        fetchMembers()
      } else {
        toast.error('Erreur')
      }
    } catch {
      toast.error('Erreur réseau')
    }
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
          <h1 className="text-2xl font-bold text-gray-900">Équipe du salon</h1>
          <p className="mt-1 text-gray-600">
            Gérez les accès et les permissions de votre équipe
          </p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Inviter un membre
        </button>
      </div>

      {/* Liste des membres */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Membre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rôle
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {members.map((member) => (
              <tr key={member.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-medium">
                      {(member.firstName?.[0] || member.user?.name?.[0] || '?').toUpperCase()}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {member.firstName && member.lastName
                          ? `${member.firstName} ${member.lastName}`
                          : member.user?.name || 'Invitation en attente'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {member.user?.email || member.inviteEmail}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleColors[member.role]}`}>
                    {roleLabels[member.role]}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[member.status]}`}>
                    {statusLabels[member.status]}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {member.phone || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {!member.isOwner && (
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setSelectedMember(member)
                          setShowEditModal(true)
                        }}
                        className="text-pink-600 hover:text-pink-900"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => handleRevoke(member.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Révoquer
                      </button>
                    </div>
                  )}
                  {member.isOwner && (
                    <span className="text-gray-400">Propriétaire</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Légende des rôles */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Niveaux d'accès</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-purple-50 rounded-lg">
            <h4 className="font-medium text-purple-800">🔑 Propriétaire</h4>
            <p className="text-sm text-purple-600 mt-1">Accès total, gestion de l'abonnement et des membres</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-800">👑 Administrateur</h4>
            <p className="text-sm text-blue-600 mt-1">Gestion complète sauf abonnement et membres</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-medium text-green-800">👤 Employé</h4>
            <p className="text-sm text-green-600 mt-1">Gestion des clients, animaux et rendez-vous</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-800">👁️ Lecture seule</h4>
            <p className="text-sm text-gray-600 mt-1">Consultation uniquement, aucune modification</p>
          </div>
        </div>
      </div>

      {/* Modal Invitation */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Inviter un membre</h2>
            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="email@exemple.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rôle *
                </label>
                <select
                  value={inviteForm.role}
                  onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  <option value="admin">Administrateur</option>
                  <option value="staff">Employé</option>
                  <option value="readonly">Lecture seule</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prénom
                  </label>
                  <input
                    type="text"
                    value={inviteForm.firstName}
                    onChange={(e) => setInviteForm({ ...inviteForm, firstName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom
                  </label>
                  <input
                    type="text"
                    value={inviteForm.lastName}
                    onChange={(e) => setInviteForm({ ...inviteForm, lastName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone
                </label>
                <input
                  type="tel"
                  value={inviteForm.phone}
                  onChange={(e) => setInviteForm({ ...inviteForm, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                >
                  Envoyer l'invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Édition */}
      {showEditModal && selectedMember && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Modifier le membre</h2>
            <form onSubmit={handleUpdateMember} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rôle
                </label>
                <select
                  value={selectedMember.role}
                  onChange={(e) => setSelectedMember({ ...selectedMember, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  <option value="admin">Administrateur</option>
                  <option value="staff">Employé</option>
                  <option value="readonly">Lecture seule</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prénom
                  </label>
                  <input
                    type="text"
                    value={selectedMember.firstName || ''}
                    onChange={(e) => setSelectedMember({ ...selectedMember, firstName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom
                  </label>
                  <input
                    type="text"
                    value={selectedMember.lastName || ''}
                    onChange={(e) => setSelectedMember({ ...selectedMember, lastName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone
                </label>
                <input
                  type="tel"
                  value={selectedMember.phone || ''}
                  onChange={(e) => setSelectedMember({ ...selectedMember, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>

              {/* Permissions personnalisées */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Permissions personnalisées
                </label>
                <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
                  {[
                    { key: 'canManageClients', label: 'Gérer les clients' },
                    { key: 'canManageAnimals', label: 'Gérer les animaux' },
                    { key: 'canManageAppointments', label: 'Gérer les rendez-vous' },
                    { key: 'canManageServices', label: 'Gérer les services' },
                    { key: 'canManageInventory', label: 'Gérer l\'inventaire' },
                    { key: 'canViewReports', label: 'Voir les rapports' },
                    { key: 'canManageBilling', label: 'Gérer la facturation' },
                    { key: 'canManageSettings', label: 'Gérer les paramètres' },
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedMember[key as keyof Member] as boolean}
                        onChange={(e) => setSelectedMember({ ...selectedMember, [key]: e.target.checked })}
                        className="w-4 h-4 text-pink-600 rounded focus:ring-pink-500"
                      />
                      <span className="text-sm text-gray-700">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false)
                    setSelectedMember(null)
                  }}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
