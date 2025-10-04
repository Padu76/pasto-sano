import { X, Phone, Mail, MessageCircle } from 'lucide-react';
import { Customer } from '@/lib/firebase';

interface CustomersModalProps {
  isOpen: boolean;
  onClose: () => void;
  customers: Customer[];
  onWhatsAppClick: (phone: string) => void;
  formatDate: (date: any) => string;
}

export default function CustomersModal({
  isOpen,
  onClose,
  customers,
  onWhatsAppClick,
  formatDate
}: CustomersModalProps) {
  if (!isOpen) return null;

  const exportToCSV = () => {
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
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Elenco Clienti ({customers.length})</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          {customers.map((customer, idx) => (
            <div key={idx} className="border rounded-lg p-4 hover:shadow-md transition">
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
                      onClick={() => onWhatsAppClick(customer.phone)}
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
                  customer.totalOrders >= 5 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {customer.totalOrders >= 5 ? 'VIP' : 'Nuovo'}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button 
            onClick={exportToCSV}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            Esporta CSV
          </button>
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
          >
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
}