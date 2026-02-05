'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function ProtectedDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [hasSubscription, setHasSubscription] = useState<boolean | null>(null)
  const hasCheckedRef = useRef(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    }
  }, [status, router])

  // Vérifier si l'utilisateur a une subscription active (une seule fois)
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.id && !hasCheckedRef.current) {
      hasCheckedRef.current = true
      
      const checkSubscription = async () => {
        try {
          console.log('🔵 Vérification subscription pour user:', session?.user?.id)
          const res = await fetch('/api/subscription/check')
          console.log('Response status:', res.status)
          
          if (!res.ok) {
            console.log('❌ API error:', res.status)
            router.replace('/dashboard/subscription')
            return
          }
          
          const data = await res.json()
          console.log('✅ Subscription check result:', data)
          
          if (data.hasActiveSubscription) {
            console.log('✅ Subscription active - affichage du dashboard')
            setHasSubscription(true)
          } else {
            console.log('❌ Pas de subscription - redirection')
            router.replace('/dashboard/subscription')
          }
        } catch (error) {
          console.error('💥 Error checking subscription:', error)
          router.replace('/dashboard/subscription')
        }
      }
      
      checkSubscription()
    }
  }, [status, session?.user?.id, router])

  if (status === 'loading' || hasSubscription === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return null
  }

  if (!hasSubscription) {
    return null
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <span className="text-2xl">✂️</span>
            <span className="text-lg font-bold text-gray-900">Groomly</span>
          </div>
        </div>

        <nav className="p-6 space-y-2">
          <NavLink href="/dashboard" label="Tableau de bord" icon="📊" />
          <NavLink href="/dashboard/salon" label="Mon salon" icon="🏪" />
          <NavLink href="/dashboard/clients" label="Clients" icon="👥" />
          <NavLink href="/dashboard/animals" label="Animaux" icon="🐕" />
          <NavLink href="/dashboard/appointments" label="Rendez-vous" icon="📅" />
          <NavLink href="/dashboard/services" label="Services" icon="✂️" />
          <NavLink href="/dashboard/inventory" label="Stocks" icon="📦" />
          <NavLink href="/dashboard/reports" label="Rapports" icon="📈" />
          
          <div className="pt-4 mt-4 border-t border-gray-200">
            <p className="px-4 text-xs font-semibold text-gray-400 uppercase mb-2">Gestion</p>
            <NavLink href="/dashboard/staff" label="Staff & Logs" icon="👥" />
            <NavLink href="/dashboard/settings" label="Paramètres" icon="⚙️" />
            {session?.user?.isAdmin && (
              <NavLink href="/admin" label="Admin Groomly" icon="🛡️" />
            )}
          </div>
          
          <div className="pt-4 mt-4 border-t border-gray-200">
            <NavLink href="/dashboard/support" label="Support" icon="💬" />
          </div>
        </nav>

        <div className="absolute bottom-0 left-0 w-64 p-6 border-t border-gray-200">
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <p className="text-sm text-gray-600">Connecté en tant que</p>
            <p className="font-semibold text-gray-900">{session?.user?.name}</p>
            <p className="text-xs text-gray-500">{session?.user?.email}</p>
          </div>
          <Button
            onClick={() => signOut({ redirect: true, callbackUrl: '/' })}
            className="w-full bg-red-500 hover:bg-red-600"
          >
            Déconnexion
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}

function NavLink({ href, label, icon }: { href: string; label: string; icon: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
    >
      <span className="text-lg">{icon}</span>
      <span>{label}</span>
    </Link>
  )
}
