import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email e password obbligatori' },
        { status: 400 }
      );
    }

    // Query Firestore per trovare il rider
    const ridersRef = collection(db, 'riders');
    const q = query(ridersRef, where('email', '==', email.toLowerCase()));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return NextResponse.json(
        { success: false, error: 'Credenziali non valide' },
        { status: 401 }
      );
    }

    const riderDoc = snapshot.docs[0];
    const riderData = riderDoc.data();

    // Verifica password (in produzione usare bcrypt o simile)
    // Per ora confronto diretto - DA MIGLIORARE IN PRODUZIONE
    if (riderData.password !== password) {
      return NextResponse.json(
        { success: false, error: 'Credenziali non valide' },
        { status: 401 }
      );
    }

    // Verifica che il rider sia attivo
    if (riderData.status !== 'active') {
      return NextResponse.json(
        { success: false, error: 'Account non attivo. Contatta l\'amministratore.' },
        { status: 403 }
      );
    }

    // Login riuscito
    return NextResponse.json({
      success: true,
      rider: {
        id: riderDoc.id,
        name: riderData.name,
        email: riderData.email,
        phone: riderData.phone || ''
      }
    });

  } catch (error: any) {
    console.error('Errore login rider:', error);
    return NextResponse.json(
      { success: false, error: 'Errore durante il login' },
      { status: 500 }
    );
  }
}