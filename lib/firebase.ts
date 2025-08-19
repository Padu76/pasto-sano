import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc,
  doc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  Timestamp,
  Unsubscribe
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// ⚠️ NON METTERE MAI LE CHIAVI DIRETTAMENTE NEL CODICE!
// USA SEMPRE VARIABILI D'AMBIENTE

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!
};

// Verifica che tutte le variabili siano presenti
if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId) {
  console.error('❌ Configurazione Firebase mancante! Controlla le variabili d\'ambiente.');
  throw new Error('Firebase configuration is incomplete');
}

// Inizializza Firebase
let app: FirebaseApp;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
  console.log('✅ Firebase inizializzato correttamente');
} else {
  app = getApps()[0];
}

// Esporta servizi Firebase
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Tipi TypeScript
export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
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
  timestamp: Timestamp | Date;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface Customer {
  name: string;
  phone: string;
  email?: string;
  totalOrders: number;
  totalSpent: number;
  lastOrder: Date | null;
  paymentMethods: Record<string, number>;
}

export interface ProductSales {
  name: string;
  sales: number;
  revenue?: number;
}

export interface DashboardStats {
  ordersToday: number;
  revenueToday: number;
  totalOrders: number;
  totalRevenue: number;
  averageOrder: number;
  uniqueCustomers: number;
}

// FUNZIONI FIREBASE

// Ottieni tutti gli ordini
export async function getOrders(limitCount: number = 100): Promise<Order[]> {
  try {
    console.log(`📊 Caricamento ultimi ${limitCount} ordini...`);
    
    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, orderBy('timestamp', 'desc'), limit(limitCount));
    
    const snapshot = await getDocs(q);
    const orders: Order[] = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      orders.push({
        id: doc.id,
        ...data,
        timestamp: data.timestamp?.toDate?.() || new Date()
      } as Order);
    });
    
    console.log(`✅ ${orders.length} ordini caricati da Firebase`);
    return orders;
    
  } catch (error) {
    console.error('❌ Errore caricamento ordini:', error);
    throw error;
  }
}

// Ottieni ordini per data
export async function getOrdersByDate(date: Date): Promise<Order[]> {
  try {
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);
    
    const ordersRef = collection(db, 'orders');
    const q = query(
      ordersRef,
      where('timestamp', '>=', Timestamp.fromDate(startDate)),
      where('timestamp', '<=', Timestamp.fromDate(endDate)),
      orderBy('timestamp', 'desc')
    );
    
    const snapshot = await getDocs(q);
    const orders: Order[] = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      orders.push({
        id: doc.id,
        ...data,
        timestamp: data.timestamp?.toDate?.() || new Date()
      } as Order);
    });
    
    console.log(`✅ ${orders.length} ordini trovati per ${date.toLocaleDateString()}`);
    return orders;
    
  } catch (error) {
    console.error('❌ Errore caricamento ordini per data:', error);
    throw error;
  }
}

// Ottieni ordini per range di date
export async function getOrdersByDateRange(startDate: Date, endDate: Date): Promise<Order[]> {
  try {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    
    const ordersRef = collection(db, 'orders');
    const q = query(
      ordersRef,
      where('timestamp', '>=', Timestamp.fromDate(start)),
      where('timestamp', '<=', Timestamp.fromDate(end)),
      orderBy('timestamp', 'desc')
    );
    
    const snapshot = await getDocs(q);
    const orders: Order[] = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      orders.push({
        id: doc.id,
        ...data,
        timestamp: data.timestamp?.toDate?.() || new Date()
      } as Order);
    });
    
    console.log(`✅ ${orders.length} ordini trovati dal ${startDate.toLocaleDateString()} al ${endDate.toLocaleDateString()}`);
    return orders;
    
  } catch (error) {
    console.error('❌ Errore caricamento ordini per range:', error);
    throw error;
  }
}

// Aggiungi nuovo ordine
export async function addOrder(order: Omit<Order, 'id'>): Promise<string> {
  try {
    const orderData = {
      ...order,
      timestamp: Timestamp.now(),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    
    const docRef = await addDoc(collection(db, 'orders'), orderData);
    console.log('✅ Ordine aggiunto con ID:', docRef.id);
    return docRef.id;
    
  } catch (error) {
    console.error('❌ Errore aggiunta ordine:', error);
    throw error;
  }
}

// Aggiorna stato ordine
export async function updateOrderStatus(orderId: string, status: string): Promise<void> {
  try {
    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, {
      orderStatus: status,
      updatedAt: Timestamp.now()
    });
    
    console.log(`✅ Stato ordine ${orderId} aggiornato a: ${status}`);
    
  } catch (error) {
    console.error('❌ Errore aggiornamento stato ordine:', error);
    throw error;
  }
}

// Ottieni statistiche dashboard
export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    console.log('📈 Caricamento statistiche...');
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Ordini di oggi
    const todayOrders = await getOrdersByDate(today);
    const todayRevenue = todayOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    
    // Ordini ultimi 30 giorni
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const allOrders = await getOrdersByDateRange(thirtyDaysAgo, new Date());
    const totalRevenue = allOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    
    // Clienti unici
    const uniqueCustomers = new Set(
      allOrders.map(order => `${order.customerName}_${order.customerPhone}`)
    ).size;
    
    const stats: DashboardStats = {
      ordersToday: todayOrders.length,
      revenueToday: todayRevenue,
      totalOrders: allOrders.length,
      totalRevenue: totalRevenue,
      averageOrder: allOrders.length > 0 ? totalRevenue / allOrders.length : 0,
      uniqueCustomers: uniqueCustomers
    };
    
    console.log('✅ Statistiche caricate:', stats);
    return stats;
    
  } catch (error) {
    console.error('❌ Errore caricamento statistiche:', error);
    throw error;
  }
}

// Ottieni prodotti più venduti
export async function getTopProducts(limitCount: number = 10, days: number = 30): Promise<ProductSales[]> {
  try {
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - days);
    
    const orders = await getOrdersByDateRange(daysAgo, new Date());
    const productSales: Record<string, number> = {};
    const productRevenue: Record<string, number> = {};
    
    orders.forEach(order => {
      if (order.items) {
        order.items.forEach(item => {
          const productName = item.name || 'Prodotto sconosciuto';
          const quantity = item.quantity || 1;
          const revenue = (item.price || 0) * quantity;
          
          productSales[productName] = (productSales[productName] || 0) + quantity;
          productRevenue[productName] = (productRevenue[productName] || 0) + revenue;
        });
      }
    });
    
    const sortedProducts = Object.entries(productSales)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limitCount)
      .map(([name, sales]) => ({
        name,
        sales,
        revenue: productRevenue[name]
      }));
    
    console.log(`✅ Top ${limitCount} prodotti degli ultimi ${days} giorni:`, sortedProducts);
    return sortedProducts;
    
  } catch (error) {
    console.error('❌ Errore caricamento top products:', error);
    throw error;
  }
}

// Ottieni clienti unici
export async function getUniqueCustomers(days: number = 365): Promise<Customer[]> {
  try {
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - days);
    
    const orders = await getOrdersByDateRange(daysAgo, new Date());
    const customerMap: Record<string, Customer> = {};
    
    orders.forEach(order => {
      const name = order.customerName || 'Cliente Sconosciuto';
      const phone = order.customerPhone || 'Non fornito';
      const email = order.customerEmail || undefined;
      const key = `${name}_${phone}`;
      
      if (!customerMap[key]) {
        customerMap[key] = {
          name,
          phone,
          email,
          totalOrders: 0,
          totalSpent: 0,
          lastOrder: null,
          paymentMethods: {}
        };
      }
      
      customerMap[key].totalOrders++;
      customerMap[key].totalSpent += order.totalAmount || 0;
      
      const orderDate = order.timestamp instanceof Date ? order.timestamp : order.timestamp.toDate();
      if (!customerMap[key].lastOrder || orderDate > customerMap[key].lastOrder!) {
        customerMap[key].lastOrder = orderDate;
      }
      
      const paymentMethod = order.paymentMethodName || order.paymentMethod || 'Non specificato';
      customerMap[key].paymentMethods[paymentMethod] = 
        (customerMap[key].paymentMethods[paymentMethod] || 0) + 1;
    });
    
    const customers = Object.values(customerMap).sort((a, b) => b.totalSpent - a.totalSpent);
    
    console.log(`✅ ${customers.length} clienti unici trovati negli ultimi ${days} giorni`);
    return customers;
    
  } catch (error) {
    console.error('❌ Errore caricamento clienti unici:', error);
    throw error;
  }
}

// Listener per nuovi ordini in tempo reale
export function listenForNewOrders(
  callback: (order: Order) => void
): Unsubscribe {
  try {
    console.log('👂 Avvio listener per nuovi ordini...');
    
    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, orderBy('timestamp', 'desc'), limit(1));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const data = change.doc.data();
          const newOrder: Order = {
            id: change.doc.id,
            ...data,
            timestamp: data.timestamp?.toDate?.() || new Date()
          } as Order;
          
          console.log('🔔 Nuovo ordine rilevato:', newOrder);
          callback(newOrder);
        }
      });
    });
    
    return unsubscribe;
    
  } catch (error) {
    console.error('❌ Errore listener ordini:', error);
    throw error;
  }
}

// Listener per tutti gli ordini con filtri
export function listenToOrders(
  callback: (orders: Order[]) => void,
  limitCount: number = 500
): Unsubscribe {
  const ordersRef = collection(db, 'orders');
  const q = query(ordersRef, orderBy('timestamp', 'desc'), limit(limitCount));
  
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const orders: Order[] = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      orders.push({
        id: doc.id,
        ...data,
        timestamp: data.timestamp?.toDate?.() || new Date()
      } as Order);
    });
    
    callback(orders);
  });
  
  return unsubscribe;
}

// Utility per formattare date
export function formatDate(timestamp: any): string {
  try {
    const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return 'Data non valida';
  }
}

// Esporta tutte le funzioni
export default {
  getOrders,
  getOrdersByDate,
  getOrdersByDateRange,
  addOrder,
  updateOrderStatus,
  getDashboardStats,
  getTopProducts,
  getUniqueCustomers,
  listenForNewOrders,
  listenToOrders,
  formatDate
};