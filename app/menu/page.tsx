'use client';

import Image from 'next/image';
import { useState } from 'react';
import { ShoppingCart, Plus, Heart, Star, Clock, Truck } from 'lucide-react';

// Definizione prodotti con percorsi immagini locali
const mainMeals = [
  {
    id: 1,
    name: "Fusilli, Macinato Manzo, Zucchine, Melanzane",
    description: "Piatto completo con fusilli integrali, verdure grigliate e manzo magro.",
    image: "/images/meals/fusilli-manzo-zucchine-melanzane.jpg",
    price: 8.50,
    calories: 520,
    protein: 28,
    category: "pasta"
  },
  {
    id: 2,
    name: "Roastbeef, Patate al Forno, Fagiolini",
    description: "Tagliata di roastbeef con contorno di patate e fagiolini freschi.",
    image: "/images/meals/roastbeef-patate-fagiolini.jpg",
    price: 8.50,
    calories: 480,
    protein: 35,
    category: "carne"
  },
  {
    id: 3,
    name: "Riso, Hamburger Manzo, Carotine Baby",
    description: "Hamburger di manzo cotto alla griglia con contorno e riso basmati.",
    image: "/images/meals/riso-hamburger-carotine.jpg",
    price: 8.50,
    calories: 510,
    protein: 32,
    category: "carne"
  },
  {
    id: 4,
    name: "Riso Nero, Gamberi, Tonno, Piselli",
    description: "Riso venere con pesce e verdure leggere.",
    image: "/images/meals/riso-nero-gamberi-tonno-piselli.jpg",
    price: 8.50,
    calories: 450,
    protein: 30,
    category: "pesce"
  },
  {
    id: 5,
    name: "Patate, Salmone Grigliato, Broccoli",
    description: "Salmone alla griglia con patate al forno e broccoli al vapore.",
    image: "/images/meals/patate-salmone-broccoli.jpg",
    price: 8.50,
    calories: 490,
    protein: 34,
    category: "pesce"
  },
  {
    id: 6,
    name: "Pollo Grigliato, Patate al Forno, Zucchine",
    description: "Filetto di pollo alla griglia con contorno classico.",
    image: "/images/meals/pollo-patate-zucchine.jpg",
    price: 8.50,
    calories: 460,
    protein: 36,
    category: "carne"
  },
  {
    id: 7,
    name: "Orzo, Ceci, Feta, Pomodorini, Basilico",
    description: "Insalata di orzo fredda, ricca di proteine e gusto mediterraneo.",
    image: "/images/meals/orzo-ceci-feta-pomodorini.jpg",
    price: 8.50,
    calories: 420,
    protein: 18,
    category: "vegetariano"
  },
  {
    id: 8,
    name: "Tortillas, Tacchino Affumicato, Hummus Ceci, Insalata",
    description: "Wrap light con proteine magre e crema di ceci.",
    image: "/images/meals/tortillas-tacchino-hummus.jpg",
    price: 8.50,
    calories: 380,
    protein: 26,
    category: "wrap"
  },
  {
    id: 9,
    name: "Tortillas, Salmone Affumicato, Formaggio Spalmabile, Insalata",
    description: "Wrap gustoso con salmone affumicato e insalata fresca.",
    image: "/images/meals/tortillas-salmone-formaggio.jpg",
    price: 8.50,
    calories: 390,
    protein: 24,
    category: "wrap"
  },
  {
    id: 10,
    name: "Riso, Pollo al Curry, Zucchine",
    description: "Piatto speziato con pollo al curry e verdure leggere.",
    image: "/images/meals/riso-pollo-curry-zucchine.jpg",
    price: 8.50,
    calories: 470,
    protein: 31,
    category: "carne"
  }
];

const breakfastMeals = [
  {
    id: 11,
    name: "Uova Strapazzate, Bacon, Frutti di Bosco",
    description: "Colazione salata e proteica con uova e frutti rossi freschi.",
    image: "/images/meals/uova-bacon-frutti-bosco.jpg",
    price: 6.00,
    calories: 320,
    protein: 22,
    category: "colazione"
  },
  {
    id: 12,
    name: "Pancakes",
    description: "Colazione dolce e bilanciata per iniziare al meglio la giornata.",
    image: "/images/meals/pancakes.jpg",
    price: 6.00,
    calories: 350,
    protein: 12,
    category: "colazione"
  }
];

export default function MenuPage() {
  const [selectedCategory, setSelectedCategory] = useState<'tutti' | 'main' | 'breakfast'>('tutti');
  const [hoveredMeal, setHoveredMeal] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-700 to-green-500 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center">
            📋 Il Nostro Menu
          </h1>
          <p className="text-xl text-center mb-8 opacity-95">
            Pasti sani e gustosi, preparati con ingredienti freschi ogni giorno
          </p>
          
          {/* Badges informativi */}
          <div className="flex justify-center gap-4 flex-wrap">
            <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2">
              <Truck className="w-5 h-5" />
              <span>Consegna Gratuita</span>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <span>Preparazione Giornaliera</span>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2">
              <Star className="w-5 h-5" />
              <span>Ingredienti Premium</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filtri Categoria */}
      <div className="sticky top-0 bg-white shadow-md z-30">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-center gap-4">
            <button
              onClick={() => setSelectedCategory('tutti')}
              className={`px-6 py-2 rounded-full font-semibold transition-all ${
                selectedCategory === 'tutti'
                  ? 'bg-gradient-to-r from-green-600 to-green-500 text-white shadow-lg scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              🍽️ Tutti i Piatti
            </button>
            <button
              onClick={() => setSelectedCategory('main')}
              className={`px-6 py-2 rounded-full font-semibold transition-all ${
                selectedCategory === 'main'
                  ? 'bg-gradient-to-r from-green-600 to-green-500 text-white shadow-lg scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              🥘 Piatti Principali (€8.50)
            </button>
            <button
              onClick={() => setSelectedCategory('breakfast')}
              className={`px-6 py-2 rounded-full font-semibold transition-all ${
                selectedCategory === 'breakfast'
                  ? 'bg-gradient-to-r from-green-600 to-green-500 text-white shadow-lg scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              🍳 Colazioni (€6.00)
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Sezione Piatti Principali */}
        {(selectedCategory === 'tutti' || selectedCategory === 'main') && (
          <div className="mb-12">
            {selectedCategory === 'tutti' && (
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                  🥘 Piatti Principali
                </h2>
                <p className="text-gray-600">Tutti i piatti completi a soli €8.50</p>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {mainMeals.map((meal) => (
                <div
                  key={meal.id}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                  onMouseEnter={() => setHoveredMeal(meal.id)}
                  onMouseLeave={() => setHoveredMeal(null)}
                >
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={meal.image}
                      alt={meal.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      priority={meal.id <= 4}
                    />
                    {/* Badge prezzo */}
                    <div className="absolute top-3 right-3 bg-green-600 text-white px-3 py-1 rounded-full font-bold shadow-lg">
                      €{meal.price.toFixed(2)}
                    </div>
                    {/* Overlay con info nutrizionali al hover */}
                    {hoveredMeal === meal.id && (
                      <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-white p-4 backdrop-blur-sm">
                        <div className="text-center">
                          <div className="flex justify-center gap-4 mb-2">
                            <div>
                              <p className="text-xs opacity-80">Calorie</p>
                              <p className="font-bold">{meal.calories}</p>
                            </div>
                            <div>
                              <p className="text-xs opacity-80">Proteine</p>
                              <p className="font-bold">{meal.protein}g</p>
                            </div>
                          </div>
                          <button className="mt-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 mx-auto transition">
                            <Plus className="w-4 h-4" />
                            Aggiungi
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-bold text-lg text-gray-800 mb-2 line-clamp-2">
                      {meal.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {meal.description}
                    </p>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <button className="bg-gradient-to-r from-green-600 to-green-500 text-white p-2 rounded-lg hover:shadow-lg transition">
                        <ShoppingCart className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sezione Colazioni */}
        {(selectedCategory === 'tutti' || selectedCategory === 'breakfast') && (
          <div>
            {selectedCategory === 'tutti' && (
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                  🍳 Colazioni
                </h2>
                <p className="text-gray-600">Inizia la giornata con energia a soli €6.00</p>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {breakfastMeals.map((meal) => (
                <div
                  key={meal.id}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                  onMouseEnter={() => setHoveredMeal(meal.id)}
                  onMouseLeave={() => setHoveredMeal(null)}
                >
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={meal.image}
                      alt={meal.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    />
                    {/* Badge prezzo */}
                    <div className="absolute top-3 right-3 bg-orange-500 text-white px-3 py-1 rounded-full font-bold shadow-lg">
                      €{meal.price.toFixed(2)}
                    </div>
                    {/* Badge colazione */}
                    <div className="absolute top-3 left-3 bg-yellow-400 text-gray-800 px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                      🌅 Colazione
                    </div>
                    {/* Overlay con info nutrizionali al hover */}
                    {hoveredMeal === meal.id && (
                      <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-white p-4 backdrop-blur-sm">
                        <div className="text-center">
                          <div className="flex justify-center gap-4 mb-2">
                            <div>
                              <p className="text-xs opacity-80">Calorie</p>
                              <p className="font-bold">{meal.calories}</p>
                            </div>
                            <div>
                              <p className="text-xs opacity-80">Proteine</p>
                              <p className="font-bold">{meal.protein}g</p>
                            </div>
                          </div>
                          <button className="mt-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 mx-auto transition">
                            <Plus className="w-4 h-4" />
                            Aggiungi
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-bold text-lg text-gray-800 mb-2 line-clamp-2">
                      {meal.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {meal.description}
                    </p>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <button className="bg-gradient-to-r from-orange-500 to-orange-400 text-white p-2 rounded-lg hover:shadow-lg transition">
                        <ShoppingCart className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="bg-gray-100 mt-16">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">Ingredienti Freschi</h3>
              <p className="text-gray-600">Selezioniamo solo ingredienti di prima qualità, freschi e di stagione</p>
            </div>
            <div>
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">Preparazione Giornaliera</h3>
              <p className="text-gray-600">Tutti i piatti sono preparati freschi ogni giorno nella nostra cucina</p>
            </div>
            <div>
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">Consegna Rapida</h3>
              <p className="text-gray-600">Consegniamo i tuoi pasti direttamente a casa tua, ancora caldi e gustosi</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}