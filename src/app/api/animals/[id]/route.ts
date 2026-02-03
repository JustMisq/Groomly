import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authConfig } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

// GET /api/animals/[id]
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
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

    const animal = await prisma.animal.findFirst({
      where: {
        id,
        client: {
          salonId: salon.id,
        },
      },
      include: {
        client: true,
      },
    })

    if (!animal) {
      return NextResponse.json(
        { message: 'Animal not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(animal)
  } catch (error) {
    console.error('💥 GET animal error:', error)
    return NextResponse.json(
      { message: 'Error fetching animal' },
      { status: 500 }
    )
  }
}

// PUT /api/animals/[id]
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
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
    const { name, species, breed, color, dateOfBirth, notes } = body

    // Vérifier que l'animal appartient au salon
    const animal = await prisma.animal.findFirst({
      where: {
        id,
        client: {
          salonId: salon.id,
        },
      },
    })

    if (!animal) {
      return NextResponse.json(
        { message: 'Animal not found' },
        { status: 404 }
      )
    }

    const updatedAnimal = await prisma.animal.update({
      where: { id },
      data: {
        name: name || animal.name,
        species: species || animal.species,
        breed: breed !== undefined ? breed : animal.breed,
        color: color !== undefined ? color : animal.color,
        dateOfBirth: dateOfBirth !== undefined ? (dateOfBirth ? new Date(dateOfBirth) : null) : animal.dateOfBirth,
        notes: notes !== undefined ? notes : animal.notes,
      },
    })

    return NextResponse.json(updatedAnimal)
  } catch (error) {
    console.error('💥 PUT animal error:', error)
    return NextResponse.json(
      { message: 'Error updating animal' },
      { status: 500 }
    )
  }
}

// DELETE /api/animals/[id]
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
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

    // Vérifier que l'animal appartient au salon
    const animal = await prisma.animal.findFirst({
      where: {
        id,
        client: {
          salonId: salon.id,
        },
      },
    })

    if (!animal) {
      return NextResponse.json(
        { message: 'Animal not found' },
        { status: 404 }
      )
    }

    await prisma.animal.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Animal deleted successfully' })
  } catch (error) {
    console.error('💥 DELETE animal error:', error)
    return NextResponse.json(
      { message: 'Error deleting animal' },
      { status: 500 }
    )
  }
}
