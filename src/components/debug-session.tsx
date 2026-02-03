'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'

export default function DebugSessionInfo() {
  const { data: session, status } = useSession()

  if (status !== 'authenticated' || !session?.user?.email) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 bg-blue-100 border-2 border-blue-500 rounded-lg p-3 text-xs max-w-xs">
      <p className="font-bold text-blue-900">👤 Connecté en tant que:</p>
      <p className="text-blue-800 truncate">{session.user.email}</p>
      <p className="text-blue-700 text-xs mt-1">ID: {session.user.id?.slice(0, 8)}...</p>
    </div>
  )
}
