import { X } from 'lucide-react';

interface Rider {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive';
}

interface RiderModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingRider: Rider | null;
  formData: {
    name: string;
    email: string;
    phone: string;
    password: string;
  };
  onFormChange: (data: { name: string; email: string; phone: string; password: string }) => void;
  onSave: () => void;
}

export default function RiderModal({
  isOpen,
  onClose,
  editingRider,
  formData,
  onFormChange,
  onSave
}: RiderModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {editingRider ? 'Modifica Rider' : 'Nuovo Rider'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => onFormChange({ ...formData, name: e.target.value })}
              className="w-full p-3 border rounded-lg focus:outline-none focus:border-green-500"
              placeholder="Mario Rossi"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => onFormChange({ ...formData, email: e.target.value })}
              className="w-full p-3 border rounded-lg focus:outline-none focus:border-green-500"
              placeholder="mario@pastosano.it"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Telefono</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => onFormChange({ ...formData, phone: e.target.value })}
              className="w-full p-3 border rounded-lg focus:outline-none focus:border-green-500"
              placeholder="333 1234567"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password {editingRider && '(lascia vuoto per non cambiare)'}
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => onFormChange({ ...formData, password: e.target.value })}
              className="w-full p-3 border rounded-lg focus:outline-none focus:border-green-500"
              placeholder="••••••••"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onSave}
            className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            {editingRider ? 'Aggiorna' : 'Crea Rider'}
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