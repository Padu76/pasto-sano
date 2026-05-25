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

// Costi specifici nuovo fornitore (carni/verdure premium)
// Calcolati come 65% del prezzo vendita al pubblico (margine 35% retail food)
// Aggiornare quando si avranno i costi B2B reali del fornitore
export const SUPPLIER_PREMIUM_COSTS: Record<string, number> = {
  'polpette proteiche': 4.55,
  'polpette energetiche': 4.55,
  'roast beef bovino a fette': 5.85,
  'insalata di pollo': 7.15,
  'tagliata di pollo': 3.90,
  'tagliata bovino cotta a fette': 5.85,
  'tagliata bovino cotta intera': 5.20,
  'tagliata bovino cotta affumicata': 3.25,
  'carne secca': 3.25,
  // Verdure cotte sottovuoto
  'piselli': 5.20,
  'carote a rondelle': 5.20,
  'catalogna': 5.20,
  'fagiolini verdi': 5.20,
  'zucchine a rondelle': 5.20,
  // Tartare
  'tartare di bovino': 3.90,
  // crudi
  'macinato bovino crudo': 7.15,
  'carne cruda bovino': 3.90,
  'hamburger bovino': 3.90,
  'tagliata bovino adulto': 9.75,
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
export function getPurchaseCost(productName: string, category?: string): number {
  // Controlla se è un combo
  if (COMBO_COSTS[productName]) {
    return COMBO_COSTS[productName];
  }

  // Controlla prodotti nuovo fornitore (match per nome normalizzato)
  const nameNormalized = productName.toLowerCase().trim();
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
