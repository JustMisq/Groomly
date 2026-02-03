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

    const services = await prisma.service.findMany({
      where: { salonId: salon.id },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(services)
  } catch (error) {
    console.error('Get services error:', error)
    return NextResponse.json(
      { message: 'Error fetching services', error: String(error) },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
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
    const { 
      name, 
      description, 
      price, 
      minPrice,
      maxPrice,
      duration, 
      minDuration,
      maxDuration,
      isFlexible 
    } = body

    if (!name || price === undefined || !duration) {
      return NextResponse.json(
        { message: 'name, price, and duration are required' },
        { status: 400 }
      )
    }

    const service = await prisma.service.create({
      data: {
        name,
        description: description || null,
        price: parseFloat(price),
        minPrice: minPrice ? parseFloat(minPrice) : null,
        maxPrice: maxPrice ? parseFloat(maxPrice) : null,
        duration: parseInt(duration),
        minDuration: minDuration ? parseInt(minDuration) : null,
        maxDuration: maxDuration ? parseInt(maxDuration) : null,
        isFlexible: isFlexible || false,
        salonId: salon.id,
      },
    })

    return NextResponse.json(service, { status: 201 })
  } catch (error) {
    console.error('Create service error:', error)
    return NextResponse.json(
      { message: 'Error creating service', error: String(error) },
      { status: 500 }
    )
  }
}

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
      return NextResponse.json(
        { message: 'Salon not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { id, name, description, price, minPrice, maxPrice, duration, minDuration, maxDuration, isFlexible } = body

    if (!id || !name || price === undefined || !duration) {
      return NextResponse.json(
        { message: 'id, name, price, and duration are required' },
        { status: 400 }
      )
    }

    // Vérifier que le service appartient au salon
    const service = await prisma.service.findUnique({
      where: { id },
    })

    if (!service || service.salonId !== salon.id) {
      return NextResponse.json(
        { message: 'Service not found' },
        { status: 404 }
      )
    }

    const updated = await prisma.service.update({
      where: { id },
      data: {
        name,
        description: description || null,
        price: parseFloat(price),
        minPrice: minPrice ? parseFloat(minPrice) : null,
        maxPrice: maxPrice ? parseFloat(maxPrice) : null,
        duration: parseInt(duration),
        minDuration: minDuration ? parseInt(minDuration) : null,
        maxDuration: maxDuration ? parseInt(maxDuration) : null,
        isFlexible: isFlexible || false,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Update service error:', error)
    return NextResponse.json(
      { message: 'Error updating service', error: String(error) },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
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

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { message: 'id is required' },
        { status: 400 }
      )
    }

    // Vérifier que le service appartient au salon
    const service = await prisma.service.findUnique({
      where: { id },
    })

    if (!service || service.salonId !== salon.id) {
      return NextResponse.json(
        { message: 'Service not found' },
        { status: 404 }
      )
    }

    await prisma.service.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Service deleted' })
  } catch (error) {
    console.error('Delete service error:', error)
    return NextResponse.json(
      { message: 'Error deleting service', error: String(error) },
      { status: 500 }
    )
  }
}
