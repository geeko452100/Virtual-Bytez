import { validateOrderPayload } from '../lib/orderValidation'
import { requireSupabase, requireUser, toResult } from '../lib/supabaseResult'

export async function createOrder({ items, subtotal, shippingAddress }) {
  const { supabase, error: configError } = requireSupabase()
  if (configError) return { data: null, error: configError }

  const { user, error: authError } = await requireUser(supabase)
  if (authError) return { data: null, error: authError }

  if (subtotal == null || !shippingAddress) {
    return { data: null, error: new Error('subtotal and shippingAddress are required') }
  }

  const productIds = [
    ...new Set(items?.filter((item) => item?.product?.id).map((item) => item.product.id) ?? []),
  ]

  if (productIds.length === 0) {
    return { data: null, error: new Error('Order must include at least one item') }
  }

  const { data: productRows, error: productsError } = await supabase
    .from('products')
    .select('*')
    .in('id', productIds)

  if (productsError) {
    return toResult({ data: null, error: productsError })
  }

  const productsById = new Map(productRows.map((row) => [row.id, row]))
  const validation = validateOrderPayload(items, subtotal, productsById)

  if (validation.error) {
    return { data: null, error: new Error(validation.error) }
  }

  const { orderItems, subtotal: verifiedSubtotal } = validation

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: user.id,
      subtotal: verifiedSubtotal,
      shipping_address: shippingAddress,
      status: 'pending',
    })
    .select()
    .single()

  if (orderError) {
    return toResult({ data: null, error: orderError })
  }

  const rows = orderItems.map((item) => ({
    order_id: order.id,
    ...item,
  }))

  const { error: itemsError } = await supabase.from('order_items').insert(rows)

  if (itemsError) {
    await supabase.from('orders').delete().eq('id', order.id)
    return toResult({ data: null, error: itemsError })
  }

  return { data: order, error: null }
}

export async function fetchUserOrders() {
  const { supabase, error: configError } = requireSupabase()
  if (configError) return { data: null, error: configError }

  const { user, error: authError } = await requireUser(supabase)
  if (authError) return { data: null, error: authError }

  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return toResult({ data, error })
}
