import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import emailjs from '@emailjs/browser';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

// Inizializza EmailJS
emailjs.init(process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!);

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  // Gestisci l'evento
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session;
      
      // Recupera i dettagli dell'ordine
      const { 
        customer_email,
        metadata,
        amount_total,
        payment_status 
      } = session;

      if (payment_status === 'paid' && metadata) {
        // Prepara i dati per l'email
        const orderItems = JSON.parse(metadata.orderItems || '[]');
        const orderDetails = orderItems.map((item: any) => 
          `${item.name} x${item.quantity} - €${(item.price * item.quantity).toFixed(2)}`
        ).join('\n');

        // Invia email di conferma
        try {
          // Email al ristorante
          await fetch('https://api.emailjs.com/api/v1.0/email/send', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              service_id: process.env.EMAILJS_SERVICE_ID,
              template_id: process.env.EMAILJS_TEMPLATE_ID,
              user_id: process.env.EMAILJS_PUBLIC_KEY,
              accessToken: process.env.EMAILJS_PRIVATE_KEY,
              template_params: {
                customer_name: metadata.customerName,
                customer_email: customer_email,
                customer_phone: metadata.customerPhone,
                customer_address: metadata.customerAddress,
                order_details: orderDetails,
                total_amount: (amount_total! / 100).toFixed(2),
                order_date: new Date().toLocaleString('it-IT'),
                order_id: session.id
              }
            })
          });

          console.log('Email inviata con successo');
        } catch (error) {
          console.error('Errore invio email:', error);
        }
      }
      break;

    case 'payment_intent.succeeded':
      console.log('Pagamento completato con successo');
      break;

    case 'payment_intent.payment_failed':
      console.log('Pagamento fallito');
      break;

    default:
      console.log(`Evento non gestito: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}