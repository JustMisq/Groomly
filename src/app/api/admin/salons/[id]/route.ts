import { getServerSession } from 'next-auth'
import { authConfig } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authConfig)

    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const salon = await prisma.salon.findUnique({
      where: { id },
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
            role: true,
            status: true
          }
        },
        clients: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        },
        appointments: {
          select: {
            id: true
          }
        },
        services: {
          select: {
            id: true
          }
        },
        _count: {
          select: {
            appointments: true,
            services: true,
            clients: true
          }
        }
      }
    })

    if (!salon) {
      return NextResponse.json({ error: 'Salon not found' }, { status: 404 })
    }

    return NextResponse.json({ salon }, { status: 200 })
  } catch (error) {
    console.error('GET /api/admin/salons/[id] error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authConfig)

    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await req.json()

    // Check if salon exists
    const existingSalon = await prisma.salon.findUnique({
      where: { id }
    })

    if (!existingSalon) {
      return NextResponse.json({ error: 'Salon not found' }, { status: 404 })
    }

    // Update salon
    const updatedData: any = {}
    if (data.name !== undefined) updatedData.name = data.name
    if (data.address !== undefined) updatedData.address = data.address
    if (data.city !== undefined) updatedData.city = data.city
    if (data.phone !== undefined) updatedData.phone = data.phone
    if (data.email !== undefined) updatedData.email = data.email
    if (data.website !== undefined) updatedData.website = data.website
    if (data.status !== undefined) updatedData.status = data.status

    const salon = await prisma.salon.update({
      where: { id },
      data: updatedData,
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
            role: true,
            status: true
          }
        },
        clients: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        },
        _count: {
          select: {
            appointments: true,
            services: true
          }
        }
      }
    })

    return NextResponse.json({ salon }, { status: 200 })
  } catch (error) {
    console.error('PUT /api/admin/salons/[id] error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authConfig)

    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if salon exists and has no associated data
    const salon = await prisma.salon.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            members: true,
            clients: true,
            appointments: true
          }
        }
      }
    })

    if (!salon) {
      return NextResponse.json({ error: 'Salon not found' }, { status: 404 })
    }

    // Prevent deletion if salon has associated data
    if (salon._count.members > 0 || salon._count.clients > 0) {
      return NextResponse.json(
        { error: 'Cannot delete salon with associated members or clients' },
        { status: 400 }
      )
    }

    await prisma.salon.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Salon deleted' }, { status: 200 })
  } catch (error) {
    console.error('DELETE /api/admin/salons/[id] error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
