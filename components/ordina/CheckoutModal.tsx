'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  CreditCard, 
  Smartphone, 
  Banknote,
  Calendar,
  MapPin,
  Phone,
  Mail,
  User,
  AlertCircle,
  Loader2,
  Check,
  Tag,
  Clock,
  MessageSquare,
  FileText,
  Building2,
  Home,
  Truck,
  Store
} from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { MenuItem } from '@/lib/menuRotativo';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const initialPayPalOptions = {
  clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
  currency: "EUR",
  intent: "capture",
  locale: "it_IT"
};

// Indirizzo di partenza per calcolo distanze
const STORE_ADDRESS = 'Via Bionde, 8, 37139 Verona VR, Italy';

interface CartItem extends MenuItem {
  id: string;
  quantity: number;
  comboItems?: {
    primo?: string;
    secondo?: string;
    contorno?: string;
    macedonia?: boolean;
  };
}

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onOrderComplete: () => void;
  minimumItems?: number;
}

interface DeliveryZone {
  zone: '1-3km' | '3-6km' | '6-10km';
  cost: number;
  riderShare: number;
  platformShare: number;
}

export default function CheckoutModal({ 
  isOpen, 
  onClose, 
  items, 
  onOrderComplete,
  minimumItems = 3
}: CheckoutModalProps) {

  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [notes, setNotes] = useState('');
  
  const [fiscalCode, setFiscalCode] = useState('');
  const [address, setAddress] = useState('');
  const [cap, setCap] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  
  // Delivery states
  const [deliveryType, setDeliveryType] = useState<'pickup' | 'delivery'>('pickup');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryAddressDetails, setDeliveryAddressDetails] = useState('');
  const [deliveryCity, setDeliveryCity] = useState('Verona');
  const [deliveryCap, setDeliveryCap] = useState('');
  const [isCalculatingDistance, setIsCalculatingDistance] = useState(false);
  const [deliveryZone, setDeliveryZone] = useState<DeliveryZone | null>(null);
  const [deliveryDistance, setDeliveryDistance] = useState<number | null>(null);
  const [deliveryError, setDeliveryError] = useState<string | null>(null);
  
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<{ code: string; percent: number; description: string; singleUse?: boolean } | null>(null);
  const [discountError, setDiscountError] = useState('');
  const [isCheckingDiscount, setIsCheckingDiscount] = useState(false);
  
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'paypal' | 'cash' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [minPickupDate, setMinPickupDate] = useState('');

  const calculateMinPickupDate = () => {
    const today = new Date();
    let minDate = new Date(today);
    
    let daysAdded = 0;
    while (daysAdded < 2) {
      minDate.setDate(minDate.getDate() + 1);
      const dayOfWeek = minDate.getDay();
      
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        daysAdded++;
      }
    }
    
    return minDate;
  };

  const formatDateForInput = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const isWeekend = (date: Date) => {
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  const getDayName = (date: Date) => {
    const days = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];
    return days[date.getDay()];
  };

  useEffect(() => {
    const minDate = calculateMinPickupDate();
    const minDateString = formatDateForInput(minDate);
    setMinPickupDate(minDateString);
    setPickupDate(minDateString);
  }, []);

  // Calcola zona e costo delivery in base a distanza
  const calculateDeliveryZone = (distanceKm: number): DeliveryZone | null => {
    if (distanceKm <= 3) {
      return {
        zone: '1-3km',
        cost: 3.50,
        riderShare: 2.45, // 70%
        platformShare: 1.05 // 30%
      };
    } else if (distanceKm <= 6) {
      return {
        zone: '3-6km',
        cost: 4.90,
        riderShare: 3.43, // 70%
        platformShare: 1.47 // 30%
      };
    } else if (distanceKm <= 10) {
      return {
        zone: '6-10km',
        cost: 6.90,
        riderShare: 4.83, // 70%
        platformShare: 2.07 // 30%
      };
    }
    return null;
  };

  // Calcola distanza usando Google Maps Distance Matrix API
  const calculateDeliveryDistance = async () => {
    if (!deliveryAddress || !deliveryCap) {
      setDeliveryError('Inserisci indirizzo completo e CAP');
      return;
    }

    setIsCalculatingDistance(true);
    setDeliveryError(null);

    try {
      const destination = `${deliveryAddress}, ${deliveryCity}, ${deliveryCap}, Italy`;
      
      const response = await fetch('/api/calculate-distance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          origin: STORE_ADDRESS,
          destination: destination
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Errore nel calcolo della distanza');
      }

      const distanceKm = data.distance;
      setDeliveryDistance(distanceKm);

      const zone = calculateDeliveryZone(distanceKm);
      
      if (!zone) {
        setDeliveryError(`Distanza ${distanceKm.toFixed(1)}km - Consegna non disponibile oltre 10km`);
        setDeliveryZone(null);
        return;
      }

      setDeliveryZone(zone);
      setDeliveryError(null);

    } catch (error: any) {
      console.error('Errore calcolo distanza:', error);
      setDeliveryError(error.message || 'Errore nel calcolo della distanza');
      setDeliveryZone(null);
      setDeliveryDistance(null);
    } finally {
      setIsCalculatingDistance(false);
    }
  };

  const getOriginalPrice = () => {
    return items.reduce((total, item) => total + (item.prezzo * item.quantity), 0);
  };

  const getDiscountAmount = () => {
    if (!appliedDiscount) return 0;
    return (getOriginalPrice() * appliedDiscount.percent) / 100;
  };

  const getDeliveryCost = () => {
    return deliveryType === 'delivery' && deliveryZone ? deliveryZone.cost : 0;
  };

  const getTotalPrice = () => {
    return Math.max(0, getOriginalPrice() - getDiscountAmount() + getDeliveryCost());
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const validateFiscalCode = (code: string): boolean => {
    const fiscalCodeRegex = /^[A-Z]{6}[0-9]{2}[A-Z][0-9]{2}[A-Z][0-9]{3}[A-Z]$/i;
    return fiscalCodeRegex.test(code);
  };

  const validateCAP = (cap: string): boolean => {
    return /^\d{5}$/.test(cap);
  };

  const validateProvince = (prov: string): boolean => {
    return /^[A-Z]{2}$/i.test(prov);
  };

  const applyDiscountCode = async () => {
    const code = discountCode.toUpperCase().trim();
    
    if (!code) {
      setDiscountError('Inserisci un codice sconto');
      return;
    }

    setIsCheckingDiscount(true);
    setDiscountError('');

    try {
      const response = await fetch('/api/check-discount', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          email: customerEmail || null,
          phone: customerPhone || null
        })
      });

      const result = await response.json();

      if (result.valid) {
        setAppliedDiscount({
          code: result.code,
          percent: result.percent,
          description: result.description,
          singleUse: result.singleUse
        });
        setDiscountError('');
        setDiscountCode('');
      } else {
        setDiscountError(result.message || result.error || 'Codice sconto non valido');
        setAppliedDiscount(null);
      }
    } catch (error) {
      console.error('Errore verifica codice:', error);
      setDiscountError('Errore durante la verifica del codice');
      setAppliedDiscount(null);
    } finally {
      setIsCheckingDiscount(false);
    }
  };

  const removeDiscount = () => {
    setAppliedDiscount(null);
    setDiscountCode('');
    setDiscountError('');
  };

  const validateForm = () => {
    if (!customerName || !customerPhone || !pickupDate) {
      setError('Compila tutti i campi obbligatori');
      return false;
    }

    // Validazione delivery
    if (deliveryType === 'delivery') {
      if (!deliveryAddress || !deliveryCap || !deliveryCity) {
        setError('Inserisci indirizzo di consegna completo');
        return false;
      }

      if (!deliveryZone) {
        setError('Calcola prima la distanza di consegna');
        return false;
      }
    }
    
    if (paymentMethod === 'stripe' || paymentMethod === 'paypal') {
      if (!fiscalCode || !address || !cap || !city || !province) {
        setError('Per i pagamenti online è obbligatorio compilare tutti i dati di fatturazione');
        return false;
      }
      
      if (!validateFiscalCode(fiscalCode)) {
        setError('Codice Fiscale non valido (formato: RSSMRA85M01H501Z)');
        return false;
      }
      
      if (!validateCAP(cap)) {
        setError('CAP non valido (5 cifre)');
        return false;
      }
      
      if (!validateProvince(province)) {
        setError('Provincia non valida (2 lettere, es: VR)');
        return false;
      }
      
      if (!customerEmail) {
        setError('Email obbligatoria per ricevere la fattura');
        return false;
      }
    }

    // Consegna a domicilio: solo pagamenti online
    if (deliveryType === 'delivery' && paymentMethod === 'cash') {
      setError('Per la consegna a domicilio è necessario il pagamento online');
      return false;
    }
    
    const selectedDate = new Date(pickupDate);
    if (isWeekend(selectedDate)) {
      setError('Il ritiro non è disponibile nel weekend. Seleziona un giorno feriale.');
      return false;
    }
    
    const minDate = new Date(minPickupDate);
    if (selectedDate < minDate) {
      setError(`La data minima per il ritiro è ${minDate.toLocaleDateString('it-IT')}`);
      return false;
    }
    
    if (getTotalItems() < minimumItems) {
      setError(`Ordine minimo: ${minimumItems} pezzi`);
      return false;
    }
    
    setError(null);
    return true;
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = new Date(e.target.value);
    
    if (isWeekend(selectedDate)) {
      setError('Il ritiro non è disponibile sabato e domenica');
      return;
    }
    
    setError(null);
    setPickupDate(e.target.value);
  };

  const getOrderMetadata = () => {
    const baseMetadata = {
      customerName,
      customerEmail: customerEmail || '',
      customerPhone,
      pickupDate,
      orderNotes: notes || '',
      discountCode: appliedDiscount ? appliedDiscount.code : '',
      discountPercent: appliedDiscount ? appliedDiscount.percent.toString() : '0',
      originalAmount: getOriginalPrice().toString(),
      fiscalCode,
      invoiceAddress: address,
      invoiceCap: cap,
      invoiceCity: city,
      invoiceProvince: province.toUpperCase(),
      requiresInvoice: 'true',
      orderItems: JSON.stringify(items.map(item => ({
        name: item.nome,
        description: item.descrizione || '',
        price: item.prezzo,
        quantity: item.quantity
      })))
    };

    if (deliveryType === 'delivery' && deliveryZone && deliveryDistance) {
      return {
        ...baseMetadata,
        deliveryEnabled: 'true',
        deliveryAddress: `${deliveryAddress}, ${deliveryCity}, ${deliveryCap}`,
        deliveryAddressDetails: deliveryAddressDetails || '',
        deliveryDistance: deliveryDistance.toFixed(2),
        deliveryZone: deliveryZone.zone,
        deliveryCost: deliveryZone.cost.toFixed(2),
        deliveryRiderShare: deliveryZone.riderShare.toFixed(2),
        deliveryPlatformShare: deliveryZone.platformShare.toFixed(2),
        deliveryStatus: 'pending'
      };
    }

    return {
      ...baseMetadata,
      deliveryEnabled: 'false',
      customerAddress: 'Ritiro presso Pasto Sano'
    };
  };

  const handleStripeCheckout = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const stripeData = {
        items: items.map(item => ({
          name: item.nome,
          description: item.descrizione || '',
          image: item.immagine || '',
          price: item.prezzo,
          quantity: item.quantity
        })),
        customerEmail,
        customerName,
        customerPhone,
        customerAddress: deliveryType === 'delivery' 
          ? `${deliveryAddress}, ${deliveryCity}, ${deliveryCap}`
          : 'Ritiro presso Pasto Sano',
        metadata: getOrderMetadata()
      };

      // Aggiungi costo consegna come item separato se necessario
      if (deliveryType === 'delivery' && deliveryZone) {
        stripeData.items.push({
          name: 'Consegna a domicilio',
          description: `Zona ${deliveryZone.zone} - ${deliveryDistance?.toFixed(1)}km`,
          image: '',
          price: deliveryZone.cost,
          quantity: 1
        });
      }

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(stripeData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Errore durante il checkout');
      }

      const { sessionId } = await response.json();
      
      if (appliedDiscount && appliedDiscount.singleUse) {
        try {
          await fetch('/api/use-discount', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              code: appliedDiscount.code,
              email: customerEmail,
              phone: customerPhone,
              customerName,
              orderId: sessionId
            })
          });
        } catch (discountError) {
          console.error('Errore registrazione uso sconto:', discountError);
        }
      }
      
      const stripe = await stripePromise;
      
      if (stripe) {
        const { error } = await stripe.redirectToCheckout({ sessionId });
        if (error) {
          throw new Error(error.message);
        }
      }
    } catch (error: any) {
      setError(error.message || 'Errore durante il pagamento');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayPalApprove = async (_data: any, actions: any) => {
    setIsLoading(true);
    try {
      await actions.order.capture();
      
      if (appliedDiscount && appliedDiscount.singleUse) {
        try {
          await fetch('/api/use-discount', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              code: appliedDiscount.code,
              email: customerEmail,
              phone: customerPhone,
              customerName,
              orderId: _data.orderID
            })
          });
        } catch (discountError) {
          console.error('Errore registrazione uso sconto:', discountError);
        }
      }
      
      onOrderComplete();
      window.location.href = '/success?method=paypal';
    } catch (error: any) {
      setError('Errore durante il pagamento PayPal');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCashOrder = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/cash-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerName,
          customerPhone,
          customerEmail,
          customerAddress: 'Ritiro presso Pasto Sano',
          pickupDate,
          items: items.map(item => ({
            name: item.nome,
            price: item.prezzo,
            quantity: item.quantity
          })),
          totalAmount: getTotalPrice(),
          notes: appliedDiscount ? 
            `${notes || ''}\n\nSconto applicato: ${appliedDiscount.description} (-€${getDiscountAmount().toFixed(2)})` : 
            notes
        }),
      });

      if (!response.ok) {
        throw new Error('Errore nell\'invio dell\'ordine');
      }
      
      if (appliedDiscount && appliedDiscount.singleUse) {
        try {
          const result = await response.json();
          await fetch('/api/use-discount', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              code: appliedDiscount.code,
              email: customerEmail,
              phone: customerPhone,
              customerName,
              orderId: result.orderId
            })
          });
        } catch (discountError) {
          console.error('Errore registrazione uso sconto:', discountError);
        }
      }
      
      onOrderComplete();
      window.location.href = '/success?method=cash';
      
    } catch (error: any) {
      setError(error.message || 'Errore durante l\'invio dell\'ordine');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <PayPalScriptProvider options={initialPayPalOptions}>
      <>
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => !isLoading && onClose()}
        />
        
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="relative bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10">
              <h2 className="text-2xl font-bold text-gray-800">Checkout</h2>
              <button
                onClick={onClose}
                disabled={isLoading}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <div className="p-6">
              {!paymentMethod ? (
                <>
                  {/* Toggle Ritiro/Consegna */}
                  <div className="mb-6 bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-200 rounded-xl p-5">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">Modalità di ritiro</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => {
                          setDeliveryType('pickup');
                          setDeliveryZone(null);
                          setDeliveryDistance(null);
                          setDeliveryError(null);
                        }}
                        className={`p-4 border-2 rounded-lg transition-all ${
                          deliveryType === 'pickup'
                            ? 'border-orange-500 bg-orange-50 shadow-md'
                            : 'border-gray-300 bg-white hover:border-orange-300'
                        }`}
                      >
                        <Store className={`w-6 h-6 mx-auto mb-2 ${
                          deliveryType === 'pickup' ? 'text-orange-600' : 'text-gray-500'
                        }`} />
                        <div className="font-semibold">Ritiro in sede</div>
                        <div className="text-xs text-gray-500 mt-1">Via Bionde, 8</div>
                      </button>
                      
                      <button
                        onClick={() => setDeliveryType('delivery')}
                        className={`p-4 border-2 rounded-lg transition-all ${
                          deliveryType === 'delivery'
                            ? 'border-blue-500 bg-blue-50 shadow-md'
                            : 'border-gray-300 bg-white hover:border-blue-300'
                        }`}
                      >
                        <Truck className={`w-6 h-6 mx-auto mb-2 ${
                          deliveryType === 'delivery' ? 'text-blue-600' : 'text-gray-500'
                        }`} />
                        <div className="font-semibold">Consegna a domicilio</div>
                        <div className="text-xs text-gray-500 mt-1">€3.50 - €6.90</div>
                      </button>
                    </div>
                  </div>

                  {/* Form consegna se delivery selezionato */}
                  {deliveryType === 'delivery' && (
                    <div className="mb-6 bg-blue-50 border-2 border-blue-200 rounded-xl p-5">
                      <div className="flex items-center gap-2 mb-4">
                        <Truck className="w-5 h-5 text-blue-600" />
                        <h3 className="text-lg font-semibold text-gray-800">Indirizzo di consegna</h3>
                      </div>
                      
                      <div className="space-y-3 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Via e numero civico *
                          </label>
                          <input
                            type="text"
                            value={deliveryAddress}
                            onChange={(e) => setDeliveryAddress(e.target.value)}
                            className="w-full p-3 border rounded-lg focus:outline-none focus:border-blue-500"
                            placeholder="Via Roma, 123"
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Città *
                            </label>
                            <input
                              type="text"
                              value={deliveryCity}
                              onChange={(e) => setDeliveryCity(e.target.value)}
                              className="w-full p-3 border rounded-lg focus:outline-none focus:border-blue-500"
                              placeholder="Verona"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              CAP *
                            </label>
                            <input
                              type="text"
                              value={deliveryCap}
                              onChange={(e) => setDeliveryCap(e.target.value.replace(/\D/g, '').slice(0, 5))}
                              className="w-full p-3 border rounded-lg focus:outline-none focus:border-blue-500"
                              placeholder="37100"
                              maxLength={5}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Dettagli aggiuntivi (opzionale)
                          </label>
                          <input
                            type="text"
                            value={deliveryAddressDetails}
                            onChange={(e) => setDeliveryAddressDetails(e.target.value)}
                            className="w-full p-3 border rounded-lg focus:outline-none focus:border-blue-500"
                            placeholder="Scala, piano, citofono..."
                          />
                        </div>
                      </div>

                      <button
                        onClick={calculateDeliveryDistance}
                        disabled={isCalculatingDistance || !deliveryAddress || !deliveryCap}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {isCalculatingDistance ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Calcolo in corso...</span>
                          </>
                        ) : (
                          <>
                            <MapPin className="w-5 h-5" />
                            <span>Calcola distanza e costo</span>
                          </>
                        )}
                      </button>

                      {deliveryError && (
                        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                          {deliveryError}
                        </div>
                      )}

                      {deliveryZone && deliveryDistance && (
                        <div className="mt-4 bg-white rounded-lg p-4 border-2 border-green-200">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Check className="w-5 h-5 text-green-600" />
                              <span className="font-semibold text-green-700">Consegna disponibile!</span>
                            </div>
                          </div>
                          <div className="text-sm space-y-1">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Distanza:</span>
                              <span className="font-medium">{deliveryDistance.toFixed(1)} km</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Zona:</span>
                              <span className="font-medium">{deliveryZone.zone}</span>
                            </div>
                            <div className="flex justify-between border-t pt-2 mt-2">
                              <span className="font-semibold">Costo consegna:</span>
                              <span className="font-bold text-blue-600">€{deliveryZone.cost.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <p className="text-sm text-amber-800">
                          <strong>Nota:</strong> Per la consegna a domicilio è necessario il pagamento online (carta o PayPal)
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          <User className="w-4 h-4 inline mr-1" />
                          Nome e Cognome *
                        </label>
                        <input
                          type="text"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          className="w-full p-3 border rounded-lg focus:outline-none focus:border-orange-500"
                          placeholder="Mario Rossi"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          <Phone className="w-4 h-4 inline mr-1" />
                          Telefono *
                        </label>
                        <input
                          type="tel"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          className="w-full p-3 border rounded-lg focus:outline-none focus:border-orange-500"
                          placeholder="333 1234567"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <Mail className="w-4 h-4 inline mr-1" />
                        Email *
                      </label>
                      <input
                        type="email"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        className="w-full p-3 border rounded-lg focus:outline-none focus:border-orange-500"
                        placeholder="mario.rossi@email.com"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">Riceverai la fattura via email</p>
                    </div>

                    <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-5 mt-6">
                      <div className="flex items-center gap-2 mb-4">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <h3 className="text-lg font-semibold text-gray-800">Dati Fatturazione</h3>
                      </div>
                      <p className="text-sm text-blue-700 mb-4">
                        Obbligatori per pagamenti online (carta/PayPal)
                      </p>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            <Building2 className="w-4 h-4 inline mr-1" />
                            Codice Fiscale *
                          </label>
                          <input
                            type="text"
                            value={fiscalCode}
                            onChange={(e) => setFiscalCode(e.target.value.toUpperCase())}
                            className="w-full p-3 border rounded-lg focus:outline-none focus:border-blue-500 uppercase"
                            placeholder="RSSMRA85M01H501Z"
                            maxLength={16}
                          />
                          <p className="text-xs text-gray-500 mt-1">16 caratteri</p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            <Home className="w-4 h-4 inline mr-1" />
                            Indirizzo *
                          </label>
                          <input
                            type="text"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className="w-full p-3 border rounded-lg focus:outline-none focus:border-blue-500"
                            placeholder="Via Roma, 123"
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              CAP *
                            </label>
                            <input
                              type="text"
                              value={cap}
                              onChange={(e) => setCap(e.target.value.replace(/\D/g, '').slice(0, 5))}
                              className="w-full p-3 border rounded-lg focus:outline-none focus:border-blue-500"
                              placeholder="37100"
                              maxLength={5}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Città *
                            </label>
                            <input
                              type="text"
                              value={city}
                              onChange={(e) => setCity(e.target.value)}
                              className="w-full p-3 border rounded-lg focus:outline-none focus:border-blue-500"
                              placeholder="Verona"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Prov *
                            </label>
                            <input
                              type="text"
                              value={province}
                              onChange={(e) => setProvince(e.target.value.toUpperCase())}
                              className="w-full p-3 border rounded-lg focus:outline-none focus:border-blue-500 uppercase"
                              placeholder="VR"
                              maxLength={2}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Tag className="w-5 h-5 text-green-600" />
                        <label className="text-sm font-medium text-gray-700">
                          Hai un codice sconto?
                        </label>
                      </div>
                      
                      {!appliedDiscount ? (
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={discountCode}
                              onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                              placeholder="SCONTO5"
                              className="flex-1 p-2 border rounded-lg focus:outline-none focus:border-green-500"
                              disabled={isCheckingDiscount}
                            />
                            <button
                              onClick={applyDiscountCode}
                              disabled={isCheckingDiscount}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 flex items-center gap-2"
                            >
                              {isCheckingDiscount ? (
                                <>
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  <span>Verifica...</span>
                                </>
                              ) : (
                                <span>Applica</span>
                              )}
                            </button>
                          </div>
                          
                          {discountError && (
                            <p className="text-red-600 text-sm flex items-center gap-1">
                              <AlertCircle className="w-4 h-4" />
                              {discountError}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="bg-white rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-green-700 flex items-center gap-1">
                                <Check className="w-4 h-4" />
                                {appliedDiscount.description}
                              </p>
                              <p className="text-sm text-gray-600">
                                Risparmio: €{getDiscountAmount().toFixed(2)}
                              </p>
                            </div>
                            <button
                              onClick={removeDiscount}
                              className="text-red-500 hover:text-red-700 p-1"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Calendar className="w-5 h-5 text-amber-600" />
                        <label className="text-sm font-medium text-gray-700">
                          Data {deliveryType === 'delivery' ? 'Consegna' : 'Ritiro'} Ordine *
                        </label>
                      </div>
                      
                      <input
                        type="date"
                        value={pickupDate}
                        onChange={handleDateChange}
                        min={minPickupDate}
                        className="w-full p-3 border rounded-lg focus:outline-none focus:border-amber-500 mb-3"
                        required
                      />
                      
                      {pickupDate && (
                        <div className="bg-white rounded-lg p-3">
                          <p className="font-medium text-gray-800 flex items-center gap-1">
                            <Clock className="w-4 h-4 text-amber-600" />
                            {getDayName(new Date(pickupDate))}, {new Date(pickupDate).toLocaleDateString('it-IT')}
                          </p>
                          <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                            {deliveryType === 'delivery' ? (
                              <>
                                <Truck className="w-4 h-4 text-gray-500" />
                                Consegna a {deliveryAddress || 'indirizzo da specificare'}
                              </>
                            ) : (
                              <>
                                <MapPin className="w-4 h-4 text-gray-500" />
                                Ritiro presso Pasto Sano - Via Bionde, 8
                              </>
                            )}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <MessageSquare className="w-4 h-4 inline mr-1" />
                        Note aggiuntive
                      </label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full p-3 border rounded-lg focus:outline-none focus:border-orange-500"
                        rows={3}
                        placeholder="Allergie, intolleranze, orario preferito..."
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                      <AlertCircle className="w-5 h-5" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <h4 className="font-semibold mb-3">Riepilogo Ordine</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Articoli ({getTotalItems()})</span>
                        <span>€{getOriginalPrice().toFixed(2)}</span>
                      </div>
                      {appliedDiscount && (
                        <div className="flex justify-between text-green-600">
                          <span>Sconto {appliedDiscount.description}</span>
                          <span>-€{getDiscountAmount().toFixed(2)}</span>
                        </div>
                      )}
                      {deliveryType === 'delivery' && deliveryZone && (
                        <div className="flex justify-between text-blue-600">
                          <span>Consegna ({deliveryZone.zone})</span>
                          <span>+€{deliveryZone.cost.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold text-lg border-t pt-2">
                        <span>Totale</span>
                        <span className="text-orange-600">€{getTotalPrice().toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold mb-4">Scegli il metodo di pagamento</h3>
                  <div className="space-y-3">
                    <button
                      onClick={() => validateForm() && setPaymentMethod('stripe')}
                      disabled={isLoading}
                      className="w-full p-4 border-2 rounded-lg hover:border-blue-500 transition-colors flex items-center justify-center space-x-3 disabled:opacity-50"
                    >
                      <CreditCard className="w-6 h-6 text-blue-500" />
                      <div className="text-left">
                        <div className="font-semibold">Carta di Credito/Debito</div>
                        <div className="text-xs text-gray-500">Fattura elettronica inclusa</div>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => validateForm() && setPaymentMethod('paypal')}
                      disabled={isLoading}
                      className="w-full p-4 border-2 rounded-lg hover:border-yellow-500 transition-colors flex items-center justify-center space-x-3 disabled:opacity-50"
                    >
                      <Smartphone className="w-6 h-6 text-yellow-500" />
                      <div className="text-left">
                        <div className="font-semibold">PayPal</div>
                        <div className="text-xs text-gray-500">Fattura elettronica inclusa</div>
                      </div>
                    </button>
                    
                    {deliveryType === 'pickup' && (
                      <button
                        onClick={() => validateForm() && setPaymentMethod('cash')}
                        disabled={isLoading}
                        className="w-full p-4 border-2 rounded-lg hover:border-green-500 transition-colors flex items-center justify-center space-x-3 disabled:opacity-50"
                      >
                        <Banknote className="w-6 h-6 text-green-500" />
                        <div className="text-left">
                          <div className="font-semibold">Contanti al Ritiro</div>
                          <div className="text-xs text-gray-500">Senza fattura</div>
                        </div>
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  {paymentMethod === 'stripe' && (
                    <>
                      <h3 className="text-lg font-semibold">Pagamento con Carta</h3>
                      <p className="text-gray-600">Verrai reindirizzato a Stripe per il pagamento sicuro.</p>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-800 flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          Riceverai la fattura elettronica via email
                        </p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="font-semibold">Totale: €{getTotalPrice().toFixed(2)}</p>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={handleStripeCheckout}
                          disabled={isLoading}
                          className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              <span>Elaborazione...</span>
                            </>
                          ) : (
                            <>
                              <CreditCard className="w-5 h-5" />
                              <span>Paga ora</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => setPaymentMethod(null)}
                          disabled={isLoading}
                          className="px-6 py-3 border rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
                        >
                          Indietro
                        </button>
                      </div>
                    </>
                  )}

                  {paymentMethod === 'paypal' && (
                    <>
                      <h3 className="text-lg font-semibold">Pagamento con PayPal</h3>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-800 flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          Riceverai la fattura elettronica via email
                        </p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="font-semibold">Totale: €{getTotalPrice().toFixed(2)}</p>
                      </div>
                      <PayPalButtons
                        createOrder={(_data, actions) => {
                          return actions.order.create({
                            intent: "CAPTURE",
                            purchase_units: [{
                              description: `Ordine Pasto Sano ${deliveryType === 'delivery' ? '(Consegna)' : '(Ritiro)'}`,
                              amount: {
                                currency_code: "EUR",
                                value: getTotalPrice().toFixed(2)
                              }
                            }]
                          });
                        }}
                        onApprove={handlePayPalApprove}
                        onError={() => setError('Errore PayPal')}
                      />
                      <button
                        onClick={() => setPaymentMethod(null)}
                        disabled={isLoading}
                        className="w-full border rounded-lg py-2 hover:bg-gray-50 transition disabled:opacity-50"
                      >
                        Indietro
                      </button>
                    </>
                  )}

                  {paymentMethod === 'cash' && (
                    <>
                      <h3 className="text-lg font-semibold">Contanti al Ritiro</h3>
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p className="text-yellow-800">
                          <strong>Importante:</strong> Prepara €{getTotalPrice().toFixed(2)} in contanti
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={handleCashOrder}
                          disabled={isLoading}
                          className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              <span>Invio...</span>
                            </>
                          ) : (
                            <>
                              <Check className="w-5 h-5" />
                              <span>Conferma Ordine</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => setPaymentMethod(null)}
                          disabled={isLoading}
                          className="px-6 py-3 border rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
                        >
                          Indietro
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </>
    </PayPalScriptProvider>
  );
}