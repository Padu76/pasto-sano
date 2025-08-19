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
        
        console.log('✅ Pagamento Stripe completato:', {
          sessionId: session.id,
          customerEmail: session.customer_email,
          amount: session.amount_total ? session.amount_total / 100 : 0,
          paymentStatus: session.payment_status
        });

        // Estrai i metadata
        const metadata = session.metadata || {};
        const customerName = metadata.customer_name || 'Cliente';
        const customerPhone = metadata.customer_phone || '';
        const customerEmail = session.customer_email || metadata.customer_email || '';
        const pickupDate = metadata.pickup_date || 'Da concordare';
        const pickupTime = metadata.pickup_time || '';
        const orderNotes = metadata.order_notes || '';
        const discountCode = metadata.discount_code || '';
        const discountPercent = metadata.discount_percent ? parseFloat(metadata.discount_percent) : 0;
        
        // Parse order details
        let orderDetails = [];
        try {
          orderDetails = metadata.order_details ? JSON.parse(metadata.order_details) : [];
        } catch (e) {
          console.error('Errore parsing order_details:', e);
          orderDetails = [];
        }

        // Calcola totali
        const totalAmount = session.amount_total ? session.amount_total / 100 : 0;
        const subtotalAmount = discountPercent > 0 ? 
          (totalAmount / (1 - discountPercent / 100)) : totalAmount;
        const discountAmount = subtotalAmount - totalAmount;

        // Invia email di notifica con EmailJS
        try {
          await sendStripeOrderEmail({
            customerName,
            customerEmail,
            customerPhone,
            pickupDate,
            pickupTime,
            items: orderDetails,
            totalAmount,
            subtotalAmount,
            discountCode,
            discountPercent,
            discountAmount,
            orderNotes,
            sessionId: session.id,
            paymentIntentId: session.payment_intent as string
          });
          console.log('✅ Email di notifica ordine Stripe inviata');
        } catch (emailError) {
          console.error('❌ Errore invio email notifica:', emailError);
          // Non bloccare il webhook se l'email fallisce
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
        
        // Invia notifica di pagamento fallito
        if (paymentIntent.metadata && paymentIntent.metadata.customer_email) {
          await sendPaymentFailedEmail({
            customerEmail: paymentIntent.metadata.customer_email,
            customerName: paymentIntent.metadata.customer_name || 'Cliente',
            amount: paymentIntent.amount / 100,
            errorMessage: paymentIntent.last_payment_error?.message || 'Pagamento non riuscito'
          });
        }
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

// Funzione per inviare email con EmailJS per ordini Stripe
async function sendStripeOrderEmail(orderData: any) {
  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      pickupDate,
      pickupTime,
      items,
      totalAmount,
      subtotalAmount,
      discountCode,
      discountPercent,
      discountAmount,
      orderNotes,
      sessionId,
      paymentIntentId
    } = orderData;

    // Formatta la lista degli articoli con dettagli completi
    let itemsList = '';
    let totalItems = 0;
    
    if (items && items.length > 0) {
      itemsList = items.map((item: any) => {
        totalItems += item.quantity || 1;
        const itemTotal = (item.price || 0) * (item.quantity || 1);
        return `• ${item.name} x${item.quantity || 1} = €${itemTotal.toFixed(2)}`;
      }).join('\n');
    } else {
      itemsList = 'Nessun articolo specificato';
    }

    // Formatta data e ora di ritiro
    const formattedPickupDate = pickupDate || 'Da concordare';
    const formattedPickupTime = pickupTime || '';
    const pickupInfo = formattedPickupTime ? 
      `${formattedPickupDate} alle ${formattedPickupTime}` : 
      formattedPickupDate;

    // Parametri per il template EmailJS
    const templateParams = {
      // Destinatario
      to_email: process.env.NOTIFICATION_EMAIL || 'ordini@pastosano.it',
      
      // Oggetto email
      subject: `🍽️ NUOVO ORDINE STRIPE - ${customerName} - €${totalAmount.toFixed(2)}`,
      
      // Tipo ordine
      order_type: '💳 PAGAMENTO CON CARTA (Stripe)',
      
      // Info cliente
      customer_name: customerName,
      customer_email: customerEmail || 'Non fornita',
      customer_phone: customerPhone || 'Non fornito',
      
      // Info ordine
      pickup_date: pickupInfo,
      payment_method: 'Carta di Credito/Debito (Stripe)',
      payment_status: '✅ PAGATO ONLINE',
      
      // Totali
      total_amount: discountCode ? 
        `€${subtotalAmount.toFixed(2)} → €${totalAmount.toFixed(2)} (con sconto)` : 
        `€${totalAmount.toFixed(2)}`,
      
      // Lista articoli
      items_list: itemsList,
      total_items: totalItems,
      
      // Sconto (se applicato)
      discount_info: discountCode ? 
        `🎁 Sconto ${discountCode} (-${discountPercent}%) = -€${discountAmount.toFixed(2)}` : 
        'Nessuno sconto applicato',
      
      // Note speciali
      special_notes: orderNotes ? 
        `📝 Note cliente: ${orderNotes}` : 
        '✅ Pagamento completato con successo via Stripe',
      
      // ID transazione
      order_id: `Stripe: ${sessionId}`,
      payment_id: paymentIntentId || '',
      
      // Timestamp
      order_date: new Date().toLocaleDateString('it-IT'),
      order_time: new Date().toLocaleTimeString('it-IT'),
      
      // Colori per il template (se supportati)
      header_color: '#635bff', // Colore Stripe
      status_color: '#28a745'  // Verde per pagato
    };

    // Log per debug
    console.log('📧 Invio email con parametri:', {
      to: templateParams.to_email,
      customer: customerName,
      amount: totalAmount,
      items: totalItems
    });

    // Chiamata API EmailJS
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
      console.log('✅ Email ordine Stripe inviata con successo a:', process.env.NOTIFICATION_EMAIL);
      const result = await response.text();
      console.log('📧 Risposta EmailJS:', result);
    } else {
      const errorText = await response.text();
      console.error('❌ Errore risposta EmailJS:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      throw new Error(`EmailJS error: ${response.status} - ${errorText}`);
    }

  } catch (error) {
    console.error('❌ Errore invio email ordine Stripe:', error);
    throw error; // Rilancia l'errore per gestirlo nel chiamante
  }
}

// Funzione per inviare email di pagamento fallito
async function sendPaymentFailedEmail(data: any) {
  try {
    const { customerEmail, customerName, amount, errorMessage } = data;

    const templateParams = {
      to_email: process.env.NOTIFICATION_EMAIL || 'ordini@pastosano.it',
      subject: `⚠️ PAGAMENTO FALLITO - ${customerName}`,
      customer_name: customerName,
      customer_email: customerEmail,
      total_amount: amount.toFixed(2),
      error_message: errorMessage,
      order_date: new Date().toLocaleDateString('it-IT'),
      order_time: new Date().toLocaleTimeString('it-IT'),
      special_notes: `⚠️ Il pagamento di €${amount.toFixed(2)} non è andato a buon fine. Motivo: ${errorMessage}`,
      payment_status: '❌ PAGAMENTO FALLITO',
      header_color: '#dc3545',
      status_color: '#dc3545'
    };

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
      console.log('✅ Email pagamento fallito inviata');
    } else {
      console.error('❌ Errore invio email pagamento fallito');
    }
  } catch (error) {
    console.error('❌ Errore in sendPaymentFailedEmail:', error);
  }
}

// Endpoint per verificare lo stato del webhook (GET)
export async function GET(request: NextRequest) {
  // Verifica configurazione
  const config = {
    stripe_key: !!process.env.STRIPE_SECRET_KEY,
    webhook_secret: !!process.env.STRIPE_WEBHOOK_SECRET,
    emailjs_service: !!process.env.EMAILJS_SERVICE_ID,
    emailjs_template: !!process.env.EMAILJS_TEMPLATE_ID,
    emailjs_public: !!process.env.EMAILJS_PUBLIC_KEY,
    emailjs_private: !!process.env.EMAILJS_PRIVATE_KEY,
    notification_email: process.env.NOTIFICATION_EMAIL || 'non configurata'
  };

  const allConfigured = Object.values(config).every(v => v === true || typeof v === 'string');

  return NextResponse.json({
    status: allConfigured ? 'active' : 'partial',
    endpoint: '/api/stripe-webhook',
    message: 'Stripe webhook endpoint status',
    configuration: config,
    timestamp: new Date().toISOString(),
    ready: allConfigured
  });
}