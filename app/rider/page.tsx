'use client';

import React, { useState, useEffect } from 'react';
import {
  Package,
  MapPin,
  Phone,
  Navigation,
  CheckCircle,
  Clock,
  TrendingUp,
  Euro,
  LogOut,
  Calendar,
  User,
  AlertCircle,
  Loader2,
  ExternalLink
} from 'lucide-react';

interface DeliveryOrder {
  id: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  deliveryAddressDetails?: string;
  deliveryDistance: number;
  deliveryZone: string;
  deliveryCost: number;
  deliveryRiderShare: number;
  deliveryStatus: 'pending' | 'assigned' | 'in_delivery' | 'delivered';
  deliveryTimeSlot?: string;
  pickupDate: string;
  totalAmount: number;
  items: Array<{ name: string; quantity: number; price: number }>;
  notes?: string;
  timestamp: Date;
  riderId?: string;
  riderName?: string;
  assignedAt?: Date;
  deliveredAt?: Date;
}

export default function RiderDashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [riderEmail, setRiderEmail] = useState('');
  const [riderPassword, setRiderPassword] = useState('');
  const [riderId, setRiderId] = useState('');
  const [riderName, setRiderName] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [stats, setStats] = useState({
    todayDeliveries: 0,
    weekDeliveries: 0,
    monthDeliveries: 0,
    todayEarnings: 0,
    weekEarnings: 0,
    monthEarnings: 0,
    averageDistance: 0
  });

  useEffect(() => {
    const savedRiderId = localStorage.getItem('riderId');
    const savedRiderName = localStorage.getItem('riderName');
    const savedRiderEmail = localStorage.getItem('riderEmail');
    
    if (savedRiderId && savedRiderName && savedRiderEmail) {
      setRiderId(savedRiderId);
      setRiderName(savedRiderName);
      setRiderEmail(savedRiderEmail);
      setIsLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;
    
    loadOrders();
    const interval = setInterval(loadOrders, 30000);
    return () => clearInterval(interval);
  }, [isLoggedIn, riderId]);

  useEffect(() => {
    calculateStats();
  }, [orders]);

  const handleLogin = async () => {
    setLoginError('');
    setIsLoggingIn(true);

    try {
      const response = await fetch('/api/rider-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: riderEmail,
          password: riderPassword
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Credenziali non valide');
      }

      localStorage.setItem('riderId', data.rider.id);
      localStorage.setItem('riderName', data.rider.name);
      localStorage.setItem('riderEmail', data.rider.email);

      setRiderId(data.rider.id);
      setRiderName(data.rider.name);
      setIsLoggedIn(true);

    } catch (error: any) {
      setLoginError(error.message || 'Errore durante il login');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('riderId');
    localStorage.removeItem('riderName');
    localStorage.removeItem('riderEmail');
    setIsLoggedIn(false);
    setRiderId('');
    setRiderName('');
    setRiderEmail('');
    setOrders([]);
  };

  const loadOrders = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/rider-orders?riderId=${riderId}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Errore caricamento ordini');
      }

      setOrders(data.orders);

    } catch (error: any) {
      setError(error.message || 'Errore durante il caricamento');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const deliveredOrders = orders.filter(o => o.deliveryStatus === 'delivered');

    const todayOrders = deliveredOrders.filter(o => 
      new Date(o.deliveredAt || o.timestamp) >= today
    );
    const weekOrders = deliveredOrders.filter(o => 
      new Date(o.deliveredAt || o.timestamp) >= weekAgo
    );
    const monthOrders = deliveredOrders.filter(o => 
      new Date(o.deliveredAt || o.timestamp) >= monthAgo
    );

    const todayEarnings = todayOrders.reduce((sum, o) => sum + o.deliveryRiderShare, 0);
    const weekEarnings = weekOrders.reduce((sum, o) => sum + o.deliveryRiderShare, 0);
    const monthEarnings = monthOrders.reduce((sum, o) => sum + o.deliveryRiderShare, 0);

    const avgDistance = deliveredOrders.length > 0
      ? deliveredOrders.reduce((sum, o) => sum + o.deliveryDistance, 0) / deliveredOrders.length
      : 0;

    setStats({
      todayDeliveries: todayOrders.length,
      weekDeliveries: weekOrders.length,
      monthDeliveries: monthOrders.length,
      todayEarnings,
      weekEarnings,
      monthEarnings,
      averageDistance: avgDistance
    });
  };

  const handleCompleteDelivery = async (orderId: string) => {
    if (!confirm('Confermi di aver completato la consegna?')) return;

    try {
      const response = await fetch('/api/rider-complete-delivery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          riderId
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Errore durante il completamento');
      }

      await loadOrders();

    } catch (error: any) {
      alert(error.message || 'Errore durante il completamento');
    }
  };

  const openMaps = (address: string) => {
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
  };

  const callCustomer = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const getTimeSlotBadge = (slot?: string) => {
    if (!slot) return null;
    
    const colors: Record<string, string> = {
      '12-14': 'bg-orange-100 text-orange-700',
      '16-18': 'bg-purple-100 text-purple-700',
      '19-21': 'bg-blue-100 text-blue-700'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[slot] || 'bg-gray-100 text-gray-700'} flex items-center gap-1`}>
        <Clock className="w-3 h-3" />
        {slot}
      </span>
    );
  };

  const groupOrdersByDay = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayOrders: DeliveryOrder[] = [];
    const futureOrders: DeliveryOrder[] = [];

    orders.forEach(order => {
      const orderDate = new Date(order.pickupDate);
      orderDate.setHours(0, 0, 0, 0);

      if (orderDate.getTime() === today.getTime()) {
        todayOrders.push(order);
      } else if (orderDate > today) {
        futureOrders.push(order);
      }
    });

    todayOrders.sort((a, b) => {
      const slotOrder = { '12-14': 1, '16-18': 2, '19-21': 3 };
      const aSlot = slotOrder[a.deliveryTimeSlot as keyof typeof slotOrder] || 999;
      const bSlot = slotOrder[b.deliveryTimeSlot as keyof typeof slotOrder] || 999;
      return aSlot - bSlot;
    });

    futureOrders.sort((a, b) => {
      const dateCompare = new Date(a.pickupDate).getTime() - new Date(b.pickupDate).getTime();
      if (dateCompare !== 0) return dateCompare;
      
      const slotOrder = { '12-14': 1, '16-18': 2, '19-21': 3 };
      const aSlot = slotOrder[a.deliveryTimeSlot as keyof typeof slotOrder] || 999;
      const bSlot = slotOrder[b.deliveryTimeSlot as keyof typeof slotOrder] || 999;
      return aSlot - bSlot;
    });

    return { todayOrders, futureOrders };
  };

  const renderOrderCard = (order: DeliveryOrder) => (
    <div
      key={order.id}
      className={`bg-white rounded-xl shadow-sm p-5 border-l-4 ${
        order.deliveryStatus === 'assigned'
          ? 'border-amber-500'
          : order.deliveryStatus === 'in_delivery'
          ? 'border-blue-500'
          : 'border-green-500'
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <User className="w-5 h-5 text-gray-600" />
            <h3 className="font-bold text-lg text-gray-800">{order.customerName}</h3>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>{new Date(order.pickupDate).toLocaleDateString('it-IT', {
                weekday: 'short',
                day: 'numeric',
                month: 'short'
              })}</span>
            </div>
            {getTimeSlotBadge(order.deliveryTimeSlot)}
          </div>
        </div>

        <div className="text-right">
          <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
            order.deliveryStatus === 'assigned'
              ? 'bg-amber-100 text-amber-800'
              : order.deliveryStatus === 'in_delivery'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-green-100 text-green-800'
          }`}>
            {order.deliveryStatus === 'assigned' ? 'Assegnato' :
             order.deliveryStatus === 'in_delivery' ? 'In consegna' : 'Consegnato'}
          </div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-3">
        <div className="flex items-start gap-3">
          <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium text-gray-800">{order.deliveryAddress}</p>
            {order.deliveryAddressDetails && (
              <p className="text-sm text-gray-600 mt-1">{order.deliveryAddressDetails}</p>
            )}
          </div>
          <button
            onClick={() => openMaps(order.deliveryAddress)}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            title="Apri Maps"
          >
            <ExternalLink className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Navigation className="w-4 h-4 text-gray-500" />
            <span className="text-gray-600">{order.deliveryDistance.toFixed(1)} km</span>
            <span className="text-xs text-gray-500">({order.deliveryZone})</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-gray-500" />
            <button
              onClick={() => callCustomer(order.customerPhone)}
              className="text-blue-600 hover:underline"
            >
              {order.customerPhone}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 rounded-lg p-3 mb-4">
        <p className="text-xs font-semibold text-gray-600 mb-2">ARTICOLI:</p>
        <div className="space-y-1">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex justify-between text-sm">
              <span className="text-gray-700">{item.quantity}x {item.name}</span>
              <span className="text-gray-600">€{(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>

      {order.notes && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
          <p className="text-xs font-semibold text-amber-800 mb-1">NOTE:</p>
          <p className="text-sm text-amber-900">{order.notes}</p>
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t">
        <div className="space-y-1">
          <div className="text-sm text-gray-600">
            Totale ordine: <span className="font-semibold">€{order.totalAmount.toFixed(2)}</span>
          </div>
          <div className="text-lg font-bold text-green-600">
            Tuo guadagno: €{order.deliveryRiderShare.toFixed(2)}
          </div>
        </div>

        <div className="flex gap-2">
          {order.deliveryStatus === 'assigned' && order.riderId === riderId && (
            <button
              onClick={() => handleCompleteDelivery(order.id)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Consegnato</span>
            </button>
          )}

          {order.deliveryStatus === 'in_delivery' && order.riderId === riderId && (
            <button
              onClick={() => handleCompleteDelivery(order.id)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Consegnato</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
          <div className="text-center mb-8">
            <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-10 h-10 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">Pasto Sano</h1>
            <p className="text-gray-600 mt-2">Dashboard Rider</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={riderEmail}
                onChange={(e) => setRiderEmail(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="rider@pastosano.it"
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={riderPassword}
                onChange={(e) => setRiderPassword(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="••••••••"
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>

            {loginError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {loginError}
              </div>
            )}

            <button
              onClick={handleLogin}
              disabled={isLoggingIn || !riderEmail || !riderPassword}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Accesso...</span>
                </>
              ) : (
                <span>Accedi</span>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { todayOrders, futureOrders } = groupOrdersByDay();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Dashboard Rider</h1>
              <p className="text-sm text-gray-600">Ciao, {riderName}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden sm:inline">Esci</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 text-blue-600 mb-2">
              <Package className="w-5 h-5" />
              <span className="text-sm font-medium">Oggi</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">{stats.todayDeliveries}</p>
            <p className="text-xs text-gray-500">consegne</p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 text-green-600 mb-2">
              <Euro className="w-5 h-5" />
              <span className="text-sm font-medium">Oggi</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">€{stats.todayEarnings.toFixed(2)}</p>
            <p className="text-xs text-gray-500">guadagnati</p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 text-purple-600 mb-2">
              <Calendar className="w-5 h-5" />
              <span className="text-sm font-medium">Settimana</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">{stats.weekDeliveries}</p>
            <p className="text-xs text-gray-500">consegne</p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 text-orange-600 mb-2">
              <TrendingUp className="w-5 h-5" />
              <span className="text-sm font-medium">Media km</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">{stats.averageDistance.toFixed(1)}</p>
            <p className="text-xs text-gray-500">km/consegna</p>
          </div>
        </div>

        {isLoading ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-600" />
            <p className="text-gray-600">Caricamento ordini...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 text-red-600" />
            <p className="text-red-600">{error}</p>
            <button
              onClick={loadOrders}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Riprova
            </button>
          </div>
        ) : (
          <>
            {todayOrders.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <div className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold">
                    OGGI - {todayOrders.length} {todayOrders.length === 1 ? 'ordine' : 'ordini'}
                  </div>
                </div>
                <div className="space-y-4">
                  {todayOrders.map(renderOrderCard)}
                </div>
              </div>
            )}

            {futureOrders.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="bg-purple-600 text-white px-4 py-2 rounded-lg font-bold">
                    PROSSIMI GIORNI - {futureOrders.length} {futureOrders.length === 1 ? 'ordine' : 'ordini'}
                  </div>
                </div>
                <div className="space-y-4">
                  {futureOrders.map(renderOrderCard)}
                </div>
              </div>
            )}

            {todayOrders.length === 0 && futureOrders.length === 0 && (
              <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                <Package className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p className="text-gray-600">Nessun ordine assegnato</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}