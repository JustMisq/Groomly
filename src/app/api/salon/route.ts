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
      return NextResponse.json(
        { message: 'Salon not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(salon)
  } catch (error) {
    console.error('Get salon error:', error)
    return NextResponse.json(
      { message: 'Error fetching salon' },
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

    const body = await request.json()
    
    // Vérifier que l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }
    
    let salon = await prisma.salon.findUnique({
      where: { userId: session.user.id },
    })

    if (!salon) {
      salon = await prisma.salon.create({
        data: {
          userId: session.user.id,
          ...body,
        },
      })
    } else {
      salon = await prisma.salon.update({
        where: { id: salon.id },
        data: body,
      })
    }

    return NextResponse.json(salon)
  } catch (error) {
    console.error('Post salon error:', error)
    return NextResponse.json(
      { message: 'Error saving salon' },
      { status: 500 }
    )
  }
}
