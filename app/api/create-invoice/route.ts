import { NextRequest, NextResponse } from 'next/server';

// Tipi per Fatture in Cloud API
interface FICInvoiceItem {
  product_id?: number;
  code?: string;
  name: string;
  measure?: string;
  net_price: number;
  category?: string;
  id?: number;
  gross_price?: number;
  apply_withholding_taxes?: boolean;
  discount?: number;
  discount_highlight?: boolean;
  in_dn?: boolean;
  qty: number;
  vat?: {
    id: number;
    value: number;
    description: string;
  };
  stock?: boolean;
  description?: string;
  not_taxable?: boolean;
}

interface FICClient {
  id?: number;
  code?: string;
  name: string;
  type?: string;
  first_name?: string;
  last_name?: string;
  contact_person?: string;
  vat_number?: string;
  tax_code: string;
  address_street: string;
  address_postal_code: string;
  address_city: string;
  address_province: string;
  address_extra?: string;
  country?: string;
  email?: string;
  certified_email?: string;
  phone?: string;
  fax?: string;
  notes?: string;
  default_payment_terms?: number;
  default_vat?: {
    id: number;
    value: number;
  };
  default_payment_method?: {
    id: number;
    name: string;
  };
  bank_name?: string;
  bank_iban?: string;
  bank_swift_code?: string;
  shipping_address?: string;
  e_invoice?: boolean;
  ei_code?: string;
  discount_highlight?: boolean;
  default_discount?: number;
}

interface FICInvoice {
  id?: number;
  type?: string;
  entity: {
    id?: number;
    name: string;
    vat_number?: string;
    tax_code?: string;
    address_street?: string;
    address_postal_code?: string;
    address_city?: string;
    address_province?: string;
    country?: string;
    email?: string;
    certified_email?: string;
    phone?: string;
  };
  date: string;
  number?: number;
  numeration?: string;
  amount_net: number;
  amount_vat: number;
  amount_gross: number;
  amount_due_discount?: number;
  amount_rivalsa?: number;
  amount_cassa?: number;
  amount_withholding_tax?: number;
  amount_other_withholding_tax?: number;
  items_list: FICInvoiceItem[];
  payments_list?: Array<{
    amount: number;
    due_date: string;
    paid_date?: string;
    payment_terms?: {
      days: number;
      type: string;
    };
    status?: string;
  }>;
  payment_method?: {
    id?: number;
    name: string;
  };
  currency?: {
    id?: string;
    symbol?: string;
    exchange_rate?: string;
  };
  language?: {
    code: string;
    name: string;
  };
  notes?: string;
  rivalry?: number;
  cassa?: number;
  withholding_tax?: number;
  withholding_tax_taxable?: number;
  other_withholding_tax?: number;
  stamp_duty?: number;
  use_split_payment?: boolean;
  use_gross_prices?: boolean;
  e_invoice?: boolean;
  ei_type?: string;
  ei_raw?: object;
  ei_status?: string;
}

export async function POST(request: NextRequest) {
  console.log('🧾 === INIZIO CREAZIONE FATTURA FATTURE IN CLOUD ===');
  
  try {
    // Verifica configurazione
    const clientId = process.env.FIC_CLIENT_ID;
    const clientSecret = process.env.FIC_CLIENT_SECRET;
    const companyId = process.env.FIC_COMPANY_ID;
    
    console.log('🔑 Verifica credenziali FIC:', {
      clientId: !!clientId,
      clientSecret: !!clientSecret,
      companyId: !!companyId
    });
    
    if (!clientId || !clientSecret || !companyId) {
      console.error('❌ Credenziali Fatture in Cloud mancanti');
      return NextResponse.json(
        { 
          error: 'Configurazione Fatture in Cloud mancante',
          details: 'Verifica le environment variables: FIC_CLIENT_ID, FIC_CLIENT_SECRET, FIC_COMPANY_ID'
        },
        { status: 500 }
      );
    }

    // Parse body
    const body = await request.json();
    console.log('📦 Dati ricevuti:', {
      customerName: body.customerName,
      fiscalCode: body.fiscalCode,
      totalAmount: body.totalAmount,
      itemsCount: body.items?.length
    });

    const {
      customerName,
      customerEmail,
      fiscalCode,
      address,
      cap,
      city,
      province,
      items,
      totalAmount,
      orderDate,
      sessionId
    } = body;

    // Validazione dati
    if (!customerName || !fiscalCode || !address || !cap || !city || !province || !items || !totalAmount) {
      return NextResponse.json(
        { error: 'Dati fattura incompleti' },
        { status: 400 }
      );
    }

    // STEP 1: Ottieni Access Token
    console.log('🔐 STEP 1: Richiesta Access Token...');
    
    const tokenResponse = await fetch('https://api-v2.fattureincloud.it/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret
      })
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('❌ Errore ottenimento token:', errorText);
      throw new Error(`Errore autenticazione FIC: ${tokenResponse.status}`);
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;
    console.log('✅ Access Token ottenuto');

    // STEP 2: Cerca o crea cliente
    console.log('👤 STEP 2: Ricerca cliente con CF:', fiscalCode);
    
    const searchResponse = await fetch(
      `https://api-v2.fattureincloud.it/c/${companyId}/entities/clients?fieldset=basic&q=${encodeURIComponent(fiscalCode)}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    let clientId_FIC: number;

    if (searchResponse.ok) {
      const searchData = await searchResponse.json();
      console.log('🔍 Risultati ricerca cliente:', searchData.data?.length || 0);
      
      if (searchData.data && searchData.data.length > 0) {
        // Cliente esistente
        clientId_FIC = searchData.data[0].id;
        console.log('✅ Cliente esistente trovato, ID:', clientId_FIC);
      } else {
        // Crea nuovo cliente
        console.log('➕ Cliente non trovato, creazione nuovo cliente...');
        
        const newClient: FICClient = {
          name: customerName,
          tax_code: fiscalCode.toUpperCase(),
          address_street: address,
          address_postal_code: cap,
          address_city: city,
          address_province: province.toUpperCase(),
          country: 'Italia',
          email: customerEmail || undefined,
          type: 'person'
        };

        const createClientResponse = await fetch(
          `https://api-v2.fattureincloud.it/c/${companyId}/entities/clients`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ data: newClient })
          }
        );

        if (!createClientResponse.ok) {
          const errorText = await createClientResponse.text();
          console.error('❌ Errore creazione cliente:', errorText);
          throw new Error(`Errore creazione cliente: ${createClientResponse.status}`);
        }

        const clientData = await createClientResponse.json();
        clientId_FIC = clientData.data.id;
        console.log('✅ Nuovo cliente creato, ID:', clientId_FIC);
      }
    } else {
      throw new Error('Errore ricerca cliente');
    }

    // STEP 3: Prepara items fattura
    console.log('📋 STEP 3: Preparazione items fattura...');
    
    const invoiceItems: FICInvoiceItem[] = items.map((item: any) => {
      const netPrice = item.price || 0;
      const quantity = item.quantity || 1;
      
      return {
        name: item.name || 'Prodotto',
        qty: quantity,
        net_price: netPrice,
        vat: {
          id: 0, // 0 = IVA 0% (regime forfettario/esente)
          value: 0,
          description: 'Esente art. 1 c. 54-89 L. 190/2014'
        }
      };
    });

    console.log('✅ Items preparati:', invoiceItems.length);

    // STEP 4: Calcola totali
    const amountNet = totalAmount;
    const amountVat = 0; // Nessuna IVA
    const amountGross = totalAmount;

    console.log('💰 Totali calcolati:', {
      net: amountNet,
      vat: amountVat,
      gross: amountGross
    });

    // STEP 5: Crea fattura
    console.log('🧾 STEP 4: Creazione fattura...');
    
    const invoice: FICInvoice = {
      type: 'invoice',
      entity: {
        id: clientId_FIC,
        name: customerName,
        tax_code: fiscalCode.toUpperCase(),
        address_street: address,
        address_postal_code: cap,
        address_city: city,
        address_province: province.toUpperCase(),
        country: 'Italia',
        email: customerEmail || undefined
      },
      date: orderDate || new Date().toISOString().split('T')[0],
      number: undefined, // Auto-generato
      numeration: '/2025', // Anno corrente
      amount_net: amountNet,
      amount_vat: amountVat,
      amount_gross: amountGross,
      items_list: invoiceItems,
      payment_method: {
        name: 'Carta di credito'
      },
      use_gross_prices: false,
      e_invoice: false, // Fattura semplificata
      notes: sessionId ? `Ordine online - Stripe Session: ${sessionId}` : 'Ordine online'
    };

    const createInvoiceResponse = await fetch(
      `https://api-v2.fattureincloud.it/c/${companyId}/issued_documents`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ data: invoice })
      }
    );

    if (!createInvoiceResponse.ok) {
      const errorText = await createInvoiceResponse.text();
      console.error('❌ Errore creazione fattura:', errorText);
      throw new Error(`Errore creazione fattura: ${createInvoiceResponse.status} - ${errorText}`);
    }

    const invoiceData = await createInvoiceResponse.json();
    const invoiceId = invoiceData.data.id;
    const invoiceNumber = invoiceData.data.number;
    
    console.log('✅ Fattura creata con successo!');
    console.log('📄 Invoice ID:', invoiceId);
    console.log('🔢 Invoice Number:', invoiceNumber);

    // STEP 5: Invia fattura via email (opzionale)
    if (customerEmail) {
      console.log('📧 STEP 5: Invio fattura via email...');
      
      try {
        const emailResponse = await fetch(
          `https://api-v2.fattureincloud.it/c/${companyId}/issued_documents/${invoiceId}/email`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              data: {
                recipient_email: customerEmail,
                include_attachment: true,
                attach_pdf: true,
                subject: `Fattura ${invoiceNumber} - Pasto Sano`,
                body: `Gentile ${customerName},\n\nin allegato trova la fattura relativa al suo ordine.\n\nGrazie per aver scelto Pasto Sano!`
              }
            })
          }
        );

        if (emailResponse.ok) {
          console.log('✅ Fattura inviata via email a:', customerEmail);
        } else {
          console.warn('⚠️ Errore invio email fattura (non bloccante)');
        }
      } catch (emailError) {
        console.warn('⚠️ Errore invio email fattura:', emailError);
        // Non bloccare se l'invio email fallisce
      }
    }

    console.log('🎉 === FATTURA COMPLETATA CON SUCCESSO ===');

    return NextResponse.json({
      success: true,
      invoiceId,
      invoiceNumber,
      clientId: clientId_FIC,
      message: 'Fattura creata e inviata con successo'
    });

  } catch (error: any) {
    console.error('❌ === ERRORE CREAZIONE FATTURA ===');
    console.error('Errore:', error.message);
    console.error('Stack:', error.stack);
    
    return NextResponse.json(
      { 
        error: 'Errore durante la creazione della fattura',
        details: error.message
      },
      { status: 500 }
    );
  }
}

// GET endpoint per verificare configurazione
export async function GET() {
  const config = {
    client_id: !!process.env.FIC_CLIENT_ID,
    client_secret: !!process.env.FIC_CLIENT_SECRET,
    company_id: !!process.env.FIC_COMPANY_ID
  };

  const allConfigured = Object.values(config).every(v => v === true);

  return NextResponse.json({
    status: allConfigured ? 'configured' : 'missing_credentials',
    endpoint: '/api/create-invoice',
    message: 'Fatture in Cloud API endpoint',
    configuration: config,
    timestamp: new Date().toISOString()
  });
}