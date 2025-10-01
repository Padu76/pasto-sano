// 🔥 FIREBASE ADMIN SDK - SOLO PER SERVER-SIDE (WEBHOOK)
// File separato per evitare conflitti con il client SDK

import { initializeApp as initializeAdminApp, cert, getApps as getAdminApps } from 'firebase-admin/app';
import { getFirestore as getAdminFirestore } from 'firebase-admin/firestore';

// Tipi per l'ordine (duplicati per indipendenza)
interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  items: OrderItem[];
  totalAmount: number;
  paymentMethod: string;
  paymentMethodName?: string;
  paymentStatus?: string;
  orderStatus?: string;
  pickupDate?: string;
  discountCode?: string;
  discountPercent?: number;
  discountAmount?: number;
  notes?: string;
  source?: string;
  timestamp: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

let adminDb: any;
let isInitialized = false;

// Inizializza Firebase Admin una sola volta
function initializeFirebaseAdmin() {
  try {
    if (isInitialized && adminDb) {
      console.log('✅ Firebase Admin già inizializzato');
      return adminDb;
    }
    
    console.log('🔥 === INIZIALIZZAZIONE FIREBASE ADMIN SDK ===');
    
    // Verifica variabili Admin
    console.log('🔍 Verifica variabili Admin:', {
      projectId: !!process.env.FIREBASE_PROJECT_ID,
      clientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: !!process.env.FIREBASE_PRIVATE_KEY
    });
    
    if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
      throw new Error('❌ Variabili Firebase Admin mancanti');
    }
    
    if (getAdminApps().length === 0) {
      console.log('🚀 Inizializzazione nuova app Admin...');
      
      const adminApp = initializeAdminApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
        })
      });
      
      adminDb = getAdminFirestore(adminApp);
      console.log('✅ Firebase Admin SDK inizializzato con progetto:', process.env.FIREBASE_PROJECT_ID);
    } else {
      console.log('✅ Firebase Admin già inizializzato');
      const adminApp = getAdminApps()[0];
      adminDb = getAdminFirestore(adminApp);
    }
    
    isInitialized = true;
    return adminDb;
    
  } catch (error: any) {
    console.error('❌ === ERRORE FIREBASE ADMIN INIT ===');
    console.error('Errore:', error.message);
    console.error('Stack:', error.stack);
    throw error;
  }
}

// Funzione per salvare ordine con Admin SDK
export async function addOrderAdmin(order: Omit<Order, 'id'>): Promise<string> {
  try {
    console.log('🔥 === INIZIO SALVATAGGIO CON ADMIN SDK ===');
    
    const db = initializeFirebaseAdmin();
    
    console.log('📝 Preparazione dati ordine Admin:', {
      customerName: order.customerName,
      totalAmount: order.totalAmount,
      paymentMethod: order.paymentMethod,
      itemsCount: order.items?.length || 0
    });
    
    const orderData = {
      ...order,
      timestamp: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    console.log('🚀 Invio a Firebase Admin...');
    const docRef = await db.collection('orders').add(orderData);
    
    console.log('🎉 === ORDINE SALVATO CON ADMIN SDK! ===');
    console.log('📄 Document ID:', docRef.id);
    
    return docRef.id;
    
  } catch (error: any) {
    console.error('❌ === ERRORE ADMIN SDK SALVATAGGIO ===');
    console.error('Tipo errore:', typeof error);
    console.error('Nome:', error.name);
    console.error('Messaggio:', error.message);
    console.error('Code:', error.code);
    console.error('Stack:', error.stack);
    
    // Log dettagliato dell'errore
    if (error.code === 'auth/invalid-credential') {
      console.error('🔑 ERRORE CREDENZIALI - Verifica:');
      console.error('- FIREBASE_PROJECT_ID:', !!process.env.FIREBASE_PROJECT_ID);
      console.error('- FIREBASE_CLIENT_EMAIL:', !!process.env.FIREBASE_CLIENT_EMAIL);
      console.error('- FIREBASE_PRIVATE_KEY:', !!process.env.FIREBASE_PRIVATE_KEY);
    }
    
    throw new Error(`Firebase Admin save failed: ${error.message}`);
  }
}

// Test di connessione Admin
export async function testAdminConnection(): Promise<boolean> {
  try {
    console.log('🔍 Test connessione Firebase Admin...');
    
    const db = initializeFirebaseAdmin();
    
    // Prova a leggere la collezione orders
    const ordersRef = db.collection('orders');
    const snapshot = await ordersRef.limit(1).get();
    
    console.log('✅ Connessione Firebase Admin OK!');
    console.log('📊 Ordini trovati:', snapshot.size);
    
    return true;
    
  } catch (error: any) {
    console.error('❌ Test connessione Firebase Admin fallito:', error.message);
    return false;
  }
}

export default {
  addOrderAdmin,
  testAdminConnection
};