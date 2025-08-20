'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  X, 
  Check, 
  CreditCard, 
  Smartphone, 
  Clock, 
  Star,
  Banknote,
  AlertCircle,
  Loader2,
  Calendar,
  MapPin,
  Info,
  Mail,
  MessageCircle,
  Globe,
  Tag
} from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { addOrder } from '@/lib/firebase';

// Inizializza Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// Inizializza PayPal
const initialPayPalOptions = {
  clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
  currency: "EUR",
  intent: "capture",
  locale: "it_IT"
};

// ✅ DICHIARAZIONE TYPESCRIPT PER EMAILJS
declare global {
  interface Window {
    emailjs: any;
  }
}

// ✅ CODICI SCONTO
const DISCOUNT_CODES: { [key: string]: { percent: number; description: string } } = {
  'SCONTO5': { percent: 5, description: '5% di sconto' },
  'SCONTO10': { percent: 10, description: '10% di sconto' },
  'OMAGGIO2025': { percent: 90, description: '90% di sconto' }
};

// ✅ CARICAMENTO EMAILJS IMMEDIATO (STESSO METODO DEL TEST)
if (typeof window !== 'undefined' && !window.emailjs) {
  console.log('🚀 CARICAMENTO EMAILJS IMMEDIATO...');
  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js';
  script.onload = () => {
    console.log('📦 EMAILJS SCRIPT CARICATO');
    setTimeout(() => {
      if (window.emailjs) {
        window.emailjs.init('ME0ru3KkNko0P6d2Y');
        console.log('✅ EMAILJS INIZIALIZZATO SUBITO!');
      }
    }, 500);
  };
  document.head.appendChild(script);
}

// Funzione per calcolare la data minima di ritiro
const calculateMinPickupDate = () => {
  const today = new Date();
  let minDate = new Date(today);
  
  // Aggiungi 2 giorni lavorativi
  let daysAdded = 0;
  while (daysAdded < 2) {
    minDate.setDate(minDate.getDate() + 1);
    const dayOfWeek = minDate.getDay();
    
    // Salta sabato (6) e domenica (0)
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      daysAdded++;
    }
  }
  
  return minDate;
};

// Funzione per formattare la data per l'input
const formatDateForInput = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Funzione per verificare se una data è un weekend
const isWeekend = (date: Date) => {
  const day = date.getDay();
  return day === 0 || day === 6;
};

// Funzione per ottenere il giorno della settimana in italiano
const getDayName = (date: Date) => {
  const days = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];
  return days[date.getDay()];
};

const meals = [
  {
    id: 1,
    name: "Fusilli, Macinato Manzo, Zucchine, Melanzane",
    description: "Piatto completo con fusilli integrali, verdure grigliate e manzo magro.",
    image: "/images/meals/fusilli-manzo-zucchine-melanzane.jpg",
    price: 8.50,
    category: "pasta"
  },
  {
    id: 2,
    name: "Roastbeef, Patate al Forno, Fagiolini",
    description: "Tagliata di roastbeef con contorno di patate e fagiolini freschi.",
    image: "/images/meals/roastbeef-patate-fagiolini.jpg",
    price: 8.50,
    category: "carne"
  },
  {
    id: 3,
    name: "Riso, Hamburger Manzo, Carotine Baby",
    description: "Hamburger di manzo cotto alla griglia con contorno e riso basmati.",
    image: "/images/meals/riso-hamburger-carotine.jpg",
    price: 8.50,
    category: "carne"
  },
  {
    id: 4,
    name: "Riso Nero, Gamberi, Tonno, Piselli",
    description: "Riso venere con pesce e verdure leggere.",
    image: "/images/meals/riso-nero-gamberi-tonno-piselli.jpg",
    price: 8.50,
    category: "pesce"
  },
  {
    id: 5,
    name: "Patate, Salmone Grigliato, Broccoli",
    description: "Salmone alla griglia con patate al forno e broccoli al vapore.",
    image: "/images/meals/patate-salmone-broccoli.jpg",
    price: 8.50,
    category: "pesce"
  },
  {
    id: 6,
    name: "Pollo Grigliato, Patate al Forno, Zucchine",
    description: "Filetto di pollo alla griglia con contorno classico.",
    image: "/images/meals/pollo-patate-zucchine.jpg",
    price: 8.50,
    category: "carne"
  },
  {
    id: 7,
    name: "Orzo, Ceci, Feta, Pomodorini, Basilico",
    description: "Insalata di orzo fredda, ricca di proteine e gusto mediterraneo.",
    image: "/images/meals/orzo-ceci-feta-pomodorini.jpg",
    price: 8.50,
    category: "vegetariano"
  },
  {
    id: 8,
    name: "Tortillas, Tacchino Affumicato, Hummus Ceci, Insalata",
    description: "Wrap light con proteine magre e crema di ceci.",
    image: "/images/meals/tortillas-tacchino-hummus.jpg",
    price: 8.50,
    category: "wrap"
  },
  {
    id: 9,
    name: "Tortillas, Salmone Affumicato, Formaggio Spalmabile, Insalata",
    description: "Wrap gustoso con salmone affumicato e insalata fresca.",
    image: "/images/meals/tortillas-salmone-formaggio.jpg",
    price: 8.50,
    category: "wrap"
  },
  {
    id: 10,
    name: "Riso, Pollo al Curry, Zucchine",
    description: "Piatto speziato con pollo al curry e verdure leggere.",
    image: "/images/meals/riso-pollo-curry-zucchine.jpg",
    price: 8.50,
    category: "carne"
  },
  {
    id: 11,
    name: "Uova Strapazzate, Bacon, Frutti di Bosco",
    description: "Colazione salata e proteica con uova e frutti rossi.",
    image: "/images/meals/uova-bacon-frutti-bosco.jpg",
    price: 6.00,
    category: "colazione"
  },
  {
    id: 12,
    name: "Pancakes",
    description: "Colazione dolce e bilanciata per iniziare al meglio la giornata.",
    image: "/images/meals/pancakes.jpg",
    price: 6.00,
    category: "colazione"
  }
];

export default function Home() {
  const [cart, setCart] = useState<any[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('tutti');
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'paypal' | 'cash' | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // ✅ STATI PER CODICI SCONTO
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<{ code: string; percent: number; description: string } | null>(null);
  const [discountError, setDiscountError] = useState('');
  
  // Dati cliente
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [notes, setNotes] = useState('');
  
  // Calcolo data minima
  const [minPickupDate, setMinPickupDate] = useState('');

  const categories = ['tutti', 'pasta', 'carne', 'pesce', 'vegetariano', 'wrap', 'colazione'];

  const filteredMeals = selectedCategory === 'tutti' 
    ? meals 
    : meals.filter(meal => meal.category === selectedCategory);

  // Inizializza le date al mount del componente
  useEffect(() => {
    const minDate = calculateMinPickupDate();
    const minDateString = formatDateForInput(minDate);
    setMinPickupDate(minDateString);
    setPickupDate(minDateString); // Imposta automaticamente la data suggerita
  }, []);

  // Carica carrello da localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  // Salva carrello in localStorage
  useEffect(() => {
    if (cart.length > 0) {
      localStorage.setItem('cart', JSON.stringify(cart));
    }
  }, [cart]);

  const addToCart = (meal: any) => {
    const existingItem = cart.find(item => item.id === meal.id);
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === meal.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...meal, quantity: 1 }]);
    }
  };

  const removeFromCart = (mealId: number) => {
    setCart(cart.filter(item => item.id !== mealId));
  };

  const updateQuantity = (mealId: number, delta: number) => {
    setCart(cart.map(item => {
      if (item.id === mealId) {
        const newQuantity = item.quantity + delta;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
      }
      return item;
    }).filter(Boolean));
  };

  // ✅ CALCOLO TOTALE ORIGINALE
  const getOriginalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // ✅ CALCOLO SCONTO
  const getDiscountAmount = () => {
    if (!appliedDiscount) return 0;
    return (getOriginalPrice() * appliedDiscount.percent) / 100;
  };

  // ✅ CALCOLO TOTALE FINALE
  const getTotalPrice = () => {
    return Math.max(0, getOriginalPrice() - getDiscountAmount());
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  // ✅ APPLICAZIONE CODICE SCONTO
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

  // ✅ RIMOZIONE SCONTO
  const removeDiscount = () => {
    setAppliedDiscount(null);
    setDiscountCode('');
    setDiscountError('');
  };

  // Validazione form con controllo weekend
  const validateForm = () => {
    if (!customerName || !customerPhone || !pickupDate) {
      setError('Compila tutti i campi obbligatori');
      return false;
    }
    
    // Verifica che la data non sia un weekend
    const selectedDate = new Date(pickupDate);
    if (isWeekend(selectedDate)) {
      setError('Il ritiro non è disponibile nel weekend. Seleziona un giorno feriale.');
      return false;
    }
    
    // Verifica che la data sia almeno la data minima
    const minDate = new Date(minPickupDate);
    if (selectedDate < minDate) {
      setError(`La data minima per il ritiro è ${minDate.toLocaleDateString('it-IT')}`);
      return false;
    }
    
    if (cart.length === 0) {
      setError('Il carrello è vuoto');
      return false;
    }
    
    setError(null);
    return true;
  };

  // Gestione cambio data con validazione weekend
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = new Date(e.target.value);
    
    // Se è weekend, mostra avviso e non cambiare
    if (isWeekend(selectedDate)) {
      setError('Attenzione: il ritiro non è disponibile sabato e domenica');
      return;
    }
    
    setError(null);
    setPickupDate(e.target.value);
  };

  // Salva ordine in sessionStorage per la pagina success
  const saveOrderForSuccess = () => {
    const orderData = {
      customerName,
      customerEmail,
      customerPhone,
      customerAddress: 'Ritiro presso Pasto Sano',
      pickupDate,
      items: cart,
      originalAmount: getOriginalPrice(),
      discountAmount: getDiscountAmount(),
      totalAmount: getTotalPrice(),
      appliedDiscount,
      paymentMethod: paymentMethod || 'unknown',
      notes,
      orderDate: new Date().toISOString()
    };
    sessionStorage.setItem('lastOrder', JSON.stringify(orderData));
  };

  // ✅ INVIO NOTIFICA EMAIL - METODO IDENTICO AL TEST MANUALE
  const sendOrderNotification = async (method: string) => {
    console.log('📧 === INIZIO INVIO NOTIFICA ORDINE ===');
    
    // Assicurati che EmailJS sia disponibile
    if (!window.emailjs) {
      console.log('⚠️ EmailJS non trovato, caricamento forzato...');
      
      // Caricamento identico al test manuale
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js';
      document.head.appendChild(script);
      
      await new Promise((resolve, reject) => {
        script.onload = () => {
          console.log('📦 EmailJS caricato forzatamente');
          window.emailjs.init('ME0ru3KkNko0P6d2Y');
          console.log('✅ EmailJS inizializzato forzatamente');
          resolve(true);
        };
        script.onerror = () => reject(new Error('Errore caricamento'));
        setTimeout(() => reject(new Error('Timeout')), 5000);
      });
    }

    const orderDetails = cart.map(item => 
      `${item.name} x${item.quantity} - €${(item.price * item.quantity).toFixed(2)}`
    ).join('\n');

    const templateParams = {
      customer_name: customerName,
      customer_email: customerEmail || 'Non fornita',
      customer_phone: customerPhone,
      customer_address: 'Ritiro presso Pasto Sano',
      order_details: orderDetails,
      total_amount: `€${getOriginalPrice().toFixed(2)}${appliedDiscount ? ` (Sconto ${appliedDiscount.description}: -€${getDiscountAmount().toFixed(2)}) = €${getTotalPrice().toFixed(2)}` : ''}`,
      payment_method: method === 'cash' ? 'Contanti al ritiro' : method === 'paypal' ? 'PayPal' : 'Carta di credito',
      pickup_date: pickupDate,
      notes: notes || 'Nessuna nota',
      order_date: new Date().toLocaleString('it-IT'),
      order_id: `ORD-${Date.now()}`
    };

    console.log('📧 Parametri email:', templateParams);

    try {
      // INVIO IDENTICO AL TEST MANUALE CHE HA FUNZIONATO
      const result = await window.emailjs.send(
        'service_v6bw2m4',
        'template_lqxqdze',
        templateParams,
        'ME0ru3KkNko0P6d2Y'
      );
      
      console.log('🎉 === EMAIL INVIATA CON SUCCESSO! ===', result);
    } catch (error) {
      console.error('💥 === ERRORE INVIO EMAIL ===', error);
    }
  };

  // 🔧 PAGAMENTO STRIPE - FIX DATI
  const handleStripeCheckout = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // ✅ FORMATO CORRETTO PER API STRIPE
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: cart.map(item => ({
            name: item.name,
            description: item.description,
            image: item.image,
            price: item.price,
            quantity: item.quantity
          })),
          customerEmail,
          customerName,
          customerAddress: 'Ritiro presso Pasto Sano',
          customerPhone
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Errore API checkout:', errorData);
        throw new Error('Errore nella creazione del checkout');
      }

      const { sessionId } = await response.json();
      const stripe = await stripePromise;
      
      if (stripe) {
        saveOrderForSuccess();
        const { error } = await stripe.redirectToCheckout({ sessionId });
        if (error) {
          throw new Error(error.message);
        }
      }
    } catch (error: any) {
      console.error('Errore Stripe:', error);
      setError(error.message || 'Errore durante il pagamento');
    } finally {
      setIsLoading(false);
    }
  };

  // PAGAMENTO PAYPAL
  const handlePayPalApprove = async (_data: any, actions: any) => {
    setIsLoading(true);
    try {
      const details = await actions.order.capture();
      console.log('Pagamento PayPal completato:', details);
      
      // Salva ordine su Firebase
      await saveOrderToFirebase('paypal');
      
      // Invia email di notifica
      await sendOrderNotification('paypal');
      
      saveOrderForSuccess();
      setOrderComplete(true);
      setShowCheckout(false);
      setCart([]);
      localStorage.removeItem('cart');
      
      // Redirect alla pagina success
      window.location.href = `/success?method=paypal&order_id=${details.id}`;
    } catch (error: any) {
      console.error('Errore PayPal:', error);
      setError('Errore durante il pagamento PayPal');
    } finally {
      setIsLoading(false);
    }
  };

  // PAGAMENTO CONTANTI
  const handleCashOrder = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('💰 ELABORAZIONE ORDINE CONTANTI...');
      
      // API call per salvare su Firebase
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
          items: cart,
          totalAmount: getTotalPrice(),
          notes: appliedDiscount ? `${notes || ''}\n\nSconto applicato: ${appliedDiscount.description} (-€${getDiscountAmount().toFixed(2)})` : notes
        }),
      });

      if (!response.ok) {
        throw new Error('Errore nell\'invio dell\'ordine');
      }

      console.log('✅ ORDINE SALVATO TRAMITE API');
      
      // Invia email di notifica
      await sendOrderNotification('cash');
      
      saveOrderForSuccess();
      setOrderComplete(true);
      setShowCheckout(false);
      setCart([]);
      localStorage.removeItem('cart');
      
      // Redirect alla pagina success
      window.location.href = '/success?method=cash';
      
    } catch (error: any) {
      console.error('Errore ordine contanti:', error);
      setError(error.message || 'Errore durante l\'invio dell\'ordine');
    } finally {
      setIsLoading(false);
    }
  };

  // Salva ordine su Firebase (usata solo per PayPal)
  const saveOrderToFirebase = async (method: string) => {
    try {
      await addOrder({
        customerName,
        customerEmail,
        customerPhone,
        customerAddress: 'Ritiro presso Pasto Sano',
        items: cart,
        totalAmount: getTotalPrice(),
        paymentMethod: method,
        paymentMethodName: method === 'cash' ? 'Contanti alla consegna' : method === 'paypal' ? 'PayPal' : 'Carta di credito',
        paymentStatus: method === 'cash' ? 'pending' : 'paid',
        orderStatus: 'confirmed',
        pickupDate,
        notes: appliedDiscount ? `${notes || ''}\n\nSconto applicato: ${appliedDiscount.description} (-€${getDiscountAmount().toFixed(2)})` : notes,
        source: 'website',
        timestamp: new Date()
      });
      console.log('✅ Ordine salvato su Firebase');
    } catch (error) {
      console.error('Errore salvataggio Firebase:', error);
      // Non bloccare il processo se Firebase fallisce
    }
  };

  return (
    <PayPalScriptProvider options={initialPayPalOptions}>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
        {/* Header Mobile Optimized - SENZA CARRELLO */}
        <header className="bg-gradient-to-r from-amber-50 to-orange-50 shadow-lg sticky top-0 z-40 border-b-2 border-orange-200">
          <div className="container mx-auto px-3 py-3 md:px-4 md:py-4">
            <div className="flex justify-center items-center">
              <div className="flex items-center space-x-2 md:space-x-3">
                <Image 
                  src="/images/logo.png" 
                  alt="Pasto Sano" 
                  width={50} 
                  height={50}
                  className="object-contain md:w-[60px] md:h-[60px]"
                />
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-amber-900">
                    Pasto Sano
                  </h1>
                  <p className="text-[10px] md:text-xs text-amber-700 hidden sm:block">La soluzione per stare in forma</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* 🛒 FLOATING CART BUTTON - FISSO IN BASSO A DESTRA */}
        <button 
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-orange-500 to-amber-500 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 animate-pulse"
          style={{ 
            boxShadow: '0 8px 32px rgba(249, 115, 22, 0.4)',
          }}
        >
          <ShoppingCart className="w-6 h-6 md:w-7 md:h-7" />
          {getTotalItems() > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 md:w-7 md:h-7 flex items-center justify-center animate-bounce border-2 border-white">
              {getTotalItems()}
            </span>
          )}
        </button>

        {/* Hero Section Mobile Optimized */}
        <div className="bg-gradient-to-br from-amber-700 via-orange-600 to-amber-800 text-white py-8 md:py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4">
              Mangia Sano, Vivi Meglio
            </h2>
            <p className="text-base sm:text-lg md:text-xl mb-6 md:mb-8 opacity-95">
              Pasti equilibrati pronti per il ritiro
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-3 sm:space-y-0 sm:space-x-4 md:space-x-8">
              <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-3 py-2 rounded-full text-sm md:text-base">
                <MapPin className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
                <span>Ritiro presso sede</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-3 py-2 rounded-full text-sm md:text-base">
                <Clock className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
                <span>Pronto in 2 giorni</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-3 py-2 rounded-full text-sm md:text-base">
                <Star className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
                <span>Ingredienti Premium</span>
              </div>
            </div>
          </div>
        </div>

        {/* Categories Mobile Optimized - Scrollabile orizzontalmente su mobile */}
        <div className="container mx-auto px-4 py-6 md:py-8">
          <div className="flex space-x-2 md:space-x-4 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 md:px-6 py-2 rounded-full whitespace-nowrap transition-all duration-300 text-sm md:text-base flex-shrink-0 ${
                  selectedCategory === category
                    ? 'bg-gradient-to-r from-amber-600 to-orange-500 text-white shadow-lg scale-105'
                    : 'bg-white text-amber-800 hover:bg-amber-100 hover:shadow-md border border-amber-200'
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Meals Grid */}
        <div className="container mx-auto px-4 pb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredMeals.map((meal) => (
              <div 
                key={meal.id} 
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:transform hover:-translate-y-1 transition-all duration-300"
              >
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={meal.image} 
                    alt={meal.name}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-2 right-2 bg-amber-100 px-3 py-1 rounded-full shadow-md">
                    <span className="font-bold text-amber-800">€{meal.price.toFixed(2)}</span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2 text-gray-800">{meal.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">{meal.description}</p>
                  <button
                    onClick={() => addToCart(meal)}
                    className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-2 rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-2"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Aggiungi</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cart Sidebar - Full screen su mobile */}
        {isCartOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <div 
              className="absolute inset-0 bg-black bg-opacity-50"
              onClick={() => setIsCartOpen(false)}
            />
            <div className="relative bg-white w-full sm:max-w-md h-full overflow-y-auto">
              <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center shadow-md">
                <h2 className="text-xl md:text-2xl font-bold">Carrello</h2>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {cart.length === 0 ? (
                <div className="p-8 text-center">
                  <ShoppingCart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">Il carrello è vuoto</p>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="mt-4 bg-orange-500 text-white px-6 py-2 rounded-lg"
                  >
                    Continua lo Shopping
                  </button>
                </div>
              ) : (
                <>
                  <div className="p-4 space-y-3">
                    {cart.map(item => (
                      <div key={item.id} className="bg-gray-50 rounded-lg p-3 md:p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold flex-1 text-sm md:text-base">{item.name}</h4>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-500 hover:text-red-700 ml-2"
                          >
                            <X className="w-4 h-4 md:w-5 md:h-5" />
                          </button>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => updateQuantity(item.id, -1)}
                              className="w-7 h-7 md:w-8 md:h-8 bg-white rounded-lg hover:bg-gray-200 flex items-center justify-center transition-colors"
                            >
                              <Minus className="w-3 h-3 md:w-4 md:h-4" />
                            </button>
                            <span className="w-8 text-center font-semibold text-sm md:text-base">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, 1)}
                              className="w-7 h-7 md:w-8 md:h-8 bg-white rounded-lg hover:bg-gray-200 flex items-center justify-center transition-colors"
                            >
                              <Plus className="w-3 h-3 md:w-4 md:h-4" />
                            </button>
                          </div>
                          <span className="font-bold text-orange-600 text-sm md:text-base">
                            €{(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="sticky bottom-0 bg-white border-t p-4 shadow-lg">
                    {/* ✅ VISUALIZZAZIONE TOTALI CON SCONTO */}
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between items-center text-sm">
                        <span>Subtotale:</span>
                        <span>€{getOriginalPrice().toFixed(2)}</span>
                      </div>
                      
                      {appliedDiscount && (
                        <div className="flex justify-between items-center text-sm text-green-600">
                          <span>Sconto ({appliedDiscount.description}):</span>
                          <span>-€{getDiscountAmount().toFixed(2)}</span>
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center border-t pt-2">
                        <span className="text-lg md:text-xl font-bold">Totale:</span>
                        <span className="text-xl md:text-2xl font-bold text-orange-600">
                          €{getTotalPrice().toFixed(2)}
                        </span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => {
                        setShowCheckout(true);
                        setIsCartOpen(false);
                      }}
                      className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-3 rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105 font-semibold text-base md:text-lg"
                    >
                      Procedi al Pagamento
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Checkout Modal */}
        {showCheckout && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
              className="absolute inset-0 bg-black bg-opacity-50"
              onClick={() => !isLoading && setShowCheckout(false)}
            />
            <div className="relative bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
              <h2 className="text-2xl font-bold mb-6">Checkout</h2>
              
              {/* Form dati cliente */}
              {!paymentMethod && (
                <>
                  <div className="space-y-4 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nome e Cognome *
                        </label>
                        <input
                          type="text"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          className="w-full p-3 border rounded-lg focus:outline-none focus:border-green-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Telefono *
                        </label>
                        <input
                          type="tel"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          className="w-full p-3 border rounded-lg focus:outline-none focus:border-green-500"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        className="w-full p-3 border rounded-lg focus:outline-none focus:border-green-500"
                      />
                    </div>
                    
                    {/* ✅ SEZIONE CODICE SCONTO */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Tag className="w-5 h-5 text-green-600" />
                        <label className="text-sm font-medium text-gray-700">
                          Codice Sconto
                        </label>
                      </div>
                      
                      {!appliedDiscount ? (
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={discountCode}
                              onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                              placeholder="Inserisci codice sconto"
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
                            <p className="text-red-600 text-sm">{discountError}</p>
                          )}
                          
                          <div className="text-xs text-gray-500">
                            <p>I codici sconto saranno attivati durante promozioni speciali</p>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-white rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-green-700">
                                ✓ Sconto applicato: {appliedDiscount.description}
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
                    
                    {/* Sezione Data Ritiro Migliorata */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Calendar className="w-5 h-5 text-blue-600" />
                        <label className="text-sm font-medium text-gray-700">
                          Data Ritiro Ordine *
                        </label>
                      </div>
                      
                      <input
                        type="date"
                        value={pickupDate}
                        onChange={handleDateChange}
                        min={minPickupDate}
                        className="w-full p-3 border rounded-lg focus:outline-none focus:border-green-500 mb-3"
                        required
                      />
                      
                      {pickupDate && (
                        <div className="text-sm text-gray-600">
                          <p className="font-medium mb-1">
                            📅 Ritiro: {getDayName(new Date(pickupDate))}, {new Date(pickupDate).toLocaleDateString('it-IT')}
                          </p>
                        </div>
                      )}
                      
                      <div className="mt-3 p-3 bg-white rounded-lg">
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-green-600 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-800">Ritiro presso Pasto Sano</p>
                            <p className="text-xs text-gray-600 mt-1">
                              L'orario di ritiro ti verrà comunicato tramite SMS/WhatsApp
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-3 p-2 bg-yellow-50 rounded-lg">
                        <div className="flex items-start gap-2">
                          <Info className="w-4 h-4 text-yellow-600 mt-0.5" />
                          <div className="text-xs text-yellow-800">
                            <p className="font-medium mb-1">Tempi di preparazione:</p>
                            <ul className="space-y-0.5">
                              <li>• Ordini dal lunedì al mercoledì: ritiro dopo 2 giorni</li>
                              <li>• Ordini del giovedì: ritiro lunedì</li>
                              <li>• Ordini del venerdì: ritiro martedì</li>
                              <li>• Weekend: ordini non disponibili</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Note aggiuntive
                      </label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full p-3 border rounded-lg focus:outline-none focus:border-green-500"
                        rows={3}
                        placeholder="Allergie, preferenze, orario preferito per il ritiro..."
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                      <AlertCircle className="w-5 h-5" />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* ✅ RIEPILOGO TOTALI PRIMA DEL PAGAMENTO */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <h4 className="font-semibold mb-3">Riepilogo Ordine</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Subtotale:</span>
                        <span>€{getOriginalPrice().toFixed(2)}</span>
                      </div>
                      {appliedDiscount && (
                        <div className="flex justify-between text-green-600">
                          <span>Sconto ({appliedDiscount.description}):</span>
                          <span>-€{getDiscountAmount().toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold text-lg border-t pt-2">
                        <span>Totale da pagare:</span>
                        <span className="text-orange-600">€{getTotalPrice().toFixed(2)}</span>
                      </div>
                      <div className="text-xs text-gray-600 mt-2">
                        <p>Articoli: {getTotalItems()}</p>
                        <p>Ritiro: {pickupDate ? new Date(pickupDate).toLocaleDateString('it-IT') : 'Da definire'}</p>
                      </div>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold mb-4">Scegli il metodo di pagamento</h3>
                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        if (validateForm()) {
                          setPaymentMethod('stripe');
                        }
                      }}
                      disabled={isLoading}
                      className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 transition-colors flex items-center justify-center space-x-3 disabled:opacity-50"
                    >
                      <CreditCard className="w-6 h-6 text-blue-500" />
                      <span className="font-semibold">Paga con Carta di Credito/Debito</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        if (validateForm()) {
                          setPaymentMethod('paypal');
                        }
                      }}
                      disabled={isLoading}
                      className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-yellow-500 transition-colors flex items-center justify-center space-x-3 disabled:opacity-50"
                    >
                      <Smartphone className="w-6 h-6 text-yellow-500" />
                      <span className="font-semibold">PayPal</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        if (validateForm()) {
                          setPaymentMethod('cash');
                        }
                      }}
                      disabled={isLoading}
                      className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 transition-colors flex items-center justify-center space-x-3 disabled:opacity-50"
                    >
                      <Banknote className="w-6 h-6 text-green-500" />
                      <span className="font-semibold">Contanti al Ritiro</span>
                    </button>
                  </div>
                </>
              )}

              {/* Conferma Pagamento */}
              {paymentMethod === 'stripe' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Pagamento con Carta</h3>
                  <p className="text-gray-600">Verrai reindirizzato a Stripe per completare il pagamento in sicurezza.</p>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-semibold mb-2">Riepilogo Ordine:</p>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Subtotale:</span>
                        <span>€{getOriginalPrice().toFixed(2)}</span>
                      </div>
                      {appliedDiscount && (
                        <div className="flex justify-between text-green-600">
                          <span>Sconto:</span>
                          <span>-€{getDiscountAmount().toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold border-t pt-1">
                        <span>Totale:</span>
                        <span>€{getTotalPrice().toFixed(2)}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">Articoli: {getTotalItems()}</p>
                    <p className="text-sm text-gray-600">Ritiro: {pickupDate ? new Date(pickupDate).toLocaleDateString('it-IT') : 'Da definire'}</p>
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
                          <span>Procedi al Pagamento</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => setPaymentMethod(null)}
                      disabled={isLoading}
                      className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
                    >
                      Indietro
                    </button>
                  </div>
                </div>
              )}

              {paymentMethod === 'paypal' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Pagamento con PayPal</h3>
                  <p className="text-gray-600">Usa il tuo account PayPal per completare il pagamento.</p>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-semibold mb-2">Riepilogo Ordine:</p>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Subtotale:</span>
                        <span>€{getOriginalPrice().toFixed(2)}</span>
                      </div>
                      {appliedDiscount && (
                        <div className="flex justify-between text-green-600">
                          <span>Sconto:</span>
                          <span>-€{getDiscountAmount().toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold border-t pt-1">
                        <span>Totale:</span>
                        <span>€{getTotalPrice().toFixed(2)}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">Articoli: {getTotalItems()}</p>
                    <p className="text-sm text-gray-600">Ritiro: {pickupDate ? new Date(pickupDate).toLocaleDateString('it-IT') : 'Da definire'}</p>
                  </div>
                  <PayPalButtons
                    createOrder={(_data, actions) => {
                      return actions.order.create({
                        intent: "CAPTURE",
                        purchase_units: [{
                          description: `Ordine Pasto Sano - ${customerName}`,
                          amount: {
                            currency_code: "EUR",
                            value: getTotalPrice().toFixed(2)
                          }
                        }]
                      });
                    }}
                    onApprove={handlePayPalApprove}
                    onError={(err) => {
                      console.error('Errore PayPal:', err);
                      setError('Errore durante il pagamento PayPal');
                    }}
                  />
                  <button
                    onClick={() => setPaymentMethod(null)}
                    disabled={isLoading}
                    className="w-full px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
                  >
                    Indietro
                  </button>
                </div>
              )}

              {paymentMethod === 'cash' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Contanti al Ritiro</h3>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-yellow-800">
                      <strong>Importante:</strong> Prepara l'importo esatto di €{getTotalPrice().toFixed(2)} in contanti per il ritiro.
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-semibold mb-2">Riepilogo Ordine:</p>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Subtotale:</span>
                        <span>€{getOriginalPrice().toFixed(2)}</span>
                      </div>
                      {appliedDiscount && (
                        <div className="flex justify-between text-green-600">
                          <span>Sconto:</span>
                          <span>-€{getDiscountAmount().toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold border-t pt-1">
                        <span>Totale da pagare:</span>
                        <span>€{getTotalPrice().toFixed(2)}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">Articoli: {getTotalItems()}</p>
                    <p className="text-sm text-gray-600">Ritiro: {pickupDate ? `${getDayName(new Date(pickupDate))}, ${new Date(pickupDate).toLocaleDateString('it-IT')}` : 'Da definire'}</p>
                    <p className="text-sm text-gray-600 mt-2">📍 Presso: Pasto Sano</p>
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
                          <span>Invio ordine...</span>
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
                      className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
                    >
                      Indietro
                    </button>
                  </div>
                </div>
              )}

              {!paymentMethod && (
                <button
                  onClick={() => setShowCheckout(false)}
                  className="w-full mt-4 py-2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Annulla
                </button>
              )}
            </div>
          </div>
        )}

        {/* Order Complete Notification */}
        {orderComplete && (
          <div className="fixed top-20 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg flex items-center space-x-3 z-50">
            <Check className="w-6 h-6" />
            <span className="font-semibold">Ordine completato con successo!</span>
          </div>
        )}

        {/* Footer Mobile Optimized */}
        <footer className="bg-gradient-to-r from-amber-900 to-amber-950 text-white mt-8 md:mt-16">
          <div className="container mx-auto px-4 py-8 md:py-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {/* Logo e Info Azienda - Centrato su mobile */}
              <div className="text-center">
                <div className="flex items-center justify-center mb-3 md:mb-4">
                  <Image 
                    src="/images/logo.png" 
                    alt="Pasto Sano" 
                    width={70} 
                    height={70}
                    className="object-contain md:w-[80px] md:h-[80px]"
                  />
                </div>
                <h3 className="text-lg md:text-xl font-bold mb-2 text-yellow-400">Pasto Sano</h3>
                <p className="text-xs md:text-sm opacity-90">
                  La soluzione per stare in forma.<br />
                  Pasti sani e gustosi, preparati con amore.
                </p>
              </div>

              {/* Contatti - Con pulsante WhatsApp prominente */}
              <div className="text-center">
                <h4 className="text-base md:text-lg font-semibold mb-3 md:mb-4 text-yellow-400">Contatti</h4>
                <div className="space-y-3">
                  <a 
                    href="mailto:info@pastosano.it"
                    className="flex items-center justify-center gap-2 hover:text-yellow-400 transition text-sm md:text-base"
                  >
                    <Mail className="w-4 h-4 md:w-5 md:h-5" />
                    <span>info@pastosano.it</span>
                  </a>
                  <a 
                    href="https://wa.me/393478881515?text=Ciao%20Pasto%20Sano,%20vorrei%20informazioni"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2.5 md:py-2 rounded-full transition transform hover:scale-105 text-sm md:text-base"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span className="font-semibold">WhatsApp: 347 888 1515</span>
                  </a>
                  <a 
                    href="https://www.pastosano.it"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 hover:text-yellow-400 transition text-sm md:text-base"
                  >
                    <Globe className="w-4 h-4 md:w-5 md:h-5" />
                    <span>www.pastosano.it</span>
                  </a>
                </div>
              </div>

              {/* Orari e Info */}
              <div className="text-center">
                <h4 className="text-base md:text-lg font-semibold mb-3 md:mb-4 text-yellow-400">Ritiro Ordini</h4>
                <div className="space-y-1 md:space-y-2 text-xs md:text-sm opacity-90">
                  <p>Lunedì - Venerdì</p>
                  <p className="font-semibold text-yellow-300">Orario da concordare</p>
                  <p className="mt-2 md:mt-3">Ordina entro 2 giorni lavorativi</p>
                  <p>Ritiro presso la nostra sede</p>
                </div>
              </div>
            </div>

            {/* Copyright */}
            <div className="border-t border-yellow-800/30 mt-6 md:mt-8 pt-4 md:pt-6 text-center text-xs md:text-sm opacity-75">
              <p>© 2024 Pasto Sano - Tutti i diritti riservati</p>
              <p className="mt-1 md:mt-2">P.IVA: IT00000000000 | Made with ❤️</p>
            </div>
          </div>
        </footer>
      </div>
    </PayPalScriptProvider>
  );
}