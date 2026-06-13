export const isSupabaseConfigured = Boolean(
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY,
)

export const supabaseConfig = {
  url: import.meta.env.VITE_SUPABASE_URL ?? '',
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY ?? '',
}

export const apiConfig = {
  baseUrl: import.meta.env.VITE_API_URL ?? '/api',
}

export const PORTFOLIO_URL = (import.meta.env.VITE_PORTFOLIO_URL ?? 'https://code-vector.pages.dev').replace(
  /\/$/,
  '',
)

export const PORTFOLIO_PROJECTS_URL = `${PORTFOLIO_URL}/projects`
