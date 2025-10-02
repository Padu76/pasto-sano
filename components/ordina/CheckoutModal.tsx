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
  Home
} from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { MenuItem } from '@/lib/menuRotativo';

// Inizializza Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// Configurazione PayPal
const initialPayPalOptions = {
  clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
  currency: "EUR",
  intent: "capture",
  locale: "it_IT"
};

// Estende MenuItem per carrello
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

// Codici sconto disponibili
const DISCOUNT_CODES: { [key: string]: { percent: number; description: string } } = {
  'BENVENUTO': { percent: 10, description: '10% di sconto' },
  'PASTOSANO20': { percent: 20, description: '20% di sconto' },
  'AMICO': { percent: 15, description: '15% di sconto' }
};

export default function CheckoutModal({ 
  isOpen, 
  onClose, 
  items, 
  onOrderComplete,
  minimumItems = 3
}: CheckoutModalProps) {

  // Stati form base
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [notes, setNotes] = useState('');
  
  // Stati dati fatturazione
  const [fiscalCode, setFiscalCode] = useState('');
  const [address, setAddress] = useState('');
  const [cap, setCap] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  
  // Stati sconto
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<{ code: string; percent: number; description: string } | null>(null);
  const [discountError, setDiscountError] = useState('');
  
  // Stati UI
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'paypal' | 'cash' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [minPickupDate, setMinPickupDate] = useState('');

  // Calcola data minima per ritiro (2 giorni lavorativi)
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

  // Setup date minima al mount
  useEffect(() => {
    const minDate = calculateMinPickupDate();
    const minDateString = formatDateForInput(minDate);
    setMinPickupDate(minDateString);
    setPickupDate(minDateString);
  }, []);

  // Calcoli prezzi
  const getOriginalPrice = () => {
    return items.reduce((total, item) => total + (item.prezzo * item.quantity), 0);
  };

  const getDiscountAmount = () => {
    if (!appliedDiscount) return 0;
    return (getOriginalPrice() * appliedDiscount.percent) / 100;
  };

  const getTotalPrice = () => {
    return Math.max(0, getOriginalPrice() - getDiscountAmount());
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  // Validazione Codice Fiscale
  const validateFiscalCode = (code: string): boolean => {
    const fiscalCodeRegex = /^[A-Z]{6}[0-9]{2}[A-Z][0-9]{2}[A-Z][0-9]{3}[A-Z]$/i;
    return fiscalCodeRegex.test(code);
  };

  // Validazione CAP
  const validateCAP = (cap: string): boolean => {
    return /^\d{5}$/.test(cap);
  };

  // Validazione Provincia
  const validateProvince = (prov: string): boolean => {
    return /^[A-Z]{2}$/i.test(prov);
  };

  // Gestione sconto
  const applyDiscountCode = () => {
    const code = discountCode.toUpperCase().trim();
    
    if (!code) {
      setDiscountError('Inserisci un codice sconto');
      return;
    }

    if (DISCOUNT_CODES[code]) {
      setAppliedDiscount({
        code,
        ...DISCOUNT_CODES[code]
      });
      setDiscountError('');
      setDiscountCode('');
    } else {
      setDiscountError('Codice sconto non valido');
      setAppliedDiscount(null);
    }
  };

  const removeDiscount = () => {
    setAppliedDiscount(null);
    setDiscountCode('');
    setDiscountError('');
  };

  // Validazione form completa
  const validateForm = () => {
    // Validazione base
    if (!customerName || !customerPhone || !pickupDate) {
      setError('Compila tutti i campi obbligatori');
      return false;
    }
    
    // Validazione dati fatturazione (solo per pagamenti online)
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

  // Gestione cambio data
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = new Date(e.target.value);
    
    if (isWeekend(selectedDate)) {
      setError('Il ritiro non è disponibile sabato e domenica');
      return;
    }
    
    setError(null);
    setPickupDate(e.target.value);
  };

  // Pagamento Stripe
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
        customerAddress: 'Ritiro presso Pasto Sano',
        metadata: {
          customerName,
          customerEmail: customerEmail || '',
          customerPhone,
          customerAddress: 'Ritiro presso Pasto Sano',
          pickupDate,
          orderNotes: notes || '',
          discountCode: appliedDiscount ? appliedDiscount.code : '',
          discountPercent: appliedDiscount ? appliedDiscount.percent.toString() : '0',
          originalAmount: getOriginalPrice().toString(),
          // Dati fatturazione
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
        }
      };

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

  // Pagamento PayPal
  const handlePayPalApprove = async (_data: any, actions: any) => {
    setIsLoading(true);
    try {
      await actions.order.capture();
      onOrderComplete();
      window.location.href = '/success?method=paypal';
    } catch (error: any) {
      setError('Errore durante il pagamento PayPal');
    } finally {
      setIsLoading(false);
    }
  };

  // Ordine contanti (no fattura richiesta)
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
        {/* Overlay */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => !isLoading && onClose()}
        />
        
        {/* Modal */}
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="relative bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
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
                  {/* Form Dati Cliente */}
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

                    {/* Sezione Dati Fatturazione */}
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-5 mt-6">
                      <div className="flex items-center gap-2 mb-4">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <h3 className="text-lg font-semibold text-gray-800">Dati Fatturazione</h3>
                      </div>
                      <p className="text-sm text-blue-700 mb-4">
                        Obbligatori per pagamenti online (carta/PayPal)
                      </p>
                      
                      <div className="space-y-4">
                        {/* Codice Fiscale */}
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

                        {/* Indirizzo */}
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

                        {/* CAP, Città, Provincia */}
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
                    
                    {/* Codice Sconto */}
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
                              placeholder="CODICE"
                              className="flex-1 p-2 border rounded-lg focus:outline-none focus:border-green-500"
                            />
                            <button
                              onClick={applyDiscountCode}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                            >
                              Applica
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
                    
                    {/* Data Ritiro */}
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Calendar className="w-5 h-5 text-amber-600" />
                        <label className="text-sm font-medium text-gray-700">
                          Data Ritiro Ordine *
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
                            <MapPin className="w-4 h-4 text-gray-500" />
                            Ritiro presso Pasto Sano
                          </p>
                        </div>
                      )}
                    </div>
                    
                    {/* Note */}
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

                  {/* Errori */}
                  {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                      <AlertCircle className="w-5 h-5" />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Riepilogo Ordine */}
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
                      <div className="flex justify-between font-bold text-lg border-t pt-2">
                        <span>Totale</span>
                        <span className="text-orange-600">€{getTotalPrice().toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Metodi Pagamento */}
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
                  </div>
                </>
              ) : (
                /* Pagamento Selezionato */
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
                              description: `Ordine Pasto Sano`,
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