import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authConfig } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { logger, getErrorMessage, logApiCall } from '@/lib/logger'

// ✅ SÉCURITÉ: Validation stricte pour supprimer toutes les données
const deleteDataSchema = z.object({
  password: z.string().min(1, 'Password is required'),
  confirmation: z.literal('DELETE_ALL_DATA'),
})

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'

  try {
    const session = await getServerSession(authConfig)
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // ✅ SÉCURITÉ: Validation stricte
    const validatedData = deleteDataSchema.parse(body)

    // Récupérer l'utilisateur
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user) {
      logger.warn('DELETE_DATA', `User not found: ${session.user.id}`)
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }

    // ✅ SÉCURITÉ: Vérifier le mot de passe (permet d'éviter les suppressions accidentelles)
    const passwordMatch = await bcrypt.compare(validatedData.password, user.password)
    if (!passwordMatch) {
      logger.warn('DELETE_DATA', `Invalid password attempt for user: ${session.user.id}`)
      return NextResponse.json(
        { message: 'Invalid password' },
        { status: 401 }
      )
    }

    // Récupérer le salon
    const salon = await prisma.salon.findUnique({
      where: { userId: user.id },
    })

    if (salon) {
      // ✅ SÉCURITÉ: Supprimer en cascade mais garder le salon
      await Promise.all([
        prisma.invoice.deleteMany({ where: { salonId: salon.id } }),
        prisma.appointment.deleteMany({ where: { salonId: salon.id } }),
        prisma.inventoryItem.deleteMany({ where: { salonId: salon.id } }),
        prisma.service.deleteMany({ where: { salonId: salon.id } }),
        prisma.animal.deleteMany({
          where: {
            client: { salonId: salon.id },
          },
        }),
        prisma.client.deleteMany({ where: { salonId: salon.id } }),
      ])
    }

    // ✅ AUDIT: Logger cette action sensible
    logger.audit('DELETE_DATA', 'ALL_USER_DATA_DELETED', user.id, {
      ip: clientIp,
      deletedSalonData: !!salon,
    })

    const duration = Date.now() - startTime
    logApiCall('POST', '/api/delete-all-data', 200, duration, user.id)

    return NextResponse.json({
      message: 'All business data deleted successfully. Your salon structure remains.',
    })
  } catch (error) {
    const duration = Date.now() - startTime
    logApiCall('POST', '/api/delete-all-data', 400, duration)

    if (error instanceof z.ZodError) {
      logger.warn('DELETE_DATA', 'Validation error', (error as any).issues)
      return NextResponse.json(
        { message: 'Invalid data', errors: (error as any).issues },
        { status: 400 }
      )
    }

    const { message, errorId } = getErrorMessage(error)
    logger.error('DELETE_DATA', `Deletion failed: ${errorId}`, error)

    return NextResponse.json(
      { message: message || 'Error deleting data', errorId },
      { status: 500 }
    )
  }
}
