'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { Calendar, dateFnsLocalizer } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { fr } from 'date-fns/locale'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'

// Configuration du localizer avec la locale française
const locales = {
  'fr': fr,
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
})

// Messages en français pour le calendrier
const messages = {
  allDay: 'Journée',
  previous: 'Précédent',
  next: 'Suivant',
  today: "Aujourd'hui",
  month: 'Mois',
  week: 'Semaine',
  day: 'Jour',
  agenda: 'Agenda',
  date: 'Date',
  time: 'Heure',
  event: 'Événement',
  noEventsInRange: 'Aucun rendez-vous sur cette période',
  showMore: (total: number) => `+ ${total} de plus`,
}

interface Appointment {
  id: string
  startTime: string
  endTime: string
  start?: Date
  end?: Date
  clientId: string
  animalId: string
  serviceId: string
  client: { firstName: string; lastName: string }
  animal: { name: string }
  service: { name: string; price: number; duration: number }
  notes?: string
  internalNotes?: string
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
  isLateCancel?: boolean
  cancellationReason?: string
  totalPrice?: number
}

interface Client {
  id: string
  firstName: string
  lastName: string
}

interface Animal {
  id: string
  name: string
  species: string
  breed?: string
}

interface Service {
  id: string
  name: string
  price: number
  duration: number
}

// Type pour les événements du calendrier
interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  resource?: Appointment
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [animals, setAnimals] = useState<Animal[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [currentView, setCurrentView] = useState<'month' | 'week' | 'day' | 'agenda'>('month')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    clientId: '',
    animalId: '',
    serviceId: '',
    startTime: '',
    notes: '',
  })

  // Charger les données
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [apptRes, clientRes, serviceRes] = await Promise.all([
          fetch(`/api/appointments?from=${new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()}&to=${new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString()}`),
          fetch('/api/clients'),
          fetch('/api/services'),
        ])

        if (apptRes.ok) {
          const data = await apptRes.json()
          if (Array.isArray(data)) {
            setAppointments(
              data.map((apt: any) => ({
                ...apt,
                start: new Date(apt.startTime),
                end: new Date(apt.endTime),
              }))
            )
          }
        }

        if (clientRes.ok) {
          setClients(await clientRes.json())
        }

        if (serviceRes.ok) {
          setServices(await serviceRes.json())
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        toast.error('Erreur lors du chargement')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Récupérer les animaux du client sélectionné
  useEffect(() => {
    const fetchAnimals = async () => {
      if (!formData.clientId) {
        setAnimals([])
        setFormData((prev) => ({ ...prev, animalId: '' }))
        return
      }

      try {
        const res = await fetch(`/api/animals?clientId=${formData.clientId}`)
        if (res.ok) {
          setAnimals(await res.json())
        }
      } catch (error) {
        console.error('Error fetching animals:', error)
      }
    }

    fetchAnimals()
  }, [formData.clientId])

  const handleSelectSlot = (slotInfo: any) => {
    setSelectedDate(slotInfo.start)
    const hours = String(slotInfo.start.getHours()).padStart(2, '0')
    const minutes = String(slotInfo.start.getMinutes()).padStart(2, '0')
    setFormData((prev) => ({
      ...prev,
      startTime: `${hours}:${minutes}`,
    }))
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.clientId || !formData.animalId || !formData.serviceId || !formData.startTime) {
      toast.error('Tous les champs sont requis')
      return
    }

    if (isSubmitting) return
    setIsSubmitting(true)

    try {
      const [hours, minutes] = formData.startTime.split(':')
      const startDateTime = new Date(selectedDate!)
      startDateTime.setHours(parseInt(hours), parseInt(minutes), 0)

      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: formData.clientId,
          animalId: formData.animalId,
          serviceId: formData.serviceId,
          startTime: startDateTime.toISOString(),
          notes: formData.notes,
        }),
      })

      if (!res.ok) {
        const error = await res.json().catch(() => ({}))
        toast.error(error.message || 'Erreur lors de la création du rendez-vous')
        return
      }

      const newAppointment = await res.json()
      setAppointments([
        ...appointments,
        {
          ...newAppointment,
          start: new Date(newAppointment.startTime),
          end: new Date(newAppointment.endTime),
        },
      ])

      setFormData({
        clientId: '',
        animalId: '',
        serviceId: '',
        startTime: '',
        notes: '',
      })
      setShowForm(false)
      toast.success('Rendez-vous créé!')
    } catch (error) {
      console.error('Error creating appointment:', error)
      toast.error('Une erreur est survenue')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Supprimer un rendez-vous
  const handleDeleteAppointment = async (appointmentId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce rendez-vous ?')) return

    try {
      const res = await fetch(`/api/appointments?id=${appointmentId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setAppointments(appointments.filter(apt => apt.id !== appointmentId))
        setSelectedAppointment(null)
        toast.success('Rendez-vous supprimé')
      } else {
        toast.error('Erreur lors de la suppression')
      }
    } catch (error) {
      console.error('Error deleting appointment:', error)
      toast.error('Une erreur est survenue')
    }
  }

  // Changer le statut d'un rendez-vous
  const handleStatusChange = async (appointmentId: string, newStatus: string, reason?: string) => {
    try {
      const body: any = { status: newStatus }
      if (reason) body.cancellationReason = reason

      const res = await fetch(`/api/appointments?id=${appointmentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        const updated = await res.json()
        setAppointments(appointments.map(apt => 
          apt.id === appointmentId 
            ? { ...updated, start: new Date(updated.startTime), end: new Date(updated.endTime) }
            : apt
        ))
        setSelectedAppointment(null)
        
        const statusLabels: Record<string, string> = {
          confirmed: 'confirmé',
          in_progress: 'démarré',
          completed: 'terminé',
          cancelled: 'annulé',
          no_show: 'marqué comme non-présenté',
        }
        toast.success(`Rendez-vous ${statusLabels[newStatus] || 'mis à jour'}`)
      } else {
        const error = await res.json()
        toast.error(error.message || 'Erreur lors de la mise à jour')
      }
    } catch (error) {
      console.error('Error updating appointment:', error)
      toast.error('Une erreur est survenue')
    }
  }

  // Obtenir la couleur du statut
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      scheduled: 'bg-blue-100 text-blue-700 border-blue-200',
      confirmed: 'bg-green-100 text-green-700 border-green-200',
      in_progress: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      completed: 'bg-gray-100 text-gray-600 border-gray-200',
      cancelled: 'bg-red-100 text-red-700 border-red-200',
      no_show: 'bg-orange-100 text-orange-700 border-orange-200',
    }
    return colors[status] || 'bg-gray-100 text-gray-600'
  }

  // Obtenir le label du statut
  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      scheduled: '📅 Planifié',
      confirmed: '✅ Confirmé',
      in_progress: '🔄 En cours',
      completed: '✔️ Terminé',
      cancelled: '❌ Annulé',
      no_show: '⚠️ Non présenté',
    }
    return labels[status] || status
  }

  // Obtenir la couleur du calendrier par statut
  const getCalendarEventColor = (status: string) => {
    const colors: Record<string, string> = {
      scheduled: '#3b82f6', // blue
      confirmed: '#22c55e', // green
      in_progress: '#eab308', // yellow
      completed: '#6b7280', // gray
      cancelled: '#ef4444', // red
      no_show: '#f97316', // orange
    }
    return colors[status] || '#3b82f6'
  }

  // Gestion du clic sur un événement
  const handleSelectEvent = useCallback((event: any) => {
    setSelectedAppointment(event)
  }, [])

  // Événements formatés pour le calendrier (avec useMemo pour optimisation)
  const calendarEvents = useMemo(() => {
    return appointments
      .filter(apt => apt.startTime && apt.endTime && apt.client && apt.animal)
      .map(apt => ({
        ...apt,
        start: new Date(apt.startTime),
        end: new Date(apt.endTime),
        title: `${apt.client.firstName} ${apt.client.lastName} - ${apt.animal.name}`,
      }))
  }, [appointments])

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-500">Chargement des rendez-vous...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Rendez-vous</h1>
        <Button
          onClick={() => {
            setSelectedDate(new Date())
            setShowForm(!showForm)
          }}
          className="bg-primary hover:bg-primary/90"
        >
          {showForm ? '❌ Annuler' : '➕ Nouveau RDV'}
        </Button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg p-6 border border-gray-200 mb-8">
          <h2 className="text-xl font-semibold mb-4">Créer un rendez-vous</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Client *
                </label>
                <select
                  value={formData.clientId}
                  onChange={(e) =>
                    setFormData({ ...formData, clientId: e.target.value })
                  }
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
                  Animal *
                </label>
                <select
                  value={formData.animalId}
                  onChange={(e) =>
                    setFormData({ ...formData, animalId: e.target.value })
                  }
                  disabled={!formData.clientId}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none disabled:bg-gray-100"
                >
                  <option value="">
                    {formData.clientId
                      ? 'Sélectionner un animal'
                      : 'Choisir un client d\'abord'}
                  </option>
                  {animals.map((animal) => (
                    <option key={animal.id} value={animal.id}>
                      {animal.name} ({animal.species})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Service *
                </label>
                <select
                  value={formData.serviceId}
                  onChange={(e) =>
                    setFormData({ ...formData, serviceId: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                >
                  <option value="">Sélectionner un service</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name} - {service.price}€ ({service.duration}min)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Heure *
                </label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) =>
                    setFormData({ ...formData, startTime: e.target.value })
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
                placeholder="Notes supplémentaires..."
                rows={2}
              />
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50">
              {isSubmitting ? 'Création en cours...' : 'Créer le rendez-vous'}
            </Button>
          </form>
        </div>
      )}

      {/* Modal de détails du rendez-vous */}
      {selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Détails du rendez-vous</h2>
                <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedAppointment.status || 'scheduled')}`}>
                  {getStatusLabel(selectedAppointment.status || 'scheduled')}
                </span>
              </div>
              <button 
                onClick={() => setSelectedAppointment(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-500">Client</span>
                <p className="font-medium">{selectedAppointment.client.firstName} {selectedAppointment.client.lastName}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Animal</span>
                <p className="font-medium">🐾 {selectedAppointment.animal.name}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Service</span>
                <p className="font-medium">{selectedAppointment.service.name} - {selectedAppointment.totalPrice || selectedAppointment.service.price}€</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Date et heure</span>
                <p className="font-medium">
                  {new Date(selectedAppointment.startTime).toLocaleString('fr-FR', {
                    dateStyle: 'full',
                    timeStyle: 'short',
                  })}
                </p>
              </div>
              {selectedAppointment.notes && (
                <div>
                  <span className="text-sm text-gray-500">Notes</span>
                  <p className="font-medium">{selectedAppointment.notes}</p>
                </div>
              )}
              {selectedAppointment.isLateCancel && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <p className="text-sm text-orange-800">
                    ⚠️ Annulation tardive (moins de 24h avant le RDV)
                  </p>
                </div>
              )}
              {selectedAppointment.cancellationReason && (
                <div>
                  <span className="text-sm text-gray-500">Raison d&apos;annulation</span>
                  <p className="text-sm text-red-600">{selectedAppointment.cancellationReason}</p>
                </div>
              )}
            </div>

            {/* Actions selon le statut */}
            <div className="mt-6 space-y-3">
              {(selectedAppointment.status === 'scheduled' || !selectedAppointment.status) && (
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    onClick={() => handleStatusChange(selectedAppointment.id, 'confirmed')}
                    className="bg-green-500 hover:bg-green-600 text-white"
                  >
                    ✅ Confirmer
                  </Button>
                  <Button 
                    onClick={() => {
                      const reason = prompt('Raison de l\'annulation (optionnel):')
                      handleStatusChange(selectedAppointment.id, 'cancelled', reason || undefined)
                    }}
                    className="bg-red-500 hover:bg-red-600 text-white"
                  >
                    ❌ Annuler
                  </Button>
                </div>
              )}

              {selectedAppointment.status === 'confirmed' && (
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    onClick={() => handleStatusChange(selectedAppointment.id, 'in_progress')}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white"
                  >
                    🔄 Démarrer
                  </Button>
                  <Button 
                    onClick={() => handleStatusChange(selectedAppointment.id, 'no_show')}
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    ⚠️ Non présenté
                  </Button>
                </div>
              )}

              {selectedAppointment.status === 'in_progress' && (
                <Button 
                  onClick={() => handleStatusChange(selectedAppointment.id, 'completed')}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  ✔️ Terminer et facturer
                </Button>
              )}

              {['completed', 'cancelled', 'no_show'].includes(selectedAppointment.status || '') && (
                <div className="text-center text-sm text-gray-500 py-2">
                  Ce rendez-vous est terminé et ne peut plus être modifié.
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-4 pt-4 border-t">
              <Button 
                onClick={() => setSelectedAppointment(null)}
                className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                Fermer
              </Button>
              {!['completed', 'cancelled', 'no_show'].includes(selectedAppointment.status || '') && (
                <Button 
                  onClick={() => handleDeleteAppointment(selectedAppointment.id)}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                >
                  🗑️ Supprimer
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <Calendar
          localizer={localizer}
          events={calendarEvents}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 600 }}
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          selectable
          popup
          messages={messages}
          culture="fr"
          views={['month', 'week', 'day', 'agenda']}
          defaultView="month"
          view={currentView}
          onView={(view) => setCurrentView(view as typeof currentView)}
          date={currentDate}
          onNavigate={(date) => setCurrentDate(date)}
          eventPropGetter={(event: any) => ({
            style: {
              backgroundColor: getCalendarEventColor(event.status || 'scheduled'),
              borderRadius: '4px',
              opacity: event.status === 'cancelled' || event.status === 'no_show' ? 0.6 : 0.9,
              color: 'white',
              border: 'none',
              display: 'block',
              cursor: 'pointer',
              textDecoration: event.status === 'cancelled' ? 'line-through' : 'none',
            },
          })}
          dayPropGetter={(date: Date) => {
            const today = new Date()
            if (date.toDateString() === today.toDateString()) {
              return {
                style: {
                  backgroundColor: '#f0f9ff',
                },
              }
            }
            return {}
          }}
        />
      </div>

      {/* Afficher les RDV du jour */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Prochains rendez-vous
        </h2>
        {appointments.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <p className="text-gray-500">Aucun rendez-vous pour le moment</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {appointments
              .filter(apt => apt.status !== 'cancelled' && apt.status !== 'no_show')
              .sort(
                (a, b) =>
                  new Date(a.startTime).getTime() -
                  new Date(b.startTime).getTime()
              )
              .slice(0, 5)
              .map((apt) => (
                <div
                  key={apt.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedAppointment(apt)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">
                          {apt.client.firstName} {apt.client.lastName}
                        </h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(apt.status || 'scheduled')}`}>
                          {getStatusLabel(apt.status || 'scheduled')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        🐾 {apt.animal.name} - {apt.service.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        🕐{' '}
                        {new Date(apt.startTime).toLocaleString('fr-FR', {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-semibold text-primary">
                        {apt.totalPrice || apt.service.price}€
                      </span>
                      {apt.isLateCancel && (
                        <p className="text-xs text-orange-600 mt-1">⚠️ Annulation tardive</p>
                      )}
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
