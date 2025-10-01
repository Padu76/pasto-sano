'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ShoppingCart, 
  Clock, 
  Star,
  Menu,
  X,
  Leaf,
  Scale,
  Flame,
  Heart,
  MessageCircle,
  CheckCircle,
  XCircle,
  Timer,
  Users,
  AlertCircle,
  Sparkles,
  ChefHat,
  Zap,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');
  const [availableSpots, setAvailableSpots] = useState(8);
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const testimonials = [
    {
      name: "Marco R.",
      role: "Imprenditore",
      text: "Finalmente posso mangiare sano anche con poco tempo. Pasto Sano mi ha cambiato la vita!",
      rating: 5,
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80"
    },
    {
      name: "Laura B.",
      role: "Manager",
      text: "Ho perso 8kg in 3 mesi senza rinunciare al gusto. Consigliatissimo!",
      rating: 5,
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&q=80"
    },
    {
      name: "Giuseppe T.",
      role: "Sportivo",
      text: "Perfetto per chi si allena. Pasti bilanciati e gustosi, recupero meglio dopo l'allenamento.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80"
    },
    {
      name: "Anna M.",
      role: "Mamma lavoratrice",
      text: "Non ho più lo stress di cucinare ogni giorno. Più tempo per la famiglia!",
      rating: 5,
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80"
    }
  ];

  useEffect(() => {
    // Handle scroll for header
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    
    // Countdown timer
    const updateCountdown = () => {
      const now = new Date();
      const deadline = new Date();
      deadline.setHours(18, 0, 0, 0);
      
      if (now > deadline) {
        deadline.setDate(deadline.getDate() + 1);
      }
      
      const diff = deadline.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    };
    
    updateCountdown();
    const countdownInterval = setInterval(updateCountdown, 1000);
    
    // Simulate available spots countdown
    const spotsInterval = setInterval(() => {
      setAvailableSpots(prev => prev > 3 ? prev - 1 : prev);
    }, 45000);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(countdownInterval);
      clearInterval(spotsInterval);
    };
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  const problems = [
    {
      image: "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=600&q=80",
      text: "Torni a casa stanco e non sai cosa mangiare"
    },
    {
      image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&q=80",
      text: "Mangi sempre le stesse cose in gastronomia"
    },
    {
      image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80",
      text: "Spesa dell'ultimo minuto e sprechi"
    },
    {
      image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=600&q=80",
      text: "Cibo pesante che ti rallenta"
    }
  ];

  const solutions = [
    {
      image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80",
      title: "Pasto Pronto in 2 Minuti",
      description: "Torni a casa e il pranzo è già pronto"
    },
    {
      image: "https://images.unsplash.com/photo-1541480601022-2308c0f02487?w=600&q=80",
      title: "Zero Stress",
      description: "Niente spesa, niente cucina, solo relax"
    },
    {
      image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&q=80",
      title: "Leggero e Nutriente",
      description: "Ti senti energico tutto il giorno"
    },
    {
      image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&q=80",
      title: "Tempo per Te",
      description: "Recuperi 1 ora al giorno"
    }
  ];

  const features = [
    {
      image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&q=80",
      title: "100% Naturale",
      description: "Senza conservanti o additivi",
      badge: "GARANTITO",
      icon: <Leaf className="w-8 h-8" />
    },
    {
      image: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&q=80",
      title: "Qualità Premium",
      description: "Solo ingredienti selezionati",
      badge: "TOP QUALITY",
      icon: <Star className="w-8 h-8" />
    },
    {
      image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80",
      title: "Bilanciato",
      description: "Proteine, carboidrati, vitamine",
      badge: "EQUILIBRATO",
      icon: <Scale className="w-8 h-8" />
    },
    {
      image: "https://images.unsplash.com/photo-1558818498-28c1e002b655?w=600&q=80",
      title: "Cottura Perfetta",
      description: "Vapore per preservare i nutrienti",
      badge: "CHEF",
      icon: <Flame className="w-8 h-8" />
    },
    {
      image: "https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=600&q=80",
      title: "Pronto Subito",
      description: "2 minuti al microonde",
      badge: "VELOCE",
      icon: <Clock className="w-8 h-8" />
    },
    {
      image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&q=80",
      title: "Vario e Gustoso",
      description: "Menu sempre diverso",
      badge: "NOVITÀ",
      icon: <Heart className="w-8 h-8" />
    }
  ];

  const menuHighlights = [
    {
      name: "Fusilli e Manzo",
      image: "/images/meals/fusilli-manzo-zucchine-melanzane.jpg",
      price: "8.50",
      oldPrice: "10.00",
      badge: "BESTSELLER",
      badgeColor: "bg-red-500"
    },
    {
      name: "Roastbeef",
      image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&q=80",
      price: "8.50",
      badge: "PREFERITO",
      badgeColor: "bg-blue-500"
    },
    {
      name: "Pollo Grigliato",
      image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&q=80",
      price: "8.50",
      badge: "LEGGERO",
      badgeColor: "bg-green-500"
    },
    {
      name: "Salmone",
      image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&q=80",
      price: "8.50",
      badge: "OMEGA 3",
      badgeColor: "bg-purple-500"
    }
  ];

  const steps = [
    { 
      icon: <ShoppingCart className="w-12 h-12" />, 
      title: "Scegli", 
      desc: "Dal menu online",
      image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&q=80"
    },
    { 
      icon: <Timer className="w-12 h-12" />, 
      title: "Ordina", 
      desc: "Paghi online o al ritiro",
      image: "https://images.unsplash.com/photo-1556742393-d75f468bfcb0?w=400&q=80"
    },
    { 
      icon: <Clock className="w-12 h-12" />, 
      title: "Aspetta", 
      desc: "2 giorni lavorativi",
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80"
    },
    { 
      icon: <CheckCircle className="w-12 h-12" />, 
      title: "Ritira", 
      desc: "Via Albere 27/B, Verona",
      image: "https://images.unsplash.com/photo-1556742111-a301076d9d18?w=400&q=80"
    }
  ];

  const faqData = [
    {
      question: "Dove avviene il ritiro?",
      answer: "Al momento puoi ritirare presso Tribu Personal Training Studio - Via Albere 27B, 37138 Verona."
    },
    {
      question: "Posso congelare il prodotto?",
      answer: "Sì! Gli ingredienti sono tutti freschi, quindi puoi congelare le vaschette senza problemi per conservarle più a lungo."
    },
    {
      question: "È prevista la consegna a domicilio?",
      answer: "Al momento è previsto solo il ritiro, ma presto stiamo implementando il servizio con consegna a domicilio! Resta aggiornato per le novità."
    },
    {
      question: "Quanto li posso conservare in frigorifero?",
      answer: "Consigliamo il consumo entro 3 giorni dal ritiro. In alternativa, puoi sempre congelare per una conservazione più lunga."
    },
    {
      question: "La vaschetta posso metterla direttamente in microonde?",
      answer: "No, la vaschetta non va nel microonde. Può essere messa in forno o friggitrice ad aria."
    },
    {
      question: "Come scaldo il prodotto?",
      answer: "Metti il prodotto in un piatto e scaldi per 2 minuti e mezzo nel microonde. Oppure puoi scaldarlo in padella o direttamente in forno/friggitrice ad aria."
    },
    {
      question: "Prevedete l'inserimento di altri prodotti?",
      answer: "Certamente! Abbiamo già una lista di nuovi piatti da inserire. Il menu si arricchirà sempre di più con nuove deliziose opzioni!"
    },
    {
      question: "Posso restituire il prodotto dopo averlo ordinato?",
      answer: "Non è previsto il reso del prodotto. Tuttavia, se hai domande o dubbi, contattaci prima dell'ordine - saremo felici di aiutarti!"
    }
  ];

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Floating WhatsApp Button */}
      <a 
        href="https://wa.me/393478881515?text=Ciao%20Pasto%20Sano,%20vorrei%20ordinare"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 bg-green-500 text-white p-4 rounded-full shadow-2xl hover:bg-green-600 transform hover:scale-110 transition-all duration-300 z-50 animate-pulse"
      >
        <MessageCircle className="w-6 h-6" />
      </a>

      {/* Modern Header with Glassmorphism */}
      <header className={`fixed top-0 w-full z-40 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/90 backdrop-blur-xl shadow-xl py-2' 
          : 'bg-white/95 backdrop-blur-md py-3'
      }`}>
        <nav className="container mx-auto px-4 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Enhanced Logo */}
            <div className="flex items-center gap-3">
              <Image 
                src="/images/logo.png"
                alt="Pasto Sano Logo"
                width={48}
                height={48}
                className="rounded-xl shadow-lg"
              />
              <span className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                Pasto Sano
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              <button onClick={() => scrollToSection('home')} className="text-gray-700 hover:text-amber-600 transition-all duration-300 hover:scale-105 font-medium">
                Home
              </button>
              <button onClick={() => scrollToSection('vantaggi')} className="text-gray-700 hover:text-amber-600 transition-all duration-300 hover:scale-105 font-medium">
                Vantaggi
              </button>
              <button onClick={() => scrollToSection('menu')} className="text-gray-700 hover:text-amber-600 transition-all duration-300 hover:scale-105 font-medium">
                Menu
              </button>
              <button onClick={() => scrollToSection('chi-sono')} className="text-gray-700 hover:text-amber-600 transition-all duration-300 hover:scale-105 font-medium">
                Chi Sono
              </button>
              <button onClick={() => scrollToSection('contatti')} className="text-gray-700 hover:text-amber-600 transition-all duration-300 hover:scale-105 font-medium">
                Contatti
              </button>
              <Link 
                href="/ordina"
                className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3 rounded-full font-semibold hover:shadow-xl transform hover:scale-105 transition-all duration-300 animate-pulse"
              >
                Ordina Ora
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="lg:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-xl border-t shadow-xl">
              <div className="flex flex-col p-6 space-y-4">
                <button onClick={() => scrollToSection('home')} className="text-left py-3 text-gray-700 text-lg border-b hover:text-amber-600 transition-colors">Home</button>
                <button onClick={() => scrollToSection('vantaggi')} className="text-left py-3 text-gray-700 text-lg border-b hover:text-amber-600 transition-colors">Vantaggi</button>
                <button onClick={() => scrollToSection('menu')} className="text-left py-3 text-gray-700 text-lg border-b hover:text-amber-600 transition-colors">Menu</button>
                <button onClick={() => scrollToSection('chi-sono')} className="text-left py-3 text-gray-700 text-lg border-b hover:text-amber-600 transition-colors">Chi Sono</button>
                <button onClick={() => scrollToSection('contatti')} className="text-left py-3 text-gray-700 text-lg border-b hover:text-amber-600 transition-colors">Contatti</button>
                <Link 
                  href="/ordina"
                  className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-4 rounded-full font-semibold text-center text-lg mt-4"
                >
                  Ordina Ora
                </Link>
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* Modern Hero Section - RIDOTTA IN ALTEZZA */}
      <section id="home" className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
        {/* Background Image - COMPLETAMENTE NITIDA */}
        <div className="absolute inset-0">
          <Image 
            src="/images/landing/hero-meal.jpg"
            alt="Healthy Food Background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/20"></div>
        </div>

        {/* Floating Particles */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-20 w-32 h-32 bg-yellow-400/20 rounded-full animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-24 h-24 bg-orange-400/20 rounded-full animate-pulse animation-delay-1000"></div>
          <div className="absolute top-40 right-40 w-16 h-16 bg-yellow-300/20 rounded-full animate-pulse animation-delay-2000"></div>
          <div className="absolute bottom-40 left-40 w-20 h-20 bg-red-400/20 rounded-full animate-pulse animation-delay-1500"></div>
        </div>
        
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <div className="text-center text-white space-y-8 max-w-4xl mx-auto">
            {/* Countdown Badge */}
            <div className="inline-flex items-center gap-3 bg-red-500/90 backdrop-blur-sm text-white px-6 py-3 rounded-full text-sm font-bold animate-pulse border border-red-400/30">
              <AlertCircle className="w-5 h-5" />
              <span>Ordina entro le 18:00 per ritiro dopodomani!</span>
              <div className="bg-white/20 px-3 py-1 rounded-full">
                ⏰ {timeLeft}
              </div>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
              <span className="block fade-in">Mangia Sano,</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 fade-in-delay">
                Vivi Meglio
              </span>
            </h1>
            
            <p className="text-xl lg:text-2xl text-white/90 fade-in-delay-2">
              Pasti pronti in <span className="font-bold text-yellow-400">2 minuti</span>. Torni a casa e mangi subito!
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center fade-in-delay-3">
              <Link 
                href="/ordina"
                className="group bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 px-8 py-4 rounded-full font-bold text-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center gap-3"
              >
                <ShoppingCart className="w-6 h-6 group-hover:animate-bounce" />
                Ordina Subito
                <Sparkles className="w-5 h-5 group-hover:animate-spin" />
              </Link>
              <button 
                onClick={() => scrollToSection('vantaggi')}
                className="bg-white/20 backdrop-blur-sm border-2 border-white/30 text-white px-8 py-4 rounded-full font-bold hover:bg-white hover:text-amber-900 transition-all duration-300 flex items-center gap-2"
              >
                Scopri i Vantaggi
                <span className="text-sm">▶️</span>
              </button>
            </div>
            
            {/* Spots Available */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-yellow-300 px-4 py-2 rounded-full text-sm font-semibold animate-pulse">
              <AlertCircle className="w-4 h-4" />
              Solo {availableSpots} posti disponibili per domani!
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <span className="w-8 h-8 text-white text-2xl">⬇️</span>
        </div>
      </section>

      {/* Problems & Solutions Section - IMMAGINI PIÙ GRANDI E CENTRATE */}
      <section id="vantaggi" className="py-20 bg-white relative overflow-hidden">
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Basta con questi <span className="text-red-500">problemi</span>!
            </h2>
            <p className="text-xl text-gray-600">Hai mai vissuto queste situazioni?</p>
          </div>
          
          {/* Problems with Images - IMMAGINI PIÙ GRANDI E NITIDE */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {problems.map((problem, index) => (
              <div 
                key={index}
                className="group relative overflow-hidden rounded-2xl transform hover:scale-105 transition-all duration-500"
              >
                <div className="relative h-80">
                  <Image 
                    src={problem.image}
                    alt={problem.text}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-all duration-300"></div>
                  
                  {/* Content Overlay - FRASE SOTTO */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                    <div className="text-white text-center">
                      <XCircle className="w-12 h-12 mb-4 text-red-400 mx-auto" />
                      <p className="font-bold text-xl leading-tight">{problem.text}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Animated Arrow */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full animate-bounce shadow-xl">
              <span className="text-2xl">⬇️</span>
            </div>
          </div>
          
          {/* Solutions - IMMAGINI NITIDE */}
          <div className="text-center mb-12">
            <h3 className="text-4xl lg:text-5xl font-bold mb-4">
              <span className="text-green-600">Ecco la Soluzione!</span> ✨
            </h3>
            <p className="text-xl text-gray-600">Con Pasto Sano tutto cambia</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {solutions.map((solution, index) => (
              <div 
                key={index}
                className="group relative overflow-hidden rounded-2xl bg-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-500"
              >
                <div className="relative h-48">
                  <Image 
                    src={solution.image}
                    alt={solution.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-all duration-300"></div>
                </div>
                
                <div className="p-6">
                  <CheckCircle className="w-8 h-8 text-green-500 mb-3" />
                  <h4 className="font-bold text-xl text-gray-900 mb-2">{solution.title}</h4>
                  <p className="text-gray-600">{solution.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Perché Scegliere <span className="text-amber-600">Pasto Sano</span>?
            </h2>
            <p className="text-xl text-gray-600">Guarda con i tuoi occhi la qualità dei nostri piatti</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group relative bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transform hover:-translate-y-4 transition-all duration-700"
              >
                {/* Badge */}
                <div className="absolute top-4 right-4 bg-amber-500/90 backdrop-blur-sm text-white text-xs px-3 py-2 rounded-full font-bold z-10 border border-amber-400/30">
                  {feature.badge}
                </div>
                
                {/* Image */}
                <div className="relative h-64 overflow-hidden">
                  <Image 
                    src={feature.image}
                    alt={feature.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent group-hover:from-black/30 transition-all duration-300"></div>
                </div>
                
                {/* Content */}
                <div className="p-8">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                      {feature.icon}
                    </div>
                    <h3 className="font-bold text-xl text-gray-900">{feature.title}</h3>
                  </div>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Menu Highlights */}
      <section id="menu" className="py-20 bg-gradient-to-b from-amber-50 to-orange-50 relative overflow-hidden">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              I Nostri <span className="text-amber-600">Bestseller</span> 🔥
            </h2>
            <p className="text-xl text-gray-600">I piatti più amati dai nostri clienti</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {menuHighlights.map((item, index) => (
              <div 
                key={index}
                className="group relative bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-500"
              >
                {/* Badge */}
                <div className={`absolute top-4 left-4 ${item.badgeColor} text-white text-xs px-4 py-2 rounded-full font-bold z-10 animate-pulse shadow-lg`}>
                  {item.badge}
                </div>
                
                {/* Image */}
                <div className="relative h-56 overflow-hidden">
                  <Image 
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent group-hover:from-black/40 transition-all duration-300"></div>
                  
                  {/* Overlay */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4">
                      <h3 className="font-bold text-lg text-gray-900 mb-2">{item.name}</h3>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold text-amber-600">€{item.price}</span>
                          {item.oldPrice && (
                            <span className="text-sm text-gray-400 line-through">€{item.oldPrice}</span>
                          )}
                        </div>
                        <button className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-full font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300">
                          Ordina
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* CTA */}
          <div className="text-center">
            <Link 
              href="/ordina"
              className="group inline-flex items-center gap-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-12 py-6 rounded-full font-bold text-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 mb-6"
            >
              <ShoppingCart className="w-8 h-8 group-hover:animate-bounce" />
              Scopri Tutto il Menu
              <span className="text-xl">🔗</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Chi Sono Section - IMMAGINE LOCALE */}
      <section id="chi-sono" className="py-20 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Image */}
            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl transform hover:scale-105 transition-all duration-700">
                <Image 
                  src="/images/landing/andrea.jpg"
                  alt="Andrea Padoan"
                  width={800}
                  height={600}
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-amber-900/30 to-transparent"></div>
              </div>
              
              {/* Floating Stats */}
              <div className="absolute -bottom-8 -right-8 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl p-8 shadow-2xl transform hover:scale-105 transition-all duration-300">
                <div className="text-3xl font-bold">12+ anni</div>
                <div className="text-sm opacity-90">di esperienza</div>
              </div>
            </div>

            {/* Text Content */}
            <div className="space-y-6">
              <div className="text-amber-600 font-bold text-lg">FONDATORE & PERSONAL TRAINER</div>
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900">
                Ciao, sono <span className="text-amber-600">Andrea Padoan</span>
              </h2>
              
              <p className="text-gray-700 text-lg leading-relaxed">
                <strong className="text-amber-600">La mia storia inizia come la tua.</strong> Dopo 12 anni passati dietro una scrivania, 
                mi ritrovavo ogni sera a mangiare male: gastronomia, bar, mense aziendali. 
                A 30 anni ero completamente fuori forma, con problemi digestivi e zero energia.
              </p>
              
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-500 p-6 rounded-r-2xl shadow-lg">
                <p className="text-gray-700 text-lg">
                  <strong className="text-amber-600">La svolta:</strong> Ho deciso di cambiare vita, sono diventato Personal Trainer 
                  e ho capito che il 70% dei risultati dipende dall'alimentazione. Ma c'era un problema: 
                  chi ha tempo di cucinare sano ogni giorno?
                </p>
              </div>
              
              <p className="text-gray-700 text-lg leading-relaxed">
                <strong className="text-amber-600">Nasce Pasto Sano:</strong> Ho passato 4 anni a testare laboratori e fornitori, 
                cercando chi potesse preparare pasti come li avrei cucinati io: naturali, bilanciati, gustosi. 
                Ho coinvolto decine di amici nei test, finché non ho trovato la formula perfetta.
              </p>
              
              <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-r-2xl shadow-lg">
                <div className="flex items-start gap-3">
                  <ChefHat className="w-8 h-8 text-green-600 mt-1" />
                  <p className="text-gray-700 text-lg">
                    <strong className="text-green-600">La missione:</strong> Oggi aiuto centinaia di persone a mangiare sano senza stress. 
                    Perché so cosa significa tornare a casa stanchi e non avere voglia di cucinare. 
                    Con Pasto Sano, il problema è risolto: 2 minuti e mangi!
                  </p>
                </div>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8">
                <div className="text-center bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="text-3xl font-bold text-amber-600">500+</div>
                  <div className="text-sm text-gray-600">Clienti Felici</div>
                </div>
                <div className="text-center bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="text-3xl font-bold text-amber-600">15k+</div>
                  <div className="text-sm text-gray-600">Pasti Consegnati</div>
                </div>
                <div className="text-center bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="text-3xl font-bold text-amber-600">4.9⭐</div>
                  <div className="text-sm text-gray-600">Valutazione</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Come Funziona - RIQUADRI INGRANDITI */}
      <section className="py-20 bg-white relative overflow-hidden">
        <div className="container mx-auto px-4 lg:px-8">
          <h2 className="text-4xl lg:text-5xl font-bold text-center text-gray-900 mb-4">
            Facilissimo! <span className="text-amber-600">4 Step</span>
          </h2>
          <p className="text-xl text-gray-600 text-center mb-16">
            Dal click al piatto in pochi minuti
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <div key={i} className="group text-center">
                {/* Step with Image - INGRANDITI */}
                <div className="relative mb-8">
                  <div className="w-48 h-48 mx-auto rounded-3xl overflow-hidden shadow-2xl group-hover:shadow-3xl transition-all duration-500">
                    <Image 
                      src={step.image}
                      alt={step.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-amber-900/50 to-transparent"></div>
                  </div>
                  
                  {/* Step Number */}
                  <div className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full flex items-center justify-center font-bold text-xl shadow-xl">
                    {i + 1}
                  </div>
                  
                  {/* Icon Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-amber-600 group-hover:scale-110 transition-all duration-300 shadow-lg">
                      {step.icon}
                    </div>
                  </div>
                </div>
                
                <h3 className="font-bold text-2xl text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600 text-lg">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-br from-amber-900 via-orange-800 to-red-900 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-64 h-64 bg-yellow-400/10 rounded-full animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-48 h-48 bg-orange-400/10 rounded-full animate-pulse animation-delay-1000"></div>
          <div className="absolute top-40 right-40 w-32 h-32 bg-red-400/10 rounded-full animate-pulse animation-delay-2000"></div>
        </div>
        
        <div className="container mx-auto px-4 lg:px-8 text-center relative z-10">
          <div>
            <Zap className="w-16 h-16 text-yellow-400 mx-auto mb-6 animate-pulse" />
            <h2 className="text-4xl lg:text-6xl font-bold text-white mb-6">
              Non <span className="text-yellow-400">Aspettare</span>!
            </h2>
            <p className="text-white/90 text-xl lg:text-2xl mb-12 max-w-3xl mx-auto">
              Ogni giorno che passa è un giorno perso per la tua salute. 
              <strong className="text-yellow-400"> Inizia oggi stesso!</strong>
            </p>
          </div>
          
          {/* Offer Box */}
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 max-w-2xl mx-auto mb-12 border border-white/20 shadow-2xl">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Sparkles className="w-8 h-8 text-yellow-400" />
              <p className="text-yellow-300 font-bold text-2xl">
                🎁 OFFERTA LIMITATA
              </p>
              <Sparkles className="w-8 h-8 text-yellow-400" />
            </div>
            <p className="text-white text-xl mb-4">
              Ordina ora e ricevi il <span className="font-bold text-yellow-400 text-2xl">5% di sconto</span> sul primo ordine!
            </p>
            <div className="bg-yellow-400/20 backdrop-blur-sm rounded-full px-6 py-2 inline-block border border-yellow-400/30">
              <p className="text-yellow-200 font-bold">
                Codice: <span className="text-yellow-400">SCONTO5</span>
              </p>
            </div>
          </div>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link 
              href="/ordina"
              className="group bg-white text-amber-900 px-12 py-6 rounded-full font-bold text-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center gap-4"
            >
              <ShoppingCart className="w-8 h-8 group-hover:animate-bounce" />
              Ordina Ora con lo Sconto
              <Sparkles className="w-6 h-6 group-hover:animate-spin" />
            </Link>
            <a 
              href="https://wa.me/393478881515?text=Ciao%20voglio%20ordinare%20con%20SCONTO5"
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-green-500 text-white px-12 py-6 rounded-full font-bold text-xl hover:bg-green-600 hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center gap-4"
            >
              <MessageCircle className="w-8 h-8 group-hover:animate-bounce" />
              Chiedi Info
            </a>
          </div>
        </div>
      </section>

      {/* FAQ Section - ACCORDION */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Domande <span className="text-amber-600">Frequenti</span>
            </h2>
            <p className="text-xl text-gray-600">Tutto quello che devi sapere su Pasto Sano</p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="space-y-4">
              {faqData.map((faq, index) => (
                <div key={index} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                        Q
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {faq.question}
                      </h3>
                    </div>
                    {openFAQ === index ? (
                      <ChevronUp className="w-6 h-6 text-amber-600 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-6 h-6 text-amber-600 flex-shrink-0" />
                    )}
                  </button>
                  
                  {openFAQ === index && (
                    <div className="px-6 pb-6 pt-0">
                      <div className="pl-12 border-l-2 border-amber-200 ml-4">
                        {index === 0 ? (
                          <p className="text-gray-700 leading-relaxed">
                            Al momento puoi ritirare presso{' '}
                            <a 
                              href="https://maps.google.com/?q=Tribu+Personal+Training+Studio,+Via+Albere+27B,+37138+Verona"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-amber-600 font-semibold hover:text-amber-700 underline"
                            >
                              Tribu Personal Training Studio - Via Albere 27B, 37138 Verona
                            </a>
                            .
                          </p>
                        ) : (
                          <p className="text-gray-700 leading-relaxed">
                            {faq.answer}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* CTA in FAQ */}
            <div className="text-center mt-16">
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-8 border border-amber-200">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Hai altre domande?
                </h3>
                <p className="text-gray-600 mb-6">
                  Non esitare a contattarci! Siamo qui per aiutarti
                </p>
                <a 
                  href="https://wa.me/393478881515?text=Ciao%20ho%20una%20domanda%20su%20Pasto%20Sano"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-4 rounded-full font-bold hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  <MessageCircle className="w-6 h-6" />
                  Contattaci su WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials - AFFIANCATE (SPOSTATO ALLA FINE) */}
      <section className="py-20 bg-white relative overflow-hidden">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Cosa Dicono i Nostri <span className="text-amber-600">Clienti</span>
            </h2>
            <div className="flex justify-center items-center gap-3 text-amber-500">
              <Users className="w-6 h-6" />
              <span className="font-bold text-lg">Oltre 500 clienti soddisfatti</span>
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-amber-500 fill-current" />
                ))}
              </div>
            </div>
          </div>
          
          {/* Testimonials Grid - AFFIANCATE */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index}
                className="bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden"
              >
                {/* Quote Icon */}
                <div className="absolute -top-2 -right-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold shadow-lg">
                  "
                </div>
                
                {/* Stars */}
                <div className="flex justify-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-amber-500 fill-current" />
                  ))}
                </div>
                
                {/* Text */}
                <p className="text-gray-700 text-sm mb-6 italic leading-relaxed text-center">
                  "{testimonial.text}"
                </p>
                
                {/* User Info */}
                <div className="flex items-center justify-center gap-3">
                  <Image 
                    src={testimonial.image}
                    alt={testimonial.name}
                    width={48}
                    height={48}
                    className="rounded-full object-cover border-2 border-white shadow-md"
                  />
                  <div className="text-center">
                    <div className="font-bold text-gray-900">
                      {testimonial.name}
                    </div>
                    <div className="text-amber-600 text-sm font-semibold">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contatti" className="bg-amber-950 text-white py-16 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="w-full h-full bg-gradient-to-br from-amber-600 to-orange-600"></div>
        </div>
        
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <Image 
                  src="/images/logo.png"
                  alt="Pasto Sano Logo"
                  width={48}
                  height={48}
                  className="rounded-xl"
                />
                <span className="text-2xl font-bold">Pasto Sano</span>
              </div>
              <p className="text-white/80 leading-relaxed">
                La soluzione per mangiare sano senza stress. 
                Pasti genuini, pronti in 2 minuti.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-yellow-400 font-bold text-lg mb-6">Menu</h3>
              <div className="space-y-3">
                <Link href="/ordina" className="text-white/80 hover:text-amber-400 transition-colors text-left block">
                  Ordina Online
                </Link>
                <button onClick={() => scrollToSection('menu')} className="text-white/80 hover:text-amber-400 transition-colors text-left block">
                  I Nostri Piatti
                </button>
                <button onClick={() => scrollToSection('vantaggi')} className="text-white/80 hover:text-amber-400 transition-colors text-left block">
                  Vantaggi
                </button>
              </div>
            </div>

            {/* Contatti */}
            <div>
              <h3 className="text-yellow-400 font-bold text-lg mb-6">Contatti</h3>
              <div className="space-y-3">
                <a href="tel:+393478881515" className="text-white/80 hover:text-amber-400 transition-colors flex items-center gap-2">
                  📞 347 888 1515
                </a>
                <a href="mailto:info@pastosano.it" className="text-white/80 hover:text-amber-400 transition-colors flex items-center gap-2">
                  ✉️ info@pastosano.it
                </a>
                <a 
                  href="https://wa.me/393478881515?text=Ciao%20voglio%20info%20su%20Pasto%20Sano"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/80 hover:text-green-400 transition-colors flex items-center gap-2"
                >
                  💬 WhatsApp
                </a>
              </div>
            </div>

            {/* Ritiro */}
            <div>
              <h3 className="text-yellow-400 font-bold text-lg mb-6">Ritiro</h3>
              <div className="space-y-3">
                <a 
                  href="https://maps.google.com/?q=Tribu+Personal+Training+Studio,+Via+Albere+27B,+37138+Verona"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/80 hover:text-amber-400 transition-colors flex items-center gap-2"
                >
                  📍 Via Albere 27/B, Verona
                </a>
                <p className="text-white/80">
                  Lun-Ven (concordare orario)
                </p>
                <p className="text-amber-400 font-bold">
                  ⚠️ Ordina 2 giorni prima!
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 text-center text-white/60">
            <p>© 2024 Pasto Sano - Tutti i diritti riservati | Made with ❤️ by Andrea Padoan</p>
          </div>
        </div>
      </footer>

      {/* Simple CSS Animations */}
      <style jsx>{`
        .fade-in {
          animation: fadeIn 0.8s ease-out;
        }
        
        .fade-in-delay {
          animation: fadeIn 0.8s ease-out 0.3s both;
        }
        
        .fade-in-delay-2 {
          animation: fadeIn 0.8s ease-out 0.6s both;
        }
        
        .fade-in-delay-3 {
          animation: fadeIn 0.8s ease-out 0.9s both;
        }
        
        .animation-delay-1000 {
          animation-delay: 1s;
        }
        
        .animation-delay-1500 {
          animation-delay: 1.5s;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}