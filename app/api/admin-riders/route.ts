import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { 
  collection, 
  getDocs, 
  addDoc, 
  query, 
  where, 
  orderBy,
  Timestamp 
} from 'firebase/firestore';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const periodType = searchParams.get('periodType') || 'month';
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');

    let startDate: Date;
    let endDate: Date;
    let periodLabel: string;

    if (startDateParam && endDateParam) {
      startDate = new Date(startDateParam);
      endDate = new Date(endDateParam);
      periodLabel = `${startDate.toLocaleDateString('it-IT')} - ${endDate.toLocaleDateString('it-IT')}`;
    } else if (periodType === 'week') {
      const now = new Date();
      const dayOfWeek = now.getDay();
      const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      startDate = new Date(now);
      startDate.setDate(now.getDate() - diff);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
      periodLabel = `Settimana ${startDate.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })} - ${endDate.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })}`;
    } else {
      const now = new Date();
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      endDate.setHours(23, 59, 59, 999);
      periodLabel = startDate.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' });
    }

    const ridersRef = collection(db, 'riders');
    const ridersSnapshot = await getDocs(ridersRef);
    const riders: any[] = [];

    ridersSnapshot.forEach((doc) => {
      riders.push({
        id: doc.id,
        ...doc.data()
      });
    });

    const ordersRef = collection(db, 'orders');
    const q = query(
      ordersRef,
      where('deliveryStatus', '==', 'delivered'),
      where('timestamp', '>=', Timestamp.fromDate(startDate)),
      where('timestamp', '<=', Timestamp.fromDate(endDate)),
      orderBy('timestamp', 'desc')
    );

    const ordersSnapshot = await getDocs(q);
    const riderPaymentsMap: Record<string, any> = {};

    ordersSnapshot.forEach((doc) => {
      const order = doc.data();
      const riderId = order.riderId;

      if (riderId) {
        if (!riderPaymentsMap[riderId]) {
          const rider = riders.find(r => r.id === riderId);
          riderPaymentsMap[riderId] = {
            riderId,
            riderName: rider?.name || order.riderName || 'Rider Sconosciuto',
            totalDeliveries: 0,
            totalEarnings: 0,
            totalDistance: 0,
            orders: []
          };
        }

        riderPaymentsMap[riderId].totalDeliveries++;
        riderPaymentsMap[riderId].totalEarnings += parseFloat(order.deliveryRiderShare || '0');
        riderPaymentsMap[riderId].totalDistance += parseFloat(order.deliveryDistance || '0');
        riderPaymentsMap[riderId].orders.push(doc.id);
      }
    });

    const paymentsRef = collection(db, 'rider_payments');
    const paymentsQuery = query(
      paymentsRef,
      where('period.start', '>=', Timestamp.fromDate(startDate)),
      where('period.end', '<=', Timestamp.fromDate(endDate))
    );
    const paymentsSnapshot = await getDocs(paymentsQuery);
    const paidRiders = new Set<string>();

    paymentsSnapshot.forEach((doc) => {
      const payment = doc.data();
      if (payment.status === 'paid') {
        paidRiders.add(payment.riderId);
      }
    });

    const payments = Object.values(riderPaymentsMap).map(payment => ({
      ...payment,
      period: {
        start: startDate,
        end: endDate,
        label: periodLabel
      },
      status: paidRiders.has(payment.riderId) ? 'paid' : 'pending'
    }));

    return NextResponse.json({
      success: true,
      payments,
      period: {
        start: startDate,
        end: endDate,
        label: periodLabel
      }
    });

  } catch (error: any) {
    console.error('Errore caricamento pagamenti rider:', error);
    return NextResponse.json(
      { success: false, error: 'Errore durante il caricamento' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { riderId, riderName, period, totalDeliveries, totalEarnings, totalDistance, orders, notes } = body;

    const paymentData = {
      riderId,
      riderName,
      period: {
        start: Timestamp.fromDate(new Date(period.start)),
        end: Timestamp.fromDate(new Date(period.end)),
        label: period.label
      },
      totalDeliveries,
      totalEarnings,
      totalDistance,
      orders,
      status: 'paid',
      paidAt: Timestamp.now(),
      notes: notes || '',
      createdAt: Timestamp.now()
    };

    const paymentsRef = collection(db, 'rider_payments');
    const docRef = await addDoc(paymentsRef, paymentData);

    return NextResponse.json({
      success: true,
      paymentId: docRef.id,
      message: 'Pagamento registrato con successo'
    });

  } catch (error: any) {
    console.error('Errore registrazione pagamento:', error);
    return NextResponse.json(
      { success: false, error: 'Errore durante la registrazione del pagamento' },
      { status: 500 }
    );
  }
}