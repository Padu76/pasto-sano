import { Line } from 'react-chartjs-2';
import { Order } from '@/lib/firebase';
import { getPurchaseCost, calculateProfit } from '@/lib/productCosts';

interface AnalyticsTabProps {
  analyticsOrders: Order[];
  analyticsFilter: 'oggi' | 'settimana' | 'mese' | 'tutti';
  onFilterChange: (filter: 'oggi' | 'settimana' | 'mese' | 'tutti') => void;
  chartData: any;
  chartOptions: any;
}

export default function AnalyticsTab({
  analyticsOrders,
  analyticsFilter,
  onFilterChange,
  chartData,
  chartOptions
}: AnalyticsTabProps) {
  // Calcolo fatturato totale
  const totalRevenue = analyticsOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  
  // Calcolo costi totali di acquisto
  const totalCosts = analyticsOrders.reduce((sum, order) => {
    if (!order.items) return sum;
    
    const orderCost = order.items.reduce((itemSum, item) => {
      // Ottieni il costo di acquisto del prodotto
      const purchaseCost = getPurchaseCost(item.name);
      return itemSum + (purchaseCost * item.quantity);
    }, 0);
    
    return sum + orderCost;
  }, 0);
  
  // Calcolo guadagno netto e margine %
  const { profit: netProfit, marginPercent } = calculateProfit(totalRevenue, totalCosts);
  
  // Calcolo ordine medio (fatturato)
  const averageOrder = analyticsOrders.length > 0 ? totalRevenue / analyticsOrders.length : 0;
  
  // Calcolo guadagno medio per ordine
  const averageProfit = analyticsOrders.length > 0 ? netProfit / analyticsOrders.length : 0;

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Analytics Dettagliate</h2>
        <div className="flex gap-2">
          {(['oggi', 'settimana', 'mese', 'tutti'] as const).map(filter => (
            <button
              key={filter}
              onClick={() => onFilterChange(filter)}
              className={`px-4 py-2 rounded-lg transition text-sm font-medium ${
                analyticsFilter === filter ? 'bg-green-600 text-white' : 'border hover:bg-gray-50'
              }`}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Riga superiore - Metriche generali */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
          <p className="text-sm opacity-90 mb-1">Ordini Periodo</p>
          <p className="text-3xl font-bold">{analyticsOrders.length}</p>
        </div>
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <p className="text-sm opacity-90 mb-1">Fatturato Totale</p>
          <p className="text-3xl font-bold">€{totalRevenue.toFixed(2)}</p>
          <p className="text-xs opacity-75 mt-1">Medio: €{averageOrder.toFixed(2)}</p>
        </div>
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
          <p className="text-sm opacity-90 mb-1">Costi Acquisto</p>
          <p className="text-3xl font-bold">€{totalCosts.toFixed(2)}</p>
          <p className="text-xs opacity-75 mt-1">Medio: €{(analyticsOrders.length > 0 ? totalCosts / analyticsOrders.length : 0).toFixed(2)}</p>
        </div>
      </div>

      {/* Riga inferiore - Guadagno netto */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <p className="text-sm opacity-90 mb-1">Guadagno Netto</p>
          <p className="text-3xl font-bold">€{netProfit.toFixed(2)}</p>
          <p className="text-xs opacity-75 mt-1">Medio per ordine: €{averageProfit.toFixed(2)}</p>
        </div>
        <div className="bg-gradient-to-r from-pink-500 to-pink-600 rounded-lg p-6 text-white">
          <p className="text-sm opacity-90 mb-1">Margine di Profitto</p>
          <p className="text-3xl font-bold">{marginPercent.toFixed(1)}%</p>
          <p className="text-xs opacity-75 mt-1">
            {marginPercent >= 35 ? '✓ Ottimo margine' : marginPercent >= 25 ? '✓ Buon margine' : '⚠ Margine basso'}
          </p>
        </div>
      </div>

      {/* Grafico andamento */}
      <div className="h-96">
        <Line data={chartData} options={chartOptions} />
      </div>
    </div>
  );
}