'use client';

import { Plus } from 'lucide-react';
import { MenuItem } from '@/lib/menuRotativo';

interface ProductCardProps {
  item: MenuItem;
  onAddToCart: (item: MenuItem) => void;
  categoryEmoji?: string;
  colorScheme?: 'amber' | 'green' | 'blue' | 'purple';
}

export default function ProductCard({ 
  item, 
  onAddToCart, 
  categoryEmoji,
  colorScheme = 'amber' 
}: ProductCardProps) {
  
  const getColorClasses = () => {
    switch(colorScheme) {
      case 'green':
        return {
          badge: 'bg-green-100 text-green-800',
          button: 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
        };
      case 'blue':
        return {
          badge: 'bg-blue-100 text-blue-800',
          button: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
        };
      case 'purple':
        return {
          badge: 'bg-purple-100 text-purple-800',
          button: 'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700'
        };
      default:
        return {
          badge: 'bg-amber-100 text-amber-800',
          button: 'from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600'
        };
    }
  };

  const getCategoryEmoji = () => {
    if (categoryEmoji) return categoryEmoji;
    
    switch(item.categoria) {
      case 'primo': return '🍝';
      case 'secondo': return '🥘';
      case 'contorno': return '🥗';
      case 'focaccia': return '🥖';
      case 'piadina': return '🌯';
      case 'insalatona': return '🥗';
      case 'combo': return '🍱';
      case 'extra': 
        if (item.nome.toLowerCase().includes('muffin')) return '🧁';
        if (item.nome.toLowerCase().includes('macedonia')) return '🍓';
        if (item.nome.toLowerCase().includes('carne')) return '🥩';
        return '✨';
      default: return '🍽️';
    }
  };

  const colors = getColorClasses();
  const emoji = getCategoryEmoji();

  // Per i combo, mostra il risparmio
  const getDiscountBadge = () => {
    if (item.categoria !== 'combo' || !item.descrizione) return null;
    
    const match = item.descrizione.match(/Risparmi €([\d,]+)/);
    if (match) {
      return (
        <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold animate-pulse">
          -{match[1]}€
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:transform hover:-translate-y-1 transition-all duration-300 group">
      {/* Immagine o Placeholder con Emoji */}
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
        {item.immagine ? (
          <img 
            src={item.immagine} 
            alt={item.nome}
            className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              // Se l'immagine non carica, nascondi e mostra emoji
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : null}
        
        {/* Emoji fallback sempre presente (nascosto se c'è immagine) */}
        <div className={`absolute inset-0 flex items-center justify-center ${item.immagine ? 'hidden' : ''}`}>
          <span className="text-6xl opacity-50">{emoji}</span>
        </div>
        
        {/* Badge Prezzo */}
        <div className="absolute top-2 right-2">
          <span className={`${colors.badge} px-3 py-1 rounded-full font-bold shadow-md`}>
            €{item.prezzo.toFixed(2)}
          </span>
        </div>
        
        {/* Badge Sconto per Combo */}
        {getDiscountBadge()}
        
        {/* Badge Disponibilità */}
        {item.disponibile === 'giornaliero' && (
          <div className="absolute bottom-2 left-2 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
            Menu del giorno
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="font-bold text-base lg:text-lg mb-2 text-gray-800 line-clamp-2 min-h-[48px]">
          {item.nome}
        </h3>
        
        {/* Descrizione per combo */}
        {item.descrizione && (
          <p className="text-xs text-gray-600 mb-3 line-clamp-2">
            {item.descrizione}
          </p>
        )}
        
        <button
          onClick={() => onAddToCart(item)}
          className={`w-full bg-gradient-to-r ${colors.button} text-white py-2.5 rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-2 font-semibold`}
        >
          <Plus className="w-5 h-5" />
          <span>Aggiungi</span>
        </button>
      </div>
    </div>
  );
}