import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authConfig } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

// GET /api/animals?clientId=xxx - Récupérer les animaux d'un client ou tous les animaux du salon
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig)
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId')

    // Vérifier que le salon existe
    const salon = await prisma.salon.findUnique({
      where: { userId: session.user.id },
    })

    if (!salon) {
      return NextResponse.json(
        { message: 'Salon not found' },
        { status: 404 }
      )
    }

    // Si clientId est fourni, vérifier que le client appartient au salon
    if (clientId) {
      const client = await prisma.client.findFirst({
        where: {
          id: clientId,
          salonId: salon.id,
        },
      })

      if (!client) {
        return NextResponse.json(
          { message: 'Client not found' },
          { status: 404 }
        )
      }
    }

    // Récupérer les animaux du salon (ou d'un client spécifique)
    const animals = await prisma.animal.findMany({
      where: clientId
        ? { clientId }
        : {
            client: {
              salonId: salon.id,
            },
          },
      include: {
        client: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(animals)
  } catch (error) {
    console.error('Get animals error:', error)
    return NextResponse.json(
      { message: 'Error fetching animals', error: String(error) },
      { status: 500 }
    )
  }
}

// POST /api/animals - Créer un animal
export async function POST(request: NextRequest) {
  try {
    console.log('🔵 POST /api/animals')
    const session = await getServerSession(authConfig)
    if (!session?.user?.id) {
      console.log('❌ No session')
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const salon = await prisma.salon.findUnique({
      where: { userId: session.user.id },
    })

    if (!salon) {
      console.log('❌ No salon')
      return NextResponse.json(
        { message: 'Salon not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { clientId, name, species, breed, color, dateOfBirth, notes } = body

    if (!clientId || !name || !species) {
      return NextResponse.json(
        { message: 'clientId, name, and species are required' },
        { status: 400 }
      )
    }

    // Vérifier que le client appartient au salon
    const client = await prisma.client.findFirst({
      where: {
        id: clientId,
        salonId: salon.id,
      },
    })

    if (!client) {
      return NextResponse.json(
        { message: 'Client not found' },
        { status: 404 }
      )
    }

    const animal = await prisma.animal.create({
      data: {
        name,
        species,
        breed: breed || null,
        color: color || null,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        notes: notes || null,
        clientId,
      },
    })

    console.log('✅ Animal created:', animal.id)
    return NextResponse.json(animal, { status: 201 })
  } catch (error) {
    console.error('💥 POST animals error:', error)
    return NextResponse.json(
      { message: 'Error creating animal', error: String(error) },
      { status: 500 }
    )
  }
}

// PUT /api/animals - Mettre à jour un animal
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
    const { 
      id, name, species, breed, color, dateOfBirth, notes,
      // Nouveaux champs santé
      temperament, allergies, healthNotes, groomingNotes, weight 
    } = body

    if (!id) {
      return NextResponse.json(
        { message: 'id is required' },
        { status: 400 }
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

    const updatedAnimal = await prisma.animal.update({
      where: { id },
      data: {
        name: name || animal.name,
        species: species || animal.species,
        breed: breed !== undefined ? breed : animal.breed,
        color: color !== undefined ? color : animal.color,
        dateOfBirth: dateOfBirth !== undefined ? (dateOfBirth ? new Date(dateOfBirth) : null) : animal.dateOfBirth,
        notes: notes !== undefined ? notes : animal.notes,
        // Nouveaux champs santé
        temperament: temperament !== undefined ? temperament : animal.temperament,
        allergies: allergies !== undefined ? allergies : animal.allergies,
        healthNotes: healthNotes !== undefined ? healthNotes : animal.healthNotes,
        groomingNotes: groomingNotes !== undefined ? groomingNotes : animal.groomingNotes,
        weight: weight !== undefined ? weight : animal.weight,
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

// DELETE /api/animals - Supprimer un animal
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

    const body = await request.json()
    const { id } = body

    if (!id) {
      return NextResponse.json(
        { message: 'id is required' },
        { status: 400 }
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
