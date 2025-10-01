'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Package, Clock, Phone, Mail, Home, Printer, Download } from 'lucide-react';

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('');

  useEffect(() => {
    // Recupera i dettagli dall'URL o dal sessionStorage
    const sessionId = searchParams.get('session_id');
    const source = searchParams.get('source');
    const method = searchParams.get('method') || source;
    
    // Recupera i dettagli dell'ordine dal sessionStorage
    const savedOrder = sessionStorage.getItem('lastOrder');
    
    if (savedOrder) {
      const order = JSON.parse(savedOrder);
      setOrderDetails(order);
    }

    // Determina il metodo di pagamento
    if (method === 'stripe') {
      setPaymentMethod('Carta di Credito/Debito');
    } else if (method === 'paypal') {
      setPaymentMethod('PayPal');
    } else if (method === 'cash') {
      setPaymentMethod('Contanti alla Consegna');
    } else {
      setPaymentMethod('Online');
    }

    // Pulisci il carrello
    localStorage.removeItem('cart');
    sessionStorage.removeItem('checkoutData');
    
    setLoading(false);

    // Invia evento di conversione (per analytics)
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'purchase', {
        value: orderDetails?.totalAmount || 0,
        currency: 'EUR',
        transaction_id: sessionId || Date.now().toString()
      });
    }
  }, [searchParams]);

  const generateOrderNumber = () => {
    return `PS-${Date.now().toString().slice(-8)}`;
  };

  const printOrder = () => {
    window.print();
  };

  const downloadReceipt = () => {
    // Genera un PDF o testo con i dettagli dell'ordine
    const orderNumber = generateOrderNumber();
    const receiptText = `
PASTO SANO - RICEVUTA ORDINE
============================
Numero Ordine: ${orderNumber}
Data: ${new Date().toLocaleDateString('it-IT')}
Ora: ${new Date().toLocaleTimeString('it-IT')}

CLIENTE
-------
${orderDetails?.customerName || 'Cliente'}
Tel: ${orderDetails?.customerPhone || 'N/D'}
Email: ${orderDetails?.customerEmail || 'N/D'}

ORDINE
------
${orderDetails?.items?.map((item: any) => 
  `${item.name} x${item.quantity} = €${(item.price * item.quantity).toFixed(2)}`
).join('\n') || 'Dettagli non disponibili'}

TOTALE: €${orderDetails?.totalAmount?.toFixed(2) || '0.00'}

PAGAMENTO: ${paymentMethod}
RITIRO: ${orderDetails?.pickupDate || 'Da concordare'}

Grazie per il tuo ordine!
www.pastosano.it
    `;

    const blob = new Blob([receiptText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ricevuta_${orderNumber}.txt`;
    a.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Elaborazione ordine...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-green-500 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <CheckCircle className="w-20 h-20 mx-auto mb-6 animate-bounce" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Ordine Confermato! 🎉
          </h1>
          <p className="text-xl opacity-95">
            Grazie per aver scelto Pasto Sano
          </p>
        </div>
      </div>

      {/* Order Details */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Order Header */}
          <div className="bg-gradient-to-r from-green-100 to-blue-100 p-6 border-b">
            <div className="flex justify-between items-start flex-wrap gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Numero Ordine</p>
                <p className="text-2xl font-bold text-gray-800">{generateOrderNumber()}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 mb-1">Data Ordine</p>
                <p className="text-lg font-semibold text-gray-800">
                  {new Date().toLocaleDateString('it-IT', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-green-600" />
              Dettagli Consegna
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Nome Cliente</p>
                <p className="font-semibold text-gray-800">
                  {orderDetails?.customerName || 'Cliente Pasto Sano'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Telefono</p>
                <p className="font-semibold text-gray-800 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  {orderDetails?.customerPhone || 'Da fornire'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Email</p>
                <p className="font-semibold text-gray-800 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {orderDetails?.customerEmail || 'Da fornire'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Data Ritiro</p>
                <p className="font-semibold text-gray-800 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {orderDetails?.pickupDate || 'Da concordare'}
                </p>
              </div>
            </div>
          </div>

          {/* Order Items */}
          {orderDetails?.items && orderDetails.items.length > 0 && (
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Riepilogo Ordine</h2>
              <div className="space-y-3">
                {orderDetails.items.map((item: any, index: number) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b last:border-0">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">{item.name}</p>
                      <p className="text-sm text-gray-600">Quantità: {item.quantity}</p>
                    </div>
                    <p className="font-bold text-gray-800">
                      €{(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Payment Summary */}
          <div className="p-6 bg-gray-50">
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Metodo di Pagamento</p>
                <p className="font-semibold text-gray-800">
                  {paymentMethod === 'Contanti alla Consegna' ? '💰' : '💳'} {paymentMethod}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 mb-1">Totale Pagato</p>
                <p className="text-3xl font-bold text-green-600">
                  €{orderDetails?.totalAmount?.toFixed(2) || '0.00'}
                </p>
              </div>
            </div>

            {paymentMethod === 'Contanti alla Consegna' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                <p className="text-sm text-yellow-800">
                  <strong>Nota:</strong> Preparare l'importo esatto di €{orderDetails?.totalAmount?.toFixed(2)} in contanti per il ritiro.
                </p>
              </div>
            )}
          </div>

          {/* Next Steps */}
          <div className="p-6 bg-green-50">
            <h3 className="font-bold text-gray-800 mb-3">Prossimi Passi:</h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-1">✓</span>
                <span>Riceverai una email di conferma con tutti i dettagli</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-1">✓</span>
                <span>Il tuo ordine sarà pronto per il ritiro nella data indicata</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-1">✓</span>
                <span>Per modifiche o cancellazioni, contattaci entro 24 ore</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="p-6 bg-white border-t">
            <div className="flex flex-wrap gap-4 justify-center">
              <button
                onClick={printOrder}
                className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
              >
                <Printer className="w-5 h-5" />
                Stampa Ordine
              </button>
              <button
                onClick={downloadReceipt}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <Download className="w-5 h-5" />
                Scarica Ricevuta
              </button>
              <Link
                href="/"
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg hover:from-green-700 hover:to-green-600 transition"
              >
                <Home className="w-5 h-5" />
                Torna alla Home
              </Link>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="mt-8 text-center text-gray-600">
          <p className="mb-2">Hai domande sul tuo ordine?</p>
          <div className="flex justify-center gap-6 flex-wrap">
            <a href="tel:+393331234567" className="flex items-center gap-2 hover:text-green-600 transition">
              <Phone className="w-4 h-4" />
              +39 333 123 4567
            </a>
            <a href="mailto:ordini@pastosano.it" className="flex items-center gap-2 hover:text-green-600 transition">
              <Mail className="w-4 h-4" />
              ordini@pastosano.it
            </a>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          .no-print {
            display: none;
          }
          body {
            background: white;
          }
        }
      `}</style>
    </div>
  );
}