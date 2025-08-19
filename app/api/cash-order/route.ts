import { NextRequest, NextResponse } from 'next/server';
import { addOrder } from '@/lib/firebase';

export async function POST(request: NextRequest) {
  try {
    const orderData = await request.json();
    
    // Validazione dati
    const { 
      customerName, 
      customerPhone, 
      customerEmail,
      customerAddress,
      pickupDate, 
      items, 
      totalAmount,
      notes 
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
      total: totalAmount
    });

    // Salva ordine su Firebase
    try {
      const orderId = await addOrder({
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
        transactionId: `CASH-${Date.now()}`
      });
      
      console.log('✅ Ordine salvato su Firebase con ID:', orderId);
    } catch (firebaseError) {
      console.error('❌ Errore salvataggio Firebase:', firebaseError);
      // Continua comunque con l'invio email
    }

    // Invia email e WhatsApp notification
    let emailSent = false;
    let whatsappUrl = '';

    // Prepara messaggio WhatsApp
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
      `${notes ? `📝 Note: ${notes}` : ''}`
    );

    // Genera link WhatsApp (sostituisci con il tuo numero)
    const restaurantWhatsApp = process.env.RESTAURANT_WHATSAPP || '393331234567';
    whatsappUrl = `https://wa.me/${restaurantWhatsApp}?text=${whatsappMessage}`;

    // Invia email tramite EmailJS
    if (process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID && process.env.EMAILJS_PRIVATE_KEY) {
      try {
        await sendCashOrderEmail(orderData);
        emailSent = true;
        console.log('✅ Email ordine contanti inviata');
      } catch (emailError) {
        console.error('⚠️ Errore invio email:', emailError);
      }
    } else {
      console.warn('⚠️ EmailJS non configurato');
    }

    return NextResponse.json({
      success: true,
      message: 'Ordine registrato con successo',
      emailSent,
      whatsappUrl,
      orderId: `CASH-${Date.now()}`
    });

  } catch (error: any) {
    console.error('❌ Errore processing ordine contanti:', error);
    
    return NextResponse.json({
      error: 'Errore processing ordine',
      details: error.message
    }, { status: 500 });
  }
}

// Funzione per inviare email ordine contanti
async function sendCashOrderEmail(orderData: any) {
  const { 
    customerName, 
    customerPhone,
    customerEmail, 
    customerAddress,
    pickupDate, 
    items, 
    totalAmount,
    notes
  } = orderData;
  
  // Calcola totale articoli
  const totalItems = items.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);
  
  // Genera lista prodotti per email
  const itemsList = items.map((item: any) => 
    `• ${item.name} x${item.quantity} = €${(item.price * item.quantity).toFixed(2)}`
  ).join('\n');

  // Formatta data ritiro
  const pickupDateFormatted = new Date(pickupDate).toLocaleDateString('it-IT', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // Dati per il template EmailJS
  const templateParams = {
    to_email: process.env.NOTIFICATION_EMAIL || 'ordini@pastosano.it',
    subject: `💰 Ordine Contanti: ${customerName} - €${totalAmount.toFixed(2)}`,
    
    // Dati cliente
    order_type: 'ORDINE CONTANTI',
    customer_name: customerName,
    customer_phone: customerPhone,
    customer_email: customerEmail || 'Non fornita',
    customer_address: customerAddress || 'Ritiro in sede',
    
    // Dettagli ordine
    pickup_date: pickupDateFormatted,
    payment_method: 'Contanti alla Consegna',
    payment_status: 'DA RISCUOTERE',
    
    // Riepilogo ordine
    total_amount: `€${totalAmount.toFixed(2)}`,
    items_list: itemsList,
    total_items: totalItems.toString(),
    
    // Note
    special_notes: `⚠️ PAGAMENTO IN CONTANTI: Il cliente pagherà €${totalAmount.toFixed(2)} al momento del ritiro. ${notes ? `Note cliente: ${notes}` : ''}`,
    order_notes: notes || 'Nessuna nota',
    
    // Timestamp
    order_date: new Date().toLocaleDateString('it-IT'),
    order_time: new Date().toLocaleTimeString('it-IT'),
    
    // ID ordine
    order_id: `CASH-${Date.now()}`
  };

  // Chiamata API EmailJS
  const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      service_id: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
      template_id: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
      user_id: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY,
      accessToken: process.env.EMAILJS_PRIVATE_KEY,
      template_params: templateParams
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`EmailJS error: ${response.status} - ${errorText}`);
  }
}

// GET endpoint per verificare che l'endpoint sia attivo
export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'active',
    endpoint: '/api/cash-order',
    message: 'Cash order endpoint is active',
    timestamp: new Date().toISOString(),
    config: {
      emailConfigured: !!(process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID && process.env.EMAILJS_PRIVATE_KEY),
      firebaseConfigured: !!(process.env.NEXT_PUBLIC_FIREBASE_API_KEY)
    }
  });
}