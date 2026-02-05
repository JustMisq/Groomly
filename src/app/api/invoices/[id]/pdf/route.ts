import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authConfig } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/invoices/[id]/pdf - Génère un PDF de facture
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authConfig)
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const salon = await prisma.salon.findUnique({
      where: { userId: session.user.id },
    })

    if (!salon) {
      return NextResponse.json({ message: 'Salon not found' }, { status: 404 })
    }

    const invoice = await prisma.invoice.findFirst({
      where: {
        id: id,
        salonId: salon.id,
        deletedAt: null,
      },
      include: {
        client: true,
        appointment: {
          include: {
            animal: true,
            service: true,
          },
        },
        salon: true,
      },
    })

    if (!invoice) {
      return NextResponse.json({ message: 'Invoice not found' }, { status: 404 })
    }

    // Générer le HTML de la facture
    const html = generateInvoiceHTML(invoice)

    // Retourner le HTML (le frontend peut utiliser window.print() ou une lib comme html2pdf)
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    })
  } catch (error) {
    console.error('Generate invoice PDF error:', error)
    return NextResponse.json(
      { message: 'Error generating invoice', error: String(error) },
      { status: 500 }
    )
  }
}

function generateInvoiceHTML(invoice: any) {
  const salon = invoice.salon
  const client = invoice.client
  const appointment = invoice.appointment
  const createdAt = new Date(invoice.createdAt)
  const dueDate = invoice.dueDate ? new Date(invoice.dueDate) : null

  const formatDate = (date: Date) => date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

  const statusLabel: Record<string, string> = {
    draft: 'Brouillon',
    sent: 'Envoyée',
    paid: 'Payée',
    cancelled: 'Annulée',
    overdue: 'En retard',
  }

  const paymentMethodLabel: Record<string, string> = {
    cash: 'Espèces',
    card: 'Carte bancaire',
    transfer: 'Virement',
    check: 'Chèque',
  }

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Facture ${invoice.invoiceNumber}</title>
  <style>
    @page { size: A4; margin: 20mm; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 12px; line-height: 1.5; color: #333; }
    .invoice { max-width: 800px; margin: 0 auto; padding: 30px; }
    
    /* Header */
    .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
    .logo { font-size: 24px; font-weight: bold; color: #3b82f6; }
    .invoice-info { text-align: right; }
    .invoice-number { font-size: 20px; font-weight: bold; color: #1f2937; }
    .invoice-date { color: #6b7280; margin-top: 5px; }
    
    /* Status badge */
    .status { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 600; text-transform: uppercase; }
    .status-paid { background: #dcfce7; color: #166534; }
    .status-sent { background: #fef3c7; color: #92400e; }
    .status-draft { background: #f3f4f6; color: #4b5563; }
    .status-cancelled { background: #fee2e2; color: #991b1b; }
    .status-overdue { background: #fee2e2; color: #991b1b; }
    
    /* Parties */
    .parties { display: flex; justify-content: space-between; margin-bottom: 40px; }
    .party { width: 45%; }
    .party-title { font-size: 10px; font-weight: 600; color: #6b7280; text-transform: uppercase; margin-bottom: 10px; }
    .party-name { font-size: 16px; font-weight: bold; color: #1f2937; margin-bottom: 5px; }
    .party-details { color: #4b5563; font-size: 12px; }
    
    /* Table */
    table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
    th { background: #f9fafb; padding: 12px; text-align: left; font-size: 11px; font-weight: 600; color: #6b7280; text-transform: uppercase; border-bottom: 2px solid #e5e7eb; }
    td { padding: 15px 12px; border-bottom: 1px solid #f3f4f6; }
    .text-right { text-align: right; }
    .total-row td { font-weight: bold; border-top: 2px solid #e5e7eb; }
    .grand-total { font-size: 16px; color: #3b82f6; }
    
    /* Footer */
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
    .legal { font-size: 10px; color: #9ca3af; text-align: center; }
    .terms { margin-top: 20px; padding: 15px; background: #f9fafb; border-radius: 8px; font-size: 11px; color: #6b7280; }
    
    /* Payment info */
    .payment-info { margin-top: 30px; padding: 20px; background: #eff6ff; border-radius: 8px; }
    .payment-title { font-weight: bold; color: #1e40af; margin-bottom: 10px; }
    
    @media print {
      .invoice { padding: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="invoice">
    <!-- Header -->
    <div class="header">
      <div>
        <div class="logo">🐾 ${salon.name}</div>
        <div class="party-details" style="margin-top: 10px;">
          ${salon.address || ''}<br>
          ${salon.postalCode || ''} ${salon.city || ''}<br>
          ${salon.phone ? `📞 ${salon.phone}` : ''}<br>
          ${salon.email ? `📧 ${salon.email}` : ''}
        </div>
      </div>
      <div class="invoice-info">
        <div class="invoice-number">FACTURE ${invoice.invoiceNumber}</div>
        <div class="invoice-date">
          Date : ${formatDate(createdAt)}<br>
          ${dueDate ? `Échéance : ${formatDate(dueDate)}` : ''}
        </div>
        <div style="margin-top: 10px;">
          <span class="status status-${invoice.status}">${statusLabel[invoice.status] || invoice.status}</span>
        </div>
      </div>
    </div>

    <!-- Parties -->
    <div class="parties">
      <div class="party">
        <div class="party-title">Émetteur</div>
        <div class="party-name">${salon.legalName || salon.name}</div>
        <div class="party-details">
          ${salon.legalForm || ''}<br>
          ${salon.address || ''}<br>
          ${salon.postalCode || ''} ${salon.city || ''}<br>
          ${salon.siret ? `SIRET : ${salon.siret}` : ''}<br>
          ${salon.tvaNumber ? `TVA : ${salon.tvaNumber}` : 'TVA non applicable, art. 293 B du CGI'}
        </div>
      </div>
      <div class="party">
        <div class="party-title">Client</div>
        <div class="party-name">${client.firstName} ${client.lastName}</div>
        <div class="party-details">
          ${client.address || ''}<br>
          ${client.email || ''}<br>
          ${client.phone || ''}
        </div>
      </div>
    </div>

    <!-- Détails -->
    <table>
      <thead>
        <tr>
          <th>Description</th>
          <th>Quantité</th>
          <th class="text-right">Prix unitaire HT</th>
          <th class="text-right">Total HT</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <strong>${appointment?.service?.name || 'Prestation de toilettage'}</strong><br>
            <span style="color: #6b7280; font-size: 11px;">
              ${appointment?.animal ? `Animal : ${appointment.animal.name}` : ''}<br>
              ${appointment ? `Date du RDV : ${formatDate(new Date(appointment.startTime))}` : ''}
            </span>
          </td>
          <td>1</td>
          <td class="text-right">${invoice.subtotal.toFixed(2)} €</td>
          <td class="text-right">${invoice.subtotal.toFixed(2)} €</td>
        </tr>
        
        <!-- Sous-total -->
        <tr>
          <td colspan="3" class="text-right">Sous-total HT</td>
          <td class="text-right">${invoice.subtotal.toFixed(2)} €</td>
        </tr>
        <tr>
          <td colspan="3" class="text-right">TVA (${invoice.taxRate}%)</td>
          <td class="text-right">${invoice.taxAmount.toFixed(2)} €</td>
        </tr>
        <tr class="total-row">
          <td colspan="3" class="text-right">Total TTC</td>
          <td class="text-right grand-total">${invoice.total.toFixed(2)} €</td>
        </tr>
      </tbody>
    </table>

    ${invoice.status === 'paid' ? `
    <div class="payment-info">
      <div class="payment-title">✅ Facture acquittée</div>
      <div>
        Payée le : ${invoice.paidAt ? formatDate(new Date(invoice.paidAt)) : '-'}<br>
        Mode de paiement : ${invoice.paymentMethod ? paymentMethodLabel[invoice.paymentMethod] || invoice.paymentMethod : '-'}
      </div>
    </div>
    ` : ''}

    <!-- Conditions -->
    ${salon.invoiceTerms || salon.invoiceNotes ? `
    <div class="terms">
      <strong>Conditions de paiement :</strong><br>
      ${salon.invoiceTerms || 'Paiement à réception de la facture'}<br><br>
      ${salon.invoiceNotes || ''}
    </div>
    ` : `
    <div class="terms">
      <strong>Conditions de paiement :</strong><br>
      Paiement à réception de la facture.<br>
      Moyens de paiement acceptés : Espèces, Carte bancaire, Chèque.
    </div>
    `}

    <!-- Footer -->
    <div class="footer">
      <div class="legal">
        ${salon.legalName || salon.name} ${salon.legalForm ? `- ${salon.legalForm}` : ''}<br>
        ${salon.siret ? `SIRET : ${salon.siret}` : ''} ${salon.tvaNumber ? `- TVA : ${salon.tvaNumber}` : ''}<br>
        Document généré automatiquement par Groomly
      </div>
    </div>
  </div>

  <script>
    // Auto-print si demandé
    if (window.location.search.includes('print=true')) {
      window.onload = function() { window.print(); }
    }
  </script>
</body>
</html>
  `
}
