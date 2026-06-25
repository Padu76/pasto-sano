// app/sitemap.ts
import type { MetadataRoute } from 'next'

// Sitemap generata da SEO Engine dagli URL crawlati. Aggiorna l'elenco quando
// aggiungi nuove pagine (o sostituiscila con una generazione dinamica).
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://www.pastosano.it/", changeFrequency: 'weekly', priority: 1 },
    { url: "https://www.pastosano.it/menu", changeFrequency: 'weekly', priority: 0.8 },
    { url: "https://www.pastosano.it/ordina", changeFrequency: 'weekly', priority: 0.8 },
  ]
}
