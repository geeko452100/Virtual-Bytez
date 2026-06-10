import { requireSupabase, requireUser, toResult } from '../lib/supabaseResult'

export async function fetchSavedBuilds() {
  const { supabase, error: configError } = requireSupabase()
  if (configError) return { data: null, error: configError }

  const { user, error: authError } = await requireUser(supabase)
  if (authError) return { data: null, error: authError }

  const { data, error } = await supabase
    .from('saved_builds')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return toResult({ data, error })
}

export async function saveBuild({ productId, name, selections }) {
  const { supabase, error: configError } = requireSupabase()
  if (configError) return { data: null, error: configError }

  const { user, error: authError } = await requireUser(supabase)
  if (authError) return { data: null, error: authError }

  if (!productId || !name) {
    return { data: null, error: new Error('productId and name are required') }
  }

  const { data, error } = await supabase
    .from('saved_builds')
    .insert({
      user_id: user.id,
      product_id: productId,
      name,
      selections: selections ?? {},
    })
    .select()
    .single()

  return toResult({ data, error })
}

export async function deleteSavedBuild(id) {
  const { supabase, error: configError } = requireSupabase()
  if (configError) return { error: configError }

  const { user, error: authError } = await requireUser(supabase)
  if (authError) return { error: authError }

  const { error } = await supabase
    .from('saved_builds')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  return { error: error ? new Error(error.message) : null }
}
