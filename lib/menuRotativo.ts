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
  bio?: boolean;
}

// PASTI PRONTI (15) — pronti da scaldare/consumare
export const PRONTI: MenuItem[] = [
  {
    nome: 'Polpette proteiche',
    prezzo: 7.0,
    categoria: 'pronto',
    disponibile: 'sempre',
    immagine: '/images/prodotti/polpette-proteiche.jpg',
    descrizione: 'Porzione 184g (8 polpette da 22/24g). Polpette proteiche di carne, pronte da scaldare in 2 minuti.',
    peso: '184g',
    formato: '8 pezzi da 22/24g',
  },
  {
    nome: 'Polpette energetiche',
    prezzo: 7.0,
    categoria: 'pronto',
    disponibile: 'sempre',
    immagine: '/images/prodotti/polpette-energetiche.jpg',
    descrizione: 'Porzione 184g (8 polpette da 22/24g). Polpette di carne e riso, pronte da scaldare in 2 minuti.',
    peso: '184g',
    formato: '8 pezzi da 22/24g',
  },
  {
    nome: 'Roast beef bovino a fette',
    prezzo: 9.0,
    categoria: 'pronto',
    disponibile: 'sempre',
    immagine: '/images/prodotti/roast-beef-fette.jpg',
    descrizione: 'Porzione 180g. Roast beef di bovino a fette, pronto da consumare.',
    peso: '180g',
  },
  {
    nome: 'Insalata di pollo',
    prezzo: 11.0,
    categoria: 'pronto',
    disponibile: 'sempre',
    immagine: '/images/prodotti/insalata-pollo.jpg',
    descrizione: 'Porzione 300g. Insalata fredda di pollo, ricca di proteine. Pronta da consumare.',
    peso: '300g',
  },
  {
    nome: 'Tagliata di pollo',
    prezzo: 6.0,
    categoria: 'pronto',
    disponibile: 'sempre',
    immagine: '/images/prodotti/tagliata-pollo.jpg',
    descrizione: 'Porzione 160g. Tagliata di pollo già cotta, pronta da scaldare.',
    peso: '160g',
  },
  {
    nome: 'Tagliata bovino cotta a fette',
    prezzo: 9.0,
    categoria: 'pronto',
    disponibile: 'sempre',
    immagine: '/images/prodotti/tagliata-bovino-cotta-fette.jpg',
    descrizione: 'Porzione 180g. Tagliata di bovino cotta a fette, pronta da consumare.',
    peso: '180g',
  },
  {
    nome: 'Tagliata bovino cotta intera',
    prezzo: 8.0,
    categoria: 'pronto',
    disponibile: 'sempre',
    immagine: '/images/prodotti/tagliata-bovino-cotta-intera.jpg',
    descrizione: 'Porzione 180g (monoporzione). Tagliata di bovino cotta, pronta da scaldare.',
    peso: '180g',
    formato: 'monoporzione',
  },
  {
    nome: 'Tagliata bovino cotta affumicata',
    prezzo: 5.0,
    categoria: 'pronto',
    disponibile: 'sempre',
    immagine: '/images/prodotti/tagliata-bovino-affumicata.jpg',
    descrizione: 'Porzione 100g. Tagliata di bovino affumicata a fette, pronta da consumare.',
    peso: '100g',
  },
  {
    nome: 'Carne secca',
    prezzo: 5.0,
    categoria: 'pronto',
    disponibile: 'sempre',
    immagine: '/images/prodotti/carne-secca.jpg',
    descrizione: 'Porzione 30g. Snack proteico ad alta densità, pronto da consumare.',
    peso: '30g',
  },
  {
    nome: 'Piselli cotti BIO',
    prezzo: 8.0,
    categoria: 'pronto',
    disponibile: 'sempre',
    immagine: '/images/prodotti/piselli.jpg',
    descrizione: 'Porzione 300g. Piselli cotti biologici, pronti da scaldare.',
    peso: '300g',
    bio: true,
  },
  {
    nome: 'Carote a rondelle BIO',
    prezzo: 8.0,
    categoria: 'pronto',
    disponibile: 'sempre',
    immagine: '/images/prodotti/carote-rondelle.jpg',
    descrizione: 'Porzione 300g. Carote a rondelle cotte biologiche, pronte da scaldare.',
    peso: '300g',
    bio: true,
  },
  {
    nome: 'Catalogna BIO',
    prezzo: 8.0,
    categoria: 'pronto',
    disponibile: 'sempre',
    immagine: '/images/prodotti/catalogna.jpg',
    descrizione: 'Porzione 300g. Catalogna cotta biologica, pronta da scaldare.',
    peso: '300g',
    bio: true,
  },
  {
    nome: 'Fagiolini verdi BIO',
    prezzo: 8.0,
    categoria: 'pronto',
    disponibile: 'sempre',
    immagine: '/images/prodotti/fagiolini-verdi.jpg',
    descrizione: 'Porzione 300g. Fagiolini verdi cotti biologici, pronti da scaldare.',
    peso: '300g',
    bio: true,
  },
  {
    nome: 'Zucchine a rondelle BIO',
    prezzo: 8.0,
    categoria: 'pronto',
    disponibile: 'sempre',
    immagine: '/images/prodotti/zucchine-rondelle.jpg',
    descrizione: 'Porzione 300g. Zucchine a rondelle cotte biologiche, pronte da scaldare.',
    peso: '300g',
    bio: true,
  },
  {
    nome: 'Tartare di bovino',
    prezzo: 6.0,
    categoria: 'pronto',
    disponibile: 'sempre',
    immagine: '/images/prodotti/tartare-bovino.jpg',
    descrizione: 'Porzione 150g. Tartare di bovino fresca, pronta da condire e consumare.',
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
    immagine: '/images/prodotti/macinato-bovino-crudo.jpg',
    descrizione: 'Porzione 500g. Macinato di bovino crudo, da cuocere a casa.',
    peso: '500g',
  },
  {
    nome: 'Hamburger bovino',
    prezzo: 6.0,
    categoria: 'da-cuocere',
    disponibile: 'sempre',
    immagine: '/images/prodotti/hamburger-bovino.png',
    descrizione: 'Porzione 240g (2 hamburger da 120/180g). Da cuocere alla griglia o piastra.',
    peso: '240g',
    formato: '2 pezzi da 120/180g',
  },
  {
    nome: 'Tagliata bovino adulto',
    prezzo: 15.0,
    categoria: 'da-cuocere',
    disponibile: 'sempre',
    immagine: '/images/prodotti/tagliata-bovino-adulto.jpg',
    descrizione: 'Porzione 400g (2 pezzi da 200g). Tagliata di bovino adulto, da cuocere alla griglia.',
    peso: '400g',
    formato: '2 pezzi da 200g',
  },
];

// Tutti i prodotti
export const TUTTI_PRODOTTI: MenuItem[] = [...PRONTI, ...DA_CUCINARE];

// ===== BACKWARD COMPATIBILITY =====
export const MENU_FISSO: MenuItem[] = TUTTI_PRODOTTI;
export const MENU_COMBO: MenuItem[] = [];

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

export function cercaPiatto(termine: string): MenuItem[] {
  const t = termine.toLowerCase();
  return TUTTI_PRODOTTI.filter((p) => p.nome.toLowerCase().includes(t));
}
