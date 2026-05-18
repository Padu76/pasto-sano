// E:\pasto-sano\lib\menuRotativo.ts
// Menu Pasto Sano - solo prodotti nuovo fornitore (no più menu rotativo)

export interface MenuItem {
  nome: string;
  prezzo: number;
  categoria: 'pronto' | 'da-cuocere';
  disponibile: 'sempre';
  immagine: string;
  descrizione: string;
  peso: string;
  formato?: string;
}

// PASTI PRONTI (11) — pronti da scaldare/consumare
export const PRONTI: MenuItem[] = [
  {
    nome: 'Polpette proteiche',
    prezzo: 7.0,
    categoria: 'pronto',
    disponibile: 'sempre',
    immagine: '/images/carni/polpette-proteiche.jpg',
    descrizione: 'Polpette proteiche di carne. Pronte da scaldare in 2 minuti.',
    peso: '184g',
    formato: '8 pezzi da 22/24g',
  },
  {
    nome: 'Macinato bovino cotto',
    prezzo: 10.0,
    categoria: 'pronto',
    disponibile: 'sempre',
    immagine: '/images/carni/macinato-bovino-cotto.jpg',
    descrizione: 'Macinato di bovino già cotto, pronto da scaldare.',
    peso: '300g',
  },
  {
    nome: 'Roast beef bovino a fette',
    prezzo: 9.0,
    categoria: 'pronto',
    disponibile: 'sempre',
    immagine: '/images/carni/roast-beef-fette.jpg',
    descrizione: 'Roast beef di bovino a fette, pronto da consumare.',
    peso: '180g',
  },
  {
    nome: 'Insalata di pollo',
    prezzo: 11.0,
    categoria: 'pronto',
    disponibile: 'sempre',
    immagine: '/images/carni/insalata-pollo.jpg',
    descrizione: 'Insalata fredda di pollo, ricca di proteine. Pronta da consumare.',
    peso: '300g',
  },
  {
    nome: 'Tagliata di pollo',
    prezzo: 6.0,
    categoria: 'pronto',
    disponibile: 'sempre',
    immagine: '/images/carni/tagliata-pollo.jpg',
    descrizione: 'Tagliata di pollo già cotta, pronta da scaldare.',
    peso: '160g',
  },
  {
    nome: 'Tagliata bovino cotta a fette',
    prezzo: 9.0,
    categoria: 'pronto',
    disponibile: 'sempre',
    immagine: '/images/carni/tagliata-bovino-cotta-fette.jpg',
    descrizione: 'Tagliata di bovino cotta a fette, pronta da consumare.',
    peso: '180g',
  },
  {
    nome: 'Tagliata bovino cotta intera',
    prezzo: 8.0,
    categoria: 'pronto',
    disponibile: 'sempre',
    immagine: '/images/carni/tagliata-bovino-cotta-intera.jpg',
    descrizione: 'Tagliata di bovino cotta, monoporzione intera. Pronta da scaldare.',
    peso: '180g',
    formato: 'monoporzione',
  },
  {
    nome: 'Tagliata bovino cotta affumicata',
    prezzo: 5.0,
    categoria: 'pronto',
    disponibile: 'sempre',
    immagine: '/images/carni/tagliata-bovino-affumicata.jpg',
    descrizione: 'Tagliata di bovino affumicata a fette, pronta da consumare.',
    peso: '100g',
  },
  {
    nome: 'Carne secca',
    prezzo: 5.0,
    categoria: 'pronto',
    disponibile: 'sempre',
    immagine: '/images/carni/carne-secca.jpg',
    descrizione: 'Snack proteico ad alta densità. Pronto da consumare.',
    peso: '30g',
  },
  {
    nome: 'Piselli cotti',
    prezzo: 8.0,
    categoria: 'pronto',
    disponibile: 'sempre',
    immagine: '/images/carni/piselli.jpg',
    descrizione: 'Piselli cotti, pronti da scaldare.',
    peso: '300g',
  },
  {
    nome: 'Carote a rondelle',
    prezzo: 8.0,
    categoria: 'pronto',
    disponibile: 'sempre',
    immagine: '/images/carni/carote-rondelle.jpg',
    descrizione: 'Carote a rondelle cotte, pronte da scaldare.',
    peso: '300g',
  },
  {
    nome: 'Catalogna',
    prezzo: 8.0,
    categoria: 'pronto',
    disponibile: 'sempre',
    immagine: '/images/carni/catalogna.jpg',
    descrizione: 'Catalogna cotta, pronta da scaldare.',
    peso: '300g',
  },
  {
    nome: 'Fagiolini verdi',
    prezzo: 8.0,
    categoria: 'pronto',
    disponibile: 'sempre',
    immagine: '/images/carni/fagiolini-verdi.jpg',
    descrizione: 'Fagiolini verdi cotti, pronti da scaldare.',
    peso: '300g',
  },
  {
    nome: 'Zucchine a rondelle',
    prezzo: 8.0,
    categoria: 'pronto',
    disponibile: 'sempre',
    immagine: '/images/carni/zucchine-rondelle.jpg',
    descrizione: 'Zucchine a rondelle cotte, pronte da scaldare.',
    peso: '300g',
  },
  {
    nome: 'Tartare di bovino',
    prezzo: 6.0,
    categoria: 'pronto',
    disponibile: 'sempre',
    immagine: '/images/carni/tartare-bovino.jpg',
    descrizione: 'Tartare di bovino fresca, pronta da condire e consumare.',
    peso: '150g',
  },
];

// DA CUCINARE (3) — carni crude per la tua preparazione
export const DA_CUCINARE: MenuItem[] = [
  {
    nome: 'Macinato bovino crudo',
    prezzo: 11.0,
    categoria: 'da-cuocere',
    disponibile: 'sempre',
    immagine: '/images/carni/macinato-bovino-crudo.jpg',
    descrizione: 'Macinato di bovino crudo, da cuocere a casa.',
    peso: '500g',
  },
  {
    nome: 'Hamburger bovino',
    prezzo: 6.0,
    categoria: 'da-cuocere',
    disponibile: 'sempre',
    immagine: '/images/carni/hamburger-bovino.jpg',
    descrizione: 'Hamburger di bovino, da cuocere alla griglia o piastra.',
    peso: '240g',
    formato: '2 pezzi da 120/180g',
  },
  {
    nome: 'Tagliata bovino adulto',
    prezzo: 15.0,
    categoria: 'da-cuocere',
    disponibile: 'sempre',
    immagine: '/images/carni/tagliata-bovino-adulto.jpg',
    descrizione: 'Tagliata di bovino adulto, da cuocere alla griglia.',
    peso: '400g',
    formato: '2 pezzi da 200g',
  },
];

// Tutti i prodotti, utile per ricerche e lookup
export const TUTTI_PRODOTTI: MenuItem[] = [...PRONTI, ...DA_CUCINARE];

// ===== BACKWARD COMPATIBILITY =====
// Mantenuti per non rompere import esistenti durante la migrazione.
// MENU_FISSO ora include solo i nuovi prodotti.
export const MENU_FISSO: MenuItem[] = TUTTI_PRODOTTI;

// Menu combo eliminato (non più offerto)
export const MENU_COMBO: MenuItem[] = [];

// Prezzi legacy (alcune pagine admin possono leggere PREZZI)
export const PREZZI = {
  primo: 6.5,
  secondo: 7.5,
  contorno: 3.9,
  focaccia: 7.5,
  piadina: 7.5,
  insalatona: 8.5,
  muffin: 2.5,
  macedonia: 5.0,
  carneSalada: 7.5,
  comboPrimoContorno: 9.0,
  comboSecondoContorno: 10.2,
  comboPrimoSecondoContorno: 15.6,
  comboPrimoMacedonia: 10.0,
  comboSecondoMacedonia: 11.2,
};

// Funzione legacy mantenuta per non rompere /ordina vecchio durante migrazione.
// Ritorna struttura vuota (no più menu del giorno).
export function getMenuGiornoSpecifico(_data: Date) {
  return {
    data: '',
    settimana: '',
    giorno: '',
    isWeekend: false,
    menuGiornaliero: {
      primi: [] as MenuItem[],
      secondi: [] as MenuItem[],
      contorni: [] as MenuItem[],
    },
  };
}

export function getMenuDelGiorno() {
  return getMenuGiornoSpecifico(new Date());
}

export function getMenuSettimanale() {
  return {
    settimana: '',
    menu: {},
    menuFisso: MENU_FISSO,
    menuCombo: MENU_COMBO,
  };
}

// Ricerca prodotto per nome
export function cercaPiatto(termine: string): MenuItem[] {
  const t = termine.toLowerCase();
  return TUTTI_PRODOTTI.filter((p) => p.nome.toLowerCase().includes(t));
}
