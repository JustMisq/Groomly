import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'
import { logger, getErrorMessage } from '@/lib/logger'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

export async function POST(request: NextRequest) {
  if (!webhookSecret) {
    logger.error('STRIPE/WEBHOOK', 'STRIPE_WEBHOOK_SECRET not configured')
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    )
  }

  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    logger.error('STRIPE/WEBHOOK', 'No stripe-signature header found')
    return NextResponse.json(
      { error: 'No signature found' },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    logger.info('STRIPE/WEBHOOK', `Event verified: ${event.type}`)
  } catch (error) {
    logger.error('STRIPE/WEBHOOK', 'Signature verification failed', error)
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    )
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        
        if (session.customer_email && session.subscription) {
          const user = await prisma.user.findUnique({
            where: { email: session.customer_email },
          })

          if (user) {
            const subscription = await stripe.subscriptions.retrieve(
              session.subscription as string
            )

            const priceId = subscription.items.data[0]?.price.id
            const plan =
              priceId === process.env.STRIPE_PRICE_ID_MONTHLY
                ? 'monthly'
                : 'yearly'
            
            const price = plan === 'monthly' ? 15 : 150

            await prisma.subscription.upsert({
              where: { userId: user.id },
              create: {
                userId: user.id,
                stripeCustomerId: session.customer as string,
                stripeSubscriptionId: session.subscription as string,
                status: 'active',
                plan,
                price,
                currency: 'EUR',
                currentPeriodStart: new Date(subscription.current_period_start * 1000),
                currentPeriodEnd: new Date(subscription.current_period_end * 1000),
              },
              update: {
                stripeCustomerId: session.customer as string,
                stripeSubscriptionId: session.subscription as string,
                status: 'active',
                plan,
                price,
                currentPeriodStart: new Date(subscription.current_period_start * 1000),
                currentPeriodEnd: new Date(subscription.current_period_end * 1000),
              },
            })

            logger.audit('STRIPE/WEBHOOK', 'SUBSCRIPTION_CREATED', user.id, { plan })
          }
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        
        const subscriptionRecord = await prisma.subscription.findFirst({
          where: { stripeCustomerId: subscription.customer as string },
        })

        if (subscriptionRecord) {
          await prisma.subscription.update({
            where: { id: subscriptionRecord.id },
            data: { status: 'canceled' },
          })

          logger.audit('STRIPE/WEBHOOK', 'SUBSCRIPTION_CANCELED', subscriptionRecord.userId)
        }
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        
        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            invoice.subscription as string
          )

          const subscriptionRecord = await prisma.subscription.findFirst({
            where: { stripeCustomerId: invoice.customer as string },
          })

          if (subscriptionRecord) {
            await prisma.subscription.update({
              where: { id: subscriptionRecord.id },
              data: {
                currentPeriodStart: new Date(subscription.current_period_start * 1000),
                currentPeriodEnd: new Date(subscription.current_period_end * 1000),
              },
            })

            logger.audit('STRIPE/WEBHOOK', 'INVOICE_PAID', subscriptionRecord.userId)
          }
        }
        break
      }

      default:
        logger.debug('STRIPE/WEBHOOK', `Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    logger.error('STRIPE/WEBHOOK', 'Webhook processing failed', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
