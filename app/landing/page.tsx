'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  ShoppingCart, 
  Clock, 
  Star,
  MapPin,
  Menu,
  X,
  Check,
  Leaf,
  Award,
  Scale,
  Flame,
  Heart,
  ChevronRight,
  Mail,
  Phone,
  MessageCircle,
  Facebook,
  Instagram,
  ArrowRight
} from 'lucide-react';

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Remove loading screen after mount
    const timer = setTimeout(() => setIsLoading(false), 500);
    
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
      description: "Cucina i tuoi pasti o trova chi lo fa per te in modo sano! La base di tutto è l'alimentazione corretta."
    },
    {
      number: 2,
      title: "Mangia Correttamente",
      description: "Impara a mangiare correttamente, bilanciando tutti i nutrienti essenziali per il tuo corpo."
    },
    {
      number: 3,
      title: "Movimento Quotidiano",
      description: "Fai movimento ogni giorno, anche solo 30 minuti possono fare la differenza."
    },
    {
      number: 4,
      title: "Nuove Abitudini",
      description: "Inserisci una nuova abitudine positiva al mese per un cambiamento graduale e duraturo."
    },
    {
      number: 5,
      title: "Tempo per Te",
      description: "Prenditi sempre uno spazio per te stesso e dedicalo a fare qualcosa che ti piace."
    }
  ];

  const features = [
    {
      icon: <Leaf className="w-8 h-8" />,
      title: "100% Naturale",
      description: "Solo cibo naturale, senza conservanti, additivi o sostanze artificiali. Cucinato come lo faresti tu a casa."
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: "Qualità Premium",
      description: "Selezioniamo solo ingredienti di prima qualità, freschi e di stagione, da fornitori certificati."
    },
    {
      icon: <Scale className="w-8 h-8" />,
      title: "Pasti Bilanciati",
      description: "Ogni piatto contiene il giusto equilibrio di proteine, carboidrati, grassi buoni e vitamine."
    },
    {
      icon: <Flame className="w-8 h-8" />,
      title: "Cottura Perfetta",
      description: "Utilizziamo cottura a vapore o piastra per preservare tutti i nutrienti e il gusto naturale degli alimenti."
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "Risparmia Tempo",
      description: "Non perdere ore in cucina! I tuoi pasti sani sono pronti in 2 minuti al microonde."
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Migliora la Tua Vita",
      description: "\"Fa che il Cibo sia la tua Medicina\" - Ippocrate. Il 70% del benessere viene dall'alimentazione."
    }
  ];

  const steps = [
    {
      number: 1,
      title: "Scegli i Tuoi Pasti",
      description: "Sfoglia il nostro menu e seleziona i piatti che preferisci"
    },
    {
      number: 2,
      title: "Completa l'Ordine",
      description: "Aggiungi al carrello e procedi al pagamento sicuro"
    },
    {
      number: 3,
      title: "Scegli Data e Ora",
      description: "Seleziona quando ritirare i tuoi pasti (minimo 2 giorni)"
    },
    {
      number: 4,
      title: "Ritira e Gusta",
      description: "Vieni a ritirare presso Tribù Personal Training Studio"
    }
  ];

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className={`fixed top-0 w-full bg-white/95 backdrop-blur-md z-50 transition-all duration-300 ${
        isScrolled ? 'shadow-lg py-3' : 'py-4'
      }`}>
        <nav className="container mx-auto px-4 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <Image 
                src="/images/logo.png" 
                alt="Pasto Sano" 
                width={50} 
                height={50}
                className="object-contain"
              />
              <span className="text-2xl font-bold text-amber-900">Pasto Sano</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              <button onClick={() => scrollToSection('home')} className="text-gray-700 hover:text-amber-600 transition-colors">
                Home
              </button>
              <button onClick={() => scrollToSection('chi-sono')} className="text-gray-700 hover:text-amber-600 transition-colors">
                Chi Sono
              </button>
              <button onClick={() => scrollToSection('menu')} className="text-gray-700 hover:text-amber-600 transition-colors">
                Menu
              </button>
              <button onClick={() => scrollToSection('come-funziona')} className="text-gray-700 hover:text-amber-600 transition-colors">
                Come Funziona
              </button>
              <button onClick={() => scrollToSection('contatti')} className="text-gray-700 hover:text-amber-600 transition-colors">
                Contatti
              </button>
              <button 
                onClick={() => scrollToSection('menu')}
                className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-2.5 rounded-full font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300"
              >
                Ordina Ora
              </button>
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
            <div className="lg:hidden absolute top-full left-0 right-0 bg-white border-t shadow-lg">
              <div className="flex flex-col p-4 space-y-3">
                <button onClick={() => scrollToSection('home')} className="text-left py-2 text-gray-700">Home</button>
                <button onClick={() => scrollToSection('chi-sono')} className="text-left py-2 text-gray-700">Chi Sono</button>
                <button onClick={() => scrollToSection('menu')} className="text-left py-2 text-gray-700">Menu</button>
                <button onClick={() => scrollToSection('come-funziona')} className="text-left py-2 text-gray-700">Come Funziona</button>
                <button onClick={() => scrollToSection('contatti')} className="text-left py-2 text-gray-700">Contatti</button>
                <button 
                  onClick={() => scrollToSection('menu')}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3 rounded-full font-semibold text-center"
                >
                  Ordina Ora
                </button>
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <section id="home" className="pt-20 min-h-screen bg-gradient-to-br from-amber-900 via-amber-800 to-orange-900 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-300 rounded-full filter blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 lg:px-8 py-20 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
            {/* Text Content */}
            <div className="text-white space-y-6">
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                Mangia Sano,<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
                  Vivi Meglio
                </span>
              </h1>
              <p className="text-xl text-white/90 leading-relaxed">
                Pasti bilanciati e gustosi, preparati con ingredienti freschi e di alta qualità. 
                La soluzione perfetta per chi non ha tempo di cucinare ma non vuole rinunciare al benessere.
              </p>
              
              {/* Features Pills */}
              <div className="flex flex-wrap gap-4 py-4">
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                  <MapPin className="w-5 h-5" />
                  <span>Ritiro presso sede</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                  <Clock className="w-5 h-5" />
                  <span>Pronto in 2 giorni</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                  <Star className="w-5 h-5" />
                  <span>Ingredienti Premium</span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4 pt-4">
                <button 
                  onClick={() => scrollToSection('menu')}
                  className="bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 px-8 py-4 rounded-full font-bold text-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 flex items-center gap-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Ordina Ora
                </button>
                <button 
                  onClick={() => scrollToSection('chi-sono')}
                  className="bg-white/20 backdrop-blur-sm border-2 border-white text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white hover:text-amber-900 transition-all duration-300"
                >
                  Scopri di Più
                </button>
              </div>
            </div>

            {/* Image */}
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80" 
                  alt="Pasti Sani"
                  className="w-full h-auto"
                />
              </div>
              
              {/* Floating Cards */}
              <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-xl p-4 animate-bounce">
                <div className="text-amber-900 font-bold">100% Naturale</div>
                <div className="text-gray-600 text-sm">Senza conservanti</div>
              </div>
              
              <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-xl p-4 animate-bounce" style={{ animationDelay: '1s' }}>
                <div className="text-amber-900 font-bold">Pronto in 2 giorni</div>
                <div className="text-gray-600 text-sm">Ritiro presso sede</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Chi Sono Section */}
      <section id="chi-sono" className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Image */}
            <div className="relative">
              <div className="rounded-2xl overflow-hidden shadow-xl">
                <img 
                  src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80" 
                  alt="Andrea Padoan"
                  className="w-full h-auto"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl p-6 shadow-xl">
                <div className="text-2xl font-bold">12+ anni</div>
                <div>di esperienza</div>
              </div>
            </div>

            {/* Text */}
            <div className="space-y-6">
              <div className="text-amber-600 font-semibold">FONDATORE & PERSONAL TRAINER</div>
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900">
                Ciao, sono Andrea Padoan
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                Mi chiamo Andrea Padoan, sono un Personal Trainer ed il mio lavoro è far tornare in forma le persone!
              </p>
              
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-500 p-6 rounded-r-xl">
                <p className="text-gray-700">
                  <strong>La mia storia:</strong> Dopo oltre 12 anni passati a lavorare su una scrivania davanti ad un computer, 
                  mangiare pasti veloci al bar, self service, trattorie o mense aziendali sono arrivato un giorno a guardarmi 
                  allo specchio ed essere completamente fuori forma a soli 30 anni.
                </p>
              </div>

              <p className="text-gray-700 leading-relaxed">
                Non c'era solo questo... Iniziavo anche ad avere fastidi digestivi ed il medico mi aveva prescritto visite 
                specialistiche e alcuni farmaci che, a lungo termine, mi avrebbero solo svuotato il portafoglio senza portare alcun beneficio!
              </p>

              <p className="text-lg font-semibold text-gray-900">
                E quando ho avuto una brutta esperienza di salute ho deciso che era arrivato il momento di prendermi cura 
                di me e fare ordine. Questo significava cambiare stile di vita.
              </p>

              <button 
                onClick={() => scrollToSection('menu')}
                className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2"
              >
                Scopri Pasto Sano
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* I 5 Segreti Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-900 to-amber-700 mb-4">
              I 5 Segreti per Essere in Forma
            </h2>
            <p className="text-xl text-gray-600">
              Il metodo che ha cambiato la vita a centinaia di persone
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {secrets.map((secret, index) => (
              <div 
                key={index}
                className="bg-white border border-gray-100 rounded-2xl p-6 shadow-lg hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300 relative overflow-hidden group"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-orange-500"></div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0">
                    {secret.number}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{secret.title}</h3>
                    <p className="text-gray-600">{secret.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Perché Pasto Sano */}
      <section className="py-20 bg-gradient-to-b from-amber-50 to-orange-50">
        <div className="container mx-auto px-4 lg:px-8">
          <h2 className="text-4xl lg:text-5xl font-bold text-center text-gray-900 mb-12">
            Perché Scegliere Pasto Sano?
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300 text-center group"
              >
                <div className="text-amber-500 mb-4 flex justify-center group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Menu Section */}
      <section id="menu" className="py-20 bg-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Il Nostro Menu
            </h2>
            <p className="text-xl text-gray-600">
              Scegli i tuoi pasti preferiti e ordina online
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            <iframe 
              src="/menu"
              className="w-full h-[800px] lg:h-[900px]"
              title="Menu Pasto Sano"
            />
          </div>
        </div>
      </section>

      {/* Come Funziona */}
      <section id="come-funziona" className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 lg:px-8">
          <h2 className="text-4xl lg:text-5xl font-bold text-center text-gray-900 mb-12">
            Come Funziona?
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center group">
                <div className="w-20 h-20 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full flex items-center justify-center font-bold text-2xl mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  {step.number}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
                {index < steps.length - 1 && (
                  <ChevronRight className="hidden lg:block w-8 h-8 text-amber-500 absolute top-10 -right-4" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-amber-900 via-amber-800 to-orange-900 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-300 rounded-full filter blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Inizia Oggi il Tuo Percorso di Benessere
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Non aspettare domani per prenderti cura di te stesso
          </p>
          
          <div className="flex flex-wrap gap-4 justify-center">
            <button 
              onClick={() => scrollToSection('menu')}
              className="bg-white text-amber-900 px-8 py-4 rounded-full font-bold text-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 flex items-center gap-2"
            >
              <ShoppingCart className="w-5 h-5" />
              Ordina Ora
            </button>
            <a 
              href="https://wa.me/393478881515?text=Ciao%20Pasto%20Sano,%20vorrei%20informazioni"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-500 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-green-600 hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 flex items-center gap-2"
            >
              <MessageCircle className="w-5 h-5" />
              Contattaci su WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contatti" className="bg-amber-950 text-white py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Image 
                  src="/images/logo.png" 
                  alt="Pasto Sano" 
                  width={50} 
                  height={50}
                  className="object-contain"
                />
                <span className="text-2xl font-bold">Pasto Sano</span>
              </div>
              <p className="text-white/80">
                La soluzione per stare in forma. Pasti sani e gustosi, preparati con amore da chi si prende cura del tuo benessere.
              </p>
              <div className="flex gap-3 mt-4">
                <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-amber-500 transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-amber-500 transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="https://wa.me/393478881515" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-green-500 transition-colors">
                  <MessageCircle className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Link Utili */}
            <div>
              <h3 className="text-yellow-400 font-bold text-lg mb-4">Link Utili</h3>
              <ul className="space-y-2">
                <li>
                  <button onClick={() => scrollToSection('chi-sono')} className="text-white/80 hover:text-amber-400 transition-colors">
                    Chi Sono
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('menu')} className="text-white/80 hover:text-amber-400 transition-colors">
                    Menu
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('come-funziona')} className="text-white/80 hover:text-amber-400 transition-colors">
                    Come Funziona
                  </button>
                </li>
                <li>
                  <a href="#" className="text-white/80 hover:text-amber-400 transition-colors">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>

            {/* Contatti */}
            <div>
              <h3 className="text-yellow-400 font-bold text-lg mb-4">Contatti</h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-white/80">
                  <Mail className="w-4 h-4" />
                  <a href="mailto:info@pastosano.it" className="hover:text-amber-400 transition-colors">
                    info@pastosano.it
                  </a>
                </li>
                <li className="flex items-center gap-2 text-white/80">
                  <Phone className="w-4 h-4" />
                  <a href="tel:+393478881515" className="hover:text-amber-400 transition-colors">
                    347 888 1515
                  </a>
                </li>
                <li className="flex items-start gap-2 text-white/80">
                  <MapPin className="w-4 h-4 mt-1" />
                  <div>
                    Via Albere 27/B<br />
                    Tribù Personal Training Studio
                  </div>
                </li>
              </ul>
            </div>

            {/* Orari */}
            <div>
              <h3 className="text-yellow-400 font-bold text-lg mb-4">Orari Ritiro</h3>
              <p className="text-white/80 mb-2">
                Lunedì - Venerdì<br />
                Orario da concordare
              </p>
              <p className="text-amber-400 font-semibold mt-4">
                Ordina entro 2 giorni lavorativi
              </p>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-white/10 pt-8 text-center text-white/60">
            <p>© 2024 Pasto Sano - Tutti i diritti riservati | P.IVA: IT00000000000</p>
            <p className="mt-2">Made with ❤️ by Andrea Padoan</p>
          </div>
        </div>
      </footer>
    </div>
  );
}