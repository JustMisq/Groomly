'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'

interface Animal {
  id: string
  name: string
  species: string
  breed?: string
  color?: string
  dateOfBirth?: string
  notes?: string
  createdAt: string
}

interface Client {
  id: string
  firstName: string
  lastName: string
  email?: string
  phone?: string
  address?: string
  notes?: string
  createdAt: string
}

interface Appointment {
  id: string
  startTime: string
  endTime: string
  status: string
  totalPrice: number
  service?: { name: string }
}

interface Invoice {
  id: string
  invoiceNumber: string
  total: number
  status: string
  createdAt: string
}

export default function ClientDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const clientId = params.id as string
  
  const [client, setClient] = useState<Client | null>(null)
  const [animals, setAnimals] = useState<Animal[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [editingNotes, setEditingNotes] = useState(false)
  const [clientNotes, setClientNotes] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    species: 'dog',
    breed: '',
    color: '',
    dateOfBirth: '',
    notes: '',
  })

  // Charger le client
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [clientRes, animalsRes, appointmentsRes, invoicesRes] = await Promise.all([
          fetch(`/api/clients/${clientId}`),
          fetch(`/api/animals?clientId=${clientId}`),
          fetch(`/api/appointments`),
          fetch(`/api/invoices?clientId=${clientId}`),
        ])
        
        if (clientRes.ok) {
          const data = await clientRes.json()
          setClient(data)
          setClientNotes(data.notes || '')
        }
        
        if (animalsRes.ok) {
          const data = await animalsRes.json()
          setAnimals(data)
        }
        
        if (appointmentsRes.ok) {
          const allApts = await appointmentsRes.json()
          // Filtrer les rendez-vous de ce client
          const clientApts = allApts.filter((apt: any) => 
            animals.some(a => a.id === apt.animalId)
          )
          setAppointments(clientApts.sort((a: Appointment, b: Appointment) => 
            new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
          ))
        }
        
        if (invoicesRes.ok) {
          const data = await invoicesRes.json()
          setInvoices(data.sort((a: Invoice, b: Invoice) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          ))
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        toast.error('Erreur lors du chargement')
      } finally {
        setLoading(false)
      }
    }
    
    if (clientId) fetchAll()
  }, [clientId, animals.length])

  const handleAddAnimal = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const res = await fetch('/api/animals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId,
          ...formData,
        }),
      })

      if (!res.ok) {
        toast.error('Erreur lors de l\'ajout de l\'animal')
        return
      }

      const newAnimal = await res.json()
      setAnimals([newAnimal, ...animals])
      setFormData({
        name: '',
        species: 'dog',
        breed: '',
        color: '',
        dateOfBirth: '',
        notes: '',
      })
      setShowAddForm(false)
      toast.success('Animal ajouté!')
    } catch (error) {
      console.error('Error adding animal:', error)
      toast.error('Une erreur est survenue')
    }
  }

  const handleSaveClientNotes = async () => {
    try {
      const res = await fetch('/api/clients', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: clientId, notes: clientNotes }),
      })

      if (res.ok) {
        toast.success('Notes sauvegardées!')
        setEditingNotes(false)
        if (client) setClient({ ...client, notes: clientNotes })
      } else {
        toast.error('Erreur lors de la sauvegarde')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Une erreur est survenue')
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-5xl">
      {/* En-tête */}
      <div className="mb-8">
        <Link href="/dashboard/clients" className="text-primary hover:underline text-sm mb-4 inline-block">
          ← Retour aux clients
        </Link>
        {client && (
          <>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {client.firstName} {client.lastName}
            </h1>
            <p className="text-gray-600">
              Client depuis {new Date(client.createdAt).toLocaleDateString('fr-FR')}
            </p>
          </>
        )}
      </div>

      {/* Infos de base */}
      {client && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">📋 Informations</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {client.email && (
              <p className="text-gray-700">
                <span className="font-medium">Email :</span> {client.email}
              </p>
            )}
            {client.phone && (
              <p className="text-gray-700">
                <span className="font-medium">Téléphone :</span> {client.phone}
              </p>
            )}
            {client.address && (
              <p className="text-gray-700 col-span-2">
                <span className="font-medium">Adresse :</span> {client.address}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Suivi & Notes */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-blue-900">📝 Suivi & Notes</h2>
          <Button
            onClick={() => setEditingNotes(!editingNotes)}
            className={`${
              editingNotes
                ? 'bg-gray-500 hover:bg-gray-600'
                : 'bg-blue-500 hover:bg-blue-600'
            } text-white`}
          >
            {editingNotes ? '❌ Annuler' : '✏️ Modifier'}
          </Button>
        </div>

        {editingNotes ? (
          <div className="space-y-3">
            <textarea
              value={clientNotes}
              onChange={(e) => setClientNotes(e.target.value)}
              rows={5}
              className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Notes sur le client, préférences, comportement des animaux, allergies, etc."
            />
            <Button
              onClick={handleSaveClientNotes}
              className="bg-green-500 hover:bg-green-600 text-white w-full"
            >
              ✅ Sauvegarder
            </Button>
          </div>
        ) : (
          <div className="bg-white p-4 rounded border border-blue-300 min-h-[120px]">
            {clientNotes ? (
              <p className="text-gray-700 whitespace-pre-wrap">{clientNotes}</p>
            ) : (
              <p className="text-gray-400 italic">Aucune note pour le moment</p>
            )}
          </div>
        )}
      </div>

      {/* Animaux */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">🐕 Animaux ({animals.length})</h2>
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-primary hover:bg-primary/90"
          >
            {showAddForm ? '❌ Annuler' : '➕ Ajouter'}
          </Button>
        </div>

        {/* Add Animal Form */}
        {showAddForm && (
          <div className="bg-white rounded-lg p-6 border border-gray-200 mb-6">
            <form onSubmit={handleAddAnimal} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                  placeholder="Ex: Rex"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Espèce *
                  </label>
                  <select
                    value={formData.species}
                    onChange={(e) =>
                      setFormData({ ...formData, species: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                  >
                    <option value="dog">Chien</option>
                    <option value="cat">Chat</option>
                    <option value="rabbit">Lapin</option>
                    <option value="bird">Oiseau</option>
                    <option value="other">Autre</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Race
                  </label>
                  <input
                    type="text"
                    value={formData.breed}
                    onChange={(e) =>
                      setFormData({ ...formData, breed: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                    placeholder="Ex: Golden Retriever"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Couleur
                  </label>
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) =>
                      setFormData({ ...formData, color: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                    placeholder="Ex: Blond"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date de naissance
                  </label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) =>
                      setFormData({ ...formData, dateOfBirth: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                  placeholder="Ex: Allergies, comportement, etc."
                  rows={3}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90"
              >
                Ajouter l&apos;animal
              </Button>
            </form>
          </div>
        )}

        {/* Animals List */}
        {animals.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-500">Aucun animal pour ce client</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {animals.map((animal) => (
              <div
                key={animal.id}
                className="bg-white rounded-lg p-6 border border-gray-200 hover:border-primary transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {animal.name}
                    </h3>
                    <div className="mt-2 space-y-1 text-gray-600">
                      <p>🐾 Espèce: {animal.species}</p>
                      {animal.breed && <p>📋 Race: {animal.breed}</p>}
                      {animal.color && <p>🎨 Couleur: {animal.color}</p>}
                      {animal.dateOfBirth && (
                        <p>
                          🎂 Né le:{' '}
                          {new Date(animal.dateOfBirth).toLocaleDateString(
                            'fr-FR'
                          )}
                        </p>
                      )}
                      {animal.notes && (
                        <p className="text-blue-700 font-medium">📝 {animal.notes}</p>
                      )}
                    </div>
                  </div>
                  <Link href={`/dashboard/animals/${animal.id}`}>
                    <Button className="bg-blue-500 hover:bg-blue-600 text-white">
                      Voir détails
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Rendez-vous */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">📅 Rendez-vous ({appointments.length})</h2>
        
        {appointments.length === 0 ? (
          <p className="text-gray-500">Aucun rendez-vous</p>
        ) : (
          <div className="space-y-3">
            {appointments.map(apt => (
              <div key={apt.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900">{apt.service?.name || 'Service'}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(apt.startTime).toLocaleDateString('fr-FR')} à{' '}
                      {new Date(apt.startTime).toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                        apt.status === 'completed'
                          ? 'bg-green-100 text-green-700'
                          : apt.status === 'cancelled'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {apt.status === 'completed'
                        ? '✅ Complété'
                        : apt.status === 'cancelled'
                        ? '❌ Annulé'
                        : '⏳ Planifié'}
                    </span>
                    <p className="text-gray-900 font-medium mt-2">{apt.totalPrice}€</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Factures */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">💰 Factures ({invoices.length})</h2>
        
        {invoices.length === 0 ? (
          <p className="text-gray-500">Aucune facture</p>
        ) : (
          <div className="space-y-3">
            {invoices.map(invoice => (
              <div
                key={invoice.id}
                className="p-4 border border-gray-200 rounded-lg flex justify-between items-center hover:bg-gray-50"
              >
                <div>
                  <p className="font-medium text-gray-900">{invoice.invoiceNumber}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(invoice.createdAt).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">{invoice.total}€</p>
                  <span
                    className={`text-xs px-3 py-1 rounded-full font-medium inline-block ${
                      invoice.status === 'paid'
                        ? 'bg-green-100 text-green-700'
                        : invoice.status === 'sent'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {invoice.status === 'paid'
                      ? '✅ Payée'
                      : invoice.status === 'sent'
                      ? '📧 Envoyée'
                      : invoice.status === 'draft'
                      ? '📝 Brouillon'
                      : '❌ Annulée'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
