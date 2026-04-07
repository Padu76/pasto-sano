'use client';

import Link from 'next/link';
import { ArrowLeft, Clock, MessageCircle } from 'lucide-react';

export default function OrdinaPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm py-4 px-4">
        <div className="container mx-auto flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-amber-600 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Torna alla Home</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-xl w-full text-center space-y-8">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-24 h-24 bg-amber-100 rounded-full mx-auto">
            <Clock className="w-12 h-12 text-amber-600" />
          </div>

          {/* Title */}
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
            Servizio Ordini in Pausa
          </h1>

          {/* Message */}
          <div className="bg-white rounded-2xl shadow-lg p-8 space-y-4">
            <p className="text-lg text-gray-700 leading-relaxed">
              Stiamo riorganizzando le nostre forniture per garantirti sempre la massima qualit&agrave;.
            </p>
            <p className="text-gray-600">
              Il servizio di ordinazione &egrave; temporaneamente sospeso. Stiamo lavorando per tornare operativi il prima possibile con nuovi prodotti e lo stesso standard di qualit&agrave; che ci contraddistingue.
            </p>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <p className="text-gray-600 font-medium">
              Vuoi essere avvisato quando riapriamo?
            </p>
            <a
              href="https://wa.me/393478881515?text=Ciao%20Pasto%20Sano,%20vorrei%20essere%20avvisato%20quando%20riaprite%20gli%20ordini"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-green-500 text-white px-8 py-4 rounded-full font-semibold hover:bg-green-600 transform hover:scale-105 transition-all duration-300 shadow-lg"
            >
              <MessageCircle className="w-6 h-6" />
              Scrivici su WhatsApp
            </a>
          </div>

          {/* Back Home */}
          <Link
            href="/"
            className="inline-block text-amber-600 hover:text-amber-700 font-medium underline underline-offset-4 transition-colors"
          >
            Torna alla Home
          </Link>
        </div>
      </main>
    </div>
  );
}
