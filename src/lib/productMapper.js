import { PRODUCT_IMAGES } from '../data/productImages'

function normalizeOptions(value) {
  return Array.isArray(value) ? value : []
}

export function resolveProductImageUrl(productId, imageUrl) {
  const trimmed = imageUrl?.trim()
  if (trimmed) return trimmed
  return PRODUCT_IMAGES[productId] ?? null
}

export function mapProduct(row) {
  if (!row) return null
  return {
    id: row.id,
    name: row.name,
    era: row.era ?? '',
    category: row.category,
    basePrice: Number(row.base_price),
    description: row.description ?? '',
    condition: row.condition ?? '',
    conditionGrade: row.condition_grade ?? null,
    imageUrl: resolveProductImageUrl(row.id, row.image_url),
    stockCount: row.stock_count ?? 0,
    active: row.active ?? true,
    customizationOptions: normalizeOptions(row.customization_options),
  }
}

export function mapProductToRow(product) {
  return {
    id: product.id,
    name: product.name,
    era: product.era,
    category: product.category,
    base_price: product.basePrice,
    description: product.description,
    condition: product.condition,
    condition_grade: product.conditionGrade,
    image_url: product.imageUrl,
    customization_options: product.customizationOptions,
    stock_count: product.stockCount ?? 0,
    active: product.active ?? true,
  }
}
