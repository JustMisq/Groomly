import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authConfig } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

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

    const salon = await prisma.salon.findUnique({
      where: { userId: session.user.id },
    })

    if (!salon) {
      return NextResponse.json([], { status: 200 })
    }

    const query: any = {
      where: { salonId: salon.id },
      include: {
        client: true,
        animal: true,
        service: true,
      },
      orderBy: { startTime: 'asc' },
    }

    if (from && to) {
      query.where.startTime = {
        gte: new Date(from),
        lte: new Date(to),
      }
    }

    const appointments = await prisma.appointment.findMany(query)

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
    console.log('🔵 POST /api/appointments')
    const session = await getServerSession(authConfig)
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const salon = await prisma.salon.findUnique({
      where: { userId: session.user.id },
    })

    if (!salon) {
      return NextResponse.json(
        { message: 'Salon not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { clientId, animalId, serviceId, startTime, notes } = body

    if (!clientId || !animalId || !serviceId || !startTime) {
      return NextResponse.json(
        { message: 'clientId, animalId, serviceId, and startTime are required' },
        { status: 400 }
      )
    }

    // Vérifier que le client et l'animal appartiennent au salon
    const client = await prisma.client.findFirst({
      where: { id: clientId, salonId: salon.id },
    })

    if (!client) {
      return NextResponse.json(
        { message: 'Client not found' },
        { status: 404 }
      )
    }

    const animal = await prisma.animal.findFirst({
      where: { id: animalId, clientId },
    })

    if (!animal) {
      return NextResponse.json(
        { message: 'Animal not found' },
        { status: 404 }
      )
    }

    const service = await prisma.service.findFirst({
      where: { id: serviceId, salonId: salon.id },
    })

    if (!service) {
      return NextResponse.json(
        { message: 'Service not found' },
        { status: 404 }
      )
    }

    // Calculer l'heure de fin basée sur la durée du service
    const start = new Date(startTime)
    const end = new Date(start.getTime() + service.duration * 60000)

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
      },
      include: {
        client: true,
        animal: true,
        service: true,
      },
    })

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

// DELETE /api/appointments?id=xxx
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
      return NextResponse.json(
        { message: 'Salon not found' },
        { status: 404 }
      )
    }

    // Vérifier que le rendez-vous appartient au salon de l'utilisateur
    const appointment = await prisma.appointment.findFirst({
      where: { id: appointmentId, salonId: salon.id },
    })

    if (!appointment) {
      return NextResponse.json(
        { message: 'Appointment not found' },
        { status: 404 }
      )
    }

    await prisma.appointment.delete({
      where: { id: appointmentId },
    })

    console.log('✅ Appointment deleted:', appointmentId)
    return NextResponse.json({ message: 'Appointment deleted successfully' })
  } catch (error) {
    console.error('💥 DELETE appointment error:', error)
    return NextResponse.json(
      { message: 'Error deleting appointment', error: String(error) },
      { status: 500 }
    )
  }
}