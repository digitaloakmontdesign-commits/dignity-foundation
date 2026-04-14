import Stripe from 'stripe'
import { NextResponse } from 'next/server'
import { createClient } from '../../../supabase'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: Request) {
  try {
    const { amount, destination } = await req.json()
    
    if (amount < 500) {
      return NextResponse.json({ error: 'Minimum payout is $5' }, { status: 400 })
    }

    const payout = await stripe.transfers.create({
      amount,
      currency: 'usd',
      destination,
    })

    return NextResponse.json({ success: true, payout })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}