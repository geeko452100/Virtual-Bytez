import { useCallback, useEffect, useMemo, useState } from 'react'
import { getSupabase } from '../lib/supabase'
import { isSupabaseConfigured } from '../lib/config'
import { formatAuthError, isDuplicateSignup, normalizeAuthInput } from '../utils/authErrors'
import { AuthContext } from './authContext'

const PROFILE_RETRY_DELAY_MS = 400
const PROFILE_MAX_ATTEMPTS = 3

async function loadProfile(supabase, userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()

  if (error) throw error
  return data
}

async function ensureProfile(supabase, user) {
  const existing = await loadProfile(supabase, user.id)
  if (existing) return existing

  const metadataName = user.user_metadata?.full_name?.trim()
  const { data, error } = await supabase
    .from('profiles')
    .insert({
      id: user.id,
      email: user.email,
      full_name: metadataName || user.email?.split('@')[0] || null,
    })
    .select()
    .maybeSingle()

  if (error) throw error
  return data
}

async function loadProfileWithRetry(supabase, userId) {
  for (let attempt = 0; attempt < PROFILE_MAX_ATTEMPTS; attempt += 1) {
    const data = await loadProfile(supabase, userId)
    if (data) return data
    if (attempt < PROFILE_MAX_ATTEMPTS - 1) {
      await new Promise((resolve) => setTimeout(resolve, PROFILE_RETRY_DELAY_MS))
    }
  }
  return null
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(isSupabaseConfigured)
  const [profileLoading, setProfileLoading] = useState(false)
  const [authError, setAuthError] = useState(null)

  const clearAuthError = useCallback(() => {
    setAuthError(null)
  }, [])

  const refreshProfile = useCallback(async (userId, authUser) => {
    const supabase = getSupabase()
    if (!supabase || !userId) {
      setProfile(null)
      setProfileLoading(false)
      return
    }

    setProfileLoading(true)
    try {
      let data = await loadProfileWithRetry(supabase, userId)
      const metadataName = authUser?.user_metadata?.full_name?.trim()

      if (!data && authUser) {
        data = await ensureProfile(supabase, authUser)
      }

      if (data && !data.full_name?.trim() && metadataName) {
        const { data: updated, error: updateError } = await supabase
          .from('profiles')
          .update({ full_name: metadataName })
          .eq('id', userId)
          .select()
          .maybeSingle()

        if (!updateError && updated) data = updated
      }

      setProfile(data)
    } catch (err) {
      console.error('Failed to load profile', err)
      setProfile(null)
    } finally {
      setProfileLoading(false)
    }
  }, [])

  useEffect(() => {
    const supabase = getSupabase()
    if (!supabase) return

    let active = true

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!active) return
      setUser(session?.user ?? null)
      if (session?.user) {
        refreshProfile(session.user.id, session.user).finally(() => {
          if (active) setLoading(false)
        })
      } else {
        setLoading(false)
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return
      setUser(session?.user ?? null)
      if (session?.user) {
        refreshProfile(session.user.id, session.user)
      } else {
        setProfile(null)
        setProfileLoading(false)
      }
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [refreshProfile])

  const signUp = useCallback(async ({ email, password, fullName }) => {
    setAuthError(null)
    const supabase = getSupabase()
    if (!supabase) {
      const err = new Error('Supabase is not configured')
      setAuthError(err.message)
      return { error: err }
    }

    const normalizedEmail = normalizeAuthInput(email)
    const normalizedPassword = normalizeAuthInput(password)
    const normalizedName = normalizeAuthInput(fullName)

    if (!normalizedEmail || !normalizedPassword) {
      const err = new Error('Email and password are required.')
      setAuthError(err.message)
      return { error: err }
    }

    if (normalizedPassword.length < 6) {
      const err = new Error('Password must be at least 6 characters.')
      setAuthError(err.message)
      return { error: err }
    }

    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password: normalizedPassword,
      options: {
        data: { full_name: normalizedName || undefined },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setAuthError(formatAuthError(error))
      return { data, error }
    }

    if (isDuplicateSignup(data)) {
      const err = new Error('An account with this email already exists. Sign in instead.')
      setAuthError(err.message)
      return { data, error: err }
    }

    if (data.session?.user) {
      setUser(data.session.user)
      await refreshProfile(data.session.user.id, data.session.user)
    }

    return { data, error }
  }, [refreshProfile])

  const signIn = useCallback(async ({ email, password }) => {
    setAuthError(null)
    const supabase = getSupabase()
    if (!supabase) {
      const err = new Error('Supabase is not configured')
      setAuthError(err.message)
      return { error: err }
    }

    const normalizedEmail = normalizeAuthInput(email)
    const normalizedPassword = normalizeAuthInput(password)

    if (!normalizedEmail || !normalizedPassword) {
      const err = new Error('Email and password are required.')
      setAuthError(err.message)
      return { error: err }
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password: normalizedPassword,
    })

    if (error) {
      setAuthError(formatAuthError(error))
      return { data, error }
    }

    if (data.session?.user) {
      setUser(data.session.user)
      await refreshProfile(data.session.user.id, data.session.user)
    }

    return { data, error }
  }, [refreshProfile])

  const signOut = useCallback(async () => {
    const supabase = getSupabase()
    if (!supabase) return
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Failed to sign out', error)
    }
    setAuthError(null)
    setProfile(null)
    setProfileLoading(false)
  }, [])

  const resetPassword = useCallback(async (email) => {
    setAuthError(null)
    const supabase = getSupabase()
    if (!supabase) {
      const err = new Error('Supabase is not configured')
      setAuthError(err.message)
      return { error: err }
    }

    const normalizedEmail = normalizeAuthInput(email)
    if (!normalizedEmail) {
      const err = new Error('Email is required.')
      setAuthError(err.message)
      return { error: err }
    }

    const { data, error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
      redirectTo: `${window.location.origin}/auth/callback`,
    })

    if (error) {
      setAuthError(formatAuthError(error))
      return { data, error }
    }

    return { data, error: null }
  }, [])

  const value = useMemo(
    () => ({
      user,
      profile,
      loading,
      profileLoading,
      authError,
      isAdmin: profile?.role === 'admin',
      isAuthenticated: Boolean(user),
      isConfigured: isSupabaseConfigured,
      signUp,
      signIn,
      signOut,
      resetPassword,
      refreshProfile,
      clearAuthError,
    }),
    [
      user,
      profile,
      loading,
      profileLoading,
      authError,
      signUp,
      signIn,
      signOut,
      resetPassword,
      refreshProfile,
      clearAuthError,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
