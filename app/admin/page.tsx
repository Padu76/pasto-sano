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
  Euro, 
  Users, 
  TrendingUp, 
  Download,
  FileText,
  X,
  Phone,
  Mail,
  Calendar,
  CreditCard,
  Package,
  Volume2,
  VolumeX,
  Banknote,
  MessageCircle,
  Smartphone
} from 'lucide-react';
import { Line } from 'react-chartjs-2';
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

// Registra componenti Chart.js
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

export default function AdminDashboard() {
  // Stati
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [topProducts, setTopProducts] = useState<ProductSales[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [currentFilter, setCurrentFilter] = useState<'oggi' | 'settimana' | 'mese' | 'tutti'>('oggi');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showCustomersModal, setShowCustomersModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const lastNotificationTime = useRef<number>(Date.now());
  const unsubscribe = useRef<any>(null);

  // Statistiche filtrate
  const [filteredStats, setFilteredStats] = useState({
    ordersCount: 0,
    revenue: 0,
    averageOrder: 0,
    uniqueCustomers: 0
  });

  // Inizializzazione
  useEffect(() => {
    loadDashboardData();
    
    // Setup real-time listener
    unsubscribe.current = listenToOrders((newOrders) => {
      // Controlla nuovi ordini
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

  // Aggiorna statistiche quando cambiano gli ordini filtrati
  useEffect(() => {
    calculateFilteredStats();
    updateTopProductsFromFiltered();
  }, [filteredOrders]);

  // Carica dati dashboard
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [ordersData, ,productsData, customersData] = await Promise.all([
        getOrders(500),
        getDashboardStats(),
        getTopProducts(10, 30),
        getUniqueCustomers(365)
      ]);

      setOrders(ordersData);
      // statsData viene ottenuto ma non utilizzato direttamente, le statistiche vengono calcolate dai filteredOrders
      setTopProducts(productsData);
      setCustomers(customersData);
      
      filterOrdersByDate(ordersData, currentFilter);
      
    } catch (err) {
      console.error('Errore caricamento dati:', err);
      setError('Errore nel caricamento dei dati. Riprova più tardi.');
    } finally {
      setLoading(false);
    }
  };

  // Calcola statistiche per ordini filtrati
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

  // Aggiorna prodotti più venduti basandosi sugli ordini filtrati
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

  // Filtra ordini per data
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

  // Gestione selezione ordini
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

  // Esporta CSV
  const exportToCSV = () => {
    const ordersToExport = selectedOrders.length > 0 
      ? orders.filter(order => selectedOrders.includes(order.id!))
      : filteredOrders;

    if (ordersToExport.length === 0) {
      alert('Nessun ordine da esportare');
      return;
    }

    const headers = ['ID', 'Cliente', 'Telefono', 'Data Ordine', 'Data Ritiro', 'Totale', 'Pagamento', 'Stato', 'Articoli'];
    const rows = ordersToExport.map(order => [
      order.id?.substring(0, 8),
      order.customerName,
      order.customerPhone,
      formatDate(order.timestamp),
      order.pickupDate || 'N/D',
      order.totalAmount.toFixed(2),
      getPaymentMethodLabel(order.paymentMethod),
      order.paymentStatus === 'paid' ? 'Pagato' : 'Da pagare',
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

  // Genera documento produzione MIGLIORATO
  const generateProductionDoc = () => {
    const ordersToProcess = selectedOrders.length > 0 
      ? orders.filter(order => selectedOrders.includes(order.id!))
      : filteredOrders;

    if (ordersToProcess.length === 0) {
      alert('Nessun ordine selezionato');
      return;
    }

    // Raggruppa prodotti con totali
    const productionSummary: Record<string, number> = {};
    let totalPieces = 0;

    // Raggruppa ordini per cliente
    const ordersByCustomer: Record<string, any[]> = {};

    ordersToProcess.forEach(order => {
      const customerKey = order.customerName || 'Cliente Sconosciuto';
      
      if (!ordersByCustomer[customerKey]) {
        ordersByCustomer[customerKey] = [];
      }

      order.items?.forEach(item => {
        // Normalizza il nome del prodotto
        const productName = item.name.toUpperCase();
        
        // Aggiungi al riepilogo produzione
        productionSummary[productName] = (productionSummary[productName] || 0) + item.quantity;
        totalPieces += item.quantity;

        // Aggiungi all'ordine del cliente
        ordersByCustomer[customerKey].push({
          name: productName,
          quantity: item.quantity
        });
      });
    });

    // Ordina prodotti per quantità (decrescente)
    const sortedProducts = Object.entries(productionSummary)
      .sort(([,a], [,b]) => b - a);

    // Genera il documento
    let doc = `🍽️ DOCUMENTO PRODUZIONE - PASTO SANO\n`;
    doc += `📅 Data: ${new Date().toLocaleDateString('it-IT')}\n`;
    doc += `📦 Ordini: ${ordersToProcess.length}\n`;
    doc += `🥘 Pezzi totali: ${totalPieces}\n\n`;
    
    doc += `📋 RIEPILOGO PRODUZIONE:\n`;
    doc += `${'='.repeat(40)}\n`;
    
    sortedProducts.forEach(([product, quantity]) => {
      doc += `• ${product}: ${quantity} porzioni\n`;
    });

    doc += `\n📅 ORDINI:\n`;
    doc += `${'='.repeat(40)}\n\n`;

    // Ordini per cliente
    Object.entries(ordersByCustomer).forEach(([customer, items]) => {
      doc += `👤 ${customer}\n`;
      
      // Raggruppa gli stessi prodotti per cliente
      const customerProducts: Record<string, number> = {};
      items.forEach(item => {
        customerProducts[item.name] = (customerProducts[item.name] || 0) + item.quantity;
      });

      Object.entries(customerProducts).forEach(([product, quantity]) => {
        doc += `   • ${product} x${quantity}\n`;
      });
      doc += `\n`;
    });

    doc += `\n\n`;

    // Scarica il file
    const blob = new Blob([doc], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `produzione_fornitore_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
  };

  // Utility functions
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
      case 'cash':
        return 'Contanti';
      case 'stripe':
        return 'Carta';
      case 'paypal':
        return 'PayPal';
      default:
        return method || 'N/D';
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch(method?.toLowerCase()) {
      case 'cash':
        return <Banknote className="w-4 h-4" />;
      case 'stripe':
        return <CreditCard className="w-4 h-4" />;
      case 'paypal':
        return <Smartphone className="w-4 h-4" />;
      default:
        return <CreditCard className="w-4 h-4" />;
    }
  };

  const getPaymentStatusBadge = (order: Order) => {
    const isPaid = order.paymentStatus === 'paid' || order.paymentMethod !== 'cash';
    
    if (order.paymentMethod === 'cash') {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 flex items-center gap-1">
          <Banknote className="w-3 h-3" />
          CONTANTI ALLA CONSEGNA
        </span>
      );
    }
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
        isPaid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
      }`}>
        {getPaymentMethodIcon(order.paymentMethod)}
        {isPaid ? 'PAGATO ONLINE' : 'DA PAGARE'}
      </span>
    );
  };

  const showNotification = (message: string) => {
    // Implementare toast notification
    console.log('📢 Notifica:', message);
  };

  const playNotificationSound = () => {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBi+Ey/DZhjQFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBi+Ey/DZhjQIHW259NSTQQ0UXrTp66hVFApGn+DyvmwhBi+Ey/DZhjQIHW259NSTQQ0UXrTp66hVFApGn+DyvmwhBi+Ey/DZhjQIHW259NSTQQ0UXrTp66hVFApGn+DyvmwhBi+Ey/DZhjQIHW259NSTQQ0UXrTp66hVFApGn+DyvmwhBi+Ey/DZhjQIHW259NSTQQ0UXrTp66hVFApGn+DyvmwhBi+Ey/DZhjQIHW259NSTQQ0UXrTp66hVFApGn+DyvmwhBi+Ey/DZhjQIHW259NSTQQ0UXrTp66hVFApGn+DyvmwhBi+Ey/DZhjQIHW259NSTQQ0UXrTp66hVFApGn+DyvmwhBi+Ey/DZhjQIHW259NSTQQ0UXrTp66hVFApGn+DyvmwhBi+Ey/DZhjQIHW259NSTQQ0UXrTp66hVFApGn+DyvmwhBi+Ey/DZhjQIHW259NSTQQ0UXrTp66hVFApGn+DyvmwhBi+Ey/DZhjQIHW259NSTQQ0UXrTp66hVFApGn+DyvmwhBi+Ey/DZhjQIHW259NSTQQ0UXrTp66hVFApGn+DyvmwhBi+Ey/DZhjQIHW259NST');
    audio.play().catch(e => console.log('Audio play failed:', e));
  };

  // Apri WhatsApp
  const openWhatsApp = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/39${cleanPhone}`;
    window.open(whatsappUrl, '_blank');
  };

  // Dati per il grafico
  const getChartData = () => {
    const labels: string[] = [];
    const data: number[] = [];

    if (currentFilter === 'oggi') {
      // Grafico per fasce orarie
      for (let hour = 8; hour < 22; hour += 2) {
        labels.push(`${hour}:00-${hour+2}:00`);
        
        const ordersInRange = filteredOrders.filter(order => {
          const orderDate = order.timestamp instanceof Date 
            ? order.timestamp 
            : order.timestamp.toDate();
          const orderHour = orderDate.getHours();
          return orderHour >= hour && orderHour < hour + 2;
        });
        
        const revenue = ordersInRange.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
        data.push(revenue);
      }
    } else {
      // Grafico per giorni
      const days = currentFilter === 'settimana' ? 7 : currentFilter === 'mese' ? 30 : 90;
      const now = new Date();
      
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        
        const nextDate = new Date(date);
        nextDate.setDate(date.getDate() + 1);
        
        const ordersInDay = filteredOrders.filter(order => {
          const orderDate = order.timestamp instanceof Date 
            ? order.timestamp 
            : order.timestamp.toDate();
          return orderDate >= date && orderDate < nextDate;
        });
        
        const revenue = ordersInDay.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
        
        if (days <= 7) {
          labels.push(date.toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric' }));
        } else if (days <= 30) {
          if (i % 5 === 0) {
            labels.push(date.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' }));
            data.push(revenue);
          }
        } else {
          if (i % 15 === 0) {
            labels.push(date.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' }));
            data.push(revenue);
          }
        }
        
        if (days <= 30) {
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
      legend: {
        display: false
      },
      title: {
        display: true,
        text: `Fatturato per ${currentFilter === 'oggi' ? 'Fasce Orarie' : 'Giorni'} (${currentFilter.charAt(0).toUpperCase() + currentFilter.slice(1)})`,
        font: {
          size: 14
        }
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
      {/* Header */}
      <div className="bg-gradient-to-r from-green-700 to-green-500 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                📊 Dashboard Pasto Sano
              </h1>
              <p className="mt-1 opacity-90">Analytics e gestione ordini in tempo reale</p>
            </div>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition"
              title={soundEnabled ? 'Disattiva suoni' : 'Attiva suoni'}
            >
              {soundEnabled ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Statistiche con etichette dinamiche */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">
                  {currentFilter === 'oggi' ? 'Ordini Oggi' : 
                   currentFilter === 'settimana' ? 'Ordini Settimana' :
                   currentFilter === 'mese' ? 'Ordini Mese' : 'Ordini Totali'}
                </p>
                <p className="text-3xl font-bold text-gray-800 mt-2">{filteredStats.ordersCount}</p>
                <p className="text-sm text-gray-600 mt-1">
                  {filteredStats.ordersCount} ordini {currentFilter}
                </p>
              </div>
              <ShoppingCart className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">
                  {currentFilter === 'oggi' ? 'Fatturato Oggi' : 
                   currentFilter === 'settimana' ? 'Fatturato Settimana' :
                   currentFilter === 'mese' ? 'Fatturato Mese' : 'Fatturato Totale'}
                </p>
                <p className="text-3xl font-bold text-gray-800 mt-2">€{filteredStats.revenue.toFixed(2)}</p>
                <p className="text-sm text-gray-600 mt-1">
                  €{filteredStats.revenue.toFixed(2)} {currentFilter}
                </p>
              </div>
              <Euro className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">Ordine Medio</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">€{filteredStats.averageOrder.toFixed(2)}</p>
                <p className="text-sm text-gray-600 mt-1">Media {currentFilter}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
          </div>

          <div 
            className="bg-white rounded-xl shadow-md p-6 border-l-4 border-orange-500 cursor-pointer hover:shadow-lg transition"
            onClick={() => setShowCustomersModal(true)}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">👥 Totale Clienti</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">{filteredStats.uniqueCustomers}</p>
                <p className="text-sm text-blue-600 mt-1">{filteredStats.uniqueCustomers} clienti unici</p>
              </div>
              <Users className="w-8 h-8 text-orange-500" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lista Ordini */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">📦 Ordini Recenti</h2>
              <div className="flex gap-2">
                <button 
                  onClick={exportToCSV}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2 text-sm"
                >
                  <Download className="w-4 h-4" />
                  Esporta CSV
                </button>
                <button 
                  onClick={generateProductionDoc}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 text-sm"
                >
                  <FileText className="w-4 h-4" />
                  Doc Produzione
                </button>
              </div>
            </div>

            {/* Controlli selezione */}
            <div className="flex gap-2 mb-4 items-center">
              <button 
                onClick={selectAllOrders}
                className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm"
              >
                ✅ Seleziona Tutti
              </button>
              <button 
                onClick={clearSelection}
                className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm"
              >
                ❌ Deseleziona
              </button>
              <span className="ml-auto px-3 py-1 bg-green-600 text-white rounded-full text-sm">
                {selectedOrders.length} selezionati
              </span>
            </div>

            {/* Filtri */}
            <div className="flex gap-2 mb-6">
              {(['oggi', 'settimana', 'mese', 'tutti'] as const).map(filter => (
                <button
                  key={filter}
                  onClick={() => filterOrdersByDate(orders, filter)}
                  className={`px-4 py-2 rounded-lg transition text-sm font-medium ${
                    currentFilter === filter 
                      ? 'bg-green-600 text-white' 
                      : 'border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>

            {/* Lista ordini */}
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {filteredOrders.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Nessun ordine trovato per il filtro selezionato</p>
                </div>
              ) : (
                filteredOrders.map(order => (
                  <div 
                    key={order.id}
                    className={`border rounded-lg p-4 transition hover:shadow-md ${
                      selectedOrders.includes(order.id!) 
                        ? 'border-green-500 bg-green-50' 
                        : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={selectedOrders.includes(order.id!)}
                        onChange={() => toggleOrderSelection(order.id!)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-800">
                              #{order.id?.substring(0, 8).toUpperCase()}
                            </span>
                            {getPaymentStatusBadge(order)}
                          </div>
                          <span className="text-xl font-bold text-green-600">
                            €{order.totalAmount.toFixed(2)}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-3">
                          <div>
                            <p className="flex items-center gap-2 mb-1">
                              <Users className="w-4 h-4 text-gray-500" />
                              <strong>{order.customerName}</strong>
                            </p>
                            <p className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-gray-500" />
                              <a 
                                href={`tel:${order.customerPhone}`} 
                                className="text-blue-600 hover:underline"
                              >
                                {order.customerPhone}
                              </a>
                              <button
                                onClick={() => openWhatsApp(order.customerPhone)}
                                className="text-green-600 hover:text-green-700"
                                title="Apri WhatsApp"
                              >
                                <MessageCircle className="w-4 h-4" />
                              </button>
                            </p>
                          </div>
                          <div>
                            <p className="flex items-center gap-2 mb-1">
                              <Calendar className="w-4 h-4 text-gray-500" />
                              <span><strong>Ritiro:</strong> {order.pickupDate || 'Da definire'}</span>
                            </p>
                            <p className="flex items-center gap-2">
                              {getPaymentMethodIcon(order.paymentMethod)}
                              <span><strong>Pagamento:</strong> {getPaymentMethodLabel(order.paymentMethod)}</span>
                            </p>
                          </div>
                        </div>

                        <div className="bg-gray-50 rounded p-2 mb-2">
                          <p className="text-sm font-medium text-gray-700 mb-1">
                            📋 Ordine ({order.items.reduce((sum, item) => sum + item.quantity, 0)} pezzi):
                          </p>
                          <div className="text-xs text-gray-600 space-y-1">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="flex justify-between">
                                <span>• {item.name} x{item.quantity}</span>
                                <span className="font-medium">€{(item.price * item.quantity).toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex justify-between items-center text-xs text-gray-500">
                          <span>
                            🕐 Ordinato il {formatDate(order.timestamp)}
                          </span>
                          <span>
                            {order.source === 'website' ? '🌐 Sito Web' : '📱 App'} • ID: {order.id}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Analytics */}
          <div className="space-y-6">
            {/* Grafico */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">📈 Analytics</h3>
              <div className="h-64">
                <Line data={getChartData()} options={chartOptions} />
              </div>
            </div>

            {/* Top Products */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">🏆 Piatti Più Venduti</h3>
              <div className="space-y-3">
                {topProducts.length === 0 ? (
                  <p className="text-gray-500 text-sm">Nessun dato disponibile</p>
                ) : (
                  topProducts.map((product, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                      <span className="text-sm text-gray-700 truncate flex-1">{product.name}</span>
                      <span className="text-sm font-semibold text-green-600 ml-2">
                        {product.sales} venduti
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Clienti */}
      {showCustomersModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">👥 Elenco Clienti ({customers.length})</h2>
              <button 
                onClick={() => setShowCustomersModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              {customers.map((customer, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 text-lg">{customer.name}</h3>
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <span className="flex items-center gap-1">
                          <Phone className="w-4 h-4 text-gray-500" />
                          <a href={`tel:${customer.phone}`} className="text-blue-600 hover:underline">
                            {customer.phone}
                          </a>
                        </span>
                        <button
                          onClick={() => openWhatsApp(customer.phone)}
                          className="text-green-600 hover:text-green-700 flex items-center gap-1"
                        >
                          <MessageCircle className="w-4 h-4" />
                          WhatsApp
                        </button>
                        {customer.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="w-4 h-4 text-gray-500" />
                            {customer.email}
                          </span>
                        )}
                      </div>
                      <div className="mt-3 flex gap-6 text-sm">
                        <span className="text-gray-700">
                          Ordini: <strong>{customer.totalOrders}</strong>
                        </span>
                        <span className="text-gray-700">
                          Speso: <strong className="text-green-600">€{customer.totalSpent.toFixed(2)}</strong>
                        </span>
                        <span className="text-gray-700">
                          Ultimo: <strong>{customer.lastOrder ? formatDate(customer.lastOrder) : 'N/A'}</strong>
                        </span>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      customer.totalOrders >= 5 
                        ? 'bg-yellow-100 text-yellow-700' 
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {customer.totalOrders >= 5 ? '⭐ VIP' : '🆕 Nuovo'}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button 
                onClick={() => {
                  const csvContent = [
                    ['Nome', 'Telefono', 'Email', 'Ordini', 'Speso', 'Ultimo Ordine'],
                    ...customers.map(c => [
                      c.name,
                      c.phone,
                      c.email || '',
                      c.totalOrders,
                      c.totalSpent.toFixed(2),
                      c.lastOrder ? formatDate(c.lastOrder) : ''
                    ])
                  ].map(row => row.join(',')).join('\n');

                  const blob = new Blob([csvContent], { type: 'text/csv' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `clienti_${new Date().toISOString().split('T')[0]}.csv`;
                  a.click();
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                📥 Esporta CSV
              </button>
              <button 
                onClick={() => setShowCustomersModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
              >
                Chiudi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}