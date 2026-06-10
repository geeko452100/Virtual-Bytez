import { getSupabase } from './supabase'

const BUCKET = 'product-images'

export function getProductImagePublicUrl(path) {
  const supabase = getSupabase()
  if (!supabase || !path) return null

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return data.publicUrl
}

export async function uploadProductImage(productId, file) {
  const supabase = getSupabase()
  if (!supabase) {
    return { url: null, path: null, error: new Error('Supabase is not configured') }
  }

  if (!productId?.trim()) {
    return { url: null, path: null, error: new Error('Product ID is required before uploading') }
  }

  const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const path = `${productId}/${Date.now()}.${extension}`

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    upsert: true,
    contentType: file.type || undefined,
  })

  if (error) {
    return { url: null, path: null, error: new Error(error.message) }
  }

  return {
    url: getProductImagePublicUrl(path),
    path,
    error: null,
  }
}

export async function deleteProductImage(path) {
  const supabase = getSupabase()
  if (!supabase) {
    return { error: new Error('Supabase is not configured') }
  }

  const { error } = await supabase.storage.from(BUCKET).remove([path])
  return { error: error ? new Error(error.message) : null }
}
