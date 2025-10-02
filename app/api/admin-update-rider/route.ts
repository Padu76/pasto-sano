import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, updateDoc, Timestamp } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    const { id, name, email, phone, password } = await request.json();

    if (!id || !name || !email || !phone) {
      return NextResponse.json(
        { success: false, error: 'Campi obbligatori mancanti' },
        { status: 400 }
      );
    }

    const riderRef = doc(db, 'riders', id);
    
    const updateData: any = {
      name,
      email: email.toLowerCase(),
      phone,
      updatedAt: Timestamp.now()
    };

    // Aggiorna password solo se fornita
    if (password && password.trim() !== '') {
      updateData.password = password; // In produzione: usa bcrypt hash
    }

    await updateDoc(riderRef, updateData);

    return NextResponse.json({
      success: true,
      message: 'Rider aggiornato con successo'
    });

  } catch (error: any) {
    console.error('Errore aggiornamento rider:', error);
    return NextResponse.json(
      { success: false, error: 'Errore durante l\'aggiornamento' },
      { status: 500 }
    );
  }
}