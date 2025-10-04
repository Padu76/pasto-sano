import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { addOrderAdmin } from '@/lib/firebase-admin';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, limit, updateDoc, doc } from 'firebase/firestore';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error('⚠️ Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    console.log('✅ Checkout completato:', session.id);

    try {
      const metadata = session.metadata || {};
      const itemsData = metadata.orderItems || '[]';
      let items = [];
      
      try {
        items = JSON.parse(itemsData);
      } catch (e) {
        console.error('❌ Errore parsing items:', e);
        items = [];
      }
      
      const deliveryEnabled = metadata.deliveryEnabled === 'true';

      let orderData: any = {
        customerName: metadata.customerName || session.customer_details?.name || 'Cliente',
        customerEmail: metadata.customerEmail || session.customer_details?.email || '',
        customerPhone: metadata.customerPhone || '',
        customerAddress: metadata.customerAddress || '',
        items: items,
        totalAmount: (session.amount_total || 0) / 100,
        paymentMethod: session.payment_method_types?.[0] || 'card',
        paymentMethodName: session.payment_method_types?.[0] === 'card' ? 'Carta di Credito' : 'Altro',
        paymentStatus: 'paid',
        orderStatus: 'confirmed',
        pickupDate: metadata.pickupDate || '',
        notes: metadata.orderNotes || '',
        discountCode: metadata.discountCode || '',
        discountPercent: parseFloat(metadata.discountPercent || '0'),
        originalAmount: parseFloat(metadata.originalAmount || '0'),
        source: 'website',
        timestamp: new Date(),
        stripeSessionId: session.id,
        stripePaymentIntentId: session.payment_intent as string,
      };

      if (deliveryEnabled) {
        orderData = {
          ...orderData,
          deliveryEnabled: 'true',
          deliveryAddress: metadata.deliveryAddress || '',
          deliveryAddressDetails: metadata.deliveryAddressDetails || '',
          deliveryDistance: parseFloat(metadata.deliveryDistance || '0'),
          deliveryZone: metadata.deliveryZone || '',
          deliveryCost: parseFloat(metadata.deliveryCost || '0'),
          deliveryRiderShare: parseFloat(metadata.deliveryRiderShare || '0'),
          deliveryTimeSlot: metadata.deliveryTimeSlot || '',
          deliveryStatus: 'pending',
        };
      }

      const orderId = await addOrderAdmin(orderData);
      console.log('✅ Ordine salvato su Firebase:', orderId);

      if (deliveryEnabled && orderId) {
        try {
          const ridersRef = collection(db, 'riders');
          const q = query(ridersRef, where('active', '==', true), limit(1));
          const ridersSnapshot = await getDocs(q);

          if (!ridersSnapshot.empty) {
            const riderDoc = ridersSnapshot.docs[0];
            const riderData = riderDoc.data();
            
            const orderRef = doc(db, 'orders', orderId);
            await updateDoc(orderRef, {
              riderId: riderDoc.id,
              riderName: riderData.name,
              deliveryStatus: 'assigned',
              assignedAt: new Date()
            });

            console.log(`✅ Ordine delivery auto-assegnato a rider: ${riderData.name}`);
          } else {
            console.log('⚠️ Nessun rider attivo disponibile');
          }
        } catch (riderError) {
          console.error('⚠️ Errore auto-assegnazione rider:', riderError);
        }
      }

      let emailSent = false;
      if (process.env.EMAILJS_SERVICE_ID && process.env.EMAILJS_PRIVATE_KEY) {
        try {
          await sendStripeOrderEmail({
            ...orderData,
            orderId: orderId || session.id,
            sessionId: session.id
          });
          emailSent = true;
          console.log('✅ Email conferma ordine Stripe inviata');
        } catch (emailError) {
          console.error('⚠️ Errore invio email:', emailError);
        }
      } else {
        console.warn('⚠️ EmailJS non configurato');
      }

      return NextResponse.json({ 
        received: true,
        orderId,
        deliveryAutoAssigned: deliveryEnabled,
        emailSent
      });

    } catch (error) {
      console.error('❌ Errore processing webhook:', error);
      return NextResponse.json({ 
        error: 'Error processing order',
        received: true 
      }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}

async function sendStripeOrderEmail(orderData: any) {
  const {
    customerName,
    customerEmail,
    customerPhone,
    customerAddress,
    pickupDate,
    items,
    totalAmount,
    originalAmount,
    discountCode,
    discountPercent,
    notes,
    deliveryEnabled,
    deliveryAddress,
    deliveryTimeSlot,
    deliveryCost,
    orderId,
    sessionId
  } = orderData;

  const totalItems = items.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);
  
  const itemsList = items.map((item: any) => 
    `• ${item.name} x${item.quantity} = €${((item.price || 0) * (item.quantity || 0)).toFixed(2)}`
  ).join('\n');

  const pickupDateFormatted = new Date(pickupDate).toLocaleDateString('it-IT', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  let discountInfo = '';
  if (discountCode && discountPercent > 0) {
    const discountAmount = (originalAmount * discountPercent) / 100;
    discountInfo = `\n💰 Sconto ${discountCode}: -€${discountAmount.toFixed(2)} (${discountPercent}%)`;
  }

  const templateParams = {
    to_email: process.env.NOTIFICATION_EMAIL || 'ordini@pastosano.it',
    subject: `💳 Ordine Online: ${customerName} - €${totalAmount.toFixed(2)}`,
    
    order_type: deliveryEnabled ? 'ORDINE DELIVERY - PAGAMENTO ONLINE' : 'ORDINE ONLINE',
    customer_name: customerName,
    customer_phone: customerPhone,
    customer_email: customerEmail || 'Non fornita',
    customer_address: customerAddress || 'Ritiro in sede',
    
    pickup_date: pickupDateFormatted,
    payment_method: 'Carta di Credito (Stripe)',
    payment_status: '✅ PAGATO',
    
    total_amount: `€${totalAmount.toFixed(2)}`,
    items_list: itemsList,
    total_items: totalItems.toString(),
    
    special_notes: `✅ PAGAMENTO COMPLETATO tramite Stripe${discountInfo}${deliveryEnabled ? `\n🚚 DELIVERY: ${deliveryAddress}\n⏰ Fascia: ${deliveryTimeSlot}\n💶 Costo consegna: €${deliveryCost?.toFixed(2) || '0.00'}` : ''}${notes ? `\n📝 Note cliente: ${notes}` : ''}`,
    order_notes: notes || 'Nessuna nota',
    
    order_date: new Date().toLocaleDateString('it-IT'),
    order_time: new Date().toLocaleTimeString('it-IT'),
    
    order_id: orderId || sessionId
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

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`EmailJS error: ${response.status} - ${errorText}`);
  }

  console.log('✅ Email Stripe inviata con successo');
}

export async function GET() {
  return NextResponse.json({
    status: 'active',
    endpoint: '/api/stripe-webhook',
    message: 'Stripe webhook endpoint is active',
    timestamp: new Date().toISOString(),
    config: {
      emailConfigured: !!(process.env.EMAILJS_SERVICE_ID && process.env.EMAILJS_PRIVATE_KEY),
      stripeConfigured: !!(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET)
    }
  });
}