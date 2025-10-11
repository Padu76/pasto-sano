'use client';

import { useEffect, useState } from 'react';
import { getOrders, type Order } from '@/lib/firebase';
import { getPurchaseCost } from '@/lib/productCosts';
import { FileText, Download, Calculator, Package, Euro } from 'lucide-react';

export default function ProductionPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('oggi');
  const [productionSummary, setProductionSummary] = useState<any>({});
  const [totalCost, setTotalCost] = useState(0);

  useEffect(() => {
    loadOrders();
  }, [dateFilter]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const allOrders = await getOrders(500);
      
      // Filtra per data
      const filtered = filterOrdersByDate(allOrders);
      setOrders(filtered);
      
      // Calcola riepilogo automatico
      calculateSummary(filtered);
    } catch (error) {
      console.error('Errore caricamento ordini:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterOrdersByDate = (ordersToFilter: Order[]) => {
    const now = new Date();
    now.setHours(23, 59, 59, 999);
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    switch (dateFilter) {
      case 'oggi':
        return ordersToFilter.filter(order => {
          const orderDate = order.timestamp instanceof Date 
            ? order.timestamp 
            : order.timestamp.toDate();
          return orderDate >= todayStart && orderDate <= now;
        });
      case 'domani':
        const tomorrow = new Date(todayStart);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowEnd = new Date(tomorrow);
        tomorrowEnd.setHours(23, 59, 59, 999);
        return ordersToFilter.filter(order => {
          const pickupDate = order.pickupDate ? new Date(order.pickupDate) : null;
          return pickupDate && pickupDate >= tomorrow && pickupDate <= tomorrowEnd;
        });
      case 'settimana':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return ordersToFilter.filter(order => {
          const orderDate = order.timestamp instanceof Date 
            ? order.timestamp 
            : order.timestamp.toDate();
          return orderDate >= weekAgo;
        });
      default:
        return ordersToFilter;
    }
  };

  const calculateSummary = (ordersToProcess: Order[]) => {
    const summary: Record<string, { quantity: number; unitCost: number; category?: string }> = {};
    let total = 0;

    ordersToProcess.forEach(order => {
      order.items?.forEach(item => {
        if (item.comboItems) {
          // Gestione COMBO
          if (item.comboItems.primo) {
            const key = `PRIMO - ${item.comboItems.primo.toUpperCase()}`;
            if (!summary[key]) {
              summary[key] = { 
                quantity: 0, 
                unitCost: getPurchaseCost(item.comboItems.primo, 'primo'),
                category: 'primo'
              };
            }
            summary[key].quantity += item.quantity;
          }
          
          if (item.comboItems.secondo) {
            const key = `SECONDO - ${item.comboItems.secondo.toUpperCase()}`;
            if (!summary[key]) {
              summary[key] = { 
                quantity: 0, 
                unitCost: getPurchaseCost(item.comboItems.secondo, 'secondo'),
                category: 'secondo'
              };
            }
            summary[key].quantity += item.quantity;
          }
          
          if (item.comboItems.contorno) {
            const key = `CONTORNO - ${item.comboItems.contorno.toUpperCase()}`;
            if (!summary[key]) {
              summary[key] = { 
                quantity: 0, 
                unitCost: getPurchaseCost(item.comboItems.contorno, 'contorno'),
                category: 'contorno'
              };
            }
            summary[key].quantity += item.quantity;
          }
          
          if (item.comboItems.macedonia) {
            const key = 'FRUTTA - MACEDONIA';
            if (!summary[key]) {
              summary[key] = { 
                quantity: 0, 
                unitCost: getPurchaseCost('macedonia', 'extra'),
                category: 'extra'
              };
            }
            summary[key].quantity += item.quantity;
          }
        } else {
          // Prodotti singoli
          const productName = item.name.toUpperCase();
          if (!summary[productName]) {
            let category = item.category || '';
            if (!category) {
              // Deduce categoria dal nome
              const nameLower = productName.toLowerCase();
              if (nameLower.includes('lasagna') || nameLower.includes('pasta') ||
                  nameLower.includes('risotto') || nameLower.includes('gnocchi')) {
                category = 'primo';
              } else if (nameLower.includes('pollo') || nameLower.includes('tacchino') ||
                         nameLower.includes('manzo') || nameLower.includes('pesce')) {
                category = 'secondo';
              } else if (nameLower.includes('patate') || nameLower.includes('verdure')) {
                category = 'contorno';
              } else if (nameLower.includes('focaccia')) {
                category = 'focaccia';
              } else if (nameLower.includes('piadina')) {
                category = 'piadina';
              } else if (nameLower.includes('insalatona')) {
                category = 'insalatona';
              }
            }
            
            summary[productName] = { 
              quantity: 0, 
              unitCost: getPurchaseCost(item.name, category),
              category: category
            };
          }
          summary[productName].quantity += item.quantity;
        }
      });
    });

    // Calcola totale
    Object.values(summary).forEach(item => {
      total += item.quantity * item.unitCost;
    });

    setProductionSummary(summary);
    setTotalCost(total);
  };

  const toggleOrderSelection = (orderId: string) => {
    const newSelection = selectedOrders.includes(orderId)
      ? selectedOrders.filter(id => id !== orderId)
      : [...selectedOrders, orderId];
    
    setSelectedOrders(newSelection);
    
    // Ricalcola con ordini selezionati
    if (newSelection.length > 0) {
      const selectedOrdersData = orders.filter(o => newSelection.includes(o.id!));
      calculateSummary(selectedOrdersData);
    } else {
      calculateSummary(orders);
    }
  };

  const selectAll = () => {
    const allIds = orders.map(o => o.id!);
    setSelectedOrders(allIds);
    calculateSummary(orders);
  };

  const clearSelection = () => {
    setSelectedOrders([]);
    calculateSummary(orders);
  };

  const generateDocument = () => {
    const ordersToProcess = selectedOrders.length > 0 
      ? orders.filter(order => selectedOrders.includes(order.id!))
      : orders;

    if (ordersToProcess.length === 0) {
      alert('Nessun ordine da processare');
      return;
    }

    let doc = `DOCUMENTO PRODUZIONE - FORNITORE\n`;
    doc += `${'='.repeat(60)}\n`;
    doc += `Data Documento: ${new Date().toLocaleDateString('it-IT')}\n`;
    doc += `Filtro: ${dateFilter.charAt(0).toUpperCase() + dateFilter.slice(1)}\n`;
    doc += `Ordini: ${ordersToProcess.length}\n\n`;
    
    doc += `RIEPILOGO PRODUZIONE CON COSTI DI ACQUISTO:\n`;
    doc += `${'='.repeat(60)}\n`;
    doc += `Quantità  Prezzo Unit.  Totale       Articolo\n`;
    doc += `${'─'.repeat(60)}\n`;
    
    // Ordina per quantità
    const sorted = Object.entries(productionSummary)
      .sort(([,a], [,b]) => b.quantity - a.quantity);
    
    sorted.forEach(([product, data]) => {
      const totaleProdotto = data.quantity * data.unitCost;
      const qty = data.quantity.toString().padEnd(10);
      const price = `€${data.unitCost.toFixed(2)}`.padEnd(13);
      const total = `€${totaleProdotto.toFixed(2)}`.padEnd(12);
      doc += `${qty}${price}${total} ${product}\n`;
    });
    
    doc += `${'═'.repeat(60)}\n`;
    doc += `TOTALE DA PAGARE AL FORNITORE: €${totalCost.toFixed(2)}\n`;
    doc += `${'═'.repeat(60)}\n\n`;
    
    // Dettaglio per cliente
    doc += `DETTAGLIO ORDINI PER CLIENTE:\n`;
    doc += `${'─'.repeat(60)}\n\n`;
    
    const ordersByCustomer: Record<string, any[]> = {};
    ordersToProcess.forEach(order => {
      const customerKey = `${order.customerName} - Tel: ${order.customerPhone}`;
      if (!ordersByCustomer[customerKey]) {
        ordersByCustomer[customerKey] = [];
      }
      order.items?.forEach(item => {
        ordersByCustomer[customerKey].push({
          name: item.name,
          quantity: item.quantity
        });
      });
    });
    
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
    
    doc += `${'='.repeat(60)}\n`;
    doc += `Documento generato: ${new Date().toLocaleString('it-IT')}\n`;
    doc += `Pasto Sano - Documento Fornitore\n`;

    // Download
    const blob = new Blob([doc], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fornitore_${dateFilter}_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Caricamento ordini...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-700 to-green-500 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <FileText className="w-8 h-8" />
            Documento Produzione Fornitore
          </h1>
          <p className="mt-2 opacity-90">Genera documenti con prezzi di acquisto e totali</p>
        </div>
      </div>

      {/* Controlli */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => setDateFilter('oggi')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  dateFilter === 'oggi' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                Ordini Oggi
              </button>
              <button
                onClick={() => setDateFilter('domani')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  dateFilter === 'domani' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                Ritiro Domani
              </button>
              <button
                onClick={() => setDateFilter('settimana')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  dateFilter === 'settimana' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                Settimana
              </button>
              <button
                onClick={() => setDateFilter('tutti')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  dateFilter === 'tutti' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                Tutti
              </button>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={selectAll}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Seleziona Tutti
              </button>
              <button
                onClick={clearSelection}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Deseleziona
              </button>
              <button
                onClick={generateDocument}
                className="px-6 py-2 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg hover:shadow-lg flex items-center gap-2"
              >
                <Download className="w-5 h-5" />
                Genera Documento
              </button>
            </div>
          </div>
          
          <div className="mt-4 text-sm text-gray-600">
            {selectedOrders.length > 0 
              ? `${selectedOrders.length} ordini selezionati` 
              : `${orders.length} ordini totali`}
          </div>
        </div>

        {/* Riepilogo Costi */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Calculator className="w-6 h-6 text-green-600" />
            Riepilogo Produzione e Costi
          </h2>
          
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 mb-4">
            <div className="text-2xl font-bold text-green-700">
              TOTALE DA PAGARE: €{totalCost.toFixed(2)}
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-2">Articolo</th>
                  <th className="text-center py-2">Quantità</th>
                  <th className="text-right py-2">Prezzo Unit.</th>
                  <th className="text-right py-2">Totale</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(productionSummary)
                  .sort(([,a], [,b]) => b.quantity - a.quantity)
                  .map(([product, data]) => (
                    <tr key={product} className="border-b hover:bg-gray-50">
                      <td className="py-2">{product}</td>
                      <td className="text-center py-2 font-semibold">{data.quantity}</td>
                      <td className="text-right py-2">€{data.unitCost.toFixed(2)}</td>
                      <td className="text-right py-2 font-semibold">
                        €{(data.quantity * data.unitCost).toFixed(2)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Lista Ordini */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Package className="w-6 h-6 text-green-600" />
            Ordini ({orders.length})
          </h2>
          
          <div className="space-y-2">
            {orders.map(order => (
              <div 
                key={order.id}
                className={`border rounded-lg p-3 cursor-pointer transition ${
                  selectedOrders.includes(order.id!) 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => toggleOrderSelection(order.id!)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold">{order.customerName}</div>
                    <div className="text-sm text-gray-600">
                      Tel: {order.customerPhone} | 
                      Ritiro: {order.pickupDate || 'Da definire'}
                    </div>
                    <div className="text-sm mt-1">
                      {order.items.map(item => 
                        `${item.name} x${item.quantity}`
                      ).join(', ')}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-green-600">
                      €{order.totalAmount.toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {order.paymentStatus === 'paid' ? 'Pagato' : 'Da pagare'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}