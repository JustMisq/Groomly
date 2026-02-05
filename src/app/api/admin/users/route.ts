import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authConfig } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

// GET /api/admin/users - Liste de tous les utilisateurs
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig)
    if (!session?.user?.id || !session.user.isAdmin) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search')

    const skip = (page - 1) * limit

    const where: any = {}
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ]
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        isAdmin: true,
        createdAt: true,
        salon: {
          select: {
            id: true,
            name: true,
          },
        },
        subscription: {
          select: {
            status: true,
            plan: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    })

    const total = await prisma.user.count({ where })
    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      users,
      pagination: { page, limit, total, totalPages },
    })
  } catch (error) {
    console.error('Erreur GET /api/admin/users:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
