import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authConfig } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'
import { clientSchema } from '@/lib/validations'
import { logger, getErrorMessage, logApiCall } from '@/lib/logger'

export async function GET(request: NextRequest) {
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
      return NextResponse.json([], { status: 200 })
    }

    const clients = await prisma.client.findMany({
      where: { salonId: salon.id, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    })

    const duration = Date.now() - startTime
    logApiCall('GET', '/api/clients', 200, duration, session.user.id)

    return NextResponse.json(clients)
  } catch (error) {
    const duration = Date.now() - startTime
    logApiCall('GET', '/api/clients', 500, duration)
    
    const { message, errorId } = getErrorMessage(error)
    logger.error('API/CLIENTS', `GET failed: ${errorId}`, error)

    return NextResponse.json(
      { message, errorId },
      { status: 500 }
    )
  }
}

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
      logger.warn('API/CLIENTS', `No salon for user ${session.user.id}`)
      return NextResponse.json(
        { 
          message: 'Salon not found - Please create a salon first in the "Salon" section',
          error: 'NO_SALON'
        },
        { status: 404 }
      )
    }

    const body = await request.json()

    // ✅ SÉCURITÉ: Validation avec Zod
    const validatedData = clientSchema.parse(body)

    const client = await prisma.client.create({
      data: {
        ...validatedData,
        salonId: salon.id,
      },
    })
    
    const duration = Date.now() - startTime
    logApiCall('POST', '/api/clients', 201, duration, session.user.id)
    logger.audit('API/CLIENTS', 'CLIENT_CREATED', session.user.id, { clientId: client.id })

    return NextResponse.json(client, { status: 201 })
  } catch (error) {
    const duration = Date.now() - startTime
    logApiCall('POST', '/api/clients', 400, duration)

    if (error instanceof Error && error.name === 'ZodError') {
      logger.warn('API/CLIENTS', 'Validation error', (error as any).errors)
      return NextResponse.json(
        { 
          message: 'Invalid data',
          errors: (error as any).errors
        },
        { status: 400 }
      )
    }

    const { message, errorId } = getErrorMessage(error)
    logger.error('API/CLIENTS', `POST failed: ${errorId}`, error)

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
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json(
        { message: 'id is required' },
        { status: 400 }
      )
    }

    // ✅ SÉCURITÉ: S'assurer que le client appartient au salon de l'utilisateur
    const client = await prisma.client.findFirst({
      where: {
        id,
        salonId: salon.id,
      },
    })

    if (!client) {
      logger.warn('API/CLIENTS', `Unauthorized update attempt for client ${id}`, { userId: session.user.id })
      return NextResponse.json(
        { message: 'Client not found' },
        { status: 404 }
      )
    }

    // ✅ SÉCURITÉ: Valider les données de mise à jour
    const validatedData = clientSchema.partial().parse(updateData)

    const updatedClient = await prisma.client.update({
      where: { id },
      data: validatedData,
    })

    const duration = Date.now() - startTime
    logApiCall('PUT', '/api/clients', 200, duration, session.user.id)
    logger.audit('API/CLIENTS', 'CLIENT_UPDATED', session.user.id, { clientId: id })

    return NextResponse.json(updatedClient)
  } catch (error) {
    const duration = Date.now() - startTime
    logApiCall('PUT', '/api/clients', 400, duration)

    if (error instanceof Error && error.name === 'ZodError') {
      logger.warn('API/CLIENTS', 'Validation error', (error as any).errors)
      return NextResponse.json(
        { 
          message: 'Invalid data',
          errors: (error as any).errors
        },
        { status: 400 }
      )
    }

    const { message, errorId } = getErrorMessage(error)
    logger.error('API/CLIENTS', `PUT failed: ${errorId}`, error)

    return NextResponse.json(
      { message, errorId },
      { status: 500 }
    )
  }
}
