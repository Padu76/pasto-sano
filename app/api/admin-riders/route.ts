import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';

export async function GET() {
  try {
    if (!db) {
      console.error('Firestore non inizializzato');
      return NextResponse.json(
        { success: false, error: 'Firestore not initialized', riders: [] },
        { status: 500 }
      );
    }

    const ridersRef = collection(db, 'riders');
    const q = query(ridersRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);

    const riders: any[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      riders.push({
        id: doc.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        status: data.status || 'active',
        active: data.status === 'active',
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      });
    });

    return NextResponse.json({
      success: true,
      riders,
      count: riders.length
    });

  } catch (error: any) {
    console.error('Errore caricamento riders:', error);
    return NextResponse.json(
      { success: false, error: 'Errore durante il caricamento riders', details: error.message, riders: [] },
      { status: 500 }
    );
  }
}