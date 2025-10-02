import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  console.log('✅ === MARK DISCOUNT AS USED ===');
  
  try {
    const body = await request.json();
    const { code, email, phone, customerName, orderId } = body;

    console.log('📋 Registrazione uso codice:', code);
    console.log('👤 Email:', email);
    console.log('📞 Phone:', phone);
    console.log('🆔 Order ID:', orderId);

    // Valida input
    if (!code || (!email && !phone)) {
      return NextResponse.json(
        { error: 'Dati mancanti (code, email o phone richiesti)' },
        { status: 400 }
      );
    }

    // Verifica Firebase
    if (!db) {
      console.error('❌ Firebase non inizializzato');
      return NextResponse.json(
        { error: 'Servizio temporaneamente non disponibile' },
        { status: 500 }
      );
    }

    const discountCode = code.toUpperCase().trim();

    try {
      // Salva l'uso del codice su Firebase
      const usageRef = collection(db, 'discount_usage');
      
      const usageData = {
        code: discountCode,
        email: email ? email.toLowerCase().trim() : null,
        phone: phone ? phone.trim() : null,
        customerName: customerName || 'Non fornito',
        orderId: orderId || null,
        usedAt: Timestamp.now(),
        createdAt: Timestamp.now()
      };

      console.log('💾 Salvataggio uso codice su Firebase...');
      const docRef = await addDoc(usageRef, usageData);
      
      console.log('✅ Uso codice registrato con ID:', docRef.id);

      return NextResponse.json({
        success: true,
        message: 'Codice sconto registrato come utilizzato',
        usageId: docRef.id
      });

    } catch (firebaseError: any) {
      console.error('❌ Errore salvataggio Firebase:', firebaseError);
      
      // Non bloccare l'ordine se Firebase fallisce
      // Log error ma ritorna success
      return NextResponse.json({
        success: true,
        warning: 'Errore registrazione uso codice (ordine completato comunque)',
        error: firebaseError.message
      });
    }

  } catch (error: any) {
    console.error('❌ Errore use discount:', error);
    
    return NextResponse.json(
      { 
        error: 'Errore registrazione uso codice',
        details: error.message
      },
      { status: 500 }
    );
  }
}

// GET endpoint per verificare configurazione
export async function GET() {
  return NextResponse.json({
    status: 'active',
    endpoint: '/api/use-discount',
    message: 'Mark discount code as used endpoint',
    firebaseConfigured: !!db,
    timestamp: new Date().toISOString()
  });
}