// E:\pasto-sano\lib\productCosts.ts
// Mapping dei costi di acquisto prodotti dal fornitore

export interface ProductCost {
  category: string;
  purchaseCost: number;
}

// Costi base per categoria (fornitore storico)
export const BASE_COSTS: Record<string, number> = {
  primo: 5.00,
  secondo: 6.00,
  contorno: 3.00,
  focaccia: 5.50,
  piadina: 5.50,
  insalatona: 7.00,
  muffin: 2.00,
  macedonia: 4.00,
  carneSalada: 6.00,
  roastBeef: 6.00,
};

// Costi specifici fornitore 1 (esistente)
export const SUPPLIER_PREMIUM_COSTS: Record<string, number> = {
  // Carni cotte
  'macinato bovino cotto': 7.00,         // 250g × 28€/kg
  'insalata di pollo': 10.50,             // 300g × 35€/kg
  'tagliata di pollo': 5.60,              // 160g × 35€/kg
  'carne secca': 4.50,                    // 30g × 150€/kg
  // Verdure cotte sottovuoto (25€/kg, conf. 300g)
  'piselli': 7.50,
  'carote a rondelle': 7.50,
  'zucchine a rondelle': 7.50,
  'funghi champignon': 7.50,
  'catalogna': 7.50,
  // Tartare
  'tartare di bovino': 5.70,              // 150g × 38€/kg
  // Da cuocere
  'macinato bovino crudo': 11.00,         // 500g × 22€/kg (salato 12g/kg)
  'hamburger bovino': 6.00,               // 240g × 25€/kg (salato 12g/kg)
  'tagliata bovino adulto': 15.20,        // 400g × 38€/kg
};

// Costi al kg fornitore 2 (nuovo) - per calcolo dinamico costi varianti
// Per i prodotti con varianti, costo confezione = pesoGrammi × COSTI_KG / 1000
export const COSTI_KG_FORNITORE_2: Record<string, number> = {
  'roastbeef cotto': 27.00,
  'tagliata cotta': 29.25,
  'carpaccio': 22.95,
  'battuta di scottona': 28.80,
  'arrosto di vitello': 34.65,
  'macinato bovino saltato': 15.99,
  'hamburger bovino cotto': 17.44,
  'petto di pollo a bassa temperatura': 13.32,
  'spezzatino di pollo al curry': 25.04,
  'straccetti di manzo': 31.50,
  'sottocosce di pollo alla romana': 16.65,
  'scaloppe al limone': 19.80,
  'patate arrosto': 10.00,
  'patate lesse': 9.45,
  'carciofi trifolati': 17.10,
  'funghi misti': 13.41,
  'capponata': 13.96,
};

// Costi specifici per combo
export const COMBO_COSTS: Record<string, number> = {
  'Combo Primo + Contorno': 7.50,
  'Combo Secondo + Contorno': 8.50,
  'Combo Completo (Primo + Secondo + Contorno)': 13.00,
  'Combo Primo + Macedonia': 7.50,
  'Combo Secondo + Macedonia': 8.50,
};

// Funzione per ottenere il costo di acquisto di un prodotto
// Per i prodotti con varianti taglia, passare anche pesoGrammi per calcolo dinamico.
export function getPurchaseCost(productName: string, category?: string, pesoGrammi?: number): number {
  // Controlla se è un combo
  if (COMBO_COSTS[productName]) {
    return COMBO_COSTS[productName];
  }

  const nameNormalized = productName.toLowerCase().trim();

  // Controlla prodotti fornitore 2 (con varianti: calcolo dinamico)
  for (const [key, eurKg] of Object.entries(COSTI_KG_FORNITORE_2)) {
    if (nameNormalized.includes(key)) {
      const grammi = pesoGrammi || 200; // default 200g se non specificato
      return (grammi * eurKg) / 1000;
    }
  }

  // Controlla prodotti fornitore 1 (costi confezione fissi)
  for (const [key, cost] of Object.entries(SUPPLIER_PREMIUM_COSTS)) {
    if (nameNormalized.includes(key)) {
      return cost;
    }
  }

  // Controlla prodotti specifici legacy
  if (nameNormalized.includes('muffin')) {
    return BASE_COSTS.muffin;
  }
  if (nameNormalized.includes('macedonia')) {
    return BASE_COSTS.macedonia;
  }
  if (nameNormalized.includes('carne salada')) {
    return BASE_COSTS.carneSalada;
  }
  if (nameNormalized.includes('roast beef')) {
    return BASE_COSTS.roastBeef;
  }

  // Usa la categoria se disponibile
  if (category) {
    const categoryKey = category.toLowerCase();
    if (BASE_COSTS[categoryKey]) {
      return BASE_COSTS[categoryKey];
    }
  }

  // Fallback: prova a dedurre dalla categoria nel nome del prodotto
  if (nameNormalized.includes('focaccia')) return BASE_COSTS.focaccia;
  if (nameNormalized.includes('piadina')) return BASE_COSTS.piadina;
  if (nameNormalized.includes('insalat')) return BASE_COSTS.insalatona;

  // Default: costo medio se non trovato
  console.warn(`Costo non trovato per prodotto: ${productName}, categoria: ${category}`);
  return 5.00;
}

// Funzione per calcolare il costo totale di un ordine
export function calculateOrderCost(
  items: Array<{ name: string; quantity: number; category?: string }>
): number {
  return items.reduce((total, item) => {
    const unitCost = getPurchaseCost(item.name, item.category);
    return total + unitCost * item.quantity;
  }, 0);
}

// Funzione per calcolare il margine di guadagno
export function calculateProfit(
  revenue: number,
  cost: number
): {
  profit: number;
  marginPercent: number;
} {
  const profit = revenue - cost;
  const marginPercent = revenue > 0 ? (profit / revenue) * 100 : 0;
  return { profit, marginPercent };
}

const productCosts = {
  BASE_COSTS,
  SUPPLIER_PREMIUM_COSTS,
  COMBO_COSTS,
  getPurchaseCost,
  calculateOrderCost,
  calculateProfit,
};

export default productCosts;
