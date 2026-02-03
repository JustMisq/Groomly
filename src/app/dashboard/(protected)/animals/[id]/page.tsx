'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
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
  clientId: string
  // Nouveaux champs santé
  temperament?: string
  allergies?: string
  healthNotes?: string
  groomingNotes?: string
  weight?: number
}

interface Client {
  id: string
  firstName: string
  lastName: string
}

interface Appointment {
  id: string
  startTime: string
  endTime: string
  status: string
  totalPrice: number
  animalId: string
  service?: { name: string }
  animal?: { id: string; name: string }
}

export default function AnimalDetailPage() {
  const params = useParams()
  const animalId = params.id as string

  const [animal, setAnimal] = useState<Animal | null>(null)
  const [client, setClient] = useState<Client | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [editingNotes, setEditingNotes] = useState(false)
  const [editingHealth, setEditingHealth] = useState(false)
  const [animalNotes, setAnimalNotes] = useState('')
  const [healthData, setHealthData] = useState({
    temperament: '',
    allergies: '',
    healthNotes: '',
    groomingNotes: '',
    weight: '',
  })

  useEffect(() => {
    fetchAnimalDetails()
  }, [animalId])

  const fetchAnimalDetails = async () => {
    try {
      const animalRes = await fetch(`/api/animals/${animalId}`)
      
      if (animalRes.ok) {
        const animalData = await animalRes.json()
        setAnimal(animalData)
        setAnimalNotes(animalData.notes || '')
        setHealthData({
          temperament: animalData.temperament || '',
          allergies: animalData.allergies || '',
          healthNotes: animalData.healthNotes || '',
          groomingNotes: animalData.groomingNotes || '',
          weight: animalData.weight?.toString() || '',
        })

        // Charger le client
        if (animalData.clientId) {
          const clientRes = await fetch(`/api/clients/${animalData.clientId}`)
          if (clientRes.ok) {
            setClient(await clientRes.json())
          }
        }

        // Charger les rendez-vous
        const appointmentsRes = await fetch('/api/appointments')
        if (appointmentsRes.ok) {
          const allAppointments = await appointmentsRes.json()
          const animalAppointments = allAppointments.filter(
            (apt: Appointment) => apt.animalId === animalId
          )
          setAppointments(
            animalAppointments.sort(
              (a: Appointment, b: Appointment) =>
                new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
            )
          )
        }
      }
    } catch (error) {
      console.error('Error fetching details:', error)
      toast.error('Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveNotes = async () => {
    try {
      const res = await fetch('/api/animals', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: animalId, notes: animalNotes }),
      })

      if (res.ok) {
        toast.success('Notes sauvegardées!')
        setEditingNotes(false)
        if (animal) setAnimal({ ...animal, notes: animalNotes })
      } else {
        toast.error('Erreur lors de la sauvegarde')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Une erreur est survenue')
    }
  }

  const handleSaveHealth = async () => {
    try {
      const res = await fetch('/api/animals', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: animalId,
          temperament: healthData.temperament || null,
          allergies: healthData.allergies || null,
          healthNotes: healthData.healthNotes || null,
          groomingNotes: healthData.groomingNotes || null,
          weight: healthData.weight ? parseFloat(healthData.weight) : null,
        }),
      })

      if (res.ok) {
        toast.success('Informations santé sauvegardées!')
        setEditingHealth(false)
        if (animal) {
          setAnimal({
            ...animal,
            temperament: healthData.temperament,
            allergies: healthData.allergies,
            healthNotes: healthData.healthNotes,
            groomingNotes: healthData.groomingNotes,
            weight: healthData.weight ? parseFloat(healthData.weight) : undefined,
          })
        }
      } else {
        toast.error('Erreur lors de la sauvegarde')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Une erreur est survenue')
    }
  }

  const getTemperamentBadge = (temperament: string) => {
    const badges: Record<string, { color: string; emoji: string }> = {
      calm: { color: 'bg-green-100 text-green-700', emoji: '😊' },
      nervous: { color: 'bg-yellow-100 text-yellow-700', emoji: '😰' },
      aggressive: { color: 'bg-red-100 text-red-700', emoji: '⚠️' },
      playful: { color: 'bg-blue-100 text-blue-700', emoji: '🎾' },
      fearful: { color: 'bg-purple-100 text-purple-700', emoji: '😨' },
    }
    const labels: Record<string, string> = {
      calm: 'Calme',
      nervous: 'Nerveux',
      aggressive: 'Agressif',
      playful: 'Joueur',
      fearful: 'Craintif',
    }
    const badge = badges[temperament] || { color: 'bg-gray-100 text-gray-700', emoji: '' }
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${badge.color}`}>
        {badge.emoji} {labels[temperament] || temperament}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!animal) {
    return (
      <div className="p-8">
        <p className="text-gray-500">Animal non trouvé</p>
        <Link href="/dashboard/animals">
          <Button className="mt-4">← Retour aux animaux</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-5xl">
      {/* En-tête */}
      <div className="mb-8">
        <Link href="/dashboard/animals" className="text-primary hover:underline text-sm mb-4 inline-block">
          ← Retour aux animaux
        </Link>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">{animal.name}</h1>
        <p className="text-gray-600">
          {animal.species} {animal.breed ? `- ${animal.breed}` : ''}
        </p>
        {client && (
          <p className="text-gray-500 mt-1">
            Client : <Link href={`/dashboard/clients/${client.id}`} className="text-primary hover:underline">
              {client.firstName} {client.lastName}
            </Link>
          </p>
        )}
      </div>

      {/* Infos de base */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">🐾 Informations</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <p className="text-gray-700">
            <span className="font-medium">Espèce :</span> {animal.species}
          </p>
          {animal.breed && (
            <p className="text-gray-700">
              <span className="font-medium">Race :</span> {animal.breed}
            </p>
          )}
          {animal.color && (
            <p className="text-gray-700">
              <span className="font-medium">Couleur :</span> {animal.color}
            </p>
          )}
          {animal.dateOfBirth && (
            <p className="text-gray-700">
              <span className="font-medium">Date de naissance :</span>{' '}
              {new Date(animal.dateOfBirth).toLocaleDateString('fr-FR')}
            </p>
          )}
          {animal.weight && (
            <p className="text-gray-700">
              <span className="font-medium">Poids :</span> {animal.weight} kg
            </p>
          )}
          <p className="text-gray-700">
            <span className="font-medium">Enregistré :</span>{' '}
            {new Date(animal.createdAt).toLocaleDateString('fr-FR')}
          </p>
        </div>
      </div>

      {/* Santé & Comportement */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-red-900">🏥 Santé & Comportement</h2>
          <Button
            onClick={() => setEditingHealth(!editingHealth)}
            className={`${
              editingHealth
                ? 'bg-gray-500 hover:bg-gray-600'
                : 'bg-red-500 hover:bg-red-600'
            } text-white`}
          >
            {editingHealth ? '❌ Annuler' : '✏️ Modifier'}
          </Button>
        </div>

        {editingHealth ? (
          <div className="space-y-4 bg-white p-4 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tempérament
              </label>
              <select
                value={healthData.temperament}
                onChange={(e) => setHealthData({ ...healthData, temperament: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
              >
                <option value="">Sélectionner...</option>
                <option value="calm">😊 Calme</option>
                <option value="playful">🎾 Joueur</option>
                <option value="nervous">😰 Nerveux</option>
                <option value="fearful">😨 Craintif</option>
                <option value="aggressive">⚠️ Agressif</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Poids (kg)
              </label>
              <input
                type="number"
                step="0.1"
                value={healthData.weight}
                onChange={(e) => setHealthData({ ...healthData, weight: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                placeholder="Ex: 8.5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Allergies connues
              </label>
              <input
                type="text"
                value={healthData.allergies}
                onChange={(e) => setHealthData({ ...healthData, allergies: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                placeholder="Ex: Allergie aux shampooings parfumés"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes de santé
              </label>
              <textarea
                value={healthData.healthNotes}
                onChange={(e) => setHealthData({ ...healthData, healthNotes: e.target.value })}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none resize-none"
                placeholder="Problèmes de santé, traitements en cours..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Préférences de toilettage
              </label>
              <textarea
                value={healthData.groomingNotes}
                onChange={(e) => setHealthData({ ...healthData, groomingNotes: e.target.value })}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none resize-none"
                placeholder="Coupe préférée, zones sensibles..."
              />
            </div>
            <Button
              onClick={handleSaveHealth}
              className="bg-green-500 hover:bg-green-600 text-white w-full"
            >
              ✅ Sauvegarder
            </Button>
          </div>
        ) : (
          <div className="bg-white rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600">Tempérament :</span>
              {animal.temperament ? (
                getTemperamentBadge(animal.temperament)
              ) : (
                <span className="text-gray-400 italic">Non renseigné</span>
              )}
            </div>
            {animal.weight && (
              <p className="text-gray-700">
                <span className="font-medium">Poids :</span> {animal.weight} kg
              </p>
            )}
            {animal.allergies && (
              <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                <p className="text-sm font-medium text-yellow-800">⚠️ Allergies :</p>
                <p className="text-yellow-700">{animal.allergies}</p>
              </div>
            )}
            {animal.healthNotes && (
              <div>
                <p className="text-sm font-medium text-gray-600">Notes de santé :</p>
                <p className="text-gray-700">{animal.healthNotes}</p>
              </div>
            )}
            {animal.groomingNotes && (
              <div>
                <p className="text-sm font-medium text-gray-600">Préférences de toilettage :</p>
                <p className="text-gray-700">{animal.groomingNotes}</p>
              </div>
            )}
            {!animal.temperament && !animal.allergies && !animal.healthNotes && !animal.groomingNotes && (
              <p className="text-gray-400 italic">Aucune information santé renseignée</p>
            )}
          </div>
        )}
      </div>

      {/* Suivi & Notes */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-purple-900">📝 Suivi & Observations</h2>
          <Button
            onClick={() => setEditingNotes(!editingNotes)}
            className={`${
              editingNotes
                ? 'bg-gray-500 hover:bg-gray-600'
                : 'bg-purple-500 hover:bg-purple-600'
            } text-white`}
          >
            {editingNotes ? '❌ Annuler' : '✏️ Modifier'}
          </Button>
        </div>

        {editingNotes ? (
          <div className="space-y-3">
            <textarea
              value={animalNotes}
              onChange={(e) => setAnimalNotes(e.target.value)}
              rows={5}
              className="w-full px-4 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
              placeholder="Notes de toilettage, comportement, allergies, sensibilités, préférences, etc."
            />
            <Button
              onClick={handleSaveNotes}
              className="bg-green-500 hover:bg-green-600 text-white w-full"
            >
              ✅ Sauvegarder
            </Button>
          </div>
        ) : (
          <div className="bg-white p-4 rounded border border-purple-300 min-h-[120px]">
            {animalNotes ? (
              <p className="text-gray-700 whitespace-pre-wrap">{animalNotes}</p>
            ) : (
              <p className="text-gray-400 italic">Aucune note pour le moment</p>
            )}
          </div>
        )}
      </div>

      {/* Rendez-vous */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          📅 Historique des visites ({appointments.length})
        </h2>

        {appointments.length === 0 ? (
          <p className="text-gray-500">Aucun rendez-vous pour cet animal</p>
        ) : (
          <div className="space-y-3">
            {appointments.map((apt) => (
              <div
                key={apt.id}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{apt.service?.name || 'Service'}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(apt.startTime).toLocaleDateString('fr-FR')} à{' '}
                      {new Date(apt.startTime).toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                    {apt.endTime && (
                      <p className="text-sm text-gray-500">
                        Durée :{' '}
                        {Math.round(
                          (new Date(apt.endTime).getTime() -
                            new Date(apt.startTime).getTime()) /
                            60000
                        )}{' '}
                        min
                      </p>
                    )}
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
    </div>
  )
}
