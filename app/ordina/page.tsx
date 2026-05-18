// E:\pasto-sano\app\ordina\page.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ShoppingCart,
  Plus,
  Minus,
  Menu as MenuIcon,
  X,
  MessageCircle,
  Flame,
  ChefHat,
  Package,
} from 'lucide-react';

import CartModal from '@/components/ordina/CartModal';
import CheckoutModal from '@/components/ordina/CheckoutModal';
import { PRONTI, DA_CUCINARE, type MenuItem } from '@/lib/menuRotativo';

interface CartItem extends MenuItem {
  id: string;
  quantity: number;
}

const MINIMUM_ITEMS = 3;

export default function OrdinaPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState<'tutti' | 'pronti' | 'da-cuocere'>('tutti');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 24);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Carica carrello salvato
  useEffect(() => {
    const saved = localStorage.getItem('pastosano_cart');
    if (saved) {
      try {
        setCart(JSON.parse(saved));
      } catch {
        // Carrello corrotto, ignoro
      }
    }
  }, []);

  // Salva carrello
  useEffect(() => {
    localStorage.setItem('pastosano_cart', JSON.stringify(cart));
  }, [cart]);

  const totalItems = useMemo(
    () => cart.reduce((acc, item) => acc + item.quantity, 0),
    [cart]
  );

  const totalPrice = useMemo(
    () => cart.reduce((acc, item) => acc + item.prezzo * item.quantity, 0),
    [cart]
  );

  const addToCart = (product: MenuItem) => {
    setCart((prev) => {
      const existingIdx = prev.findIndex((c) => c.nome === product.nome);
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = { ...updated[existingIdx], quantity: updated[existingIdx].quantity + 1 };
        return updated;
      }
      return [
        ...prev,
        {
          ...product,
          id: `${product.nome}-${Date.now()}`,
          quantity: 1,
        },
      ];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => (item.id === id ? { ...item, quantity: item.quantity + delta } : item))
        .filter((item) => item.quantity > 0)
    );
  };

  const removeItem = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const getQuantityInCart = (productName: string) => {
    return cart.find((c) => c.nome === productName)?.quantity || 0;
  };

  const handleOrderComplete = () => {
    setCart([]);
    setIsCheckoutOpen(false);
    setIsCartOpen(false);
    localStorage.removeItem('pastosano_cart');
  };

  const openCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const whatsappUrl =
    'https://wa.me/393478881515?text=Ciao%20Pasto%20Sano%2C%20vorrei%20info%20sul%20menu';

  return (
    <div className="min-h-screen bg-white text-ink-950 font-sans pb-24 lg:pb-0">
      {/* Sticky cart bar mobile */}
      {totalItems > 0 && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-ink-950 border-t border-ink-800 px-4 py-3 shadow-2xl">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-between gap-2 transition-all active:scale-95"
          >
            <span className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              {totalItems} {totalItems === 1 ? 'articolo' : 'articoli'}
            </span>
            <span className="font-display font-black text-lg">€{totalPrice.toFixed(2)}</span>
          </button>
        </div>
      )}

      {/* Header */}
      <header
        className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-ink-950/95 backdrop-blur-md border-b border-ink-800 py-3'
            : 'bg-ink-950 py-4'
        }`}
      >
        <nav className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <Image src="/images/logo.png" alt="Pasto Sano" width={40} height={40} className="rounded-lg" />
              <span className="text-white font-display font-bold text-xl tracking-tightest">
                PASTO<span className="text-primary-500">.</span>SANO
              </span>
            </Link>

            <div className="hidden lg:flex items-center gap-1">
              <Link href="/" className="text-white/80 hover:text-white px-4 py-2 text-sm font-medium">
                Home
              </Link>
              <Link href="/menu" className="text-white/80 hover:text-white px-4 py-2 text-sm font-medium">
                Menu
              </Link>
              <button
                onClick={() => setIsCartOpen(true)}
                className="ml-3 relative bg-primary-500 hover:bg-primary-600 text-white font-semibold px-5 py-2.5 rounded-full text-sm transition-all hover:shadow-glow-primary flex items-center gap-2"
              >
                <ShoppingCart className="w-4 h-4" />
                Carrello
                {totalItems > 0 && (
                  <span className="bg-white text-primary-700 text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>

            <div className="lg:hidden flex items-center gap-2">
              {totalItems > 0 && (
                <button
                  onClick={() => setIsCartOpen(true)}
                  className="relative bg-primary-500 text-white p-2 rounded-full"
                  aria-label="Carrello"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 bg-lemon-400 text-ink-950 text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {totalItems}
                  </span>
                </button>
              )}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 text-white"
                aria-label="Menu"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {isMenuOpen && (
            <div className="lg:hidden mt-4 pb-2 border-t border-ink-800 pt-4 space-y-1">
              <Link href="/" onClick={() => setIsMenuOpen(false)} className="block text-white/80 hover:text-white px-2 py-3 text-base font-medium border-b border-ink-800">
                Home
              </Link>
              <Link href="/menu" onClick={() => setIsMenuOpen(false)} className="block text-white/80 hover:text-white px-2 py-3 text-base font-medium border-b border-ink-800">
                Menu
              </Link>
            </div>
          )}
        </nav>
      </header>

      {/* Hero */}
      <section className="relative bg-ink-950 text-white pt-28 lg:pt-36 pb-10 lg:pb-12 overflow-hidden">
        <div className="absolute top-0 -left-32 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 bg-primary-500/10 border border-primary-500/30 text-primary-400 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
              <Package className="w-4 h-4" />
              Ordina online
            </div>
            <h1 className="font-display font-black tracking-tightest text-4xl sm:text-5xl lg:text-6xl leading-[0.95] uppercase mb-4">
              Crea il tuo ordine
            </h1>
            <p className="text-base lg:text-lg text-white/80">
              Aggiungi i prodotti al carrello. Ordine minimo {MINIMUM_ITEMS} articoli. Ritiro in Via Albere entro 2 giorni.
            </p>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div className="sticky top-[68px] lg:top-[76px] z-30 bg-white border-b border-ink-100">
        <div className="container mx-auto px-4 lg:px-8 py-4">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {[
              { key: 'tutti', label: 'Tutti', count: PRONTI.length + DA_CUCINARE.length },
              { key: 'pronti', label: 'Pronti', count: PRONTI.length },
              { key: 'da-cuocere', label: 'Da cucinare', count: DA_CUCINARE.length },
            ].map((tab) => {
              const active = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all border ${
                    active
                      ? 'bg-ink-950 text-white border-ink-950'
                      : 'bg-white text-ink-700 border-ink-200 hover:border-ink-400'
                  }`}
                >
                  {tab.label}
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      active ? 'bg-primary-500 text-white' : 'bg-ink-100 text-ink-600'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 lg:px-8 py-10 lg:py-14">
        {/* Banner sottovuoto */}
        <div className="bg-primary-50 border border-primary-200 rounded-2xl p-5 lg:p-6 mb-10 flex items-start gap-4">
          <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <Package className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-display font-bold text-base lg:text-lg text-ink-950 mb-1">
              Tutti i prodotti sono confezionati sottovuoto
            </p>
            <p className="text-sm lg:text-base text-ink-700">
              Si conservano da <strong>10 a 15 giorni in frigorifero</strong>. Puoi anche congelarli per una durata maggiore.
            </p>
          </div>
        </div>

        {/* Pronti */}
        {(activeTab === 'tutti' || activeTab === 'pronti') && (
          <section className="mb-14">
            <SectionHeader
              eyebrow="Pasti pronti"
              title="Pronti da scaldare"
              desc="Apri, scaldi 2 minuti, mangi."
              icon={<Flame className="w-5 h-5" />}
            />
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6 mt-8">
              {PRONTI.map((item, i) => (
                <OrderProductCard
                  key={`pronti-${i}`}
                  item={item}
                  quantity={getQuantityInCart(item.nome)}
                  onAdd={() => addToCart(item)}
                  onIncrease={() => {
                    const existing = cart.find((c) => c.nome === item.nome);
                    if (existing) updateQuantity(existing.id, 1);
                  }}
                  onDecrease={() => {
                    const existing = cart.find((c) => c.nome === item.nome);
                    if (existing) updateQuantity(existing.id, -1);
                  }}
                />
              ))}
            </div>
          </section>
        )}

        {/* Da cucinare */}
        {(activeTab === 'tutti' || activeTab === 'da-cuocere') && (
          <section>
            <SectionHeader
              eyebrow="Da cucinare"
              title="Carne fresca da cuocere"
              desc="Tagli freschi, da cuocere a casa."
              icon={<ChefHat className="w-5 h-5" />}
            />
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6 mt-8">
              {DA_CUCINARE.map((item, i) => (
                <OrderProductCard
                  key={`crudi-${i}`}
                  item={item}
                  quantity={getQuantityInCart(item.nome)}
                  onAdd={() => addToCart(item)}
                  onIncrease={() => {
                    const existing = cart.find((c) => c.nome === item.nome);
                    if (existing) updateQuantity(existing.id, 1);
                  }}
                  onDecrease={() => {
                    const existing = cart.find((c) => c.nome === item.nome);
                    if (existing) updateQuantity(existing.id, -1);
                  }}
                />
              ))}
            </div>
          </section>
        )}

        {/* Help */}
        <div className="mt-16 bg-ink-50 rounded-3xl p-8 lg:p-12 text-center">
          <h3 className="font-display font-bold text-2xl lg:text-3xl mb-3">
            Hai bisogno di aiuto?
          </h3>
          <p className="text-ink-600 mb-6 max-w-xl mx-auto">
            Scrivici su WhatsApp e Andrea ti consiglia personalmente quali prodotti scegliere.
          </p>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1da851] text-white font-semibold px-6 py-3 rounded-full transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            Scrivici su WhatsApp
          </a>
        </div>
      </main>

      {/* Cart Modal */}
      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeItem}
        onCheckout={openCheckout}
        minimumItems={MINIMUM_ITEMS}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cart}
        onOrderComplete={handleOrderComplete}
        minimumItems={MINIMUM_ITEMS}
      />
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  desc,
  icon,
}: {
  eyebrow: string;
  title: string;
  desc: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-2 text-primary-600 font-semibold text-sm uppercase tracking-wider mb-3">
        {icon}
        {eyebrow}
      </div>
      <h2 className="font-display font-black text-3xl lg:text-5xl leading-[0.95] tracking-tightest uppercase mb-3">
        {title}
      </h2>
      <p className="text-ink-600 text-base lg:text-lg">{desc}</p>
    </div>
  );
}

function OrderProductCard({
  item,
  quantity,
  onAdd,
  onIncrease,
  onDecrease,
}: {
  item: MenuItem;
  quantity: number;
  onAdd: () => void;
  onIncrease: () => void;
  onDecrease: () => void;
}) {
  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col">
      <div className="relative aspect-square overflow-hidden bg-ink-100">
        <Image
          src={item.immagine}
          alt={item.nome}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3 bg-ink-950/80 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
          {item.peso}
        </div>
        {item.categoria === 'da-cuocere' && (
          <div className="absolute top-3 right-3 bg-lemon-400 text-ink-950 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
            Da cuocere
          </div>
        )}
      </div>
      <div className="p-4 lg:p-5 flex flex-col flex-1">
        <h3 className="font-display font-bold text-base lg:text-lg leading-tight mb-1.5 line-clamp-2">
          {item.nome}
        </h3>
        {item.formato && (
          <p className="text-xs text-ink-500 mb-2">{item.formato}</p>
        )}
        <p className="text-sm text-ink-600 mb-4 line-clamp-2 flex-1">{item.descrizione}</p>

        <div className="flex items-center justify-between pt-3 border-t border-ink-100">
          <div className="font-display font-bold text-xl">€{item.prezzo.toFixed(2)}</div>
          {quantity === 0 ? (
            <button
              onClick={onAdd}
              className="bg-ink-950 hover:bg-primary-500 text-white font-semibold px-4 py-2 rounded-full text-sm transition-colors flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Aggiungi
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={onDecrease}
                className="w-8 h-8 bg-ink-100 hover:bg-ink-200 text-ink-950 rounded-full flex items-center justify-center transition-colors"
                aria-label="Riduci"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="font-bold text-base min-w-[20px] text-center">{quantity}</span>
              <button
                onClick={onIncrease}
                className="w-8 h-8 bg-primary-500 hover:bg-primary-600 text-white rounded-full flex items-center justify-center transition-colors"
                aria-label="Aumenta"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
