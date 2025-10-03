// lib/menuRotativo.ts

export interface MenuItem {
  nome: string;
  prezzo: number;
  categoria: 'primo' | 'secondo' | 'contorno' | 'focaccia' | 'piadina' | 'insalatona' | 'extra' | 'combo';
  disponibile: 'sempre' | 'giornaliero';
  immagine?: string;
  descrizione?: string;
  allergeni?: string[];
  calorie?: number;
  proteine?: number;
  carboidrati?: number;
  grassi?: number;
}

// Data di riferimento: Lunedì 6 ottobre 2025 = inizio Settimana 3
const REFERENCE_DATE = new Date('2025-10-06'); // Lunedì 6 ottobre 2025
const REFERENCE_WEEK = 3; // Settimana 3

// Funzione per calcolare la settimana in base alla data di riferimento
function getSettimanaFromDate(data: Date): number {
  // Normalizza entrambe le date a mezzanotte per confronto accurato
  const dataCheck = new Date(data.getFullYear(), data.getMonth(), data.getDate());
  const dataRiferimento = new Date(REFERENCE_DATE.getFullYear(), REFERENCE_DATE.getMonth(), REFERENCE_DATE.getDate());
  
  // Calcola differenza in millisecondi
  const diffTime = dataCheck.getTime() - dataRiferimento.getTime();
  
  // Converti in giorni
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  // Calcola settimane di differenza (può essere negativo se data precedente)
  const diffWeeks = Math.floor(diffDays / 7);
  
  // Calcola quale settimana del ciclo (1-4)
  // Usa modulo per ciclare: se diffWeeks = 0 -> settimana 3, se = 1 -> settimana 4, ecc.
  let settimana = ((REFERENCE_WEEK - 1 + diffWeeks) % 4) + 1;
  
  // Gestisci settimane negative (prima della data di riferimento)
  if (settimana <= 0) {
    settimana += 4;
  }
  
  return settimana;
}

function getGiornoSettimana(data: Date): string {
  const giorni = ['domenica', 'lunedi', 'martedi', 'mercoledi', 'giovedi', 'venerdi', 'sabato'];
  // CRITICAL FIX: Usa la data locale invece di UTC per evitare sfasamenti di fuso orario
  // Quando la data arriva come ISO string da pickupDate, può essere in UTC
  // Quindi ricostruiamo la data usando solo anno/mese/giorno locali
  const year = data.getFullYear();
  const month = data.getMonth();
  const day = data.getDate();
  const localDate = new Date(year, month, day);
  return giorni[localDate.getDay()];
}

// SETTIMANA 1
const MENU_SETTIMANA_1 = {
  lunedi: {
    primi: [
      { nome: 'Lasagna zucchine e salmone', prezzo: 8.50, categoria: 'primo' as const, disponibile: 'giornaliero' as const, immagine: '/images/meals/lasagna-zucchine-salmone.jpg' },
      { nome: 'Tortelli alla crema di parmigiano', prezzo: 8.50, categoria: 'primo' as const, disponibile: 'giornaliero' as const, immagine: '/images/meals/tortelli-parmigiano.jpg' }
    ],
    secondi: [
      { nome: 'Scaloppine di pollo al limone', prezzo: 8.50, categoria: 'secondo' as const, disponibile: 'giornaliero' as const, immagine: '/images/meals/scaloppine-pollo-limone.jpg' },
      { nome: 'Paillard di tacchino alla griglia', prezzo: 8.50, categoria: 'secondo' as const, disponibile: 'giornaliero' as const, immagine: '/images/meals/paillard-tacchino.jpg' }
    ],
    contorni: [
      { nome: 'Patate arrosto', prezzo: 4.50, categoria: 'contorno' as const, disponibile: 'giornaliero' as const, immagine: '/images/meals/patate-arrosto.jpg' },
      { nome: 'Verdure cotte di stagione', prezzo: 4.50, categoria: 'contorno' as const, disponibile: 'giornaliero' as const, immagine: '/images/meals/verdure-cotte.jpg' }
    ]
  },
  martedi: {
    primi: [
      { nome: 'Crespelle ricotta, spinaci e cotto', prezzo: 8.50, categoria: 'primo' as const, disponibile: 'giornaliero' as const, immagine: '/images/meals/crespelle-ricotta-spinaci.jpg' },
      { nome: 'Penne alla puttanesca Napoletana', prezzo: 8.50, categoria: 'primo' as const, disponibile: 'giornaliero' as const, immagine: '/images/meals/penne-puttanesca.jpg' }
    ],
    secondi: [
      { nome: 'Filetto di branzino alla piastra con gremolada', prezzo: 8.50, categoria: 'secondo' as const, disponibile: 'giornaliero' as const, immagine: '/images/meals/branzino-gremolada.jpg' },
      { nome: 'Medaglione di maiale alla griglia', prezzo: 8.50, categoria: 'secondo' as const, disponibile: 'giornaliero' as const, immagine: '/images/meals/medaglione-maiale.jpg' }
    ],
    contorni: [
      { nome: 'Patate arrosto', prezzo: 4.50, categoria: 'contorno' as const, disponibile: 'giornaliero' as const, immagine: '/images/meals/patate-arrosto.jpg' },
      { nome: 'Verdure cotte di stagione', prezzo: 4.50, categoria: 'contorno' as const, disponibile: 'giornaliero' as const, immagine: '/images/meals/verdure-cotte.jpg' }
    ]
  },
  mercoledi: {
    primi: [
      { nome: 'Lasagna alla parmigiana', prezzo: 8.50, categoria: 'primo' as const, disponibile: 'giornaliero' as const, immagine: '/images/meals/lasagna-parmigiana.jpg' },
      { nome: 'Calamarata alla carbonara di mare', prezzo: 8.50, categoria: 'primo' as const, disponibile: 'giornaliero' as const, immagine: '/images/meals/calamarata-carbonara-mare.jpg' }
    ],
    secondi: [
      { nome: 'Petto di pollo alla diavola', prezzo: 8.50, categoria: 'secondo' as const, disponibile: 'giornaliero' as const, immagine: '/images/meals/pollo-diavola.jpg' },
      { nome: 'Saltimbocca alla romana', prezzo: 8.50, categoria: 'secondo' as const, disponibile: 'giornaliero' as const, immagine: '/images/meals/saltimbocca-romana.jpg' }
    ],
    contorni: [
      { nome: 'Patate arrosto', prezzo: 4.50, categoria: 'contorno' as const, disponibile: 'giornaliero' as const, immagine: '/images/meals/patate-arrosto.jpg' },
      { nome: 'Verdure cotte di stagione', prezzo: 4.50, categoria: 'contorno' as const, disponibile: 'giornaliero' as const, immagine: '/images/meals/verdure-cotte.jpg' }
    ]
  },
  giovedi: {
    primi: [
      { nome: 'Spaghettone ai 2 pomodori', prezzo: 8.50, categoria: 'primo' as const, disponibile: 'giornaliero' as const, immagine: '/images/meals/spaghettone-2-pomodori.jpg' },
      { nome: 'Paella di pesce e carne', prezzo: 8.50, categoria: 'primo' as const, disponibile: 'giornaliero' as const, immagine: '/images/meals/paella-pesce-carne.jpg' }
    ],
    secondi: [
      { nome: 'Sovracoscia di pollo al forno', prezzo: 8.50, categoria: 'secondo' as const, disponibile: 'giornaliero' as const, immagine: '/images/meals/sovracoscia-pollo-forno.jpg' },
      { nome: 'Filetto di orata alla griglia', prezzo: 8.50, categoria: 'secondo' as const, disponibile: 'giornaliero' as const, immagine: '/images/meals/orata-griglia.jpg' }
    ],
    contorni: [
      { nome: 'Patate arrosto', prezzo: 4.50, categoria: 'contorno' as const, disponibile: 'giornaliero' as const, immagine: '/images/meals/patate-arrosto.jpg' },
      { nome: 'Verdure cotte di stagione', prezzo: 4.50, categoria: 'contorno' as const, disponibile: 'giornaliero' as const, immagine: '/images/meals/verdure-cotte.jpg' }
    ]
  },
  venerdi: {
    primi: [
      { nome: 'Lasagna con verdure di stagione e brie', prezzo: 8.50, categoria: 'primo' as const, disponibile: 'giornaliero' as const, immagine: '/images/meals/lasagna-verdure-brie.jpg' },
      { nome: "Mezzi paccheri all'amatriciana", prezzo: 8.50, categoria: 'primo' as const, disponibile: 'giornaliero' as const, immagine: '/images/meals/paccheri-amatriciana.jpg' }
    ],
    secondi: [
      { nome: 'Hamburger in bella vista', prezzo: 8.50, categoria: 'secondo' as const, disponibile: 'giornaliero' as const, immagine: '/images/meals/hamburger-bella-vista.jpg' },
      { nome: 'Costine laccate in salsa BBQ', prezzo: 8.50, categoria: 'secondo' as const, disponibile: 'giornaliero' as const, immagine: '/images/meals/costine-bbq.jpg' }
    ],
    contorni: [
      { nome: 'Patate arrosto', prezzo: 4.50, categoria: 'contorno' as const, disponibile: 'giornaliero' as const, immagine: '/images/meals/patate-arrosto.jpg' },
      { nome: 'Verdure cotte di stagione', prezzo: 4.50, categoria: 'contorno' as const, disponibile: 'giornaliero' as const, immagine: '/images/meals/verdure-cotte.jpg' }
    ]
  }
};

// SETTIMANA 2
const MENU_SETTIMANA_2 = {
  lunedi: {
    primi: [
      { nome: 'Lasagna con crema di asparagi e bacon crocc', prezzo: 8.50, categoria: 'primo' as const, disponibile: 'giornaliero' as const, immagine: '/images/meals/lasagna-asparagi-bacon.jpg' },
      { nome: 'Mezze maniche cacio e pepe', prezzo: 8.50, categoria: 'primo' as const, disponibile: 'giornaliero' as const, immagine: '/images/meals/mezze-maniche-cacio-pepe.jpg' }
    ],
    secondi: [
      { nome: 'Scaloppina di tacchino agli agrumi', prezzo: 8.50, categoria: 'secondo' as const, disponibile: 'giornaliero' as const, immagine: '/images/meals/scaloppina-tacchino-agrumi.jpg' },
      { nome: 'Filetto di branzino alla griglia', prezzo: 8.50, categoria: 'secondo' as const, disponibile: 'giornaliero' as const, immagine: '/images/meals/branzino-griglia.jpg' }
    ],
    contorni: [
      { nome: 'Patate arrosto', prezzo: 4.50, categoria: 'contorno' as const, disponibile: 'giornaliero' as const, immagine: '/images/meals/patate-arrosto.jpg' },
      { nome: 'Verdure cotte di stagione', prezzo: 4.50, categoria: 'contorno' as const, disponibile: 'giornaliero' as const, immagine: '/images/meals/verdure-cotte.jpg' }
    ]
  },
  martedi: {
    primi: [
      { nome: 'Crespelle gamberetti', prezzo: 8.50, categoria: 'primo' as const, disponibile: 'giornaliero' as const, immagine: '/images/meals/crespelle-gamberetti.jpg' },
      { nome: "Pasta all'arrabbiata", prezzo: 8.50, categoria: 'primo' as const, disponibile: 'giornaliero' as const, immagine: '/images/meals/pasta-arrabbiata.jpg' }
    ],
    secondi: [
      { nome: 'Cotoletta di tacchino alla milanese', prezzo: 8.50, categoria: 'secondo' as const, disponibile: 'giornaliero' as const, immagine: '/images/meals/cotoletta-tacchino-milanese.jpg' },
      { nome: 'Bistecca di scamone alla griglia', prezzo: 8.50, categoria: 'secondo' as const, disponibile: 'giornaliero' as const, immagine: '/images/meals/bistecca-scamone.jpg' }
    ],
    contorni: [
      { nome: 'Patate arrosto', prezzo: 4.50, categoria: 'contorno' as const, disponibile: 'giornaliero' as const, immagine: '/images/meals/patate-arrosto.jpg' },
      { nome: 'Verdure cotte di stagione', prezzo: 4.50, categoria: 'contorno' as const, disponibile: 'giornaliero' as const, immagine: '/images/meals/verdure-cotte.jpg' }
    ]
  },
  mercoledi: {
    primi: [
      { nome: 'Pasta gratinata con caponata e scamorza', prezzo: 8.50, categoria: 'primo' as const, disponibile: 'giornaliero' as const, immagine: '/images/meals/pasta-caponata-scamorza.jpg' },
      { nome: 'Maccheroncino al ragù alla bolognese', prezzo: 8.50, categoria: 'primo' as const, disponibile: 'giornaliero' as const, immagine: '/images/meals/maccheroncino-ragu.jpg' }
    ],
    secondi: [
      { nome: 'Bocconcini di pollo gratinati', prezzo: 8.50, categoria: 'secondo' as const, disponibile: 'giornaliero' as const, immagine: '/images/meals/bocconcini-pollo-gratinati.jpg' },
      { nome: 'Filetto di orata alla griglia con gremolada', prezzo: 8.50, categoria: 'secondo' as const, disponibile: 'giornaliero' as const, immagine: '/images/meals/orata-gremolada.jpg' }
    ],
    contorni: [
      { nome: 'Patate arrosto', prezzo: 4.50, categoria: 'contorno' as const, disponibile: 'giornaliero' as const, immagine: '/images/meals/patate-arrosto.jpg' },
      { nome: 'Verdure cotte di stagione', prezzo: 4.50, categoria: 'contorno' as const, disponibile: 'giornaliero' as const, immagine: '/images/meals/verdure-cotte.jpg' }
    ]
  },
  giovedi: {
    primi: [
      { nome: 'Mezzi paccheri con spada melanzane e ric.aff.', prezzo: 8.50, categoria: 'primo' as const, disponibile: 'giornaliero' as const, immagine: '/images/meals/paccheri-spada-melanzane.jpg' },
      { nome: 'Risotto alla Milanese con zucchine', prezzo: 8.50, categoria: 'primo' as const, disponibile: 'giornaliero' as const, immagine: '/images/meals/risotto-milanese-zucchine.jpg' }
    ],
    secondi: [
      { nome: 'Polpette di carne al sugo', prezzo: 8.50, categoria: 'secondo' as const, disponibile: 'giornaliero' as const, immagine: '/images/meals/polpette-sugo.jpg' },
      { nome: 'Paillard di tacchino alla griglia', prezzo: 8.50, categoria: 'secondo' as const, disponibile: 'giornaliero' as const, immagine: '/images/meals/paillard-tacchino.jpg' }
    ],
    contorni: [
      { nome: 'Patate arrosto', prezzo: 4.50, categoria: 'contorno' as const, disponibile: 'giornaliero' as const, immagine: '/images/meals/patate-arrosto.jpg' },
      { nome: 'Verdure cotte di stagione', prezzo: 4.50, categoria: 'contorno' as const, disponibile: 'giornaliero' as const, immagine: '/images/meals/verdure-cotte.jpg' }
    ]
  },
  venerdi: {
    primi: [
      { nome: 'Spaghetti datt.giallo menta stracciatella', prezzo: 8.50, categoria: 'primo' as const, disponibile: 'giornaliero' as const, immagine: '/images/meals/spaghetti-datterino-menta.jpg' },
      { nome: "Calamarata cozze al prof.d'arancia e pomodorini", prezzo: 8.50, categoria: 'primo' as const, disponibile: 'giornaliero' as const, immagine: '/images/meals/calamarata-cozze-arancia.jpg' }
    ],
    secondi: [
      { nome: 'Coscetta di pollo laccata in salsa BBQ', prezzo: 8.50, categoria: 'secondo' as const, disponibile: 'giornaliero' as const, immagine: '/images/meals/coscetta-pollo-bbq.jpg' },
      { nome: 'Lonza marinata alla griglia', prezzo: 8.50, categoria: 'secondo' as const, disponibile: 'giornaliero' as const, immagine: '/images/meals/lonza-marinata.jpg' }
    ],
    contorni: [
      { nome: 'Patate arrosto', prezzo: 4.50, categoria: 'contorno' as const, disponibile: 'giornaliero' as const, immagine: '/images/meals/patate-arrosto.jpg' },
      { nome: 'Verdure cotte di stagione', prezzo: 4.50, categoria: 'contorno' as const, disponibile: 'giornaliero' as const, immagine: '/images/meals/verdure-cotte.jpg' }
    ]
  }
};

// SETTIMANA 3
const MENU_SETTIMANA_3 = {
  lunedi: {
    primi: [
      { nome: 'Lasagna alla Ligure', prezzo: 8.50, categoria: 'primo' as const, disponibile: 'giornaliero' as const, immagine: '/images/meals/lasagna-ligure.jpg' },
      { nome: 'Caserecce capperi e zucchine', prezzo: 8.50, categoria: 'primo' as const, disponibile: 'giornaliero' as const, immagine: '/images/meals/caserecce-capperi-zucchine.jpg' }
    ],
    secondi: [
      { nome: "Spiedini di carne all'inglese", prezzo: 8.50, categoria: 'secondo' as const, disponibile: 'giornaliero' as const, immagine: '/images/meals/spiedini-carne-inglese.jpg' },
      { nome: 'Frittata di verdure di stagione', prezzo: 8.50, categoria: 'secondo' as const, disponibile: 'giornaliero' as const, immagine: '/images/meals/frittata-verdure.jpg' }
    ],
    contorni: [
      { nome: 'Patate arrosto', prezzo: 4.50, categoria: 'contorno' as const, disponibile: 'giornaliero' as const, immagine: '/images/meals/patate-arrosto.jpg' },
      { nome: 'Verdure cotte di stagione', prezzo: 4.50, categoria: 'contorno' as const, disponibile: 'giornaliero' as const, immagine: '/images/meals/verdure-cotte.jpg' }
    ]
  },
  martedi: {
    primi: [
      { nome: 'Crespelle carciofi e scamorza', prezzo: 8.50, categoria: 'primo' as const, disponibile: 'giornaliero' as const, immagine: '/images/meals/crespelle-carciofi-scamorza.jpg' },
      { nome: 'Spaghetti datt. Rosso e stracciatella', prezzo: 8.50, categoria: 'primo' as const, disponibile: 'giornaliero' as const, immagine: '/images/meals/spaghetti-datterino-stracciatella.jpg' }
    ],
    secondi: [
      { nome: 'Braciola alla griglia e olio aromatico', prezzo: 8.50, categoria: 'secondo' as const, disponibile: 'giornaliero' as const, immagine: '/images/meals/braciola-griglia.jpg' },
      { nome: 'Filetto di persico in crosta di erbe fine', prezzo: 8.50, categoria: 'secondo' as const, disponibile: 'giornaliero' as const, immagine: '/images/meals/persico-crosta-erbe.jpg' }
    ],
    contorni: [
      { nome: 'Patate arrosto', prezzo: 4.50, categoria: 'contorno' as const, disponibile: 'giornaliero' as const, immagine: '/images/meals/patate-arrosto.jpg' },
      { nome: 'Verdure cotte di stagione', prezzo: 4.50, categoria: 'contorno' as const, disponibile: 'giornaliero' as const, immagine: '/images/meals/verdure-cotte.jpg' }
    ]
  },
  mercoledi: {
    primi: [
      { nome: 'Lasagna al ragù bianco di pesce zucch. E lime', prezzo: 8.50, categoria: 'primo' as const, disponibile: 'giornaliero' as const, immagine: '/images/meals/lasagna-ragu-pesce-lime.jpg' },
      { nome: 'Bigoli al ragù alla Bolognese', prezzo: 8.50, categoria: 'primo' as const, disponibile: 'giornaliero' as const, immagine: '/images/meals/bigoli-ragu-bolognese.jpg' }
    ],
    secondi: [
      { nome: 'Hamburger di manzo in bella vista', prezzo: 8.50, categoria: 'secondo' as const, disponibile: 'giornaliero' as const, immagine: '/images/meals/hamburger-manzo-bella-vista.jpg' },
      { nome: 'Medaglione di maiale alla griglia', prezzo: 8.50, categoria: 'secondo' as const, disponibile: 'giornaliero' as const, immagine: '/images/meals/medaglione-maiale.jpg' }
    ],
    contorni: [
      { nome: 'Patate arrosto', prezzo: 4.50, categoria: 'contorno' as const, disponibile: 'giornaliero' as const, immagine: '/images/meals/patate-arrosto.jpg' },
      { nome: 'Verdure cotte di stagione', prezzo: 4.50, categoria: 'contorno' as const, disponibile: 'giornaliero' as const, immagine: '/images/meals/verdure-cotte.jpg' }
    ]
  },
  giovedi: {
    primi: [
      { nome: 'Gnocchi alla Sorrentina', prezzo: 8.50, categoria: 'primo' as const, disponibile: 'giornaliero' as const, immagine: '/images/meals/gnocchi-sorrentina.jpg' },
      { nome: 'Pasta alla puttanesca di mare', prezzo: 8.50, categoria: 'primo' as const, disponibile: 'giornaliero' as const, immagine: '/images/meals/pasta-puttanesca-mare.jpg' }
    ],
    secondi: [
      { nome: 'Trancio di salm.alla griglia con zeste di arrancia', prezzo: 8.50, categoria: 'secondo' as const, disponibile: 'giornaliero' as const, immagine: '/images/meals/salmone-zeste-arancia.jpg' },
      { nome: 'Bocco. Di pollo al limone e mandorle', prezzo: 8.50, categoria: 'secondo' as const, disponibile: 'giornaliero' as const, immagine: '/images/meals/bocconcini-pollo-limone-mandorle.jpg' }
    ],
    contorni: [
      { nome: 'Patate arrosto', prezzo: 4.50, categoria: 'contorno' as const, disponibile: 'giornaliero' as const, immagine: '/images/meals/patate-arrosto.jpg' },
      { nome: 'Verdure cotte di stagione', prezzo: 4.50, categoria: 'contorno' as const, disponibile: 'giornaliero' as const, immagine: '/images/meals/verdure-cotte.jpg' }
    ]
  },
  venerdi: {
    primi: [
      { nome: 'Pasta pomodoro feta e olive', prezzo: 8.50, categoria: 'primo' as const, disponibile: 'giornaliero' as const, immagine: '/images/meals/pasta-pomodoro-feta-olive.jpg' },
      { nome: 'Lasagna con verdure di stagione e brie', prezzo: 8.50, categoria: 'primo' as const, disponibile: 'giornaliero' as const, immagine: '/images/meals/lasagna-verdure-brie.jpg' }
    ],
    secondi: [
      { nome: 'Bistecca di scamone alla griglia', prezzo: 8.50, categoria: 'secondo' as const, disponibile: 'giornaliero' as const, immagine: '/images/meals/bistecca-scamone.jpg' },
      { nome: 'Coscetta di pollo al forno', prezzo: 8.50, categoria: 'secondo' as const, disponibile: 'giornaliero' as const, immagine: '/images/meals/coscetta-pollo-forno.jpg' }
    ],
    contorni: [
      { nome: 'Patate arrosto', prezzo: 4.50, categoria: 'contorno' as const, disponibile: 'giornaliero' as const, immagine: '/images/meals/patate-arrosto.jpg' },
      { nome: 'Verdure cotte di stagione', prezzo: 4.50, categoria: 'contorno' as const, disponibile: 'giornaliero' as const, immagine: '/images/meals/verdure-cotte.jpg' }
    ]
  }
};

// SETTIMANA 4
const MENU_SETTIMANA_4 = {
  lunedi: {
    primi: [
      { nome: 'Lasagna al ragù alla Bolognese', prezzo: 8.50, categoria: 'primo' as const, disponibile: 'giornaliero' as const, immagine: '/images/meals/lasagna-ragu-bolognese.jpg' },
      { nome: 'Pasta con sals.datt.rosso, tropea e pecorino', prezzo: 8.50, categoria: 'primo' as const, disponibile: 'giornaliero' as const, immagine: '/images/meals/pasta-datterino-tropea-pecorino.jpg' }
    ],
    secondi: [
      { nome: 'Paillard di tacchino alla griglia', prezzo: 8.50, categoria: 'secondo' as const, disponibile: 'giornaliero' as const, immagine: '/images/meals/paillard-tacchino.jpg' },
      { nome: 'Trancio di persico gratinato', prezzo: 8.50, categoria: 'secondo' as const, disponibile: 'giornaliero' as const, immagine: '/images/meals/persico-gratinato.jpg' }
    ],
    contorni: [
      { nome: 'Patate arrosto', prezzo: 4.50, categoria: 'contorno' as const, disponibile: 'giornaliero' as const, immagine: '/images/meals/patate-arrosto.jpg' },
      { nome: 'Verdure cotte di stagione', prezzo: 4.50, categoria: 'contorno' as const, disponibile: 'giornaliero' as const, immagine: '/images/meals/verdure-cotte.jpg' }
    ]
  },
  martedi: {
    primi: [
      { nome: 'Crespelle prosciutto, funghi e mozzarella', prezzo: 8.50, categoria: 'primo' as const, disponibile: 'giornaliero' as const, immagine: '/images/meals/crespelle-prosciutto-funghi.jpg' },
      { nome: 'Spaghettone cacio e pepe', prezzo: 8.50, categoria: 'primo' as const, disponibile: 'giornaliero' as const, immagine: '/images/meals/spaghettone-cacio-pepe.jpg' }
    ],
    secondi: [
      { nome: 'Lonza marinata con olio aromatico', prezzo: 8.50, categoria: 'secondo' as const, disponibile: 'giornaliero' as const, immagine: '/images/meals/lonza-marinata-olio.jpg' },
      { nome: 'Cotoletta di tacchino alla Milanese', prezzo: 8.50, categoria: 'secondo' as const, disponibile: 'giornaliero' as const, immagine: '/images/meals/cotoletta-tacchino-milanese.jpg' }
    ],
    contorni: [
      { nome: 'Patate arrosto', prezzo: 4.50, categoria: 'contorno' as const, disponibile: 'giornaliero' as const, immagine: '/images/meals/patate-arrosto.jpg' },
      { nome: 'Verdure cotte di stagione', prezzo: 4.50, categoria: 'contorno' as const, disponibile: 'giornaliero' as const, immagine: '/images/meals/verdure-cotte.jpg' }
    ]
  },
  mercoledi: {
    primi: [
      { nome: 'Macch. Al ragù bianco di vitello', prezzo: 8.50, categoria: 'primo' as const, disponibile: 'giornaliero' as const, immagine: '/images/meals/maccheroni-ragu-vitello.jpg' },
      { nome: 'Linguine mare e orto con pomod. E zucchine', prezzo: 8.50, categoria: 'primo' as const, disponibile: 'giornaliero' as const, immagine: '/images/meals/linguine-mare-orto.jpg' }
    ],
    secondi: [
      { nome: 'Filetto di orata piastrato', prezzo: 8.50, categoria: 'secondo' as const, disponibile: 'giornaliero' as const, immagine: '/images/meals/orata-piastrato.jpg' },
      { nome: 'Bistecca di scamone alla griglia', prezzo: 8.50, categoria: 'secondo' as const, disponibile: 'giornaliero' as const, immagine: '/images/meals/bistecca-scamone.jpg' }
    ],
    contorni: [
      { nome: 'Patate arrosto', prezzo: 4.50, categoria: 'contorno' as const, disponibile: 'giornaliero' as const, immagine: '/images/meals/patate-arrosto.jpg' },
      { nome: 'Verdure cotte di stagione', prezzo: 4.50, categoria: 'contorno' as const, disponibile: 'giornaliero' as const, immagine: '/images/meals/verdure-cotte.jpg' }
    ]
  },
  giovedi: {
    primi: [
      { nome: 'Paella di carne e pesce', prezzo: 8.50, categoria: 'primo' as const, disponibile: 'giornaliero' as const, immagine: '/images/meals/paella-carne-pesce.jpg' },
      { nome: 'Tortellini di carne burro sfuso e salvia', prezzo: 8.50, categoria: 'primo' as const, disponibile: 'giornaliero' as const, immagine: '/images/meals/tortellini-burro-salvia.jpg' }
    ],
    secondi: [
      { nome: 'Bocco. Di pollo gratinati', prezzo: 8.50, categoria: 'secondo' as const, disponibile: 'giornaliero' as const, immagine: '/images/meals/bocconcini-pollo-gratinati.jpg' },
      { nome: 'Trancio di salmone alla griglia', prezzo: 8.50, categoria: 'secondo' as const, disponibile: 'giornaliero' as const, immagine: '/images/meals/salmone-griglia.jpg' }
    ],
    contorni: [
      { nome: 'Patate arrosto', prezzo: 4.50, categoria: 'contorno' as const, disponibile: 'giornaliero' as const, immagine: '/images/meals/patate-arrosto.jpg' },
      { nome: 'Verdure cotte di stagione', prezzo: 4.50, categoria: 'contorno' as const, disponibile: 'giornaliero' as const, immagine: '/images/meals/verdure-cotte.jpg' }
    ]
  },
  venerdi: {
    primi: [
      { nome: 'Lasagna al ragù di pesce bianco e lime', prezzo: 8.50, categoria: 'primo' as const, disponibile: 'giornaliero' as const, immagine: '/images/meals/lasagna-ragu-pesce-lime.jpg' },
      { nome: 'Bigoli Al ragù alla Bolognese', prezzo: 8.50, categoria: 'primo' as const, disponibile: 'giornaliero' as const, immagine: '/images/meals/bigoli-ragu-bolognese.jpg' }
    ],
    secondi: [
      { nome: 'Costine in salsa BBQ', prezzo: 8.50, categoria: 'secondo' as const, disponibile: 'giornaliero' as const, immagine: '/images/meals/costine-bbq.jpg' },
      { nome: "Spiedini di carne all'inglese", prezzo: 8.50, categoria: 'secondo' as const, disponibile: 'giornaliero' as const, immagine: '/images/meals/spiedini-carne-inglese.jpg' }
    ],
    contorni: [
      { nome: 'Patate arrosto', prezzo: 4.50, categoria: 'contorno' as const, disponibile: 'giornaliero' as const, immagine: '/images/meals/patate-arrosto.jpg' },
      { nome: 'Verdure cotte di stagione', prezzo: 4.50, categoria: 'contorno' as const, disponibile: 'giornaliero' as const, immagine: '/images/meals/verdure-cotte.jpg' }
    ]
  }
};

// Menu fisso (sempre disponibile)
export const MENU_FISSO: MenuItem[] = [
  // Focacce
  { nome: 'Focaccia Prosciutto Crudo', prezzo: 5.50, categoria: 'focaccia', disponibile: 'sempre', immagine: '/images/meals/focaccia-prosciutto-crudo.jpg' },
  { nome: 'Focaccia Prosciutto Cotto', prezzo: 5.50, categoria: 'focaccia', disponibile: 'sempre', immagine: '/images/meals/focaccia-prosciutto-cotto.jpg' },
  { nome: 'Focaccia Salame', prezzo: 5.50, categoria: 'focaccia', disponibile: 'sempre', immagine: '/images/meals/focaccia-salame.jpg' },
  { nome: 'Focaccia Bresaola', prezzo: 5.50, categoria: 'focaccia', disponibile: 'sempre', immagine: '/images/meals/focaccia-bresaola.jpg' },
  { nome: 'Focaccia Tonno', prezzo: 5.50, categoria: 'focaccia', disponibile: 'sempre', immagine: '/images/meals/focaccia-tonno.jpg' },
  { nome: 'Focaccia Vegetariana', prezzo: 5.50, categoria: 'focaccia', disponibile: 'sempre', immagine: '/images/meals/focaccia-vegetariana.jpg' },
  
  // Piadine
  { nome: 'Piadina Prosciutto Crudo', prezzo: 5.50, categoria: 'piadina', disponibile: 'sempre', immagine: '/images/meals/piadina-prosciutto-crudo.jpg' },
  { nome: 'Piadina Prosciutto Cotto', prezzo: 5.50, categoria: 'piadina', disponibile: 'sempre', immagine: '/images/meals/piadina-prosciutto-cotto.jpg' },
  { nome: 'Piadina Salame', prezzo: 5.50, categoria: 'piadina', disponibile: 'sempre', immagine: '/images/meals/piadina-salame.jpg' },
  { nome: 'Piadina Bresaola', prezzo: 5.50, categoria: 'piadina', disponibile: 'sempre', immagine: '/images/meals/piadina-bresaola.jpg' },
  { nome: 'Piadina Tonno', prezzo: 5.50, categoria: 'piadina', disponibile: 'sempre', immagine: '/images/meals/piadina-tonno.jpg' },
  { nome: 'Piadina Vegetariana', prezzo: 5.50, categoria: 'piadina', disponibile: 'sempre', immagine: '/images/meals/piadina-vegetariana.jpg' },
  
  // Insalatone
  { nome: 'Insalatona Pollo Grigliato', prezzo: 7.50, categoria: 'insalatona', disponibile: 'sempre', immagine: '/images/meals/insalatona-pollo.jpg' },
  { nome: 'Insalatona Tonno', prezzo: 7.50, categoria: 'insalatona', disponibile: 'sempre', immagine: '/images/meals/insalatona-tonno.jpg' },
  { nome: 'Insalatona Gamberetti', prezzo: 7.50, categoria: 'insalatona', disponibile: 'sempre', immagine: '/images/meals/insalatona-gamberetti.jpg' },
  { nome: 'Insalatona Vegetariana', prezzo: 7.50, categoria: 'insalatona', disponibile: 'sempre', immagine: '/images/meals/insalatona-vegetariana.jpg' },
  
  // Extra
  { nome: 'Macedonia di frutta fresca', prezzo: 4.50, categoria: 'extra', disponibile: 'sempre', immagine: '/images/meals/macedonia.jpg' },
  { nome: 'Pane', prezzo: 1.00, categoria: 'extra', disponibile: 'sempre', immagine: '/images/meals/pane.jpg' },
  { nome: 'Acqua 50cl', prezzo: 1.00, categoria: 'extra', disponibile: 'sempre', immagine: '/images/meals/acqua.jpg' }
];

// Menu combo
export const MENU_COMBO: MenuItem[] = [
  { 
    nome: 'Combo Primo + Secondo + Contorno', 
    prezzo: 18.00, 
    categoria: 'combo', 
    disponibile: 'giornaliero',
    descrizione: 'Scegli 1 primo + 1 secondo + 1 contorno dal menu del giorno',
    immagine: '/images/meals/combo-completo.jpg'
  },
  { 
    nome: 'Combo Primo + Secondo + Contorno + Macedonia', 
    prezzo: 21.00, 
    categoria: 'combo', 
    disponibile: 'giornaliero',
    descrizione: 'Scegli 1 primo + 1 secondo + 1 contorno + macedonia dal menu del giorno',
    immagine: '/images/meals/combo-completo-macedonia.jpg'
  }
];

// Funzione principale per ottenere il menu di uno specifico giorno
export function getMenuGiornoSpecifico(data: Date) {
  const settimanaNum = getSettimanaFromDate(data);
  const giorno = getGiornoSettimana(data);
  
  let menuSettimana;
  switch(settimanaNum) {
    case 1:
      menuSettimana = MENU_SETTIMANA_1;
      break;
    case 2:
      menuSettimana = MENU_SETTIMANA_2;
      break;
    case 3:
      menuSettimana = MENU_SETTIMANA_3;
      break;
    case 4:
      menuSettimana = MENU_SETTIMANA_4;
      break;
    default:
      menuSettimana = MENU_SETTIMANA_1;
  }
  
  // Mappa i giorni
  const menuGiorno = (menuSettimana as any)[giorno] || (menuSettimana as any)['lunedi'];
  
  return {
    settimana: `settimana${settimanaNum}`,
    giorno,
    menuGiornaliero: menuGiorno
  };
}