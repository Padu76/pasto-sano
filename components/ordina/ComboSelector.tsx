'use client';

import React, { useState } from 'react';
import { X, Check, Package, ChevronRight, Info } from 'lucide-react';
import { MenuItem } from '@/lib/menuRotativo';

interface ComboSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  comboType: string;
  comboPrice: number;
  availableItems: {
    primi?: MenuItem[];
    secondi?: MenuItem[];
    contorni?: MenuItem[];
  };
  onConfirm: (selectedItems: {
    primo?: string;
    secondo?: string;
    contorno?: string;
    macedonia?: boolean;
  }) => void;
}

export default function ComboSelector({
  isOpen,
  onClose,
  comboType,
  comboPrice,
  availableItems,
  onConfirm
}: ComboSelectorProps) {
  
  const [selectedPrimo, setSelectedPrimo] = useState<string>('');
  const [selectedSecondo, setSelectedSecondo] = useState<string>('');
  const [selectedContorno, setSelectedContorno] = useState<string>('');
  const [currentStep, setCurrentStep] = useState(1);

  if (!isOpen) return null;

  // Determina quali elementi servono per questo combo
  const getRequiredItems = () => {
    switch(comboType) {
      case 'Combo Primo + Contorno':
        return { needsPrimo: true, needsContorno: true };
      case 'Combo Secondo + Contorno':
        return { needsSecondo: true, needsContorno: true };
      case 'Combo Completo (Primo + Secondo + Contorno)':
        return { needsPrimo: true, needsSecondo: true, needsContorno: true };
      case 'Combo Primo + Macedonia':
        return { needsPrimo: true, needsMacedonia: true };
      case 'Combo Secondo + Macedonia':
        return { needsSecondo: true, needsMacedonia: true };
      default:
        return {};
    }
  };

  const requirements = getRequiredItems();
  const totalSteps = Object.keys(requirements).filter(key => requirements[key as keyof typeof requirements]).length;

  // Gestione conferma
  const handleConfirm = () => {
    const selection: any = {};
    
    if (requirements.needsPrimo) selection.primo = selectedPrimo;
    if (requirements.needsSecondo) selection.secondo = selectedSecondo;
    if (requirements.needsContorno) selection.contorno = selectedContorno;
    if (requirements.needsMacedonia) selection.macedonia = true;
    
    onConfirm(selection);
    resetSelection();
    onClose();
  };

  const resetSelection = () => {
    setSelectedPrimo('');
    setSelectedSecondo('');
    setSelectedContorno('');
    setCurrentStep(1);
  };

  const canProceed = () => {
    if (currentStep === 1 && requirements.needsPrimo) return !!selectedPrimo;
    if (currentStep === 1 && requirements.needsSecondo && !requirements.needsPrimo) return !!selectedSecondo;
    if (currentStep === 2 && requirements.needsSecondo) return !!selectedSecondo;
    if ((currentStep === 2 && requirements.needsContorno && !requirements.needsSecondo) || 
        (currentStep === 3 && requirements.needsContorno)) return !!selectedContorno;
    return true;
  };

  const isComplete = () => {
    if (requirements.needsPrimo && !selectedPrimo) return false;
    if (requirements.needsSecondo && !selectedSecondo) return false;
    if (requirements.needsContorno && !selectedContorno) return false;
    return true;
  };

  // Componente per step di selezione
  const SelectionStep = ({ 
    title, 
    items, 
    selected, 
    onSelect,
    emoji 
  }: {
    title: string;
    items: MenuItem[];
    selected: string;
    onSelect: (value: string) => void;
    emoji: string;
  }) => (
    <div className="space-y-3">
      <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
        <span className="text-2xl">{emoji}</span>
        {title}
      </h3>
      
      <div className="grid gap-3 max-h-[400px] overflow-y-auto pr-2">
        {items.map((item, index) => (
          <button
            key={index}
            onClick={() => onSelect(item.nome)}
            className={`
              p-4 rounded-xl border-2 transition-all duration-300 text-left
              ${selected === item.nome
                ? 'border-amber-500 bg-amber-50 shadow-lg scale-[1.02]'
                : 'border-gray-200 hover:border-amber-300 hover:bg-gray-50'
              }
            `}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className={`font-semibold ${selected === item.nome ? 'text-amber-700' : 'text-gray-800'}`}>
                  {item.nome}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Valore €{item.prezzo.toFixed(2)}
                </p>
              </div>
              
              {selected === item.nome && (
                <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  // Render step attuale
  const renderCurrentStep = () => {
    // Step Primo
    if (currentStep === 1 && requirements.needsPrimo && availableItems.primi) {
      return (
        <SelectionStep
          title="Scegli il Primo Piatto"
          items={availableItems.primi}
          selected={selectedPrimo}
          onSelect={setSelectedPrimo}
          emoji="🍝"
        />
      );
    }
    
    // Step Secondo (può essere step 1 o 2)
    const secondoStep = requirements.needsPrimo ? 2 : 1;
    if (currentStep === secondoStep && requirements.needsSecondo && availableItems.secondi) {
      return (
        <SelectionStep
          title="Scegli il Secondo Piatto"
          items={availableItems.secondi}
          selected={selectedSecondo}
          onSelect={setSelectedSecondo}
          emoji="🥘"
        />
      );
    }
    
    // Step Contorno (può essere step 1, 2 o 3)
    const contornoStep = requirements.needsPrimo && requirements.needsSecondo ? 3 : 
                         requirements.needsPrimo || requirements.needsSecondo ? 2 : 1;
    if (currentStep === contornoStep && requirements.needsContorno && availableItems.contorni) {
      return (
        <SelectionStep
          title="Scegli il Contorno"
          items={availableItems.contorni}
          selected={selectedContorno}
          onSelect={setSelectedContorno}
          emoji="🥗"
        />
      );
    }
    
    // Step Macedonia
    if (requirements.needsMacedonia) {
      return (
        <div className="text-center py-8">
          <div className="w-24 h-24 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
            <span className="text-5xl">🍓</span>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Macedonia Fresca Inclusa!</h3>
          <p className="text-gray-600">La tua macedonia di frutta fresca è già inclusa nel combo</p>
        </div>
      );
    }
    
    // Return di default se nessuna condizione è soddisfatta
    return null;
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="relative bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-4">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Package className="w-6 h-6" />
                  {comboType}
                </h2>
                <p className="text-amber-100 mt-1">
                  Prezzo combo: €{comboPrice.toFixed(2)}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
          
          {/* Progress Steps */}
          {totalSteps > 1 && (
            <div className="px-6 py-4 border-b bg-gray-50">
              <div className="flex items-center justify-between">
                {Array.from({ length: totalSteps }, (_, i) => i + 1).map(step => (
                  <React.Fragment key={step}>
                    {step > 1 && (
                      <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    )}
                    <div 
                      className={`
                        flex items-center gap-2 px-4 py-2 rounded-full transition-all
                        ${step === currentStep 
                          ? 'bg-amber-500 text-white shadow-lg' 
                          : step < currentStep
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-200 text-gray-500'
                        }
                      `}
                    >
                      {step < currentStep ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <span className="font-semibold">{step}</span>
                      )}
                      <span className="text-sm font-medium">
                        {step === 1 && requirements.needsPrimo && 'Primo'}
                        {step === 1 && !requirements.needsPrimo && requirements.needsSecondo && 'Secondo'}
                        {step === 1 && !requirements.needsPrimo && !requirements.needsSecondo && requirements.needsContorno && 'Contorno'}
                        {step === 2 && requirements.needsPrimo && requirements.needsSecondo && 'Secondo'}
                        {step === 2 && requirements.needsPrimo && !requirements.needsSecondo && requirements.needsContorno && 'Contorno'}
                        {step === 2 && !requirements.needsPrimo && requirements.needsSecondo && requirements.needsContorno && 'Contorno'}
                        {step === 3 && 'Contorno'}
                      </span>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}
          
          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[50vh]">
            {renderCurrentStep()}
          </div>
          
          {/* Riepilogo selezione */}
          {(selectedPrimo || selectedSecondo || selectedContorno) && (
            <div className="px-6 py-4 bg-amber-50 border-t">
              <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Info className="w-4 h-4" />
                La tua selezione:
              </h4>
              <div className="space-y-1 text-sm">
                {selectedPrimo && (
                  <p className="text-gray-600">
                    <span className="font-semibold">Primo:</span> {selectedPrimo}
                  </p>
                )}
                {selectedSecondo && (
                  <p className="text-gray-600">
                    <span className="font-semibold">Secondo:</span> {selectedSecondo}
                  </p>
                )}
                {selectedContorno && (
                  <p className="text-gray-600">
                    <span className="font-semibold">Contorno:</span> {selectedContorno}
                  </p>
                )}
                {requirements.needsMacedonia && (
                  <p className="text-gray-600">
                    <span className="font-semibold">Extra:</span> Macedonia fresca
                  </p>
                )}
              </div>
            </div>
          )}
          
          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t flex justify-between items-center">
            <button
              onClick={() => {
                resetSelection();
                onClose();
              }}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Annulla
            </button>
            
            <div className="flex gap-3">
              {currentStep > 1 && totalSteps > 1 && (
                <button
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Indietro
                </button>
              )}
              
              {currentStep < totalSteps ? (
                <button
                  onClick={() => setCurrentStep(currentStep + 1)}
                  disabled={!canProceed()}
                  className={`
                    px-6 py-2 rounded-lg font-semibold transition-all
                    ${canProceed()
                      ? 'bg-amber-500 text-white hover:bg-amber-600'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }
                  `}
                >
                  Avanti
                </button>
              ) : (
                <button
                  onClick={handleConfirm}
                  disabled={!isComplete()}
                  className={`
                    px-6 py-2 rounded-lg font-semibold transition-all flex items-center gap-2
                    ${isComplete()
                      ? 'bg-green-500 text-white hover:bg-green-600'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }
                  `}
                >
                  <Check className="w-5 h-5" />
                  Conferma Combo
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}