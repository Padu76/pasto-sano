'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  ShoppingCart, 
  Clock, 
  Star,
  MapPin,
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
  ExternalLink
} from 'lucide-react';

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Remove loading screen after mount
    const timer = setTimeout(() => setIsLoading(false), 300);
    
    // Handle scroll for header
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

  const secrets = [
    {
      number: 1,
      title: "Cucina Sana",
      description: "Cucina i tuoi pasti o trova chi lo fa per te in modo sano!"
    },
    {
      number: 2,
      title: "Mangia Correttamente",
      description: "Impara a bilanciare tutti i nutrienti essenziali."
    },
    {
      number: 3,
      title: "Movimento Quotidiano",
      description: "30 minuti al giorno possono fare la differenza."
    },
    {
      number: 4,
      title: "Nuove Abitudini",
      description: "Una nuova abitudine positiva al mese."
    },
    {
      number: 5,
      title: "Tempo per Te",
      description: "Dedicati a fare qualcosa che ti piace."
    }
  ];

  const features = [
    {
      icon: <Leaf className="w-6 h-6 sm:w-8 sm:h-8" />,
      title: "100% Naturale",
      description: "Senza conservanti o additivi artificiali."
    },
    {
      icon: <Award className="w-6 h-6 sm:w-8 sm:h-8" />,
      title: "Qualità Premium",
      description: "Solo ingredienti freschi e di stagione."
    },
    {
      icon: <Scale className="w-6 h-6 sm:w-8 sm:h-8" />,
      title: "Pasti Bilanciati",
      description: "Proteine, carboidrati e vitamine."
    },
    {
      icon: <Flame className="w-6 h-6 sm:w-8 sm:h-8" />,
      title: "Cottura Perfetta",
      description: "Vapore o piastra per preservare i nutrienti."
    },
    {
      icon: <Clock className="w-6 h-6 sm:w-8 sm:h-8" />,
      title: "Risparmia Tempo",
      description: "Pronti in 2 minuti al microonde."
    },
    {
      icon: <Heart className="w-6 h-6 sm:w-8 sm:h-8" />,
      title: "Migliora la Vita",
      description: "Il 70% del benessere viene dal cibo."
    }
  ];

  const steps = [
    {
      number: 1,
      title: "Scegli",
      description: "Sfoglia il menu"
    },
    {
      number: 2,
      title: "Ordina",
      description: "Aggiungi al carrello"
    },
    {
      number: 3,
      title: "Ritira",
      description: "Dopo 2 giorni"
    },
    {
      number: 4,
      title: "Gusta",
      description: "Buon appetito!"
    }
  ];

  const menuPreview = [
    {
      name: "Fusilli e Manzo",
      image: "/images/meals/fusilli-manzo-zucchine-melanzane.jpg",
      price: "8.50"
    },
    {
      name: "Roastbeef",
      image: "/images/meals/roastbeef-patate-fagiolini.jpg",
      price: "8.50"
    },
    {
      name: "Pollo Grigliato",
      image: "/images/meals/pollo-patate-zucchine.jpg",
      price: "8.50"
    },
    {
      name: "Salmone",
      image: "/images/meals/patate-salmone-broccoli.jpg",
      price: "8.50"
    }
  ];

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header - Mobile Optimized */}
      <header className={`fixed top-0 w-full bg-white/95 backdrop-blur-md z-50 transition-all duration-300 ${
        isScrolled ? 'shadow-lg py-2' : 'py-3'
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
              <button onClick={() => scrollToSection('chi-sono')} className="text-gray-700 hover:text-amber-600 transition-colors text-sm xl:text-base">
                Chi Sono
              </button>
              <button onClick={() => scrollToSection('menu')} className="text-gray-700 hover:text-amber-600 transition-colors text-sm xl:text-base">
                Menu
              </button>
              <button onClick={() => scrollToSection('come-funziona')} className="text-gray-700 hover:text-amber-600 transition-colors text-sm xl:text-base">
                Come Funziona
              </button>
              <button onClick={() => scrollToSection('contatti')} className="text-gray-700 hover:text-amber-600 transition-colors text-sm xl:text-base">
                Contatti
              </button>
              <Link 
                href="/"
                className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-5 py-2 rounded-full font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 text-sm xl:text-base"
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

          {/* Mobile Navigation - Full Screen */}
          {isMenuOpen && (
            <div className="lg:hidden fixed inset-0 top-[56px] bg-white z-50">
              <div className="flex flex-col p-6 space-y-4">
                <button onClick={() => scrollToSection('home')} className="text-left py-3 text-gray-700 text-lg border-b">Home</button>
                <button onClick={() => scrollToSection('chi-sono')} className="text-left py-3 text-gray-700 text-lg border-b">Chi Sono</button>
                <button onClick={() => scrollToSection('menu')} className="text-left py-3 text-gray-700 text-lg border-b">Menu</button>
                <button onClick={() => scrollToSection('come-funziona')} className="text-left py-3 text-gray-700 text-lg border-b">Come Funziona</button>
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

      {/* Hero Section - COMPACT & MOBILE FIRST */}
      <section id="home" className="pt-16 min-h-[40vh] sm:min-h-[45vh] lg:min-h-[50vh] bg-gradient-to-br from-amber-900 via-amber-800 to-orange-900 relative overflow-hidden">
        <div className="container mx-auto px-4 lg:px-8 py-6 sm:py-8 lg:py-12 relative z-10">
          <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 items-center">
            {/* Text Content - Mobile Optimized */}
            <div className="text-white space-y-3 sm:space-y-4">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold leading-tight">
                Mangia Sano,<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
                  Vivi Meglio
                </span>
              </h1>
              <p className="text-sm sm:text-base lg:text-lg text-white/90 leading-relaxed">
                Pasti bilanciati e gustosi, preparati con ingredienti freschi. 
                La soluzione per chi non ha tempo di cucinare.
              </p>
              
              {/* Features Pills - Mobile Optimized */}
              <div className="flex flex-wrap gap-2 py-2">
                <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full text-xs sm:text-sm">
                  <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>Ritiro sede</span>
                </div>
                <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full text-xs sm:text-sm">
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>2 giorni</span>
                </div>
                <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full text-xs sm:text-sm">
                  <Star className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>Premium</span>
                </div>
              </div>

              {/* CTA Buttons - Mobile Optimized */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link 
                  href="/"
                  className="bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 px-5 py-2.5 rounded-full font-bold hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                  Ordina Ora
                </Link>
                <button 
                  onClick={() => scrollToSection('chi-sono')}
                  className="bg-white/20 backdrop-blur-sm border-2 border-white text-white px-5 py-2.5 rounded-full font-bold hover:bg-white hover:text-amber-900 transition-all duration-300 text-sm sm:text-base text-center"
                >
                  Scopri di Più
                </button>
              </div>
            </div>

            {/* Image - Mobile Optimized */}
            <div className="relative hidden lg:block">
              <div className="relative rounded-xl overflow-hidden shadow-2xl">
                <Image 
                  src="/images/landing/hero-meal.jpg" 
                  alt="Pasti Sani"
                  width={500}
                  height={300}
                  className="w-full h-auto object-cover"
                  priority
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80';
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Chi Sono Section - COMPACT & MOBILE FIRST */}
      <section id="chi-sono" className="py-10 sm:py-12 lg:py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-6 lg:gap-10 items-start">
            {/* Image - Same height as text content */}
            <div className="relative order-2 lg:order-1">
              <div className="rounded-xl overflow-hidden shadow-xl h-[300px] sm:h-[350px] lg:h-[400px]">
                <Image 
                  src="/images/landing/andrea.jpg" 
                  alt="Andrea Padoan"
                  width={600}
                  height={400}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80';
                  }}
                />
              </div>
              <div className="absolute -bottom-4 -right-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg p-3 sm:p-4 shadow-xl">
                <div className="text-lg sm:text-xl font-bold">12+ anni</div>
                <div className="text-xs sm:text-sm">di esperienza</div>
              </div>
            </div>

            {/* Text - Compact */}
            <div className="space-y-3 sm:space-y-4 order-1 lg:order-2">
              <div className="text-amber-600 font-semibold text-sm sm:text-base">FONDATORE & PERSONAL TRAINER</div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
                Ciao, sono Andrea
              </h2>
              <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                Sono un Personal Trainer e il mio lavoro è far tornare in forma le persone!
              </p>
              
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-500 p-3 sm:p-4 rounded-r-lg">
                <p className="text-sm sm:text-base text-gray-700">
                  <strong>La mia storia:</strong> Dopo 12 anni di lavoro sedentario, ero completamente fuori forma a 30 anni. 
                  Ho deciso di cambiare vita e ora aiuto gli altri a fare lo stesso.
                </p>
              </div>

              <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                Ho creato Pasto Sano perché so quanto è difficile mangiare bene quando non hai tempo. 
                La soluzione? Pasti pronti, sani e gustosi!
              </p>

              <Link 
                href="/"
                className="inline-flex bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-2.5 rounded-full font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 items-center gap-2 text-sm sm:text-base"
              >
                Scopri il Menu
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* I 5 Segreti Section - MOBILE OPTIMIZED */}
      <section className="py-10 sm:py-12 lg:py-16 bg-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-8 sm:mb-10">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-900 to-amber-700 mb-2 sm:mb-3">
              I 5 Segreti per Stare in Forma
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600">
              Il metodo che funziona davvero
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {secrets.map((secret, index) => (
              <div 
                key={index}
                className="bg-white border border-gray-100 rounded-xl p-4 sm:p-5 shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-amber-500 to-orange-500"></div>
                
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full flex items-center justify-center font-bold text-sm sm:text-lg flex-shrink-0">
                    {secret.number}
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1">{secret.title}</h3>
                    <p className="text-xs sm:text-sm text-gray-600">{secret.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Perché Pasto Sano - MOBILE OPTIMIZED */}
      <section className="py-10 sm:py-12 lg:py-16 bg-gradient-to-b from-amber-50 to-orange-50">
        <div className="container mx-auto px-4 lg:px-8">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center text-gray-900 mb-8 sm:mb-10">
            Perché Scegliere Pasto Sano?
          </h2>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-white rounded-xl p-4 sm:p-6 shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 text-center"
              >
                <div className="text-amber-500 mb-2 sm:mb-3 flex justify-center">
                  {feature.icon}
                </div>
                <h3 className="text-sm sm:text-base lg:text-lg font-bold text-gray-900 mb-1 sm:mb-2">{feature.title}</h3>
                <p className="text-xs sm:text-sm text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Menu Section - MOBILE OPTIMIZED */}
      <section id="menu" className="py-10 sm:py-12 lg:py-16 bg-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-8 sm:mb-10">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-3">
              Il Nostro Menu
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600">
              Scegli e ordina online
            </p>
          </div>

          {/* Menu Preview Grid - Mobile Optimized */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8 sm:mb-10">
            {menuPreview.map((item, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300">
                <div className="h-28 sm:h-36 lg:h-44 overflow-hidden">
                  <Image 
                    src={item.image}
                    alt={item.name}
                    width={300}
                    height={200}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80';
                    }}
                  />
                </div>
                <div className="p-2 sm:p-3">
                  <h3 className="font-bold text-gray-900 text-xs sm:text-sm lg:text-base mb-1">{item.name}</h3>
                  <p className="text-amber-600 font-bold text-sm sm:text-base">€{item.price}</p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA to Full Menu - Mobile Optimized */}
          <div className="text-center">
            <Link 
              href="/"
              className="inline-flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold text-sm sm:text-base lg:text-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
            >
              <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
              <span>Vai al Menu Completo</span>
              <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5" />
            </Link>
            <p className="text-gray-600 mt-3 text-xs sm:text-sm">
              Scopri tutti i piatti disponibili
            </p>
          </div>
        </div>
      </section>

      {/* Come Funziona - MOBILE OPTIMIZED */}
      <section id="come-funziona" className="py-10 sm:py-12 lg:py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 lg:px-8">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center text-gray-900 mb-8 sm:mb-10">
            Come Funziona?
          </h2>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full flex items-center justify-center font-bold text-lg sm:text-xl lg:text-2xl mx-auto mb-3">
                  {step.number}
                </div>
                <h3 className="text-sm sm:text-base lg:text-lg font-bold text-gray-900 mb-1">{step.title}</h3>
                <p className="text-xs sm:text-sm text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - MOBILE OPTIMIZED */}
      <section className="py-10 sm:py-12 lg:py-16 bg-gradient-to-r from-amber-900 via-amber-800 to-orange-900 relative overflow-hidden">
        <div className="container mx-auto px-4 lg:px-8 text-center relative z-10">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 sm:mb-4">
            Inizia Oggi!
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-white/90 mb-6 sm:mb-8 max-w-2xl mx-auto">
            Non aspettare domani per prenderti cura di te
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Link 
              href="/"
              className="bg-white text-amber-900 px-6 py-3 rounded-full font-bold text-sm sm:text-base hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
              Ordina Ora
            </Link>
            <a 
              href="https://wa.me/393478881515?text=Ciao%20Pasto%20Sano,%20vorrei%20informazioni"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-500 text-white px-6 py-3 rounded-full font-bold text-sm sm:text-base hover:bg-green-600 hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* Footer - MOBILE OPTIMIZED */}
      <footer id="contatti" className="bg-amber-950 text-white py-10 sm:py-12 lg:py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-8 sm:mb-10">
            {/* Brand */}
            <div className="text-center sm:text-left">
              <div className="flex items-center gap-2 mb-3 justify-center sm:justify-start">
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
                La soluzione per stare in forma.
              </p>
              <div className="flex gap-3 mt-4 justify-center sm:justify-start">
                <a href="#" className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center hover:bg-amber-500 transition-colors">
                  <Facebook className="w-4 h-4" />
                </a>
                <a href="#" className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center hover:bg-amber-500 transition-colors">
                  <Instagram className="w-4 h-4" />
                </a>
                <a href="https://wa.me/393478881515" target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center hover:bg-green-500 transition-colors">
                  <MessageCircle className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Link Utili */}
            <div className="text-center sm:text-left">
              <h3 className="text-yellow-400 font-bold text-base mb-3">Link Utili</h3>
              <ul className="space-y-2">
                <li>
                  <button onClick={() => scrollToSection('chi-sono')} className="text-white/80 hover:text-amber-400 transition-colors text-sm">
                    Chi Sono
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('menu')} className="text-white/80 hover:text-amber-400 transition-colors text-sm">
                    Menu
                  </button>
                </li>
                <li>
                  <Link href="/" className="text-white/80 hover:text-amber-400 transition-colors text-sm">
                    Ordina Online
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contatti */}
            <div className="text-center sm:text-left">
              <h3 className="text-yellow-400 font-bold text-base mb-3">Contatti</h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-white/80 justify-center sm:justify-start">
                  <Mail className="w-4 h-4" />
                  <a href="mailto:info@pastosano.it" className="hover:text-amber-400 transition-colors text-sm">
                    info@pastosano.it
                  </a>
                </li>
                <li className="flex items-center gap-2 text-white/80 justify-center sm:justify-start">
                  <Phone className="w-4 h-4" />
                  <a href="tel:+393478881515" className="hover:text-amber-400 transition-colors text-sm">
                    347 888 1515
                  </a>
                </li>
              </ul>
            </div>

            {/* Orari */}
            <div className="text-center sm:text-left">
              <h3 className="text-yellow-400 font-bold text-base mb-3">Ritiro</h3>
              <p className="text-white/80 text-sm">
                Via Albere 27/B<br />
                Lun-Ven (orario da concordare)<br />
                <span className="text-amber-400 font-semibold mt-2 inline-block">Ordina 2 giorni prima</span>
              </p>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-white/10 pt-6 text-center text-white/60 text-xs sm:text-sm">
            <p>© 2024 Pasto Sano - Tutti i diritti riservati</p>
          </div>
        </div>
      </footer>
    </div>
  );
}