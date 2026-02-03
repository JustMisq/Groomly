'use client'

import { useState, useEffect } from 'react'
import { signOut, useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { DeleteModal } from '@/components/delete-modal'
import toast from 'react-hot-toast'

interface User {
  id: string
  email: string
  name: string
}

interface Salon {
  id: string
  name: string
  description?: string
  phone?: string
  address?: string
  email?: string
}

export default function SettingsPage() {
  const { data: session } = useSession()
  const [user, setUser] = useState<User | null>(null)
  const [salon, setSalon] = useState<Salon | null>(null)
  const [loading, setLoading] = useState(true)
  const [editingUser, setEditingUser] = useState(false)
  const [editingSalon, setEditingSalon] = useState(false)
  const [showDeleteDataModal, setShowDeleteDataModal] = useState(false)
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false)
  const [deletingAccount, setDeletingAccount] = useState(false)
  const [deletingData, setDeletingData] = useState(false)

  // Charger les données utilisateur et salon
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, salonRes] = await Promise.all([
          fetch('/api/auth/user'),
          fetch('/api/salon'),
        ])

        if (userRes.ok) {
          setUser(await userRes.json())
        }
        if (salonRes.ok) {
          setSalon(await salonRes.json())
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleUpdateUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    try {
      const res = await fetch('/api/auth/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.get('name'),
          email: formData.get('email'),
        }),
      })

      if (res.ok) {
        const updated = await res.json()
        setUser(updated)
        setEditingUser(false)
        toast.success('Profil mis à jour')
      } else {
        toast.error('Erreur lors de la mise à jour')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Une erreur est survenue')
    }
  }

  const handleUpdateSalon = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    try {
      const res = await fetch('/api/salon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.get('name'),
          description: formData.get('description'),
          phone: formData.get('phone'),
          address: formData.get('address'),
          email: formData.get('email'),
        }),
      })

      if (res.ok) {
        const updated = await res.json()
        setSalon(updated)
        setEditingSalon(false)
        toast.success('Salon mis à jour')
      } else {
        toast.error('Erreur lors de la mise à jour')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Une erreur est survenue')
    }
  }

  const handleExportData = async () => {
    try {
      const res = await fetch('/api/export-data')
      if (res.ok) {
        const data = await res.json()
        const element = document.createElement('a')
        element.setAttribute(
          'href',
          'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2))
        )
        element.setAttribute('download', `groomly-data-${new Date().toISOString().split('T')[0]}.json`)
        element.style.display = 'none'
        document.body.appendChild(element)
        element.click()
        document.body.removeChild(element)
        toast.success('Données exportées')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Erreur lors de l\'export')
    }
  }

  const handleDeleteAllData = async (password?: string) => {
    setDeletingData(true)
    try {
      const res = await fetch('/api/delete-all-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      if (res.ok) {
        toast.success('Toutes les données ont été supprimées')
        setShowDeleteDataModal(false)
        setTimeout(() => window.location.reload(), 1000)
      } else {
        const error = await res.json()
        toast.error(error.message || 'Erreur lors de la suppression')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Une erreur est survenue')
    } finally {
      setDeletingData(false)
    }
  }

  const handleDeleteAccount = async (password?: string) => {
    setDeletingAccount(true)
    try {
      const res = await fetch('/api/delete-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      if (res.ok) {
        toast.success('Compte supprimé. Déconnexion...')
        await signOut({ redirect: true, callbackUrl: '/' })
      } else {
        const error = await res.json()
        toast.error(error.message || 'Erreur lors de la suppression')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Une erreur est survenue')
    } finally {
      setDeletingAccount(false)
      setShowDeleteAccountModal(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-500">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Paramètres</h1>

      {/* Profil utilisateur */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">👤 Profil</h2>
          <Button
            onClick={() => setEditingUser(!editingUser)}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            {editingUser ? '❌ Annuler' : '✏️ Modifier'}
          </Button>
        </div>

        {editingUser ? (
          <form onSubmit={handleUpdateUser} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
              <input
                type="text"
                name="name"
                defaultValue={user?.name || ''}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                defaultValue={user?.email || ''}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            <Button type="submit" className="bg-green-500 hover:bg-green-600 text-white w-full">
              ✅ Sauvegarder
            </Button>
          </form>
        ) : (
          <div className="space-y-2">
            <p className="text-gray-600">
              <span className="font-medium">Nom :</span> {user?.name}
            </p>
            <p className="text-gray-600">
              <span className="font-medium">Email :</span> {user?.email}
            </p>
          </div>
        )}
      </div>

      {/* Paramètres du salon */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">🏪 Salon</h2>
          <Button
            onClick={() => setEditingSalon(!editingSalon)}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            {editingSalon ? '❌ Annuler' : '✏️ Modifier'}
          </Button>
        </div>

        {editingSalon ? (
          <form onSubmit={handleUpdateSalon} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom du salon</label>
              <input
                type="text"
                name="name"
                defaultValue={salon?.name || ''}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                defaultValue={salon?.description || ''}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                <input
                  type="tel"
                  name="phone"
                  defaultValue={salon?.phone || ''}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  defaultValue={salon?.email || ''}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
              <input
                type="text"
                name="address"
                defaultValue={salon?.address || ''}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            <Button type="submit" className="bg-green-500 hover:bg-green-600 text-white w-full">
              ✅ Sauvegarder
            </Button>
          </form>
        ) : (
          <div className="space-y-2">
            <p className="text-gray-600">
              <span className="font-medium">Nom :</span> {salon?.name}
            </p>
            {salon?.description && (
              <p className="text-gray-600">
                <span className="font-medium">Description :</span> {salon.description}
              </p>
            )}
            {salon?.phone && (
              <p className="text-gray-600">
                <span className="font-medium">Téléphone :</span> {salon.phone}
              </p>
            )}
            {salon?.email && (
              <p className="text-gray-600">
                <span className="font-medium">Email :</span> {salon.email}
              </p>
            )}
            {salon?.address && (
              <p className="text-gray-600">
                <span className="font-medium">Adresse :</span> {salon.address}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Données et confidentialité */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-bold text-blue-900 mb-4">📋 Données & Confidentialité (RGPD)</h2>
        <div className="space-y-3">
          <p className="text-sm text-blue-800">
            Conformément au RGPD, vous pouvez télécharger ou supprimer vos données personnelles.
          </p>
          <div className="flex gap-3">
            <Button
              onClick={handleExportData}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              📥 Télécharger mes données (JSON)
            </Button>
          </div>
        </div>
      </div>

      {/* Zone danger */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h2 className="text-xl font-bold text-red-900 mb-4">⚠️ Zone Danger</h2>
        <div className="space-y-4">
          
          {/* Supprimer toutes les données */}
          <div className="bg-white p-4 rounded border border-red-300">
            <h3 className="font-bold text-red-700 mb-2">🗑️ Supprimer toutes les données commerciales</h3>
            <p className="text-sm text-gray-600 mb-3">
              Supprimera tous les clients, animaux, rendez-vous, factures, services et stocks.<br/>
              <span className="font-medium text-green-700">✓ Votre salon et votre compte restent actifs.</span>
            </p>
            <Button
              onClick={() => setShowDeleteDataModal(true)}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Supprimer les données
            </Button>
          </div>

          {/* Supprimer le compte */}
          <div className="bg-white p-4 rounded border border-red-400">
            <h3 className="font-bold text-red-700 mb-2">💥 Supprimer le compte définitivement</h3>
            <p className="text-sm text-gray-600 mb-3">
              Supprimera votre compte ET toutes vos données associées. Cette action est IRRÉVERSIBLE.
            </p>
            <Button
              onClick={() => setShowDeleteAccountModal(true)}
              className="bg-red-700 hover:bg-red-800 text-white font-bold"
            >
              💥 SUPPRIMER LE COMPTE
            </Button>
          </div>
        </div>
      </div>

      {/* Infos légales */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <p className="text-xs text-gray-500 mb-2">
          Version du compte : {session?.user?.id?.slice(0, 8)}
        </p>
        <p className="text-xs text-gray-500 space-x-2">
          <a href="/legal/privacy" className="text-primary hover:underline">Politique de confidentialité</a>
          <span>•</span>
          <a href="/legal/terms" className="text-primary hover:underline">Conditions d'utilisation</a>
          <span>•</span>
          <a href="/legal/gdpr" className="text-primary hover:underline">RGPD</a>
        </p>
      </div>

      {/* Modals */}
      <DeleteModal
        isOpen={showDeleteDataModal}
        title="Supprimer toutes les données commerciales"
        message={"Ceci va supprimer :\n• Tous les clients\n• Tous les animaux\n• Tous les rendez-vous\n• Toutes les factures\n• Tous les services\n• Tout l'inventaire\n\n✓ Votre salon et votre compte restent actifs\n✓ Vous pourrez continuer à utiliser Groomly"}
        confirmText="Confirmer"
        warningText="Cette action est IRRÉVERSIBLE"
        requirePassword={true}
        onConfirm={handleDeleteAllData}
        onCancel={() => setShowDeleteDataModal(false)}
        isLoading={deletingData}
        isDangerous={false}
      />

      <DeleteModal
        isOpen={showDeleteAccountModal}
        title="Supprimer le compte définitivement"
        message="Ceci va supprimer :\n• Votre compte utilisateur\n• Votre salon\n• Tous les clients\n• Tous les rendez-vous\n• Toutes les factures\n• Tous les services\n• Tout l'inventaire\n• Votre abonnement\n\nCette action est définitive et irréversible."
        confirmText="SUPPRIMER DÉFINITIVEMENT"
        warningText="Ceci supprimera COMPLÈTEMENT votre compte"
        requirePassword={true}
        onConfirm={handleDeleteAccount}
        onCancel={() => setShowDeleteAccountModal(false)}
        isLoading={deletingAccount}
        isDangerous={true}
      />
    </div>
  )
}
