import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, updateDoc, Timestamp } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    const { riderId, status } = await request.json();

    if (!riderId || !status) {
      return NextResponse.json(
        { success: false, error: 'riderId e status obbligatori' },
        { status: 400 }
      );
    }

    if (status !== 'active' && status !== 'inactive') {
      return NextResponse.json(
        { success: false, error: 'Status deve essere active o inactive' },
        { status: 400 }
      );
    }

    const riderRef = doc(db, 'riders', riderId);
    await updateDoc(riderRef, {
      status,
      updatedAt: Timestamp.now()
    });

    return NextResponse.json({
      success: true,
      message: `Rider ${status === 'active' ? 'attivato' : 'disattivato'} con successo`
    });

  } catch (error: any) {
    console.error('Errore cambio stato rider:', error);
    return NextResponse.json(
      { success: false, error: 'Errore durante il cambio stato' },
      { status: 500 }
    );
  }
}