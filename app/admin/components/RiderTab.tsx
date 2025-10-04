import { UserPlus, Edit, CheckCircle, XCircle } from 'lucide-react';

interface Rider {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive';
  createdAt: Date;
  stats?: {
    totalDeliveries: number;
    totalEarnings: number;
    averageDistance: number;
  };
}

interface RiderTabProps {
  riders: Rider[];
  onAddRider: () => void;
  onEditRider: (rider: Rider) => void;
  onToggleStatus: (riderId: string, currentStatus: string) => void;
}

export default function RiderTab({
  riders,
  onAddRider,
  onEditRider,
  onToggleStatus
}: RiderTabProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Gestione Rider</h2>
          <button
            onClick={onAddRider}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
          >
            <UserPlus className="w-5 h-5" />
            Aggiungi Rider
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {riders.map(rider => (
            <div key={rider.id} className="border rounded-lg p-4 hover:shadow-md transition">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-lg text-gray-800">{rider.name}</h3>
                  <p className="text-sm text-gray-600">{rider.email}</p>
                  <p className="text-sm text-gray-600">{rider.phone}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  rider.status === 'active' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {rider.status === 'active' ? 'Attivo' : 'Inattivo'}
                </span>
              </div>

              {rider.stats && (
                <div className="bg-gray-50 rounded p-3 mb-3 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Consegne:</span>
                    <span className="font-semibold">{rider.stats.totalDeliveries}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Guadagni:</span>
                    <span className="font-semibold text-green-600">€{rider.stats.totalEarnings.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Media km:</span>
                    <span className="font-semibold">{rider.stats.averageDistance.toFixed(1)} km</span>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => onEditRider(rider)}
                  className="flex-1 px-3 py-2 border rounded-lg hover:bg-gray-50 transition text-sm flex items-center justify-center gap-1"
                >
                  <Edit className="w-4 h-4" />
                  Modifica
                </button>
                <button
                  onClick={() => onToggleStatus(rider.id, rider.status)}
                  className={`flex-1 px-3 py-2 rounded-lg transition text-sm flex items-center justify-center gap-1 ${
                    rider.status === 'active' 
                      ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  {rider.status === 'active' ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                  {rider.status === 'active' ? 'Disabilita' : 'Attiva'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}