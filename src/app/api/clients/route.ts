import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await auth()
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
      where: { salonId: salon.id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(clients)
  } catch (error) {
    console.error('Get clients error:', error)
    return NextResponse.json(
      { message: 'Error fetching clients' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
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

    const client = await prisma.client.create({
      data: {
        ...body,
        salonId: salon.id,
      },
    })

    return NextResponse.json(client, { status: 201 })
  } catch (error) {
    console.error('Post client error:', error)
    return NextResponse.json(
      { message: 'Error creating client' },
      { status: 500 }
    )
  }
}
