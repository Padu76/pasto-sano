import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

// Codici sconto e relative regole
const DISCOUNT_RULES: { [key: string]: { percent: number; singleUse: boolean } } = {
  'SCONTO5': { percent: 5, singleUse: true },
  'BENVENUTO': { percent: 10, singleUse: false },
  'PASTOSANO20': { percent: 20, singleUse: false },
  'AMICO': { percent: 15, singleUse: false }
};

export async function POST(request: NextRequest) {
  console.log('🎫 === CHECK DISCOUNT CODE ===');
  
  try {
    const body = await request.json();
    const { code, email, phone } = body;

    console.log('📋 Verifica codice:', code);
    console.log('👤 Email:', email);
    console.log('📞 Phone:', phone);

    // Valida input
    if (!code) {
      return NextResponse.json(
        { error: 'Codice sconto mancante' },
        { status: 400 }
      );
    }

    const discountCode = code.toUpperCase().trim();

    // Verifica che il codice esista
    if (!DISCOUNT_RULES[discountCode]) {
      console.log('❌ Codice non valido:', discountCode);
      return NextResponse.json(
        { 
          valid: false, 
          error: 'Codice sconto non valido',
          message: 'Il codice inserito non esiste'
        },
        { status: 200 }
      );
    }

    const rule = DISCOUNT_RULES[discountCode];
    console.log('✅ Codice trovato:', rule);

    // Se non è single-use, è sempre valido
    if (!rule.singleUse) {
      console.log('✅ Codice multi-uso, sempre valido');
      return NextResponse.json({
        valid: true,
        percent: rule.percent,
        description: `${rule.percent}% di sconto`,
        code: discountCode,
        singleUse: false
      });
    }

    // Verifica Firebase se è single-use
    console.log('🔍 Verifica uso precedente su Firebase...');

    // Verifica che db sia inizializzato
    if (!db) {
      console.error('❌ Firebase non inizializzato');
      return NextResponse.json(
        { error: 'Servizio temporaneamente non disponibile' },
        { status: 500 }
      );
    }

    // Verifica che email o phone siano forniti per codici single-use
    if (!email && !phone) {
      console.log('⚠️ Email e telefono mancanti per codice single-use');
      return NextResponse.json(
        { 
          valid: false,
          error: 'Dati mancanti',
          message: 'Inserisci email o telefono per utilizzare questo codice'
        },
        { status: 200 }
      );
    }

    try {
      const usageRef = collection(db, 'discount_usage');
      let alreadyUsed = false;
      let usageDoc = null;

      // Verifica per email
      if (email) {
        const qEmail = query(
          usageRef,
          where('code', '==', discountCode),
          where('email', '==', email.toLowerCase().trim())
        );

        const snapshotEmail = await getDocs(qEmail);
        if (!snapshotEmail.empty) {
          alreadyUsed = true;
          usageDoc = snapshotEmail.docs[0].data();
        }
      }

      // Verifica per telefono se email non ha trovato match
      if (!alreadyUsed && phone) {
        const qPhone = query(
          usageRef,
          where('code', '==', discountCode),
          where('phone', '==', phone.trim())
        );

        const snapshotPhone = await getDocs(qPhone);
        if (!snapshotPhone.empty) {
          alreadyUsed = true;
          usageDoc = snapshotPhone.docs[0].data();
        }
      }

      if (alreadyUsed && usageDoc) {
        console.log('❌ Codice già utilizzato da questo utente');
        console.log('📋 Dettagli uso:', {
          usedAt: usageDoc.usedAt?.toDate?.(),
          email: usageDoc.email,
          phone: usageDoc.phone
        });

        return NextResponse.json({
          valid: false,
          error: 'Codice già utilizzato',
          message: 'Hai già utilizzato questo codice sconto',
          usedAt: usageDoc.usedAt?.toDate?.().toISOString() || null
        });
      }

      console.log('✅ Codice single-use disponibile per questo utente');

      return NextResponse.json({
        valid: true,
        percent: rule.percent,
        description: `${rule.percent}% di sconto`,
        code: discountCode,
        singleUse: true
      });

    } catch (firebaseError: any) {
      console.error('❌ Errore Firebase query:', firebaseError);
      
      // Se Firebase fallisce, permetti l'uso del codice (fail-open per UX)
      console.log('⚠️ Fallback: permetto uso codice nonostante errore Firebase');
      return NextResponse.json({
        valid: true,
        percent: rule.percent,
        description: `${rule.percent}% di sconto`,
        code: discountCode,
        singleUse: true,
        warning: 'Verifica uso precedente non disponibile'
      });
    }

  } catch (error: any) {
    console.error('❌ Errore check discount:', error);
    
    return NextResponse.json(
      { 
        error: 'Errore verifica codice sconto',
        details: error.message
      },
      { status: 500 }
    );
  }
}

// GET endpoint per verificare configurazione
export async function GET() {
  const availableCodes = Object.entries(DISCOUNT_RULES).map(([code, rule]) => ({
    code,
    percent: rule.percent,
    singleUse: rule.singleUse
  }));

  return NextResponse.json({
    status: 'active',
    endpoint: '/api/check-discount',
    message: 'Discount code verification endpoint',
    availableCodes,
    firebaseConfigured: !!db,
    timestamp: new Date().toISOString()
  });
}