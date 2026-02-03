'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'

interface Service {
  id: string
  name: string
  description: string | null
  price: number
  minPrice: number | null
  maxPrice: number | null
  duration: number
  minDuration: number | null
  maxDuration: number | null
  isFlexible: boolean
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    minPrice: '',
    maxPrice: '',
    duration: '',
    minDuration: '',
    maxDuration: '',
    isFlexible: false,
  })

  // Charger les services
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await fetch('/api/services')
        if (res.ok) {
          setServices(await res.json())
        }
      } catch (error) {
        console.error('Error fetching services:', error)
        toast.error('Erreur lors du chargement')
      } finally {
        setLoading(false)
      }
    }

    fetchServices()
  }, [])

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      minPrice: '',
      maxPrice: '',
      duration: '',
      minDuration: '',
      maxDuration: '',
      isFlexible: false,
    })
    setEditingService(null)
    setShowForm(false)
  }

  const handleEdit = (service: Service) => {
    setEditingService(service)
    setFormData({
      name: service.name,
      description: service.description || '',
      price: service.price.toString(),
      minPrice: service.minPrice?.toString() || '',
      maxPrice: service.maxPrice?.toString() || '',
      duration: service.duration.toString(),
      minDuration: service.minDuration?.toString() || '',
      maxDuration: service.maxDuration?.toString() || '',
      isFlexible: service.isFlexible,
    })
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.price || !formData.duration) {
      toast.error('Le nom, le prix et la durée sont requis')
      return
    }

    if (formData.isFlexible && !formData.minPrice && !formData.maxPrice) {
      toast.error('Pour un service flexible, indiquez au moins un prix min ou max')
      return
    }

    setIsSubmitting(true)

    try {
      const url = editingService ? '/api/services' : '/api/services'
      const method = editingService ? 'PUT' : 'POST'
      const body = {
        ...(editingService && { id: editingService.id }),
        name: formData.name,
        description: formData.description || null,
        price: parseFloat(formData.price),
        minPrice: formData.minPrice ? parseFloat(formData.minPrice) : null,
        maxPrice: formData.maxPrice ? parseFloat(formData.maxPrice) : null,
        duration: parseInt(formData.duration),
        minDuration: formData.minDuration ? parseInt(formData.minDuration) : null,
        maxDuration: formData.maxDuration ? parseInt(formData.maxDuration) : null,
        isFlexible: formData.isFlexible,
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const error = await res.json().catch(() => ({}))
        toast.error(error.message || `Erreur lors de la ${editingService ? 'modification' : 'création'}`)
        return
      }

      const newService = await res.json()

      if (editingService) {
        setServices(services.map(s => s.id === newService.id ? newService : s))
        toast.success('Service modifié!')
      } else {
        setServices([...services, newService])
        toast.success('Service créé!')
      }

      resetForm()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Une erreur est survenue')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (serviceId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce service ?')) return

    try {
      const res = await fetch(`/api/services?id=${serviceId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setServices(services.filter(s => s.id !== serviceId))
        toast.success('Service supprimé')
      } else {
        toast.error('Erreur lors de la suppression')
      }
    } catch (error) {
      console.error('Error deleting service:', error)
      toast.error('Une erreur est survenue')
    }
  }

  const formatPrice = (service: Service): string => {
    if (service.isFlexible) {
      if (service.minPrice && service.maxPrice) {
        return `${service.minPrice}€ - ${service.maxPrice}€`
      } else if (service.minPrice) {
        return `À partir de ${service.minPrice}€`
      } else if (service.maxPrice) {
        return `Jusqu'à ${service.maxPrice}€`
      }
    }
    return `${service.price}€`
  }

  const formatDuration = (service: Service): string => {
    if (service.isFlexible) {
      if (service.minDuration && service.maxDuration) {
        return `${service.minDuration}m - ${service.maxDuration}m`
      } else if (service.minDuration) {
        return `À partir de ${service.minDuration}m`
      } else if (service.maxDuration) {
        return `Jusqu'à ${service.maxDuration}m`
      }
    }
    return `${service.duration}m`
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-500">Chargement des services...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Services</h1>
        <Button
          onClick={() => {
            if (showForm && !editingService) {
              setShowForm(false)
            } else {
              resetForm()
              setShowForm(true)
            }
          }}
          className="bg-primary hover:bg-primary/90"
        >
          {showForm ? '❌ Annuler' : '➕ Nouveau Service'}
        </Button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg p-6 border border-gray-200 mb-8">
          <h2 className="text-xl font-semibold mb-4">
            {editingService ? 'Modifier le service' : 'Créer un service'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                  placeholder="Ex: Toilettage complet"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prix de base (€) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                  placeholder="15.00"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                placeholder="Description du service..."
                rows={2}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Durée (minutes) *
                </label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                  placeholder="60"
                />
              </div>

              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFlexible}
                    onChange={(e) => setFormData({ ...formData, isFlexible: e.target.checked })}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">Service flexible</span>
                </label>
              </div>
            </div>

            {formData.isFlexible && (
              <>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                  <h3 className="font-medium text-blue-900 mb-3">Prix flexible</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Prix minimum (€)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.minPrice}
                        onChange={(e) => setFormData({ ...formData, minPrice: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                        placeholder="Ex: 15.00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Prix maximum (€)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.maxPrice}
                        onChange={(e) => setFormData({ ...formData, maxPrice: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                        placeholder="Ex: 30.00"
                      />
                    </div>
                  </div>

                  <h3 className="font-medium text-blue-900 mb-3 mt-4">Durée flexible</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Durée minimum (minutes)
                      </label>
                      <input
                        type="number"
                        value={formData.minDuration}
                        onChange={(e) => setFormData({ ...formData, minDuration: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                        placeholder="Ex: 30"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Durée maximum (minutes)
                      </label>
                      <input
                        type="number"
                        value={formData.maxDuration}
                        onChange={(e) => setFormData({ ...formData, maxDuration: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                        placeholder="Ex: 120"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            <Button type="submit" disabled={isSubmitting} className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50">
              {isSubmitting ? 'En cours...' : editingService ? 'Modifier le service' : 'Créer le service'}
            </Button>
          </form>
        </div>
      )}

      <div className="grid gap-4">
        {services.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <p className="text-gray-500">Aucun service pour le moment. Créez-en un pour démarrer!</p>
          </div>
        ) : (
          services.map((service) => (
            <div key={service.id} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg text-gray-900">{service.name}</h3>
                    {service.isFlexible && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                        Flexible
                      </span>
                    )}
                  </div>
                  {service.description && (
                    <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-primary">{formatPrice(service)}</p>
                  <p className="text-sm text-gray-500">Durée: {formatDuration(service)}</p>
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  onClick={() => handleEdit(service)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2"
                >
                  ✏️ Modifier
                </Button>
                <Button
                  onClick={() => handleDelete(service.id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2"
                >
                  🗑️ Supprimer
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
