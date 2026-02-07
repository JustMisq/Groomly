import { getServerSession } from 'next-auth'
import { authConfig } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authConfig)

    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get query params for filtering
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    // Build where clause
    const where: any = {}
    if (status && status !== 'all') {
      where.status = status
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Fetch salons
    const salons = await prisma.salon.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        members: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true
          },
          take: 5
        },
        clients: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          },
          take: 5 // Limit to first 5 for list view
        },
        _count: {
          select: {
            appointments: true,
            services: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ salons }, { status: 200 })
  } catch (error) {
    console.error('GET /api/admin/salons error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authConfig)

    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await req.json()

    // Validate required fields
    if (!data.name || !data.address || !data.phone || !data.email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const salon = await prisma.salon.create({
      data: {
        name: data.name,
        address: data.address,
        city: data.city,
        phone: data.phone,
        email: data.email,
        userId: session.user.id // Required field - owner of the salon
      },
      include: {
        user: true,
        members: true,
        clients: true
      }
    })

    return NextResponse.json({ salon }, { status: 201 })
  } catch (error) {
    console.error('POST /api/admin/salons error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
