// E:\pasto-sano\app\page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  ShoppingCart,
  Clock,
  Menu as MenuIcon,
  X,
  MessageCircle,
  CheckCircle,
  ChefHat,
  Flame,
  Leaf,
  Beef,
  Activity,
  MapPin,
  ChevronDown,
  ChevronUp,
  PlayCircle,
  Phone,
  Mail,
  Instagram,
} from 'lucide-react';

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [openFAQ, setOpenFAQ] = useState<number | null>(0);
  const [mealsPerWeek, setMealsPerWeek] = useState(7);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 24);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setIsMenuOpen(false);
    }
  };

  const toggleFAQ = (index: number) => setOpenFAQ(openFAQ === index ? null : index);

  // Calcolatore costo settimanale
  const pastoSanoCost = mealsPerWeek * 7.5;
  const gastronomyCost = mealsPerWeek * 11;
  const weeklySaving = gastronomyCost - pastoSanoCost;
  const hoursSaved = mealsPerWeek * 0.5;

  const audiences = [
    {
      icon: Activity,
      title: 'Per chi si allena',
      desc: 'Porzioni calibrate, proteine selezionate, recupero ottimizzato. Pranzi e cene che hanno senso dopo l’allenamento.',
      image: '/images/meals/pollo-patate-zucchine.jpg',
    },
    {
      icon: Clock,
      title: "Per chi non ha tempo",
      desc: 'Pranzi e cene pronti in 2 minuti. Niente spesa, niente padelle, niente stress. Apri, scaldi, mangi.',
      image: '/images/meals/orzo-ceci-feta-pomodorini.jpg',
    },
    {
      icon: Leaf,
      title: 'Per chi vuole tornare in forma',
      desc: 'Porzioni misurate, cottura leggera, zero conservanti. Mangi pulito ogni giorno senza dover ragionarci.',
      image: '/images/meals/patate-salmone-broccoli.jpg',
    },
  ];

  const comparison = [
    { feature: 'Pasti freschi non sottovuoto', us: true, gastronomy: 'A volte', mealKit: false },
    { feature: 'Pronto in 2 minuti', us: true, gastronomy: true, mealKit: false },
    { feature: 'Senza conservanti aggiunti', us: true, gastronomy: 'Spesso no', mealKit: 'Variabile' },
    { feature: 'Nessun abbonamento obbligatorio', us: true, gastronomy: true, mealKit: false },
    { feature: 'Devi cucinare tu', us: false, gastronomy: false, mealKit: true },
    { feature: 'Prezzo medio a pasto', us: '€6,50 – €8,50', gastronomy: '€10 – €13', mealKit: '€9 – €12' },
  ];

  const faqData = [
    {
      question: 'Dove ritiro i pasti?',
      answer:
        'Presso Tribu Personal Training Studio in Via Albere 27/B, 37138 Verona. Lo stesso posto dove Andrea allena. Da lun-ven, orari da concordare.',
    },
    {
      question: 'Posso usarli in definizione o in massa?',
      answer:
        'Sì. Le porzioni sono calibrate per chi si allena (proteine selezionate sui secondi, primi sostanziosi). Andrea consiglia personalmente l’abbinamento a chi gli scrive su WhatsApp.',
    },
    {
      question: 'Quanto durano in frigo? Posso congelarli?',
      answer:
        'Tutti i prodotti sono confezionati sottovuoto e si conservano da 10 a 15 giorni in frigorifero. Puoi anche congelarli per una durata ancora maggiore.',
    },
    {
      question: 'Come riscaldo i piatti?',
      answer:
        'Apri la confezione sottovuoto, versa il contenuto in un piatto e scalda 2 minuti al microonde. In alternativa puoi usare padella, forno o friggitrice ad aria. Non mettere la confezione sottovuoto direttamente al microonde.',
    },
    {
      question: 'Quando devo ordinare?',
      answer:
        'Entro le 18:00 del giorno prima per il ritiro del giorno dopo. Per ordini grandi (5+ pasti) consigliamo 2 giorni di anticipo.',
    },
    {
      question: 'È prevista la consegna a domicilio?',
      answer:
        'Stiamo lanciando il servizio rider in zona Verona città. Per ora il ritiro è in Via Albere. Scrivici su WhatsApp per essere avvisato quando parte.',
    },
    {
      question: 'Posso pagare al ritiro?',
      answer:
        'Puoi pagare online (PayPal, carta) durante l’ordine, oppure in contanti al ritiro. A te la scelta.',
    },
  ];

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
            Vai al menu
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
            <Link href="/" className="flex items-center gap-3 group">
              <Image
                src="/images/logo.png"
                alt="Pasto Sano"
                width={40}
                height={40}
                className="rounded-lg"
              />
              <span className="text-white font-display font-bold text-xl tracking-tightest">
                PASTO<span className="text-primary-500">.</span>SANO
              </span>
            </Link>

            {/* Desktop */}
            <div className="hidden lg:flex items-center gap-1">
              <Link
                href="/menu"
                className="text-white/80 hover:text-white px-4 py-2 text-sm font-medium transition-colors"
              >
                Menu
              </Link>
              {[
                { id: 'come-funziona', label: 'Come funziona' },
                { id: 'chi-sono', label: 'Andrea' },
                { id: 'faq', label: 'FAQ' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="text-white/80 hover:text-white px-4 py-2 text-sm font-medium transition-colors"
                >
                  {item.label}
                </button>
              ))}
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
              <Link
                href="/menu"
                onClick={() => setIsMenuOpen(false)}
                className="block text-white/80 hover:text-white px-2 py-3 text-base font-medium border-b border-ink-800"
              >
                Menu
              </Link>
              {[
                { id: 'come-funziona', label: 'Come funziona' },
                { id: 'chi-sono', label: 'Andrea' },
                { id: 'faq', label: 'FAQ' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="w-full text-left text-white/80 hover:text-white px-2 py-3 text-base font-medium border-b border-ink-800"
                >
                  {item.label}
                </button>
              ))}
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

      {/* HERO */}
      <section id="home" className="relative bg-ink-950 text-white pt-28 lg:pt-32 pb-16 lg:pb-24 overflow-hidden">
        <div className="absolute top-1/2 -left-32 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[40rem] h-[40rem] bg-primary-700/10 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            <div className="lg:col-span-7 space-y-7">
              <div className="inline-flex items-center gap-2 bg-primary-500/10 border border-primary-500/30 text-primary-400 px-4 py-1.5 rounded-full text-sm font-medium">
                <ChefHat className="w-4 h-4" />
                Pasti freschi · Ritiro a Verona
              </div>

              <h1 className="font-display font-black tracking-tightest text-5xl sm:text-6xl lg:text-7xl xl:text-8xl leading-[0.95] uppercase">
                Mangia come
                <br />
                un <span className="text-primary-500">PT</span>.
                <br />
                <span className="text-white/60">Senza cucinare.</span>
              </h1>

              <p className="text-lg lg:text-xl text-white/80 max-w-xl leading-relaxed">
                Carne, tagli premium e verdure di stagione. Cucinati e pronti da scaldare,
                oppure freschi da preparare. Ritiro a Tribù Studio.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link
                  href="/ordina"
                  className="group bg-primary-500 hover:bg-primary-600 text-white font-semibold px-7 py-4 rounded-full text-base inline-flex items-center justify-center gap-2 transition-all hover:shadow-glow-primary"
                >
                  Vedi il menu di Andrea
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <button
                  onClick={() => scrollToSection('come-funziona')}
                  className="group bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white font-semibold px-7 py-4 rounded-full text-base inline-flex items-center justify-center gap-2 transition-all"
                >
                  <PlayCircle className="w-5 h-5" />
                  Come funziona
                </button>
              </div>

            </div>

            {/* Mosaico prodotti */}
            <div className="lg:col-span-5 relative">
              <div className="relative w-full h-[360px] sm:h-[460px] lg:h-[500px] xl:h-[560px] rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/10 grid grid-cols-2 grid-rows-2 gap-1.5 bg-ink-900">
                <div className="relative overflow-hidden group">
                  <Image
                    src="/images/prodotti/tartare-bovino.jpg"
                    alt="Tartare di bovino"
                    fill
                    priority
                    sizes="(min-width: 1024px) 25vw, 50vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="relative overflow-hidden group">
                  <Image
                    src="/images/prodotti/roast-beef-fette.jpg"
                    alt="Roast beef bovino a fette"
                    fill
                    priority
                    sizes="(min-width: 1024px) 25vw, 50vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="relative overflow-hidden group">
                  <Image
                    src="/images/prodotti/insalata-pollo.jpg"
                    alt="Insalata di pollo"
                    fill
                    priority
                    sizes="(min-width: 1024px) 25vw, 50vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="relative overflow-hidden group">
                  <Image
                    src="/images/prodotti/piselli.jpg"
                    alt="Piselli cotti"
                    fill
                    priority
                    sizes="(min-width: 1024px) 25vw, 50vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                {/* Overlay gradient + badge in basso */}
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-ink-950 to-transparent pointer-events-none" />
                <div className="absolute bottom-4 left-4 right-4 pointer-events-none">
                  <div className="bg-ink-950/70 backdrop-blur-md border border-white/10 rounded-2xl p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <ChefHat className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-white text-sm">18 prodotti selezionati</div>
                        <div className="text-xs text-white/70">Pronti da scaldare · Da cuocere</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating badge sottovuoto */}
              <div className="hidden md:flex absolute -right-4 -top-4 bg-lemon-400 text-ink-950 rounded-2xl shadow-card-hover p-4 items-center gap-2 rotate-3">
                <Flame className="w-5 h-5" />
                <span className="font-semibold text-sm">Sottovuoto · 10-15 giorni</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Marquee benefits */}
      <section className="bg-primary-500 text-white py-4 overflow-hidden">
        <div className="flex gap-12 animate-marquee whitespace-nowrap font-display font-semibold uppercase text-sm tracking-wider">
          {[...Array(2)].map((_, repeat) => (
            <div key={repeat} className="flex gap-12">
              <span className="flex items-center gap-2">
                <Leaf className="w-4 h-4" /> Senza conservanti
              </span>
              <span>•</span>
              <span className="flex items-center gap-2">
                <Beef className="w-4 h-4" /> Proteine selezionate
              </span>
              <span>•</span>
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4" /> Pronti in 2 minuti
              </span>
              <span>•</span>
              <span className="flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Ritiro in Via Albere
              </span>
              <span>•</span>
              <span className="flex items-center gap-2">
                <Activity className="w-4 h-4" /> Niente da cucinare
              </span>
              <span>•</span>
            </div>
          ))}
        </div>
      </section>

      {/* Per chi è */}
      <section id="vantaggi" className="py-20 lg:py-28 bg-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl mb-14">
            <div className="text-primary-600 font-semibold text-sm uppercase tracking-wider mb-3">
              Per chi è Pasto Sano
            </div>
            <h2 className="font-display font-black text-4xl lg:text-6xl leading-[0.95] tracking-tightest uppercase">
              Tre persone.
              <br />
              <span className="text-ink-400">Lo stesso problema.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {audiences.map((aud, i) => {
              const Icon = aud.icon;
              return (
                <div
                  key={i}
                  className="group bg-ink-950 text-white rounded-3xl overflow-hidden hover:shadow-card-hover transition-all duration-500"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={aud.image}
                      alt={aud.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-transparent to-transparent" />
                    <div className="absolute top-4 left-4 w-12 h-12 bg-primary-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="p-7">
                    <h3 className="font-display font-bold text-2xl mb-3">{aud.title}</h3>
                    <p className="text-white/70 leading-relaxed">{aud.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Calcolatore */}
      <section className="py-20 lg:py-28 bg-ink-950 text-white relative overflow-hidden">
        <div className="absolute -top-20 right-0 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5">
              <div className="text-primary-400 font-semibold text-sm uppercase tracking-wider mb-3">
                Quanto risparmi
              </div>
              <h2 className="font-display font-black text-4xl lg:text-5xl leading-[1] tracking-tightest uppercase mb-5">
                Mangiare sano costa meno
                <span className="text-primary-500"> di quello che pensi.</span>
              </h2>
              <p className="text-white/70 text-lg">
                Sposta lo slider per vedere quanto risparmi (e quante ore recuperi) sostituendo la
                gastronomia con Pasto Sano.
              </p>
            </div>

            <div className="lg:col-span-7 bg-ink-900 rounded-3xl p-6 lg:p-10 ring-1 ring-white/10">
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-semibold text-white/80 uppercase tracking-wider">
                    Pasti a settimana
                  </label>
                  <span className="font-display font-black text-3xl text-primary-500">
                    {mealsPerWeek}
                  </span>
                </div>
                <input
                  type="range"
                  min={3}
                  max={15}
                  value={mealsPerWeek}
                  onChange={(e) => setMealsPerWeek(Number(e.target.value))}
                  className="w-full h-2 bg-ink-700 rounded-full appearance-none cursor-pointer accent-primary-500"
                />
                <div className="flex justify-between text-xs text-white/50 mt-2">
                  <span>3</span>
                  <span>9</span>
                  <span>15</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-ink-950 rounded-2xl p-5">
                  <div className="text-xs text-white/60 uppercase tracking-wider mb-1">
                    Pasto Sano
                  </div>
                  <div className="font-display font-black text-3xl text-white">
                    €{pastoSanoCost.toFixed(2)}
                  </div>
                  <div className="text-xs text-white/60 mt-1">a settimana</div>
                </div>
                <div className="bg-ink-950 rounded-2xl p-5">
                  <div className="text-xs text-white/60 uppercase tracking-wider mb-1">
                    Gastronomia media
                  </div>
                  <div className="font-display font-black text-3xl text-white/40 line-through">
                    €{gastronomyCost.toFixed(2)}
                  </div>
                  <div className="text-xs text-white/60 mt-1">a settimana</div>
                </div>
              </div>

              <div className="bg-primary-500 rounded-2xl p-5 flex items-center justify-between">
                <div>
                  <div className="text-xs text-white/90 uppercase tracking-wider mb-1">
                    Risparmi
                  </div>
                  <div className="font-display font-black text-3xl text-white">
                    €{weeklySaving.toFixed(2)}
                  </div>
                  <div className="text-xs text-white/90 mt-1">+ {hoursSaved.toFixed(1)}h libere</div>
                </div>
                <Link
                  href="/ordina"
                  className="bg-white text-primary-700 font-bold px-5 py-3 rounded-full text-sm hover:bg-lemon-400 transition-colors"
                >
                  Ordina →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparativa */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl mb-12">
            <div className="text-primary-600 font-semibold text-sm uppercase tracking-wider mb-3">
              Confronto onesto
            </div>
            <h2 className="font-display font-black text-4xl lg:text-6xl leading-[0.95] tracking-tightest uppercase">
              Perché Pasto Sano
              <br />
              <span className="text-ink-400">e non un&apos;altra cosa?</span>
            </h2>
          </div>

          <div className="overflow-x-auto -mx-4 px-4 lg:mx-0 lg:px-0">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b-2 border-ink-950">
                  <th className="text-left py-4 px-4 font-display font-bold text-sm uppercase tracking-wider">
                    Caratteristica
                  </th>
                  <th className="text-center py-4 px-4 font-display font-bold text-sm uppercase tracking-wider bg-primary-500 text-white rounded-t-2xl">
                    Pasto Sano
                  </th>
                  <th className="text-center py-4 px-4 font-display font-bold text-sm uppercase tracking-wider text-ink-500">
                    Gastronomia
                  </th>
                  <th className="text-center py-4 px-4 font-display font-bold text-sm uppercase tracking-wider text-ink-500">
                    Meal kit
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((row, i) => (
                  <tr key={i} className="border-b border-ink-100">
                    <td className="py-4 px-4 font-medium">{row.feature}</td>
                    <td className="text-center py-4 px-4 bg-primary-50">
                      <CompareCell value={row.us} highlight />
                    </td>
                    <td className="text-center py-4 px-4 text-ink-600">
                      <CompareCell value={row.gastronomy} />
                    </td>
                    <td className="text-center py-4 px-4 text-ink-600">
                      <CompareCell value={row.mealKit} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Come funziona */}
      <section id="come-funziona" className="py-20 lg:py-28 bg-ink-50">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl mb-14">
            <div className="text-primary-600 font-semibold text-sm uppercase tracking-wider mb-3">
              Come funziona
            </div>
            <h2 className="font-display font-black text-4xl lg:text-6xl leading-[0.95] tracking-tightest uppercase">
              Tre step.
              <br />
              <span className="text-ink-400">Mai più pranzo dimenticato.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                num: '01',
                title: 'Ordini online o su WhatsApp',
                desc: 'Scegli dal menu della settimana entro le 18:00. PayPal, carta o contanti al ritiro.',
              },
              {
                num: '02',
                title: 'Prepariamo l’ordine',
                desc: 'Riceviamo il tuo ordine e prepariamo le porzioni con cura. Solo prodotti freschi, niente sottovuoto industriale.',
              },
              {
                num: '03',
                title: 'Ritiri in Via Albere',
                desc: 'Tribù Studio, Via Albere 27/B. Apri la vaschetta, 2 minuti al microonde, mangi.',
              },
            ].map((step, i) => (
              <div key={i} className="bg-white rounded-3xl p-8 shadow-card hover:shadow-card-hover transition-all duration-300">
                <div className="font-display font-black text-6xl text-primary-500 mb-4">
                  {step.num}
                </div>
                <h3 className="font-display font-bold text-2xl mb-3">{step.title}</h3>
                <p className="text-ink-600 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Andrea storia */}
      <section id="chi-sono" className="py-20 lg:py-28 bg-ink-950 text-white relative overflow-hidden">
        <div className="absolute top-1/3 -right-32 w-96 h-96 bg-primary-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5">
              <div className="relative aspect-[4/5] rounded-3xl overflow-hidden ring-1 ring-white/10">
                <Image
                  src="/images/landing/andrea.jpg"
                  alt="Andrea Padoan in cucina"
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            <div className="lg:col-span-7 space-y-6">
              <div className="text-primary-400 font-semibold text-sm uppercase tracking-wider">
                Chi cucina i tuoi pasti
              </div>
              <h2 className="font-display font-black text-4xl lg:text-6xl leading-[0.95] tracking-tightest uppercase">
                Sono Andrea.
                <br />
                <span className="text-primary-500">12 anni di PT.</span>
                <br />
                <span className="text-white/60">Una sola idea.</span>
              </h2>

              <div className="space-y-4 text-lg text-white/80 leading-relaxed max-w-2xl">
                <p>
                  Per 12 anni ho seguito persone in palestra. Il 70% non vedeva risultati per un
                  motivo solo: <strong className="text-white">mangiare male</strong>. Non per pigrizia.
                  Per tempo.
                </p>
                <p>
                  Tornare a casa stanchi, aprire il frigo, chiudere il frigo. Poi pizza, gastronomia,
                  bar sotto l&apos;ufficio. Lo so perch&eacute; lo facevo anch&apos;io.
                </p>
                <p>
                  Pasto Sano nasce per questo. Pasti veri, pensati come li farei io a casa, con
                  porzioni calibrate per chi si allena (e anche per chi non lo fa).
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-6">
                <Stat number="12+" label="Anni come PT" />
                <Stat number="500+" label="Clienti seguiti" />
                <Stat number="15k+" label="Pasti consegnati" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ritiro / Tribù Studio */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="text-primary-600 font-semibold text-sm uppercase tracking-wider mb-3">
                Dove ritiri
              </div>
              <h2 className="font-display font-black text-4xl lg:text-5xl leading-[0.95] tracking-tightest uppercase mb-6">
                Tribù Studio.
                <br />
                <span className="text-ink-400">Lo stesso posto dove alleno.</span>
              </h2>
              <div className="space-y-4 text-ink-700">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary-500 mt-1 flex-shrink-0" />
                  <div>
                    <div className="font-semibold">Via Albere 27/B, 37138 Verona</div>
                    <div className="text-sm text-ink-500">Dentro Tribù Personal Training Studio</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-primary-500 mt-1 flex-shrink-0" />
                  <div>
                    <div className="font-semibold">Lun-Ven, orari da concordare</div>
                    <div className="text-sm text-ink-500">Ordina entro le 18:00 del giorno prima</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-primary-500 mt-1 flex-shrink-0" />
                  <div>
                    <div className="font-semibold">347 888 1515</div>
                    <div className="text-sm text-ink-500">WhatsApp o telefono</div>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 mt-8">
                <a
                  href="https://maps.google.com/?q=Tribu+Personal+Training+Studio,+Via+Albere+27B,+37138+Verona"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-ink-950 hover:bg-primary-500 text-white font-semibold px-5 py-3 rounded-full text-sm transition-colors"
                >
                  <MapPin className="w-4 h-4" />
                  Apri in Maps
                </a>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1da851] text-white font-semibold px-5 py-3 rounded-full text-sm transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  Scrivici
                </a>
              </div>
            </div>

            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-card-hover">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2796.534!2d10.9817!3d45.4384!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sVia%20Albere%2027%2FB%2C%2037138%20Verona%20VR!5e0!3m2!1sit!2sit!4v1700000000000!5m2!1sit!2sit"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Tribù Studio Verona"
              />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 lg:py-28 bg-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <div className="text-primary-600 font-semibold text-sm uppercase tracking-wider mb-3">
                Domande frequenti
              </div>
              <h2 className="font-display font-black text-4xl lg:text-6xl leading-[0.95] tracking-tightest uppercase">
                Le risposte
                <br />
                <span className="text-ink-400">che cerchi.</span>
              </h2>
            </div>

            <div className="space-y-3">
              {faqData.map((faq, i) => (
                <div key={i} className="bg-ink-50 rounded-2xl overflow-hidden">
                  <button
                    onClick={() => toggleFAQ(i)}
                    className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 hover:bg-ink-100 transition-colors"
                  >
                    <h3 className="font-display font-bold text-base lg:text-lg pr-4">
                      {faq.question}
                    </h3>
                    {openFAQ === i ? (
                      <ChevronUp className="w-5 h-5 text-primary-500 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-ink-400 flex-shrink-0" />
                    )}
                  </button>
                  {openFAQ === i && (
                    <div className="px-6 pb-6 -mt-1">
                      <p className="text-ink-700 leading-relaxed">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="text-center mt-10">
              <p className="text-ink-600 mb-4">Non hai trovato la tua risposta?</p>
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
          </div>
        </div>
      </section>

      {/* CTA finale immersiva */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0">
          <Image src="/images/landing/hero-meal.jpg" alt="" fill className="object-cover" />
          <div className="absolute inset-0 bg-ink-950/80" />
        </div>
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center text-white">
            <h2 className="font-display font-black text-5xl lg:text-7xl leading-[0.95] tracking-tightest uppercase mb-6">
              Basta pensare
              <br />
              <span className="text-primary-500">ai pasti.</span>
            </h2>
            <p className="text-lg lg:text-xl text-white/80 mb-10 max-w-xl mx-auto">
              Cuciniamo, tu ritiri. Niente abbonamenti, niente vincoli. Cominci quando vuoi e smetti
              quando vuoi.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/ordina"
                className="group bg-primary-500 hover:bg-primary-600 text-white font-semibold px-8 py-4 rounded-full text-lg inline-flex items-center justify-center gap-2 transition-all hover:shadow-glow-primary"
              >
                Ordina ora
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white font-semibold px-8 py-4 rounded-full text-lg inline-flex items-center justify-center gap-2 transition-all"
              >
                <MessageCircle className="w-5 h-5" />
                Chiedi info
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contatti" className="bg-ink-950 text-white pt-16 pb-24 lg:pb-12">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-5">
                <Image src="/images/logo.png" alt="Pasto Sano" width={40} height={40} className="rounded-lg" />
                <span className="font-display font-bold text-xl tracking-tightest">
                  PASTO<span className="text-primary-500">.</span>SANO
                </span>
              </div>
              <p className="text-white/60 text-sm leading-relaxed">
                Pasti freschi a Verona. Ritiro in Via Albere. Pronti in 2 minuti.
              </p>
            </div>

            <div>
              <h3 className="font-display font-bold text-sm uppercase tracking-wider mb-4 text-primary-400">
                Menu
              </h3>
              <div className="space-y-2 text-sm">
                <Link href="/menu" className="block text-white/70 hover:text-white">
                  Menu della settimana
                </Link>
                <Link href="/ordina" className="block text-white/70 hover:text-white">
                  Ordina online
                </Link>
                <button onClick={() => scrollToSection('come-funziona')} className="block text-white/70 hover:text-white text-left">
                  Come funziona
                </button>
                <button onClick={() => scrollToSection('faq')} className="block text-white/70 hover:text-white text-left">
                  FAQ
                </button>
              </div>
            </div>

            <div>
              <h3 className="font-display font-bold text-sm uppercase tracking-wider mb-4 text-primary-400">
                Contatti
              </h3>
              <div className="space-y-3 text-sm">
                <a href="tel:+393478881515" className="flex items-center gap-2 text-white/70 hover:text-white">
                  <Phone className="w-4 h-4" /> 347 888 1515
                </a>
                <a href="mailto:info@pastosano.it" className="flex items-center gap-2 text-white/70 hover:text-white">
                  <Mail className="w-4 h-4" /> info@pastosano.it
                </a>
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-white/70 hover:text-white">
                  <MessageCircle className="w-4 h-4" /> WhatsApp
                </a>
                <a href="https://instagram.com/pastosano" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-white/70 hover:text-white">
                  <Instagram className="w-4 h-4" /> @pastosano
                </a>
              </div>
            </div>

            <div>
              <h3 className="font-display font-bold text-sm uppercase tracking-wider mb-4 text-primary-400">
                Ritiro
              </h3>
              <div className="space-y-2 text-sm text-white/70">
                <a
                  href="https://maps.google.com/?q=Tribu+Personal+Training+Studio,+Via+Albere+27B,+37138+Verona"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-2 hover:text-white"
                >
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Via Albere 27/B<br />37138 Verona</span>
                </a>
                <div className="flex items-start gap-2">
                  <Clock className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Lun-Ven, orari su appuntamento</span>
                </div>
                <div className="text-primary-400 font-semibold pt-2">
                  ⚡ Ordina entro le 18:00
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-white/40">
            <p>© {new Date().getFullYear()} Pasto Sano — Tutti i diritti riservati</p>
            <p>Made in Verona by Andrea Padoan</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function CompareCell({ value, highlight = false }: { value: boolean | string; highlight?: boolean }) {
  if (value === true) {
    return (
      <CheckCircle
        className={`w-5 h-5 mx-auto ${highlight ? 'text-primary-600' : 'text-sage-600'}`}
      />
    );
  }
  if (value === false) {
    return <X className="w-5 h-5 mx-auto text-ink-300" />;
  }
  return (
    <span className={`text-sm font-medium ${highlight ? 'text-primary-700 font-semibold' : 'text-ink-600'}`}>
      {value}
    </span>
  );
}

function Stat({ number, label }: { number: string; label: string }) {
  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
      <div className="font-display font-black text-3xl lg:text-4xl text-primary-500 leading-none">
        {number}
      </div>
      <div className="text-xs text-white/60 mt-2 uppercase tracking-wider">{label}</div>
    </div>
  );
}
