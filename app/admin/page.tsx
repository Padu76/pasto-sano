'use client';

import { useEffect, useState, useRef } from 'react';
import { 
  getOrders, 
  listenToOrders, 
  getDashboardStats, 
  getTopProducts,
  getUniqueCustomers,
  type Order,
  type ProductSales,
  type Customer
} from '@/lib/firebase';
import { 
  ShoppingCart, 
  Truck,
  TrendingUp,
  Wallet,
  Volume2,
  VolumeX,
  X
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

import StatsCards from './components/StatsCards';
import OrdersTab from './components/OrdersTab';
import RiderTab from './components/RiderTab';
import AnalyticsTab from './components/AnalyticsTab';
import PaymentsTab from './components/PaymentsTab';
import CustomersModal from './components/modals/CustomersModal';
import RiderModal from './components/modals/RiderModal';
import PaymentModal from './components/modals/PaymentModal';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface Rider {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive';
  createdAt: Date;
  stats?: {
    totalDeliveries: number;
    totalEarnings: number;
    averageDistance: number;
  };
}

interface RiderPayment {
  riderId: string;
  riderName: string;
  period: {
    start: Date;
    end: Date;
    label: string;
  };
  totalDeliveries: number;
  totalEarnings: number;
  totalDistance: number;
  orders: string[];
  status: 'pending' | 'paid';
}

type TabType = 'ordini' | 'rider' | 'analytics' | 'pagamenti';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('ordini');
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [topProducts, setTopProducts] = useState<ProductSales[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [currentFilter, setCurrentFilter] = useState<'oggi' | 'settimana' | 'mese' | 'tutti'>('oggi');
  const [deliveryFilter, setDeliveryFilter] = useState<'all' | 'delivery' | 'pickup'>('all');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showCustomersModal, setShowCustomersModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [riders, setRiders] = useState<Rider[]>([]);
  const [showRiderModal, setShowRiderModal] = useState(false);
  const [editingRider, setEditingRider] = useState<Rider | null>(null);
  const [riderFormData, setRiderFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });

  const [payments, setPayments] = useState<RiderPayment[]>([]);
  const [paymentPeriodType, setPaymentPeriodType] = useState<'week' | 'month' | 'custom'>('month');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<RiderPayment | null>(null);
  const [paymentNotes, setPaymentNotes] = useState('');
  
  const [analyticsFilter, setAnalyticsFilter] = useState<'oggi' | 'settimana' | 'mese' | 'tutti'>('mese');
  const [analyticsOrders, setAnalyticsOrders] = useState<Order[]>([]);
  
  const lastNotificationTime = useRef<number>(Date.now());
  const unsubscribe = useRef<any>(null);

  const [filteredStats, setFilteredStats] = useState({
    ordersCount: 0,
    revenue: 0,
    averageOrder: 0,
    uniqueCustomers: 0
  });

  useEffect(() => {
    loadDashboardData();
    
    unsubscribe.current = listenToOrders((newOrders) => {
      const hasNewOrders = newOrders.some(order => {
        const orderTime = order.timestamp instanceof Date 
          ? order.timestamp.getTime() 
          : order.timestamp.toDate().getTime();
        return orderTime > lastNotificationTime.current && (Date.now() - orderTime) < 30000;
      });

      if (hasNewOrders) {
        showNotification('Nuovo ordine ricevuto!');
        if (soundEnabled) playNotificationSound();
        lastNotificationTime.current = Date.now();
      }

      setOrders(newOrders);
      filterOrdersByDate(newOrders, currentFilter);
    });

    return () => {
      if (unsubscribe.current) {
        unsubscribe.current();
      }
    };
  }, []);

  useEffect(() => {
    calculateFilteredStats();
    updateTopProductsFromFiltered();
  }, [filteredOrders]);

  useEffect(() => {
    applyDeliveryFilter();
  }, [deliveryFilter, orders, currentFilter]);

  useEffect(() => {
    if (activeTab === 'pagamenti') {
      loadPayments();
    }
  }, [activeTab, paymentPeriodType, customStartDate, customEndDate]);

  useEffect(() => {
    if (activeTab === 'analytics') {
      filterAnalyticsOrders();
    }
  }, [activeTab, analyticsFilter, orders]);

  const filterAnalyticsOrders = () => {
    const now = new Date();
    now.setHours(23, 59, 59, 999);
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    let filtered: Order[] = [];

    switch (analyticsFilter) {
      case 'oggi':
        filtered = orders.filter(order => {
          const orderDate = order.timestamp instanceof Date 
            ? order.timestamp 
            : order.timestamp.toDate();
          return orderDate >= todayStart && orderDate <= now;
        });
        break;
      case 'settimana':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filtered = orders.filter(order => {
          const orderDate = order.timestamp instanceof Date 
            ? order.timestamp 
            : order.timestamp.toDate();
          return orderDate >= weekAgo;
        });
        break;
      case 'mese':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        filtered = orders.filter(order => {
          const orderDate = order.timestamp instanceof Date 
            ? order.timestamp 
            : order.timestamp.toDate();
          return orderDate >= monthAgo;
        });
        break;
      default:
        const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        filtered = orders.filter(order => {
          const orderDate = order.timestamp instanceof Date 
            ? order.timestamp 
            : order.timestamp.toDate();
          return orderDate >= threeMonthsAgo;
        });
    }

    setAnalyticsOrders(filtered);
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [ordersData, , productsData, customersData] = await Promise.all([
        getOrders(500),
        getDashboardStats(),
        getTopProducts(10, 30),
        getUniqueCustomers(365)
      ]);

      setOrders(ordersData);
      setTopProducts(productsData);
      setCustomers(customersData);
      
      filterOrdersByDate(ordersData, currentFilter);
      
      await loadRiders();
      
    } catch (err) {
      console.error('Errore caricamento dati:', err);
      setError('Errore nel caricamento dei dati. Riprova più tardi.');
    } finally {
      setLoading(false);
    }
  };

  const loadRiders = async () => {
    try {
      const response = await fetch('/api/admin-riders');
      const data = await response.json();
      
      if (data.success) {
        const ridersWithStats = await Promise.all(
          data.riders.map(async (rider: any) => {
            const stats = await getRiderStats(rider.id);
            return { ...rider, stats };
          })
        );
        setRiders(ridersWithStats);
      }
    } catch (error) {
      console.error('Errore caricamento rider:', error);
    }
  };

  const loadPayments = async () => {
    try {
      let url = `/api/admin-rider-payments?periodType=${paymentPeriodType}`;
      
      if (paymentPeriodType === 'custom' && customStartDate && customEndDate) {
        url += `&startDate=${customStartDate}&endDate=${customEndDate}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setPayments(data.payments);
      }
    } catch (error) {
      console.error('Errore caricamento pagamenti:', error);
    }
  };

  const getRiderStats = async (riderId: string) => {
    const riderOrders = orders.filter(
      o => o.riderId === riderId && o.deliveryStatus === 'delivered'
    );
    
    const totalEarnings = riderOrders.reduce((sum, o) => {
      return sum + (parseFloat(o.deliveryRiderShare as any) || 0);
    }, 0);
    
    const totalDistance = riderOrders.reduce((sum, o) => {
      return sum + (parseFloat(o.deliveryDistance as any) || 0);
    }, 0);
    
    return {
      totalDeliveries: riderOrders.length,
      totalEarnings,
      averageDistance: riderOrders.length > 0 ? totalDistance / riderOrders.length : 0
    };
  };

  const handleMarkAsPaid = async () => {
    if (!selectedPayment) return;

    try {
      const response = await fetch('/api/admin-rider-payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...selectedPayment,
          notes: paymentNotes
        })
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Pagamento registrato con successo');
        setShowPaymentModal(false);
        setSelectedPayment(null);
        setPaymentNotes('');
        await loadPayments();
      }
    } catch (error) {
      alert('Errore registrazione pagamento');
    }
  };

  const exportPaymentsCSV = () => {
    if (payments.length === 0) {
      alert('Nessun pagamento da esportare');
      return;
    }

    const headers = ['Rider', 'Consegne', 'Totale €', 'Distanza km', 'Status', 'Periodo'];
    const rows = payments.map(p => [
      p.riderName,
      p.totalDeliveries,
      p.totalEarnings.toFixed(2),
      p.totalDistance.toFixed(1),
      p.status === 'paid' ? 'Pagato' : 'Da Pagare',
      p.period.label
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pagamenti_rider_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const applyDeliveryFilter = () => {
    let filtered = [...orders];
    
    if (deliveryFilter === 'delivery') {
      filtered = filtered.filter(o => o.deliveryEnabled === 'true' || o.deliveryEnabled === true);
    } else if (deliveryFilter === 'pickup') {
      filtered = filtered.filter(o => o.deliveryEnabled !== 'true' && o.deliveryEnabled !== true);
    }
    
    filterOrdersByDate(filtered, currentFilter);
  };

  const calculateFilteredStats = () => {
    const revenue = filteredOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const uniqueCustomersSet = new Set(
      filteredOrders.map(order => `${order.customerName}_${order.customerPhone}`)
    );
    
    setFilteredStats({
      ordersCount: filteredOrders.length,
      revenue: revenue,
      averageOrder: filteredOrders.length > 0 ? revenue / filteredOrders.length : 0,
      uniqueCustomers: uniqueCustomersSet.size
    });
  };

  const updateTopProductsFromFiltered = () => {
    const productCounts: Record<string, number> = {};
    
    filteredOrders.forEach(order => {
      if (order.items) {
        order.items.forEach(item => {
          const key = item.name;
          productCounts[key] = (productCounts[key] || 0) + item.quantity;
        });
      }
    });

    const sorted = Object.entries(productCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([name, sales]) => ({ name, sales, revenue: 0 }));
    
    setTopProducts(sorted);
  };

  const filterOrdersByDate = (ordersToFilter: Order[], filter: typeof currentFilter) => {
    const now = new Date();
    now.setHours(23, 59, 59, 999);
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    let filtered: Order[] = [];

    switch (filter) {
      case 'oggi':
        filtered = ordersToFilter.filter(order => {
          const orderDate = order.timestamp instanceof Date 
            ? order.timestamp 
            : order.timestamp.toDate();
          return orderDate >= todayStart && orderDate <= now;
        });
        break;
      case 'settimana':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filtered = ordersToFilter.filter(order => {
          const orderDate = order.timestamp instanceof Date 
            ? order.timestamp 
            : order.timestamp.toDate();
          return orderDate >= weekAgo;
        });
        break;
      case 'mese':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        filtered = ordersToFilter.filter(order => {
          const orderDate = order.timestamp instanceof Date 
            ? order.timestamp 
            : order.timestamp.toDate();
          return orderDate >= monthAgo;
        });
        break;
      default:
        filtered = ordersToFilter;
    }

    setFilteredOrders(filtered);
    setCurrentFilter(filter);
  };

  const handleSaveRider = async () => {
    try {
      const url = editingRider ? '/api/admin-update-rider' : '/api/admin-create-rider';
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingRider ? { ...riderFormData, id: editingRider.id } : riderFormData)
      });
      
      const data = await response.json();
      if (data.success) {
        setShowRiderModal(false);
        setEditingRider(null);
        setRiderFormData({ name: '', email: '', phone: '', password: '' });
        await loadRiders();
      }
    } catch (error) {
      alert('Errore salvataggio rider');
    }
  };

  const handleToggleRiderStatus = async (riderId: string, currentStatus: string) => {
    try {
      const response = await fetch('/api/admin-toggle-rider-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ riderId, status: currentStatus === 'active' ? 'inactive' : 'active' })
      });
      
      const data = await response.json();
      if (data.success) {
        await loadRiders();
      }
    } catch (error) {
      alert('Errore cambio stato rider');
    }
  };

  const toggleOrderSelection = (orderId: string) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const selectAllOrders = () => {
    setSelectedOrders(filteredOrders.map(order => order.id!));
  };

  const clearSelection = () => {
    setSelectedOrders([]);
  };

  const exportToCSV = () => {
    const ordersToExport = selectedOrders.length > 0 
      ? orders.filter(order => selectedOrders.includes(order.id!))
      : filteredOrders;

    if (ordersToExport.length === 0) {
      alert('Nessun ordine da esportare');
      return;
    }

    const headers = ['ID', 'Cliente', 'Telefono', 'Data Ordine', 'Data Ritiro', 'Totale', 'Pagamento', 'Stato', 'Tipo', 'Articoli'];
    const rows = ordersToExport.map(order => [
      order.id?.substring(0, 8),
      order.customerName,
      order.customerPhone,
      formatDate(order.timestamp),
      order.pickupDate || 'N/D',
      order.totalAmount.toFixed(2),
      getPaymentMethodLabel(order.paymentMethod),
      order.paymentStatus === 'paid' ? 'Pagato' : 'Da pagare',
      order.deliveryEnabled ? 'Delivery' : 'Ritiro',
      order.items.map(item => `${item.name} x${item.quantity}`).join('; ')
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ordini_pasto_sano_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const generateProductionDoc = () => {
    const ordersToProcess = selectedOrders.length > 0 
      ? orders.filter(order => selectedOrders.includes(order.id!))
      : filteredOrders;

    if (ordersToProcess.length === 0) {
      alert('Nessun ordine selezionato');
      return;
    }

    const productionSummary: Record<string, number> = {};
    let totalPieces = 0;
    const ordersByCustomer: Record<string, any[]> = {};

    ordersToProcess.forEach(order => {
      const customerKey = order.customerName || 'Cliente Sconosciuto';
      
      if (!ordersByCustomer[customerKey]) {
        ordersByCustomer[customerKey] = [];
      }

      order.items?.forEach(item => {
        if (item.comboItems) {
          const comboDetails: string[] = [];
          
          if (item.comboItems.primo) {
            comboDetails.push(`Primo: ${item.comboItems.primo}`);
            const primoKey = `PRIMO - ${item.comboItems.primo.toUpperCase()}`;
            productionSummary[primoKey] = (productionSummary[primoKey] || 0) + item.quantity;
          }
          
          if (item.comboItems.secondo) {
            comboDetails.push(`Secondo: ${item.comboItems.secondo}`);
            const secondoKey = `SECONDO - ${item.comboItems.secondo.toUpperCase()}`;
            productionSummary[secondoKey] = (productionSummary[secondoKey] || 0) + item.quantity;
          }
          
          if (item.comboItems.contorno) {
            comboDetails.push(`Contorno: ${item.comboItems.contorno}`);
            const contornoKey = `CONTORNO - ${item.comboItems.contorno.toUpperCase()}`;
            productionSummary[contornoKey] = (productionSummary[contornoKey] || 0) + item.quantity;
          }
          
          if (item.comboItems.macedonia) {
            comboDetails.push('Macedonia');
            const macedoniaKey = 'FRUTTA - MACEDONIA';
            productionSummary[macedoniaKey] = (productionSummary[macedoniaKey] || 0) + item.quantity;
          }

          const comboFullName = `${item.name} (${comboDetails.join(', ')})`;
          ordersByCustomer[customerKey].push({ 
            name: comboFullName, 
            quantity: item.quantity 
          });
          
        } else {
          const productName = item.name.toUpperCase();
          productionSummary[productName] = (productionSummary[productName] || 0) + item.quantity;
          ordersByCustomer[customerKey].push({ 
            name: productName, 
            quantity: item.quantity 
          });
        }
        
        totalPieces += item.quantity;
      });
    });

    const sortedProducts = Object.entries(productionSummary).sort(([,a], [,b]) => b - a);

    let doc = `DOCUMENTO PRODUZIONE - PASTO SANO\n`;
    doc += `Data: ${new Date().toLocaleDateString('it-IT')}\n`;
    doc += `Ordini: ${ordersToProcess.length}\n`;
    doc += `Pezzi totali: ${totalPieces}\n\n`;
    doc += `RIEPILOGO PRODUZIONE:\n${'='.repeat(40)}\n`;
    
    sortedProducts.forEach(([product, quantity]) => {
      doc += `• ${product}: ${quantity} porzioni\n`;
    });

    doc += `\nORDINI PER CLIENTE:\n${'='.repeat(40)}\n\n`;

    Object.entries(ordersByCustomer).forEach(([customer, items]) => {
      doc += `${customer}\n`;
      const customerProducts: Record<string, number> = {};
      items.forEach(item => {
        customerProducts[item.name] = (customerProducts[item.name] || 0) + item.quantity;
      });
      Object.entries(customerProducts).forEach(([product, quantity]) => {
        doc += `   • ${product} x${quantity}\n`;
      });
      doc += `\n`;
    });

    const blob = new Blob([doc], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `produzione_fornitore_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
  };

  const formatDate = (date: any) => {
    if (!date) return 'N/D';
    const d = date instanceof Date ? date : date.toDate();
    return d.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPaymentMethodLabel = (method: string) => {
    switch(method?.toLowerCase()) {
      case 'cash': return 'Contanti';
      case 'stripe': return 'Carta';
      case 'paypal': return 'PayPal';
      default: return method || 'N/D';
    }
  };

  const showNotification = (message: string) => {
    console.log('Notifica:', message);
  };

  const playNotificationSound = () => {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBi+Ey/DZhjQFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBi+Ey/DZhjQIHW259NSTQQ0UXrTp66hVFApGn+DyvmwhBi+Ey/DZhjQIHW259NSTQQ0UXrTp66hVFApGn+DyvmwhBi+Ey/DZhjQIHW259NSTQQ0UXrTp66hVFApGn+DyvmwhBi+Ey/DZhjQIHW259NSTQQ0UXrTp66hVFApGn+DyvmwhBi+Ey/DZhjQIHW259NSTQQ0UXrTp66hVFApGn+DyvmwhBi+Ey/DZhjQIHW259NSTQQ0UXrTp66hVFApGn+DyvmwhBi+Ey/DZhjQIHW259NSTQQ0UXrTp66hVFApGn+DyvmwhBi+Ey/DZhjQIHW259NSTQQ0UXrTp66hVFApGn+DyvmwhBi+Ey/DZhjQIHW259NST');
    audio.play().catch(e => console.log('Audio play failed:', e));
  };

  const openWhatsApp = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/39${cleanPhone}`;
    window.open(whatsappUrl, '_blank');
  };

  const getAnalyticsChartData = () => {
    const labels: string[] = [];
    const data: number[] = [];

    if (analyticsFilter === 'oggi') {
      for (let hour = 8; hour < 22; hour += 2) {
        labels.push(`${hour}:00`);
        const ordersInRange = analyticsOrders.filter(order => {
          const orderDate = order.timestamp instanceof Date ? order.timestamp : order.timestamp.toDate();
          const orderHour = orderDate.getHours();
          return orderHour >= hour && orderHour < hour + 2;
        });
        const revenue = ordersInRange.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
        data.push(revenue);
      }
    } else if (analyticsFilter === 'settimana') {
      const now = new Date();
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        const nextDate = new Date(date);
        nextDate.setDate(date.getDate() + 1);
        
        const ordersInDay = analyticsOrders.filter(order => {
          const orderDate = order.timestamp instanceof Date ? order.timestamp : order.timestamp.toDate();
          return orderDate >= date && orderDate < nextDate;
        });
        const revenue = ordersInDay.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
        
        labels.push(date.toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric' }));
        data.push(revenue);
      }
    } else if (analyticsFilter === 'mese') {
      const now = new Date();
      for (let i = 29; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        const nextDate = new Date(date);
        nextDate.setDate(date.getDate() + 1);
        
        const ordersInDay = analyticsOrders.filter(order => {
          const orderDate = order.timestamp instanceof Date ? order.timestamp : order.timestamp.toDate();
          return orderDate >= date && orderDate < nextDate;
        });
        const revenue = ordersInDay.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
        
        if (i % 3 === 0 || i === 29) {
          labels.push(date.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' }));
          data.push(revenue);
        }
      }
    } else {
      const now = new Date();
      for (let i = 89; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        const nextDate = new Date(date);
        nextDate.setDate(date.getDate() + 1);
        
        const ordersInDay = analyticsOrders.filter(order => {
          const orderDate = order.timestamp instanceof Date ? order.timestamp : order.timestamp.toDate();
          return orderDate >= date && orderDate < nextDate;
        });
        const revenue = ordersInDay.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
        
        if (i % 7 === 0 || i === 89) {
          labels.push(date.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' }));
          data.push(revenue);
        }
      }
    }

    return {
      labels,
      datasets: [{
        label: `Fatturato (${analyticsFilter})`,
        data,
        borderColor: '#7a9e7e',
        backgroundColor: 'rgba(122, 158, 126, 0.1)',
        tension: 0.4,
        fill: true
      }]
    };
  };

  const getChartData = () => {
    const labels: string[] = [];
    const data: number[] = [];

    if (currentFilter === 'oggi') {
      for (let hour = 8; hour < 22; hour += 2) {
        labels.push(`${hour}:00-${hour+2}:00`);
        const ordersInRange = filteredOrders.filter(order => {
          const orderDate = order.timestamp instanceof Date ? order.timestamp : order.timestamp.toDate();
          const orderHour = orderDate.getHours();
          return orderHour >= hour && orderHour < hour + 2;
        });
        const revenue = ordersInRange.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
        data.push(revenue);
      }
    } else {
      const days = currentFilter === 'settimana' ? 7 : currentFilter === 'mese' ? 30 : 90;
      const now = new Date();
      
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        const nextDate = new Date(date);
        nextDate.setDate(date.getDate() + 1);
        const ordersInDay = filteredOrders.filter(order => {
          const orderDate = order.timestamp instanceof Date ? order.timestamp : order.timestamp.toDate();
          return orderDate >= date && orderDate < nextDate;
        });
        const revenue = ordersInDay.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
        
        if (days <= 7 || (days <= 30 && i % 5 === 0) || (days > 30 && i % 15 === 0)) {
          labels.push(date.toLocaleDateString('it-IT', days <= 7 ? { weekday: 'short', day: 'numeric' } : { day: 'numeric', month: 'short' }));
          data.push(revenue);
        } else if (days <= 30) {
          data.push(revenue);
        }
      }
    }

    return {
      labels,
      datasets: [{
        label: `Fatturato (${currentFilter})`,
        data,
        borderColor: '#7a9e7e',
        backgroundColor: 'rgba(122, 158, 126, 0.1)',
        tension: 0.4,
        fill: true
      }]
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: `Fatturato per ${currentFilter === 'oggi' ? 'Fasce Orarie' : 'Giorni'} (${currentFilter.charAt(0).toUpperCase() + currentFilter.slice(1)})`,
        font: { size: 14 }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return '€' + value.toFixed(0);
          }
        }
      }
    }
  };

  const analyticsChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: `Fatturato ${analyticsFilter.charAt(0).toUpperCase() + analyticsFilter.slice(1)}`,
        font: { size: 16, weight: 'bold' as const }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return '€' + value.toFixed(0);
          }
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Caricamento dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <X className="w-12 h-12 text-red-500 mx-auto" />
          <p className="mt-4 text-red-600">{error}</p>
          <button 
            onClick={loadDashboardData}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Riprova
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-green-700 to-green-500 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold">Dashboard Pasto Sano</h1>
              <p className="mt-1 opacity-90">Analytics e gestione ordini in tempo reale</p>
            </div>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition"
            >
              {soundEnabled ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
            </button>
          </div>
          
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setActiveTab('ordini')}
              className={`px-6 py-3 rounded-lg transition font-medium ${
                activeTab === 'ordini' 
                  ? 'bg-white text-green-700' 
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              <ShoppingCart className="w-5 h-5 inline mr-2" />
              Ordini
            </button>
            <button
              onClick={() => setActiveTab('rider')}
              className={`px-6 py-3 rounded-lg transition font-medium ${
                activeTab === 'rider' 
                  ? 'bg-white text-green-700' 
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              <Truck className="w-5 h-5 inline mr-2" />
              Rider
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-6 py-3 rounded-lg transition font-medium ${
                activeTab === 'analytics' 
                  ? 'bg-white text-green-700' 
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              <TrendingUp className="w-5 h-5 inline mr-2" />
              Analytics
            </button>
            <button
              onClick={() => setActiveTab('pagamenti')}
              className={`px-6 py-3 rounded-lg transition font-medium ${
                activeTab === 'pagamenti' 
                  ? 'bg-white text-green-700' 
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              <Wallet className="w-5 h-5 inline mr-2" />
              Pagamenti
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <StatsCards 
          stats={filteredStats}
          currentFilter={currentFilter}
          onCustomersClick={() => setShowCustomersModal(true)}
        />

        {activeTab === 'ordini' && (
          <OrdersTab
            filteredOrders={filteredOrders}
            selectedOrders={selectedOrders}
            currentFilter={currentFilter}
            deliveryFilter={deliveryFilter}
            topProducts={topProducts}
            onFilterChange={(filter) => filterOrdersByDate(orders, filter)}
            onDeliveryFilterChange={setDeliveryFilter}
            onToggleOrderSelection={toggleOrderSelection}
            onSelectAll={selectAllOrders}
            onClearSelection={clearSelection}
            onExportCSV={exportToCSV}
            onGenerateProduction={generateProductionDoc}
            onWhatsAppClick={openWhatsApp}
            formatDate={formatDate}
            getPaymentMethodLabel={getPaymentMethodLabel}
            chartData={getChartData()}
            chartOptions={chartOptions}
          />
        )}

        {activeTab === 'rider' && (
          <RiderTab
            riders={riders}
            onAddRider={() => {
              setEditingRider(null);
              setRiderFormData({ name: '', email: '', phone: '', password: '' });
              setShowRiderModal(true);
            }}
            onEditRider={(rider) => {
              setEditingRider(rider);
              setRiderFormData({
                name: rider.name,
                email: rider.email,
                phone: rider.phone,
                password: ''
              });
              setShowRiderModal(true);
            }}
            onToggleStatus={handleToggleRiderStatus}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsTab
            analyticsOrders={analyticsOrders}
            analyticsFilter={analyticsFilter}
            onFilterChange={setAnalyticsFilter}
            chartData={getAnalyticsChartData()}
            chartOptions={analyticsChartOptions}
          />
        )}

        {activeTab === 'pagamenti' && (
          <PaymentsTab
            payments={payments}
            paymentPeriodType={paymentPeriodType}
            customStartDate={customStartDate}
            customEndDate={customEndDate}
            onPeriodTypeChange={setPaymentPeriodType}
            onCustomStartDateChange={setCustomStartDate}
            onCustomEndDateChange={setCustomEndDate}
            onApplyCustomPeriod={loadPayments}
            onMarkAsPaid={(payment) => {
              setSelectedPayment(payment);
              setShowPaymentModal(true);
            }}
            onExportCSV={exportPaymentsCSV}
          />
        )}
      </div>

      <CustomersModal
        isOpen={showCustomersModal}
        onClose={() => setShowCustomersModal(false)}
        customers={customers}
        onWhatsAppClick={openWhatsApp}
        formatDate={formatDate}
      />

      <RiderModal
        isOpen={showRiderModal}
        onClose={() => setShowRiderModal(false)}
        editingRider={editingRider}
        formData={riderFormData}
        onFormChange={setRiderFormData}
        onSave={handleSaveRider}
      />

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          setPaymentNotes('');
        }}
        payment={selectedPayment}
        notes={paymentNotes}
        onNotesChange={setPaymentNotes}
        onConfirm={handleMarkAsPaid}
      />
    </div>
  );
}