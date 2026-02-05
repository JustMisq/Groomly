import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="border-b border-gray-200 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">✂️</span>
            <span className="text-xl font-bold text-gray-900">Groomly</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/auth/login" className="text-gray-600 hover:text-gray-900">
              Connexion
            </Link>
            <Link href="/auth/register">
              <Button className="bg-primary hover:bg-primary/90">
                Créer un compte
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Contenu légal */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {children}
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white mt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <p className="font-semibold text-gray-900 mb-4">Groomly</p>
              <p className="text-sm text-gray-600">Plateforme SaaS pour les toiletteurs au Portugal</p>
            </div>
            <div>
              <p className="font-semibold text-gray-900 mb-4">Légal</p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li><Link href="/legal/privacy" className="hover:text-primary">Politique de confidentialité</Link></li>
                <li><Link href="/legal/terms" className="hover:text-primary">Conditions d'utilisation</Link></li>
                <li><Link href="/legal/mentions" className="hover:text-primary">Mentions légales</Link></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-gray-900 mb-4">Données</p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li><Link href="/legal/gdpr" className="hover:text-primary">RGPD/LPDP</Link></li>
                <li><Link href="/legal/cookies" className="hover:text-primary">Politique Cookies</Link></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-gray-900 mb-4">Contact</p>
              <p className="text-sm text-gray-600">contact@groomly.pt</p>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-8 text-sm text-gray-600 text-center">
            <p>&copy; 2026 Groomly Portugal. Tous droits réservés.</p>
            <p className="mt-2">Plateforme conforme à la loi portugaise - LPDP, IVA, Droit du Consommateur</p>
          </div>
        </div>
      </footer>
    </main>
  )
}
