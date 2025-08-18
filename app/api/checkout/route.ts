import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function POST(request: NextRequest) {
  try {
    const { items, customerEmail, customerName, customerAddress, customerPhone } = await request.json();

    // Crea line items per Stripe
    const lineItems = items.map((item: any) => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: item.name,
          description: item.description,
          images: [item.image],
        },
        unit_amount: item.price * 100, // Stripe usa centesimi
      },
      quantity: item.quantity,
    }));

    // Crea sessione di checkout
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/`,
      customer_email: customerEmail,
      metadata: {
        customerName,
        customerAddress,
        customerPhone,
        orderItems: JSON.stringify(items.map((item: any) => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price
        })))
      },
      shipping_address_collection: {
        allowed_countries: ['IT'],
      },
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error('Errore checkout:', error);
    return NextResponse.json(
      { error: 'Errore durante la creazione del checkout' },
      { status: 500 }
    );
  }
}