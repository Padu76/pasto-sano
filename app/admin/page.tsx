'use client';

import { useEffect, useState, useRef } from 'react';
import { 
  getOrders, 
  listenToOrders, 
  getDashboardStats, 
  getTopProducts,
  getUniqueCustomers,
  updateOrderStatus,
  type Order,
  type DashboardStats,
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
  Check,
  X,
  Phone,
  Mail,
  Calendar,
  CreditCard,
  Package,
  Filter,
  Bell,
  Volume2,
  VolumeX,
  ChevronDown,
  Clock,
  DollarSign
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
  const [stats, setStats] = useState<DashboardStats | null>(null);
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
  }, [currentFilter, soundEnabled]);

  // Carica dati dashboard
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [ordersData, statsData, productsData, customersData] = await Promise.all([
        getOrders(500),
        getDashboardStats(),
        getTopProducts(10, 30),
        getUniqueCustomers(365)
      ]);

      setOrders(ordersData);
      setStats(statsData);
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

  // Filtra ordini per data
  const filterOrdersByDate = (ordersToFilter: Order[], filter: typeof currentFilter) => {
    const now = new Date();
    let filtered: Order[] = [];

    switch (filter) {
      case 'oggi':
        filtered = ordersToFilter.filter(order => {
          const orderDate = order.timestamp instanceof Date 
            ? order.timestamp 
            : order.timestamp.toDate();
          return orderDate.toDateString() === now.toDateString();
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

    const headers = ['ID', 'Cliente', 'Telefono', 'Data', 'Totale', 'Pagamento', 'Articoli'];
    const rows = ordersToExport.map(order => [
      order.id,
      order.customerName,
      order.customerPhone,
      formatDate(order.timestamp),
      order.totalAmount.toFixed(2),
      order.paymentMethod,
      order.items.map(item => `${item.name} x${item.quantity}`).join('; ')
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ordini_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Genera documento produzione
  const generateProductionDoc = () => {
    const ordersToProcess = selectedOrders.length > 0 
      ? orders.filter(order => selectedOrders.includes(order.id!))
      : filteredOrders;

    if (ordersToProcess.length === 0) {
      alert('Nessun ordine selezionato');
      return;
    }

    const itemsCount: Record<string, number> = {};
    
    ordersToProcess.forEach(order => {
      order.items.forEach(item => {
        itemsCount[item.name] = (itemsCount[item.name] || 0) + item.quantity;
      });
    });

    let doc = `DOCUMENTO PRODUZIONE - PASTO SANO\n`;
    doc += `Data: ${new Date().toLocaleDateString('it-IT')}\n`;
    doc += `Ordini: ${ordersToProcess.length}\n\n`;
    doc += `RIEPILOGO PRODUZIONE:\n`;
    doc += `${'='.repeat(40)}\n`;
    
    Object.entries(itemsCount)
      .sort(([,a], [,b]) => b - a)
      .forEach(([name, quantity]) => {
        doc += `• ${name}: ${quantity} porzioni\n`;
      });

    const blob = new Blob([doc], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `produzione_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
  };

  // Utility functions
  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    const d = date instanceof Date ? date : date.toDate();
    return d.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const showNotification = (message: string) => {
    // Implementare toast notification
    console.log('📢 Notifica:', message);
  };

  const playNotificationSound = () => {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBi+Ey/DZhjQFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBi+Ey/DZhjQIHW259NSTQQ0UXrTp66hVFApGn+DyvmwhBi+Ey/DZhjQIHW259NSTQQ0UXrTp66hVFApGn+DyvmwhBi+Ey/DZhjQIHW259NSTQQ0UXrTp66hVFApGn+DyvmwhBi+Ey/DZhjQIHW259NSTQQ0UXrTp66hVFApGn+DyvmwhBi+Ey/DZhjQIHW259NSTQQ0UXrTp66hVFApGn+DyvmwhBi+Ey/DZhjQIHW259NSTQQ0UXrTp66hVFApGn+DyvmwhBi+Ey/DZhjQIHW259NSTQQ0UXrTp66hVFApGn+DyvmwhBi+Ey/DZhjQIHW259NSTQQ0UXrTp66hVFApGn+DyvmwhBi+Ey/DZhjQIHW259NSTQQ0UXrTp66hVFApGn+DyvmwhBi+Ey/DZhjQIHW259NSTQQ0UXrTp66hVFApGn+DyvmwhBi+Ey/DZhjQIHW259NSTQQ0UXrTp66hVFApGn+DyvmwhBi+Ey/DZhjQIHW259NSTQQ0UXrTp66hVFApGn+DyvmwhBi+Ey/DZhjQIHW259NSTQQ0UXrTp66hVFApGn+DyvmwhBi+Ey/DZhjQIHW259NSTQQ0UXrTp66hVFApGn+DyvmwhBi+Ey/DZhjQIHW259NSTQQ0UXrTp66hVFApGn+DyvmwhBi+Ey/DZhjQIHW259NSTQQ0UXrTp66hVFApGn+DyvmwhBi+Ey/DZhjQIHW259NSTQQ0UXrTp66hVFApGn+DyvmwhBi+Ey/DZhjQIHW259NSTQQ0UXrTp66hVFApGn+DyvmwhBi+Ey/DZhjQIHW259NST');
    audio.play().catch(e => console.log('Audio play failed:', e));
  };

  // Dati per il grafico
  const chartData = {
    labels: ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'],
    datasets: [{
      label: 'Fatturato',
      data: [120, 190, 300, 250, 420, 380, 450],
      borderColor: '#7a9e7e',
      backgroundColor: 'rgba(122, 158, 126, 0.1)',
      tension: 0.4,
      fill: true
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return '€' + value;
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
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">📊 Dashboard Pasto Sano</h1>
            <p className="mt-1 opacity-90">Analytics e gestione ordini in tempo reale</p>
          </div>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition"
          >
            {soundEnabled ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Statistiche */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm font-medium">Ordini Oggi</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">{stats?.ordersToday || 0}</p>
                <p className="text-sm text-gray-600 mt-1">
                  {currentFilter === 'oggi' ? 'Oggi' : `Filtro: ${currentFilter}`}
                </p>
              </div>
              <ShoppingCart className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm font-medium">Fatturato Oggi</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">€{stats?.revenueToday.toFixed(2) || '0.00'}</p>
                <p className="text-sm text-gray-600 mt-1">
                  Media: €{stats?.averageOrder.toFixed(2) || '0.00'}
                </p>
              </div>
              <Euro className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm font-medium">Ordine Medio</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">€{stats?.averageOrder.toFixed(2) || '0.00'}</p>
                <p className="text-sm text-gray-600 mt-1">Ultimi 30 giorni</p>
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
                <p className="text-gray-500 text-sm font-medium">Clienti Totali</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">{stats?.uniqueCustomers || 0}</p>
                <p className="text-sm text-blue-600 mt-1">Clicca per dettagli →</p>
              </div>
              <Users className="w-8 h-8 text-orange-500" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lista Ordini */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">🛒 Ordini Recenti</h2>
              <div className="flex gap-2">
                <button 
                  onClick={exportToCSV}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  CSV
                </button>
                <button 
                  onClick={generateProductionDoc}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Produzione
                </button>
              </div>
            </div>

            {/* Controlli selezione */}
            <div className="flex gap-2 mb-4">
              <button 
                onClick={selectAllOrders}
                className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                ✅ Seleziona Tutti
              </button>
              <button 
                onClick={clearSelection}
                className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
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
                  onClick={() => {
                    setCurrentFilter(filter);
                    filterOrdersByDate(orders, filter);
                  }}
                  className={`px-4 py-2 rounded-lg transition ${
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
                    className={`border rounded-lg p-4 transition ${
                      selectedOrders.includes(order.id!) 
                        ? 'border-green-500 bg-green-50' 
                        : 'border-gray-200 hover:border-gray-300'
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
                          <div>
                            <span className="font-semibold text-gray-800">
                              #{order.id?.substring(0, 8)}
                            </span>
                            <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                              order.paymentMethod === 'cash' 
                                ? 'bg-blue-100 text-blue-700' 
                                : 'bg-green-100 text-green-700'
                            }`}>
                              {order.paymentMethod === 'cash' ? '💰 Contanti' : '💳 Online'}
                            </span>
                          </div>
                          <span className="text-lg font-bold text-green-600">
                            €{order.totalAmount.toFixed(2)}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                          <div>
                            <p className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              <strong>{order.customerName}</strong>
                            </p>
                            <p className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              <a href={`tel:${order.customerPhone}`} className="text-blue-600 hover:underline">
                                {order.customerPhone}
                              </a>
                            </p>
                          </div>
                          <div>
                            <p className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(order.pickupDate || order.timestamp)}
                            </p>
                            <p className="flex items-center gap-1">
                              <CreditCard className="w-3 h-3" />
                              {order.paymentMethodName || order.paymentMethod}
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <p className="text-sm font-medium text-gray-700 mb-1">
                            Ordine ({order.items.reduce((sum, item) => sum + item.quantity, 0)} pezzi):
                          </p>
                          <div className="text-sm text-gray-600">
                            {order.items.map((item, idx) => (
                              <div key={idx}>
                                • {item.name} x{item.quantity} (€{(item.price * item.quantity).toFixed(2)})
                              </div>
                            ))}
                          </div>
                        </div>

                        {order.discountCode && (
                          <div className="mt-2 text-sm text-red-600">
                            🎁 Sconto {order.discountCode}: -€{order.discountAmount?.toFixed(2)}
                          </div>
                        )}

                        <div className="mt-2 text-xs text-gray-500">
                          🕐 {formatDate(order.timestamp)}
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
              <h3 className="text-lg font-bold text-gray-800 mb-4">📈 Andamento Settimana</h3>
              <div className="h-64">
                <Line data={chartData} options={chartOptions} />
              </div>
            </div>

            {/* Top Products */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">🏆 Piatti Più Venduti</h3>
              <div className="space-y-3">
                {topProducts.map((product, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">{product.name}</span>
                    <span className="text-sm font-semibold text-green-600">
                      {product.sales} venduti
                    </span>
                  </div>
                ))}
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
                <div key={idx} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-800">{customer.name}</h3>
                      <p className="text-sm text-gray-600">
                        📱 {customer.phone} {customer.email && `• 📧 ${customer.email}`}
                      </p>
                      <div className="mt-2 flex gap-4 text-sm">
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
                  // Esporta clienti CSV
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