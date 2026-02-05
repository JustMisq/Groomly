'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface Permission {
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

interface SalonMember {
  id: string
  firstName?: string
  lastName?: string
  role: string
  user?: {
    name: string
    email: string
  }
  inviteEmail?: string
}

const PERMISSION_DESCRIPTIONS: Record<keyof Permission, string> = {
  canManageClients: 'Créer, modifer et supprimer des clients',
  canManageAnimals: 'Créer, modifer et supprimer des animaux',
  canManageAppointments: 'Créer, modifer et annuler des rendez-vous',
  canManageServices: 'Ajouter et modifer les services',
  canManageInventory: 'Gérer les stocks et inventaire',
  canViewReports: 'Accès aux rapports et statistiques',
  canManageBilling: 'Créer et gérer les factures',
  canManageSettings: 'Accès aux paramètres du salon',
  canManageMembers: 'Inviter et gérer les membres de l\'équipe',
}

export default function MemberPermissionsPage() {
  const params = useParams()
  const router = useRouter()
  const memberId = params.id as string

  const [member, setMember] = useState<SalonMember | null>(null)
  const [permissions, setPermissions] = useState<Permission>({
    canManageClients: true,
    canManageAnimals: true,
    canManageAppointments: true,
    canManageServices: true,
    canManageInventory: true,
    canViewReports: false,
    canManageBilling: false,
    canManageSettings: false,
    canManageMembers: false,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchMemberPermissions()
  }, [memberId])

  const fetchMemberPermissions = async () => {
    try {
      const res = await fetch(`/api/salon/members/${memberId}`)
      if (!res.ok) throw new Error('Erreur')

      const data = await res.json()
      setMember(data.member)
      setPermissions(data.permissions)
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Impossible de charger les données')
      router.push('/dashboard/staff')
    } finally {
      setLoading(false)
    }
  }

  const togglePermission = (key: keyof Permission) => {
    setPermissions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const res = await fetch(`/api/salon/members/${memberId}/permissions`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(permissions),
      })

      if (!res.ok) throw new Error('Erreur lors de la sauvegarde')

      toast.success('Permissions mises à jour!')
      router.push('/dashboard/staff')
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const resetPermissions = () => {
    if (member?.role === 'staff') {
      setPermissions({
        canManageClients: true,
        canManageAnimals: true,
        canManageAppointments: true,
        canManageServices: true,
        canManageInventory: true,
        canViewReports: false,
        canManageBilling: false,
        canManageSettings: false,
        canManageMembers: false,
      })
    } else if (member?.role === 'admin') {
      setPermissions({
        canManageClients: true,
        canManageAnimals: true,
        canManageAppointments: true,
        canManageServices: true,
        canManageInventory: true,
        canViewReports: true,
        canManageBilling: true,
        canManageSettings: true,
        canManageMembers: false,
      })
    } else if (member?.role === 'readonly') {
      setPermissions({
        canManageClients: false,
        canManageAnimals: false,
        canManageAppointments: false,
        canManageServices: false,
        canManageInventory: false,
        canViewReports: false,
        canManageBilling: false,
        canManageSettings: false,
        canManageMembers: false,
      })
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-spin text-4xl">⏳</div>
      </div>
    )
  }

  if (!member) {
    return (
      <div className="p-8">
        <p className="text-gray-600">Membre introuvable</p>
      </div>
    )
  }

  const memberName = member.user?.name || `${member.firstName} ${member.lastName}`.trim() || 'Invité'

  return (
    <div className="space-y-6 p-8">
      {/* En-tête */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Link
            href="/dashboard/staff"
            className="text-primary hover:underline"
          >
            ← Retour
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">🔑 Permissions</h1>
        <p className="text-gray-600 mt-2">
          {memberName} • {member.role}
        </p>
      </div>

      {/* Informations */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-3">À propos de ce membre</h3>
        <dl className="space-y-2 text-sm">
          <div>
            <dt className="font-medium text-gray-700">Nom</dt>
            <dd className="text-gray-600">{memberName}</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-700">Email</dt>
            <dd className="text-gray-600">
              {member.user?.email || member.inviteEmail}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-gray-700">Rôle</dt>
            <dd className="text-gray-600">
              {member.role === 'admin' && '⚙️ Admin'}
              {member.role === 'staff' && '👤 Staff'}
              {member.role === 'readonly' && '👁️ Lecture seule'}
              {member.role === 'owner' && '👑 Propriétaire'}
            </dd>
          </div>
        </dl>
      </div>

      {/* Permissions */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Permissions</h2>
              <p className="text-gray-600 text-sm mt-1">
                Ajustez les permissions de ce membre
              </p>
            </div>
            <Button
              onClick={resetPermissions}
              className="bg-gray-500 hover:bg-gray-600 text-white"
            >
              ↻ Réinitialiser aux defaults
            </Button>
          </div>
        </div>

        <div className="space-y-1 p-6">
          {(Object.keys(permissions) as Array<keyof Permission>).map((key) => (
            <label
              key={key}
              className="flex items-start gap-3 p-4 hover:bg-gray-50 rounded-lg cursor-pointer group"
            >
              <input
                type="checkbox"
                checked={permissions[key]}
                onChange={() => togglePermission(key)}
                className="mt-1 w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-900 group-hover:text-primary">
                  {key.replace(/can|([A-Z])/g, (m, g) =>
                    g ? ' ' + g : ''
                  ).trim()}
                </div>
                <p className="text-sm text-gray-500">
                  {PERMISSION_DESCRIPTIONS[key]}
                </p>
              </div>
              <span className="text-xl">
                {permissions[key] ? '✅' : '❌'}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-primary hover:bg-primary/90 text-white px-8"
        >
          {saving ? 'Sauvegarde...' : '💾 Sauvegarder les permissions'}
        </Button>
        <Link
          href="/dashboard/staff"
          className="inline-flex items-center gap-2 px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-900"
        >
          Annuler
        </Link>
      </div>
    </div>
  )
}
