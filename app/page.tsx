'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronDown, Star, Users, Clock, Heart, MessageCircle, ExternalLink, CheckCircle, XCircle } from 'lucide-react'

export default function LandingPage() {
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [currentTestimonial, setCurrentTestimonial] = useState(0)

  // Auto-scroll testimonials
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  // Intersection Observer per animazioni
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-slideInUp')
        }
      })
    }, observerOptions)

    document.querySelectorAll('.observe-animation').forEach((el) => {
      observer.observe(el)
    })

    return () => observer.disconnect()
  }, [])

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsLoading(true)
    
    // Simula invio email
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setIsSubmitted(true)
    setIsLoading(false)
    setEmail('')
  }

  const testimonials = [
    {
      name: "Marco R.",
      text: "Finalmente pasti sani e gustosi! Mi hanno cambiato la vita, ora mangio bene anche quando non ho tempo di cucinare.",
      rating: 5,
      image: "/images/testimonials/marco.jpg"
    },
    {
      name: "Laura S.",
      text: "Qualità incredibile e consegna puntuale. I miei figli adorano questi pasti e io sono tranquilla sulla loro alimentazione.",
      rating: 5,
      image: "/images/testimonials/laura.jpg"
    },
    {
      name: "Andrea T.",
      text: "Come sportivo, questi pasti mi danno l'energia giusta. Ingredienti freschi e porzioni perfette!",
      rating: 5,
      image: "/images/testimonials/andrea.jpg"
    }
  ]

  const benefits = [
    {
      icon: "🥗",
      title: "Ingredienti Premium",
      description: "Solo ingredienti freschi e di alta qualità, selezionati dai migliori fornitori locali"
    },
    {
      icon: "⚡",
      title: "Pronti in 2 Minuti",
      description: "Scaldi e mangi! Perfetto per chi ha poco tempo ma non vuole rinunciare al gusto"
    },
    {
      icon: "💪",
      title: "Bilanciati e Nutrienti",
      description: "Ogni piatto è studiato da nutrizionisti per fornirti l'energia di cui hai bisogno"
    },
    {
      icon: "🎯",
      title: "Su Misura per Te",
      description: "Scegli tra diverse opzioni: vegetariano, proteico, light o completo"
    },
    {
      icon: "📱",
      title: "Ordinazione Facile",
      description: "Ordina in pochi click dal tuo smartphone, dove vuoi e quando vuoi"
    },
    {
      icon: "🚀",
      title: "Consegna Veloce",
      description: "Ricevi i tuoi pasti freschi direttamente a casa in tempi record"
    }
  ]

  const menuItems = [
    {
      name: "Fusilli con Manzo e Verdure",
      description: "Pasta integrale con verdure grigliate e manzo magro",
      price: "€8.50",
      image: "/images/meals/fusilli-manzo.jpg",
      category: "Primi Piatti"
    },
    {
      name: "Salmone con Broccoli",
      description: "Filetto di salmone alla griglia con contorno di broccoli",
      price: "€8.50", 
      image: "/images/meals/salmone-broccoli.jpg",
      category: "Secondi Piatti"
    },
    {
      name: "Wrap Proteico",
      description: "Tortilla con tacchino, hummus e verdure fresche",
      price: "€8.50",
      image: "/images/meals/wrap-proteico.jpg", 
      category: "Light"
    },
    {
      name: "Pancakes Proteici",
      description: "Colazione sana con frutti di bosco e miele",
      price: "€6.00",
      image: "/images/meals/pancakes.jpg",
      category: "Colazioni"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md shadow-lg sticky top-0 z-50 border-b border-green-100">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">PS</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Pasto Sano</h1>
                <p className="text-sm text-green-600">La soluzione per stare in forma</p>
              </div>
            </div>
            
            <nav className="hidden md:flex items-center space-x-8">
              <button onClick={() => scrollToSection('home')} className="text-gray-700 hover:text-green-600 transition-colors">
                Home
              </button>
              <button onClick={() => scrollToSection('menu')} className="text-gray-700 hover:text-green-600 transition-colors">
                Menu
              </button>
              <button onClick={() => scrollToSection('vantaggi')} className="text-gray-700 hover:text-green-600 transition-colors">
                Vantaggi
              </button>
              <button onClick={() => scrollToSection('testimonial')} className="text-gray-700 hover:text-green-600 transition-colors">
                Recensioni
              </button>
              <Link 
                href="/ordina"
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-2 rounded-full hover:shadow-lg transition-all duration-300 hover:scale-105"
              >
                Ordina Ora
              </Link>
            </nav>

            {/* Mobile menu button */}
            <button className="md:hidden p-2">
              <div className="space-y-1">
                <div className="w-6 h-0.5 bg-gray-600"></div>
                <div className="w-6 h-0.5 bg-gray-600"></div>
                <div className="w-6 h-0.5 bg-gray-600"></div>
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="home" className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-600/10 to-emerald-600/10"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="observe-animation">
              <h2 className="text-4xl lg:text-6xl font-bold text-gray-800 leading-tight mb-6">
                Mangia <span className="text-green-600">Sano</span>,<br />
                Vivi <span className="text-emerald-600">Meglio</span>
              </h2>
              
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Pasti bilanciati, gustosi e pronti in 2 minuti. 
                La soluzione perfetta per chi ha poco tempo ma non vuole rinunciare al benessere.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Link 
                  href="/ordina"
                  className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-xl transition-all duration-300 hover:scale-105 text-center"
                >
                  🛒 Ordina Subito
                </Link>
                <button 
                  onClick={() => scrollToSection('menu')}
                  className="border-2 border-green-500 text-green-600 px-8 py-4 rounded-full text-lg font-semibold hover:bg-green-50 transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <span>Scopri il Menu</span>
                  <ChevronDown className="w-5 h-5" />
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">1000+</div>
                  <div className="text-sm text-gray-600">Clienti Felici</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-600 mb-2">50+</div>
                  <div className="text-sm text-gray-600">Piatti Diversi</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-teal-600 mb-2">2min</div>
                  <div className="text-sm text-gray-600">Preparazione</div>
                </div>
              </div>
            </div>

            <div className="observe-animation lg:order-first">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-3xl blur-3xl"></div>
                <img 
                  src="/images/hero-meal.jpg" 
                  alt="Pasto sano e gustoso"
                  className="relative z-10 w-full max-w-lg mx-auto rounded-3xl shadow-2xl"
                />
                
                {/* Floating elements */}
                <div className="absolute top-4 -left-4 bg-white p-4 rounded-2xl shadow-xl animate-bounce">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-semibold">Ingredienti freschi</span>
                  </div>
                </div>
                
                <div className="absolute bottom-4 -right-4 bg-white p-4 rounded-2xl shadow-xl animate-bounce delay-75">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm font-semibold">Pronto in 2 min</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vantaggi Section */}
      <section id="vantaggi" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 observe-animation">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-6">
              Perché Scegliere <span className="text-green-600">Pasto Sano</span>?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              La combinazione perfetta tra gusto, salute e praticità per la tua vita quotidiana
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div 
                key={index}
                className="observe-animation bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-2xl border border-green-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
              >
                <div className="text-4xl mb-4">{benefit.icon}</div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">{benefit.title}</h3>
                <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Menu Preview */}
      <section id="menu" className="py-20 bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 observe-animation">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-6">
              Il Nostro <span className="text-green-600">Menu</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Piatti bilanciati e gustosi, preparati con ingredienti freschi e di qualità
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {menuItems.map((item, index) => (
              <div 
                key={index}
                className="observe-animation bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
              >
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                    {item.category}
                  </div>
                  <div className="absolute top-3 right-3 bg-white px-3 py-1 rounded-full font-bold text-green-600">
                    {item.price}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-lg mb-2 text-gray-800">{item.name}</h3>
                  <p className="text-gray-600 text-sm">{item.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center observe-animation">
            <Link 
              href="/ordina"
              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-xl transition-all duration-300 hover:scale-105 inline-flex items-center space-x-2"
            >
              <span>Vedi Menu Completo</span>
              <ExternalLink className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonial" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 observe-animation">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-6">
              Cosa Dicono i Nostri <span className="text-green-600">Clienti</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              La soddisfazione dei nostri clienti è la nostra priorità
            </p>
          </div>

          <div className="relative max-w-4xl mx-auto">
            <div className="observe-animation bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-8 lg:p-12 border border-green-100">
              <div className="text-center">
                <div className="flex justify-center mb-6">
                  {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                    <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
                  ))}
                </div>
                
                <blockquote className="text-xl lg:text-2xl text-gray-700 mb-8 italic leading-relaxed">
                  "{testimonials[currentTestimonial].text}"
                </blockquote>
                
                <div className="flex items-center justify-center space-x-4">
                  <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-800">{testimonials[currentTestimonial].name}</div>
                    <div className="text-sm text-gray-600">Cliente verificato</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Indicatori */}
            <div className="flex justify-center space-x-2 mt-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentTestimonial 
                      ? 'bg-green-500 scale-125' 
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-20 bg-gradient-to-br from-green-600 to-emerald-600">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto observe-animation">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Rimani Aggiornato
            </h2>
            <p className="text-xl text-green-100 mb-8">
              Iscriviti alla newsletter per ricevere offerte esclusive e novità sul menu
            </p>

            {!isSubmitted ? (
              <form onSubmit={handleEmailSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Il tuo indirizzo email"
                  className="flex-1 px-6 py-4 rounded-full border-0 focus:outline-none focus:ring-4 focus:ring-green-300/50"
                  required
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-white text-green-600 px-8 py-4 rounded-full font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                      <span>Invio...</span>
                    </>
                  ) : (
                    <span>Iscriviti</span>
                  )}
                </button>
              </form>
            ) : (
              <div className="flex items-center justify-center space-x-2 text-green-100">
                <CheckCircle className="w-6 h-6" />
                <span className="text-lg font-semibold">Grazie! Ti abbiamo iscritto alla newsletter.</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Logo e descrizione */}
            <div className="observe-animation">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">PS</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold">Pasto Sano</h3>
                  <p className="text-sm text-gray-400">
                    Pasti genuini, pronti in 2 minuti.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="observe-animation">
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
            <div className="observe-animation">
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
            <div className="observe-animation">
              <h3 className="text-yellow-400 font-bold text-lg mb-6">Ritiro</h3>
              <div className="space-y-3">
                <p className="text-white/80">
                  📍 Via Albere 27/B
                </p>
                <p className="text-white/80">
                  Lun-Ven (concordare orario)
                </p>
                <p className="text-amber-400 font-bold">
                  ⚠️ Ordina 2 giorni prima!
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Pasto Sano. Tutti i diritti riservati.</p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slideInUp {
          animation: slideInUp 0.6s ease-out forwards;
        }
        
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}