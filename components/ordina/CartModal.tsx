'use client';

import React from 'react';
import { X, Plus, Minus, ShoppingCart, ShoppingBag, AlertCircle } from 'lucide-react';
import { MenuItem } from '@/lib/menuRotativo';

// Estende MenuItem per includere quantità e dettagli combo
interface CartItem extends MenuItem {
  id: string;
  quantity: number;
  isCombo?: boolean;
  comboItems?: {
    primo?: string;
    secondo?: string;
    contorno?: string;
    macedonia?: boolean;
  };
}

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onCheckout: () => void;
  minimumItems?: number;
}

const MINIMUM_ITEMS = 3; // Ordine minimo

export default function CartModal({ 
  isOpen, 
  onClose, 
  items, 
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  minimumItems = MINIMUM_ITEMS
}: CartModalProps) {

  if (!isOpen) return null;

  // Calcola totali
  const getOriginalPrice = () => {
    return items.reduce((total, item) => total + (item.prezzo * item.quantity), 0);
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const hasMinimumItems = () => {
    return getTotalItems() >= minimumItems;
  };

  // Calcola risparmio totale dai combo
  const getTotalSavings = () => {
    return items.reduce((total, item) => {
      if (item.categoria === 'combo' && item.descrizione) {
        const match = item.descrizione.match(/Risparmi €([\d,]+)/);
        if (match) {
          const saving = parseFloat(match[1].replace(',', '.'));
          return total + (saving * item.quantity);
        }
      }
      return total;
    }, 0);
  };

  // Raggruppa items per categoria
  const groupedItems = items.reduce((acc, item) => {
    const category = item.categoria;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, CartItem[]>);

  const getCategoryLabel = (category: string) => {
    switch(category) {
      case 'primo': return '🍝 Primi Piatti';
      case 'secondo': return '🥘 Secondi Piatti';
      case 'contorno': return '🥗 Contorni';
      case 'combo': return '🍱 Menu Combo';
      case 'focaccia': return '🥖 Focacce';
      case 'piadina': return '🌯 Piadine';
      case 'insalatona': return '🥗 Insalatone';
      case 'extra': return '✨ Extra';
      default: return category;
    }
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed right-0 top-0 h-full w-full sm:w-96 lg:w-[440px] bg-white shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Il tuo carrello</h2>
            <p className="text-sm text-gray-600 mt-1">
              {getTotalItems()} {getTotalItems() === 1 ? 'articolo' : 'articoli'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8">
              <ShoppingCart className="w-20 h-20 text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg font-medium">Il carrello è vuoto</p>
              <p className="text-gray-400 text-sm mt-2 text-center">
                Aggiungi almeno {minimumItems} articoli per procedere con l'ordine
              </p>
              <button
                onClick={onClose}
                className="mt-6 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all"
              >
                Continua lo Shopping
              </button>
            </div>
          ) : (
            <div className="p-6 space-y-6">
              {/* Items raggruppati per categoria */}
              {Object.entries(groupedItems).map(([category, categoryItems]) => (
                <div key={category}>
                  <h3 className="text-sm font-semibold text-gray-600 mb-3">
                    {getCategoryLabel(category)}
                  </h3>
                  <div className="space-y-3">
                    {categoryItems.map(item => (
                      <div key={item.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1 pr-2">
                            <h4 className="font-semibold text-gray-800 text-sm">
                              {item.nome}
                            </h4>
                            
                            {/* Dettagli combo se presenti */}
                            {item.isCombo && item.comboItems && (
                              <div className="mt-1 text-xs text-gray-600">
                                {item.comboItems.primo && (
                                  <p>• Primo: {item.comboItems.primo}</p>
                                )}
                                {item.comboItems.secondo && (
                                  <p>• Secondo: {item.comboItems.secondo}</p>
                                )}
                                {item.comboItems.contorno && (
                                  <p>• Contorno: {item.comboItems.contorno}</p>
                                )}
                                {item.comboItems.macedonia && (
                                  <p>• Con macedonia</p>
                                )}
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => onRemoveItem(item.id)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          {/* Controlli quantità */}
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => onUpdateQuantity(item.id, -1)}
                              className="w-7 h-7 bg-white rounded-lg hover:bg-gray-200 flex items-center justify-center transition-colors border"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-8 text-center font-semibold text-sm">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => onUpdateQuantity(item.id, 1)}
                              className="w-7 h-7 bg-white rounded-lg hover:bg-gray-200 flex items-center justify-center transition-colors border"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          
                          {/* Prezzo */}
                          <div className="text-right">
                            <span className="font-bold text-orange-600">
                              €{(item.prezzo * item.quantity).toFixed(2)}
                            </span>
                            {item.quantity > 1 && (
                              <p className="text-xs text-gray-500">
                                €{item.prezzo.toFixed(2)} cad.
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer con totali e checkout */}
        {items.length > 0 && (
          <div className="sticky bottom-0 bg-white border-t px-6 py-4 space-y-4">
            {/* Alert ordine minimo */}
            {!hasMinimumItems() && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-amber-800 text-sm">
                      Ordine minimo: {minimumItems} articoli
                    </p>
                    <p className="text-amber-700 text-xs mt-1">
                      Aggiungi ancora {minimumItems - getTotalItems()} {minimumItems - getTotalItems() === 1 ? 'articolo' : 'articoli'} per procedere
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Riepilogo prezzi */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotale</span>
                <span className="text-gray-800">€{getOriginalPrice().toFixed(2)}</span>
              </div>
              
              {getTotalSavings() > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Risparmio combo</span>
                  <span>-€{getTotalSavings().toFixed(2)}</span>
                </div>
              )}
              
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="text-lg font-bold text-gray-800">Totale</span>
                <span className="text-2xl font-bold text-orange-600">
                  €{getOriginalPrice().toFixed(2)}
                </span>
              </div>
            </div>

            {/* Bottone Checkout */}
            <button
              onClick={hasMinimumItems() ? onCheckout : undefined}
              disabled={!hasMinimumItems()}
              className={`w-full py-3 rounded-lg font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                hasMinimumItems()
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:shadow-lg hover:scale-105'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {hasMinimumItems() ? (
                <>
                  <ShoppingBag className="w-5 h-5" />
                  <span>Procedi al Checkout</span>
                </>
              ) : (
                <span>
                  Aggiungi {minimumItems - getTotalItems()} {minimumItems - getTotalItems() === 1 ? 'articolo' : 'articoli'}
                </span>
              )}
            </button>
          </div>
        )}
      </div>
    </>
  );
}