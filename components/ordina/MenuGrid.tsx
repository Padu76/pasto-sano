'use client';

import ProductCard from './ProductCard';
import { MenuItem } from '@/lib/menuRotativo';

interface MenuGridProps {
  items: MenuItem[];
  title: string;
  emoji: string;
  onAddToCart: (item: MenuItem) => void;
  colorScheme?: 'amber' | 'green' | 'blue' | 'purple';
  showDescription?: boolean;
}

export default function MenuGrid({ 
  items, 
  title, 
  emoji, 
  onAddToCart,
  colorScheme = 'amber',
  showDescription = false
}: MenuGridProps) {
  
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="mb-12">
      {/* Titolo Sezione */}
      <div className="mb-6">
        <h3 className="text-2xl lg:text-3xl font-bold mb-2 text-gray-800 flex items-center gap-3">
          <span className="text-3xl">{emoji}</span> 
          <span>{title}</span>
          <span className="text-sm font-normal text-gray-500 ml-2">
            ({items.length} {items.length === 1 ? 'opzione' : 'opzioni'})
          </span>
        </h3>
        
        {showDescription && (
          <p className="text-gray-600 text-sm lg:text-base">
            Scegli tra le nostre proposte del giorno, preparate fresche ogni mattina
          </p>
        )}
      </div>

      {/* Griglia Prodotti */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
        {items.map((item, index) => (
          <ProductCard
            key={`${item.categoria}-${item.nome}-${index}`}
            item={item}
            onAddToCart={onAddToCart}
            categoryEmoji={emoji}
            colorScheme={colorScheme}
          />
        ))}
      </div>
    </div>
  );
}