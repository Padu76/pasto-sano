// E:\pasto-sano\lib\menuRotativo.ts
// Menu Pasto Sano - solo prodotti nuovo fornitore (no più menu rotativo)

export interface MenuVariante {
  peso: string;          // visualizzato es. "200g"
  pesoGrammi: number;    // per calcoli costi
  prezzo: number;        // prezzo vendita di questa variante
}

export interface MenuItem {
  nome: string;
  prezzo: number;        // prezzo default (usato se nessuna variante è scelta)
  categoria: 'pronto' | 'da-cuocere';
  disponibile: 'sempre';
  immagine: string;
  descrizione: string;
  peso: string;          // peso default
  formato?: string;
  bio?: boolean;
  varianti?: MenuVariante[];  // se presenti, la card mostra dropdown taglia
}

// PASTI PRONTI (15) — pronti da scaldare/consumare
export const PRONTI: MenuItem[] = [
  {
    nome: 'Macinato bovino cotto',
    prezzo: 9.0,
    categoria: 'pronto',
    disponibile: 'sempre',
    immagine: '/images/prodotti/macinato-bovino-cotto.jpg',
    descrizione: 'Porzione 250g. Macinato di bovino già cotto, pronto da scaldare.',
    peso: '250g',
  },
  {
    nome: 'Insalata di pollo',
    prezzo: 13.5,
    categoria: 'pronto',
    disponibile: 'sempre',
    immagine: '/images/prodotti/insalata-pollo.jpg',
    descrizione: 'Porzione 300g. Insalata fredda di pollo, ricca di proteine. Pronta da consumare.',
    peso: '300g',
  },
  {
    nome: 'Tagliata di pollo',
    prezzo: 7.5,
    categoria: 'pronto',
    disponibile: 'sempre',
    immagine: '/images/prodotti/tagliata-pollo.jpg',
    descrizione: 'Porzione 160g. Tagliata di pollo già cotta, pronta da scaldare.',
    peso: '160g',
  },
  {
    nome: 'Carne secca',
    prezzo: 6.0,
    categoria: 'pronto',
    disponibile: 'sempre',
    immagine: '/images/prodotti/carne-secca.jpg',
    descrizione: 'Porzione 30g. Snack proteico ad alta densità, pronto da consumare.',
    peso: '30g',
  },
  {
    nome: 'Piselli con prosciutto',
    prezzo: 10.0,
    categoria: 'pronto',
    disponibile: 'sempre',
    immagine: '/images/prodotti/piselli.jpg',
    descrizione: 'Porzione 300g. Piselli cotti con prosciutto, pronti da scaldare.',
    peso: '300g',
  },
  {
    nome: 'Carote a rondelle',
    prezzo: 10.0,
    categoria: 'pronto',
    disponibile: 'sempre',
    immagine: '/images/prodotti/carote-rondelle.jpg',
    descrizione: 'Porzione 300g. Carote a rondelle cotte, pronte da scaldare.',
    peso: '300g',
  },
  {
    nome: 'Zucchine a rondelle',
    prezzo: 10.0,
    categoria: 'pronto',
    disponibile: 'sempre',
    immagine: '/images/prodotti/zucchine-rondelle.jpg',
    descrizione: 'Porzione 300g. Zucchine a rondelle cotte, pronte da scaldare.',
    peso: '300g',
  },
  {
    nome: 'Funghi champignon',
    prezzo: 10.0,
    categoria: 'pronto',
    disponibile: 'sempre',
    immagine: '/images/prodotti/funghi-champignon.jpg',
    descrizione: 'Porzione 300g. Funghi champignon cotti, pronti da scaldare.',
    peso: '300g',
  },
  {
    nome: 'Catalogna',
    prezzo: 10.0,
    categoria: 'pronto',
    disponibile: 'sempre',
    immagine: '/images/prodotti/catalogna.jpg',
    descrizione: 'Porzione 300g. Catalogna cotta, pronta da scaldare.',
    peso: '300g',
  },
  {
    nome: 'Tartare di bovino',
    prezzo: 7.5,
    categoria: 'pronto',
    disponibile: 'sempre',
    immagine: '/images/prodotti/tartare-bovino.jpg',
    descrizione: 'Porzione 150g. Tartare di bovino fresca, pronta da condire e consumare.',
    peso: '150g',
  },
  // ===== NUOVO FORNITORE - 17 prodotti con varianti taglia =====
  // Carni premium (150g / 250g / 500g)
  {
    nome: 'Roastbeef cotto',
    prezzo: 5.5,
    categoria: 'pronto',
    disponibile: 'sempre',
    immagine: '/images/prodotti/roastbeef-cotto.jpg',
    descrizione: 'Roastbeef cotto sottovuoto, pronto da consumare. Peso indicativo.',
    peso: '150g',
    varianti: [
      { peso: '150g', pesoGrammi: 150, prezzo: 5.5 },
      { peso: '250g', pesoGrammi: 250, prezzo: 9.0 },
      { peso: '500g', pesoGrammi: 500, prezzo: 18.0 },
    ],
  },
  {
    nome: 'Tagliata cotta',
    prezzo: 6.0,
    categoria: 'pronto',
    disponibile: 'sempre',
    immagine: '/images/prodotti/tagliata-cotta.jpg',
    descrizione: 'Tagliata di manzo cotta sottovuoto, pronta da scaldare. Peso indicativo.',
    peso: '150g',
    varianti: [
      { peso: '150g', pesoGrammi: 150, prezzo: 6.0 },
      { peso: '250g', pesoGrammi: 250, prezzo: 10.0 },
      { peso: '500g', pesoGrammi: 500, prezzo: 19.5 },
    ],
  },
  {
    nome: 'Carpaccio',
    prezzo: 4.5,
    categoria: 'pronto',
    disponibile: 'sempre',
    immagine: '/images/prodotti/carpaccio.jpg',
    descrizione: 'Carpaccio di manzo crudo sottovuoto, pronto da condire. Peso indicativo.',
    peso: '150g',
    varianti: [
      { peso: '150g', pesoGrammi: 150, prezzo: 4.5 },
      { peso: '250g', pesoGrammi: 250, prezzo: 7.5 },
      { peso: '500g', pesoGrammi: 500, prezzo: 15.0 },
    ],
  },
  {
    nome: 'Battuta di scottona',
    prezzo: 6.0,
    categoria: 'pronto',
    disponibile: 'sempre',
    immagine: '/images/prodotti/battuta-scottona.jpg',
    descrizione: 'Battuta di scottona cruda sottovuoto, pronta da condire. Peso indicativo.',
    peso: '150g',
    varianti: [
      { peso: '150g', pesoGrammi: 150, prezzo: 6.0 },
      { peso: '250g', pesoGrammi: 250, prezzo: 9.5 },
      { peso: '500g', pesoGrammi: 500, prezzo: 19.0 },
    ],
  },
  {
    nome: 'Arrosto di vitello',
    prezzo: 7.0,
    categoria: 'pronto',
    disponibile: 'sempre',
    immagine: '/images/prodotti/arrosto-vitello.jpg',
    descrizione: 'Arrosto di vitello cotto sottovuoto, pronto da scaldare. Peso indicativo.',
    peso: '150g',
    varianti: [
      { peso: '150g', pesoGrammi: 150, prezzo: 7.0 },
      { peso: '250g', pesoGrammi: 250, prezzo: 11.5 },
      { peso: '500g', pesoGrammi: 500, prezzo: 23.0 },
    ],
  },
  // Carni standard (200g / 300g / 500g)
  {
    nome: 'Macinato bovino saltato',
    prezzo: 4.5,
    categoria: 'pronto',
    disponibile: 'sempre',
    immagine: '/images/prodotti/macinato-bovino-saltato.jpg',
    descrizione: 'Macinato di bovino adulto saltato, cotto sottovuoto. Peso indicativo.',
    peso: '200g',
    varianti: [
      { peso: '200g', pesoGrammi: 200, prezzo: 4.5 },
      { peso: '300g', pesoGrammi: 300, prezzo: 6.5 },
      { peso: '500g', pesoGrammi: 500, prezzo: 10.5 },
    ],
  },
  {
    nome: 'Hamburger bovino cotto',
    prezzo: 5.0,
    categoria: 'pronto',
    disponibile: 'sempre',
    immagine: '/images/prodotti/hamburger-bovino-cotto.jpg',
    descrizione: 'Hamburger di bovino adulto cotto sottovuoto, pronto da scaldare. Peso indicativo.',
    peso: '200g',
    varianti: [
      { peso: '200g', pesoGrammi: 200, prezzo: 5.0 },
      { peso: '300g', pesoGrammi: 300, prezzo: 7.0 },
      { peso: '500g', pesoGrammi: 500, prezzo: 11.5 },
    ],
  },
  {
    nome: 'Petto di pollo a bassa temperatura',
    prezzo: 3.5,
    categoria: 'pronto',
    disponibile: 'sempre',
    immagine: '/images/prodotti/petto-pollo-bassa-temp.jpg',
    descrizione: 'Petto di pollo cotto a bassa temperatura sottovuoto, pronto da scaldare. Peso indicativo.',
    peso: '200g',
    varianti: [
      { peso: '200g', pesoGrammi: 200, prezzo: 3.5 },
      { peso: '300g', pesoGrammi: 300, prezzo: 5.5 },
      { peso: '500g', pesoGrammi: 500, prezzo: 9.0 },
    ],
  },
  {
    nome: 'Spezzatino di pollo al curry',
    prezzo: 6.5,
    categoria: 'pronto',
    disponibile: 'sempre',
    immagine: '/images/prodotti/spezzatino-pollo-curry.jpg',
    descrizione: 'Spezzatino di petto di pollo al curry, cotto sottovuoto. Peso indicativo.',
    peso: '200g',
    varianti: [
      { peso: '200g', pesoGrammi: 200, prezzo: 6.5 },
      { peso: '300g', pesoGrammi: 300, prezzo: 10.0 },
      { peso: '500g', pesoGrammi: 500, prezzo: 16.5 },
    ],
  },
  {
    nome: 'Straccetti di manzo',
    prezzo: 8.5,
    categoria: 'pronto',
    disponibile: 'sempre',
    immagine: '/images/prodotti/straccetti-manzo.jpg',
    descrizione: 'Straccetti di manzo cotti sottovuoto, pronti da scaldare. Peso indicativo.',
    peso: '200g',
    varianti: [
      { peso: '200g', pesoGrammi: 200, prezzo: 8.5 },
      { peso: '300g', pesoGrammi: 300, prezzo: 12.5 },
      { peso: '500g', pesoGrammi: 500, prezzo: 20.5 },
    ],
  },
  {
    nome: 'Sottocosce di pollo alla romana',
    prezzo: 4.5,
    categoria: 'pronto',
    disponibile: 'sempre',
    immagine: '/images/prodotti/sottocosce-pollo-romana.jpg',
    descrizione: 'Sottocosce di pollo alla romana, cotte sottovuoto. Peso indicativo.',
    peso: '200g',
    varianti: [
      { peso: '200g', pesoGrammi: 200, prezzo: 4.5 },
      { peso: '300g', pesoGrammi: 300, prezzo: 6.5 },
      { peso: '500g', pesoGrammi: 500, prezzo: 11.0 },
    ],
  },
  {
    nome: 'Scaloppe al limone',
    prezzo: 5.5,
    categoria: 'pronto',
    disponibile: 'sempre',
    immagine: '/images/prodotti/scaloppe-limone.jpg',
    descrizione: 'Scaloppe al limone cotte sottovuoto, pronte da scaldare. Peso indicativo.',
    peso: '200g',
    varianti: [
      { peso: '200g', pesoGrammi: 200, prezzo: 5.5 },
      { peso: '300g', pesoGrammi: 300, prezzo: 8.0 },
      { peso: '500g', pesoGrammi: 500, prezzo: 13.0 },
    ],
  },
  // Contorni (300g / 500g)
  {
    nome: 'Patate arrosto',
    prezzo: 4.0,
    categoria: 'pronto',
    disponibile: 'sempre',
    immagine: '/images/prodotti/patate-arrosto.jpg',
    descrizione: 'Patate arrosto cotte sottovuoto, pronte da scaldare. Peso indicativo.',
    peso: '300g',
    varianti: [
      { peso: '300g', pesoGrammi: 300, prezzo: 4.0 },
      { peso: '500g', pesoGrammi: 500, prezzo: 6.5 },
    ],
  },
  {
    nome: 'Patate lesse',
    prezzo: 4.0,
    categoria: 'pronto',
    disponibile: 'sempre',
    immagine: '/images/prodotti/patate-lesse.jpg',
    descrizione: 'Patate lesse cotte sottovuoto, pronte da scaldare. Peso indicativo.',
    peso: '300g',
    varianti: [
      { peso: '300g', pesoGrammi: 300, prezzo: 4.0 },
      { peso: '500g', pesoGrammi: 500, prezzo: 6.5 },
    ],
  },
  {
    nome: 'Carciofi trifolati',
    prezzo: 7.0,
    categoria: 'pronto',
    disponibile: 'sempre',
    immagine: '/images/prodotti/carciofi-trifolati.jpg',
    descrizione: 'Carciofi trifolati cotti sottovuoto, pronti da scaldare. Peso indicativo.',
    peso: '300g',
    varianti: [
      { peso: '300g', pesoGrammi: 300, prezzo: 7.0 },
      { peso: '500g', pesoGrammi: 500, prezzo: 11.5 },
    ],
  },
  {
    nome: 'Funghi misti',
    prezzo: 5.5,
    categoria: 'pronto',
    disponibile: 'sempre',
    immagine: '/images/prodotti/funghi-misti.jpg',
    descrizione: 'Funghi misti cotti sottovuoto, pronti da scaldare. Peso indicativo.',
    peso: '300g',
    varianti: [
      { peso: '300g', pesoGrammi: 300, prezzo: 5.5 },
      { peso: '500g', pesoGrammi: 500, prezzo: 9.0 },
    ],
  },
  {
    nome: 'Capponata',
    prezzo: 5.5,
    categoria: 'pronto',
    disponibile: 'sempre',
    immagine: '/images/prodotti/capponata.jpg',
    descrizione: 'Capponata di verdure cotte sottovuoto, pronta da scaldare. Peso indicativo.',
    peso: '300g',
    varianti: [
      { peso: '300g', pesoGrammi: 300, prezzo: 5.5 },
      { peso: '500g', pesoGrammi: 500, prezzo: 9.5 },
    ],
  },
];

// DA CUCINARE (3) — carni crude per la tua preparazione
export const DA_CUCINARE: MenuItem[] = [
  {
    nome: 'Macinato bovino crudo',
    prezzo: 14.5,
    categoria: 'da-cuocere',
    disponibile: 'sempre',
    immagine: '/images/prodotti/macinato-bovino-crudo.jpg',
    descrizione: 'Porzione 500g. Macinato di bovino crudo, da cuocere a casa.',
    peso: '500g',
  },
  {
    nome: 'Hamburger bovino',
    prezzo: 8.0,
    categoria: 'da-cuocere',
    disponibile: 'sempre',
    immagine: '/images/prodotti/hamburger-bovino.png',
    descrizione: 'Porzione 240g (2 hamburger da 120/180g). Da cuocere alla griglia o piastra.',
    peso: '240g',
    formato: '2 pezzi da 120/180g',
  },
  {
    nome: 'Tagliata bovino adulto',
    prezzo: 20.0,
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
