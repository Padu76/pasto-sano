import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    const { orderId, riderId } = await request.json();

    if (!orderId || !riderId) {
      return NextResponse.json(
        { success: false, error: 'Dati mancanti' },
        { status: 400 }
      );
    }

    const orderRef = doc(db, 'orders', orderId);
    const orderSnap = await getDoc(orderRef);

    if (!orderSnap.exists()) {
      return NextResponse.json(
        { success: false, error: 'Ordine non trovato' },
        { status: 404 }
      );
    }

    const orderData = orderSnap.data();

    // Verifica che l'ordine sia assegnato a questo rider
    if (orderData.riderId !== riderId) {
      return NextResponse.json(
        { success: false, error: 'Non sei autorizzato a completare questo ordine' },
        { status: 403 }
      );
    }

    // Verifica che l'ordine sia in delivery
    if (orderData.deliveryStatus !== 'in_delivery') {
      return NextResponse.json(
        { success: false, error: 'Ordine non in consegna' },
        { status: 409 }
      );
    }

    // Aggiorna ordine: completa consegna
    await updateDoc(orderRef, {
      deliveryStatus: 'delivered',
      deliveredAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });

    return NextResponse.json({
      success: true,
      message: 'Consegna completata con successo'
    });

  } catch (error: any) {
    console.error('Errore completamento consegna:', error);
    return NextResponse.json(
      { success: false, error: 'Errore durante il completamento' },
      { status: 500 }
    );
  }
}