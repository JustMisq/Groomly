'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'

interface AnimalHealthData {
  temperament?: string | null
  allergies?: string | null
  healthNotes?: string | null
  groomingNotes?: string | null
  weight?: number | null
}

interface AnimalHealthFormProps {
  animalId: string
  initialData?: AnimalHealthData
  onUpdate?: (data: AnimalHealthData) => void
  readOnly?: boolean
}

const TEMPERAMENT_OPTIONS = [
  { value: 'calm', label: '😊 Calme', color: 'bg-green-100 text-green-800' },
  { value: 'anxious', label: '😰 Anxieux', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'playful', label: '🎾 Joueur', color: 'bg-blue-100 text-blue-800' },
  { value: 'aggressive', label: '😾 Agressif', color: 'bg-red-100 text-red-800' },
  { value: 'mixed', label: '🔄 Variable', color: 'bg-gray-100 text-gray-800' },
]

export function AnimalHealthForm({ animalId, initialData, onUpdate, readOnly = false }: AnimalHealthFormProps) {
  const [data, setData] = useState<AnimalHealthData>(initialData || {})
  const [saving, setSaving] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/animals/${animalId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (res.ok) {
        toast.success('Fiche santé mise à jour')
        onUpdate?.(data)
      } else {
        toast.error('Erreur lors de la sauvegarde')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Une erreur est survenue')
    } finally {
      setSaving(false)
    }
  }

  const hasData = data.temperament || data.allergies || data.healthNotes || data.groomingNotes || data.weight

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header cliquable */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">🏥</span>
          <span className="font-medium text-gray-900">Fiche santé & comportement</span>
          {hasData && (
            <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">
              Renseignée
            </span>
          )}
        </div>
        <span className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>

      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Tempérament */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tempérament
            </label>
            <div className="flex flex-wrap gap-2">
              {TEMPERAMENT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  disabled={readOnly}
                  onClick={() => setData({ ...data, temperament: option.value })}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    data.temperament === option.value
                      ? `${option.color} ring-2 ring-offset-1 ring-gray-400`
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  } ${readOnly ? 'cursor-not-allowed opacity-60' : ''}`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Poids */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Poids (kg)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="200"
              value={data.weight || ''}
              onChange={(e) => setData({ ...data, weight: e.target.value ? parseFloat(e.target.value) : null })}
              disabled={readOnly}
              className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100"
              placeholder="ex: 12.5"
            />
          </div>

          {/* Allergies */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ⚠️ Allergies connues
            </label>
            <input
              type="text"
              value={data.allergies || ''}
              onChange={(e) => setData({ ...data, allergies: e.target.value })}
              disabled={readOnly}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100"
              placeholder="ex: Allergie aux parfums, sensibilité shampooing..."
            />
          </div>

          {/* Notes santé */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              💊 Contraintes santé
            </label>
            <textarea
              value={data.healthNotes || ''}
              onChange={(e) => setData({ ...data, healthNotes: e.target.value })}
              disabled={readOnly}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 resize-none"
              placeholder="ex: Arthrose pattes arrières, problèmes de peau, opération récente..."
            />
            <p className="text-xs text-gray-500 mt-1">
              Informations non médicales utiles pour le toilettage
            </p>
          </div>

          {/* Notes toilettage */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ✂️ Préférences toilettage
            </label>
            <textarea
              value={data.groomingNotes || ''}
              onChange={(e) => setData({ ...data, groomingNotes: e.target.value })}
              disabled={readOnly}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 resize-none"
              placeholder="ex: Coupe spéciale oreilles, zones sensibles, ne pas toucher la queue..."
            />
          </div>

          {/* Actions */}
          {!readOnly && (
            <div className="flex justify-end pt-2 border-t border-gray-100">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-primary hover:bg-primary/90"
              >
                {saving ? 'Sauvegarde...' : 'Enregistrer'}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Badge récapitulatif pour affichage dans les listes
export function AnimalHealthBadges({ data }: { data: AnimalHealthData }) {
  const temperament = TEMPERAMENT_OPTIONS.find(t => t.value === data.temperament)
  
  return (
    <div className="flex flex-wrap gap-1">
      {temperament && (
        <span className={`px-2 py-0.5 rounded text-xs font-medium ${temperament.color}`}>
          {temperament.label}
        </span>
      )}
      {data.allergies && (
        <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
          ⚠️ Allergies
        </span>
      )}
      {data.healthNotes && (
        <span className="px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
          💊 Contraintes
        </span>
      )}
      {data.weight && (
        <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
          {data.weight} kg
        </span>
      )}
    </div>
  )
}
