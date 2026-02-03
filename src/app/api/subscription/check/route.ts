import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authConfig } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authConfig)

    console.log('🔵 API: Checking subscription for user:', session?.user?.id)

    if (!session?.user?.id) {
      console.log('❌ API: No user session')
      return NextResponse.json(
        { hasActiveSubscription: false },
        { status: 401 }
      )
    }

    // Vérifier si l'utilisateur a une subscription active
    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    })

    console.log('API: Subscription found:', subscription)

    const hasActiveSubscription = 
      subscription !== null && 
      subscription.status === 'active' &&
      subscription.currentPeriodEnd > new Date()

    console.log('API: Has active subscription:', hasActiveSubscription)

    return NextResponse.json({ 
      hasActiveSubscription,
      subscription: hasActiveSubscription ? subscription : null 
    })
  } catch (error) {
    console.error('💥 Error checking subscription:', error)
    return NextResponse.json(
      { hasActiveSubscription: false, error: String(error) },
      { status: 500 }
    )
  }
}

