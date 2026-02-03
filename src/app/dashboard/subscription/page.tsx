'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'

export default function SubscriptionPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)

  const success = searchParams.get('success')
  const canceled = searchParams.get('canceled')

  // Rediriger vers le dashboard après paiement réussi
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        router.push('/dashboard')
      }, 3000) // Attendre 3 secondes pour voir le message de succès
      
      return () => clearTimeout(timer)
    }
  }, [success, router])

  const handleCheckout = async (priceId: string, planName: string) => {
    setLoading(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      })

      if (!res.ok) {
        toast.error('Erreur lors de la création du paiement')
        return
      }

      const { url } = await res.json()

      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error('Checkout error:', error)
      toast.error('Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Mon Abonnement</h1>

      {success && (
        <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800">
            ✅ Paiement réussi! Votre abonnement est activé. Redirection en cours...
          </p>
        </div>
      )}

      {canceled && (
        <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800">
            ⚠️ Le paiement a été annulé. Vous pouvez réessayer ci-dessous.
          </p>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl">
        {/* Monthly Plan */}
        <div className="bg-white p-8 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Par mois</h2>
          <p className="text-gray-600 mb-6">Parfait pour tester</p>
          
          <div className="mb-6">
            <span className="text-5xl font-bold text-gray-900">15€</span>
            <span className="text-gray-600">/mois</span>
          </div>

          <ul className="space-y-4 mb-8 text-gray-700">
            <li className="flex items-center gap-2">✓ Gestion illimitée de clients</li>
            <li className="flex items-center gap-2">✓ Rendez-vous et calendrier</li>
            <li className="flex items-center gap-2">✓ Gestion des stocks</li>
            <li className="flex items-center gap-2">✓ Paiements Stripe</li>
            <li className="flex items-center gap-2">✓ Support par email</li>
          </ul>

          <Button
            onClick={() =>
              handleCheckout(
                process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY || '',
                'Mensuel'
              )
            }
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90"
          >
            {loading ? 'Redirection...' : 'S&apos;abonner'}
          </Button>
        </div>

        {/* Yearly Plan */}
        <div className="bg-gradient-to-br from-primary to-secondary p-8 rounded-lg border border-transparent shadow-lg relative">
          <div className="absolute top-4 right-4 bg-white text-primary px-3 py-1 rounded-full text-sm font-semibold">
            -17% d&apos;économies
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">Par an</h2>
          <p className="text-white/80 mb-6">Meilleure offre</p>

          <div className="mb-6">
            <span className="text-5xl font-bold text-white">150€</span>
            <span className="text-white/80">/an</span>
          </div>

          <ul className="space-y-4 mb-8 text-white">
            <li className="flex items-center gap-2">✓ Gestion illimitée de clients</li>
            <li className="flex items-center gap-2">✓ Rendez-vous et calendrier</li>
            <li className="flex items-center gap-2">✓ Gestion des stocks</li>
            <li className="flex items-center gap-2">✓ Paiements Stripe</li>
            <li className="flex items-center gap-2">✓ Support prioritaire</li>
          </ul>

          <Button
            onClick={() =>
              handleCheckout(
                process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_YEARLY || '',
                'Annuel'
              )
            }
            disabled={loading}
            className="w-full bg-white text-primary hover:bg-gray-100"
          >
            {loading ? 'Redirection...' : 'S&apos;abonner'}
          </Button>
        </div>
      </div>
    </div>
  )
}
