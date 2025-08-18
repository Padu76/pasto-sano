'use client';

import { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  X, 
  Check, 
  CreditCard, 
  Smartphone, 
  Truck, 
  Clock, 
  Heart, 
  Star,
  Banknote,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import emailjs from '@emailjs/browser';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { addOrder } from '@/lib/firebase';

// Inizializza Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// Inizializza EmailJS
emailjs.init(process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!);

// Inizializza PayPal
const initialPayPalOptions = {
  clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
  currency: "EUR",
  intent: "capture",
  locale: "it_IT"
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
  
  // Dati cliente
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [notes, setNotes] = useState('');

  const categories = ['tutti', 'pasta', 'carne', 'pesce', 'vegetariano', 'wrap', 'colazione'];

  const filteredMeals = selectedCategory === 'tutti' 
    ? meals 
    : meals.filter(meal => meal.category === selectedCategory);

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

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  // Validazione form
  const validateForm = () => {
    if (!customerName || !customerPhone || !pickupDate) {
      setError('Compila tutti i campi obbligatori');
      return false;
    }
    if (cart.length === 0) {
      setError('Il carrello è vuoto');
      return false;
    }
    setError(null);
    return true;
  };

  // Salva ordine in sessionStorage per la pagina success
  const saveOrderForSuccess = () => {
    const orderData = {
      customerName,
      customerEmail,
      customerPhone,
      customerAddress,
      pickupDate,
      items: cart,
      totalAmount: getTotalPrice(),
      paymentMethod: paymentMethod || 'unknown',
      notes,
      orderDate: new Date().toISOString()
    };
    sessionStorage.setItem('lastOrder', JSON.stringify(orderData));
  };

  // PAGAMENTO STRIPE
  const handleStripeCheckout = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: cart,
          customerEmail,
          customerName,
          customerAddress,
          customerPhone,
          pickupDate,
          notes
        }),
      });

      if (!response.ok) {
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
  const handlePayPalApprove = async (data: any, actions: any) => {
    setIsLoading(true);
    try {
      const details = await actions.order.capture();
      console.log('Pagamento PayPal completato:', details);
      
      // Salva ordine su Firebase
      await saveOrderToFirebase('paypal', details.id);
      
      // Invia email
      await sendOrderEmail('paypal');
      
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
      // Invia notifica ordine contanti
      const response = await fetch('/.netlify/functions/cash-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerName,
          customerPhone,
          customerEmail,
          customerAddress,
          pickupDate,
          items: cart,
          totalAmount: getTotalPrice(),
          notes
        }),
      });

      if (!response.ok) {
        throw new Error('Errore nell\'invio dell\'ordine');
      }

      // Salva ordine su Firebase
      await saveOrderToFirebase('cash', `CASH-${Date.now()}`);
      
      // Invia email di conferma
      await sendOrderEmail('cash');
      
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

  // Salva ordine su Firebase
  const saveOrderToFirebase = async (method: string, transactionId: string) => {
    try {
      await addOrder({
        customerName,
        customerEmail,
        customerPhone,
        customerAddress,
        items: cart,
        totalAmount: getTotalPrice(),
        paymentMethod: method,
        paymentMethodName: method === 'cash' ? 'Contanti alla consegna' : method === 'paypal' ? 'PayPal' : 'Carta di credito',
        paymentStatus: method === 'cash' ? 'pending' : 'paid',
        orderStatus: 'confirmed',
        pickupDate,
        notes,
        source: 'website',
        timestamp: new Date(),
        transactionId
      });
    } catch (error) {
      console.error('Errore salvataggio Firebase:', error);
    }
  };

  // Invia email con EmailJS
  const sendOrderEmail = async (method: string) => {
    const orderDetails = cart.map(item => 
      `${item.name} x${item.quantity} - €${(item.price * item.quantity).toFixed(2)}`
    ).join('\n');

    const templateParams = {
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone,
      customer_address: customerAddress,
      order_details: orderDetails,
      total_amount: getTotalPrice().toFixed(2),
      payment_method: method === 'cash' ? 'Contanti alla consegna' : method === 'paypal' ? 'PayPal' : 'Carta di credito',
      pickup_date: pickupDate,
      notes: notes || 'Nessuna nota',
      order_date: new Date().toLocaleString('it-IT')
    };

    try {
      await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
        templateParams,
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
      );
      console.log('Email inviata con successo');
    } catch (error) {
      console.error('Errore invio email:', error);
    }
  };

  return (
    <PayPalScriptProvider options={initialPayPalOptions}>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        {/* Header */}
        <header className="bg-white shadow-lg sticky top-0 z-40">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  Pasto Sano
                </h1>
              </div>
              <button 
                onClick={() => setIsCartOpen(true)}
                className="relative bg-gradient-to-r from-green-500 to-blue-500 text-white p-3 rounded-full hover:shadow-lg transition-all duration-300 hover:scale-105"
              >
                <ShoppingCart className="w-6 h-6" />
                {getTotalItems() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
                    {getTotalItems()}
                  </span>
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Mangia Sano, Vivi Meglio
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Pasti equilibrati consegnati a casa tua
            </p>
            <div className="flex justify-center space-x-8 flex-wrap">
              <div className="flex items-center space-x-2">
                <Truck className="w-5 h-5" />
                <span>Consegna Gratuita</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5" />
                <span>Consegna in 24h</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5" />
                <span>Ingredienti Premium</span>
              </div>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="container mx-auto px-4 py-8">
          <div className="flex space-x-4 overflow-x-auto pb-4">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2 rounded-full whitespace-nowrap transition-all duration-300 ${
                  selectedCategory === category
                    ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg scale-105'
                    : 'bg-white text-gray-700 hover:shadow-md'
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
            {filteredMeals.map((meal, index) => (
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
                  <div className="absolute top-2 right-2 bg-white px-3 py-1 rounded-full shadow-md">
                    <span className="font-bold text-green-600">€{meal.price.toFixed(2)}</span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2 text-gray-800">{meal.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">{meal.description}</p>
                  <button
                    onClick={() => addToCart(meal)}
                    className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-2 rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-2"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Aggiungi</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cart Sidebar */}
        {isCartOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <div 
              className="absolute inset-0 bg-black bg-opacity-50"
              onClick={() => setIsCartOpen(false)}
            />
            <div className="relative bg-white w-full max-w-md h-full overflow-y-auto">
              <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
                <h2 className="text-2xl font-bold">Carrello</h2>
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
                </div>
              ) : (
                <>
                  <div className="p-4 space-y-4">
                    {cart.map(item => (
                      <div key={item.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold flex-1">{item.name}</h4>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-500 hover:text-red-700 ml-2"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => updateQuantity(item.id, -1)}
                              className="w-8 h-8 bg-white rounded-lg hover:bg-gray-200 flex items-center justify-center transition-colors"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-8 text-center font-semibold">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, 1)}
                              className="w-8 h-8 bg-white rounded-lg hover:bg-gray-200 flex items-center justify-center transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          <span className="font-bold text-green-600">
                            €{(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="sticky bottom-0 bg-white border-t p-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-xl font-bold">Totale:</span>
                      <span className="text-2xl font-bold text-green-600">
                        €{getTotalPrice().toFixed(2)}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setShowCheckout(true);
                        setIsCartOpen(false);
                      }}
                      className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-3 rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105 font-semibold"
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
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Indirizzo di consegna
                      </label>
                      <input
                        type="text"
                        value={customerAddress}
                        onChange={(e) => setCustomerAddress(e.target.value)}
                        className="w-full p-3 border rounded-lg focus:outline-none focus:border-green-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Data e ora ritiro/consegna *
                      </label>
                      <input
                        type="datetime-local"
                        value={pickupDate}
                        onChange={(e) => setPickupDate(e.target.value)}
                        min={new Date().toISOString().slice(0, 16)}
                        className="w-full p-3 border rounded-lg focus:outline-none focus:border-green-500"
                        required
                      />
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
                        placeholder="Allergie, preferenze, istruzioni per la consegna..."
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                      <AlertCircle className="w-5 h-5" />
                      <span>{error}</span>
                    </div>
                  )}

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
                      <span className="font-semibold">Contanti alla Consegna</span>
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
                    <p>Totale: €{getTotalPrice().toFixed(2)}</p>
                    <p>Articoli: {getTotalItems()}</p>
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
                    <p>Totale: €{getTotalPrice().toFixed(2)}</p>
                    <p>Articoli: {getTotalItems()}</p>
                  </div>
                  <PayPalButtons
                    createOrder={(data, actions) => {
                      return actions.order.create({
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
                  <h3 className="text-lg font-semibold">Contanti alla Consegna</h3>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-yellow-800">
                      <strong>Importante:</strong> Prepara l'importo esatto di €{getTotalPrice().toFixed(2)} in contanti per la consegna.
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-semibold mb-2">Riepilogo Ordine:</p>
                    <p>Totale da pagare: €{getTotalPrice().toFixed(2)}</p>
                    <p>Articoli: {getTotalItems()}</p>
                    <p>Consegna: {pickupDate ? new Date(pickupDate).toLocaleString('it-IT') : 'Da definire'}</p>
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
      </div>
    </PayPalScriptProvider>
  );
}