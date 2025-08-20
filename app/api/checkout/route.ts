import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function POST(request: NextRequest) {
  console.log('🚀 === INIZIO STRIPE CHECKOUT API ===');
  
  try {
    // 🔧 VERIFICA VARIABILI D'AMBIENTE
    console.log('🔍 Verifica variabili d\'ambiente:');
    console.log('STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY ? '✅ Configurata' : '❌ MANCANTE');
    console.log('APP_URL:', process.env.APP_URL ? `✅ ${process.env.APP_URL}` : '❌ MANCANTE');
    console.log('NEXT_PUBLIC_APP_URL:', process.env.NEXT_PUBLIC_APP_URL ? `✅ ${process.env.NEXT_PUBLIC_APP_URL}` : '❌ MANCANTE');
    
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('❌ STRIPE_SECRET_KEY non configurata');
      return NextResponse.json(
        { error: 'Configurazione Stripe mancante' },
        { status: 500 }
      );
    }
    
    // Usa APP_URL se disponibile, altrimenti NEXT_PUBLIC_APP_URL
    const baseUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL;
    
    if (!baseUrl) {
      console.error('❌ Nessun URL configurato');
      return NextResponse.json(
        { error: 'URL app non configurata' },
        { status: 500 }
      );
    }
    
    console.log('🔗 URL base utilizzato:', baseUrl);

    // 📦 PARSING REQUEST BODY CON NUOVO FORMATO
    console.log('📦 Parsing request body...');
    const body = await request.json();
    console.log('📦 Body ricevuto:', JSON.stringify(body, null, 2));
    
    // ✅ LETTURA DATI DAL NUOVO FORMATO CON METADATA
    const { 
      items, 
      customerEmail, 
      customerName, 
      customerPhone,
      customerAddress,
      metadata  // ← NUOVO CAMPO METADATA
    } = body;

    // ✅ SE ESISTONO METADATA, USA QUELLI (FORMATO NUOVO)
    let finalCustomerName = customerName;
    let finalCustomerEmail = customerEmail;
    let finalCustomerPhone = customerPhone;
    let finalCustomerAddress = customerAddress;
    let pickupDate = '';
    let orderNotes = '';
    let discountCode = '';
    let discountPercent = 0;
    let originalAmount = 0;
    let orderItems = [];

    if (metadata) {
      console.log('✅ === USANDO FORMATO NUOVO CON METADATA ===');
      console.log('📋 Metadata ricevuti:', Object.keys(metadata));
      
      // Usa i dati dai metadata
      finalCustomerName = metadata.customerName || customerName;
      finalCustomerEmail = metadata.customerEmail || customerEmail;
      finalCustomerPhone = metadata.customerPhone || customerPhone;
      finalCustomerAddress = metadata.customerAddress || customerAddress;
      pickupDate = metadata.pickupDate || '';
      orderNotes = metadata.orderNotes || '';
      discountCode = metadata.discountCode || '';
      discountPercent = parseFloat(metadata.discountPercent || '0');
      originalAmount = parseFloat(metadata.originalAmount || '0');
      
      // Parse orderItems dai metadata
      if (metadata.orderItems) {
        try {
          orderItems = JSON.parse(metadata.orderItems);
          console.log('✅ Order items parsati dai metadata:', orderItems.length, 'articoli');
        } catch (e) {
          console.error('❌ Errore parsing orderItems dai metadata:', e);
          orderItems = items || []; // Fallback agli items diretti
        }
      } else {
        orderItems = items || [];
      }
    } else {
      console.log('⚠️ === USANDO FORMATO VECCHIO SENZA METADATA ===');
      // Formato vecchio - usa i dati diretti
      const {
        pickupDate: oldPickupDate,
        notes,
        appliedDiscount,
        originalAmount: oldOriginalAmount,
        totalAmount
      } = body;
      
      pickupDate = oldPickupDate || '';
      orderNotes = notes || '';
      
      if (appliedDiscount) {
        discountCode = appliedDiscount.code || '';
        discountPercent = appliedDiscount.percent || 0;
      }
      
      originalAmount = oldOriginalAmount || 0;
      orderItems = items || [];
    }
    
    // 🔍 VALIDAZIONE DATI FINALI
    console.log('🔍 Dati finali estratti:');
    console.log('finalCustomerName:', finalCustomerName);
    console.log('finalCustomerEmail:', finalCustomerEmail);
    console.log('finalCustomerPhone:', finalCustomerPhone);
    console.log('finalCustomerAddress:', finalCustomerAddress);
    console.log('pickupDate:', pickupDate);
    console.log('discountCode:', discountCode);
    console.log('discountPercent:', discountPercent);
    console.log('originalAmount:', originalAmount);
    console.log('orderItems count:', orderItems.length);
    
    if (!orderItems || orderItems.length === 0) {
      console.error('❌ Carrello vuoto dopo parsing');
      return NextResponse.json(
        { error: 'Carrello vuoto' },
        { status: 400 }
      );
    }
    
    if (!finalCustomerName) {
      console.error('❌ Nome cliente mancante');
      return NextResponse.json(
        { error: 'Nome cliente richiesto' },
        { status: 400 }
      );
    }

    // 🛒 CALCOLO PREZZI CON SCONTI
    console.log('🛒 Calcolo prezzi e sconti...');
    
    // Calcola totale originale dai dati ricevuti
    let calculatedOriginal = 0;
    orderItems.forEach((item: any) => {
      calculatedOriginal += (item.price || 0) * (item.quantity || 1);
    });
    
    // Usa originalAmount se fornito, altrimenti calcola
    const finalOriginalAmount = originalAmount > 0 ? originalAmount : calculatedOriginal;
    
    // Calcola importo finale con sconto
    let finalTotalAmount = finalOriginalAmount;
    let discountAmount = 0;
    
    if (discountPercent > 0) {
      discountAmount = (finalOriginalAmount * discountPercent) / 100;
      finalTotalAmount = Math.max(0, finalOriginalAmount - discountAmount);
    }
    
    console.log('💰 Calcoli finali:');
    console.log('Original Amount:', finalOriginalAmount.toFixed(2));
    console.log('Discount Percent:', discountPercent + '%');
    console.log('Discount Amount:', discountAmount.toFixed(2));
    console.log('Final Total:', finalTotalAmount.toFixed(2));

    // 🛒 CREAZIONE LINE ITEMS CON SCONTI APPLICATI
    console.log('🛒 Creazione line items per Stripe...');
    
    const lineItems = orderItems.map((item: any, index: number) => {
      // Calcola prezzo unitario scontato
      let unitPrice = item.price || 0;
      if (discountPercent > 0) {
        unitPrice = unitPrice * (1 - discountPercent / 100);
      }
      
      console.log(`Item ${index + 1}:`, {
        name: item.name,
        originalPrice: item.price,
        finalPrice: unitPrice.toFixed(2),
        quantity: item.quantity,
        discount: discountCode ? `${discountPercent}%` : 'Nessuno'
      });
      
      // 🔧 FIX IMMAGINI - Converti path relativi in URL assoluti
      let productImages: string[] = [];
      if (item.image && item.image.startsWith('http')) {
        // URL assoluto - OK
        productImages = [item.image];
      } else if (item.image && item.image.startsWith('/')) {
        // Path relativo - converti in assoluto
        productImages = [`${baseUrl}${item.image}`];
      }
      
      console.log(`🖼️ Immagini per ${item.name}:`, productImages);
      
      return {
        price_data: {
          currency: 'eur',
          product_data: {
            name: item.name,
            description: (item.description || '') + (discountCode ? ` (Sconto ${discountCode} -${discountPercent}%)` : ''),
            images: productImages,
          },
          unit_amount: Math.round(unitPrice * 100), // Stripe usa centesimi
        },
        quantity: item.quantity || 1,
      };
    });
    
    console.log('✅ Line items creati:', lineItems.length);

    // 📝 PREPARAZIONE METADATA COMPLETI PER WEBHOOK
    console.log('📝 Preparazione metadata per webhook...');
    
    const stripeMetadata = {
      // Dati cliente
      customerName: finalCustomerName,
      customerEmail: finalCustomerEmail || '',
      customerPhone: finalCustomerPhone || '',
      customerAddress: finalCustomerAddress || 'Ritiro presso Pasto Sano',
      
      // Dati ordine
      pickupDate: pickupDate || '',
      orderNotes: orderNotes || '',
      
      // Dati sconto
      discountCode: discountCode || '',
      discountPercent: discountPercent.toString(),
      
      // Dati importi
      originalAmount: finalOriginalAmount.toFixed(2),
      discountAmount: discountAmount.toFixed(2),
      totalAmount: finalTotalAmount.toFixed(2),
      
      // Lista articoli come JSON string per il webhook
      orderItems: JSON.stringify(orderItems.map((item: any) => ({
        name: item.name,
        description: item.description || '',
        price: item.price || 0,
        quantity: item.quantity || 1
      })))
    };
    
    console.log('📝 Metadata preparati per webhook:', Object.keys(stripeMetadata));
    console.log('📝 Metadata values:', {
      customerName: stripeMetadata.customerName,
      orderItemsLength: orderItems.length,
      discountCode: stripeMetadata.discountCode,
      totalAmount: stripeMetadata.totalAmount
    });

    // 🔗 URL CONFIGURAZIONE
    const successUrl = `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${baseUrl}/`;
    
    console.log('🔗 URLs configurati:');
    console.log('Success URL:', successUrl);
    console.log('Cancel URL:', cancelUrl);

    // 🎯 CONFIGURAZIONE SESSIONE STRIPE
    console.log('🎯 Configurazione sessione Stripe...');
    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: finalCustomerEmail || undefined,
      metadata: stripeMetadata,
      // Non serve shipping per ritiro in sede
    };
    
    console.log('🎯 Configurazione sessione finale:', {
      payment_method_types: sessionConfig.payment_method_types,
      mode: sessionConfig.mode,
      line_items_count: sessionConfig.line_items?.length || 0,
      customer_email: sessionConfig.customer_email || 'Non fornita',
      metadata_keys: Object.keys(sessionConfig.metadata || {}),
      total_amount_expected: finalTotalAmount
    });

    // 🚀 CREAZIONE SESSIONE STRIPE
    console.log('🚀 Creazione sessione Stripe...');
    const session = await stripe.checkout.sessions.create(sessionConfig);
    
    console.log('✅ === SESSIONE STRIPE CREATA CON SUCCESSO! ===');
    console.log('Session ID:', session.id);
    console.log('Session URL:', session.url);
    console.log('Amount Total (centesimi):', session.amount_total);
    console.log('Amount Total (euro):', session.amount_total ? (session.amount_total / 100).toFixed(2) : 'N/A');

    console.log('🎉 === STRIPE CHECKOUT COMPLETATO ===');
    return NextResponse.json({ 
      sessionId: session.id,
      amount: session.amount_total ? (session.amount_total / 100) : finalTotalAmount,
      discount: discountCode ? { code: discountCode, percent: discountPercent, amount: discountAmount } : null
    });

  } catch (error: any) {
    console.error('💥 === ERRORE STRIPE CHECKOUT ===');
    console.error('Tipo errore:', typeof error);
    console.error('Nome errore:', error.name);
    console.error('Messaggio:', error.message);
    console.error('Stack:', error.stack);
    
    if (error.type === 'StripeError') {
      console.error('🔴 ERRORE STRIPE SPECIFICO:');
      console.error('Code:', error.code);
      console.error('Type:', error.type);
      console.error('Param:', error.param);
      console.error('Detail:', error.detail);
    }
    
    console.error('Raw error object:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    
    return NextResponse.json(
      { 
        error: 'Errore durante la creazione del checkout',
        details: error.message,
        type: error.type || 'unknown'
      },
      { status: 500 }
    );
  }
}