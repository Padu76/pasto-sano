import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';

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
    
    // Prima query: ordini pending con delivery
    const pendingQuery = query(
      ordersRef,
      where('deliveryStatus', '==', 'pending'),
      orderBy('timestamp', 'desc')
    );

    // Seconda query: ordini del rider
    const riderQuery = query(
      ordersRef,
      where('riderId', '==', riderId),
      orderBy('timestamp', 'desc')
    );

    const [pendingSnapshot, riderSnapshot] = await Promise.all([
      getDocs(pendingQuery),
      getDocs(riderQuery)
    ]);

    const ordersMap = new Map();

    // Aggiungi ordini pending
    pendingSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.deliveryEnabled === 'true' || data.deliveryEnabled === true) {
        ordersMap.set(doc.id, {
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
          items: Array.isArray(data.items) ? data.items : [],
          notes: data.notes || '',
          timestamp: data.timestamp?.toDate?.() || new Date(),
          riderId: data.riderId || null,
          riderName: data.riderName || null,
          assignedAt: data.assignedAt?.toDate?.() || null,
          deliveredAt: data.deliveredAt?.toDate?.() || null
        });
      }
    });

    // Aggiungi ordini del rider (sovrascrive se già presenti)
    riderSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.deliveryEnabled === 'true' || data.deliveryEnabled === true) {
        ordersMap.set(doc.id, {
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
          items: Array.isArray(data.items) ? data.items : [],
          notes: data.notes || '',
          timestamp: data.timestamp?.toDate?.() || new Date(),
          riderId: data.riderId || null,
          riderName: data.riderName || null,
          assignedAt: data.assignedAt?.toDate?.() || null,
          deliveredAt: data.deliveredAt?.toDate?.() || null
        });
      }
    });

    const orders = Array.from(ordersMap.values()).sort((a, b) => 
      b.timestamp.getTime() - a.timestamp.getTime()
    );

    return NextResponse.json({
      success: true,
      orders: orders
    });

  } catch (error: any) {
    console.error('Errore caricamento ordini rider:', error);
    return NextResponse.json(
      { success: false, error: 'Errore durante il caricamento', details: error.message },
      { status: 500 }
    );
  }
}