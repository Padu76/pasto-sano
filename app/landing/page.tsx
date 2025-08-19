'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  ShoppingCart, 
  Clock, 
  Star,
  Menu,
  X,
  Leaf,
  Award,
  Scale,
  Flame,
  Heart,
  Mail,
  Phone,
  MessageCircle,
  Facebook,
  Instagram,
  ArrowRight,
  ExternalLink,
  CheckCircle,
  XCircle,
  Home,
  Timer,
  Users,
  AlertCircle,
  Sparkles,
  ChefHat,
  Zap,
  CreditCard
} from 'lucide-react';

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');
  const [availableSpots, setAvailableSpots] = useState(8);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

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
    
    // Testimonials rotation
    const testimonialInterval = setInterval(() => {
      setCurrentTestimonial(prev => (prev + 1) % testimonials.length);
    }, 4000);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(countdownInterval);
      clearInterval(spotsInterval);
      clearInterval(testimonialInterval);
    };
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

  const problems = [
    {
      icon: <XCircle className="w-6 h-6 text-red-500" />,
      text: "Torni a casa stanco e non sai cosa mangiare"
    },
    {
      icon: <XCircle className="w-6 h-6 text-red-500" />,
      text: "Mangi sempre le stesse cose in gastronomia"
    },
    {
      icon: <XCircle className="w-6 h-6 text-red-500" />,
      text: "Spesa dell'ultimo minuto e sprechi"
    },
    {
      icon: <XCircle className="w-6 h-6 text-red-500" />,
      text: "Cibo pesante che ti rallenta"
    }
  ];

  const solutions = [
    {
      icon: <CheckCircle className="w-6 h-6 text-green-500" />,
      title: "Pasto Pronto in 2 Minuti",
      description: "Torni a casa e il pranzo è già pronto"
    },
    {
      icon: <Home className="w-6 h-6 text-green-500" />,
      title: "Zero Stress",
      description: "Niente spesa, niente cucina, solo relax"
    },
    {
      icon: <Leaf className="w-6 h-6 text-green-500" />,
      title: "Leggero e Nutriente",
      description: "Ti senti energico tutto il giorno"
    },
    {
      icon: <Timer className="w-6 h-6 text-green-500" />,
      title: "Tempo per Te",
      description: "Recuperi 1 ora al giorno"
    }
  ];

  const features = [
    {
      image: "/images/meals/fusilli-manzo-zucchine-melanzane.jpg",
      title: "100% Naturale",
      description: "Senza conservanti o additivi",
      badge: "GARANTITO"
    },
    {
      image: "/images/meals/roastbeef-patate-fagiolini.jpg",
      title: "Qualità Premium",
      description: "Solo ingredienti selezionati",
      badge: "TOP QUALITY"
    },
    {
      image: "/images/meals/pollo-patate-zucchine.jpg",
      title: "Bilanciato",
      description: "Proteine, carboidrati, vitamine",
      badge: "EQUILIBRATO"
    },
    {
      image: "/images/meals/patate-salmone-broccoli.jpg",
      title: "Cottura Perfetta",
      description: "Vapore per preservare i nutrienti",
      badge: "CHEF"
    },
    {
      image: "/images/meals/riso-hamburger-carotine.jpg",
      title: "Pronto Subito",
      description: "2 minuti al microonde",
      badge: "VELOCE"
    },
    {
      image: "/images/meals/orzo-ceci-feta-pomodorini.jpg",
      title: "Vario e Gustoso",
      description: "Menu sempre diverso",
      badge: "NOVITÀ"
    }
  ];

  const testimonials = [
    {
      name: "Marco R.",
      role: "Imprenditore",
      text: "Finalmente posso mangiare sano anche con poco tempo. Pasto Sano mi ha cambiato la vita!",
      rating: 5
    },
    {
      name: "Laura B.",
      role: "Manager",
      text: "Ho perso 8kg in 3 mesi senza rinunciare al gusto. Consigliatissimo!",
      rating: 5
    },
    {
      name: "Giuseppe T.",
      role: "Sportivo",
      text: "Perfetto per chi si allena. Pasti bilanciati e gustosi, recupero meglio dopo l'allenamento.",
      rating: 5
    },
    {
      name: "Anna M.",
      role: "Mamma lavoratrice",
      text: "Non ho più lo stress di cucinare ogni giorno. Più tempo per la famiglia!",
      rating: 5
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
      image: "/images/meals/roastbeef-patate-fagiolini.jpg",
      price: "8.50",
      badge: "PREFERITO",
      badgeColor: "bg-blue-500"
    },
    {
      name: "Pollo Grigliato",
      image: "/images/meals/pollo-patate-zucchine.jpg",
      price: "8.50",
      badge: "LEGGERO",
      badgeColor: "bg-green-500"
    },
    {
      name: "Salmone",
      image: "/images/meals/patate-salmone-broccoli.jpg",
      price: "8.50",
      badge: "OMEGA 3",
      badgeColor: "bg-purple-500"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Floating WhatsApp Button */}
      <a 
        href="https://wa.me/393478881515?text=Ciao%20Pasto%20Sano,%20vorrei%20ordinare"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 bg-green-500 text-white p-4 rounded-full shadow-2xl hover:bg-green-600 transform hover:scale-110 transition-all duration-300 z-50 animate-pulse"
      >
        <MessageCircle className="w-6 h-6" />
      </a>

      {/* Header - Mobile Optimized */}
      <header className={`fixed top-0 w-full bg-white/95 backdrop-blur-md z-40 transition-all duration-300 ${
        isScrolled ? 'shadow-xl py-2' : 'py-3'
      }`}>
        <nav className="container mx-auto px-4 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div className="flex items-center gap-2 sm:gap-3">
              <Image 
                src="/images/logo.png" 
                alt="Pasto Sano" 
                width={40} 
                height={40}
                className="object-contain sm:w-[50px] sm:h-[50px]"
              />
              <span className="text-xl sm:text-2xl font-bold text-amber-900">Pasto Sano</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-6 xl:gap-8">
              <button onClick={() => scrollToSection('home')} className="text-gray-700 hover:text-amber-600 transition-colors text-sm xl:text-base">
                Home
              </button>
              <button onClick={() => scrollToSection('vantaggi')} className="text-gray-700 hover:text-amber-600 transition-colors text-sm xl:text-base">
                Vantaggi
              </button>
              <button onClick={() => scrollToSection('menu')} className="text-gray-700 hover:text-amber-600 transition-colors text-sm xl:text-base">
                Menu
              </button>
              <button onClick={() => scrollToSection('chi-sono')} className="text-gray-700 hover:text-amber-600 transition-colors text-sm xl:text-base">
                Chi Sono
              </button>
              <button onClick={() => scrollToSection('contatti')} className="text-gray-700 hover:text-amber-600 transition-colors text-sm xl:text-base">
                Contatti
              </button>
              <Link 
                href="/"
                className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-5 py-2 rounded-full font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 text-sm xl:text-base animate-pulse"
              >
                Ordina Ora
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="lg:hidden fixed inset-0 top-[56px] bg-white z-50">
              <div className="flex flex-col p-6 space-y-4">
                <button onClick={() => scrollToSection('home')} className="text-left py-3 text-gray-700 text-lg border-b">Home</button>
                <button onClick={() => scrollToSection('vantaggi')} className="text-left py-3 text-gray-700 text-lg border-b">Vantaggi</button>
                <button onClick={() => scrollToSection('menu')} className="text-left py-3 text-gray-700 text-lg border-b">Menu</button>
                <button onClick={() => scrollToSection('chi-sono')} className="text-left py-3 text-gray-700 text-lg border-b">Chi Sono</button>
                <button onClick={() => scrollToSection('contatti')} className="text-left py-3 text-gray-700 text-lg border-b">Contatti</button>
                <Link 
                  href="/"
                  className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-4 rounded-full font-semibold text-center text-lg mt-4"
                >
                  Ordina Ora
                </Link>
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* Hero Section - SUPER COMPACT con URGENZA */}
      <section id="home" className="pt-16 h-[300px] sm:h-[350px] bg-gradient-to-br from-amber-900 via-amber-800 to-orange-900 relative overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-20 h-20 bg-yellow-400/20 rounded-full animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-32 h-32 bg-orange-400/20 rounded-full animate-pulse delay-1000"></div>
          <div className="absolute top-20 right-20 w-16 h-16 bg-yellow-300/20 rounded-full animate-pulse delay-500"></div>
        </div>
        
        <div className="container mx-auto px-4 lg:px-8 h-full flex items-center relative z-10">
          <div className="text-white space-y-4 text-center lg:text-left max-w-2xl mx-auto lg:mx-0">
            {/* Countdown Badge */}
            <div className="inline-flex items-center gap-2 bg-red-500/90 text-white px-4 py-2 rounded-full text-sm font-bold animate-bounce">
              <AlertCircle className="w-4 h-4" />
              Ordina entro le 18:00 per ritiro dopodomani! ⏰ {timeLeft}
            </div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight animate-fade-in">
              Mangia Sano,
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
                {" "}Vivi Meglio
              </span>
            </h1>
            
            <p className="text-base sm:text-lg text-white/90">
              Pasti pronti in 2 minuti. Torni a casa e mangi subito!
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Link 
                href="/"
                className="bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 px-6 py-3 rounded-full font-bold hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-5 h-5" />
                Ordina Subito
                <Sparkles className="w-4 h-4" />
              </Link>
              <button 
                onClick={() => scrollToSection('vantaggi')}
                className="bg-white/20 backdrop-blur-sm border-2 border-white text-white px-6 py-3 rounded-full font-bold hover:bg-white hover:text-amber-900 transition-all duration-300"
              >
                Scopri i Vantaggi
              </button>
            </div>
            
            {/* Spots Available */}
            <div className="text-sm text-yellow-300 font-semibold">
              ⚠️ Solo {availableSpots} posti disponibili per domani!
            </div>
          </div>
        </div>
      </section>

      {/* Problems & Solutions Section */}
      <section id="vantaggi" className="py-12 lg:py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
              Basta con questi problemi!
            </h2>
            <p className="text-gray-600">Hai mai vissuto queste situazioni?</p>
          </div>
          
          {/* Problems */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            {problems.map((problem, index) => (
              <div 
                key={index}
                className="bg-red-50 border border-red-200 rounded-lg p-4 transform hover:scale-105 transition-all duration-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start gap-3">
                  {problem.icon}
                  <p className="text-sm text-gray-700">{problem.text}</p>
                </div>
              </div>
            ))}
          </div>
          
          {/* Arrow Down */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-amber-500 text-white rounded-full animate-bounce">
              <ArrowRight className="w-6 h-6 rotate-90" />
            </div>
          </div>
          
          {/* Solutions */}
          <div className="text-center mb-10">
            <h3 className="text-2xl sm:text-3xl font-bold text-green-600 mb-3">
              Ecco la Soluzione! 
            </h3>
            <p className="text-gray-600">Con Pasto Sano tutto cambia</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {solutions.map((solution, index) => (
              <div 
                key={index}
                className="bg-green-50 border border-green-200 rounded-lg p-6 transform hover:scale-105 transition-all duration-300 hover:shadow-xl"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex flex-col items-center text-center gap-3">
                  {solution.icon}
                  <h4 className="font-bold text-gray-900">{solution.title}</h4>
                  <p className="text-sm text-gray-600">{solution.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits with Real Images */}
      <section className="py-12 lg:py-16 bg-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
              Perché Scegliere Pasto Sano?
            </h2>
            <p className="text-gray-600">Guarda con i tuoi occhi la qualità dei nostri piatti</p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group relative bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300"
              >
                {/* Badge */}
                <div className="absolute top-2 right-2 bg-amber-500 text-white text-xs px-2 py-1 rounded-full font-bold z-10">
                  {feature.badge}
                </div>
                
                {/* Image */}
                <div className="h-32 sm:h-40 overflow-hidden">
                  <Image 
                    src={feature.image}
                    alt={feature.title}
                    width={300}
                    height={200}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80';
                    }}
                  />
                </div>
                
                {/* Content */}
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 mb-1">{feature.title}</h3>
                  <p className="text-xs sm:text-sm text-gray-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Menu Highlights with Effects */}
      <section id="menu" className="py-12 lg:py-16 bg-gradient-to-b from-amber-50 to-orange-50">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
              I Nostri Bestseller
            </h2>
            <p className="text-gray-600">I piatti più amati dai nostri clienti</p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {menuHighlights.map((item, index) => (
              <div 
                key={index}
                className="group relative bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
              >
                {/* Badge */}
                <div className={`absolute top-2 left-2 ${item.badgeColor} text-white text-xs px-3 py-1 rounded-full font-bold z-10 animate-pulse`}>
                  {item.badge}
                </div>
                
                {/* Image */}
                <div className="h-32 sm:h-40 overflow-hidden">
                  <Image 
                    src={item.image}
                    alt={item.name}
                    width={300}
                    height={200}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80';
                    }}
                  />
                </div>
                
                {/* Content */}
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 mb-2">{item.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-amber-600">€{item.price}</span>
                    {item.oldPrice && (
                      <span className="text-sm text-gray-400 line-through">€{item.oldPrice}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* CTA */}
          <div className="text-center">
            <Link 
              href="/"
              className="inline-flex items-center gap-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-8 py-4 rounded-full font-bold text-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
            >
              <ShoppingCart className="w-6 h-6" />
              Scopri Tutto il Menu
              <ExternalLink className="w-5 h-5" />
            </Link>
            <p className="text-amber-600 font-semibold mt-4 animate-pulse">
              🔥 Offerta: Ordina 5 pasti e il 6° è GRATIS!
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials Carousel */}
      <section className="py-12 lg:py-16 bg-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
              Cosa Dicono i Nostri Clienti
            </h2>
            <div className="flex justify-center items-center gap-2 text-amber-500">
              <Users className="w-5 h-5" />
              <span className="font-semibold">Oltre 500 clienti soddisfatti</span>
            </div>
          </div>
          
          <div className="max-w-2xl mx-auto">
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-8 shadow-xl relative">
              {/* Quote Icon */}
              <div className="absolute -top-4 left-8 bg-amber-500 text-white w-8 h-8 rounded-full flex items-center justify-center">
                <span className="text-2xl">"</span>
              </div>
              
              {/* Testimonial Content */}
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-amber-500 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 text-lg mb-4 italic">
                  "{testimonials[currentTestimonial].text}"
                </p>
                <div className="font-bold text-gray-900">
                  {testimonials[currentTestimonial].name}
                </div>
                <div className="text-sm text-gray-600">
                  {testimonials[currentTestimonial].role}
                </div>
              </div>
              
              {/* Dots */}
              <div className="flex justify-center gap-2 mt-6">
                {testimonials.map((_, index) => (
                  <div 
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentTestimonial ? 'bg-amber-500 w-8' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Chi Sono Section - EXPANDED */}
      <section id="chi-sono" className="py-12 lg:py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Image */}
            <div className="relative">
              <div className="rounded-2xl overflow-hidden shadow-2xl">
                <Image 
                  src="/images/landing/andrea.jpg" 
                  alt="Andrea Padoan"
                  width={600}
                  height={600}
                  className="w-full h-auto"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80';
                  }}
                />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl p-6 shadow-xl">
                <div className="text-2xl font-bold">12+ anni</div>
                <div>di esperienza</div>
              </div>
            </div>

            {/* Text - EXPANDED */}
            <div className="space-y-4">
              <div className="text-amber-600 font-semibold">FONDATORE & PERSONAL TRAINER</div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
                Ciao, sono Andrea Padoan
              </h2>
              
              <p className="text-gray-700 leading-relaxed">
                <strong>La mia storia inizia come la tua.</strong> Dopo 12 anni passati dietro una scrivania, 
                mi ritrovavo ogni sera a mangiare male: gastronomia, bar, mense aziendali. 
                A 30 anni ero completamente fuori forma, con problemi digestivi e zero energia.
              </p>
              
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-500 p-4 rounded-r-xl">
                <p className="text-gray-700">
                  <strong>La svolta:</strong> Ho deciso di cambiare vita, sono diventato Personal Trainer 
                  e ho capito che il 70% dei risultati dipende dall'alimentazione. Ma c'era un problema: 
                  chi ha tempo di cucinare sano ogni giorno?
                </p>
              </div>
              
              <p className="text-gray-700 leading-relaxed">
                <strong>Nasce Pasto Sano:</strong> Ho passato 4 anni a testare laboratori e fornitori, 
                cercando chi potesse preparare pasti come li avrei cucinati io: naturali, bilanciati, gustosi. 
                Ho coinvolto decine di amici nei test, finché non ho trovato la formula perfetta.
              </p>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-gray-700">
                  <ChefHat className="w-5 h-5 text-green-600 inline mr-2" />
                  <strong>La missione:</strong> Oggi aiuto centinaia di persone a mangiare sano senza stress. 
                  Perché so cosa significa tornare a casa stanchi e non avere voglia di cucinare. 
                  Con Pasto Sano, il problema è risolto: 2 minuti e mangi!
                </p>
              </div>
              
              <div className="flex items-center gap-6 pt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-600">500+</div>
                  <div className="text-sm text-gray-600">Clienti Felici</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-600">15.000+</div>
                  <div className="text-sm text-gray-600">Pasti Consegnati</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-600">4.9⭐</div>
                  <div className="text-sm text-gray-600">Valutazione</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Come Funziona - Quick Steps */}
      <section className="py-12 lg:py-16 bg-white">
        <div className="container mx-auto px-4 lg:px-8">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center text-gray-900 mb-10">
            Facilissimo! 4 Step
          </h2>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <ShoppingCart />, title: "Scegli", desc: "Dal menu online" },
              { icon: <CreditCard />, title: "Ordina", desc: "Paghi online o al ritiro" },
              { icon: <Clock />, title: "Aspetta", desc: "2 giorni lavorativi" },
              { icon: <ThumbsUp />, title: "Ritira", desc: "Via Albere 27/B" }
            ].map((step, i) => (
              <div key={i} className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  {React.cloneElement(step.icon as React.ReactElement, { className: "w-8 h-8" })}
                </div>
                <h3 className="font-bold text-gray-900 mb-1">{step.title}</h3>
                <p className="text-xs text-gray-600">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA - URGENCY */}
      <section className="py-12 lg:py-16 bg-gradient-to-r from-amber-900 via-amber-800 to-orange-900">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <Zap className="w-12 h-12 text-yellow-400 mx-auto mb-4 animate-pulse" />
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
            Non Aspettare!
          </h2>
          <p className="text-white/90 text-lg mb-6">
            Ogni giorno che passa è un giorno perso per la tua salute
          </p>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 max-w-md mx-auto mb-8">
            <p className="text-yellow-300 font-bold text-lg mb-2">
              🎁 OFFERTA LIMITATA
            </p>
            <p className="text-white">
              Ordina ora e ricevi il 10% di sconto sul primo ordine!
            </p>
            <p className="text-sm text-white/80 mt-2">
              Codice: SALUTE10
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/"
              className="bg-white text-amber-900 px-8 py-4 rounded-full font-bold text-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-6 h-6" />
              Ordina Ora con lo Sconto
            </Link>
            <a 
              href="https://wa.me/393478881515?text=Ciao%20voglio%20ordinare%20con%20SALUTE10"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-500 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-green-600 hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-6 h-6" />
              Ordina via WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* Footer - COMPACT */}
      <footer id="contatti" className="bg-amber-950 text-white py-10">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Image 
                  src="/images/logo.png" 
                  alt="Pasto Sano" 
                  width={40} 
                  height={40}
                  className="object-contain"
                />
                <span className="text-xl font-bold">Pasto Sano</span>
              </div>
              <p className="text-white/80 text-sm">
                La soluzione per mangiare sano senza stress.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-yellow-400 font-bold mb-3">Menu</h3>
              <Link href="/" className="text-white/80 hover:text-amber-400 text-sm block mb-2">
                Ordina Online
              </Link>
              <button onClick={() => scrollToSection('menu')} className="text-white/80 hover:text-amber-400 text-sm block mb-2">
                I Nostri Piatti
              </button>
            </div>

            {/* Contatti */}
            <div>
              <h3 className="text-yellow-400 font-bold mb-3">Contatti</h3>
              <a href="tel:+393478881515" className="text-white/80 hover:text-amber-400 text-sm block mb-2">
                📞 347 888 1515
              </a>
              <a href="mailto:info@pastosano.it" className="text-white/80 hover:text-amber-400 text-sm block mb-2">
                ✉️ info@pastosano.it
              </a>
            </div>

            {/* Ritiro */}
            <div>
              <h3 className="text-yellow-400 font-bold mb-3">Ritiro</h3>
              <p className="text-white/80 text-sm">
                📍 Via Albere 27/B<br />
                Lun-Ven (concordare orario)<br />
                <span className="text-amber-400 font-bold">Ordina 2 giorni prima!</span>
              </p>
            </div>
          </div>

          <div className="border-t border-white/10 pt-6 text-center text-white/60 text-xs">
            <p>© 2024 Pasto Sano - Tutti i diritti riservati | Made with ❤️ by Andrea Padoan</p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
        
        .delay-500 {
          animation-delay: 500ms;
        }
        
        .delay-1000 {
          animation-delay: 1000ms;
        }
      `}</style>
    </div>
  );
}