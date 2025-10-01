'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Clock } from 'lucide-react';

interface DateSelectorProps {
  onDateChange: (date: Date) => void;
  minDaysAdvance?: number;
}

export default function DateSelector({ 
  onDateChange, 
  minDaysAdvance = 2 
}: DateSelectorProps) {
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  
  useEffect(() => {
    const dates: Date[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Crea array di 7 date consecutive partendo da oggi + minDaysAdvance
    for (let i = minDaysAdvance; i < minDaysAdvance + 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    
    setAvailableDates(dates);
    
    // Seleziona la prima data disponibile
    if (dates.length > 0) {
      setSelectedDate(dates[0]);
      onDateChange(dates[0]);
    }
  }, [minDaysAdvance, onDateChange]);
  
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    onDateChange(date);
  };
  
  const formatFullDate = (date: Date) => {
    return date.toLocaleDateString('it-IT', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };
  
  const getWeekNumber = (date: Date) => {
    const day = date.getDate();
    if (day <= 7) return 1;
    if (day <= 14) return 2;
    if (day <= 21) return 3;
    if (day <= 28) return 4;
    return 1; // Settimana 5 ripete settimana 1
  };
  
  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };
  
  const isTomorrow = (date: Date) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return date.toDateString() === tomorrow.toDateString();
  };

  // Calcola il giorno di ritiro effettivo
  const getRitiroDay = (orderDate: Date) => {
    const dayOfWeek = orderDate.getDay();
    const giorni = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];
    
    // Se è sabato (6), ritiro lunedì
    if (dayOfWeek === 6) {
      return 'Ritiro Lunedì';
    }
    // Se è domenica (0), ritiro martedì
    else if (dayOfWeek === 0) {
      return 'Ritiro Martedì';
    }
    // Altrimenti ritiro stesso giorno
    return `Ritiro ${giorni[dayOfWeek]}`;
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Calendar className="w-6 h-6 text-amber-600" />
          <h2 className="text-2xl font-bold text-gray-800">
            Scegli il Giorno di Ritiro
          </h2>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-600 bg-amber-50 px-3 py-1.5 rounded-full">
          <Clock className="w-4 h-4" />
          <span>Ordina con {minDaysAdvance} giorni di anticipo</span>
        </div>
      </div>
      
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Data selezionata per il ritiro:</p>
            <p className="text-xl font-bold text-gray-800 capitalize">
              {formatFullDate(selectedDate)}
            </p>
          </div>
          
          <div className="text-right">
            <p className="text-sm text-gray-600 mb-1">Menu della</p>
            <p className="text-lg font-semibold text-amber-600">
              Settimana {getWeekNumber(selectedDate)}
            </p>
          </div>
        </div>
      </div>
      
      {availableDates.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-blue-800 text-center">
            Disponibilità: dal {availableDates[0].toLocaleDateString('it-IT', { day: 'numeric', month: 'long' })} al {availableDates[availableDates.length - 1].toLocaleDateString('it-IT', { day: 'numeric', month: 'long' })}
          </p>
        </div>
      )}
      
      <div className="relative">
        <div 
          id="dates-container"
          className="flex gap-3 justify-center pb-2 overflow-x-auto"
        >
          {availableDates.map((date, index) => {
            const isSelected = date.toDateString() === selectedDate.toDateString();
            const dayLabel = isToday(date) ? 'Oggi' : isTomorrow(date) ? 'Domani' : null;
            const dayOfWeek = date.getDay();
            const ritiroLabel = getRitiroDay(date);
            
            return (
              <button
                key={index}
                onClick={() => handleDateSelect(date)}
                className={`
                  flex-shrink-0 w-28 p-4 rounded-xl transition-all duration-300
                  ${isSelected
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg scale-105' 
                    : 'bg-white border-2 border-gray-200 hover:border-amber-400 hover:shadow-md cursor-pointer'
                  }
                `}
              >
                {dayLabel && (
                  <div className={`text-xs font-bold mb-1 ${isSelected ? 'text-yellow-100' : 'text-amber-600'}`}>
                    {dayLabel}
                  </div>
                )}
                
                <div className={`text-sm font-medium mb-1 capitalize ${
                  isSelected ? 'text-white' : 'text-gray-600'
                }`}>
                  {date.toLocaleDateString('it-IT', { weekday: 'short' })}
                </div>
                
                <div className={`text-2xl font-bold mb-1 ${
                  isSelected ? 'text-white' : 'text-gray-800'
                }`}>
                  {date.getDate()}
                </div>
                
                <div className={`text-xs capitalize mb-2 ${
                  isSelected ? 'text-yellow-100' : 'text-gray-500'
                }`}>
                  {date.toLocaleDateString('it-IT', { month: 'short' })}
                </div>
                
                {/* Label RITIRO */}
                <div className={`text-[11px] font-bold px-2 py-1 rounded-full ${
                  isSelected 
                    ? 'bg-white/20 text-yellow-100' 
                    : dayOfWeek === 6 || dayOfWeek === 0
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-green-100 text-green-800'
                }`}>
                  {ritiroLabel}
                </div>
              </button>
            );
          })}
        </div>
      </div>
      
      <div className="mt-6 flex items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-gray-600">Ritiro stesso giorno</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
          <span className="text-gray-600">Ritiro giorno successivo</span>
        </div>
      </div>
    </div>
  );
}