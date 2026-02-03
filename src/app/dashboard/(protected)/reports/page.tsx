'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface Invoice {
  id: string
  invoiceNumber: string
  subtotal: number
  taxRate: number
  taxAmount: number
  total: number
  status: string
  paidAt: string | null
  createdAt: string
  client: {
    firstName: string
    lastName: string
  }
  appointment: {
    startTime: string
  } | null
}

export default function ReportsPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('all')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })

  // Charger les factures
  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const res = await fetch('/api/invoices')
        if (res.ok) {
          setInvoices(await res.json())
        }
      } catch (error) {
        console.error('Error fetching invoices:', error)
        toast.error('Erreur lors du chargement')
      } finally {
        setLoading(false)
      }
    }

    fetchInvoices()
  }, [])

  // Filtrer les factures
  const filteredInvoices = invoices.filter(invoice => {
    if (filterStatus !== 'all' && invoice.status !== filterStatus) return false
    
    if (dateRange.start) {
      const invoiceDate = new Date(invoice.createdAt)
      const startDate = new Date(dateRange.start)
      if (invoiceDate < startDate) return false
    }
    
    if (dateRange.end) {
      const invoiceDate = new Date(invoice.createdAt)
      const endDate = new Date(dateRange.end)
      if (invoiceDate > endDate) return false
    }
    
    return true
  })

  // Calculer les statistiques
  const stats = {
    totalInvoices: filteredInvoices.length,
    totalHT: filteredInvoices.reduce((acc, inv) => acc + inv.subtotal, 0),
    totalTax: filteredInvoices.reduce((acc, inv) => acc + inv.taxAmount, 0),
    totalTTC: filteredInvoices.reduce((acc, inv) => acc + inv.total, 0),
    paidAmount: filteredInvoices
      .filter(inv => inv.status === 'paid')
      .reduce((acc, inv) => acc + inv.total, 0),
    pendingAmount: filteredInvoices
      .filter(inv => inv.status !== 'paid' && inv.status !== 'cancelled')
      .reduce((acc, inv) => acc + inv.total, 0),
  }

  const handleStatusChange = async (invoiceId: string, newStatus: string) => {
    try {
      const res = await fetch('/api/invoices', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: invoiceId,
          status: newStatus,
        }),
      })

      if (res.ok) {
        const updated = await res.json()
        setInvoices(invoices.map(inv => inv.id === invoiceId ? updated : inv))
        toast.success('Facture mise à jour')
      } else {
        toast.error('Erreur lors de la mise à jour')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Une erreur est survenue')
    }
  }

  const handleDelete = async (invoiceId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette facture ?')) return

    try {
      const res = await fetch(`/api/invoices?id=${invoiceId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setInvoices(invoices.filter(inv => inv.id !== invoiceId))
        toast.success('Facture supprimée')
      } else {
        toast.error('Erreur lors de la suppression')
      }
    } catch (error) {
      console.error('Error deleting invoice:', error)
      toast.error('Une erreur est survenue')
    }
  }

  const exportCSV = () => {
    const csv = [
      ['Numéro', 'Client', 'HT', 'TVA', 'TTC', 'Statut', 'Date'],
      ...filteredInvoices.map(inv => [
        inv.invoiceNumber,
        `${inv.client.firstName} ${inv.client.lastName}`,
        inv.subtotal.toFixed(2),
        inv.taxAmount.toFixed(2),
        inv.total.toFixed(2),
        inv.status,
        new Date(inv.createdAt).toLocaleDateString('fr-FR'),
      ]),
    ]
      .map(row => row.join(','))
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `rapports-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  const exportAccounting = async (format: 'csv' | 'fec') => {
    try {
      const params = new URLSearchParams({ format })
      if (dateRange.start) params.append('startDate', dateRange.start)
      if (dateRange.end) params.append('endDate', dateRange.end)
      
      const res = await fetch(`/api/export/accounting?${params}`)
      if (!res.ok) {
        toast.error('Erreur lors de l\'export')
        return
      }

      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `export-comptable-${format}-${new Date().toISOString().split('T')[0]}.${format === 'fec' ? 'txt' : 'csv'}`
      a.click()
      toast.success(`Export ${format.toUpperCase()} téléchargé`)
    } catch (error) {
      toast.error('Erreur lors de l\'export')
    }
  }

  const downloadPDF = async (invoiceId: string, invoiceNumber: string) => {
    try {
      const res = await fetch(`/api/invoices/${invoiceId}/pdf`)
      if (!res.ok) {
        toast.error('Erreur lors de la génération du PDF')
        return
      }

      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `facture-${invoiceNumber}.html`
      a.click()
      toast.success('Facture téléchargée')
    } catch (error) {
      toast.error('Erreur lors du téléchargement')
    }
  }

  const openPDFPreview = (invoiceId: string) => {
    window.open(`/api/invoices/${invoiceId}/pdf`, '_blank')
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-500">Chargement des rapports...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">📊 Rapports & Factures</h1>
        <div className="flex gap-3 flex-wrap">
          <Link href="/dashboard/appointments">
            <Button className="bg-green-500 hover:bg-green-600 text-white">
              ➕ Créer une facture
            </Button>
          </Link>
          <Button
            onClick={exportCSV}
            disabled={filteredInvoices.length === 0}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            📥 Exporter CSV
          </Button>
          <div className="relative group">
            <Button
              disabled={filteredInvoices.length === 0}
              className="bg-indigo-500 hover:bg-indigo-600 text-white"
            >
              📋 Export comptable ▾
            </Button>
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
              <button
                onClick={() => exportAccounting('csv')}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 rounded-t-lg"
              >
                📄 Format CSV (Excel)
              </button>
              <button
                onClick={() => exportAccounting('fec')}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 rounded-b-lg"
              >
                🏛️ Format FEC (Comptable)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Total HT</p>
          <p className="text-3xl font-bold text-primary">{stats.totalHT.toFixed(2)}€</p>
          <p className="text-xs text-gray-500 mt-2">{stats.totalInvoices} facture(s)</p>
        </div>
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Montant Payé</p>
          <p className="text-3xl font-bold text-green-600">{stats.paidAmount.toFixed(2)}€</p>
          <p className="text-xs text-gray-500 mt-2">Statut "Payé"</p>
        </div>
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">En attente</p>
          <p className="text-3xl font-bold text-orange-600">{stats.pendingAmount.toFixed(2)}€</p>
          <p className="text-xs text-gray-500 mt-2">À recevoir</p>
        </div>
      </div>

      {/* Détails TVA */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
        <h3 className="font-semibold text-blue-900 mb-4">Détails Fiscaux</h3>
        <div className="grid md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-blue-600">Total HT</p>
            <p className="text-2xl font-bold text-blue-900">{stats.totalHT.toFixed(2)}€</p>
          </div>
          <div>
            <p className="text-sm text-blue-600">TVA (20%)</p>
            <p className="text-2xl font-bold text-blue-900">{stats.totalTax.toFixed(2)}€</p>
          </div>
          <div>
            <p className="text-sm text-blue-600">Total TTC</p>
            <p className="text-2xl font-bold text-blue-900">{stats.totalTTC.toFixed(2)}€</p>
          </div>
          <div>
            <p className="text-sm text-blue-600">Taux moyen</p>
            <p className="text-2xl font-bold text-blue-900">20%</p>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
        <h3 className="font-semibold text-gray-900 mb-4">Filtres</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Statut
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
            >
              <option value="all">Tous</option>
              <option value="draft">Brouillon</option>
              <option value="sent">Envoyée</option>
              <option value="paid">Payée</option>
              <option value="cancelled">Annulée</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date de début
            </label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date de fin
            </label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
            />
          </div>
        </div>
      </div>

      {/* Liste des factures */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {filteredInvoices.length === 0 ? (
          <div className="p-12 text-center bg-gradient-to-br from-blue-50 to-indigo-50">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">📄 Aucune facture pour le moment</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Les factures sont créées automatiquement lorsque vous planifiez un rendez-vous avec un client.
            </p>
            <div className="space-y-3">
              <p className="text-sm text-gray-600 font-medium">Voici comment faire :</p>
              <ol className="text-left inline-block space-y-2 text-sm text-gray-600">
                <li>1️⃣ Allez à <strong>Rendez-vous</strong></li>
                <li>2️⃣ Créez un nouveau rendez-vous</li>
                <li>3️⃣ Sélectionnez le client, l&apos;animal et le service</li>
                <li>4️⃣ Confirmez - une facture sera créée automatiquement</li>
              </ol>
            </div>
            <Link href="/dashboard/appointments" className="mt-8 inline-block">
              <Button className="bg-green-500 hover:bg-green-600 text-white px-6">
                📅 Aller aux rendez-vous →
              </Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Facture</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Client</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Date</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">HT</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">TVA</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">TTC</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Statut</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{invoice.invoiceNumber}</td>
                    <td className="px-6 py-4">
                      <p className="text-gray-900">
                        {invoice.client.firstName} {invoice.client.lastName}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(invoice.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 text-right text-gray-900">
                      {invoice.subtotal.toFixed(2)}€
                    </td>
                    <td className="px-6 py-4 text-right text-gray-900">
                      {invoice.taxAmount.toFixed(2)}€
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-primary">
                      {invoice.total.toFixed(2)}€
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={invoice.status}
                        onChange={(e) => handleStatusChange(invoice.id, e.target.value)}
                        className={`px-3 py-1 rounded-full text-sm font-medium border-0 outline-none cursor-pointer ${
                          invoice.status === 'paid'
                            ? 'bg-green-100 text-green-700'
                            : invoice.status === 'cancelled'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        <option value="draft">Brouillon</option>
                        <option value="sent">Envoyée</option>
                        <option value="paid">Payée</option>
                        <option value="cancelled">Annulée</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openPDFPreview(invoice.id)}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200 transition-colors"
                          title="Voir la facture"
                        >
                          👁️
                        </button>
                        <button
                          onClick={() => downloadPDF(invoice.id, invoice.invoiceNumber)}
                          className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200 transition-colors"
                          title="Télécharger PDF"
                        >
                          📄
                        </button>
                        <button
                          onClick={() => handleDelete(invoice.id)}
                          className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200 transition-colors"
                          title="Supprimer"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
