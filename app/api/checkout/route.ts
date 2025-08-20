import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function POST(request: NextRequest) {
  console.log('🚀 === INIZIO STRIPE CHECKOUT API ===');
  
  try {
    // 🔧 VERIFICA VARIABILI D'AMBIENTE
    console.log('🔐 Verifica variabili d\'ambiente:');
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

    // 📦 PARSING REQUEST BODY
    console.log('📦 Parsing request body...');
    const body = await request.json();
    console.log('📦 Body ricevuto:', JSON.stringify(body, null, 2));
    
    const { items, customerEmail, customerName, customerAddress, customerPhone } = body;
    
    // 🔍 VALIDAZIONE DATI
    console.log('🔍 Validazione dati:');
    console.log('items:', items?.length || 0, 'articoli');
    console.log('customerEmail:', customerEmail || 'Non fornita');
    console.log('customerName:', customerName || 'Non fornito');
    console.log('customerPhone:', customerPhone || 'Non fornito');
    
    if (!items || items.length === 0) {
      console.error('❌ Carrello vuoto');
      return NextResponse.json(
        { error: 'Carrello vuoto' },
        { status: 400 }
      );
    }
    
    if (!customerName) {
      console.error('❌ Nome cliente mancante');
      return NextResponse.json(
        { error: 'Nome cliente richiesto' },
        { status: 400 }
      );
    }

    // 🛒 CREAZIONE LINE ITEMS
    console.log('🛒 Creazione line items per Stripe...');
    const lineItems = items.map((item: any, index: number) => {
      console.log(`Item ${index + 1}:`, {
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        description: item.description?.substring(0, 50) + '...'
      });
      
      // 🔧 FIX IMMAGINI - Converti path relativi in URL assoluti o rimuovi
      let productImages: string[] = [];
      if (item.image && item.image.startsWith('http')) {
        // URL assoluto - OK
        productImages = [item.image];
      } else if (item.image && item.image.startsWith('/')) {
        // Path relativo - converti in assoluto
        productImages = [`${baseUrl}${item.image}`];
      }
      // Se non c'è immagine valida, array vuoto
      
      console.log(`🖼️ Immagini per ${item.name}:`, productImages);
      
      return {
        price_data: {
          currency: 'eur',
          product_data: {
            name: item.name,
            description: item.description,
            images: productImages, // Usa array di immagini processate
          },
          unit_amount: Math.round(item.price * 100), // Stripe usa centesimi
        },
        quantity: item.quantity,
      };
    });
    
    console.log('✅ Line items creati:', lineItems.length);

    // 📝 PREPARAZIONE METADATA
    console.log('📝 Preparazione metadata...');
    const metadata = {
      customerName,
      customerAddress: customerAddress || 'Ritiro presso Pasto Sano',
      customerPhone: customerPhone || '',
      customerEmail: customerEmail || '',
      orderItems: JSON.stringify(items.map((item: any) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price
      })))
    };
    
    console.log('📝 Metadata preparati:', Object.keys(metadata));

    // 🔗 URL CONFIGURAZIONE
    const successUrl = `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${baseUrl}/`;
    
    console.log('🔗 URLs configurati:');
    console.log('Success URL:', successUrl);
    console.log('Cancel URL:', cancelUrl);

    // 🎯 CHIAMATA STRIPE API
    console.log('🎯 Creazione sessione Stripe...');
    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: customerEmail || undefined,
      metadata,
      // ❌ RIMOSSO shipping_address_collection - non serve per ritiro
    };
    
    console.log('🎯 Configurazione sessione:', {
      payment_method_types: sessionConfig.payment_method_types,
      mode: sessionConfig.mode,
      line_items_count: sessionConfig.line_items?.length || 0,
      customer_email: sessionConfig.customer_email || 'Non fornita',
      metadata_keys: Object.keys(sessionConfig.metadata || {})
    });

    const session = await stripe.checkout.sessions.create(sessionConfig);
    
    console.log('✅ Sessione Stripe creata con successo!');
    console.log('Session ID:', session.id);
    console.log('Session URL:', session.url);

    console.log('🎉 === STRIPE CHECKOUT COMPLETATO ===');
    return NextResponse.json({ sessionId: session.id });

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