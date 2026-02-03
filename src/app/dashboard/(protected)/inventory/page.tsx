'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'

interface InventoryItem {
  id: string
  name: string
  description: string | null
  quantity: number
  unit: string
  price: number
  lastRestocked: string
}

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    quantity: '',
    unit: 'ml',
    price: '',
  })

  const units = ['ml', 'l', 'g', 'kg', 'pièces', 'bouteille', 'boîte', 'spray']

  // Charger les stocks
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await fetch('/api/inventory')
        if (res.ok) {
          setItems(await res.json())
        }
      } catch (error) {
        console.error('Error fetching inventory:', error)
        toast.error('Erreur lors du chargement')
      } finally {
        setLoading(false)
      }
    }

    fetchItems()
  }, [])

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      quantity: '',
      unit: 'ml',
      price: '',
    })
    setEditingItem(null)
    setShowForm(false)
  }

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      description: item.description || '',
      quantity: item.quantity.toString(),
      unit: item.unit,
      price: item.price.toString(),
    })
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.quantity || !formData.price) {
      toast.error('Le nom, la quantité et le prix sont requis')
      return
    }

    setIsSubmitting(true)

    try {
      const url = editingItem ? '/api/inventory' : '/api/inventory'
      const method = editingItem ? 'PUT' : 'POST'
      const body = {
        ...(editingItem && { id: editingItem.id }),
        name: formData.name,
        description: formData.description || null,
        quantity: parseInt(formData.quantity),
        unit: formData.unit,
        price: parseFloat(formData.price),
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const error = await res.json().catch(() => ({}))
        toast.error(error.message || `Erreur lors de la ${editingItem ? 'modification' : 'création'}`)
        return
      }

      const newItem = await res.json()

      if (editingItem) {
        setItems(items.map(i => i.id === newItem.id ? newItem : i))
        toast.success('Article modifié!')
      } else {
        setItems([...items, newItem])
        toast.success('Article créé!')
      }

      resetForm()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Une erreur est survenue')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (itemId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) return

    try {
      const res = await fetch(`/api/inventory?id=${itemId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setItems(items.filter(i => i.id !== itemId))
        toast.success('Article supprimé')
      } else {
        toast.error('Erreur lors de la suppression')
      }
    } catch (error) {
      console.error('Error deleting item:', error)
      toast.error('Une erreur est survenue')
    }
  }

  // Calculer le stock total (valeur)
  const totalValue = items.reduce((acc, item) => acc + (item.quantity * item.price), 0)

  // Articles en stock faible (moins de 5)
  const lowStockItems = items.filter(item => item.quantity < 5)

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-500">Chargement des stocks...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Gestion des stocks</h1>
        <Button
          onClick={() => {
            if (showForm && !editingItem) {
              setShowForm(false)
            } else {
              resetForm()
              setShowForm(true)
            }
          }}
          className="bg-primary hover:bg-primary/90"
        >
          {showForm ? '❌ Annuler' : '➕ Nouveau article'}
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Total articles</p>
          <p className="text-3xl font-bold text-primary">{items.length}</p>
        </div>
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Valeur totale du stock</p>
          <p className="text-3xl font-bold text-primary">{totalValue.toFixed(2)}€</p>
        </div>
        <div className={`rounded-lg p-6 border ${lowStockItems.length > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
          <p className={`text-sm ${lowStockItems.length > 0 ? 'text-red-600' : 'text-green-600'} mb-1`}>
            Articles en stock faible
          </p>
          <p className={`text-3xl font-bold ${lowStockItems.length > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {lowStockItems.length}
          </p>
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg p-6 border border-gray-200 mb-8">
          <h2 className="text-xl font-semibold mb-4">
            {editingItem ? 'Modifier l\'article' : 'Ajouter un article'}
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
                  placeholder="Ex: Shampoing pour chien"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prix unitaire (€) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                  placeholder="10.50"
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
                placeholder="Notes sur le produit..."
                rows={2}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantité *
                </label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                  placeholder="10"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unité *
                </label>
                <select
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                >
                  {units.map(unit => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
              </div>
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50">
              {isSubmitting ? 'En cours...' : editingItem ? 'Modifier l\'article' : 'Ajouter l\'article'}
            </Button>
          </form>
        </div>
      )}

      {/* Articles en stock faible */}
      {lowStockItems.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
          <h3 className="font-semibold text-red-900 mb-3">⚠️ Articles en stock faible</h3>
          <div className="grid gap-2">
            {lowStockItems.map(item => (
              <p key={item.id} className="text-sm text-red-700">
                {item.name}: {item.quantity} {item.unit} restant(s)
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Liste des articles */}
      <div className="grid gap-4">
        {items.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <p className="text-gray-500">Aucun article en stock. Ajoutez-en un pour démarrer!</p>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Nom</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Stock</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Prix unitaire</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Valeur totale</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {items.map((item) => (
                    <tr key={item.id} className={item.quantity < 5 ? 'bg-red-50' : ''}>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{item.name}</p>
                          {item.description && (
                            <p className="text-sm text-gray-600">{item.description}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${item.quantity < 5 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                          {item.quantity} {item.unit}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-900">{item.price.toFixed(2)}€</td>
                      <td className="px-6 py-4 text-gray-900 font-medium">
                        {(item.quantity * item.price).toFixed(2)}€
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleEdit(item)}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 text-sm"
                          >
                            ✏️
                          </Button>
                          <Button
                            onClick={() => handleDelete(item.id)}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 text-sm"
                          >
                            🗑️
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
