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

// Costi specifici nuovo fornitore - costi REALI da listino (peso × €/kg)
// Aggiornato con quotazioni fornitore: macinato cotto 28€/kg, roast beef 45€/kg,
// insalata pollo 35€/kg, tagliata pollo 35€/kg, tagliate 40-45€/kg,
// carne secca 150€/kg, verdure 25€/kg, macinato crudo 22€/kg,
// carne cruda 38€/kg, hamburger 25€/kg, tagliata adulto 38€/kg
export const SUPPLIER_PREMIUM_COSTS: Record<string, number> = {
  // Carni cotte
  'macinato bovino cotto': 7.00,         // 250g × 28€/kg
  'roast beef bovino a fette': 8.10,      // 180g × 45€/kg
  'insalata di pollo': 10.50,             // 300g × 35€/kg
  'tagliata di pollo': 5.60,              // 160g × 35€/kg
  'tagliata bovino cotta a fette': 8.10,  // 180g × 45€/kg
  'tagliata bovino cotta intera': 7.20,   // 180g × 40€/kg
  'tagliata bovino cotta affumicata': 4.50, // 100g × 45€/kg
  'carne secca': 4.50,                    // 30g × 150€/kg
  // Verdure cotte sottovuoto (25€/kg, conf. 300g)
  'piselli': 7.50,
  'carote a rondelle': 7.50,
  'zucchine a rondelle': 7.50,
  'funghi champignon': 7.50,
  // Tartare / Carne cruda da consumare cruda o cuocere
  'tartare di bovino': 5.70,              // 150g × 38€/kg
  // Da cuocere
  'macinato bovino crudo': 11.00,         // 500g × 22€/kg (salato 12g/kg)
  'hamburger bovino': 6.00,               // 240g × 25€/kg (salato 12g/kg)
  'tagliata bovino adulto': 15.20,        // 400g × 38€/kg
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
