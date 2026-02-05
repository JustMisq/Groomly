'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ReactNode, useEffect } from 'react'

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { data: session } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (session && !session.user?.isAdmin) {
      router.push('/dashboard')
    }
  }, [session, router])

  if (!session?.user?.isAdmin) {
    return null
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar Admin */}
      <aside className="w-64 bg-gray-900 text-white">
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🛡️</span>
            <span className="text-lg font-bold">Admin Groomly</span>
          </div>
        </div>

        <nav className="p-6 space-y-2">
          <AdminNavLink href="/admin" label="Dashboard" icon="📊" />
          <AdminNavLink href="/admin/users" label="Utilisateurs" icon="👥" />
          <AdminNavLink href="/admin/tickets" label="Support" icon="🎫" />
          <AdminNavLink href="/admin/analytics" label="Analytics" icon="📈" />
          <AdminNavLink href="/admin/logs" label="Logs" icon="📋" />

          <div className="pt-4 mt-4 border-t border-gray-800">
            <AdminNavLink href="/dashboard" label="Retour à Groomly" icon="✂️" />
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}

function AdminNavLink({
  href,
  label,
  icon,
}: {
  href: string
  label: string
  icon: string
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-4 py-2 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors"
    >
      <span className="text-lg">{icon}</span>
      <span>{label}</span>
    </Link>
  )
}
