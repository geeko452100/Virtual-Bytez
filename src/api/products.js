import { mapProduct, mapProductToRow } from '../lib/productMapper'
import { requireSupabase, toResult } from '../lib/supabaseResult'

export async function fetchProducts({ includeInactive = false } = {}) {
  const { supabase, error: configError } = requireSupabase()
  if (configError) return { data: null, error: configError }

  let query = supabase.from('products').select('*').order('name')
  if (!includeInactive) {
    query = query.eq('active', true)
  }

  const { data, error } = await query
  if (error) return toResult({ data: null, error })

  return { data: (data ?? []).map(mapProduct), error: null }
}

export async function fetchProductById(id) {
  const { supabase, error: configError } = requireSupabase()
  if (configError) return { data: null, error: configError }

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) return toResult({ data: null, error })
  if (!data) return { data: null, error: new Error('Product not found') }

  return { data: mapProduct(data), error: null }
}

export async function upsertProduct(product) {
  const { supabase, error: configError } = requireSupabase()
  if (configError) return { data: null, error: configError }

  const { data, error } = await supabase
    .from('products')
    .upsert(mapProductToRow(product))
    .select()
    .single()

  if (error) return toResult({ data: null, error })

  return { data: mapProduct(data), error: null }
}

export async function deleteProduct(id) {
  const { supabase, error: configError } = requireSupabase()
  if (configError) return { error: configError }

  const { error } = await supabase.from('products').delete().eq('id', id)
  return { error: error ? new Error(error.message) : null }
}

export async function updateOrderStatus(orderId, status) {
  const { supabase, error: configError } = requireSupabase()
  if (configError) return { data: null, error: configError }

  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId)
    .select()
    .single()

  return toResult({ data, error })
}

export async function fetchAllOrders() {
  const { supabase, error: configError } = requireSupabase()
  if (configError) return { data: null, error: configError }

  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .order('created_at', { ascending: false })

  return toResult({ data, error })
}
