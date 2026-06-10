/**
 * Vintage tech catalog with per-product customization schemas.
 * Each option drives price via `priceModifier` (flat add-on in USD).
 */

import { catalogEntries } from './retroCatalog'
import { PRODUCT_IMAGES } from './productImages'
import { OPTION_SETS } from './productOptionTemplates'

export const CATEGORIES = [
  { id: 'computers', label: 'Computers' },
  { id: 'audio', label: 'Audio' },
  { id: 'gaming', label: 'Gaming' },
  { id: 'peripherals', label: 'Peripherals' },
  { id: 'cameras', label: 'Cameras' },
]

function materialize(entry) {
  const { optionSet, customizationOptions, ...rest } = entry
  return {
    ...rest,
    imageUrl: PRODUCT_IMAGES[entry.id] ?? null,
    customizationOptions: customizationOptions ?? OPTION_SETS[optionSet] ?? [],
  }
}

export const seedProducts = catalogEntries.map(materialize)

/** @deprecated Use useProducts() or seedProducts */
export const products = seedProducts

export function getProductById(id) {
  return seedProducts.find((p) => p.id === id)
}

export function getProductsByCategory(categoryId) {
  if (!categoryId || categoryId === 'all') return seedProducts
  return seedProducts.filter((p) => p.category === categoryId)
}
