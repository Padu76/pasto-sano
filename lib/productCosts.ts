// lib/productCosts.ts
// Mapping dei costi di acquisto prodotti dal fornitore

export interface ProductCost {
  category: string;
  purchaseCost: number;
}

// Costi base per categoria
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
  roastBeef: 6.00
};

// Costi specifici per combo
export const COMBO_COSTS: Record<string, number> = {
  'Combo Primo + Contorno': 7.50,
  'Combo Secondo + Contorno': 8.50,
  'Combo Completo (Primo + Secondo + Contorno)': 13.00,
  'Combo Primo + Macedonia': 7.50, // primo (5.00) + macedonia (4.00) - sconto
  'Combo Secondo + Macedonia': 8.50  // secondo (6.00) + macedonia (4.00) - sconto
};

// Funzione per ottenere il costo di acquisto di un prodotto
export function getPurchaseCost(productName: string, category?: string): number {
  // Controlla se è un combo
  if (COMBO_COSTS[productName]) {
    return COMBO_COSTS[productName];
  }

  // Controlla prodotti specifici
  if (productName.toLowerCase().includes('muffin')) {
    return BASE_COSTS.muffin;
  }
  if (productName.toLowerCase().includes('macedonia')) {
    return BASE_COSTS.macedonia;
  }
  if (productName.toLowerCase().includes('carne salada')) {
    return BASE_COSTS.carneSalada;
  }
  if (productName.toLowerCase().includes('roast beef')) {
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
  const nameLower = productName.toLowerCase();
  if (nameLower.includes('focaccia')) return BASE_COSTS.focaccia;
  if (nameLower.includes('piadina')) return BASE_COSTS.piadina;
  if (nameLower.includes('insalat')) return BASE_COSTS.insalatona;

  // Default: costo medio se non trovato
  console.warn(`Costo non trovato per prodotto: ${productName}, categoria: ${category}`);
  return 5.00; // costo medio di fallback
}

// Funzione per calcolare il costo totale di un ordine
export function calculateOrderCost(items: Array<{ name: string; quantity: number; category?: string }>): number {
  return items.reduce((total, item) => {
    const unitCost = getPurchaseCost(item.name, item.category);
    return total + (unitCost * item.quantity);
  }, 0);
}

// Funzione per calcolare il margine di guadagno
export function calculateProfit(revenue: number, cost: number): {
  profit: number;
  marginPercent: number;
} {
  const profit = revenue - cost;
  const marginPercent = revenue > 0 ? (profit / revenue) * 100 : 0;
  
  return {
    profit,
    marginPercent
  };
}

export default {
  BASE_COSTS,
  COMBO_COSTS,
  getPurchaseCost,
  calculateOrderCost,
  calculateProfit
};