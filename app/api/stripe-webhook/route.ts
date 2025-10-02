import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { addOrderAdmin } from '@/lib/firebase-admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  console.log('🚀 === WEBHOOK STRIPE RICEVUTO ===');
  console.log('🕐 Timestamp:', new Date().toISOString());
  
  try {
    const body = await request.text();
    let signature: string | null = null;
    
    signature = request.headers.get('stripe-signature');
    
    if (!signature) {
      signature = request.headers.get('Stripe-Signature');
    }

    if (!signature) {
      console.error('❌ Nessuna signature trovata');
      return NextResponse.json({
        error: 'Missing stripe signature'
      }, { status: 400 });
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.error('❌ STRIPE_WEBHOOK_SECRET non configurato');
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
      console.log('✅ Signature verificata');
      console.log('🎯 Event type:', event.type);
      
    } catch (err: any) {
      console.error('❌ Errore verifica signature:', err.message);
      return NextResponse.json({
        error: `Webhook signature verification failed: ${err.message}`
      }, { status: 400 });
    }

    console.log('📝 Elaborazione evento Stripe...');

    switch (event.type) {
      case 'checkout.session.completed': {
        console.log('🎉 CHECKOUT.SESSION.COMPLETED');
        await handleCheckoutSessionCompleted(event);
        break;
      }

      case 'charge.succeeded': {
        console.log('💳 CHARGE.SUCCEEDED (ignorato - priorità a checkout.session)');
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

      default:
        console.log(`ℹ️ Evento non gestito: ${event.type}`);
    }

    console.log('🎉 Webhook completato con successo');
    
    return NextResponse.json({ 
      received: true, 
      eventType: event.type,
      eventId: event.id,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Errore generale webhook:', error);
    
    return NextResponse.json({
      error: 'Webhook handler failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

async function handleCheckoutSessionCompleted(event: Stripe.Event) {
  const session = event.data.object as Stripe.Checkout.Session;
  
  console.log('📋 === PROCESSING CHECKOUT SESSION ===');
  console.log('📋 Session ID:', session.id);
  console.log('📋 Customer email:', session.customer_email);
  console.log('📋 Amount:', session.amount_total ? session.amount_total / 100 : 0);

  const metadata = session.metadata || {};
  console.log('📋 Metadata keys:', Object.keys(metadata));
  
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
    orderItems: [],
    // Dati fatturazione
    fiscalCode: metadata.fiscalCode || '',
    invoiceAddress: metadata.invoiceAddress || '',
    invoiceCap: metadata.invoiceCap || '',
    invoiceCity: metadata.invoiceCity || '',
    invoiceProvince: metadata.invoiceProvince || '',
    requiresInvoice: metadata.requiresInvoice === 'true'
  };

  let orderItems = [];
  if (metadata.orderItems) {
    try {
      orderItems = JSON.parse(metadata.orderItems);
      console.log('✅ Order items parsati:', orderItems.length);
    } catch (e) {
      console.error('❌ Errore parsing order items:', e);
      orderItems = [];
    }
  }

  orderData.orderItems = orderItems;

  console.log('📋 Dati ordine completi:');
  console.log('👤 Cliente:', orderData.customerName);
  console.log('📧 Email:', orderData.customerEmail);
  console.log('📅 Pickup:', orderData.pickupDate);
  console.log('💰 Totale:', orderData.totalAmount);
  console.log('📦 Items:', orderData.orderItems.length);
  console.log('🧾 Richiede fattura:', orderData.requiresInvoice);

  await processOrder(orderData);
}

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
    paymentIntentId,
    fiscalCode,
    invoiceAddress,
    invoiceCap,
    invoiceCity,
    invoiceProvince,
    requiresInvoice
  } = orderData;

  const discountAmount = originalAmount - totalAmount;

  console.log('💾 === SALVATAGGIO ORDINE SU FIREBASE ===');

  try {
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
      timestamp: new Date(),
      // Dati fatturazione
      invoiceRequired: requiresInvoice,
      fiscalCode: fiscalCode || '',
      invoiceAddress: invoiceAddress || '',
      invoiceCap: invoiceCap || '',
      invoiceCity: invoiceCity || '',
      invoiceProvince: invoiceProvince || ''
    };
    
    await addOrderAdmin(firebaseOrderData);
    
    console.log('✅ Ordine salvato su Firebase');
  } catch (firebaseError) {
    console.error('❌ Errore salvataggio Firebase:', firebaseError);
  }

  // 🧾 CREA FATTURA SE RICHIESTA
  if (requiresInvoice && fiscalCode && invoiceAddress) {
    console.log('🧾 === CREAZIONE FATTURA ELETTRONICA ===');
    
    try {
      const invoicePayload = {
        customerName,
        customerEmail,
        fiscalCode,
        address: invoiceAddress,
        cap: invoiceCap,
        city: invoiceCity,
        province: invoiceProvince,
        items: orderItems,
        totalAmount,
        orderDate: new Date().toISOString().split('T')[0],
        sessionId
      };

      console.log('📤 Invio richiesta a /api/create-invoice...');

      const invoiceResponse = await fetch(`${process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL}/api/create-invoice`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invoicePayload)
      });

      if (invoiceResponse.ok) {
        const invoiceData = await invoiceResponse.json();
        console.log('✅ === FATTURA CREATA CON SUCCESSO! ===');
        console.log('📄 Invoice ID:', invoiceData.invoiceId);
        console.log('🔢 Invoice Number:', invoiceData.invoiceNumber);
      } else {
        const errorText = await invoiceResponse.text();
        console.error('❌ Errore creazione fattura:', errorText);
        // Non bloccare il webhook se la fattura fallisce
      }
    } catch (invoiceError) {
      console.error('❌ Errore chiamata API fattura:', invoiceError);
      // Non bloccare il webhook
    }
  } else {
    console.log('ℹ️ Fattura non richiesta o dati incompleti');
  }

  // 📧 INVIA EMAIL NOTIFICA
  try {
    console.log('📧 === INVIO EMAIL NOTIFICA ===');
    
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
      paymentIntentId,
      invoiceIncluded: requiresInvoice
    });
    
    console.log('✅ Email inviata');
  } catch (emailError) {
    console.error('❌ Errore invio email:', emailError);
  }

  console.log('🎉 === ELABORAZIONE ORDINE COMPLETATA ===');
}

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
      paymentIntentId,
      invoiceIncluded
    } = orderData;

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

    const formattedPickupDate = pickupDate || 'Da concordare';

    const templateParams = {
      to_email: process.env.NOTIFICATION_EMAIL || 'ordini@pastosano.it',
      subject: `🍽️ NUOVO ORDINE STRIPE - ${customerName} - €${totalAmount.toFixed(2)}${invoiceIncluded ? ' 🧾 CON FATTURA' : ''}`,
      order_type: '💳 PAGAMENTO CON CARTA (Stripe)',
      customer_name: customerName,
      customer_email: customerEmail || 'Non fornita',
      customer_phone: customerPhone || 'Non fornito',
      pickup_date: formattedPickupDate,
      payment_method: 'Carta di Credito/Debito (Stripe)',
      payment_status: '✅ PAGATO ONLINE',
      total_amount: discountCode ? 
        `€${originalAmount.toFixed(2)} → €${totalAmount.toFixed(2)} (con sconto)` : 
        `€${totalAmount.toFixed(2)}`,
      items_list: itemsList,
      total_items: totalItems,
      discount_info: discountCode ? 
        `🎁 Sconto ${discountCode} (-${discountPercent}%) = -€${discountAmount.toFixed(2)}` : 
        'Nessuno sconto applicato',
      special_notes: `${orderNotes ? `📝 Note cliente: ${orderNotes}\n\n` : ''}${invoiceIncluded ? '🧾 FATTURA ELETTRONICA EMESSA E INVIATA AL CLIENTE' : ''}✅ Pagamento completato con successo via Stripe`,
      order_id: `Stripe: ${sessionId}`,
      payment_id: paymentIntentId || '',
      order_date: new Date().toLocaleDateString('it-IT'),
      order_time: new Date().toLocaleTimeString('it-IT'),
      header_color: '#635bff',
      status_color: '#28a745'
    };

    console.log('📧 Invio email con EmailJS...');
    
    const formData = new FormData();
    formData.append('service_id', process.env.EMAILJS_SERVICE_ID!);
    formData.append('template_id', process.env.EMAILJS_TEMPLATE_ID!);
    formData.append('user_id', process.env.EMAILJS_PUBLIC_KEY!);
    formData.append('accessToken', process.env.EMAILJS_PRIVATE_KEY!);
    
    Object.entries(templateParams).forEach(([key, value]) => {
      formData.append(key, String(value));
    });

    const formResponse = await fetch('https://api.emailjs.com/api/v1.0/email/send-form', {
      method: 'POST',
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'application/json',
        'Origin': 'https://pasto-sano.vercel.app'
      },
      body: formData
    });

    if (formResponse.ok) {
      console.log('✅ Email inviata (form-send)');
      return;
    }

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
        'User-Agent': 'Mozilla/5.0'
      },
      body: JSON.stringify(iframePayload)
    });

    if (iframeResponse.ok) {
      console.log('✅ Email inviata (iframe)');
      return;
    }

    throw new Error('Tutti i metodi EmailJS falliti');

  } catch (error) {
    console.error('❌ Errore invio email:', error);
    throw error;
  }
}

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
        'Content-Type': 'application/json'
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
    }
  } catch (error) {
    console.error('❌ Errore sendPaymentFailedEmail:', error);
  }
}

export async function GET() {
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
    firebase_email: !!process.env.FIREBASE_CLIENT_EMAIL,
    fic_client_id: !!process.env.FIC_CLIENT_ID,
    fic_client_secret: !!process.env.FIC_CLIENT_SECRET,
    fic_company_id: !!process.env.FIC_COMPANY_ID
  };

  const allConfigured = Object.values(config).every(v => v === true || typeof v === 'string');

  return NextResponse.json({
    status: allConfigured ? 'active' : 'partial',
    endpoint: '/api/stripe-webhook',
    message: 'Stripe webhook con fatturazione elettronica integrata',
    configuration: config,
    timestamp: new Date().toISOString(),
    ready: allConfigured,
    features: ['emailjs', 'firebase_admin', 'fatture_in_cloud']
  });
}