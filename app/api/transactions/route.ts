import { currentUser } from "@clerk/nextjs/server"; 
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function GET() {
  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress || null;

  if (!email) {
    return NextResponse.json({ error: 'Email not found' }, { status: 404 });
  }

  const sessions = await stripe.checkout.sessions.list({
    limit: 10,
  });

  const results = [];

  for (const session of sessions.data) {
    results.push(session);
  }

  return NextResponse.json({ transactions: results });
}
