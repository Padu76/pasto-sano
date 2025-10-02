import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, getDocs, or } from 'firebase/firestore';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const riderId = searchParams.get('riderId');

    if (!riderId) {
      return NextResponse.json(
        { success: false, error: 'riderId mancante' },
        { status: 400 }
      );
    }

    const ordersRef = collection(db, 'orders');
    
    // Query per ottenere:
    // 1. Ordini pending con delivery enabled (disponibili per tutti i rider)
    // 2. Ordini assegnati a questo rider (in_delivery o delivered)
    const q = query(
      ordersRef,
      or(
        where('deliveryStatus', '==', 'pending'),
        where('riderId', '==', riderId)
      ),
      orderBy('timestamp', 'desc')
    );

    const snapshot = await getDocs(q);
    const orders: any[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      
      // Filtra solo ordini con delivery abilitato
      if (data.deliveryEnabled === 'true' || data.deliveryEnabled === true) {
        orders.push({
          id: doc.id,
          customerName: data.customerName || 'Cliente',
          customerPhone: data.customerPhone || '',
          customerEmail: data.customerEmail || '',
          deliveryAddress: data.deliveryAddress || '',
          deliveryAddressDetails: data.deliveryAddressDetails || '',
          deliveryDistance: parseFloat(data.deliveryDistance) || 0,
          deliveryZone: data.deliveryZone || '',
          deliveryCost: parseFloat(data.deliveryCost) || 0,
          deliveryRiderShare: parseFloat(data.deliveryRiderShare) || 0,
          deliveryPlatformShare: parseFloat(data.deliveryPlatformShare) || 0,
          deliveryStatus: data.deliveryStatus || 'pending',
          pickupDate: data.pickupDate || '',
          totalAmount: parseFloat(data.totalAmount) || 0,
          items: data.orderItems ? JSON.parse(data.orderItems) : [],
          notes: data.orderNotes || '',
          timestamp: data.timestamp?.toDate?.() || new Date(),
          riderId: data.riderId || null,
          riderName: data.riderName || null,
          assignedAt: data.assignedAt?.toDate?.() || null,
          deliveredAt: data.deliveredAt?.toDate?.() || null
        });
      }
    });

    return NextResponse.json({
      success: true,
      orders: orders
    });

  } catch (error: any) {
    console.error('Errore caricamento ordini rider:', error);
    return NextResponse.json(
      { success: false, error: 'Errore durante il caricamento' },
      { status: 500 }
    );
  }
}