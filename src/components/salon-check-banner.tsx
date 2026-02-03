'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

export default function SalonCheckBanner() {
  const { data: session } = useSession()
  const [hasSalon, setHasSalon] = useState<boolean | null>(null)

  useEffect(() => {
    if (session?.user?.id) {
      checkSalon()
    }
  }, [session?.user?.id])

  const checkSalon = async () => {
    try {
      const res = await fetch('/api/salon')
      setHasSalon(res.ok)
    } catch {
      setHasSalon(false)
    }
  }

  if (hasSalon === null || hasSalon === true) {
    return null
  }

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <span className="text-2xl">⚠️</span>
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium text-yellow-800">
            Bienvenue! Avant de continuer, vous devez créer votre salon.
          </p>
          <p className="mt-2 text-sm text-yellow-700">
            Cliquez sur 
            <Link href="/dashboard/salon" className="font-semibold underline ml-1 mr-1">
              Salon
            </Link>
            pour créer votre salon de toilettage.
          </p>
        </div>
      </div>
    </div>
  )
}
