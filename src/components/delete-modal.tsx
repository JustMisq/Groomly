'use client'

import { useState } from 'react'
import { Button } from './ui/button'

interface DeleteModalProps {
  isOpen: boolean
  title: string
  message: string
  confirmText: string
  warningText: string
  requirePassword?: boolean
  onConfirm: (password?: string) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
  isDangerous?: boolean
}

export function DeleteModal({
  isOpen,
  title,
  message,
  confirmText,
  warningText,
  requirePassword = false,
  onConfirm,
  onCancel,
  isLoading = false,
  isDangerous = false,
}: DeleteModalProps) {
  const [password, setPassword] = useState('')
  const [confirmInput, setConfirmInput] = useState('')
  const [passwordError, setPasswordError] = useState('')

  if (!isOpen) return null

  const handleConfirm = async () => {
    // Vérifier le mot de passe si requis
    if (requirePassword && !password) {
      setPasswordError('Veuillez entrer votre mot de passe')
      return
    }

    // Vérifier le texte de confirmation pour les actions très dangereuses
    if (isDangerous && confirmInput !== 'SUPPRIMER DÉFINITIVEMENT') {
      setPasswordError('Texte de confirmation incorrect')
      return
    }

    try {
      await onConfirm(password || undefined)
      // Réinitialiser le formulaire
      setPassword('')
      setConfirmInput('')
      setPasswordError('')
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleCancel = () => {
    setPassword('')
    setConfirmInput('')
    setPasswordError('')
    onCancel()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full mx-4 p-6">
        {/* En-tête */}
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        </div>

        {/* Message */}
        <div className="mb-6">
          <p className="text-gray-600 whitespace-pre-line">{message}</p>
        </div>

        {/* Avertissement */}
        <div className={`p-4 rounded-lg mb-6 ${isDangerous ? 'bg-red-50 border border-red-200' : 'bg-yellow-50 border border-yellow-200'}`}>
          <p className={`text-sm font-medium ${isDangerous ? 'text-red-800' : 'text-yellow-800'}`}>
            ⚠️ {warningText}
          </p>
        </div>

        {/* Formulaire */}
        <div className="space-y-4 mb-6">
          {/* Confirmation texte pour actions très dangereuses */}
          {isDangerous && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tapez "{confirmText}" pour confirmer :
              </label>
              <input
                type="text"
                value={confirmInput}
                onChange={(e) => {
                  setConfirmInput(e.target.value)
                  setPasswordError('')
                }}
                placeholder="SUPPRIMER DÉFINITIVEMENT"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none font-mono text-sm"
              />
            </div>
          )}

          {/* Mot de passe */}
          {requirePassword && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setPasswordError('')
                }}
                placeholder="Entrez votre mot de passe"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
          )}

          {/* Message d'erreur */}
          {passwordError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{passwordError}</p>
            </div>
          )}
        </div>

        {/* Boutons */}
        <div className="flex gap-3">
          <Button
            onClick={handleCancel}
            disabled={isLoading}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900"
          >
            Annuler
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading || (isDangerous && confirmInput !== 'SUPPRIMER DÉFINITIVEMENT') || (requirePassword && !password)}
            className={`flex-1 font-bold ${isDangerous ? 'bg-red-700 hover:bg-red-800 text-white' : 'bg-orange-600 hover:bg-orange-700 text-white'}`}
          >
            {isLoading ? 'Traitement...' : 'Confirmer'}
          </Button>
        </div>
      </div>
    </div>
  )
}
