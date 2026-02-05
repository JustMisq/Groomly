import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">✂️</span>
            <span className="text-xl font-bold text-gray-900">Groomly</span>
          </div>
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

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Gérez votre salon de toilettage simplement
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Groomly vous aide à gérer vos clients, animaux, rendez-vous et paiements en un seul endroit.
            Commencez gratuitement, pas de carte bancaire requise.
          </p>
          <Link href="/auth/register">
            <Button className="bg-primary hover:bg-primary/90 px-8 py-3 text-lg">
              Démarrer maintenant
            </Button>
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 my-16">
          {[
            {
              title: "Gestion des clients",
              description: "Centralisez toutes les informations de vos clients et leurs animaux",
              icon: "👥",
            },
            {
              title: "Rendez-vous simplifié",
              description: "Calendrier intuitif et rappels automatiques pour vos clients",
              icon: "📅",
            },
            {
              title: "Paiements sécurisés",
              description: "Intégration Stripe pour des paiements rapides et sécurisés",
              icon: "💳",
            },
            {
              title: "Gestion des stocks",
              description: "Suivez vos produits et matériels de toilettage",
              icon: "📦",
            },
            {
              title: "Portfolio photos",
              description: "Mettez en avant vos plus beaux toilettages",
              icon: "📸",
            },
            {
              title: "Accès mobile",
              description: "Gérez votre salon depuis votre téléphone, partout",
              icon: "📱",
            },
          ].map((feature) => (
            <div key={feature.title} className="p-6 border border-gray-200 rounded-lg hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Tarification simple et transparente
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            {/* Monthly Plan */}
            <div className="bg-white p-8 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Par mois</h3>
              <p className="text-gray-600 mb-6">Parfait pour tester</p>
              <div className="mb-6">
                <span className="text-5xl font-bold text-gray-900">18,45€</span>
                <span className="text-gray-600">/mois TTC</span>
                <p className="text-xs text-gray-500 mt-2">15€ HT + 23% IVA</p>
              </div>
              <ul className="space-y-4 mb-8 text-gray-700">
                <li className="flex items-center gap-2">✓ Gestion illimitée de clients</li>
                <li className="flex items-center gap-2">✓ Rendez-vous et calendrier</li>
                <li className="flex items-center gap-2">✓ Gestion des stocks</li>
                <li className="flex items-center gap-2">✓ Paiements Stripe</li>
                <li className="flex items-center gap-2">✓ Support par email</li>
              </ul>
              <Link href="/auth/register?plan=monthly" className="w-full block">
                <Button className="w-full bg-primary hover:bg-primary/90">
                  Commencer
                </Button>
              </Link>
            </div>

            {/* Yearly Plan */}
            <div className="bg-gradient-to-br from-primary to-secondary p-8 rounded-lg border border-transparent shadow-lg relative">
              <div className="absolute top-4 right-4 bg-white text-primary px-3 py-1 rounded-full text-sm font-semibold">
                -17% d&apos;économies
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Par an</h3>
              <p className="text-white/80 mb-6">Meilleure offre</p>
              <div className="mb-6">
                <span className="text-5xl font-bold text-white">184,50€</span>
                <span className="text-white/80">/an TTC</span>
                <p className="text-xs text-white/80 mt-2">150€ HT + 23% IVA</p>
              </div>
              <ul className="space-y-4 mb-8 text-white">
                <li className="flex items-center gap-2">✓ Gestion illimitée de clients</li>
                <li className="flex items-center gap-2">✓ Rendez-vous et calendrier</li>
                <li className="flex items-center gap-2">✓ Gestion des stocks</li>
                <li className="flex items-center gap-2">✓ Paiements Stripe</li>
                <li className="flex items-center gap-2">✓ Support prioritaire</li>
              </ul>
              <Link href="/auth/register?plan=yearly" className="w-full block">
                <Button className="w-full bg-white text-primary hover:bg-gray-100">
                  Commencer
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* À propos */}
            <div>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <span className="text-2xl">✂️</span>
                <span>Groomly</span>
              </h3>
              <p className="text-gray-400 text-sm">
                Plateforme SaaS pour les toiletteurs au Portugal
              </p>
            </div>

            {/* Produit */}
            <div>
              <h4 className="font-semibold mb-4">Produit</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/#features" className="hover:text-white">Fonctionnalités</Link></li>
                <li><Link href="/#pricing" className="hover:text-white">Tarification</Link></li>
                <li><Link href="/auth/register" className="hover:text-white">Créer un compte</Link></li>
                <li><Link href="/auth/login" className="hover:text-white">Connexion</Link></li>
              </ul>
            </div>

            {/* Légal */}
            <div>
              <h4 className="font-semibold mb-4">Légal (Portugal)</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/legal/mentions" className="hover:text-white">Mentions légales</Link></li>
                <li><Link href="/legal/privacy" className="hover:text-white">Confidentialité</Link></li>
                <li><Link href="/legal/terms" className="hover:text-white">Conditions</Link></li>
                <li><Link href="/legal/gdpr" className="hover:text-white">RGPD/LPDP</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="mailto:contact@groomly.pt" className="hover:text-white">contact@groomly.pt</a></li>
                <li><a href="mailto:support@groomly.pt" className="hover:text-white">support@groomly.pt</a></li>
                <li><a href="mailto:dpo@groomly.pt" className="hover:text-white">dpo@groomly.pt</a></li>
              </ul>
            </div>
          </div>

          {/* Séparateur */}
          <div className="border-t border-gray-800 pt-8">
            <p className="text-gray-400 text-sm text-center">
              © 2026 Groomly Portugal. Tous droits réservés.
            </p>
            <p className="text-gray-500 text-xs text-center mt-2">
              Conforme à la loi portugaise • LPDP • IVA • RGPD • Código do Consumidor
            </p>
          </div>
        </div>
      </footer>
    </main>
  )
}
