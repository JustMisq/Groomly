import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authConfig } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'
import { checkRouteRateLimit } from '@/lib/rate-limit'

/**
 * GET /api/export/accounting - Export comptable CSV (format compatible logiciels comptables)
 */
export async function GET(request: NextRequest) {
  try {
    // Rate limit pour les exports
    const rateLimitResponse = await checkRouteRateLimit(request, 'api')
    if (rateLimitResponse) return rateLimitResponse

    const session = await getServerSession(authConfig)
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const salon = await prisma.salon.findUnique({
      where: { userId: session.user.id },
    })

    if (!salon) {
      return NextResponse.json({ message: 'Salon not found' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('start')
    const endDate = searchParams.get('end')
    const format = searchParams.get('format') || 'csv' // csv, fec
    const onlyPaid = searchParams.get('onlyPaid') === 'true'

    // Période par défaut : année en cours
    const now = new Date()
    const start = startDate ? new Date(startDate) : new Date(now.getFullYear(), 0, 1)
    const end = endDate ? new Date(endDate) : new Date(now.getFullYear(), 11, 31, 23, 59, 59)

    const where: any = {
      salonId: salon.id,
      deletedAt: null,
      createdAt: { gte: start, lte: end },
    }

    if (onlyPaid) {
      where.status = 'paid'
    }

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        client: true,
        appointment: {
          include: {
            service: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    })

    let content: string
    let filename: string
    let contentType: string

    if (format === 'fec') {
      // Format FEC (Fichier des Écritures Comptables) simplifié
      content = generateFEC(invoices, salon)
      filename = `FEC_${salon.name.replace(/\s/g, '_')}_${formatDateForFilename(start)}_${formatDateForFilename(end)}.txt`
      contentType = 'text/plain; charset=utf-8'
    } else {
      // Format CSV standard
      content = generateAccountingCSV(invoices, salon)
      filename = `comptabilite_${salon.name.replace(/\s/g, '_')}_${formatDateForFilename(start)}_${formatDateForFilename(end)}.csv`
      contentType = 'text/csv; charset=utf-8'
    }

    // Ajouter BOM pour Excel
    const bom = '\uFEFF'
    
    return new NextResponse(bom + content, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('Accounting export error:', error)
    return NextResponse.json(
      { message: 'Error generating export', error: String(error) },
      { status: 500 }
    )
  }
}

function formatDateForFilename(date: Date): string {
  return date.toISOString().split('T')[0].replace(/-/g, '')
}

function formatDateFR(date: Date): string {
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function generateAccountingCSV(invoices: any[], salon: any): string {
  const headers = [
    'Date',
    'N° Facture',
    'Client',
    'Description',
    'Montant HT',
    'TVA (%)',
    'Montant TVA',
    'Montant TTC',
    'Statut',
    'Date Paiement',
    'Mode Paiement',
    'Compte Produit',
    'Compte TVA',
  ]

  const rows = invoices.map(invoice => {
    const description = invoice.appointment?.service?.name || 'Prestation de toilettage'
    const clientName = `${invoice.client.firstName} ${invoice.client.lastName}`
    
    return [
      formatDateFR(new Date(invoice.createdAt)),
      invoice.invoiceNumber,
      clientName,
      description,
      invoice.subtotal.toFixed(2).replace('.', ','),
      invoice.taxRate.toString(),
      invoice.taxAmount.toFixed(2).replace('.', ','),
      invoice.total.toFixed(2).replace('.', ','),
      translateStatus(invoice.status),
      invoice.paidAt ? formatDateFR(new Date(invoice.paidAt)) : '',
      translatePaymentMethod(invoice.paymentMethod),
      '706000', // Compte produit standard
      '445710', // Compte TVA collectée
    ].map(cell => `"${String(cell).replace(/"/g, '""')}"`)
  })

  // Ajouter une ligne de totaux
  const totalHT = invoices.reduce((sum, inv) => sum + inv.subtotal, 0)
  const totalTVA = invoices.reduce((sum, inv) => sum + inv.taxAmount, 0)
  const totalTTC = invoices.reduce((sum, inv) => sum + inv.total, 0)

  const totalsRow = [
    '',
    'TOTAUX',
    `${invoices.length} factures`,
    '',
    totalHT.toFixed(2).replace('.', ','),
    '',
    totalTVA.toFixed(2).replace('.', ','),
    totalTTC.toFixed(2).replace('.', ','),
    '',
    '',
    '',
    '',
    '',
  ].map(cell => `"${cell}"`)

  return [
    headers.join(';'),
    ...rows.map(row => row.join(';')),
    '', // Ligne vide
    totalsRow.join(';'),
  ].join('\r\n')
}

function generateFEC(invoices: any[], salon: any): string {
  // Format FEC simplifié (Fichier des Écritures Comptables)
  // Colonnes obligatoires FEC
  const headers = [
    'JournalCode',
    'JournalLib',
    'EcritureNum',
    'EcritureDate',
    'CompteNum',
    'CompteLib',
    'CompAuxNum',
    'CompAuxLib',
    'PieceRef',
    'PieceDate',
    'EcritureLib',
    'Debit',
    'Credit',
    'EcritureLet',
    'DateLet',
    'ValidDate',
    'Montantdevise',
    'Idevise',
  ]

  const rows: string[][] = []
  let ecritureNum = 1

  for (const invoice of invoices) {
    if (invoice.status !== 'paid') continue

    const dateStr = formatFECDate(new Date(invoice.paidAt || invoice.createdAt))
    const clientName = `${invoice.client.firstName} ${invoice.client.lastName}`.substring(0, 30)
    
    // Ligne débit client
    rows.push([
      'VE', // Journal des ventes
      'Ventes',
      String(ecritureNum),
      dateStr,
      '411000', // Compte client
      'Clients',
      invoice.client.id.substring(0, 17),
      clientName,
      invoice.invoiceNumber,
      dateStr,
      `Facture ${invoice.invoiceNumber}`,
      invoice.total.toFixed(2),
      '0.00',
      '',
      '',
      dateStr,
      '',
      '',
    ])

    // Ligne crédit produit
    rows.push([
      'VE',
      'Ventes',
      String(ecritureNum),
      dateStr,
      '706000', // Prestations de services
      'Prestations services',
      '',
      '',
      invoice.invoiceNumber,
      dateStr,
      `Facture ${invoice.invoiceNumber}`,
      '0.00',
      invoice.subtotal.toFixed(2),
      '',
      '',
      dateStr,
      '',
      '',
    ])

    // Ligne crédit TVA
    if (invoice.taxAmount > 0) {
      rows.push([
        'VE',
        'Ventes',
        String(ecritureNum),
        dateStr,
        '445710', // TVA collectée
        'TVA collectée',
        '',
        '',
        invoice.invoiceNumber,
        dateStr,
        `TVA Facture ${invoice.invoiceNumber}`,
        '0.00',
        invoice.taxAmount.toFixed(2),
        '',
        '',
        dateStr,
        '',
        '',
      ])
    }

    ecritureNum++
  }

  return [
    headers.join('|'),
    ...rows.map(row => row.join('|')),
  ].join('\r\n')
}

function formatFECDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}${month}${day}`
}

function translateStatus(status: string): string {
  const statuses: Record<string, string> = {
    draft: 'Brouillon',
    sent: 'Envoyée',
    paid: 'Payée',
    cancelled: 'Annulée',
    overdue: 'En retard',
  }
  return statuses[status] || status
}

function translatePaymentMethod(method: string | null): string {
  if (!method) return ''
  const methods: Record<string, string> = {
    cash: 'Espèces',
    card: 'Carte bancaire',
    transfer: 'Virement',
    check: 'Chèque',
  }
  return methods[method] || method
}
