'use client';

import { useState } from 'react';
import { ShoppingCart, Plus, Minus, X, Check, CreditCard, Smartphone, Truck, Clock, Heart, Star } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import emailjs from '@emailjs/browser';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const meals = [
  {
    id: 1,
    name: "Fusilli, Macinato Manzo, Zucchine, Melanzane",
    description: "Piatto completo con fusilli integrali, verdure grigliate e manzo magro.",
    image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400",
    price: 8,
    category: "pasta",
    stripe_price_id: "price_fusilli" // Da creare in Stripe Dashboard
  },
  {
    id: 2,
    name: "Roastbeef, Patate al Forno, Fagiolini",
    description: "Tagliata di roastbeef con contorno di patate e fagiolini freschi.",
    image: "https://images.unsplash.com/photo-1432139509613-5c4255815697?w=400",
    price: 8,
    category: "carne",
    stripe_price_id: "price_roastbeef"
  },
  {
    id: 3,
    name: "Riso, Hamburger Manzo, Carotine Baby",
    description: "Hamburger di manzo cotto alla griglia con contorno e riso basmati.",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400",
    price: 8,
    category: "carne",
    stripe_price_id: "price_hamburger"
  },
  {
    id: 4,
    name: "Riso Nero, Gamberi, Tonno, Piselli",
    description: "Riso venere con pesce e verdure leggere.",
    image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400",
    price: 8,
    category: "pesce",
    stripe_price_id: "price_risonero"
  },
  {
    id: 5,
    name: "Patate, Salmone Grigliato, Broccoli",
    description: "Salmone alla griglia con patate al forno e broccoli al vapore.",
    image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400",
    price: 8,
    category: "pesce",
    stripe_price_id: "price_salmone"
  },
  {
    id: 6,
    name: "Pollo Grigliato, Patate al Forno, Zucchine",
    description: "Filetto di pollo alla griglia con contorno classico.",
    image: "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400",
    price: 8,
    category: "carne",
    stripe_price_id: "price_pollo"
  },
  {
    id: 7,
    name: "Orzo, Ceci, Feta, Pomodorini, Basilico",
    description: "Insalata di orzo fredda, ricca di proteine e gusto mediterraneo.",
    image: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400",
    price: 8,
    category: "vegetariano",
    stripe_price_id: "price_orzo"
  },
  {
    id: 8,
    name: "Tortillas, Tacchino Affumicato, Hummus Ceci, Insalata",
    description: "Wrap light con proteine magre e crema di ceci.",
    image: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400",
    price: 8,
    category: "wrap",
    stripe_price_id: "price_wrap_tacchino"
  },
  {
    id: 9,
    name: "Tortillas, Salmone Affumicato, Formaggio Spalmabile, Insalata",
    description: "Wrap gustoso con salmone affumicato e insalata fresca.",
    image: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400",
    price: 8,
    category: "wrap",
    stripe_price_id: "price_wrap_salmone"
  },
  {
    id: 10,
    name: "Riso, Pollo al Curry, Zucchine",
    description: "Piatto speziato con pollo al curry e verdure leggere.",
    image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400",
    price: 8,
    category: "carne",
    stripe_price_id: "price_curry"
  },
  {
    id: 11,
    name: "Uova Strapazzate, Bacon, Frutti di Bosco",
    description: "Colazione salata e proteica con uova e frutti rossi.",
    image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400",
    price: 6,
    category: "colazione",
    stripe_price_id: "price_uova"
  },
  {
    id: 12,
    name: "Pancakes",
    description: "Colazione dolce e bilanciata per iniziare al meglio la giornata.",
    image: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400",
    price: 6,
    category: "colazione",
    stripe_price_id: "price_pancakes"
  }
];

export default function Home() {
  const [cart, setCart] = useState<any[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('tutti');
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  const categories = ['tutti', 'pasta', 'carne', 'pesce', 'vegetariano', 'wrap', 'colazione'];

  const filteredMeals = selectedCategory === 'tutti' 
    ? meals 
    : meals.filter(meal => meal.category === selectedCategory);

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

  const sendOrderEmail = async () => {
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
      order_date: new Date().toLocaleString('it-IT')
    };

    try {
      await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
        templateParams,
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
      );
    } catch (error) {
      console.error('Errore invio email:', error);
    }
  };

  const handleStripeCheckout = async () => {
    setIsLoading(true);
    
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
          customerPhone
        }),
      });

      const { sessionId } = await response.json();
      const stripe = await stripePromise;
      
      if (stripe) {
        const { error } = await stripe.redirectToCheckout({ sessionId });
        if (error) {
          console.error('Errore Stripe:', error);
        }
      }
    } catch (error) {
      console.error('Errore checkout:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayPalCheckout = async () => {
    // Implementazione PayPal
    setIsLoading(true);
    await sendOrderEmail();
    setOrderComplete(true);
    setShowCheckout(false);
    setCart([]);
    setTimeout(() => setOrderComplete(false), 5000);
    setIsLoading(false);
  };

  return (
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
                  <span className="font-bold text-green-600">€{meal.price}</span>
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
            onClick={() => setShowCheckout(false)}
          />
          <div className="relative bg-white rounded-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-6">Checkout</h2>
            
            {/* Form dati cliente */}
            <div className="space-y-4 mb-6">
              <input
                type="text"
                placeholder="Nome e Cognome"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:border-blue-500"
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:border-blue-500"
                required
              />
              <input
                type="tel"
                placeholder="Telefono"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:border-blue-500"
                required
              />
              <input
                type="text"
                placeholder="Indirizzo di consegna"
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div className="space-y-4">
              <button
                onClick={handleStripeCheckout}
                disabled={isLoading || !customerName || !customerEmail || !customerAddress || !customerPhone}
                className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 transition-colors flex items-center justify-center space-x-3 disabled:opacity-50"
              >
                <CreditCard className="w-6 h-6 text-blue-500" />
                <span className="font-semibold">
                  {isLoading ? 'Elaborazione...' : 'Paga con Carta'}
                </span>
              </button>
              <button
                onClick={handlePayPalCheckout}
                disabled={isLoading || !customerName || !customerEmail || !customerAddress || !customerPhone}
                className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-yellow-500 transition-colors flex items-center justify-center space-x-3 disabled:opacity-50"
              >
                <Smartphone className="w-6 h-6 text-yellow-500" />
                <span className="font-semibold">
                  {isLoading ? 'Elaborazione...' : 'PayPal'}
                </span>
              </button>
            </div>
            <button
              onClick={() => setShowCheckout(false)}
              className="w-full mt-4 py-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              Annulla
            </button>
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
  );
}