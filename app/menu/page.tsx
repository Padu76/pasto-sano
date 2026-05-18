// E:\pasto-sano\app\menu\page.tsx
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  ShoppingCart,
  MessageCircle,
  Menu as MenuIcon,
  X,
  Flame,
  ChefHat,
  Package,
} from 'lucide-react';
import { PRONTI, DA_CUCINARE, type MenuItem } from '@/lib/menuRotativo';

export default function MenuPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState<'tutti' | 'pronti' | 'da-cuocere'>('tutti');

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 24);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const whatsappUrl =
    'https://wa.me/393478881515?text=Ciao%20Pasto%20Sano%2C%20vorrei%20info%20sul%20menu';

  return (
    <div className="min-h-screen bg-white text-ink-950 font-sans">
      {/* Sticky CTA mobile */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-ink-950 border-t border-ink-800 px-4 py-3 shadow-2xl">
        <div className="flex items-center gap-2">
          <Link
            href="/ordina"
            className="flex-1 bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <ShoppingCart className="w-5 h-5" />
            Ordina ora
          </Link>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp"
            className="bg-[#25D366] hover:bg-[#1da851] text-white p-3 rounded-xl transition-all active:scale-95"
          >
            <MessageCircle className="w-5 h-5" />
          </a>
        </div>
      </div>

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
              <Link href="/menu" className="text-white px-4 py-2 text-sm font-medium border-b-2 border-primary-500">
                Menu
              </Link>
              <Link
                href="/ordina"
                className="ml-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold px-5 py-2.5 rounded-full text-sm transition-all hover:shadow-glow-primary"
              >
                Ordina ora
              </Link>
            </div>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-white"
              aria-label="Menu"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
          </div>

          {isMenuOpen && (
            <div className="lg:hidden mt-4 pb-2 border-t border-ink-800 pt-4 space-y-1">
              <Link href="/" className="block text-white/80 hover:text-white px-2 py-3 text-base font-medium border-b border-ink-800">
                Home
              </Link>
              <Link href="/menu" className="block text-white px-2 py-3 text-base font-medium border-b border-ink-800">
                Menu
              </Link>
              <Link
                href="/ordina"
                className="block w-full bg-primary-500 text-white font-semibold py-3 rounded-xl text-center mt-3"
              >
                Ordina ora
              </Link>
            </div>
          )}
        </nav>
      </header>

      {/* Hero */}
      <section className="relative bg-ink-950 text-white pt-28 lg:pt-36 pb-12 lg:pb-16 overflow-hidden">
        <div className="absolute top-0 -left-32 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 bg-primary-500/10 border border-primary-500/30 text-primary-400 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
              <Package className="w-4 h-4" />
              Il nostro menu
            </div>
            <h1 className="font-display font-black tracking-tightest text-5xl sm:text-6xl lg:text-7xl leading-[0.95] uppercase mb-6">
              Carne di qualità.
              <br />
              <span className="text-primary-500">Pronta o da cuocere.</span>
            </h1>
            <p className="text-lg lg:text-xl text-white/80 max-w-2xl">
              Pasti pronti da scaldare in 2 minuti e tagli freschi da cuocere a casa.
              Selezionati per i clienti di Tribù Studio.
            </p>
          </div>
        </div>
      </section>

      {/* Tabs filter */}
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

      <main className="container mx-auto px-4 lg:px-8 py-12 lg:py-16">
        {/* PASTI PRONTI */}
        {(activeTab === 'tutti' || activeTab === 'pronti') && (
          <section className="mb-16">
            <SectionHeader
              eyebrow="Pasti pronti"
              title="Pronti da scaldare"
              desc="Apri la confezione, 2 minuti al microonde o in padella, mangi."
              icon={<Flame className="w-5 h-5" />}
            />
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6 mt-8">
              {PRONTI.map((item, i) => (
                <ProductCard key={i} item={item} />
              ))}
            </div>
          </section>
        )}

        {/* DA CUCINARE */}
        {(activeTab === 'tutti' || activeTab === 'da-cuocere') && (
          <section>
            <SectionHeader
              eyebrow="Da cucinare"
              title="Carne fresca da cuocere"
              desc="Tagli freschi selezionati. Cuoci a casa come preferisci."
              icon={<ChefHat className="w-5 h-5" />}
            />
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6 mt-8">
              {DA_CUCINARE.map((item, i) => (
                <ProductCard key={i} item={item} />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* CTA finale */}
      <section className="bg-ink-950 text-white py-16 lg:py-24">
        <div className="container mx-auto px-4 lg:px-8 text-center max-w-2xl">
          <h2 className="font-display font-black text-4xl lg:text-5xl tracking-tightest uppercase mb-4">
            Pronto a ordinare?
          </h2>
          <p className="text-white/80 mb-8">
            Ritiro in Via Albere, dentro Tribù Studio. Ordina entro le 18:00 per il ritiro del giorno dopo.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/ordina"
              className="bg-primary-500 hover:bg-primary-600 text-white font-semibold px-7 py-4 rounded-full inline-flex items-center justify-center gap-2 transition-all hover:shadow-glow-primary"
            >
              Vai al carrello
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white font-semibold px-7 py-4 rounded-full inline-flex items-center justify-center gap-2 transition-all"
            >
              <MessageCircle className="w-5 h-5" />
              Chiedi info
            </a>
          </div>
        </div>
      </section>
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

function ProductCard({ item }: { item: MenuItem }) {
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
          <Link
            href="/ordina"
            className="bg-ink-950 hover:bg-primary-500 text-white p-2 rounded-full transition-colors"
            aria-label={`Ordina ${item.nome}`}
          >
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
