import { mapProduct } from './productMapper'
import { calculateCustomizationPrice } from '../utils/pricing'

function roundMoney(amount) {
  return Math.round(amount * 100) / 100
}

export function validateOrderPayload(items, clientSubtotal, productsById) {
  if (!Array.isArray(items) || items.length === 0) {
    return { error: 'Order must include at least one item' }
  }

  let computedSubtotal = 0
  const orderItems = []

  for (const item of items) {
    const productId = item?.product?.id
    const productRow = productsById.get(productId)

    if (!productId || !productRow) {
      return { error: `Invalid or unknown product: ${productId ?? 'missing'}` }
    }

    const product = mapProduct(productRow)

    if (!product.active) {
      return { error: `Product is not available: ${product.name}` }
    }

    const quantity = Number(item.quantity)
    if (!Number.isInteger(quantity) || quantity < 1) {
      return { error: 'Each item must have quantity of at least 1' }
    }

    const pricing = calculateCustomizationPrice(product, item.selections ?? {})
    const unitPrice = roundMoney(pricing.total)
    const lineTotal = roundMoney(unitPrice * quantity)

    computedSubtotal = roundMoney(computedSubtotal + lineTotal)

    orderItems.push({
      product_id: product.id,
      product_name: product.name,
      selections: item.selections ?? {},
      quantity,
      unit_price: unitPrice,
      line_total: lineTotal,
    })
  }

  const submittedSubtotal = roundMoney(Number(clientSubtotal))
  if (Math.abs(computedSubtotal - submittedSubtotal) > 0.01) {
    return { error: 'Order subtotal does not match line items' }
  }

  return { orderItems, subtotal: computedSubtotal }
}
