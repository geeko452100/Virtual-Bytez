import { getSupabase } from './supabase'

export function requireSupabase() {
  const supabase = getSupabase()
  if (!supabase) {
    return { supabase: null, error: new Error('Supabase is not configured') }
  }
  return { supabase, error: null }
}

export function toResult({ data, error }) {
  if (error) {
    return { data: null, error: new Error(error.message) }
  }
  return { data: data ?? null, error: null }
}

export async function requireUser(supabase) {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return { user: null, error: new Error('Not authenticated') }
  }

  return { user, error: null }
}
