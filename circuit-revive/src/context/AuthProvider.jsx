import { useCallback, useEffect, useMemo, useState } from 'react'
import { getSupabase } from '../lib/supabase'
import { isSupabaseConfigured } from '../lib/config'
import { AuthContext } from './authContext'

async function loadProfile(supabase, userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()

  if (error) throw error
  return data
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(isSupabaseConfigured)
  const [authError, setAuthError] = useState(null)

  const refreshProfile = useCallback(async (userId, authUser) => {
    const supabase = getSupabase()
    if (!supabase || !userId) {
      setProfile(null)
      return
    }
    try {
      let data = await loadProfile(supabase, userId)
      const metadataName = authUser?.user_metadata?.full_name?.trim()

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
      setUser(session?.user ?? null)
      if (session?.user) {
        refreshProfile(session.user.id, session.user)
      } else {
        setProfile(null)
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

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })

    if (error) setAuthError(error.message)
    return { data, error }
  }, [])

  const signIn = useCallback(async ({ email, password }) => {
    setAuthError(null)
    const supabase = getSupabase()
    if (!supabase) {
      const err = new Error('Supabase is not configured')
      setAuthError(err.message)
      return { error: err }
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setAuthError(error.message)
    return { data, error }
  }, [])

  const signOut = useCallback(async () => {
    const supabase = getSupabase()
    if (!supabase) return
    await supabase.auth.signOut()
    setAuthError(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      profile,
      loading,
      authError,
      isAdmin: profile?.role === 'admin',
      isAuthenticated: Boolean(user),
      isConfigured: isSupabaseConfigured,
      signUp,
      signIn,
      signOut,
      refreshProfile,
    }),
    [user, profile, loading, authError, signUp, signIn, signOut, refreshProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
