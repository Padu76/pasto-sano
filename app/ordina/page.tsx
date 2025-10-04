'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  ShoppingCart,
  ArrowLeft,
  ShoppingBag,
  Mail,
  MessageCircle,
  Globe,
  Clock,
  Star,
  MapPin,
  Calendar
} from 'lucide-react';

// Import componenti
import ProductCard from '@/components/ordina/ProductCard';
import MenuGrid from '@/components/ordina/MenuGrid';
import CartModal from '@/components/ordina/CartModal';
import CheckoutModal from '@/components/ordina/CheckoutModal';
import DateSelector from '@/components/ordina/DateSelector';
import MenuCategories from '@/components/ordina/MenuCategories';
import ComboSelector from '@/components/ordina/ComboSelector';

// Import funzioni menu
import { 
  getMenuGiornoSpecifico, 
  MENU_FISSO, 
  MENU_COMBO,
  MenuItem 
} from '@/lib/menuRotativo';

// Estende MenuItem per il carrello
interface CartItem extends MenuItem {
  id: string;
  quantity: number;
  pickupDate: string; // Data di ritiro in formato YYYY-MM-DD
  isCombo?: boolean;
  comboItems?: {
    primo?: string;
    secondo?: string;
    contorno?: string;
    macedonia?: boolean;
  };
}

const MINIMUM_ITEMS = 3;
const MIN_DAYS_ADVANCE = 2;

// Helper per convertire Date in stringa YYYY-MM-DD locale
function dateToLocalString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Helper per convertire stringa YYYY-MM-DD in Date locale
function localStringToDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export default function OrdinaPage() {
  // Stati principali
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    // Inizializza con data minima (oggi + 2 giorni)
    const minDate = new Date();
    minDate.setDate(minDate.getDate() + MIN_DAYS_ADVANCE);
    return minDate;
  });
  
  const [menuDelGiorno, setMenuDelGiorno] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState('menu-giorno');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  
  // Stati combo
  const [isComboSelectorOpen, setIsComboSelectorOpen] = useState(false);
  const [selectedCombo, setSelectedCombo] = useState<MenuItem | null>(null);

  // Carica menu della data selezionata per il ritiro
  useEffect(() => {
    const menu = getMenuGiornoSpecifico(selectedDate);
    setMenuDelGiorno(menu);
  }, [selectedDate]);

  // Carica carrello salvato
  useEffect(() => {
    const savedCart = localStorage.getItem('pastosano_cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  // Salva carrello
  useEffect(() => {
    if (cart.length > 0) {
      localStorage.setItem('pastosano_cart', JSON.stringify(cart));
    } else {
      localStorage.removeItem('pastosano_cart');
    }
  }, [cart]);

  // Formatta data per visualizzazione
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('it-IT', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Gestione aggiunta al carrello
  const handleAddToCart = (item: MenuItem) => {
    // Se è un combo, apri il selettore
    if (item.categoria === 'combo') {
      setSelectedCombo(item);
      setIsComboSelectorOpen(true);
      return;
    }

    // Altrimenti aggiungi direttamente con data di ritiro
    const cartItem: CartItem = {
      ...item,
      id: `${item.categoria}-${item.nome}-${Date.now()}`,
      quantity: 1,
      pickupDate: dateToLocalString(selectedDate) // FIX: salva come YYYY-MM-DD
    };

    addItemToCart(cartItem);
  };

  // Aggiunge item al carrello
  const addItemToCart = (item: CartItem) => {
    setCart([...cart, item]);
    
    // Mostra notifica
    const pickupDateObj = localStringToDate(item.pickupDate); // FIX: riconverti correttamente
    showNotification(`${item.nome} aggiunto per il ${formatDate(pickupDateObj)}`);
  };

  // Gestione conferma combo
  const handleComboConfirm = (comboItems: any) => {
    if (!selectedCombo) return;

    const cartItem: CartItem = {
      ...selectedCombo,
      id: `combo-${Date.now()}`,
      quantity: 1,
      isCombo: true,
      comboItems,
      pickupDate: dateToLocalString(selectedDate) // FIX: salva come YYYY-MM-DD
    };

    addItemToCart(cartItem);
    setSelectedCombo(null);
  };

  // Aggiorna quantità
  const updateQuantity = (id: string, delta: number) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQuantity = Math.max(0, item.quantity + delta);
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
      }
      return item;
    }).filter(Boolean) as CartItem[]);
  };

  // Rimuovi item
  const removeItem = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  // Procedi al checkout
  const handleCheckout = () => {
    if (getTotalItems() >= MINIMUM_ITEMS) {
      setIsCartOpen(false);
      setIsCheckoutOpen(true);
    }
  };

  // Ordine completato
  const handleOrderComplete = () => {
    setCart([]);
    localStorage.removeItem('pastosano_cart');
    setIsCheckoutOpen(false);
  };

  // Calcola totale items
  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  // Notifica semplice
  const showNotification = (message: string) => {
    const notification = document.createElement('div');
    notification.className = 'fixed bottom-20 right-6 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-up max-w-xs text-sm';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 4000);
  };

  // Filtra items per categoria
  const getItemsForCategory = () => {
    switch(selectedCategory) {
      case 'menu-giorno':
        if (!menuDelGiorno) return [];
        return [
          ...menuDelGiorno.menuGiornaliero.primi,
          ...menuDelGiorno.menuGiornaliero.secondi,
          ...menuDelGiorno.menuGiornaliero.contorni
        ];
      
      case 'combo':
        return MENU_COMBO;
      
      case 'focacce':
        return MENU_FISSO.filter(item => item.categoria === 'focaccia');
      
      case 'piadine':
        return MENU_FISSO.filter(item => item.categoria === 'piadina');
      
      case 'insalatone':
        return MENU_FISSO.filter(item => item.categoria === 'insalatona');
      
      case 'extra':
        return MENU_FISSO.filter(item => item.categoria === 'extra');
      
      default:
        return [];
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-amber-50 to-orange-50 shadow-lg sticky top-0 z-30 border-b-2 border-orange-200">
        <div className="container mx-auto px-3 py-3 md:px-4 md:py-4">
          <div className="flex justify-between items-center">
            <Link 
              href="/"
              className="flex items-center gap-2 text-amber-700 hover:text-amber-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Torna alla Homepage</span>
            </Link>
            
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
                <p className="text-[10px] md:text-xs text-amber-700 hidden sm:block">Ordina il tuo menu</p>
              </div>
            </div>
            
            <div className="w-16"></div>
          </div>
        </div>
      </header>

      {/* Bottone carrello flottante */}
      <button 
        onClick={() => setIsCartOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-orange-500 to-amber-500 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 animate-pulse"
      >
        <ShoppingCart className="w-6 h-6 md:w-7 md:h-7" />
        {getTotalItems() > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 md:w-7 md:h-7 flex items-center justify-center animate-bounce border-2 border-white">
            {getTotalItems()}
          </span>
        )}
      </button>

      {/* Alert ordine minimo */}
      {cart.length > 0 && getTotalItems() < MINIMUM_ITEMS && (
        <div className="fixed bottom-24 right-6 z-30 bg-gradient-to-r from-red-500 to-red-600 text-white p-3 rounded-lg shadow-xl max-w-xs">
          <div className="flex items-start gap-2">
            <ShoppingBag className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-semibold">Ordine minimo: {MINIMUM_ITEMS} pezzi</p>
              <p className="opacity-90">Hai {getTotalItems()} pezzo/i. Aggiungi ancora {MINIMUM_ITEMS - getTotalItems()}.</p>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-amber-700 via-orange-600 to-amber-800 text-white py-8 md:py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3">
            Ordina il tuo Menu
          </h2>
          <p className="text-base sm:text-lg opacity-95 mb-6">
            Scegli quando ritirare e cosa ordinare
          </p>
          
          {/* Info data ritiro selezionata */}
          <div className="bg-white/20 backdrop-blur-sm px-4 py-3 rounded-lg mb-6 max-w-2xl mx-auto">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <div className="flex items-center gap-2 text-yellow-300">
                <Calendar className="w-5 h-5" />
                <span className="font-semibold">Stai ordinando per:</span>
              </div>
              <span className="text-lg font-bold capitalize">
                {formatDate(selectedDate)}
              </span>
            </div>
          </div>
          
          <div className="bg-white/20 backdrop-blur-sm px-4 py-3 rounded-lg mb-6 max-w-md mx-auto">
            <div className="flex items-center justify-center gap-2 text-yellow-300">
              <ShoppingBag className="w-5 h-5" />
              <span className="font-semibold">Ordine minimo: {MINIMUM_ITEMS} pezzi</span>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-3 py-2 rounded-full text-sm">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span>Ritiro presso sede</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-3 py-2 rounded-full text-sm">
              <Clock className="w-4 h-4 flex-shrink-0" />
              <span>Ordina con 2 giorni di anticipo</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-3 py-2 rounded-full text-sm">
              <Star className="w-4 h-4 flex-shrink-0" />
              <span>Ingredienti Premium</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Date Selector */}
        <DateSelector 
          onDateChange={setSelectedDate}
          minDaysAdvance={MIN_DAYS_ADVANCE}
        />

        {/* Banner info menu */}
        {menuDelGiorno && !menuDelGiorno.isWeekend && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <Calendar className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-blue-900 mb-1">
                  Menu disponibile per il {formatDate(selectedDate)}
                </h3>
                <p className="text-sm text-blue-700">
                  Settimana {menuDelGiorno.settimana.replace('settimana', '')} del mese - 
                  Menu del {menuDelGiorno.giorno}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Banner Weekend */}
        {menuDelGiorno && menuDelGiorno.isWeekend && (
          <div className="bg-gradient-to-r from-gray-100 to-gray-200 border-2 border-gray-300 rounded-xl p-8 mb-6 text-center">
            <div className="flex flex-col items-center gap-4">
              <Calendar className="w-16 h-16 text-gray-400" />
              <div>
                <h3 className="text-2xl font-bold text-gray-700 mb-2">
                  Menu non disponibile nel weekend
                </h3>
                <p className="text-gray-600">
                  Il menu giornaliero è disponibile solo da lunedì a venerdì.
                </p>
                <p className="text-gray-600 mt-2">
                  Puoi comunque ordinare focacce, piadine, insalatone e altri prodotti sempre disponibili.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Menu Categories */}
        <MenuCategories
          activeCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          dailyMenuAvailable={menuDelGiorno && !menuDelGiorno.isWeekend}
        />

        {/* Menu Items */}
        {selectedCategory === 'menu-giorno' && menuDelGiorno && !menuDelGiorno.isWeekend ? (
          <div className="space-y-8">
            {menuDelGiorno.menuGiornaliero.primi.length > 0 && (
              <MenuGrid
                title="Primi Piatti"
                emoji="🍝"
                items={menuDelGiorno.menuGiornaliero.primi}
                onAddToCart={handleAddToCart}
                colorScheme="amber"
              />
            )}
            
            {menuDelGiorno.menuGiornaliero.secondi.length > 0 && (
              <MenuGrid
                title="Secondi Piatti"
                emoji="🥘"
                items={menuDelGiorno.menuGiornaliero.secondi}
                onAddToCart={handleAddToCart}
                colorScheme="blue"
              />
            )}
            
            {menuDelGiorno.menuGiornaliero.contorni.length > 0 && (
              <MenuGrid
                title="Contorni"
                emoji="🥗"
                items={menuDelGiorno.menuGiornaliero.contorni}
                onAddToCart={handleAddToCart}
                colorScheme="green"
              />
            )}
          </div>
        ) : selectedCategory === 'menu-giorno' && menuDelGiorno && menuDelGiorno.isWeekend ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              Seleziona un giorno feriale per visualizzare il menu del giorno
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {getItemsForCategory().map((item, index) => (
              <ProductCard
                key={`${item.categoria}-${item.nome}-${index}`}
                item={item}
                onAddToCart={handleAddToCart}
                colorScheme={
                  selectedCategory === 'combo' ? 'purple' :
                  selectedCategory === 'focacce' ? 'amber' :
                  selectedCategory === 'piadine' ? 'green' :
                  selectedCategory === 'insalatone' ? 'blue' :
                  'amber'
                }
              />
            ))}
          </div>
        )}
      </div>

      {/* Modali */}
      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeItem}
        onCheckout={handleCheckout}
        minimumItems={MINIMUM_ITEMS}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cart}
        onOrderComplete={handleOrderComplete}
        minimumItems={MINIMUM_ITEMS}
      />

      <ComboSelector
        isOpen={isComboSelectorOpen}
        onClose={() => {
          setIsComboSelectorOpen(false);
          setSelectedCombo(null);
        }}
        comboType={selectedCombo?.nome || ''}
        comboPrice={selectedCombo?.prezzo || 0}
        availableItems={{
          primi: menuDelGiorno?.menuGiornaliero.primi || [],
          secondi: menuDelGiorno?.menuGiornaliero.secondi || [],
          contorni: menuDelGiorno?.menuGiornaliero.contorni || []
        }}
        onConfirm={handleComboConfirm}
      />

      {/* Footer */}
      <footer className="bg-gradient-to-r from-amber-900 to-amber-950 text-white mt-16">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <div className="text-center">
              <div className="flex items-center justify-center mb-3">
                <Image 
                  src="/images/logo.png" 
                  alt="Pasto Sano" 
                  width={70} 
                  height={70}
                  className="object-contain"
                />
              </div>
              <h3 className="text-lg font-bold mb-2 text-yellow-400">Pasto Sano</h3>
              <p className="text-xs opacity-90">
                Menu freschi ogni giorno.<br />
                Qualità e gusto garantiti.
              </p>
            </div>

            <div className="text-center">
              <h4 className="text-base font-semibold mb-3 text-yellow-400">Contatti</h4>
              <div className="space-y-3">
                <a 
                  href="mailto:info@pastosano.it"
                  className="flex items-center justify-center gap-2 hover:text-yellow-400 transition text-sm"
                >
                  <Mail className="w-4 h-4" />
                  <span>info@pastosano.it</span>
                </a>
                <a 
                  href="https://wa.me/393478881515?text=Ciao%20Pasto%20Sano,%20vorrei%20informazioni"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full transition transform hover:scale-105 text-sm"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span className="font-semibold">WhatsApp</span>
                </a>
                <a 
                  href="https://www.pastosano.it"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 hover:text-yellow-400 transition text-sm"
                >
                  <Globe className="w-4 h-4" />
                  <span>www.pastosano.it</span>
                </a>
              </div>
            </div>

            <div className="text-center">
              <h4 className="text-base font-semibold mb-3 text-yellow-400">Ritiro Ordini</h4>
              <div className="space-y-1 text-xs opacity-90">
                <p>Lunedì - Venerdì</p>
                <p className="font-semibold text-yellow-300">Orario da concordare</p>
                <p className="mt-2">Via Albere 27/B, Verona</p>
                <p className="mt-2 text-yellow-300 font-semibold">
                  Ordine minimo: {MINIMUM_ITEMS} pezzi
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-yellow-800/30 mt-6 pt-4 text-center text-xs opacity-75">
            <p>© 2024 Pasto Sano - Tutti i diritti riservati</p>
          </div>
        </div>
      </footer>

      {/* Stili animazione */}
      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}