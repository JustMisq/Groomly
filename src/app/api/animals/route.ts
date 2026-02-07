import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authConfig } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'
import { animalSchema } from '@/lib/validations'
import { logger, getErrorMessage, logApiCall } from '@/lib/logger'
import { z } from 'zod'

// GET /api/animals?clientId=xxx - Récupérer les animaux d'un client ou tous les animaux du salon
export async function GET(request: NextRequest) {
  const startTime = Date.now()
  try {
    const session = await getServerSession(authConfig)
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId')

    const salon = await prisma.salon.findUnique({
      where: { userId: session.user.id },
    })

    if (!salon) {
      return NextResponse.json(
        { message: 'Salon not found' },
        { status: 404 }
      )
    }

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

    const animals = await prisma.animal.findMany({
      where: clientId
        ? { clientId, deletedAt: null }
        : {
            client: {
              salonId: salon.id,
            },
            deletedAt: null,
          },
      include: {
        client: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    const duration = Date.now() - startTime
    logApiCall('GET', '/api/animals', 200, duration, session.user.id)

    return NextResponse.json(animals)
  } catch (error) {
    const duration = Date.now() - startTime
    logApiCall('GET', '/api/animals', 500, duration)
    const { message, errorId } = getErrorMessage(error)
    logger.error('API/ANIMALS', `GET failed: ${errorId}`, error)
    return NextResponse.json(
      { message, errorId },
      { status: 500 }
    )
  }
}

// POST /api/animals - Créer un animal
export async function POST(request: NextRequest) {
  const startTime = Date.now()
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
    const { clientId, ...animalData } = body

    // ✅ SÉCURITÉ: Validation stricte
    const validatedData = animalSchema.omit({ clientId: true }).parse(animalData)

    if (!clientId) {
      return NextResponse.json(
        { message: 'clientId is required' },
        { status: 400 }
      )
    }

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
        ...validatedData,
        clientId,
      },
    })

    const duration = Date.now() - startTime
    logApiCall('POST', '/api/animals', 201, duration, session.user.id)
    logger.audit('API/ANIMALS', 'ANIMAL_CREATED', session.user.id, { animalId: animal.id })
    return NextResponse.json(animal, { status: 201 })
  } catch (error) {
    const duration = Date.now() - startTime
    logApiCall('POST', '/api/animals', 400, duration)

    if (error instanceof z.ZodError) {
      logger.warn('API/ANIMALS', 'Validation error', (error as any).issues)
      return NextResponse.json(
        { message: 'Invalid data', errors: (error as any).issues },
        { status: 400 }
      )
    }

    const { message, errorId } = getErrorMessage(error)
    logger.error('API/ANIMALS', `POST failed: ${errorId}`, error)
    return NextResponse.json(
      { message, errorId },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  const startTime = Date.now()
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
      id, ...updateData
    } = body

    if (!id) {
      return NextResponse.json(
        { message: 'id is required' },
        { status: 400 }
      )
    }

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

    // ✅ SÉCURITÉ: Valider les données de mise à jour
    const validatedData = animalSchema.omit({ clientId: true }).partial().parse(updateData)

    const updatedAnimal = await prisma.animal.update({
      where: { id },
      data: validatedData,
    })

    const duration = Date.now() - startTime
    logApiCall('PUT', '/api/animals', 200, duration, session.user.id)
    logger.audit('API/ANIMALS', 'ANIMAL_UPDATED', session.user.id, { animalId: id })

    return NextResponse.json(updatedAnimal)
  } catch (error) {
    const duration = Date.now() - startTime
    logApiCall('PUT', '/api/animals', 400, duration)

    if (error instanceof z.ZodError) {
      logger.warn('API/ANIMALS', 'Validation error', (error as any).issues)
      return NextResponse.json(
        { message: 'Invalid data', errors: (error as any).issues },
        { status: 400 }
      )
    }

    const { message, errorId } = getErrorMessage(error)
    logger.error('API/ANIMALS', `PUT failed: ${errorId}`, error)
    return NextResponse.json(
      { message, errorId },
      { status: 500 }
    )
  }
}

// DELETE /api/animals - Supprimer un animal
export async function DELETE(request: NextRequest) {
  const startTime = Date.now()
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

    const duration = Date.now() - startTime
    logApiCall('DELETE', '/api/animals', 200, duration, session.user.id)
    logger.audit('API/ANIMALS', 'ANIMAL_DELETED', session.user.id, { animalId: id })

    return NextResponse.json({ message: 'Animal deleted successfully' })
  } catch (error) {
    const duration = Date.now() - startTime
    logApiCall('DELETE', '/api/animals', 500, duration)
    const { message, errorId } = getErrorMessage(error)
    logger.error('API/ANIMALS', `DELETE failed: ${errorId}`, error)
    return NextResponse.json(
      { message, errorId },
      { status: 500 }
    )
  }
}
