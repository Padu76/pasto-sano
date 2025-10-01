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
    
    const targetDate = new Date(today);
    targetDate.setDate(targetDate.getDate() + minDaysAdvance);
    
    const dayOfWeek = targetDate.getDay();
    const daysUntilMonday = dayOfWeek === 0 ? 1 : (8 - dayOfWeek) % 7;
    
    let startMonday = new Date(targetDate);
    if (dayOfWeek > 3) {
      startMonday.setDate(startMonday.getDate() + daysUntilMonday);
    } else {
      startMonday.setDate(startMonday.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    }
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startMonday);
      date.setDate(startMonday.getDate() + i);
      dates.push(date);
    }
    
    setAvailableDates(dates);
    
    const firstAvailable = dates.find(d => {
      const meetsMinAdvance = d >= new Date(today.getTime() + (minDaysAdvance * 24 * 60 * 60 * 1000));
      return meetsMinAdvance;
    });
    
    if (firstAvailable) {
      setSelectedDate(firstAvailable);
      onDateChange(firstAvailable);
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
    return 4;
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
          className="flex gap-3 justify-center pb-2"
        >
          {availableDates.map((date, index) => {
            const isSelected = date.toDateString() === selectedDate.toDateString();
            const dayLabel = isToday(date) ? 'Oggi' : isTomorrow(date) ? 'Domani' : null;
            const dayOfWeek = date.getDay();
            const isSunday = dayOfWeek === 0;
            const meetsMinAdvance = date >= new Date(new Date().getTime() + (minDaysAdvance * 24 * 60 * 60 * 1000));
            const isAvailable = meetsMinAdvance;
            
            return (
              <button
                key={index}
                onClick={() => isAvailable && handleDateSelect(date)}
                disabled={!isAvailable}
                className={`
                  flex-shrink-0 w-24 p-4 rounded-xl transition-all duration-300
                  ${isSelected && isAvailable
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg scale-105' 
                    : isAvailable
                      ? 'bg-white border-2 border-gray-200 hover:border-amber-400 hover:shadow-md cursor-pointer'
                      : 'bg-gray-100 border-2 border-gray-200 opacity-60 cursor-not-allowed'
                  }
                `}
              >
                {dayLabel && (
                  <div className={`text-xs font-bold mb-1 ${isSelected ? 'text-yellow-100' : 'text-amber-600'}`}>
                    {dayLabel}
                  </div>
                )}
                
                <div className={`text-sm font-medium mb-1 capitalize ${
                  isSelected && isAvailable ? 'text-white' : 
                  isAvailable ? 'text-gray-600' : 
                  'text-gray-400'
                }`}>
                  {date.toLocaleDateString('it-IT', { weekday: 'short' })}
                </div>
                
                <div className={`text-2xl font-bold mb-1 ${
                  isSelected && isAvailable ? 'text-white' : 
                  isAvailable ? 'text-gray-800' : 
                  'text-gray-400'
                }`}>
                  {date.getDate()}
                </div>
                
                <div className={`text-xs capitalize ${
                  isSelected && isAvailable ? 'text-yellow-100' : 
                  isAvailable ? 'text-gray-500' : 
                  'text-gray-400'
                }`}>
                  {date.toLocaleDateString('it-IT', { month: 'short' })}
                </div>
                
                <div className={`mt-2 w-2 h-2 rounded-full mx-auto ${
                  isAvailable 
                    ? (isSelected ? 'bg-green-300' : 'bg-green-500')
                    : 'bg-red-400'
                }`} />
                
                {dayOfWeek === 6 && isAvailable && (
                  <div className="text-[10px] mt-1 text-amber-600 font-semibold">
                    Ritiro LUN
                  </div>
                )}
                {isSunday && isAvailable && (
                  <div className="text-[10px] mt-1 text-amber-600 font-semibold">
                    Ritiro MAR
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
      
      <div className="mt-6 flex items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-gray-600">Disponibile</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
          <span className="text-gray-600">Weekend (chiuso)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span className="text-gray-600">Non disponibile</span>
        </div>
      </div>
    </div>
  );
}