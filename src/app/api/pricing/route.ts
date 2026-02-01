import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    return NextResponse.json({
      monthly: {
        price: 15,
        currency: 'EUR',
        plan: 'monthly',
      },
      yearly: {
        price: 150,
        currency: 'EUR',
        plan: 'yearly',
      },
    })
  } catch (error) {
    console.error('Get pricing error:', error)
    return NextResponse.json(
      { message: 'Error fetching pricing' },
      { status: 500 }
    )
  }
}
