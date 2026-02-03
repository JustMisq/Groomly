'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'

export default function SalonPage() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'general' | 'legal'>('general')
  const [salon, setSalon] = useState({
    name: '',
    description: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    email: '',
    // Informations légales
    siret: '',
    tvaNumber: '',
    legalName: '',
    legalForm: '',
    invoiceTerms: '',
    invoiceNotes: '',
  })

  useEffect(() => {
    fetchSalon()
  }, [])

  const fetchSalon = async () => {
    try {
      const res = await fetch('/api/salon')
      if (res.ok) {
        const data = await res.json()
        setSalon({
          name: data.name || '',
          description: data.description || '',
          phone: data.phone || '',
          address: data.address || '',
          city: data.city || '',
          postalCode: data.postalCode || '',
          email: data.email || '',
          siret: data.siret || '',
          tvaNumber: data.tvaNumber || '',
          legalName: data.legalName || '',
          legalForm: data.legalForm || '',
          invoiceTerms: data.invoiceTerms || '',
          invoiceNotes: data.invoiceNotes || '',
        })
      }
    } catch (error) {
      console.error('Error fetching salon:', error)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setSalon(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/salon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(salon),
      })

      if (!res.ok) {
        toast.error('Erreur lors de la sauvegarde')
        return
      }

      toast.success('Salon mis à jour avec succès!')
    } catch (error) {
      toast.error('Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  const legalFormOptions = [
    { value: '', label: 'Sélectionner...' },
    { value: 'auto-entrepreneur', label: 'Auto-entrepreneur / Micro-entreprise' },
    { value: 'eurl', label: 'EURL' },
    { value: 'sarl', label: 'SARL' },
    { value: 'sasu', label: 'SASU' },
    { value: 'sas', label: 'SAS' },
    { value: 'ei', label: 'Entreprise Individuelle' },
    { value: 'eirl', label: 'EIRL' },
    { value: 'association', label: 'Association' },
    { value: 'autre', label: 'Autre' },
  ]

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Mon Salon</h1>
      <p className="text-gray-600 mb-8">Gérez les informations de votre établissement</p>

      {/* Onglets */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit mb-8">
        <button
          onClick={() => setActiveTab('general')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'general'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          🏪 Informations générales
        </button>
        <button
          onClick={() => setActiveTab('legal')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'legal'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          📋 Informations légales
        </button>
      </div>

      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-lg shadow p-6">
          
          {activeTab === 'general' && (
            <>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom du salon *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={salon.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                    placeholder="Mon Salon de Toilettage"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={salon.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                    placeholder="contact@salon.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={salon.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                    placeholder="01 23 45 67 89"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ville
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={salon.city}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                    placeholder="Paris"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Code Postal
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    value={salon.postalCode}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                    placeholder="75001"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse
                </label>
                <input
                  type="text"
                  name="address"
                  value={salon.address}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                  placeholder="123 rue de la Paix"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={salon.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition resize-none"
                  placeholder="Décrivez votre salon..."
                />
              </div>
            </>
          )}

          {activeTab === 'legal' && (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800">
                  💡 Ces informations apparaîtront sur vos factures et documents officiels.
                  Assurez-vous qu&apos;elles sont exactes pour la conformité légale.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Raison sociale
                  </label>
                  <input
                    type="text"
                    name="legalName"
                    value={salon.legalName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                    placeholder="Ex: SARL Mon Salon"
                  />
                  <p className="text-xs text-gray-500 mt-1">Nom officiel de votre entreprise</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Forme juridique
                  </label>
                  <select
                    name="legalForm"
                    value={salon.legalForm}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                  >
                    {legalFormOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Numéro SIRET
                  </label>
                  <input
                    type="text"
                    name="siret"
                    value={salon.siret}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                    placeholder="123 456 789 00012"
                    maxLength={17}
                  />
                  <p className="text-xs text-gray-500 mt-1">14 chiffres (SIREN + NIC)</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Numéro TVA intracommunautaire
                  </label>
                  <input
                    type="text"
                    name="tvaNumber"
                    value={salon.tvaNumber}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                    placeholder="FR 12 345678901"
                  />
                  <p className="text-xs text-gray-500 mt-1">Laissez vide si non assujetti à la TVA</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Conditions de paiement (factures)
                </label>
                <textarea
                  name="invoiceTerms"
                  value={salon.invoiceTerms}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition resize-none"
                  placeholder="Ex: Paiement à réception. En cas de retard de paiement, une pénalité de 3 fois le taux d'intérêt légal sera appliquée..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes de bas de facture
                </label>
                <textarea
                  name="invoiceNotes"
                  value={salon.invoiceNotes}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition resize-none"
                  placeholder="Ex: Merci pour votre confiance !"
                />
              </div>

              {/* Prévisualisation */}
              {(salon.siret || salon.legalName) && (
                <div className="border-t pt-6 mt-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">📄 Aperçu sur vos factures :</h3>
                  <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600 space-y-1">
                    <p className="font-medium">{salon.legalName || salon.name}</p>
                    {salon.legalForm && <p>{legalFormOptions.find(o => o.value === salon.legalForm)?.label}</p>}
                    {salon.address && <p>{salon.address}</p>}
                    {(salon.postalCode || salon.city) && <p>{salon.postalCode} {salon.city}</p>}
                    {salon.siret && <p>SIRET : {salon.siret}</p>}
                    {salon.tvaNumber && <p>TVA : {salon.tvaNumber}</p>}
                    {!salon.tvaNumber && <p className="italic">TVA non applicable, art. 293 B du CGI</p>}
                  </div>
                </div>
              )}
            </>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90"
          >
            {loading ? 'Sauvegarde en cours...' : 'Sauvegarder'}
          </Button>
        </form>
      </div>
    </div>
  )
}
