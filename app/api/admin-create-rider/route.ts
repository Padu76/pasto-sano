import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs, Timestamp } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, password } = await request.json();

    if (!name || !email || !phone || !password) {
      return NextResponse.json(
        { success: false, error: 'Tutti i campi sono obbligatori' },
        { status: 400 }
      );
    }

    // Verifica email univoca
    const ridersRef = collection(db, 'riders');
    const q = query(ridersRef, where('email', '==', email.toLowerCase()));
    const existing = await getDocs(q);

    if (!existing.empty) {
      return NextResponse.json(
        { success: false, error: 'Email già in uso' },
        { status: 409 }
      );
    }

    // Crea nuovo rider
    const newRider = {
      name,
      email: email.toLowerCase(),
      phone,
      password, // In produzione: usa bcrypt hash
      status: 'active',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    const docRef = await addDoc(collection(db, 'riders'), newRider);

    return NextResponse.json({
      success: true,
      riderId: docRef.id,
      message: 'Rider creato con successo'
    });

  } catch (error: any) {
    console.error('Errore creazione rider:', error);
    return NextResponse.json(
      { success: false, error: 'Errore durante la creazione' },
      { status: 500 }
    );
  }
}