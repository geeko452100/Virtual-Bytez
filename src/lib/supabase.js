import { createClient } from '@supabase/supabase-js'
import { isSupabaseConfigured, supabaseConfig } from './config'

let client = null

export function getSupabase() {
  if (!isSupabaseConfigured) return null
  if (!client) {
    client = createClient(supabaseConfig.url, supabaseConfig.anonKey, {
      auth: {
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
      },
    })
  }
  return client
}
