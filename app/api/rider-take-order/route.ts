import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    const { orderId, riderId, riderName } = await request.json();

    if (!orderId || !riderId || !riderName) {
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

    // Verifica che l'ordine sia ancora pending
    if (orderData.deliveryStatus !== 'pending') {
      return NextResponse.json(
        { success: false, error: 'Ordine già assegnato ad altro rider' },
        { status: 409 }
      );
    }

    // Aggiorna ordine: assegna a rider e cambia status
    await updateDoc(orderRef, {
      riderId: riderId,
      riderName: riderName,
      deliveryStatus: 'in_delivery',
      assignedAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });

    return NextResponse.json({
      success: true,
      message: 'Ordine preso in carico con successo'
    });

  } catch (error: any) {
    console.error('Errore presa in carico ordine:', error);
    return NextResponse.json(
      { success: false, error: 'Errore durante l\'assegnazione' },
      { status: 500 }
    );
  }
}