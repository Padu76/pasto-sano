import { NextRequest, NextResponse } from 'next/server';
import { addOrder } from '@/lib/firebase';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, limit, updateDoc, doc } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    const orderData = await request.json();
    
    const { 
      customerName, 
      customerPhone, 
      customerEmail,
      customerAddress,
      pickupDate, 
      items, 
      totalAmount,
      notes,
      deliveryEnabled,
      deliveryAddress,
      deliveryAddressDetails,
      deliveryDistance,
      deliveryZone,
      deliveryCost,
      deliveryRiderShare,
      deliveryTimeSlot
    } = orderData;
    
    if (!customerName || !customerPhone || !pickupDate || !items || !totalAmount) {
      return NextResponse.json({
        error: 'Dati ordine mancanti',
        required: ['customerName', 'customerPhone', 'pickupDate', 'items', 'totalAmount']
      }, { status: 400 });
    }

    console.log('💰 Ordine contanti ricevuto:', {
      customer: customerName,
      phone: customerPhone,
      total: totalAmount,
      delivery: deliveryEnabled
    });

    let orderDoc: any = {
      customerName,
      customerEmail: customerEmail || '',
      customerPhone,
      customerAddress: customerAddress || '',
      items,
      totalAmount,
      paymentMethod: 'cash',
      paymentMethodName: 'Contanti alla Consegna',
      paymentStatus: 'pending',
      orderStatus: 'confirmed',
      pickupDate,
      notes: notes || '',
      source: 'website',
      timestamp: new Date(),
    };

    if (deliveryEnabled) {
      orderDoc = {
        ...orderDoc,
        deliveryEnabled: 'true',
        deliveryAddress: deliveryAddress || '',
        deliveryAddressDetails: deliveryAddressDetails || '',
        deliveryDistance: parseFloat(deliveryDistance || '0'),
        deliveryZone: deliveryZone || '',
        deliveryCost: parseFloat(deliveryCost || '0'),
        deliveryRiderShare: parseFloat(deliveryRiderShare || '0'),
        deliveryTimeSlot: deliveryTimeSlot || '',
        deliveryStatus: 'pending',
      };
    }

    let orderId = '';
    try {
      orderId = await addOrder(orderDoc);
      console.log('✅ Ordine salvato su Firebase con ID:', orderId);

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

    } catch (firebaseError) {
      console.error('❌ Errore salvataggio Firebase:', firebaseError);
    }

    let emailSent = false;
    let whatsappUrl = '';

    const itemsList = items.map((item: any) => 
      `• ${item.name} x${item.quantity}`
    ).join('\n');

    const whatsappMessage = encodeURIComponent(
      `🍽️ *NUOVO ORDINE PASTO SANO*\n\n` +
      `👤 *Cliente:* ${customerName}\n` +
      `📱 *Telefono:* ${customerPhone}\n` +
      `📅 *Ritiro:* ${new Date(pickupDate).toLocaleDateString('it-IT')}\n` +
      `💰 *Totale:* €${totalAmount.toFixed(2)}\n` +
      `💵 *Pagamento:* CONTANTI ALLA CONSEGNA\n\n` +
      `📋 *Ordine:*\n${itemsList}\n\n` +
      `${deliveryEnabled ? `🚚 *DELIVERY*\n📍 ${deliveryAddress}\n⏰ Fascia: ${deliveryTimeSlot}\n\n` : ''}` +
      `${notes ? `📝 Note: ${notes}` : ''}`
    );

    const restaurantWhatsApp = process.env.RESTAURANT_WHATSAPP || '393331234567';
    whatsappUrl = `https://wa.me/${restaurantWhatsApp}?text=${whatsappMessage}`;

    // FIX: Usa i nomi corretti delle variabili da Vercel
    if (process.env.EMAILJS_SERVICE_ID && process.env.EMAILJS_PRIVATE_KEY) {
      try {
        await sendCashOrderEmail({
          ...orderData,
          orderId: orderId || `CASH-${Date.now()}`
        });
        emailSent = true;
        console.log('✅ Email ordine contanti inviata');
      } catch (emailError) {
        console.error('⚠️ Errore invio email:', emailError);
      }
    } else {
      console.warn('⚠️ EmailJS non configurato - variabili mancanti');
    }

    return NextResponse.json({
      success: true,
      message: 'Ordine registrato con successo',
      emailSent,
      whatsappUrl,
      orderId: orderId || `CASH-${Date.now()}`
    });

  } catch (error: any) {
    console.error('❌ Errore processing ordine contanti:', error);
    
    return NextResponse.json({
      error: 'Errore processing ordine',
      details: error.message
    }, { status: 500 });
  }
}

async function sendCashOrderEmail(orderData: any) {
  const { 
    customerName, 
    customerPhone,
    customerEmail, 
    customerAddress,
    pickupDate, 
    items, 
    totalAmount,
    notes,
    deliveryEnabled,
    deliveryAddress,
    deliveryTimeSlot,
    orderId
  } = orderData;
  
  const totalItems = items.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);
  
  const itemsList = items.map((item: any) => 
    `• ${item.name} x${item.quantity} = €${(item.price * item.quantity).toFixed(2)}`
  ).join('\n');

  const pickupDateFormatted = new Date(pickupDate).toLocaleDateString('it-IT', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const baseParams = {
    order_type: deliveryEnabled ? 'ORDINE DELIVERY - CONTANTI' : 'ORDINE CONTANTI',
    customer_name: customerName,
    customer_phone: customerPhone,
    customer_email: customerEmail || 'Non fornita',
    customer_address: customerAddress || 'Ritiro in sede',
    pickup_date: pickupDateFormatted,
    payment_method: 'Contanti al ritiro',
    payment_status: 'DA RISCUOTERE',
    total_amount: `€${totalAmount.toFixed(2)}`,
    items_list: itemsList,
    total_items: totalItems.toString(),
    order_notes: notes || 'Nessuna nota',
    order_date: new Date().toLocaleDateString('it-IT'),
    order_time: new Date().toLocaleTimeString('it-IT'),
    order_id: orderId,
  };

  // 1. Email per ADMIN (info@pastosano.it)
  const adminParams = {
    ...baseParams,
    to_email: process.env.NOTIFICATION_EMAIL || 'info@pastosano.it',
    subject: `🔔 Nuovo Ordine: ${customerName} - €${totalAmount.toFixed(2)}`,
    special_notes: `⚠️ PAGAMENTO IN CONTANTI: Il cliente pagherà €${totalAmount.toFixed(2)} al momento del ritiro. ${deliveryEnabled ? `\n🚚 DELIVERY: ${deliveryAddress}\n⏰ Fascia: ${deliveryTimeSlot}` : ''} ${notes ? `\nNote cliente: ${notes}` : ''}`,
  };
  await sendEmailJSRequest(adminParams);

  // 2. Email CONFERMA per il CLIENTE (se ha fornito email)
  if (customerEmail) {
    const customerParams = {
      ...baseParams,
      to_email: customerEmail,
      subject: `✅ Conferma Ordine Pasto Sano - €${totalAmount.toFixed(2)}`,
      special_notes: `Grazie per il tuo ordine!\n\nIl ritiro è previsto per ${pickupDateFormatted} presso Tribù Studio - Via Albere 27/B, 37138 Verona.\n\nPagherai €${totalAmount.toFixed(2)} in contanti al momento del ritiro.\n\n${notes ? `Le tue note: ${notes}\n\n` : ''}Per qualsiasi domanda, scrivici su WhatsApp al 347 888 1515.`,
    };
    try {
      await sendEmailJSRequest(customerParams);
      console.log('✅ Email conferma inviata al cliente:', customerEmail);
    } catch (e) {
      console.error('⚠️ Errore email cliente (admin ricevuta):', e);
    }
  }
}

async function sendEmailJSRequest(templateParams: any) {
  const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      service_id: process.env.EMAILJS_SERVICE_ID,
      template_id: process.env.EMAILJS_TEMPLATE_ID,
      user_id: process.env.EMAILJS_PUBLIC_KEY,
      accessToken: process.env.EMAILJS_PRIVATE_KEY,
      template_params: templateParams,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`EmailJS error: ${response.status} - ${errorText}`);
  }
  console.log(`✅ Email inviata a ${templateParams.to_email}`);
}

export async function GET() {
  return NextResponse.json({
    status: 'active',
    endpoint: '/api/cash-order',
    message: 'Cash order endpoint is active',
    timestamp: new Date().toISOString(),
    config: {
      emailConfigured: !!(process.env.EMAILJS_SERVICE_ID && process.env.EMAILJS_PRIVATE_KEY),
      firebaseConfigured: !!(process.env.NEXT_PUBLIC_FIREBASE_API_KEY)
    }
  });
}