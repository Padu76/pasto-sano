import { Line } from 'react-chartjs-2';
import { Order } from '@/lib/firebase';

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
  const totalRevenue = analyticsOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const averageOrder = analyticsOrders.length > 0 ? totalRevenue / analyticsOrders.length : 0;

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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
          <p className="text-sm opacity-90 mb-1">Ordini Periodo</p>
          <p className="text-3xl font-bold">{analyticsOrders.length}</p>
        </div>
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <p className="text-sm opacity-90 mb-1">Fatturato</p>
          <p className="text-3xl font-bold">€{totalRevenue.toFixed(2)}</p>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <p className="text-sm opacity-90 mb-1">Ordine Medio</p>
          <p className="text-3xl font-bold">€{averageOrder.toFixed(2)}</p>
        </div>
      </div>

      <div className="h-96">
        <Line data={chartData} options={chartOptions} />
      </div>
    </div>
  );
}