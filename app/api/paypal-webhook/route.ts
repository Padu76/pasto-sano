import { NextRequest, NextResponse } from 'next/server';
import { addOrder } from '@/lib/firebase';

export async function POST(request: NextRequest) {
  try {
    console.log('🔔 Webhook PayPal ricevuto');
    
    const webhookData = await request.json();
    
    // Verifica che sia un pagamento completato
    if (webhookData.event_type === 'PAYMENT.CAPTURE.COMPLETED' || 
        webhookData.event_type === 'CHECKOUT.ORDER.APPROVED') {
      
      const resource = webhookData.resource;
      const amount = parseFloat(resource.amount?.value || 0);
      const currency = resource.amount?.currency_code || 'EUR';
      const paypalOrderId = resource.supplementary_data?.related_ids?.order_id || resource.id;
      
      // Estrai informazioni del pagatore
      const payer = resource.payer || webhookData.payer || {};
      const payerName = payer.name ? 
        `${payer.name.given_name || ''} ${payer.name.surname || ''}`.trim() : 
        'Cliente PayPal';
      const payerEmail = payer.email_address || payer.email || 'Non fornito';
      const payerPhone = payer.phone?.phone_number?.national_number || 'Non fornito';
      
      console.log('💳 Pagamento PayPal completato:', {
        amount,
        currency,
        orderId: paypalOrderId,
        payer: payerName
      });

      // Salva ordine su Firebase
      try {
        await addOrder({
          customerName: payerName,
          customerEmail: payerEmail,
          customerPhone: payerPhone,
          customerAddress: payer.address?.address_line_1 || 'Da definire',
          items: [], // I dettagli degli articoli dovrebbero essere passati nei metadata
          totalAmount: amount,
          paymentMethod: 'paypal',
          paymentMethodName: 'PayPal',
          paymentStatus: 'paid',
          orderStatus: 'confirmed',
          pickupDate: new Date().toISOString(),
          notes: `PayPal Order ID: ${paypalOrderId}`,
          source: 'paypal_webhook',
          timestamp: new Date()
        });
        
        console.log('✅ Ordine salvato su Firebase');
      } catch (firebaseError) {
        console.error('❌ Errore salvataggio Firebase:', firebaseError);
      }

      // Invia email di notifica
      if (process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID && process.env.EMAILJS_PRIVATE_KEY) {
        await sendPayPalEmailNotification({
          amount,
          currency,
          paypalOrderId,
          payerName,
          payerEmail,
          payerPhone
        });
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Webhook processato con successo' 
      });
    }

    // Altri tipi di eventi PayPal
    switch (webhookData.event_type) {
      case 'PAYMENT.CAPTURE.DENIED':
      case 'PAYMENT.CAPTURE.REFUNDED':
        console.log('⚠️ Pagamento PayPal negato o rimborsato');
        break;
      
      case 'CUSTOMER.DISPUTE.CREATED':
        console.log('⚠️ Disputa PayPal creata');
        break;
        
      default:
        console.log('ℹ️ Evento PayPal non gestito:', webhookData.event_type);
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Webhook ricevuto' 
    });

  } catch (error: any) {
    console.error('❌ Errore processing webhook PayPal:', error);
    
    return NextResponse.json({
      error: 'Errore processing webhook',
      details: error.message
    }, { status: 500 });
  }
}

// Funzione per inviare email di notifica
async function sendPayPalEmailNotification(paymentData: any) {
  try {
    const { amount, currency, paypalOrderId, payerName, payerEmail, payerPhone } = paymentData;
    
    const templateParams = {
      to_email: process.env.NOTIFICATION_EMAIL || 'ordini@pastosano.it',
      subject: `🅿️ Pagamento PayPal: ${payerName} - ${amount.toFixed(2)} ${currency}`,
      
      // Dati per il template
      order_type: 'PAGAMENTO PAYPAL',
      customer_name: payerName,
      customer_phone: payerPhone,
      customer_email: payerEmail,
      pickup_date: 'DA CONFERMARE',
      payment_method: 'PayPal',
      payment_status: 'PAGATO',
      
      // Dettagli pagamento
      total_amount: `${amount.toFixed(2)} ${currency}`,
      paypal_order_id: paypalOrderId,
      
      // Lista articoli (non disponibile da webhook base)
      items_list: 'DETTAGLI NON DISPONIBILI - Contattare il cliente',
      total_items: 'N/A',
      
      // Note speciali
      special_notes: '⚠️ ATTENZIONE: Questo ordine è stato pagato tramite PayPal. Contatta il cliente per confermare data di ritiro e dettagli prodotti.',
      
      // Timestamp
      order_date: new Date().toLocaleDateString('it-IT'),
      order_time: new Date().toLocaleTimeString('it-IT'),
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

    if (response.ok) {
      console.log('✅ Email PayPal inviata tramite EmailJS');
    } else {
      const errorText = await response.text();
      throw new Error(`EmailJS error: ${response.status} - ${errorText}`);
    }

  } catch (emailError: any) {
    console.error('❌ Errore invio email PayPal:', emailError.message);
    throw emailError;
  }
}

// GET endpoint per verificare che il webhook sia attivo
export async function GET() {
  return NextResponse.json({
    status: 'active',
    endpoint: '/api/paypal-webhook',
    message: 'PayPal webhook endpoint is active',
    timestamp: new Date().toISOString()
  });
}