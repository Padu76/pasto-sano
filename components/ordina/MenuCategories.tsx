'use client';

import React from 'react';
import { 
  Utensils, 
  Salad, 
  Pizza, 
  Sandwich,
  Cherry,
  Package
} from 'lucide-react';

interface MenuCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  badge?: string;
  badgeColor?: string;
  available: boolean;
}

interface MenuCategoriesProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  dailyMenuAvailable?: boolean;
}

export default function MenuCategories({ 
  activeCategory, 
  onCategoryChange,
  dailyMenuAvailable = true
}: MenuCategoriesProps) {

  const categories: MenuCategory[] = [
    {
      id: 'menu-giorno',
      name: 'Menu del Giorno',
      icon: <Utensils className="w-5 h-5" />,
      description: 'Primi, secondi e contorni freschi',
      badge: 'OGGI',
      badgeColor: 'bg-red-500',
      available: dailyMenuAvailable
    },
    {
      id: 'combo',
      name: 'Menu Combo',
      icon: <Package className="w-5 h-5" />,
      description: 'Risparmia con i nostri menu completi',
      badge: 'RISPARMIO',
      badgeColor: 'bg-green-500',
      available: true
    },
    {
      id: 'focacce',
      name: 'Focacce',
      icon: <Pizza className="w-5 h-5" />,
      description: 'Focacce farcite artigianali',
      available: true
    },
    {
      id: 'piadine',
      name: 'Piadine',
      icon: <Sandwich className="w-5 h-5" />,
      description: 'Piadine romagnole',
      available: true
    },
    {
      id: 'insalatone',
      name: 'Insalatone',
      icon: <Salad className="w-5 h-5" />,
      description: 'Insalate complete e nutrienti',
      available: true
    },
    {
      id: 'extra',
      name: 'Extra',
      icon: <Cherry className="w-5 h-5" />,
      description: 'Dolci e aggiunte',
      available: true
    }
  ];

  // Versione mobile - scroll orizzontale
  const MobileCategories = () => (
    <div className="lg:hidden mb-8">
      <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
        {categories.map(category => {
          const isActive = activeCategory === category.id;
          
          return (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              disabled={!category.available}
              className={`
                flex-shrink-0 px-4 py-3 rounded-xl transition-all duration-300
                flex items-center gap-2 relative
                ${isActive 
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg scale-105' 
                  : category.available
                    ? 'bg-white border-2 border-gray-200 text-gray-700 hover:border-amber-400 hover:shadow-md'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }
              `}
            >
              {category.icon}
              <span className="font-semibold whitespace-nowrap">{category.name}</span>
              
              {category.badge && category.available && (
                <span className={`
                  absolute -top-2 -right-2 text-xs px-2 py-0.5 rounded-full text-white font-bold
                  ${category.badgeColor || 'bg-amber-500'}
                  animate-pulse
                `}>
                  {category.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );

  // Versione desktop - grid
  const DesktopCategories = () => (
    <div className="hidden lg:block mb-12">
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {categories.map(category => {
          const isActive = activeCategory === category.id;
          
          return (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              disabled={!category.available}
              className={`
                group relative p-6 rounded-2xl transition-all duration-300
                ${isActive 
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xl scale-105' 
                  : category.available
                    ? 'bg-white border-2 border-gray-200 hover:border-amber-400 hover:shadow-lg hover:scale-105'
                    : 'bg-gray-50 border-2 border-gray-200 cursor-not-allowed opacity-60'
                }
              `}
            >
              {/* Badge */}
              {category.badge && category.available && (
                <div className={`
                  absolute -top-3 -right-3 px-3 py-1 rounded-full text-xs font-bold text-white
                  ${category.badgeColor || 'bg-amber-500'}
                  animate-pulse shadow-lg
                `}>
                  {category.badge}
                </div>
              )}
              
              {/* Icon */}
              <div className={`
                w-14 h-14 mx-auto mb-3 rounded-xl flex items-center justify-center
                transition-all duration-300 group-hover:scale-110 group-hover:rotate-3
                ${isActive 
                  ? 'bg-white/20' 
                  : 'bg-gradient-to-r from-amber-100 to-orange-100'
                }
              `}>
                <div className={isActive ? 'text-white' : 'text-amber-600'}>
                  {category.icon}
                </div>
              </div>
              
              {/* Text */}
              <h3 className={`
                font-bold text-base mb-1
                ${isActive ? 'text-white' : 'text-gray-800'}
              `}>
                {category.name}
              </h3>
              
              <p className={`
                text-xs leading-tight
                ${isActive ? 'text-white/90' : 'text-gray-600'}
              `}>
                {category.description}
              </p>
              
              {/* Indicatore disponibilità */}
              {!category.available && (
                <div className="absolute inset-0 bg-gray-500/10 rounded-2xl flex items-center justify-center">
                  <span className="bg-gray-800/80 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    Non disponibile
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );

  // Info bar attiva
  const ActiveCategoryInfo = () => {
    const active = categories.find(c => c.id === activeCategory);
    
    if (!active) return null;
    
    return (
      <div className="mb-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-amber-600 shadow-sm">
              {active.icon}
            </div>
            <div>
              <h3 className="font-bold text-gray-800">{active.name}</h3>
              <p className="text-sm text-gray-600">{active.description}</p>
            </div>
          </div>
          
          {active.badge && (
            <div className={`
              px-4 py-2 rounded-full text-white font-bold text-sm
              ${active.badgeColor || 'bg-amber-500'}
            `}>
              {active.badge}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Mobile */}
      <MobileCategories />
      
      {/* Desktop */}
      <DesktopCategories />
      
      {/* Info categoria attiva */}
      <ActiveCategoryInfo />
    </>
  );
}