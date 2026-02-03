'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'

interface Animal {
  id: string
  name: string
  species: string
  breed?: string
  color?: string
  clientId: string
  client?: {
    firstName: string
    lastName: string
  }
}

export default function AnimalsPage() {
  const [animals, setAnimals] = useState<Animal[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    species: 'dog',
    breed: '',
    color: '',
    dateOfBirth: '',
    notes: '',
    clientId: '',
  })
  const [clients, setClients] = useState<Array<{ id: string; firstName: string; lastName: string }>>([])

  useEffect(() => {
    fetchAnimals()
    fetchClients()
  }, [])

  const fetchAnimals = async () => {
    try {
      const res = await fetch('/api/animals')
      if (res.ok) {
        const data = await res.json()
        setAnimals(data)
      }
    } catch (error) {
      console.error('Error fetching animals:', error)
      toast.error('Erreur lors du chargement des animaux')
    } finally {
      setLoading(false)
    }
  }

  const fetchClients = async () => {
    try {
      const res = await fetch('/api/clients')
      if (res.ok) {
        const data = await res.json()
        setClients(data)
      }
    } catch (error) {
      console.error('Error fetching clients:', error)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.clientId) {
      toast.error('Veuillez sélectionner un client')
      return
    }

    try {
      const res = await fetch('/api/animals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        const newAnimal = await res.json()
        setAnimals([newAnimal, ...animals])
        setFormData({
          name: '',
          species: 'dog',
          breed: '',
          color: '',
          dateOfBirth: '',
          notes: '',
          clientId: '',
        })
        setShowForm(false)
        toast.success('Animal ajouté!')
      } else {
        toast.error('Erreur lors de l\'ajout')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Une erreur est survenue')
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet animal?')) return

    try {
      const res = await fetch('/api/animals', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })

      if (res.ok) {
        setAnimals(animals.filter((a) => a.id !== id))
        toast.success('Animal supprimé!')
      } else {
        toast.error('Erreur lors de la suppression')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Une erreur est survenue')
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">🐕 Animaux</h1>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-primary hover:bg-primary/90"
          >
            {showForm ? '❌ Annuler' : '➕ Ajouter un animal'}
          </Button>
        </div>

        {/* Add Form */}
        {showForm && (
          <div className="bg-white rounded-lg p-6 border border-gray-200 mb-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Client *
                </label>
                <select
                  name="clientId"
                  value={formData.clientId}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                >
                  <option value="">Sélectionner un client</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.firstName} {client.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
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
                    name="species"
                    value={formData.species}
                    onChange={handleChange}
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
                    name="breed"
                    value={formData.breed}
                    onChange={handleChange}
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
                    name="color"
                    value={formData.color}
                    onChange={handleChange}
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
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                  placeholder="Ex: Allergies, comportement, préférences, etc."
                  rows={3}
                />
              </div>

              <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                Ajouter l&apos;animal
              </Button>
            </form>
          </div>
        )}
      </div>

      {/* Animals Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        {loading ? (
          <div className="p-8 text-center">
            <p className="text-gray-600">Chargement des animaux...</p>
          </div>
        ) : animals.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-600">Aucun animal pour le moment</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Nom
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Espèce
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Race
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {animals.map((animal) => (
                <tr key={animal.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-gray-900 font-medium">{animal.name}</td>
                  <td className="px-6 py-4 text-gray-600">{animal.species}</td>
                  <td className="px-6 py-4 text-gray-600">{animal.breed || '-'}</td>
                  <td className="px-6 py-4 text-gray-600">
                    {animal.client ? (
                      <Link
                        href={`/dashboard/clients/${animal.clientId}`}
                        className="text-primary hover:underline"
                      >
                        {animal.client.firstName} {animal.client.lastName}
                      </Link>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <Link href={`/dashboard/animals/${animal.id}`}>
                        <button className="text-primary hover:underline text-sm font-medium">
                          Voir détails
                        </button>
                      </Link>
                      <button
                        onClick={() => handleDelete(animal.id)}
                        className="text-red-600 hover:underline text-sm font-medium"
                      >
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
