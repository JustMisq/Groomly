import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authConfig } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'
import { logger, getErrorMessage } from '@/lib/logger'

export async function GET() {
  try {
    const session = await getServerSession(authConfig)

    if (!session?.user?.id) {
      logger.debug('API/SUBSCRIPTION', 'No user session')
      return NextResponse.json(
        { hasActiveSubscription: false },
        { status: 401 }
      )
    }

    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    })

    const hasActiveSubscription = 
      subscription !== null && 
      subscription.status === 'active' &&
      subscription.currentPeriodEnd > new Date()

    return NextResponse.json({ 
      hasActiveSubscription,
      subscription: hasActiveSubscription ? subscription : null 
    })
  } catch (error) {
    const { message, errorId } = getErrorMessage(error)
    logger.error('API/SUBSCRIPTION', `Check failed: ${errorId}`, error)
    return NextResponse.json(
      { hasActiveSubscription: false, message, errorId },
      { status: 500 }
    )
  }
}

