import { Download, Wallet, Clock, CheckCircle } from 'lucide-react';

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

interface PaymentsTabProps {
  payments: RiderPayment[];
  paymentPeriodType: 'week' | 'month' | 'custom';
  customStartDate: string;
  customEndDate: string;
  onPeriodTypeChange: (type: 'week' | 'month' | 'custom') => void;
  onCustomStartDateChange: (date: string) => void;
  onCustomEndDateChange: (date: string) => void;
  onApplyCustomPeriod: () => void;
  onMarkAsPaid: (payment: RiderPayment) => void;
  onExportCSV: () => void;
}

export default function PaymentsTab({
  payments,
  paymentPeriodType,
  customStartDate,
  customEndDate,
  onPeriodTypeChange,
  onCustomStartDateChange,
  onCustomEndDateChange,
  onApplyCustomPeriod,
  onMarkAsPaid,
  onExportCSV
}: PaymentsTabProps) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Pagamenti Rider</h2>
        <button
          onClick={onExportCSV}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
        >
          <Download className="w-5 h-5" />
          Export CSV
        </button>
      </div>

      <div className="flex gap-2 mb-6 items-center flex-wrap">
        {(['month', 'week', 'custom'] as const).map(type => (
          <button
            key={type}
            onClick={() => onPeriodTypeChange(type)}
            className={`px-4 py-2 rounded-lg transition text-sm font-medium ${
              paymentPeriodType === type ? 'bg-green-600 text-white' : 'border hover:bg-gray-50'
            }`}
          >
            {type === 'month' ? 'Mese Corrente' : type === 'week' ? 'Settimana Corrente' : 'Periodo Custom'}
          </button>
        ))}

        {paymentPeriodType === 'custom' && (
          <div className="flex gap-2 items-center">
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => onCustomStartDateChange(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm"
            />
            <span className="text-gray-500">-</span>
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => onCustomEndDateChange(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm"
            />
            <button
              onClick={onApplyCustomPeriod}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
            >
              Applica
            </button>
          </div>
        )}
      </div>

      {payments.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Wallet className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Nessun pagamento trovato per questo periodo</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {payments.map((payment, idx) => (
            <div key={idx} className="border rounded-lg p-4 hover:shadow-md transition">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-lg text-gray-800">{payment.riderName}</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    <Clock className="w-3 h-3 inline mr-1" />
                    {payment.period.label}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  payment.status === 'paid' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {payment.status === 'paid' ? 'Pagato' : 'Da Pagare'}
                </span>
              </div>

              <div className="bg-gray-50 rounded p-3 mb-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Consegne:</span>
                  <span className="font-semibold">{payment.totalDeliveries}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Distanza totale:</span>
                  <span className="font-semibold">{payment.totalDistance.toFixed(1)} km</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-gray-700 font-medium">Totale da pagare:</span>
                  <span className="font-bold text-green-600 text-lg">€{payment.totalEarnings.toFixed(2)}</span>
                </div>
              </div>

              {payment.status === 'pending' && (
                <button
                  onClick={() => onMarkAsPaid(payment)}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Segna come Pagato
                </button>
              )}

              {payment.status === 'paid' && (
                <div className="text-center text-sm text-green-600 font-medium py-2">
                  <CheckCircle className="w-4 h-4 inline mr-1" />
                  Pagamento Completato
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}