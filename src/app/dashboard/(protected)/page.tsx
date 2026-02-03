'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import SalonCheckBanner from '@/components/salon-check-banner'
import AdvancedStats from '@/components/advanced-stats'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

export default function DashboardPage() {
  const { data: session } = useSession()
  const [todayAppointments, setTodayAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showDemoModal, setShowDemoModal] = useState(false)
  const [generatingDemo, setGeneratingDemo] = useState(false)

  useEffect(() => {
    fetchTodayAppointments()
  }, [])

  const fetchTodayAppointments = async () => {
    try {
      const today = new Date()
      const start = new Date(today.getFullYear(), today.getMonth(), today.getDate())
      const end = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59)
      
      const res = await fetch(`/api/appointments?from=${start.toISOString()}&to=${end.toISOString()}`)
      if (res.ok) {
        const data = await res.json()
        setTodayAppointments(data.filter((apt: any) => 
          apt.status !== 'cancelled' && apt.status !== 'no_show'
        ))
      }
    } catch (error) {
      console.error('Error fetching appointments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateDemo = async () => {
    setGeneratingDemo(true)
    try {
      const res = await fetch('/api/demo-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ force: true }),
      })
      
      if (res.ok) {
        const data = await res.json()
        toast.success(`Données démo générées : ${data.clients} clients, ${data.appointments} RDV`)
        setShowDemoModal(false)
        window.location.reload()
      } else {
        const error = await res.json()
        toast.error(error.message || 'Erreur lors de la génération')
      }
    } catch (error) {
      toast.error('Une erreur est survenue')
    } finally {
      setGeneratingDemo(false)
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      scheduled: 'bg-blue-100 text-blue-700',
      confirmed: 'bg-green-100 text-green-700',
      in_progress: 'bg-yellow-100 text-yellow-700',
      completed: 'bg-gray-100 text-gray-700',
    }
    return colors[status] || 'bg-gray-100 text-gray-600'
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      scheduled: 'Planifié',
      confirmed: 'Confirmé',
      in_progress: 'En cours',
      completed: 'Terminé',
    }
    return labels[status] || status
  }

  return (
    <div className="p-8">
      <SalonCheckBanner />
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Bonjour, {session?.user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-gray-600 mt-1">
            {new Date().toLocaleDateString('fr-FR', { 
              weekday: 'long', 
              day: 'numeric', 
              month: 'long', 
              year: 'numeric' 
            })}
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-3">
          <Link href="/dashboard/appointments">
            <Button className="bg-primary hover:bg-primary/90">
              ➕ Nouveau RDV
            </Button>
          </Link>
          <button
            onClick={() => setShowDemoModal(true)}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            🎭 Mode démo
          </button>
        </div>
      </div>

      {/* RDV du jour */}
      {!loading && todayAppointments.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-8 border border-blue-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              📅 Aujourd&apos;hui - {todayAppointments.length} rendez-vous
            </h2>
            <Link href="/dashboard/appointments" className="text-sm text-primary hover:underline">
              Voir tout →
            </Link>
          </div>
          <div className="grid gap-3">
            {todayAppointments.slice(0, 4).map((apt) => (
              <div 
                key={apt.id} 
                className="bg-white rounded-lg p-4 flex items-center justify-between shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="text-center bg-gray-100 rounded-lg px-3 py-2 min-w-[60px]">
                    <p className="text-lg font-bold text-gray-900">
                      {new Date(apt.startTime).toLocaleTimeString('fr-FR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {apt.client?.firstName} {apt.client?.lastName}
                    </p>
                    <p className="text-sm text-gray-600">
                      🐾 {apt.animal?.name} • {apt.service?.name}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(apt.status)}`}>
                    {getStatusLabel(apt.status)}
                  </span>
                  <span className="font-semibold text-primary">
                    {apt.totalPrice?.toFixed(2) || apt.service?.price?.toFixed(2)}€
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats avancées */}
      <AdvancedStats />

      {/* Actions rapides */}
      <div className="mt-8 grid md:grid-cols-3 gap-4">
        <Link href="/dashboard/clients">
          <div className="bg-white rounded-lg p-5 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center gap-3">
              <span className="text-3xl">👥</span>
              <div>
                <p className="font-semibold text-gray-900">Clients</p>
                <p className="text-sm text-gray-500">Gérer les fiches clients</p>
              </div>
            </div>
          </div>
        </Link>
        <Link href="/dashboard/services">
          <div className="bg-white rounded-lg p-5 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center gap-3">
              <span className="text-3xl">✂️</span>
              <div>
                <p className="font-semibold text-gray-900">Services</p>
                <p className="text-sm text-gray-500">Configurer les prestations</p>
              </div>
            </div>
          </div>
        </Link>
        <Link href="/dashboard/reports">
          <div className="bg-white rounded-lg p-5 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center gap-3">
              <span className="text-3xl">📊</span>
              <div>
                <p className="font-semibold text-gray-900">Factures</p>
                <p className="text-sm text-gray-500">Suivi des paiements</p>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Modal démo */}
      {showDemoModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">🎭 Mode Démo</h2>
            <p className="text-gray-600 mb-4">
              Générer des données fictives pour explorer toutes les fonctionnalités de Groomly ?
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
              <p className="text-sm text-yellow-800">
                ⚠️ Cette action va créer des clients, animaux, rendez-vous et factures fictifs.
                Vos données existantes seront conservées.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDemoModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <Button
                onClick={handleGenerateDemo}
                disabled={generatingDemo}
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                {generatingDemo ? 'Génération...' : 'Générer les données'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
