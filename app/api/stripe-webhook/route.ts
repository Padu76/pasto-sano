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
      const items = JSON.parse(metadata.items || '[]');
      
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
        notes: metadata.notes || '',
        source: 'website',
        timestamp: new Date(),
        stripeSessionId: session.id,
        stripePaymentIntentId: session.payment_intent as string,
      };

      // Gestione delivery
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

      // Salva ordine
      const orderId = await addOrderAdmin(orderData);
      console.log('✅ Ordine salvato su Firebase:', orderId);

      // AUTO-ASSEGNAZIONE RIDER
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
            console.log('⚠️ Nessun rider attivo disponibile - ordine resta in pending');
          }
        } catch (riderError) {
          console.error('⚠️ Errore auto-assegnazione rider:', riderError);
        }
      }

      return NextResponse.json({ 
        received: true,
        orderId,
        deliveryAutoAssigned: deliveryEnabled
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

export async function GET() {
  return NextResponse.json({
    status: 'active',
    endpoint: '/api/stripe-webhook',
    message: 'Stripe webhook endpoint is active',
    timestamp: new Date().toISOString()
  });
}