import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

export async function POST(request: NextRequest) {
  if (!webhookSecret) {
    console.error('🔴 STRIPE_WEBHOOK_SECRET not configured')
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    )
  }

  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  console.log('🔵 Webhook reçu - signature:', signature ? 'OUI' : 'NON')

  if (!signature) {
    console.error('🔴 Pas de signature Stripe')
    return NextResponse.json(
      { error: 'No signature found' },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    console.log('✅ Signature vérifiée! Événement:', event.type)
  } catch (error) {
    console.error('🔴 Erreur vérification signature:', error)
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
          // Récupérer l'utilisateur par email
          const user = await prisma.user.findUnique({
            where: { email: session.customer_email },
          })

          if (user) {
            // Récupérer les détails de l'abonnement Stripe
            const subscription = await stripe.subscriptions.retrieve(
              session.subscription as string
            )

            // Déterminer le plan (mensuel ou annuel)
            const priceId = subscription.items.data[0]?.price.id
            const plan =
              priceId === process.env.STRIPE_PRICE_ID_MONTHLY
                ? 'monthly'
                : 'yearly'
            
            // Déterminer le prix (15€ par mois ou 150€ par an)
            const price = plan === 'monthly' ? 15 : 150

            // Créer ou mettre à jour l'abonnement
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

            console.log(`Subscription created for user ${user.id}`)
          }
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        
        // Trouver l'utilisateur par Stripe customer ID
        const subscriptionRecord = await prisma.subscription.findFirst({
          where: { stripeCustomerId: subscription.customer as string },
        })

        if (subscriptionRecord) {
          // Marquer l'abonnement comme annulé
          await prisma.subscription.update({
            where: { id: subscriptionRecord.id },
            data: { status: 'canceled' },
          })

          console.log(`Subscription canceled for user ${subscriptionRecord.userId}`)
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
            // Mettre à jour les dates de la période de facturation
            await prisma.subscription.update({
              where: { id: subscriptionRecord.id },
              data: {
                currentPeriodStart: new Date(subscription.current_period_start * 1000),
                currentPeriodEnd: new Date(subscription.current_period_end * 1000),
              },
            })

            console.log(`Invoice paid for subscription ${subscriptionRecord.id}`)
          }
        }
        break
      }

      default:
        console.log(`Unhandled event type ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
