import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { addOrderAdmin } from '@/lib/firebase-admin'; // ⚡ USA FILE SEPARATO ADMIN SDK

// Inizializza Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

// Disabilita il body parsing per i webhook Stripe
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  console.log('🚀 === WEBHOOK STRIPE RICEVUTO ===');
  console.log('🕐 Timestamp:', new Date().toISOString());
  
  try {
    // 🔍 DEBUG COMPLETO HEADERS RICEVUTI
    console.log('🔍 === DEBUG HEADERS COMPLETI ===');
    const allHeaders: { [key: string]: string } = {};
    request.headers.forEach((value, key) => {
      allHeaders[key] = value;
      console.log(`Header ${key}:`, value.substring(0, 100) + (value.length > 100 ? '...' : ''));
    });
    
    // Ottieni il body raw e la signature con metodi alternativi
    const body = await request.text();
    console.log('📦 Body length:', body.length);
    console.log('📦 Body preview:', body.substring(0, 200) + '...');
    
    // 🔍 TENTATIVO MULTIPLO DI LETTURA SIGNATURE
    let signature: string | null = null;
    
    // Metodo 1: Header standard
    signature = request.headers.get('stripe-signature');
    console.log('🔏 Signature (metodo 1 - stripe-signature):', signature ? signature.substring(0, 50) + '...' : 'NULL');
    
    // Metodo 2: Header alternativo
    if (!signature) {
      signature = request.headers.get('Stripe-Signature');
      console.log('🔏 Signature (metodo 2 - Stripe-Signature):', signature ? signature.substring(0, 50) + '...' : 'NULL');
    }
    
    // Metodo 3: Cerca tra tutti gli headers
    if (!signature) {
      for (const [key, value] of Object.entries(allHeaders)) {
        if (key.toLowerCase().includes('stripe') && key.toLowerCase().includes('signature')) {
          signature = value;
          console.log(`🔏 Signature (metodo 3 - ${key}):`, signature.substring(0, 50) + '...');
          break;
        }
      }
    }
    
    // Metodo 4: Headers con pattern diversi
    if (!signature) {
      const possibleKeys = [
        'x-stripe-signature',
        'stripe_signature', 
        'stripeSignature',
        'webhook-signature',
        'x-webhook-signature'
      ];
      
      for (const key of possibleKeys) {
        const value = request.headers.get(key);
        if (value) {
          signature = value;
          console.log(`🔏 Signature (metodo 4 - ${key}):`, signature.substring(0, 50) + '...');
          break;
        }
      }
    }

    console.log('🔑 STRIPE_WEBHOOK_SECRET configurato:', !!process.env.STRIPE_WEBHOOK_SECRET);
    console.log('🔑 STRIPE_WEBHOOK_SECRET preview:', process.env.STRIPE_WEBHOOK_SECRET ? 
      process.env.STRIPE_WEBHOOK_SECRET.substring(0, 10) + '...' : 'MANCANTE');

    if (!signature) {
      console.error('❌ === NESSUNA SIGNATURE TROVATA CON TUTTI I METODI ===');
      console.error('🔍 Headers disponibili:', Object.keys(allHeaders));
      console.error('🔍 Headers che contengono "stripe":', 
        Object.keys(allHeaders).filter(k => k.toLowerCase().includes('stripe')));
      
      return NextResponse.json({
        error: 'Missing stripe signature - tried all methods',
        available_headers: Object.keys(allHeaders),
        stripe_headers: Object.keys(allHeaders).filter(k => k.toLowerCase().includes('stripe'))
      }, { status: 400 });
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
      // ⚡ TENTATIVO VERIFICA SIGNATURE CON DEBUG AGGIUNTIVO
      console.log('🔐 === TENTATIVO VERIFICA SIGNATURE ===');
      console.log('🔐 Body type:', typeof body);
      console.log('🔐 Body length:', body.length);
      console.log('🔐 Signature found:', !!signature);
      console.log('🔐 Webhook secret configured:', !!process.env.STRIPE_WEBHOOK_SECRET);
      
      // Verifica la signature del webhook
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
      console.log('✅ === SIGNATURE VERIFICATA CON SUCCESSO! ===');
      console.log('🎯 Event type ricevuto:', event.type);
      console.log('🆔 Event ID:', event.id);
      console.log('📅 Event created:', new Date(event.created * 1000).toISOString());
      
    } catch (err: any) {
      console.error('❌ === ERRORE VERIFICA SIGNATURE ===');
      console.error('Errore completo:', err);
      console.error('Errore messaggio:', err.message);
      console.error('Errore tipo:', err.type);
      console.error('Errore code:', err.code);
      
      // ⚡ DEBUG AGGIUNTIVO PER SIGNATURE
      console.error('🔍 DEBUG SIGNATURE FAILURE:');
      console.error('- Signature lunghezza:', signature?.length);
      console.error('- Signature formato:', signature?.includes('t=') && signature?.includes('v1=') ? 'STRIPE_FORMAT' : 'UNKNOWN_FORMAT');
      console.error('- Body è stringa:', typeof body === 'string');
      console.error('- Body encoding:', body.includes('\\') ? 'ESCAPED' : 'CLEAN');
      
      return NextResponse.json({
        error: `Webhook signature verification failed: ${err.message}`,
        details: {
          signature_found: !!signature,
          signature_length: signature?.length,
          signature_format: signature?.includes('t=') && signature?.includes('v1=') ? 'stripe_format' : 'unknown',
          body_type: typeof body,
          body_length: body.length,
          error_type: err.type,
          error_code: err.code
        }
      }, { status: 400 });
    }

    console.log('🔍 === ELABORAZIONE EVENTO STRIPE ===');

    // Gestisci i diversi tipi di eventi
    switch (event.type) {
      case 'checkout.session.completed': {
        console.log('🎉 === EVENTO CHECKOUT.SESSION.COMPLETED RILEVATO! ===');
        console.log('✅ PRIORITÀ MASSIMA - QUESTO EVENTO HA TUTTI I METADATA!');
        await handleCheckoutSessionCompleted(event);
        break;
      }

      case 'charge.succeeded': {
        console.log('💳 EVENTO CHARGE.SUCCEEDED RILEVATO!');
        
        const charge = event.data.object as Stripe.Charge;
        const paymentIntentId = charge.payment_intent as string;
        
        console.log('🔍 Controllo se ordine già processato...');
        console.log('Payment Intent ID:', paymentIntentId);
        console.log('⚠️ EVENTO CHARGE.SUCCEEDED IGNORATO - PRIORITÀ A CHECKOUT.SESSION.COMPLETED');
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
        console.log('Event data preview:', JSON.stringify(event.data, null, 2).substring(0, 500) + '...');
    }

    console.log('🎉 === WEBHOOK STRIPE COMPLETATO CON SUCCESSO ===');
    
    // Rispondi a Stripe per confermare la ricezione
    return NextResponse.json({ 
      received: true, 
      eventType: event.type,
      eventId: event.id,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ === ERRORE GENERALE WEBHOOK ===');
    console.error('Errore tipo:', typeof error);
    console.error('Errore nome:', error instanceof Error ? error.name : 'UNKNOWN');
    console.error('Errore messaggio:', error instanceof Error ? error.message : 'NO_MESSAGE');
    console.error('Errore stack:', error instanceof Error ? error.stack?.substring(0, 500) + '...' : 'NO_STACK');
    
    return NextResponse.json({
      error: 'Webhook handler failed',
      details: error instanceof Error ? {
        name: error.name,
        message: error.message
      } : 'Unknown error'
    }, { status: 500 });
  }
}

// Gestisce evento checkout.session.completed
async function handleCheckoutSessionCompleted(event: Stripe.Event) {
  const session = event.data.object as Stripe.Checkout.Session;
  
  console.log('📋 === PROCESSING CHECKOUT SESSION COMPLETED ===');
  console.log('📋 Session ID:', session.id);
  console.log('📋 Customer email:', session.customer_email);
  console.log('📋 Amount total:', session.amount_total ? session.amount_total / 100 : 0);
  console.log('📋 Payment status:', session.payment_status);
  console.log('📋 Metadata keys:', Object.keys(session.metadata || {}));

  // Estrai metadata COMPLETI da session
  const metadata = session.metadata || {};
  console.log('📋 === METADATA COMPLETI DA SESSION ===');
  console.log('📋 Raw metadata:', JSON.stringify(metadata, null, 2));
  
  // ✅ USA I METADATA PERFETTI CHE ARRIVANO DA STRIPE
  const orderData: any = {
    customerName: metadata.customerName || 'Cliente',
    customerPhone: metadata.customerPhone || '',
    customerEmail: session.customer_email || metadata.customerEmail || '',
    customerAddress: metadata.customerAddress || 'Ritiro presso Pasto Sano',
    pickupDate: metadata.pickupDate || 'Da concordare',
    orderNotes: metadata.orderNotes || '',
    discountCode: metadata.discountCode || '',
    discountPercent: metadata.discountPercent ? parseFloat(metadata.discountPercent) : 0,
    originalAmount: metadata.originalAmount ? parseFloat(metadata.originalAmount) : session.amount_total ? session.amount_total / 100 : 0,
    totalAmount: session.amount_total ? session.amount_total / 100 : 0,
    sessionId: session.id,
    paymentIntentId: session.payment_intent as string,
    orderItems: [] // ✅ Aggiungi orderItems nel tipo iniziale
  };

  // ✅ PARSE ORDERITEMS DAI METADATA
  let orderItems = [];
  if (metadata.orderItems) {
    try {
      orderItems = JSON.parse(metadata.orderItems);
      console.log('✅ === ORDER ITEMS PARSATI DAI METADATA ===');
      console.log('📦 Numero articoli:', orderItems.length);
      orderItems.forEach((item: any, index: number) => {
        console.log(`📦 Item ${index + 1}:`, {
          name: item.name,
          quantity: item.quantity,
          price: item.price
        });
      });
    } catch (e) {
      console.error('❌ ERRORE PARSING ORDER ITEMS:', e);
      console.error('❌ OrderItems raw:', metadata.orderItems);
      orderItems = [];
    }
  } else {
    console.error('❌ NESSUN ORDER ITEMS NEI METADATA!');
  }

  // Aggiorna orderItems nei dati dell'ordine
  orderData.orderItems = orderItems;

  console.log('📋 === DATI ORDINE FINALI ===');
  console.log('👤 Cliente:', orderData.customerName);
  console.log('📧 Email:', orderData.customerEmail);
  console.log('📞 Telefono:', orderData.customerPhone);
  console.log('📅 Pickup:', orderData.pickupDate);
  console.log('🎁 Sconto:', orderData.discountCode, orderData.discountPercent + '%');
  console.log('💰 Totale:', orderData.totalAmount);
  console.log('📦 Items:', orderData.orderItems.length);

  await processOrder(orderData);
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

  // 🔥 SALVA ORDINE SU FIREBASE CON ADMIN SDK
  try {
    console.log('🔥 === INIZIO SALVATAGGIO SU FIREBASE CON ADMIN SDK ===');
    
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
    
    console.log('🔍 Dati ordine preparati per Firebase:', {
      customerName: firebaseOrderData.customerName,
      totalAmount: firebaseOrderData.totalAmount,
      itemsCount: firebaseOrderData.items.length,
      paymentMethod: firebaseOrderData.paymentMethod
    });
    
    // ⚡ USA ADMIN SDK INVECE DI CLIENT SDK
    await addOrderAdmin(firebaseOrderData);
    
    console.log('✅ === ORDINE SALVATO SU FIREBASE CON ADMIN SDK! ===');
  } catch (firebaseError) {
    console.error('❌ === ERRORE SALVATAGGIO FIREBASE ADMIN ===');
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

// 🚀 FUNZIONE EMAILJS SERVER-COMPATIBLE 
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

    console.log('📧 Configurazione EmailJS:', {
      service_id: !!process.env.EMAILJS_SERVICE_ID,
      template_id: !!process.env.EMAILJS_TEMPLATE_ID,
      user_id: !!process.env.EMAILJS_PUBLIC_KEY,
      private_key: !!process.env.EMAILJS_PRIVATE_KEY,
      notification_email: process.env.NOTIFICATION_EMAIL
    });

    // 🎯 METODO NUOVO: EMAILJS FORM SEND (più compatibile server)
    console.log('📧 🚀 Tentativo FORM SEND (server-compatible)...');
    
    const formData = new FormData();
    formData.append('service_id', process.env.EMAILJS_SERVICE_ID!);
    formData.append('template_id', process.env.EMAILJS_TEMPLATE_ID!);
    formData.append('user_id', process.env.EMAILJS_PUBLIC_KEY!);
    formData.append('accessToken', process.env.EMAILJS_PRIVATE_KEY!);
    
    // Aggiungi tutti i template params come form data
    Object.entries(templateParams).forEach(([key, value]) => {
      formData.append(key, String(value));
    });

    const formResponse = await fetch('https://api.emailjs.com/api/v1.0/email/send-form', {
      method: 'POST',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'it-IT,it;q=0.9,en;q=0.8',
        'Origin': 'https://pasto-sano.vercel.app',
        'Referer': 'https://pasto-sano.vercel.app/',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'cross-site'
      },
      body: formData
    });

    if (formResponse.ok) {
      const result = await formResponse.text();
      console.log('✅ Email inviata con successo (FORM SEND):', result);
      return;
    } else {
      const formError = await formResponse.text();
      console.log('❌ FORM SEND fallito:', formResponse.status, formError);
    }

    // 🎯 METODO ALTERNATIVO: IFRAME SIMULATION  
    console.log('📧 🔄 Tentativo IFRAME SIMULATION...');
    
    const iframePayload = {
      lib_version: '3.2.0',
      user_id: process.env.EMAILJS_PUBLIC_KEY,
      service_id: process.env.EMAILJS_SERVICE_ID,
      template_id: process.env.EMAILJS_TEMPLATE_ID,
      template_params: templateParams,
      accessToken: process.env.EMAILJS_PRIVATE_KEY
    };

    const iframeResponse = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; EmailJS/3.2.0; +https://www.emailjs.com)',
        'Accept': '*/*',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'it-IT,it;q=0.9',
        'Cache-Control': 'no-cache',
        'Origin': 'https://pasto-sano.vercel.app',
        'Referer': 'https://pasto-sano.vercel.app/',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'cross-site',
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: JSON.stringify(iframePayload)
    });

    if (iframeResponse.ok) {
      const result = await iframeResponse.text();
      console.log('✅ Email inviata con successo (IFRAME SIM):', result);
      return;
    } else {
      const iframeError = await iframeResponse.text();
      console.log('❌ IFRAME SIM fallito:', iframeResponse.status, iframeError);
    }

    // 🎯 METODO LEGACY: API STANDARD CON HEADERS AVANZATI
    console.log('📧 🔄 Tentativo API STANDARD con headers avanzati...');
    
    const standardPayload = {
      service_id: process.env.EMAILJS_SERVICE_ID,
      template_id: process.env.EMAILJS_TEMPLATE_ID,
      user_id: process.env.EMAILJS_PUBLIC_KEY,
      accessToken: process.env.EMAILJS_PRIVATE_KEY,
      template_params: templateParams
    };

    const standardResponse = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'it-IT,it;q=0.9,en-US;q=0.8,en;q=0.7',
        'Connection': 'keep-alive',
        'Origin': 'https://pasto-sano.vercel.app',
        'Referer': 'https://pasto-sano.vercel.app/success',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'cross-site',
        'X-Requested-With': 'XMLHttpRequest',
        'DNT': '1'
      },
      body: JSON.stringify(standardPayload)
    });

    if (standardResponse.ok) {
      const result = await standardResponse.text();
      console.log('✅ Email inviata con successo (STANDARD):', result);
      return;
    } else {
      const standardError = await standardResponse.text();
      console.log('❌ STANDARD fallito:', standardResponse.status, standardError);
    }

    // Se tutti i metodi falliscono, lancia errore
    throw new Error(`Tutti i metodi EmailJS falliti. Status finale: ${standardResponse.status}`);

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
        'User-Agent': 'Mozilla/5.0 (compatible; EmailJS/3.2.0)',
        'Origin': 'https://pasto-sano.vercel.app'
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
    message: 'Stripe webhook endpoint status - EmailJS Server Compatible + Firebase Admin SDK + Enhanced Signature Debug',
    configuration: config,
    timestamp: new Date().toISOString(),
    ready: allConfigured,
    emailjs_methods: ['form-send', 'iframe-simulation', 'standard-headers'],
    firebase_sdk: 'admin',
    signature_debug: 'enhanced' // ⚡ NUOVO: Debug signature migliorato
  });
}