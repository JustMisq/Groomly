import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authConfig } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

/**
 * API pour envoyer les rappels (à appeler via CRON)
 * GET /api/reminders/send - Envoie les rappels en attente
 */
export async function GET(request: NextRequest) {
  try {
    // Vérifier le secret pour sécuriser le CRON
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date()

    // Récupérer les rappels à envoyer
    const pendingReminders = await prisma.reminder.findMany({
      where: {
        status: 'pending',
        scheduledFor: { lte: now },
      },
      take: 50, // Traiter par lots
    })

    const results = {
      processed: 0,
      sent: 0,
      failed: 0,
      errors: [] as string[],
    }

    for (const reminder of pendingReminders) {
      results.processed++

      try {
        if (reminder.type === 'appointment_24h' && reminder.appointmentId) {
          // Récupérer le RDV avec les infos
          const appointment = await prisma.appointment.findUnique({
            where: { id: reminder.appointmentId },
            include: {
              client: true,
              animal: true,
              service: true,
              salon: true,
            },
          })

          if (!appointment || appointment.status === 'cancelled' || appointment.deletedAt) {
            // RDV annulé, on annule le rappel
            await prisma.reminder.update({
              where: { id: reminder.id },
              data: { status: 'cancelled' },
            })
            continue
          }

          // Vérifier que le client a un email
          if (!appointment.client.email) {
            await prisma.reminder.update({
              where: { id: reminder.id },
              data: { 
                status: 'failed',
                error: 'Client has no email address',
              },
            })
            results.failed++
            continue
          }

          // Ici on enverrait l'email
          // Pour l'instant, on simule l'envoi
          const emailContent = generateReminderEmail(appointment)
          
          console.log('📧 Email reminder:', {
            to: appointment.client.email,
            subject: emailContent.subject,
          })

          // TODO: Intégrer un service d'email (Resend, SendGrid, etc.)
          // await sendEmail({
          //   to: appointment.client.email,
          //   subject: emailContent.subject,
          //   html: emailContent.html,
          // })

          // Marquer comme envoyé
          await prisma.reminder.update({
            where: { id: reminder.id },
            data: {
              status: 'sent',
              sentAt: new Date(),
            },
          })
          results.sent++
        }
      } catch (error) {
        results.failed++
        results.errors.push(`Reminder ${reminder.id}: ${String(error)}`)
        
        await prisma.reminder.update({
          where: { id: reminder.id },
          data: {
            status: 'failed',
            error: String(error),
          },
        })
      }
    }

    return NextResponse.json({
      message: 'Reminders processed',
      ...results,
    })
  } catch (error) {
    console.error('Reminder processing error:', error)
    return NextResponse.json(
      { message: 'Error processing reminders', error: String(error) },
      { status: 500 }
    )
  }
}

// Générer le contenu de l'email de rappel
function generateReminderEmail(appointment: any) {
  const date = new Date(appointment.startTime)
  const formattedDate = date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const formattedTime = date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  })

  const subject = `Rappel : RDV toilettage demain pour ${appointment.animal.name}`

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
    .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
    .details { background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border: 1px solid #e5e7eb; }
    .detail-row { display: flex; padding: 10px 0; border-bottom: 1px solid #f3f4f6; }
    .detail-label { font-weight: bold; width: 120px; color: #6b7280; }
    .footer { text-align: center; padding: 20px; color: #9ca3af; font-size: 12px; }
    .btn { display: inline-block; background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🐾 Rappel de rendez-vous</h1>
      <p>Toilettage demain !</p>
    </div>
    <div class="content">
      <p>Bonjour ${appointment.client.firstName},</p>
      <p>Nous vous rappelons votre rendez-vous de toilettage prévu demain :</p>
      
      <div class="details">
        <div class="detail-row">
          <span class="detail-label">📅 Date</span>
          <span>${formattedDate}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">🕐 Heure</span>
          <span>${formattedTime}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">🐕 Animal</span>
          <span>${appointment.animal.name}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">✂️ Service</span>
          <span>${appointment.service.name}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">💰 Prix</span>
          <span>${appointment.totalPrice.toFixed(2)}€ TTC</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">📍 Lieu</span>
          <span>${appointment.salon.name}<br>${appointment.salon.address || ''} ${appointment.salon.postalCode || ''} ${appointment.salon.city || ''}</span>
        </div>
      </div>

      <p><strong>Besoin d'annuler ou modifier ?</strong></p>
      <p>Merci de nous prévenir au moins 24h à l'avance en nous contactant :</p>
      <ul>
        <li>📞 ${appointment.salon.phone || 'Non renseigné'}</li>
        <li>📧 ${appointment.salon.email || 'Non renseigné'}</li>
      </ul>

      <p>À demain !</p>
      <p><strong>L'équipe ${appointment.salon.name}</strong></p>
    </div>
    <div class="footer">
      <p>Cet email a été envoyé automatiquement par Groomly.</p>
      <p>${appointment.salon.name} - ${appointment.salon.address || ''}</p>
    </div>
  </div>
</body>
</html>
  `

  return { subject, html }
}

// POST /api/reminders - Créer un rappel manuel
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig)
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { appointmentId, type, channel, scheduledFor } = body

    if (!appointmentId || !type || !scheduledFor) {
      return NextResponse.json(
        { message: 'appointmentId, type, and scheduledFor are required' },
        { status: 400 }
      )
    }

    const reminder = await prisma.reminder.create({
      data: {
        appointmentId,
        type,
        channel: channel || 'email',
        scheduledFor: new Date(scheduledFor),
        status: 'pending',
      },
    })

    return NextResponse.json(reminder, { status: 201 })
  } catch (error) {
    console.error('Create reminder error:', error)
    return NextResponse.json(
      { message: 'Error creating reminder', error: String(error) },
      { status: 500 }
    )
  }
}
