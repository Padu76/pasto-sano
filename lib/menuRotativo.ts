// lib/menuRotativo.ts

export interface MenuItem {
  nome: string;
  prezzo: number;
  categoria: 'primo' | 'secondo' | 'contorno' | 'focaccia' | 'piadina' | 'insalatona' | 'extra' | 'combo';
  disponibile: 'sempre' | 'giornaliero';
  immagine?: string;
  descrizione?: string;
}

export interface MenuGiornaliero {
  primi: string[];
  secondi: string[];
  contorni: string[];
}

export interface MenuSettimana {
  lunedi: MenuGiornaliero;
  martedi: MenuGiornaliero;
  mercoledi: MenuGiornaliero;
  giovedi: MenuGiornaliero;
  venerdi: MenuGiornaliero;
}

// PREZZI FISSI
export const PREZZI = {
  primo: 6.50,
  secondo: 7.50,
  contorno: 3.90,
  focaccia: 7.50,
  piadina: 7.50,
  insalatona: 8.50,
  muffin: 2.50,
  macedonia: 5.00,
  carneSalada: 7.50,
  // Prezzi Combo
  comboPrimoContorno: 9.00,
  comboSecondoContorno: 10.20,
  comboPrimoSecondoContorno: 15.60,
  comboPrimoMacedonia: 10.00,
  comboSecondoMacedonia: 11.20
};

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
  const year = data.getFullYear();
  const month = data.getMonth();
  const day = data.getDate();
  const localDate = new Date(year, month, day);
  return giorni[localDate.getDay()];
}

// Helper function per generare il path dell'immagine basato sul nome del piatto
function generateImagePath(nome: string, categoria: string): string {
  const nomeFile = nome.toLowerCase()
    .replace(/[àá]/g, 'a')
    .replace(/[èé]/g, 'e')
    .replace(/[ìí]/g, 'i')
    .replace(/[òó]/g, 'o')
    .replace(/[ùú]/g, 'u')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .substring(0, 50);
  
  return `/images/${categoria}/${nomeFile}.jpg`;
}

// MENU ROTATIVO - 4 SETTIMANE (Solo lun-ven)
export const MENU_ROTATIVO: { [key: string]: MenuSettimana } = {
  settimana1: {
    lunedi: {
      primi: [
        "Lasagna zucchine e salmone",
        "Tortelli alla crema di parmigiano"
      ],
      secondi: [
        "Scaloppine di pollo al limone",
        "Paillard di tacchino alla griglia"
      ],
      contorni: [
        "Patate arrosto",
        "Verdure cotta di stagione"
      ]
    },
    martedi: {
      primi: [
        "Crespelle ricotto, spinaci e cotto",
        "Penne alla puttanesca Napoletana"
      ],
      secondi: [
        "Filetto di branzino alla piastra con gremolada",
        "Medaglione di maiale alla griglia"
      ],
      contorni: [
        "Patate arrosto",
        "Verdure cotta di stagione"
      ]
    },
    mercoledi: {
      primi: [
        "Lasagna alla parmigiana",
        "Calamarata alla carbonara di mare"
      ],
      secondi: [
        "Petto di pollo alla diavola",
        "Saltimbocca alla romana"
      ],
      contorni: [
        "Patate arrosto",
        "Verdure cotta di stagione"
      ]
    },
    giovedi: {
      primi: [
        "Spaghettone ai 2 pomodori",
        "Paella di pesce e carne"
      ],
      secondi: [
        "Sovracoscia di pollo al forno",
        "Filetto di orata alla griglia"
      ],
      contorni: [
        "Patate arrosto",
        "Verdure cotta di stagione"
      ]
    },
    venerdi: {
      primi: [
        "Lasagna con verdure di stagione e brié",
        "Mezzi paccheri all'amatriciana"
      ],
      secondi: [
        "Hamburger in bella vista",
        "Costine laccate in salsa BBQ"
      ],
      contorni: [
        "Patate arrosto",
        "Verdure cotta di stagione"
      ]
    }
  },
  settimana2: {
    lunedi: {
      primi: [
        "Lasagna con crema di asparagi e bacon crocc",
        "Mezze maniche cacio pepe"
      ],
      secondi: [
        "Scaloppina di tacchino agli agrumi",
        "Filetto di branzino alla griglia"
      ],
      contorni: [
        "Patate arrosto",
        "Verdure cotta di stagione"
      ]
    },
    martedi: {
      primi: [
        "Crespelle gamberetti",
        "Pasta all'arrabbiata"
      ],
      secondi: [
        "Cotoletta di tacchino alla milanese",
        "Bistecca di scamone alla griglia"
      ],
      contorni: [
        "Patate arrosto",
        "Verdure cotta di stagione"
      ]
    },
    mercoledi: {
      primi: [
        "Pasta gratinata con caponata e scamorza",
        "Maccheroncino al ragù alla bolognese"
      ],
      secondi: [
        "Bocconcini di pollo gratinati",
        "Filetto di orata alla griglia con gremolada"
      ],
      contorni: [
        "Patate arrosto",
        "Verdure cotta di stagione"
      ]
    },
    giovedi: {
      primi: [
        "Mezzi paccheri con spada melanzane e ric.aff.",
        "Risotto alla Milanese con zucchine"
      ],
      secondi: [
        "Polpette di carne al sugo",
        "Paillard di tacchino alla griglia"
      ],
      contorni: [
        "Patate arrosto",
        "Verdure cotta di stagione"
      ]
    },
    venerdi: {
      primi: [
        "Spaghetti datt.giallo menta stracciatella",
        "Calamarata cozze al prof.d arancia e pomodorini"
      ],
      secondi: [
        "Coscetta di pollo laccata in salsa BBQ",
        "Lonza marinata alla griglia"
      ],
      contorni: [
        "Patate arrosto",
        "Verdure cotta di stagione"
      ]
    }
  },
  settimana3: {
    lunedi: {
      primi: [
        "Lasagna alla Ligure",
        "Caserecce capperi e zucchine"
      ],
      secondi: [
        "Spiedini di carne all'inglese",
        "Frittata di vedure di stagione"
      ],
      contorni: [
        "Patate arrosto",
        "Verdure cotta di stagione"
      ]
    },
    martedi: {
      primi: [
        "Crespelle carciofi e scamorza",
        "Spaghetti datt. Rosso e stracciatella"
      ],
      secondi: [
        "Braciola alla griglia e olio aromatico",
        "Filetto di persico in crosta di erbe fine"
      ],
      contorni: [
        "Patate arrosto",
        "Verdure cotta di stagione"
      ]
    },
    mercoledi: {
      primi: [
        "Lasagna al ragù bianco di pesce zucch. E lime",
        "Bigoli al ragù alla Bolognese"
      ],
      secondi: [
        "Hamburger di manzo in bella vista",
        "Medaglione di maiale alla griglia"
      ],
      contorni: [
        "Patate arrosto",
        "Verdure cotta di stagione"
      ]
    },
    giovedi: {
      primi: [
        "Gnocchi alla Sorrentina",
        "Pasta alla puttanesca di mare"
      ],
      secondi: [
        "Trancio di salm.alla griglia con zeste di arrancia",
        "Bocco. Di pollo al limone e mandorle"
      ],
      contorni: [
        "Patate arrosto",
        "Verdure cotta di stagione"
      ]
    },
    venerdi: {
      primi: [
        "Pasta pomodoro fetta e olive",
        "Lasagna con verdure di stagione e brié"
      ],
      secondi: [
        "Bistecca di scamone alla griglia",
        "Coscetta di pollo al forno"
      ],
      contorni: [
        "Patate arrosto",
        "Verdure cotta di stagione"
      ]
    }
  },
  settimana4: {
    lunedi: {
      primi: [
        "Lasagna al ragù alla Bolognese",
        "Pasta con sals.datt.rosso,tropea e pecorino"
      ],
      secondi: [
        "Paillard di tacchino alla griglia",
        "Trancio di persico gratinato"
      ],
      contorni: [
        "Patate arrosto",
        "Verdure cotta di stagione"
      ]
    },
    martedi: {
      primi: [
        "Crespelle prosciutto, funghi e mozzarella",
        "Spaghettone cacio e pepe"
      ],
      secondi: [
        "Lonza marinata con olio aromatico",
        "Cotoletta di tacchino alla Milanese"
      ],
      contorni: [
        "Patate arrosto",
        "Verdure cotta di stagione"
      ]
    },
    mercoledi: {
      primi: [
        "Macch. Al ragù bianco di vitello",
        "Linguine mare e orto con pomod. E zucchine"
      ],
      secondi: [
        "Filetto di orata piastrato",
        "Bistecca di scamone alla griglia"
      ],
      contorni: [
        "Patate arrosto",
        "Verdure cotta di stagione"
      ]
    },
    giovedi: {
      primi: [
        "Paella di carne e pesce",
        "Tortellini di carne burro sfuso e salvia"
      ],
      secondi: [
        "Bocc. Di pollo gratinati",
        "Trancio di salmone alla griglia"
      ],
      contorni: [
        "Patate arrosto",
        "Verdure cotta di stagione"
      ]
    },
    venerdi: {
      primi: [
        "Lasagna al ragù di pesce bianco e lime",
        "Bigoli Al ragù alla Bolognese"
      ],
      secondi: [
        "Costine in salsa BBQ",
        "Spiedini di carne all'inglese"
      ],
      contorni: [
        "Patate arrosto",
        "Verdure cotta di stagione"
      ]
    }
  }
};

// MENU FISSO - SEMPRE DISPONIBILE
export const MENU_FISSO: MenuItem[] = [
  // FOCACCE
  {
    nome: "Focaccia Praga (cotto, edamer, salsa tonnata)",
    prezzo: PREZZI.focaccia,
    categoria: 'focaccia',
    disponibile: 'sempre',
    immagine: '/images/focacce/focaccia-praga.jpg'
  },
  {
    nome: "Focaccia Capri (pomodoro, mozzarella, basilico)",
    prezzo: PREZZI.focaccia,
    categoria: 'focaccia',
    disponibile: 'sempre',
    immagine: '/images/focacce/focaccia-capri.jpg'
  },
  {
    nome: "Focaccia Milano (cotoletta, insalata, pomodoro, maionese)",
    prezzo: PREZZI.focaccia,
    categoria: 'focaccia',
    disponibile: 'sempre',
    immagine: '/images/focacce/focaccia-milano.jpg'
  },
  {
    nome: "Focaccia Parma (crudo, mozzarella, basilico)",
    prezzo: PREZZI.focaccia,
    categoria: 'focaccia',
    disponibile: 'sempre',
    immagine: '/images/focacce/focaccia-parma.jpg'
  },
  {
    nome: "Focaccia Valtellina (rucola, bresaola, Filadelfia)",
    prezzo: PREZZI.focaccia,
    categoria: 'focaccia',
    disponibile: 'sempre',
    immagine: '/images/focacce/focaccia-valtellina.jpg'
  },
  // PIADINE
  {
    nome: "Piadina cotto, squacquerone, rucola",
    prezzo: PREZZI.piadina,
    categoria: 'piadina',
    disponibile: 'sempre',
    immagine: '/images/piadine/piadina-cotto.jpg',
    descrizione: 'Prosciutto cotto, squacquerone, rucola fresca'
  },
  {
    nome: "Piadina crudo, squacquerone, rucola",
    prezzo: PREZZI.piadina,
    categoria: 'piadina',
    disponibile: 'sempre',
    immagine: '/images/piadine/piadina-crudo.jpg',
    descrizione: 'Prosciutto crudo, squacquerone, rucola fresca'
  },
  // INSALATONE
  {
    nome: "Insalata Fumé",
    prezzo: PREZZI.insalatona,
    categoria: 'insalatona',
    disponibile: 'sempre',
    immagine: '/images/insalatone/insalatona-1.jpg',
    descrizione: 'Valeriana, salmone affumicato, philadelphia, arancia, sesamo, crostini'
  },
  {
    nome: "Insalata Prateria",
    prezzo: PREZZI.insalatona,
    categoria: 'insalatona',
    disponibile: 'sempre',
    immagine: '/images/insalatone/insalatona-2.jpg',
    descrizione: 'Mista, rucola, pomodoro, carote, philadelphia, filacci di cavallo, capperi'
  },
  {
    nome: "Insalata Trentina",
    prezzo: PREZZI.insalatona,
    categoria: 'insalatona',
    disponibile: 'sempre',
    immagine: '/images/insalatone/insalatona-3.jpg',
    descrizione: 'Valeriana, patate, speck, scaglie di grana, aceto balsamico'
  },
  {
    nome: "Insalata Ceasar",
    prezzo: PREZZI.insalatona,
    categoria: 'insalatona',
    disponibile: 'sempre',
    immagine: '/images/insalatone/insalatona-4.jpg',
    descrizione: 'Rucola, pomodorini, uovo, pollo, crostini, salsa ceasar'
  },
  {
    nome: "Insalata Re di Sapori",
    prezzo: PREZZI.insalatona,
    categoria: 'insalatona',
    disponibile: 'sempre',
    immagine: '/images/insalatone/insalatona-5.jpg',
    descrizione: 'Valeriana, feta, olive taggiasche, pomodorini, peperoni, cetrioli'
  },
  {
    nome: "Insalata Bufalina",
    prezzo: PREZZI.insalatona,
    categoria: 'insalatona',
    disponibile: 'sempre',
    immagine: '/images/insalatone/insalatona-6.jpg',
    descrizione: 'Valeriana, pomodoro, mozzarella di bufala, basilico'
  },
  {
    nome: "Insalata Tonnata",
    prezzo: PREZZI.insalatona,
    categoria: 'insalatona',
    disponibile: 'sempre',
    immagine: '/images/insalatone/insalatona-7.jpg',
    descrizione: 'Valeriana, mozzarelline, uovo, tonno, pomodoro, carote'
  },
  {
    nome: "Insalatona Valtellina",
    prezzo: PREZZI.insalatona,
    categoria: 'insalatona',
    disponibile: 'sempre',
    immagine: '/images/insalatone/insalatona-8.jpg',
    descrizione: 'Mista, rucola, valeriana, bresaola, noci, scaglie di grana, crostini'
  },
  // EXTRA
  {
    nome: "Muffin albicocca",
    prezzo: PREZZI.muffin,
    categoria: 'extra',
    disponibile: 'sempre',
    immagine: '/images/extra/muffin-albicocca.jpg'
  },
  {
    nome: "Macedonia di frutta",
    prezzo: PREZZI.macedonia,
    categoria: 'extra',
    disponibile: 'sempre',
    immagine: '/images/extra/macedonia.jpg'
  },
  {
    nome: "Carne salada",
    prezzo: PREZZI.carneSalada,
    categoria: 'extra',
    disponibile: 'sempre',
    immagine: '/images/extra/carne-salada.jpg'
  },
  {
    nome: "Roast beef",
    prezzo: PREZZI.carneSalada,
    categoria: 'extra',
    disponibile: 'sempre',
    immagine: '/images/extra/roast-beef.jpg'
  }
];

// MENU COMBO - SEMPRE DISPONIBILE
export const MENU_COMBO: MenuItem[] = [
  {
    nome: "Combo Primo + Contorno",
    prezzo: PREZZI.comboPrimoContorno,
    categoria: 'combo',
    disponibile: 'sempre',
    immagine: '/images/combo/combo-primo-contorno.jpg',
    descrizione: 'Scegli un primo del giorno + un contorno. Risparmi €1,40!'
  },
  {
    nome: "Combo Secondo + Contorno",
    prezzo: PREZZI.comboSecondoContorno,
    categoria: 'combo',
    disponibile: 'sempre',
    immagine: '/images/combo/combo-secondo-contorno.jpg',
    descrizione: 'Scegli un secondo del giorno + un contorno. Risparmi €1,20!'
  },
  {
    nome: "Combo Completo (Primo + Secondo + Contorno)",
    prezzo: PREZZI.comboPrimoSecondoContorno,
    categoria: 'combo',
    disponibile: 'sempre',
    immagine: '/images/combo/combo-completo.jpg',
    descrizione: 'Il menu completo: primo, secondo e contorno del giorno. Risparmi €2,30!'
  },
  {
    nome: "Combo Primo + Macedonia",
    prezzo: PREZZI.comboPrimoMacedonia,
    categoria: 'combo',
    disponibile: 'sempre',
    immagine: '/images/combo/combo-primo-macedonia.jpg',
    descrizione: 'Scegli un primo del giorno + macedonia fresca. Risparmi €1,50!'
  },
  {
    nome: "Combo Secondo + Macedonia",
    prezzo: PREZZI.comboSecondoMacedonia,
    categoria: 'combo',
    disponibile: 'sempre',
    immagine: '/images/combo/combo-secondo-macedonia.jpg',
    descrizione: 'Scegli un secondo del giorno + macedonia fresca. Risparmi €1,30!'
  }
];

// FUNZIONE PRINCIPALE PER OTTENERE IL MENU DI UN GIORNO SPECIFICO
export function getMenuGiornoSpecifico(data: Date) {
  const settimanaNum = getSettimanaFromDate(data);
  const giorno = getGiornoSettimana(data);
  
  // Controlla se è weekend (sabato o domenica)
  if (giorno === 'sabato' || giorno === 'domenica') {
    return {
      data: data.toLocaleDateString('it-IT', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      settimana: `settimana${settimanaNum}`,
      giorno,
      isWeekend: true,
      menuGiornaliero: {
        primi: [],
        secondi: [],
        contorni: []
      }
    };
  }
  
  const settimana = `settimana${settimanaNum}`;
  const menuSettimana = MENU_ROTATIVO[settimana];
  const menuGiorno = menuSettimana[giorno as keyof MenuSettimana];
  
  return {
    data: data.toLocaleDateString('it-IT', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }),
    settimana,
    giorno,
    isWeekend: false,
    menuGiornaliero: {
      primi: menuGiorno.primi.map(nome => ({
        nome,
        prezzo: PREZZI.primo,
        categoria: 'primo' as const,
        disponibile: 'giornaliero' as const,
        immagine: generateImagePath(nome, 'primi')
      })),
      secondi: menuGiorno.secondi.map(nome => ({
        nome,
        prezzo: PREZZI.secondo,
        categoria: 'secondo' as const,
        disponibile: 'giornaliero' as const,
        immagine: generateImagePath(nome, 'secondi')
      })),
      contorni: menuGiorno.contorni.map(nome => ({
        nome,
        prezzo: PREZZI.contorno,
        categoria: 'contorno' as const,
        disponibile: 'giornaliero' as const,
        immagine: generateImagePath(nome, 'contorni')
      }))
    }
  };
}

// FUNZIONE PER OTTENERE IL MENU DEL GIORNO CORRENTE
export function getMenuDelGiorno() {
  return getMenuGiornoSpecifico(new Date());
}

// FUNZIONE PER OTTENERE IL MENU DELLA SETTIMANA CORRENTE
export function getMenuSettimanale() {
  const oggi = new Date();
  const settimanaNum = getSettimanaFromDate(oggi);
  const settimana = `settimana${settimanaNum}`;
  const menuSettimana = MENU_ROTATIVO[settimana];
  
  const result: any = {};
  const giorni: (keyof MenuSettimana)[] = ['lunedi', 'martedi', 'mercoledi', 'giovedi', 'venerdi'];
  
  giorni.forEach(giorno => {
    result[giorno] = {
      primi: menuSettimana[giorno].primi.map(nome => ({
        nome,
        prezzo: PREZZI.primo,
        categoria: 'primo',
        disponibile: 'giornaliero',
        immagine: generateImagePath(nome, 'primi')
      })),
      secondi: menuSettimana[giorno].secondi.map(nome => ({
        nome,
        prezzo: PREZZI.secondo,
        categoria: 'secondo',
        disponibile: 'giornaliero',
        immagine: generateImagePath(nome, 'secondi')
      })),
      contorni: menuSettimana[giorno].contorni.map(nome => ({
        nome,
        prezzo: PREZZI.contorno,
        categoria: 'contorno',
        disponibile: 'giornaliero',
        immagine: generateImagePath(nome, 'contorni')
      }))
    };
  });
  
  return {
    settimana,
    menu: result,
    menuFisso: MENU_FISSO,
    menuCombo: MENU_COMBO
  };
}

// FUNZIONE PER CERCARE UN PIATTO
export function cercaPiatto(termine: string): MenuItem[] {
  const risultati: MenuItem[] = [];
  const termineRicerca = termine.toLowerCase();
  
  MENU_FISSO.forEach(item => {
    if (item.nome.toLowerCase().includes(termineRicerca)) {
      risultati.push(item);
    }
  });
  
  MENU_COMBO.forEach(item => {
    if (item.nome.toLowerCase().includes(termineRicerca)) {
      risultati.push(item);
    }
  });
  
  Object.values(MENU_ROTATIVO).forEach(settimana => {
    Object.values(settimana).forEach(giorno => {
      giorno.primi.forEach((primo: string) => {
        if (primo.toLowerCase().includes(termineRicerca)) {
          risultati.push({
            nome: primo,
            prezzo: PREZZI.primo,
            categoria: 'primo',
            disponibile: 'giornaliero',
            immagine: generateImagePath(primo, 'primi')
          });
        }
      });
      giorno.secondi.forEach((secondo: string) => {
        if (secondo.toLowerCase().includes(termineRicerca)) {
          risultati.push({
            nome: secondo,
            prezzo: PREZZI.secondo,
            categoria: 'secondo',
            disponibile: 'giornaliero',
            immagine: generateImagePath(secondo, 'secondi')
          });
        }
      });
      giorno.contorni.forEach((contorno: string) => {
        if (contorno.toLowerCase().includes(termineRicerca)) {
          risultati.push({
            nome: contorno,
            prezzo: PREZZI.contorno,
            categoria: 'contorno',
            disponibile: 'giornaliero',
            immagine: generateImagePath(contorno, 'contorni')
          });
        }
      });
    });
  });
  
  return risultati.filter((item, index, self) =>
    index === self.findIndex((t) => t.nome === item.nome)
  );
}