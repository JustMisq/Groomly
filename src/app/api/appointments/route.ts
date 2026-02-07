import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authConfig } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'
import { checkRouteRateLimit } from '@/lib/rate-limit'
import { appointmentSchema, validateRequest } from '@/lib/validations'

// Constantes pour la gestion des annulations
const LATE_CANCELLATION_HOURS = 24

// GET /api/appointments?from=2026-02-01&to=2026-02-28
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig)
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    const status = searchParams.get('status')

    const salon = await prisma.salon.findUnique({
      where: { userId: session.user.id },
    })

    if (!salon) {
      return NextResponse.json([], { status: 200 })
    }

    const where: any = { 
      salonId: salon.id,
      deletedAt: null,
    }

    if (from && to) {
      where.startTime = {
        gte: new Date(from),
        lte: new Date(to),
      }
    }

    if (status) {
      where.status = status
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        client: true,
        animal: true,
        service: true,
      },
      orderBy: { startTime: 'asc' },
    })

    return NextResponse.json(appointments)
  } catch (error) {
    console.error('Get appointments error:', error)
    return NextResponse.json(
      { message: 'Error fetching appointments', error: String(error) },
      { status: 500 }
    )
  }
}

// POST /api/appointments
export async function POST(request: NextRequest) {
  try {
    // Rate limiting - check API rate limit
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

    const body = await request.json()
    const { clientId, animalId, serviceId, startTime, notes, internalNotes } = body

    if (!clientId || !animalId || !serviceId || !startTime) {
      return NextResponse.json(
        { message: 'clientId, animalId, serviceId, and startTime are required' },
        { status: 400 }
      )
    }

    // Vérifier que le client appartient au salon
    const client = await prisma.client.findFirst({
      where: { id: clientId, salonId: salon.id, deletedAt: null },
    })

    if (!client) {
      return NextResponse.json({ message: 'Client not found' }, { status: 404 })
    }

    // Vérifier que l'animal appartient au client
    const animal = await prisma.animal.findFirst({
      where: { id: animalId, clientId, deletedAt: null },
    })

    if (!animal) {
      return NextResponse.json({ message: 'Animal not found' }, { status: 404 })
    }

    // Vérifier que le service appartient au salon
    const service = await prisma.service.findFirst({
      where: { id: serviceId, salonId: salon.id },
    })

    if (!service) {
      return NextResponse.json({ message: 'Service not found' }, { status: 404 })
    }

    // Calculer l'heure de fin
    const start = new Date(startTime)
    const end = new Date(start.getTime() + service.duration * 60000)

    // Créer le rendez-vous
    const appointment = await prisma.appointment.create({
      data: {
        clientId,
        animalId,
        serviceId,
        salonId: salon.id,
        date: start,
        startTime: start,
        endTime: end,
        totalPrice: service.price,
        notes: notes || null,
        internalNotes: internalNotes || null,
        status: 'scheduled',
      },
      include: {
        client: true,
        animal: true,
        service: true,
      },
    })

    // Créer automatiquement une facture
    const year = new Date().getFullYear()
    const latestInvoice = await prisma.invoice.findFirst({
      where: {
        salonId: salon.id,
        invoiceNumber: { startsWith: `INV-${year}-` },
      },
      orderBy: { invoiceNumber: 'desc' },
    })

    let nextNumber = 1
    if (latestInvoice) {
      const lastNum = parseInt(latestInvoice.invoiceNumber.split('-')[2])
      nextNumber = lastNum + 1
    }
    const invoiceNumber = `INV-${year}-${String(nextNumber).padStart(3, '0')}`

    const taxRate = 20
    const subtotal = service.price
    const taxAmount = (subtotal * taxRate) / 100
    const total = subtotal + taxAmount

    // Date d'échéance : 30 jours
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + 30)

    await prisma.invoice.create({
      data: {
        invoiceNumber,
        clientId,
        appointmentId: appointment.id,
        subtotal,
        taxRate,
        taxAmount,
        total,
        salonId: salon.id,
        status: 'draft',
        dueDate,
      },
    })

    // Créer un rappel pour 24h avant
    const reminderDate = new Date(start)
    reminderDate.setHours(reminderDate.getHours() - 24)
    
    if (reminderDate > new Date()) {
      await prisma.reminder.create({
        data: {
          type: 'appointment_24h',
          channel: 'email',
          scheduledFor: reminderDate,
          appointmentId: appointment.id,
          status: 'pending',
        },
      })
    }

    console.log('✅ Appointment created:', appointment.id)
    return NextResponse.json(appointment, { status: 201 })
  } catch (error) {
    console.error('💥 POST appointments error:', error)
    return NextResponse.json(
      { message: 'Error creating appointment', error: String(error) },
      { status: 500 }
    )
  }
}

// PUT /api/appointments - Mettre à jour un rendez-vous
export async function PUT(request: NextRequest) {
  try {
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

    const body = await request.json()
    const { id, status, notes, internalNotes, cancellationReason } = body

    if (!id) {
      return NextResponse.json({ message: 'ID required' }, { status: 400 })
    }

    // Vérifier que le RDV appartient au salon
    const existingAppointment = await prisma.appointment.findFirst({
      where: { id, salonId: salon.id, deletedAt: null },
    })

    if (!existingAppointment) {
      return NextResponse.json({ message: 'Appointment not found' }, { status: 404 })
    }

    const updateData: any = {}

    // Gestion des notes
    if (notes !== undefined) updateData.notes = notes
    if (internalNotes !== undefined) updateData.internalNotes = internalNotes

    // Gestion du changement de statut
    if (status) {
      updateData.status = status

      // Annulation
      if (status === 'cancelled') {
        updateData.cancelledAt = new Date()
        updateData.cancellationReason = cancellationReason || null

        // Vérifier si c'est une annulation tardive (< 24h)
        const hoursUntilAppointment = 
          (existingAppointment.startTime.getTime() - Date.now()) / (1000 * 60 * 60)
        
        if (hoursUntilAppointment < LATE_CANCELLATION_HOURS) {
          updateData.isLateCancel = true
        }

        // Annuler les rappels associés
        await prisma.reminder.updateMany({
          where: { appointmentId: id, status: 'pending' },
          data: { status: 'cancelled' },
        })
      }

      // No-show
      if (status === 'no_show') {
        console.log('📛 No-show enregistré pour client:', existingAppointment.clientId)
      }

      // Terminé -> Marquer la facture comme envoyée
      if (status === 'completed') {
        await prisma.invoice.updateMany({
          where: { appointmentId: id, status: 'draft' },
          data: { status: 'sent' },
        })
      }
    }

    const appointment = await prisma.appointment.update({
      where: { id },
      data: updateData,
      include: {
        client: true,
        animal: true,
        service: true,
      },
    })

    return NextResponse.json(appointment)
  } catch (error) {
    console.error('PUT appointment error:', error)
    return NextResponse.json(
      { message: 'Error updating appointment', error: String(error) },
      { status: 500 }
    )
  }
}

// DELETE /api/appointments?id=xxx (Soft delete)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig)
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const appointmentId = searchParams.get('id')

    if (!appointmentId) {
      return NextResponse.json(
        { message: 'Appointment ID is required' },
        { status: 400 }
      )
    }

    const salon = await prisma.salon.findUnique({
      where: { userId: session.user.id },
    })

    if (!salon) {
      return NextResponse.json({ message: 'Salon not found' }, { status: 404 })
    }

    const appointment = await prisma.appointment.findFirst({
      where: { id: appointmentId, salonId: salon.id },
    })

    if (!appointment) {
      return NextResponse.json({ message: 'Appointment not found' }, { status: 404 })
    }

    // Soft delete
    await prisma.appointment.update({
      where: { id: appointmentId },
      data: { deletedAt: new Date() },
    })

    // Annuler les rappels
    await prisma.reminder.updateMany({
      where: { appointmentId, status: 'pending' },
      data: { status: 'cancelled' },
    })

    console.log('✅ Appointment soft deleted:', appointmentId)
    return NextResponse.json({ message: 'Appointment deleted successfully' })
  } catch (error) {
    console.error('💥 DELETE appointment error:', error)
    return NextResponse.json(
      { message: 'Error deleting appointment', error: String(error) },
      { status: 500 }
    )
  }
}