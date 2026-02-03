import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authConfig } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authConfig)
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const salon = await prisma.salon.findUnique({
      where: { userId: session.user.id },
    })

    if (!salon) {
      return NextResponse.json([], { status: 200 })
    }

    const clients = await prisma.client.findMany({
      where: { salonId: salon.id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(clients)
  } catch (error) {
    console.error('Get clients error:', error)
    return NextResponse.json(
      { message: 'Error fetching clients' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔵 POST /api/clients')
    const session = await getServerSession(authConfig)
    console.log('Session user id:', session?.user?.id)
    
    if (!session?.user?.id) {
      console.log('❌ No session')
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    console.log('Looking for salon with userId:', userId)
    console.log('Salon.findUnique params:', { where: { userId } })
    
    const salon = await prisma.salon.findUnique({
      where: { userId },
    })
    
    console.log('Salon found:', salon)

    if (!salon) {
      // Try to see if there's any salon
      const allSalons = await prisma.salon.findMany()
      console.log('Total salons in database:', allSalons.length)
      console.log('All salons:', allSalons.map(s => ({ id: s.id, userId: s.userId, name: s.name })))
      console.log('❌ No salon found for user', userId)
      return NextResponse.json(
        { message: 'Salon not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    console.log('Body:', body)

    // Vérifier que le salon existe
    if (!salon) {
      console.log('❌ No salon for user', userId)
      return NextResponse.json(
        { 
          message: 'Salon not found - You must create a salon first in the "Salon" section',
          userIdInSession: userId,
          error: 'NO_SALON'
        },
        { status: 404 }
      )
    }

    const client = await prisma.client.create({
      data: {
        ...body,
        salonId: salon.id,
      },
    })
    
    console.log('✅ Client créé:', client.id)
    return NextResponse.json(client)
  } catch (error) {
    console.error('💥 POST clients error:', error)
    return NextResponse.json(
      { message: 'Error creating client', error: String(error) },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log('🔵 PUT /api/clients')
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
    const { id, firstName, lastName, email, phone, address, notes } = body

    if (!id) {
      return NextResponse.json(
        { message: 'id is required' },
        { status: 400 }
      )
    }

    // Vérifier que le client appartient au salon
    const client = await prisma.client.findFirst({
      where: {
        id,
        salonId: salon.id,
      },
    })

    if (!client) {
      return NextResponse.json(
        { message: 'Client not found' },
        { status: 404 }
      )
    }

    const updatedClient = await prisma.client.update({
      where: { id },
      data: {
        firstName: firstName || client.firstName,
        lastName: lastName || client.lastName,
        email: email !== undefined ? email : client.email,
        phone: phone !== undefined ? phone : client.phone,
        address: address !== undefined ? address : client.address,
        notes: notes !== undefined ? notes : client.notes,
      },
    })

    console.log('✅ Client updated:', id)
    return NextResponse.json(updatedClient)
  } catch (error) {
    console.error('💥 PUT clients error:', error)
    return NextResponse.json(
      { message: 'Error updating client', error: String(error) },
      { status: 500 }
    )
  }
}
