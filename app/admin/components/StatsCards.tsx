import { ShoppingCart, Euro, TrendingUp, Users } from 'lucide-react';

interface StatsCardsProps {
  stats: {
    ordersCount: number;
    revenue: number;
    averageOrder: number;
    uniqueCustomers: number;
  };
  currentFilter: 'oggi' | 'settimana' | 'mese' | 'tutti';
  onCustomersClick: () => void;
}

export default function StatsCards({ stats, currentFilter, onCustomersClick }: StatsCardsProps) {
  const getFilterLabel = () => {
    switch (currentFilter) {
      case 'oggi': return 'Oggi';
      case 'settimana': return 'Settimana';
      case 'mese': return 'Mese';
      default: return 'Totali';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">
              Ordini {getFilterLabel()}
            </p>
            <p className="text-3xl font-bold text-gray-800 mt-2">{stats.ordersCount}</p>
          </div>
          <ShoppingCart className="w-8 h-8 text-green-500" />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">
              Fatturato {getFilterLabel()}
            </p>
            <p className="text-3xl font-bold text-gray-800 mt-2">€{stats.revenue.toFixed(2)}</p>
          </div>
          <Euro className="w-8 h-8 text-blue-500" />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">Ordine Medio</p>
            <p className="text-3xl font-bold text-gray-800 mt-2">€{stats.averageOrder.toFixed(2)}</p>
          </div>
          <TrendingUp className="w-8 h-8 text-purple-500" />
        </div>
      </div>

      <div 
        className="bg-white rounded-xl shadow-md p-6 border-l-4 border-orange-500 cursor-pointer hover:shadow-lg transition"
        onClick={onCustomersClick}
      >
        <div className="flex justify-between items-start">
          <div>
            <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">Totale Clienti</p>
            <p className="text-3xl font-bold text-gray-800 mt-2">{stats.uniqueCustomers}</p>
          </div>
          <Users className="w-8 h-8 text-orange-500" />
        </div>
      </div>
    </div>
  );
}