import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { addOrder } from '@/lib/firebase';

// Inizializza Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

// Disabilita il body parsing per i webhook Stripe
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  console.log('🚀 === WEBHOOK STRIPE RICEVUTO ===');
  console.log('🕒 Timestamp:', new Date().toISOString());
  
  try {
    // Ottieni il body raw e la signature
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    console.log('📦 Body length:', body.length);
    console.log('🔐 Signature presente:', !!signature);
    console.log('🔑 STRIPE_WEBHOOK_SECRET configurato:', !!process.env.STRIPE_WEBHOOK_SECRET);

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
      console.log('✅ Signature verificata con successo!');
      console.log('🎯 Event type ricevuto:', event.type);
      console.log('🆔 Event ID:', event.id);
    } catch (err: any) {
      console.error(`❌ Errore verifica webhook: ${err.message}`);
      return NextResponse.json(
        { error: `Webhook Error: ${err.message}` },
        { status: 400 }
      );
    }

    console.log('🔍 Inizio elaborazione evento...');

    // Gestisci i diversi tipi di eventi
    switch (event.type) {
      case 'checkout.session.completed': {
        console.log('🎉 EVENTO CHECKOUT.SESSION.COMPLETED RILEVATO!');
        await handleCheckoutSessionCompleted(event);
        break;
      }

      case 'charge.succeeded': {
        console.log('💳 EVENTO CHARGE.SUCCEEDED RILEVATO!');
        await handleChargeSucceeded(event);
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
        console.log(`⚠️ === EVENTO NON GESTITO: ${event.type} ===`);
        console.log('Event data:', JSON.stringify(event.data, null, 2));
    }

    console.log('🎉 === WEBHOOK STRIPE COMPLETATO CON SUCCESSO ===');
    
    // Rispondi a Stripe per confermare la ricezione
    return NextResponse.json({ received: true, eventType: event.type });

  } catch (error) {
    console.error('❌ === ERRORE GENERALE WEBHOOK ===');
    console.error('Errore:', error);
    console.error('Tipo errore:', typeof error);
    console.error('Stack:', error instanceof Error ? error.stack : 'N/A');
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

// Gestisce evento checkout.session.completed
async function handleCheckoutSessionCompleted(event: Stripe.Event) {
  const session = event.data.object as Stripe.Checkout.Session;
  
  console.log('📋 Dati sessione:', {
    sessionId: session.id,
    customerEmail: session.customer_email,
    amount: session.amount_total ? session.amount_total / 100 : 0,
    paymentStatus: session.payment_status,
    metadataKeys: Object.keys(session.metadata || {})
  });

  // Estrai metadata
  const metadata = session.metadata || {};
  console.log('📋 METADATA COMPLETI:', JSON.stringify(metadata, null, 2));
  
  await processOrder({
    customerName: metadata.customerName || 'Cliente',
    customerPhone: metadata.customerPhone || '',
    customerEmail: session.customer_email || metadata.customerEmail || '',
    customerAddress: metadata.customerAddress || 'Ritiro presso Pasto Sano',
    pickupDate: metadata.pickupDate || 'Da concordare',
    orderNotes: metadata.orderNotes || '',
    discountCode: metadata.discountCode || '',
    discountPercent: metadata.discountPercent ? parseFloat(metadata.discountPercent) : 0,
    orderItems: metadata.orderItems ? JSON.parse(metadata.orderItems) : [],
    totalAmount: session.amount_total ? session.amount_total / 100 : 0,
    originalAmount: metadata.originalAmount ? parseFloat(metadata.originalAmount) : session.amount_total ? session.amount_total / 100 : 0,
    sessionId: session.id,
    paymentIntentId: session.payment_intent as string
  });
}

// Gestisce evento charge.succeeded
async function handleChargeSucceeded(event: Stripe.Event) {
  const charge = event.data.object as Stripe.Charge;
  
  console.log('💳 Dati charge:', {
    chargeId: charge.id,
    amount: charge.amount / 100,
    currency: charge.currency,
    status: charge.status,
    metadataKeys: Object.keys(charge.metadata || {})
  });

  // Per charge.succeeded, i metadata potrebbero essere nel payment_intent
  let metadata = charge.metadata || {};
  
  // Se non ci sono metadata nel charge, prova a recuperarli dal payment_intent
  if (Object.keys(metadata).length === 0 && charge.payment_intent) {
    try {
      console.log('🔍 Recupero metadata da payment_intent...');
      const paymentIntent = await stripe.paymentIntents.retrieve(charge.payment_intent as string);
      metadata = paymentIntent.metadata || {};
      console.log('📋 METADATA DA PAYMENT_INTENT:', JSON.stringify(metadata, null, 2));
    } catch (error) {
      console.error('❌ Errore recupero payment_intent:', error);
    }
  }

  await processOrder({
    customerName: metadata.customerName || charge.billing_details?.name || 'Cliente',
    customerPhone: metadata.customerPhone || charge.billing_details?.phone || '',
    customerEmail: metadata.customerEmail || charge.billing_details?.email || '',
    customerAddress: metadata.customerAddress || 'Ritiro presso Pasto Sano',
    pickupDate: metadata.pickupDate || 'Da concordare',
    orderNotes: metadata.orderNotes || '',
    discountCode: metadata.discountCode || '',
    discountPercent: metadata.discountPercent ? parseFloat(metadata.discountPercent) : 0,
    orderItems: metadata.orderItems ? JSON.parse(metadata.orderItems) : [],
    totalAmount: charge.amount / 100,
    originalAmount: metadata.originalAmount ? parseFloat(metadata.originalAmount) : charge.amount / 100,
    sessionId: charge.id,
    paymentIntentId: charge.payment_intent as string
  });
}

// Funzione comune per processare l'ordine
async function processOrder(orderData: any) {
  const {
    customerName,
    customerPhone,
    customerEmail,
    customerAddress,
    pickupDate,
    orderNotes,
    discountCode,
    discountPercent,
    orderItems,
    totalAmount,
    originalAmount,
    sessionId,
    paymentIntentId
  } = orderData;

  const discountAmount = originalAmount - totalAmount;

  console.log('👤 Dati cliente estratti:', {
    customerName,
    customerEmail,
    customerPhone,
    pickupDate,
    discountCode,
    discountPercent
  });

  console.log('📦 Articoli ordinati:', orderItems.length, 'items');
  console.log('💰 Calcoli finali:', {
    originalAmount,
    discountAmount,
    totalAmount,
    discountPercent
  });

  // 🔥 SALVA ORDINE SU FIREBASE
  try {
    console.log('🔥 === INIZIO SALVATAGGIO SU FIREBASE ===');
    
    const firebaseOrderData = {
      customerName,
      customerEmail,
      customerPhone,
      customerAddress,
      items: orderItems,
      totalAmount,
      paymentMethod: 'stripe',
      paymentMethodName: 'Carta di Credito/Debito (Stripe)',
      paymentStatus: 'paid',
      orderStatus: 'confirmed',
      pickupDate,
      notes: discountCode ? 
        `${orderNotes || ''}\n\nSconto applicato: ${discountCode} (-${discountPercent}%) = -€${discountAmount.toFixed(2)}\n\nStripe: ${sessionId}` : 
        `${orderNotes || ''}\n\nStripe: ${sessionId}`,
      source: 'website',
      timestamp: new Date()
    };
    
    console.log('📝 Dati ordine preparati per Firebase:', {
      customerName: firebaseOrderData.customerName,
      totalAmount: firebaseOrderData.totalAmount,
      itemsCount: firebaseOrderData.items.length,
      paymentMethod: firebaseOrderData.paymentMethod
    });
    
    await addOrder(firebaseOrderData);
    
    console.log('✅ === ORDINE SALVATO SU FIREBASE CON SUCCESSO! ===');
  } catch (firebaseError) {
    console.error('❌ === ERRORE SALVATAGGIO FIREBASE ===');
    console.error('Errore completo:', firebaseError);
    console.error('Tipo errore:', typeof firebaseError);
    console.error('Stack trace:', firebaseError instanceof Error ? firebaseError.stack : 'N/A');
    // Non blocchiamo il webhook se Firebase fallisce
  }

  // 📧 INVIA EMAIL DI NOTIFICA
  try {
    console.log('📧 === INIZIO INVIO EMAIL ===');
    
    await sendStripeOrderEmail({
      customerName,
      customerEmail,
      customerPhone,
      pickupDate,
      items: orderItems,
      totalAmount,
      originalAmount,
      discountCode,
      discountPercent,
      discountAmount,
      orderNotes,
      sessionId,
      paymentIntentId
    });
    
    console.log('✅ === EMAIL DI NOTIFICA INVIATA CON SUCCESSO! ===');
  } catch (emailError) {
    console.error('❌ === ERRORE INVIO EMAIL ===');
    console.error('Errore email:', emailError);
    // Non bloccare il webhook se l'email fallisce
  }

  console.log('🎉 === ELABORAZIONE ORDINE COMPLETATA ===');
}

// Funzione per inviare email con EmailJS per ordini Stripe
async function sendStripeOrderEmail(orderData: any) {
  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      pickupDate,
      items,
      totalAmount,
      originalAmount,
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

    // Formatta data di ritiro
    const formattedPickupDate = pickupDate || 'Da concordare';

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
      pickup_date: formattedPickupDate,
      payment_method: 'Carta di Credito/Debito (Stripe)',
      payment_status: '✅ PAGATO ONLINE',
      
      // Totali
      total_amount: discountCode ? 
        `€${originalAmount.toFixed(2)} → €${totalAmount.toFixed(2)} (con sconto)` : 
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
export async function GET() {
  console.log('🔍 Test configurazione webhook...');
  
  // Verifica configurazione
  const config = {
    stripe_key: !!process.env.STRIPE_SECRET_KEY,
    webhook_secret: !!process.env.STRIPE_WEBHOOK_SECRET,
    emailjs_service: !!process.env.EMAILJS_SERVICE_ID,
    emailjs_template: !!process.env.EMAILJS_TEMPLATE_ID,
    emailjs_public: !!process.env.EMAILJS_PUBLIC_KEY,
    emailjs_private: !!process.env.EMAILJS_PRIVATE_KEY,
    notification_email: process.env.NOTIFICATION_EMAIL || 'non configurata',
    firebase_project: !!process.env.FIREBASE_PROJECT_ID,
    firebase_key: !!process.env.FIREBASE_PRIVATE_KEY,
    firebase_email: !!process.env.FIREBASE_CLIENT_EMAIL
  };

  const allConfigured = Object.values(config).every(v => v === true || typeof v === 'string');

  console.log('📋 Configurazione webhook:', config);

  return NextResponse.json({
    status: allConfigured ? 'active' : 'partial',
    endpoint: '/api/stripe-webhook',
    message: 'Stripe webhook endpoint status',
    configuration: config,
    timestamp: new Date().toISOString(),
    ready: allConfigured
  });
}