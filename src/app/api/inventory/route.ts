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
      return NextResponse.json([], { status: 200 })
    }

    const items = await prisma.inventoryItem.findMany({
      where: { salonId: salon.id },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(items)
  } catch (error) {
    console.error('Get inventory error:', error)
    return NextResponse.json(
      { message: 'Error fetching inventory', error: String(error) },
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
    const { name, description, quantity, unit, price } = body

    if (!name || quantity === undefined || !unit || price === undefined) {
      return NextResponse.json(
        { message: 'name, quantity, unit, and price are required' },
        { status: 400 }
      )
    }

    const item = await prisma.inventoryItem.create({
      data: {
        name,
        description: description || null,
        quantity: parseInt(quantity),
        unit,
        price: parseFloat(price),
        salonId: salon.id,
        lastRestocked: new Date(),
      },
    })

    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    console.error('Create inventory error:', error)
    return NextResponse.json(
      { message: 'Error creating inventory item', error: String(error) },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
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
    const { id, name, description, quantity, unit, price } = body

    if (!id || !name || quantity === undefined || !unit || price === undefined) {
      return NextResponse.json(
        { message: 'id, name, quantity, unit, and price are required' },
        { status: 400 }
      )
    }

    // Vérifier que l'item appartient au salon
    const item = await prisma.inventoryItem.findUnique({
      where: { id },
    })

    if (!item || item.salonId !== salon.id) {
      return NextResponse.json(
        { message: 'Item not found' },
        { status: 404 }
      )
    }

    const updated = await prisma.inventoryItem.update({
      where: { id },
      data: {
        name,
        description: description || null,
        quantity: parseInt(quantity),
        unit,
        price: parseFloat(price),
        lastRestocked: new Date(),
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Update inventory error:', error)
    return NextResponse.json(
      { message: 'Error updating inventory item', error: String(error) },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { message: 'id is required' },
        { status: 400 }
      )
    }

    // Vérifier que l'item appartient au salon
    const item = await prisma.inventoryItem.findUnique({
      where: { id },
    })

    if (!item || item.salonId !== salon.id) {
      return NextResponse.json(
        { message: 'Item not found' },
        { status: 404 }
      )
    }

    await prisma.inventoryItem.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Item deleted' })
  } catch (error) {
    console.error('Delete inventory error:', error)
    return NextResponse.json(
      { message: 'Error deleting inventory item', error: String(error) },
      { status: 500 }
    )
  }
}
