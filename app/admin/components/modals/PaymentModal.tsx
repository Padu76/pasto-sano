import { X, Clock } from 'lucide-react';

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

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: RiderPayment | null;
  notes: string;
  onNotesChange: (notes: string) => void;
  onConfirm: () => void;
}

export default function PaymentModal({
  isOpen,
  onClose,
  payment,
  notes,
  onNotesChange,
  onConfirm
}: PaymentModalProps) {
  if (!isOpen || !payment) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Conferma Pagamento</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-bold text-lg mb-2">{payment.riderName}</h3>
          <p className="text-sm text-gray-600 mb-3 flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {payment.period.label}
          </p>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Consegne completate:</span>
              <span className="font-semibold">{payment.totalDeliveries}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Distanza totale:</span>
              <span className="font-semibold">{payment.totalDistance.toFixed(1)} km</span>
            </div>
            <div className="flex justify-between pt-2 border-t">
              <span className="font-medium text-gray-700">Importo da pagare:</span>
              <span className="font-bold text-green-600 text-xl">€{payment.totalEarnings.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Note (opzionale)</label>
          <textarea
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            className="w-full p-3 border rounded-lg focus:outline-none focus:border-green-500"
            rows={3}
            placeholder="Es: Pagato con bonifico, riferimento #12345"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
          >
            Conferma Pagamento
          </button>
          <button
            onClick={onClose}
            className="px-4 py-3 border rounded-lg hover:bg-gray-50 transition"
          >
            Annulla
          </button>
        </div>
      </div>
    </div>
  );
}