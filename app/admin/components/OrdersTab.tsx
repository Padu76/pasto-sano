import { Download, FileText, Package, Phone, Calendar, Users, MessageCircle, MapPin, Navigation, Clock, Truck, Banknote, CreditCard, Smartphone } from 'lucide-react';
import { Order, ProductSales } from '@/lib/firebase';
import { Line } from 'react-chartjs-2';

interface OrdersTabProps {
  filteredOrders: Order[];
  selectedOrders: string[];
  currentFilter: 'oggi' | 'settimana' | 'mese' | 'tutti';
  deliveryFilter: 'all' | 'delivery' | 'pickup';
  topProducts: ProductSales[];
  onFilterChange: (filter: 'oggi' | 'settimana' | 'mese' | 'tutti') => void;
  onDeliveryFilterChange: (filter: 'all' | 'delivery' | 'pickup') => void;
  onToggleOrderSelection: (orderId: string) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onExportCSV: () => void;
  onGenerateProduction: () => void;
  onWhatsAppClick: (phone: string) => void;
  formatDate: (date: any) => string;
  getPaymentMethodLabel: (method: string) => string;
  chartData: any;
  chartOptions: any;
}

export default function OrdersTab({
  filteredOrders,
  selectedOrders,
  currentFilter,
  deliveryFilter,
  topProducts,
  onFilterChange,
  onDeliveryFilterChange,
  onToggleOrderSelection,
  onSelectAll,
  onClearSelection,
  onExportCSV,
  onGenerateProduction,
  onWhatsAppClick,
  formatDate,
  getPaymentMethodLabel,
  chartData,
  chartOptions
}: OrdersTabProps) {

  const getPaymentMethodIcon = (method: string) => {
    switch(method?.toLowerCase()) {
      case 'cash': return <Banknote className="w-4 h-4" />;
      case 'stripe': return <CreditCard className="w-4 h-4" />;
      case 'paypal': return <Smartphone className="w-4 h-4" />;
      default: return <CreditCard className="w-4 h-4" />;
    }
  };

  const getPaymentStatusBadge = (order: Order) => {
    const isPaid = order.paymentStatus === 'paid' || order.paymentMethod !== 'cash';
    
    if (order.paymentMethod === 'cash') {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 flex items-center gap-1">
          <Banknote className="w-3 h-3" />
          CONTANTI
        </span>
      );
    }
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
        isPaid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
      }`}>
        {getPaymentMethodIcon(order.paymentMethod)}
        {isPaid ? 'PAGATO' : 'DA PAGARE'}
      </span>
    );
  };

  const getDeliveryStatusBadge = (status?: string) => {
    const statusMap = {
      'pending': { label: 'Da assegnare', color: 'bg-gray-100 text-gray-700' },
      'assigned': { label: 'Assegnato', color: 'bg-amber-100 text-amber-700' },
      'in_delivery': { label: 'In consegna', color: 'bg-blue-100 text-blue-700' },
      'delivered': { label: 'Consegnato', color: 'bg-green-100 text-green-700' }
    };

    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.pending;

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
        {statusInfo.label}
      </span>
    );
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Ordini Recenti</h2>
          <div className="flex gap-2">
            <button 
              onClick={onExportCSV}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2 text-sm"
            >
              <Download className="w-4 h-4" />
              CSV
            </button>
            <button 
              onClick={onGenerateProduction}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 text-sm"
            >
              <FileText className="w-4 h-4" />
              Produzione
            </button>
          </div>
        </div>

        <div className="flex gap-2 mb-4 items-center">
          <button onClick={onSelectAll} className="px-3 py-1 border rounded-lg hover:bg-gray-50 text-sm">
            Seleziona Tutti
          </button>
          <button onClick={onClearSelection} className="px-3 py-1 border rounded-lg hover:bg-gray-50 text-sm">
            Deseleziona
          </button>
          <span className="ml-auto px-3 py-1 bg-green-600 text-white rounded-full text-sm">
            {selectedOrders.length} selezionati
          </span>
        </div>

        <div className="flex gap-2 mb-4">
          {(['oggi', 'settimana', 'mese', 'tutti'] as const).map(filter => (
            <button
              key={filter}
              onClick={() => onFilterChange(filter)}
              className={`px-4 py-2 rounded-lg transition text-sm font-medium ${
                currentFilter === filter ? 'bg-green-600 text-white' : 'border hover:bg-gray-50'
              }`}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>

        <div className="flex gap-2 mb-6">
          {(['all', 'delivery', 'pickup'] as const).map(filter => (
            <button
              key={filter}
              onClick={() => onDeliveryFilterChange(filter)}
              className={`px-4 py-2 rounded-lg transition text-sm font-medium ${
                deliveryFilter === filter ? 'bg-blue-600 text-white' : 'border hover:bg-gray-50'
              }`}
            >
              {filter === 'all' ? 'Tutti' : filter === 'delivery' ? 'Delivery' : 'Ritiro'}
            </button>
          ))}
        </div>

        <div className="space-y-3 max-h-[600px] overflow-y-auto">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Nessun ordine trovato</p>
            </div>
          ) : (
            filteredOrders.map(order => (
              <div 
                key={order.id}
                className={`border rounded-lg p-4 transition hover:shadow-md ${
                  selectedOrders.includes(order.id!) ? 'border-green-500 bg-green-50' : 'border-gray-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={selectedOrders.includes(order.id!)}
                    onChange={() => onToggleOrderSelection(order.id!)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-gray-800">
                          #{order.id?.substring(0, 8).toUpperCase()}
                        </span>
                        {getPaymentStatusBadge(order)}
                        {order.deliveryEnabled && (
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-600 text-white flex items-center gap-1">
                            <Truck className="w-3 h-3" />
                            DELIVERY
                          </span>
                        )}
                      </div>
                      <span className="text-xl font-bold text-green-600">
                        €{order.totalAmount.toFixed(2)}
                      </span>
                    </div>

                    {order.deliveryEnabled && (
                      <div className="bg-blue-50 rounded-lg p-3 mb-3 border border-blue-200">
                        <div className="flex items-start gap-2 mb-2">
                          <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                          <div className="text-sm flex-1">
                            <p className="font-medium text-gray-800">{order.deliveryAddress}</p>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <p className="text-gray-600 text-xs">
                                <Navigation className="w-3 h-3 inline mr-1" />
                                {order.deliveryDistance} km - {order.deliveryZone}
                              </p>
                              {getTimeSlotBadge(order.deliveryTimeSlot)}
                            </div>
                            <p className="text-gray-600 text-xs mt-1">
                              Costo: €{order.deliveryCost} (Rider: €{order.deliveryRiderShare})
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          {getDeliveryStatusBadge(order.deliveryStatus)}
                          {order.riderName && (
                            <span className="text-xs text-gray-600">
                              Rider: <strong>{order.riderName}</strong>
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-3">
                      <div>
                        <p className="flex items-center gap-2 mb-1">
                          <Users className="w-4 h-4 text-gray-500" />
                          <strong>{order.customerName}</strong>
                        </p>
                        <p className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-500" />
                          <a href={`tel:${order.customerPhone}`} className="text-blue-600 hover:underline">
                            {order.customerPhone}
                          </a>
                          <button
                            onClick={() => onWhatsAppClick(order.customerPhone)}
                            className="text-green-600 hover:text-green-700"
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
                          <span><strong>{getPaymentMethodLabel(order.paymentMethod)}</strong></span>
                        </p>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded p-2 mb-2">
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        Ordine ({order.items.reduce((sum, item) => sum + item.quantity, 0)} pezzi):
                      </p>
                      <div className="text-xs text-gray-600 space-y-1">
                        {order.items.map((item, idx) => (
                          <div key={idx}>
                            <div className="flex justify-between">
                              <span>{item.name} x{item.quantity}</span>
                              <span className="font-medium">€{(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                            {item.comboItems && (
                              <div className="ml-4 mt-1 space-y-0.5 text-gray-500">
                                {item.comboItems.primo && (
                                  <div className="flex items-start gap-1">
                                    <span>• Primo: {item.comboItems.primo}</span>
                                  </div>
                                )}
                                {item.comboItems.secondo && (
                                  <div className="flex items-start gap-1">
                                    <span>• Secondo: {item.comboItems.secondo}</span>
                                  </div>
                                )}
                                {item.comboItems.contorno && (
                                  <div className="flex items-start gap-1">
                                    <span>• Contorno: {item.comboItems.contorno}</span>
                                  </div>
                                )}
                                {item.comboItems.macedonia && (
                                  <div className="flex items-start gap-1">
                                    <span>• Macedonia</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="text-xs text-gray-500">
                      Ordinato il {formatDate(order.timestamp)}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Analytics</h3>
          <div className="h-64">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Piatti Più Venduti</h3>
          <div className="space-y-3">
            {topProducts.length === 0 ? (
              <p className="text-gray-500 text-sm">Nessun dato</p>
            ) : (
              topProducts.map((product, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <span className="text-sm text-gray-700 truncate flex-1">{product.name}</span>
                  <span className="text-sm font-semibold text-green-600 ml-2">{product.sales}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}