import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    const { orderId, riderId } = await request.json();

    if (!orderId || !riderId) {
      return NextResponse.json(
        { success: false, error: 'orderId e riderId obbligatori' },
        { status: 400 }
      );
    }

    // Verifica che il rider esista ed sia attivo
    const riderRef = doc(db, 'riders', riderId);
    const riderSnap = await getDoc(riderRef);

    if (!riderSnap.exists()) {
      return NextResponse.json(
        { success: false, error: 'Rider non trovato' },
        { status: 404 }
      );
    }

    const riderData = riderSnap.data();

    if (riderData.status !== 'active') {
      return NextResponse.json(
        { success: false, error: 'Rider non attivo' },
        { status: 400 }
      );
    }

    // Verifica che l'ordine esista
    const orderRef = doc(db, 'orders', orderId);
    const orderSnap = await getDoc(orderRef);

    if (!orderSnap.exists()) {
      return NextResponse.json(
        { success: false, error: 'Ordine non trovato' },
        { status: 404 }
      );
    }

    const orderData = orderSnap.data();

    // Verifica che sia un ordine delivery
    if (orderData.deliveryEnabled !== 'true' && orderData.deliveryEnabled !== true) {
      return NextResponse.json(
        { success: false, error: 'Ordine non è con consegna' },
        { status: 400 }
      );
    }

    // Assegna rider all'ordine
    await updateDoc(orderRef, {
      riderId: riderId,
      riderName: riderData.name,
      deliveryStatus: 'in_delivery',
      assignedAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });

    return NextResponse.json({
      success: true,
      message: `Ordine assegnato a ${riderData.name}`
    });

  } catch (error: any) {
    console.error('Errore assegnazione rider:', error);
    return NextResponse.json(
      { success: false, error: 'Errore durante l\'assegnazione' },
      { status: 500 }
    );
  }
}