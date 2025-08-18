import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Inizializza Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

// Disabilita il body parsing per i webhook Stripe
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // Ottieni il body raw e la signature
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      console.error('❌ Manca la signature Stripe');
      return NextResponse.json(
        { error: 'Missing stripe signature' },
        { status: 400 }
      );
    }

    // Verifica che il webhook secret sia configurato
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.error('❌ STRIPE_WEBHOOK_SECRET non configurato');
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    let event: Stripe.Event;

    try {
      // Verifica la signature del webhook
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err: any) {
      console.error(`❌ Errore verifica webhook: ${err.message}`);
      return NextResponse.json(
        { error: `Webhook Error: ${err.message}` },
        { status: 400 }
      );
    }

    // Gestisci i diversi tipi di eventi
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        console.log('✅ Pagamento completato:', {
          sessionId: session.id,
          customerEmail: session.customer_email,
          amount: session.amount_total ? session.amount_total / 100 : 0,
          paymentStatus: session.payment_status
        });

        // Estrai i metadata
        const metadata = session.metadata || {};
        const customerName = metadata.customer_name || 'Cliente';
        const pickupDate = metadata.pickup_date || 'Da concordare';
        const orderDetails = metadata.order_details ? JSON.parse(metadata.order_details) : [];
        const totalAmount = session.amount_total ? session.amount_total / 100 : 0;

        // Qui puoi aggiungere la logica per:
        // 1. Salvare l'ordine su Firebase
        // 2. Inviare email di conferma con EmailJS
        // 3. Notificare il ristorante

        // Invia email con EmailJS
        if (process.env.EMAILJS_SERVICE_ID && process.env.EMAILJS_TEMPLATE_ID) {
          await sendOrderEmail({
            customerName,
            customerEmail: session.customer_email || '',
            customerPhone: metadata.customer_phone || '',
            pickupDate,
            items: orderDetails,
            totalAmount,
            paymentMethod: 'Stripe',
            sessionId: session.id
          });
        }

        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('💰 PaymentIntent succeeded:', paymentIntent.id);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('❌ Payment failed:', paymentIntent.id);
        
        // Qui puoi gestire i pagamenti falliti
        // Per esempio, inviare una notifica al cliente
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        // Gestisci eventi di subscription se necessario
        console.log(`📊 Subscription event: ${event.type}`);
        break;
      }

      default:
        console.log(`⚠️ Evento non gestito: ${event.type}`);
    }

    // Rispondi a Stripe per confermare la ricezione
    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('❌ Errore nel webhook:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

// Funzione per inviare email con EmailJS
async function sendOrderEmail(orderData: any) {
  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      pickupDate,
      items,
      totalAmount,
      paymentMethod,
      sessionId
    } = orderData;

    // Formatta la lista degli articoli
    const itemsList = items.map((item: any) => 
      `• ${item.name} x${item.quantity} = €${(item.price * item.quantity).toFixed(2)}`
    ).join('\n');

    // Parametri per il template EmailJS
    const templateParams = {
      to_email: process.env.NOTIFICATION_EMAIL || 'ordini@pastosano.it',
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone,
      pickup_date: pickupDate,
      order_details: itemsList,
      total_amount: totalAmount.toFixed(2),
      payment_method: paymentMethod,
      payment_status: 'PAGATO',
      order_id: sessionId,
      order_date: new Date().toLocaleDateString('it-IT'),
      order_time: new Date().toLocaleTimeString('it-IT')
    };

    // Invia email tramite EmailJS API
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        service_id: process.env.EMAILJS_SERVICE_ID,
        template_id: process.env.EMAILJS_TEMPLATE_ID,
        user_id: process.env.EMAILJS_PUBLIC_KEY,
        accessToken: process.env.EMAILJS_PRIVATE_KEY,
        template_params: templateParams
      })
    });

    if (response.ok) {
      console.log('✅ Email ordine inviata con successo');
    } else {
      const errorText = await response.text();
      console.error('❌ Errore invio email:', errorText);
    }

  } catch (error) {
    console.error('❌ Errore invio email:', error);
  }
}

// Endpoint per verificare lo stato del webhook (GET)
export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'active',
    endpoint: '/api/stripe-webhook',
    message: 'Stripe webhook endpoint is active',
    timestamp: new Date().toISOString()
  });
}