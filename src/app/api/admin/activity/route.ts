import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authConfig } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'
import { logger, getErrorMessage, logApiCall } from '@/lib/logger'
import { z } from 'zod'

// ✅ SÉCURITÉ: Validation des query params
const activityQuerySchema = z.object({
  action: z.string().optional(),
  resource: z.string().optional(),
  userId: z.string().optional(),
  salonId: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(50),
})

const activityCreateSchema = z.object({
  action: z.string().min(1).max(50),
  resource: z.string().min(1).max(50),
  resourceId: z.string().optional(),
  salonId: z.string().optional(),
  oldValue: z.any().optional(),
  newValue: z.any().optional(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
})

// GET /api/admin/activity - Lister les activités
export async function GET(request: NextRequest) {
  const startTime = Date.now()
  try {
    const session = await getServerSession(authConfig)
    if (!session?.user?.id || !session.user.isAdmin) {
      logger.warn('ADMIN/ACTIVITY', `Unauthorized access attempt: ${session?.user?.id}`)
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const queryParams = activityQuerySchema.parse({
      action: searchParams.get('action'),
      resource: searchParams.get('resource'),
      userId: searchParams.get('userId'),
      salonId: searchParams.get('salonId'),
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
    })

    const skip = (queryParams.page - 1) * queryParams.limit

    const where: any = {}
    if (queryParams.action && queryParams.action !== 'all') where.action = queryParams.action
    if (queryParams.resource && queryParams.resource !== 'all') where.resource = queryParams.resource
    if (queryParams.userId) where.userId = queryParams.userId
    if (queryParams.salonId) where.salonId = queryParams.salonId

    const activities = await prisma.activityLog.findMany({
      where,
      skip,
      take: queryParams.limit,
      orderBy: { createdAt: 'desc' },
    })

    const total = await prisma.activityLog.count({ where })
    const totalPages = Math.ceil(total / queryParams.limit)

    const duration = Date.now() - startTime
    logApiCall('GET', '/api/admin/activity', 200, duration, session.user.id)

    return NextResponse.json({
      activities,
      pagination: { page: queryParams.page, limit: queryParams.limit, total, totalPages },
    })
  } catch (error) {
    const duration = Date.now() - startTime
    logApiCall('GET', '/api/admin/activity', 400, duration)

    if (error instanceof z.ZodError) {
      logger.warn('ADMIN/ACTIVITY', 'Invalid query params', (error as any).issues)
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 })
    }

    const { message, errorId } = getErrorMessage(error)
    logger.error('ADMIN/ACTIVITY', `GET failed: ${errorId}`, error)
    
    return NextResponse.json({ error: message, errorId }, { status: 500 })
  }
}

// POST /api/admin/activity - Créer une activité
export async function POST(request: NextRequest) {
  const startTime = Date.now()
  try {
    const session = await getServerSession(authConfig)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const body = await request.json()
    
    // ✅ SÉCURITÉ: Validation stricte
    const validatedData = activityCreateSchema.parse(body)

    const activity = await prisma.activityLog.create({
      data: {
        ...validatedData,
        userId: session.user.id,
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || undefined,
      },
    })

    const duration = Date.now() - startTime
    logApiCall('POST', '/api/admin/activity', 201, duration, session.user.id)
    logger.audit('ADMIN/ACTIVITY', `${validatedData.action}_LOGGED`, session.user.id)

    return NextResponse.json(activity, { status: 201 })
  } catch (error) {
    const duration = Date.now() - startTime
    logApiCall('POST', '/api/admin/activity', 400, duration)

    if (error instanceof z.ZodError) {
      logger.warn('ADMIN/ACTIVITY', 'Invalid activity data', (error as any).issues)
      return NextResponse.json({ error: 'Invalid data', errors: (error as any).issues }, { status: 400 })
    }

    const { message, errorId } = getErrorMessage(error)
    logger.error('ADMIN/ACTIVITY', `POST failed: ${errorId}`, error)
    
    return NextResponse.json({ error: message, errorId }, { status: 500 })
  }
}
